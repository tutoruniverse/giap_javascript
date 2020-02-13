import GIAPPersistence from 'GIAPPersistence';

describe('GIAPPersistence', () => {
  let instance;
  const name = 'GIAP-javascript';

  beforeEach(() => {
    localStorage.clear();
  });

  const setup = () => {
    instance = new GIAPPersistence(name);
  };

  it('should persist data with library name', () => {
    setup();
    expect(localStorage.getItem(name)).toBeTruthy();
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
