import Config from 'config'
import {GIAPPersistence} from 'giap-persistence'

INTERVAL = '500' // 500ms

export class GIAPLib {
  config = Config;
  requestQueue = [];

  /* INITIALIZE */
  initialization = (token) => {
    // store token to this.config
    // initialize this.persistence by new GIAPPersistence object

    // setup profile:
      //  - if distinct_id exists in storage --> return
      //  - else: register_once: distinct_id = device_id = uuid

    // emit event: track('initialization')

    // setIntervals: 
      // every INTERVAL: this._flush()
  } 


  /* EMIT EVENT */
  track = (name, properties, callback) => {
    // update properties with super-properties:
      // profile props: this.persistence.props
      // default info: addInfo(properties)

    // this._send_request(type:'EVENT', Request.track())
  }


  /* CREATE ALIAS */
  alias = (userId) => {
    // register: user_id
    // this._send_request(type: 'PROFILE', Request.alias())
  }


  /* GET IDENTITY */
  identify = (user_id) => {
    // distinct_id: get current distinct id from storage
    
    // callback: update distinct_id based on response
    // this._send_request(type: 'PROFILE', Request.identify(), callback)
  }


  /* RESET PROFILE */
  reset = () => {
    // clear this.persistence object
    // register_once: distinct_id = device_id = uuid
  }


  /* ENQUEUE */
  // type: EVENT || PROFILE 
  _send_request = (type, request, callback) => {
    // Add request to the queue
  }

  /* SEND ALL REQUESTS CURRENTLY IN QUEUE */
  _flush = () => {
    /* Group all consecutive 'EVENT' requests to send as one then the 'PROFILE' 
    request then repeat the process */
  }
}