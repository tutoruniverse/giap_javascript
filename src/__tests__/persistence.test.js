import GIAPPersistence from 'persistence';
import { PERSISTENCE_NAME } from '../constants/lib';

describe('GIAPPersistence', () => {
  let instance;

  beforeEach(() => {
    localStorage.clear();
  });

  const setup = () => {
    instance = new GIAPPersistence();
  };

  it('should persist data with the correct name', () => {
    setup();
    expect(localStorage.getItem(PERSISTENCE_NAME)).toBeTruthy();
  });

  it('should update initial referrer correctly', () => {
    setup();
    instance.updateReferrer('');
    expect(instance.props.initialReferrer).toBeNull();
    expect(instance.props.initialReferringDomain).toBeNull();
  });

  it('should not update initial referrer more than once', () => {
    setup();
    instance.updateReferrer('https://github.com/');
    expect(instance.props.initialReferrer).toBe('https://github.com/');
    expect(instance.props.initialReferringDomain).toBe('github.com');

    instance.updateReferrer('https://google.com/');
    expect(instance.props.initialReferrer).toBe('https://github.com/');
    expect(instance.props.initialReferringDomain).toBe('github.com');
  });

  it('should load from localStorage properly', () => {
    localStorage.setItem(PERSISTENCE_NAME, JSON.stringify({
      distinctId: 123,
    }));
    setup();
    expect(instance.getDistinctId()).toEqual(123);
  });

  it('should have proper queue functionalities', () => {
    setup();
    expect(instance.popFront()).toBeNull();
    expect(instance.popBack()).toBeNull();
    expect(instance.peekFront()).toBeNull();

    instance.updateQueue({ type: 'IDENTIFY' });
    instance.updateQueue({ type: 'TRACK' });
    instance.updateQueue({ type: 'SAMPLE' });

    expect(instance.popFront().type).toBe('IDENTIFY');
    expect(instance.popBack().type).toBe('SAMPLE');
    expect(instance.peekFront().type).toBe('TRACK');
    expect(instance.getQueue().length).toBe(1);
  });

  it('should create TRACK requests batches in queue', () => {
    setup();
    instance.updateQueue({ type: 'TEST', data: {} });
    expect(instance.getQueue()).toHaveLength(1);
    instance.updateQueue({ type: 'TRACK', data: {} });
    expect(instance.getQueue()).toHaveLength(2);
    instance.updateQueue({ type: 'TRACK', data: {} });
    expect(instance.getQueue()).toHaveLength(2);

    setup();
    instance.popFront();
    instance.updateQueue({ type: 'TRACK', data: {} });
    expect(instance.getQueue()).toHaveLength(1);
    instance.updateQueue({ type: 'TRACK', data: {} }, true);
    expect(instance.getQueue()).toHaveLength(2);
  });
});
