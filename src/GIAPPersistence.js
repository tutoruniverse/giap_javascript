/** Store properties:
 *    lib
 *    lib_version
 *    distinct_id
 *    device_id
 *    user_id
 *    initial_referrer
 *    initial_referring_domain
 *    queue
 */

import { QUEUE_INTERVAL } from 'constants/app';

export default class GIAPPersistence {
  props = {
    profile: {},
    queue: {
      interval: QUEUE_INTERVAL,
      requests: [],
    },
  }

  constructor(config) {
    // this.name: store storage name from config
    this.name = config.LIB;

    // load persisted data from localStorage
    this.props = {
      ...this.props,
      ...localStorage.getItem(this.name),
    };
  }

  // register a set of super-props then persist the changes
  // this will overwrite previous super property values
  update = (props) => {
    // update this.props with props
    this.props = {
      ...this.props,
      ...props,
    };
    // save the changes to localStorage
    localStorage.setItem(this.name, this.props);
  }

  updateReferrer = (referrer) => {

  }

  clear = () => {
    this.props = {};
    localStorage.removeItem(this.name);
  }

  getDistinctId = () => this.props.profile.distinctId;
}
