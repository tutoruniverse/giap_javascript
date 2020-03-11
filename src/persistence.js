/** Store properties:
 *    lib
 *    lib_version
 *    distinct_id
 *    device_id
 *    initial_referrer
 *    initial_referring_domain
 *    queue
 */
import { getReferringDomain } from './utils/deviceInfo';
import { PERSISTENCE_NAME, LIB_VERSION } from './constants/lib';
import RequestType from './constants/requestType';

export default class GIAPPersistence {
  props = {
    version: LIB_VERSION,
    queue: [],
  }

  constructor() {
    // load persisted data from localStorage
    this.load();
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
    if (this.props.initialReferrer !== undefined) return;
    this.update({
      initialReferrer: referrer || null,
      initialReferringDomain: getReferringDomain(referrer) || null,
    });
    // save the changes to localStorage
    this.persist();
  }

  updateQueue = (request, isFlushing) => {
    let newRequest = { ...request };
    if (request.type === RequestType.TRACK) {
      // group TRACK requests at rear as a batch

      if (this.peekBack()
        && this.peekBack().type === RequestType.TRACK
        && !(isFlushing
        && this.getQueue().length === 1)) {
        /* Avoid special case: the TRACK batch at rear is also
        the one being flushed. */
        newRequest = this.popBack();
        newRequest.data = [...newRequest.data, request.data];
      } else {
        // create new TRACK batch
        newRequest.data = [newRequest.data];
      }
    }

    this.update({ queue: [...this.getQueue(), { version: LIB_VERSION, ...newRequest }] });
  }

  getDistinctId = () => this.props.distinctId;

  getDeviceId = () => this.props.deviceId;

  getQueue = () => this.props.queue;

  getPersistedProps = () => {
    const { queue, version, ...props } = this.props;
    return props;
  }

  persist = () => {
    localStorage.setItem(PERSISTENCE_NAME, JSON.stringify(this.props));
  }

  load = () => {
    try {
      const persisted = JSON.parse(localStorage.getItem(PERSISTENCE_NAME));
      if (persisted && persisted.version === this.props.version) {
        this.update(JSON.parse(localStorage.getItem(PERSISTENCE_NAME)));
      } else {
        this.persist();
      }
    } catch (e) {
      // pass
    }
  }

  clear = () => this.update({ queue: [] })

  popFront = () => (this.props.queue.length
    ? this.props.queue.shift()
    : null);

  popBack = () => (this.props.queue.length
    ? this.props.queue.pop()
    : null);

  peekFront = () => (this.props.queue.length
    ? this.props.queue[0]
    : null);

  peekBack = () => (this.props.queue.length
    ? this.props.queue[this.props.queue.length - 1]
    : null);
}
