import { uuid } from 'uuidv4';
import { prepareDefaultProps, asyncForEach } from './utils';
import RequestHelper from './utils/request';
import Config from './configuration';
import GIAPPersistence from './GIAPPersistence';
import { EventName } from './constants/app';
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

    // setup profile:
    //  - if distinctId exists in storage --> return
    //  - else: registerOnce: distinctId = deviceId = uuid
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
    }, this.persistence.getQueue().interval);
  }


  /* EMIT EVENT */
  track = (name, properties) => {
    // update properties with super-properties:
    // profile props: this.persistence.props
    // default info: addInfo(properties)

    this.sendRequest(RequestType.TRACK, {
      ...prepareDefaultProps(name, this.persistence),
      ...properties });
  }


  /* CREATE ALIAS */
  alias = (userId) => {
    const distinctId = this.persistence.getDistinctId();
    this.persistence.update({ userId });
    this.sendRequest(
      RequestType.ALIAS,
      { userId, distinctId }
    );
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


  /* ENQUEUE */
  // type: EVENT || PROFILE
  sendRequest = (type, data) => {
    // Add request to the queue
    this.persistence.enqueue({ type, data });

    console.log(type);
    console.log(data);
    /* console.log(this.persistence.props); */
    console.log(this.persistence.getQueue().requests);
  }

  /* SEND ALL REQUESTS CURRENTLY IN QUEUE */
  flush = async () => {
    console.log('flushhhh');
    const requests = this.persistence.getQueue().requests;
    if (!requests) return;

    this.isFlushing = true;
    this.persistence.clearQueue();

    const { token, apiUrl } = this;
    const giapFetch = new RequestHelper(token, apiUrl);

    /* Group all consecutive 'EVENT' requests to send as one then the 'PROFILE'
    request then repeat the process */
    const events = [];
    await asyncForEach(requests, async ({ type, data }) => {
      // if request is EVENT_EMITTING
      if (type === RequestType.TRACK) {
        events.push(data);
        return;
      }

      // otherwise
      // TODO: send all events in "events" array if available

      // TODO: send request
      switch (type) {
        case RequestType.ALIAS: {
          const { userId, distinctId } = data;
          await giapFetch.post('alias', { userId, distinctId });
          break; }
        case RequestType.IDENTIFY: {
          const { userId, distinctId } = data;
          await giapFetch.get(`alias/${userId}`,
            { currentDistinctId: distinctId });
          break;
        }
        case RequestType.SET_PROFILE_PROPERTIES: {
          /* /profiles/:distinct_id */
          const { id, props } = data;
          await giapFetch.put(`profiles/${id}`, props);
          break;
        }
        default:
      }
    });

    this.isFlushing = false;
  }
}
