/** Store properties:
 *    distinct_id
 *    device_id
 *    user_id
 *    initial_referrer
 *    initial_referring_domain
 *    queue
 */

const INTERVAL = '500'; // 500ms

export default class GIAPPersistence {
  props = {
    queue: {
      interval: INTERVAL,
      requests: [],
    },
  }

  constructor(config) {
    // this.name: store storage name from config
    this.load()
  }

  // load persisted data from localStorage
  load = () => {}

  // register a set of super-props then persist the changes
  // this will overwrite previous super property values
  update = (props) => {
    // update this.props with props
    // save the changes to localStorage
  }

  get(name) {}
}
