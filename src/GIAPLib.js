import Config from 'config';
import { GIAPPersistence } from 'giap-persistence';

export default class GIAPLib {
  config = Config;


  /* INITIALIZE */
  initialization = (token) => {
    // store token to this.config
    // initialize this.persistence by new GIAPPersistence object

    // setup profile:
    //  - if distinctId exists in storage --> return
    //  - else: registerOnce: distinctId = deviceId = uuid

    // emit event: track('initialization')

    // setIntervals:
    // every INTERVAL: this._flush()
  }


  /* EMIT EVENT */
  track = (name, properties) => {
    // update properties with super-properties:
    // profile props: this.persistence.props
    // default info: addInfo(properties)

    // this._sendRequest(type:'EVENT', Request.track())
  }


  /* CREATE ALIAS */
  alias = (userId) => {
    // register: userId
    // this._sendRequest(type: 'PROFILE', Request.alias())
  }


  /* GET IDENTITY */
  identify = (userId) => {
    // distinctId: get current distinct id from storage

    // callback: update distinctId based on response
    // this._sendRequest(type: 'PROFILE', Request.identify(), callback)
  }


  /* RESET PROFILE */
  reset = () => {
    // clear this.persistence object
    // registerOnce: distinctId = deviceId = uuid
  }


  /* ENQUEUE */
  // type: EVENT || PROFILE
  _sendRequest = (type, request) => {
    // Add request to the queue
  }

  /* SEND ALL REQUESTS CURRENTLY IN QUEUE */
  _flush = async () => {
    /* Group all consecutive 'EVENT' requests to send as one then the 'PROFILE'
    request then repeat the process */
  }
}
