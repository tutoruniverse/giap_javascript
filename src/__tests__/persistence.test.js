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
    expect(instance.props.initialReferrer).toBe('$direct');
    expect(instance.props.initialReferringDomain).toBe('$direct');
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

  it('should return persisted profile props correctly', () => {
    setup();
    const props = instance.getPersistedProps();
    //expect(props.queue).toBeFalsy();
  });
});
