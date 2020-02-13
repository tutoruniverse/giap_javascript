import { uuid } from 'uuidv4';
import { prepareDefaultProps } from './utils';
import Config from './configuration';
import GIAPPersistence from './GIAPPersistence';
import { EventName } from './constants/app';
import RequestType from './constants/requestType';

export default class GIAPLib {
  config = Config;

  /* INITIALIZE */
  initialize = (token, serverUrl) => {
    // store token to this.config
    this.config.TOKEN = token;
    if (serverUrl) {
      this.config.API_URL = serverUrl;
    }

    // initialize this.persistence by new GIAPPersistence object
    this.persistence = new GIAPPersistence(this.config.PERSISTENCE_NAME);

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
  }


  /* EMIT EVENT */
  track = (name, properties) => {
    // update properties with super-properties:
    // profile props: this.persistence.props
    // default info: addInfo(properties)

    this.sendRequest(RequestType.TRACK, {
      defaultProps: {
        name,
        ...prepareDefaultProps(this.persistence, this.config) },
      customProps: properties });
  }


  /* CREATE ALIAS */
  alias = (userId) => {
    // register: userId
    this.persistence.update({ userId });
    this.sendRequest(RequestType.ALIAS, { userId });
    this.identify(userId);
  }


  /* GET IDENTITY */
  identify = (userId) => {
    // distinctId: get current distinct id from storage
    const distinctId = this.persistence.getDistinctId();
    // callback: update distinctId based on response
    this.sendRequest(RequestType.IDENTIFY, {
      userId,
      distinctId,
    });

    // update distinctId
    this.persistence.update({ distinctId: userId });
  }


  /* RESET PROFILE */
  reset = () => {
    // registerOnce: distinctId = deviceId = uuid
    this.persistence.update({
      distinctId: uuid(),
      userId: undefined,
    });
  }

  /* MODIFY PROFILE */
  setProfileProperties = (id, props) => {
    this.sendRequest(RequestType.SET_PROFILE_PROPERTIES, { id, props });
  }


  /* ENQUEUE */
  // type: EVENT || PROFILE
  sendRequest = (type, data) => {
    // Add request to the queue
    console.log(type);
    console.log(data);
    console.log(this.persistence.props);
    this.persistence.enqueue({ type, data });
  }

  /* SEND ALL REQUESTS CURRENTLY IN QUEUE */
  flush = async () => {
    /* Group all consecutive 'EVENT' requests to send as one then the 'PROFILE'
    request then repeat the process */
    const events = [];
    this.persistence.getQueue().requests.forEach(({ type, data }) => {
      // if request is EVENT_EMITTING
      if (type === RequestType.TRACK) {
        events.push(data);
        return;
      }

      // otherwise
      // TODO: send all events in "events" array if available
      // TODO: send request
      switch (type) {
        case RequestType.ALIAS:
          break;
        case RequestType.IDENTIFY:
          break;
        case RequestType.SET_PROPERTIES:
          break;
        default:
      }
    });
  }
}
