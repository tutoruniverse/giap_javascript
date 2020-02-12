import Config from 'configuration';
import GIAPPersistence from 'GIAPPersistence';
import { uuid } from 'uuidv4';
import { EventName } from 'constants/app';
import RequestType from 'constants/requestType';
import { collectDefaultProps } from 'utilities';

export default class GIAPLib {
  config = Config;

  /* INITIALIZE */
  initialization = (token, serverUrl) => {
    // store token to this.config
    this.config.TOKEN = token;
    if (serverUrl) {
      this.config.API_URL = serverUrl;
    }

    // initialize this.persistence by new GIAPPersistence object
    this.persistence = new GIAPPersistence(this.config);

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

    this.sendRequest(RequestType.EMIT_EVENT,
      { name,
        ...collectDefaultProps(this.persistence, this.config) },
      properties);
  }


  /* CREATE ALIAS */
  alias = (userId) => {
    // register: userId
    this.persistence.update({ userId });
    this.sendRequest(RequestType.CREATE_ALIAS, { userId });
  }


  /* GET IDENTITY */
  identify = (userId) => {
    // distinctId: get current distinct id from storage
    const distinctId = this.persistence.getDistinctId();
    // callback: update distinctId based on response
    this.sendRequest(RequestType.GET_IDENTITY, {
      userId,
      distinctId,
    });
  }


  /* RESET PROFILE */
  reset = () => {
    // registerOnce: distinctId = deviceId = uuid
    this.persistence.update({
      distinctId: uuid(),
    });
  }


  /* ENQUEUE */
  // type: EVENT || PROFILE
  sendRequest = (type, data) => {
    // Add request to the queue
    console.log(type);
    console.log(data);
    console.log(this.persistence.props);
  }

  /* SEND ALL REQUESTS CURRENTLY IN QUEUE */
  flush = async () => {
    /* Group all consecutive 'EVENT' requests to send as one then the 'PROFILE'
    request then repeat the process */
  }
}
