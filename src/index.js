import { uuid } from 'uuidv4';
import { prepareDefaultProps, createEventsBatch } from './utils';
import RequestHelper from './utils/request';
import Config from './configuration';
import GIAPPersistence from './GIAPPersistence';
import { EventName, QUEUE_INTERVAL } from './constants/app';
import RequestType from './constants/requestType';

export default class GIAPLib {
  /* INITIALIZE */
  initialize = (token, serverUrl) => {
    // store token to this.config
    this.token = token;
    if (serverUrl) {
      this.apiUrl = serverUrl;
    }

    this.isFlushing = false;

    // initialize this.persistence by new GIAPPersistence object
    this.persistence = new GIAPPersistence(Config.PERSISTENCE_NAME);
    this.fetch = new RequestHelper(this.token, this.apiUrl);

    // setup profile:
    if (!this.persistence.getDistinctId()) {
      this.persistence.update({
        distinctId: uuid(),
        deviceId: uuid(),
      });
    }

    // initial referrer
    this.persistence.updateReferrer(window.document.referrer);

    // emit event: track('initialization')
    this.track(EventName.INITIALIZATION);

    // setIntervals:
    // every INTERVAL: this._flush()
    setInterval(() => {
      if (!this.isFlushing) this.flush();
    }, QUEUE_INTERVAL);
  }


  /* EMIT EVENT */
  track = (name, properties) => {
    // update properties with default props
    this.sendRequest(RequestType.TRACK, {
      ...prepareDefaultProps(name, this.persistence),
      ...properties });
  }


  /* CREATE ALIAS */
  alias = (userId) => {
    const distinctId = this.persistence.getDistinctId();
    this.sendRequest(
      RequestType.ALIAS,
      { userId, distinctId }
    );
    this.persistence.update({ userId });
    this.identify(userId);
  }


  /* GET IDENTITY */
  identify = (userId) => {
    const distinctId = this.persistence.getDistinctId();
    this.sendRequest(
      RequestType.IDENTIFY,
      { userId, distinctId }
    );

    // update distinctId
    this.persistence.update({ distinctId: userId });
  }


  /* RESET PROFILE */
  reset = () => {
    this.persistence.update({
      distinctId: uuid(),
      userId: undefined,
    });
  }

  /* MODIFY PROFILE */
  setProfileProperties = (props) => {
    const id = this.persistence.getDistinctId();
    this.sendRequest(
      RequestType.SET_PROFILE_PROPERTIES,
      { id, props }
    );
  }


  sendRequest = (type, data) => {
    // Add request to the queue
    this.enqueue({ type, data });

    console.log(type);
    console.log(data);
    console.log(this.persistence.getQueue());
  }

  /* */
  flush = async () => {
    console.log('flushhhh');
    this.isFlushing = true;
    let request = this.dequeue();
    if (!request) { return; }

    const events = [];
    let next = this.peek();
    while (next && next.type === RequestType.TRACK) {
      events.push(request.data);
      request = this.dequeue();
      next = this.peek();
    }

    /* SEND REQUEST */
    const { fetch } = this;

    // TODO: emit events if any at the beginning of queue
    if (events.length) {
      try {
        await fetch.post('events', createEventsBatch(events));
      } catch (e) {
        console.log('Failed emitting events');
        console.log(e);
      }
    } else {
      // TODO: send request of another type
      const { type, data } = request;
      try {
        switch (type) {
          case RequestType.ALIAS: {
            const { userId, distinctId } = data;
            await fetch.post('alias', { userId, distinctId });
            break; }

          case RequestType.IDENTIFY: {
            const { userId, distinctId } = data;
            await fetch.get(`alias/${userId}`,
              { currentDistinctId: distinctId });
            break;
          }

          case RequestType.SET_PROFILE_PROPERTIES: {
          /* /profiles/:distinct_id */
            const { id, props } = data;
            await fetch.put(`profiles/${id}`, props);
            break;
          }
          default:
        }
      } catch (e) {
        console.log(`Failed ${type}`);
        console.log(e);
      }
    }
    this.persistence.persist();
    this.isFlushing = false;
  }

  enqueue = (request) => {
    this.persistence.updateQueue(request);
  }

  dequeue = () => this.persistence.dequeue()

  peek = () => this.persistence.peek()
}
