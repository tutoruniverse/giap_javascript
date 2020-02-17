import { uuid } from 'uuidv4';
import { prepareDefaultProps, createEventsBatch } from './utils';
import RequestHelper from './utils/request';
import Config from './configuration';
import GIAPPersistence from './GIAPPersistence';
import { EventName, QUEUE_INTERVAL } from './constants/app';
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

const dequeue = () => persistence.dequeue();

const peek = () => persistence.peek();

const sendRequest = (type, data) => {
  // Add request to the queue
  enqueue({ type, data });

  console.log(`%c add request ${type}`, 'color: blue');
  console.log(data);
  console.group('%cqueue', 'color: green');
  persistence.getQueue().forEach(request => console.log(request.type));
  console.groupEnd('queue');
};

/* */
const flush = async () => {
  if (!peek()) { return; }

  console.group('FLUSHING');
  isFlushing = true;

  /* SEND REQUEST */

  let request = dequeue();
  let res;

  if (request.type === RequestType.TRACK) {
    // TODO: emit events if any at the beginning of queue
    const events = [request.data];
    while (peek() && peek().type === RequestType.TRACK) {
      request = dequeue();
      events.push(request.data);
    }
    res = await libFetch.post('events', createEventsBatch(events));
  } else {
    const { type, data } = request;
    switch (type) {
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
  }
  console.log(res);
  if (!res.retry) {
    console.log('persists');
    persistence.persist();
  } else {
    persistence.load();
  }
  /* QUEUE AFTER FLUSHING */
  console.group('queue after flushing');
  persistence.getQueue().forEach(request => console.log(request.type));
  console.groupEnd('queue after flushing');
  /*  */
  isFlushing = false;
  console.groupEnd('Flushing');
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
  persistence = new GIAPPersistence(Config.PERSISTENCE_NAME);
  libFetch = new RequestHelper(token, apiUrl);

  // setup profile:
  if (!persistence.getDistinctId()) {
    persistence.update({
      distinctId: uuid(),
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
    userId: undefined,
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
