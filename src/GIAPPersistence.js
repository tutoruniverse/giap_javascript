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
import DeviceInfo from 'utilities/deviceInfo';
import { QUEUE_INTERVAL } from 'constants/app';

export default class GIAPPersistence {
  props = {
    queue: {
      interval: QUEUE_INTERVAL,
      requests: [],
    },
  }

  constructor(name) {
    // this.name: store storage name from config
    this.name = name;

    // load persisted data from localStorage
    this.update({
      ...localStorage.getItem(this.name),
    });
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
    if (this.props.initialReferrer) return;
    this.update({
      initialReferrer: referrer || '$direct',
      initialReferringDomain: DeviceInfo.getReferringDomain(referrer) || '$direct',
    });
    // save the changes to localStorage
    localStorage.setItem(this.name, this.props);
  }

  getDistinctId = () => this.props.distinctId;

  getQueue = () => this.props.queue;

  getPersistedProps = () => {
    const { queue, ...props } = this.props;
    return props;
  }
}
