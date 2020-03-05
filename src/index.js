import { uuid } from 'uuidv4';

import prepareDefaultProps from './utils/defaultProps';
import RequestHelper from './utils/request';
import createLogger from './utils/logger';
import { isEmpty } from './utils/object';
import GIAPPersistence from './persistence';
import { QUEUE_INTERVAL, QUEUE_LIMIT, DISABLE_ERROR_CODE } from './constants/lib';
import RequestType from './constants/requestType';

let token;
let apiUrl;
let isTokenDisabled;
let isInitialized = false;

let persistence;
let libFetch;
let logger;

let isFlushing;
let flushInterval;

const notification = {
  didResetWithDistinctId: null,
  didEmitEvents: null,
  didUpdateProfile: null,
  didCreateAliasForUserId: null,
  didIdentifyUserId: null };

export const getQueueLength = () => persistence.getQueue().length;

const dequeue = () => {
  persistence.popFront();
  persistence.persist();
};

const enqueue = (request) => {
  /* isFlushing: boolean: help to decide whether or not to separate
  new TRACK events added during flushing to a new batch */
  persistence.updateQueue(request, isFlushing);

  /* Limit the size of the task queue to avoid out of memory exceptions */
  if (getQueueLength() > QUEUE_LIMIT) {
    dequeue();
  }
};

const peek = () => persistence.peekFront();

const sendRequest = (type, data) => {
  if (isTokenDisabled) {
    return;
  }

  // Add request to the queue
  enqueue({ type, data });

  logger.log(`%cadd request ${type}`, 'color: blue; font-weight: bold');
  logger.log(data);
  logger.group('%cqueue', 'color: green');
  logger.log(persistence.getQueue().reduce(
    (res, { type, data }) => (type === RequestType.TRACK
      ? `${res}  ${type}[${data.length}]`
      : `${res}  ${type}`),
    ''));
  logger.groupEnd('queue');
};

/* FLUSH QUEUE */
const flush = async () => {
  const request = peek();
  if (!request) {
    return;
  }

  logger.group('FLUSHING');
  isFlushing = true;

  /* SEND REQUEST */

  let res;
  let callback;
  const { didEmitEvents, didUpdateProfile, didCreateAliasForUserId, didIdentifyUserId } = notification;

  const { type, data } = request;

  try {
    switch (type) {
      case RequestType.TRACK: {
        res = await libFetch.post('events', { events: data });
        if (didEmitEvents) callback = didEmitEvents;
        break;
      }

      case RequestType.ALIAS: {
        const { userId, distinctId } = data;
        res = await libFetch.post('alias', { userId, distinctId });
        if (didCreateAliasForUserId) callback = didCreateAliasForUserId;
        break; }

      case RequestType.IDENTIFY: {
        const { userId, distinctId } = data;
        res = await libFetch.get(`alias/${userId}`,
          { currentDistinctId: distinctId });
        if (didIdentifyUserId) callback = didIdentifyUserId;
        break;
      }

      case RequestType.SET_PROFILE_PROPERTIES: {
        const { id, props } = data;
        res = await libFetch.put(`profiles/${id}`, props);
        if (didUpdateProfile) callback = didUpdateProfile;
        break;
      }
      default:
    }
  } catch (e) {
    logger.log(e);
  }

  logger.log(res);
  isFlushing = false;
  logger.groupEnd('Flushing');

  if (res && res.data && res.data.errorCode === DISABLE_ERROR_CODE) {
    isTokenDisabled = true;
    clearInterval(flushInterval);
    persistence.clear();
    return;
  }

  if (!res || !res.retry) {
    dequeue();
  }

  if (typeof callback === 'function') {
    callback(data, res.data || 'None');
  }

  /* QUEUE AFTER FLUSHING */
  logger.group('%cqueue after flushing', 'color: red');
  logger.log(persistence.getQueue().reduce(
    (res, { type, data }) => (type === RequestType.TRACK
      ? `${res}  ${type}[${data.length}]`
      : `${res}  ${type}`),
    ''));
  logger.groupEnd('queue after flushing');
  /*  */
};

/* EMIT EVENT */
const track = (name, properties) => {
  if (!isInitialized) {
    throw Error('Analytics library not initialized');
  }
  if (!name) {
    throw Error('Missing event name');
  }

  sendRequest(RequestType.TRACK,
    { ...prepareDefaultProps(name, persistence),
      ...properties },
    isFlushing);
};

/* GET IDENTITY */
const identify = (userId) => {
  if (!isInitialized) {
    throw Error('Analytics library not initialized');
  }
  if (!userId) {
    throw Error('Missing userId to identify');
  }

  const distinctId = persistence.getDistinctId();
  sendRequest(
    RequestType.IDENTIFY,
    { userId, distinctId }
  );

  persistence.update({ distinctId: userId });
};


/* CREATE ALIAS */
const alias = (userId) => {
  if (!isInitialized) {
    throw Error('Analytics library not initialized');
  }
  if (!userId) {
    throw Error('Missing userId to create alias');
  }
  const distinctId = persistence.getDistinctId();
  sendRequest(
    RequestType.ALIAS,
    { userId, distinctId }
  );
  identify(userId);
};


/* RESET PROFILE */
const reset = () => {
  if (!isInitialized) {
    throw Error('Analytics library not initialized');
  }

  const { didResetWithDistinctId } = notification;
  if (typeof didResetWithDistinctId === 'function') {
    didResetWithDistinctId(persistence.getDistinctId());
  }
  persistence.update({
    distinctId: uuid(),
  });
};


/* MODIFY PROFILE */
const setProfileProperties = (props) => {
  if (!isInitialized) {
    throw Error('Analytics library not initialized');
  }
  if (isEmpty(props)) {
    throw Error('Missing profile properties to update');
  }

  const id = persistence.getDistinctId();
  sendRequest(
    RequestType.SET_PROFILE_PROPERTIES,
    { id, props }
  );
};


/* INITIALIZE */
const initialize = (projectToken, serverUrl, enableLog = false) => {
  if (isInitialized) {
    throw Error('GIAP can be initialized only once');
  }
  if (!projectToken || !serverUrl) {
    throw Error('Missing initialization config');
  }

  token = projectToken;
  isTokenDisabled = false;
  apiUrl = serverUrl;

  isFlushing = false;
  logger = createLogger(enableLog);

  persistence = new GIAPPersistence();
  libFetch = new RequestHelper(token, apiUrl);

  if (!persistence.getDistinctId()) {
    persistence.update({
      distinctId: uuid(),
    });
  }

  if (!persistence.getDeviceId()) {
    persistence.update({
      deviceId: uuid(),
    });
  }

  persistence.updateReferrer(window.document.referrer);

  isInitialized = true;

  flushInterval = setInterval(() => {
    if (!isFlushing) flush();
  }, QUEUE_INTERVAL);
};

export default {
  initialize,
  track,
  setProfileProperties,
  alias,
  identify,
  reset,
  notification,
};
