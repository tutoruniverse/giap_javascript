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
import DeviceInfo from './utils/deviceInfo';
import { QUEUE_INTERVAL } from './constants/app';

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
      ...this.load(),
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
    this.persist();
  }

  updateReferrer = (referrer) => {
    if (this.props.initialReferrer) return;
    this.update({
      initialReferrer: referrer || '$direct',
      initialReferringDomain: DeviceInfo.getReferringDomain(referrer) || '$direct',
    });
    // save the changes to localStorage
    this.persist();
  }

  enqueue = (request) => {
    this.props.queue.requests.push(request);
    this.persist();
  }

  getDistinctId = () => this.props.distinctId;

  dequeue = () => (this.props.queue.requests.length
    ? this.props.queue.requests.shift()
    : null);

  peek = () => (this.props.queue.requests.length
    ? this.props.queue.requests[0]
    : null);

  clearQueue = () => {
    this.props.queue.requests = [];
    this.persist();
  };

  getPersistedProps = () => {
    const { queue, ...props } = this.props;
    return props;
  }

  persist = () => {
    localStorage.setItem(this.name, JSON.stringify(this.props));
  }

  load = () => {
    try {
      return JSON.parse(localStorage.getItem(this.name));
    } catch {
      return null;
    }
  }
}
