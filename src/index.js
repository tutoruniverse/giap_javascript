import { uuid } from 'uuidv4';
import prepareDefaultProps from './utils/defaultProps';
import RequestHelper from './utils/request';
import GIAPPersistence from './persistence';
import { QUEUE_INTERVAL } from './constants/lib';
import RequestType from './constants/requestType';

let token;
let apiUrl;
let persistence;
let isFlushing;
let libFetch;
let isInitialized = false;

const enqueue = (request) => {
  persistence.updateQueue(request);
};

const dequeue = () => {
  persistence.popFront();
  persistence.persist();
};

const peek = () => persistence.peekFront();

const sendRequest = (type, data) => {
  // Add request to the queue
  enqueue({ type, data });

  console.log(`%cadd request ${type}`, 'color: blue; font-weight: bold');
  console.log(data);
  console.group('%cqueue', 'color: green');
  console.log(persistence.getQueue().reduce(
    (res, { type, data }) => (type === RequestType.TRACK
      ? `${res}  ${type}[${data.length}]`
      : `${res}  ${type}`),
    ''));
  console.groupEnd('queue');
};

/* */
const flush = async () => {
  const request = peek();
  if (!request) { return; }

  console.group('FLUSHING');
  isFlushing = true;

  /* SEND REQUEST */

  let res;
  const { type, data } = request;

  switch (type) {
    case RequestType.TRACK: {
      res = await libFetch.post('events', { events: data });
      break;
    }
    case RequestType.ALIAS: {
      const { userId, distinctId } = data;
      res = await libFetch.post('alias', { userId, distinctId });
      break; }

    case RequestType.IDENTIFY: {
      const { userId, distinctId } = data;
      res = await libFetch.get(`alias/${userId}`,
        { currentDistinctId: distinctId });
      break;
    }

    case RequestType.SET_PROFILE_PROPERTIES: {
      const { id, props } = data;
      res = await libFetch.put(`profiles/${id}`, props);
      break;
    }
    default:
  }
  console.log(res);
  if (!res.retry) {
    dequeue();
  }

  isFlushing = false;
  console.groupEnd('Flushing');

  /* QUEUE AFTER FLUSHING */
  console.group('%cqueue after flushing', 'color: red');
  console.log(persistence.getQueue().reduce(
    (res, { type, data }) => (type === RequestType.TRACK
      ? `${res}  ${type}[${data.length}]`
      : `${res}  ${type}`),
    ''));
  console.groupEnd('queue after flushing');
  /*  */
};

/* EMIT EVENT */
const track = (name, properties) => {
  if (!isInitialized) throw Error('Analytics library not initialzied');
  // update properties with default props
  sendRequest(RequestType.TRACK, {
    ...prepareDefaultProps(name, persistence),
    ...properties });
};

/* INITIALIZE */
const initialize = (libToken, serverUrl) => {
  // store token to config
  token = libToken;
  apiUrl = serverUrl;

  isFlushing = false;

  // initialize persistence by new GIAPPersistence object
  persistence = new GIAPPersistence();
  libFetch = new RequestHelper(token, apiUrl);

  // setup profile:
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

  // initial referrer
  persistence.updateReferrer(window.document.referrer);

  // update initialized flag
  isInitialized = true;

  // setIntervals:
  // every INTERVAL: _flush()
  setInterval(() => {
    if (!isFlushing) flush();
  }, QUEUE_INTERVAL);
};

/* GET IDENTITY */
const identify = (userId) => {
  if (!isInitialized) throw Error('Analytics library not initialzied');
  const distinctId = persistence.getDistinctId();
  sendRequest(
    RequestType.IDENTIFY,
    { userId, distinctId }
  );

  // update distinctId
  persistence.update({ distinctId: userId });
};


/* CREATE ALIAS */
const alias = (userId) => {
  if (!isInitialized) throw Error('Analytics library not initialzied');
  const distinctId = persistence.getDistinctId();
  sendRequest(
    RequestType.ALIAS,
    { userId, distinctId }
  );
  identify(userId);
};


/* RESET PROFILE */
const reset = () => {
  if (!isInitialized) throw Error('Analytics library not initialzied');
  persistence.update({
    distinctId: uuid(),
  });
};

/* MODIFY PROFILE */
const setProfileProperties = (props) => {
  if (!isInitialized) throw Error('Analytics library not initialzied');
  const id = persistence.getDistinctId();
  sendRequest(
    RequestType.SET_PROFILE_PROPERTIES,
    { id, props }
  );
};

export default {
  initialize,
  track,
  setProfileProperties,
  alias,
  identify,
  reset,
};

/* for testing only */
global.getState = () => ({ token,
  apiUrl,
  persistence,
  isFlushing,
  queue: persistence.getQueue(),
});
