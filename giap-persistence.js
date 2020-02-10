/** Store Profile properties:
 *    distinct_id
 *    device_id
 *    user_id
 */

export class GIAPPersistence {
  props = {}

  constructor(config) {
    // this.name: store storage name from config
    this.load();
  }

  // load persisted data from localStorage
  load = () => {}

  // store data to localStorage with this.name
  save = () => {}

  // Register a set of super-props. This will overwrite previous super property values
  register = (props) => {}

  // Register a set of super-props if they are never set before or set as defaultValue.
  register_once = (props, defaultValue) => {}
}