import { uuid } from 'uuidv4';

import prepareDefaultProps from './utils/defaultProps';
import RequestHelper from './utils/request';
import createLogger from './utils/logger';
import { isEmpty } from './utils/object';
import GIAPPersistence from './persistence';
import { QUEUE_INTERVAL } from './constants/lib';
import RequestType from './constants/requestType';
import ModifyOperation from './constants/modifyOperation';

let token;
let apiUrl;
let persistence;
let isFlushing;
let libFetch;
let isInitialized = false;
let logger;
const notification = {
  didResetWithDistinctId: null,
  didEmitEvents: null,
  didUpdateProfile: null,
  didCreateAliasForUserId: null,
  didIdentifyUserId: null };

const enqueue = (request) => {
  /* isFlushing: boolean: help to decide whether or not to separate
  new TRACK events added during flushing to a new batch
  */
  persistence.updateQueue(request, isFlushing);
};

const dequeue = () => {
  persistence.popFront();
  persistence.persist();
};

const peek = () => persistence.peekFront();

const sendRequest = (type, data) => {
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
  if (!request) { return; }

  logger.group('FLUSHING');
  isFlushing = true;

  /* SEND REQUEST */
  let res;
  let callback;
  const { didEmitEvents, didUpdateProfile, didCreateAliasForUserId, didIdentifyUserId } = notification;

  const { type, data } = request;

  switch (type) {
    case RequestType.TRACK: {
      res = await libFetch.post('/events', { events: data });
      if (didEmitEvents) callback = didEmitEvents;
      break;
    }

    case RequestType.ALIAS: {
      const { userId, distinctId } = data;
      res = await libFetch.post('/alias', { userId, distinctId });
      if (didCreateAliasForUserId) callback = didCreateAliasForUserId;
      break; }

    case RequestType.IDENTIFY: {
      const { userId, distinctId } = data;
      res = await libFetch.get(`/alias/${userId}`,
        { currentDistinctId: distinctId });
      if (didIdentifyUserId) callback = didIdentifyUserId;
      break;
    }

    case RequestType.SET_PROFILE_PROPERTIES: {
      const { id, props } = data;
      res = await libFetch.put(`/profiles/${id}`, props);
      if (didUpdateProfile) callback = didUpdateProfile;
      break;
    }

    case RequestType.MODIFY_PROFILE: {
      const { id, name, props } = data;
      res = await libFetch.put(`/profiles/${id}/${name}`, props);
      if (didUpdateProfile) callback = didUpdateProfile;
      break;
    }
    default:
  }

  logger.log(res);
  if (!res.retry) {
    dequeue();
  }

  if (typeof callback === 'function') {
    callback(data, res.data || 'None');
  }

  isFlushing = false;
  logger.groupEnd('Flushing');

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

/* INITIALIZE */
const initialize = (projectToken, serverUrl, enableLog = false) => {
  if (isInitialized) {
    throw Error('GIAP can be initialized only once');
  }
  if (!projectToken || !serverUrl) {
    throw Error('Missing initialization config');
  }

  token = projectToken;
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

  setInterval(() => {
    if (!isFlushing) flush();
  }, QUEUE_INTERVAL);
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

/* SET PROFILE PROPERTIES */
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

/* MODIFY PROFILE PROPERTY */
const modifyProfileProperty = operation => (name, value) => {
  if (!isInitialized) {
    throw Error('Analytics library not initialized');
  }
  switch (operation) {
    case ModifyOperation.INCREASE:
      if (typeof value !== 'number') {
        throw Error('Invalid value type');
      }
      break;
    case ModifyOperation.APPEND:
    case ModifyOperation.REMOVE:
      if (!Array.isArray(value)) {
        throw Error('Invalid value type');
      }
      break;
    default:
      throw Error('Invalid operation type');
  }
  const id = persistence.getDistinctId();
  sendRequest(
    RequestType.MODIFY_PROFILE,
    {
      id,
      name,
      props: { operation, value },
    }
  );
};


export default {
  initialize,
  track,
  setProfileProperties,
  increase: modifyProfileProperty(ModifyOperation.INCREASE),
  append: modifyProfileProperty(ModifyOperation.APPEND),
  remove: modifyProfileProperty(ModifyOperation.REMOVE),
  alias,
  identify,
  reset,
  notification,
};
