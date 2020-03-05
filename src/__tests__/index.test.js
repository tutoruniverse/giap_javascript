import GIAP, { getQueueLength } from '../index';
import { QUEUE_INTERVAL, QUEUE_LIMIT } from '../constants/lib';

describe('index', () => {
  const token = 'secret_token';
  const apiUrl = 'https://www.random-server-url.com/';

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
  });

  const setup = () => {
    localStorage.clear();
  };

  const waitForFlushOnce = async () => {
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
  };

  const getLastFetchParams = () => fetch.mock.calls.slice(-1)[0][1];
  const getLastFetchUrl = () => fetch.mock.calls.slice(-1)[0][0];

  it('should inform about initialization properly', () => {
    expect(
      () => { GIAP.track('TEST'); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { GIAP.alias('TEST'); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { GIAP.identify(); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { GIAP.setProfileProperties(); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { GIAP.reset(); }
    ).toThrowError('Analytics library not initialized');

    expect(
      () => { GIAP.initialize(token); })
      .toThrowError('Missing initialization config');

    GIAP.initialize(token, apiUrl);

    expect(
      () => { GIAP.initialize(token, apiUrl); })
      .toThrowError('GIAP can be initialized only once');
  });

  it('should ensure required params for each methods', async () => {
    setup();
    expect(
      () => { GIAP.alias(); })
      .toThrowError('Missing userId to create alias');
    expect(
      () => { GIAP.identify(); })
      .toThrowError('Missing userId to identify');
    expect(
      () => { GIAP.track(); })
      .toThrowError('Missing event name');
    expect(
      () => { GIAP.setProfileProperties({}); })
      .toThrowError('Missing profile properties to update');
  });

  it('should create new distinctId on reset call', async () => {
    setup();
    GIAP.track('TEST');
    await waitForFlushOnce();
    const oldDistinctId = JSON.parse(getLastFetchParams().body).events[0].$distinct_id;

    GIAP.reset();
    GIAP.track('TEST');
    await waitForFlushOnce();
    const newDistinctId = JSON.parse(getLastFetchParams().body).events[0].$distinct_id;

    expect(oldDistinctId).not.toEqual(newDistinctId);
  });

  it('should call identify with currentDistinctId as queryString', async () => {
    setup();
    GIAP.track('TEST');
    GIAP.identify('userTest');

    await waitForFlushOnce();
    const currentDistinctId = JSON.parse(getLastFetchParams().body).events[0].$distinct_id;
    await waitForFlushOnce();
    expect(getLastFetchUrl().includes(currentDistinctId)).toBeTruthy();
  });

  describe('Queue process', () => {
    it('should emit events on batches', async () => {
      setup();
      await waitForFlushOnce();
      expect(fetch).not.toHaveBeenCalled();

      GIAP.track('TEST');
      GIAP.track('TEST');
      GIAP.track('TEST');
      GIAP.track('TEST');
      GIAP.setProfileProperties({ phone: '12345' });

      await waitForFlushOnce();
      expect(getLastFetchParams().method).toBe('POST');

      await waitForFlushOnce();
      expect(getLastFetchParams().method).toBe('PUT');
    });

    it('should retry with request failed with server side error', async () => {
      setup();
      fetch.mockResponse(JSON.stringify({}), { status: 500 });

      GIAP.alias('userTest');

      await waitForFlushOnce();
      /* console.log(fetch.mock.calls.slice(-1)[0]); */
      expect(getLastFetchParams().method).toBe('POST');
      await waitForFlushOnce();
      expect(getLastFetchParams().method).toBe('POST');

      fetch.mockResponse(JSON.stringify({}), { status: 400 });
      await waitForFlushOnce();
      expect(getLastFetchParams().method).toBe('POST');
      await waitForFlushOnce();
      expect(getLastFetchParams().method).toBe('GET');
    });
  });

  it('should have the ability for notify after requests fetched', async () => {
    setup();
    GIAP.notification.didEmitEvents = jest.fn();
    GIAP.notification.didResetWithDistinctId = jest.fn();
    fetch.mockResponse(JSON.stringify({ testNotification: true }));

    GIAP.track('TEST');
    GIAP.reset();
    await waitForFlushOnce();

    const { didEmitEvents, didResetWithDistinctId } = GIAP.notification;
    expect(didEmitEvents.mock.calls[0][1]).toEqual({ testNotification: true });

    const distinctId = didEmitEvents.mock.calls[0][0][0].$distinctId;
    expect(didResetWithDistinctId).toHaveBeenCalledWith(distinctId);
  });

  describe('Disable token', () => {
    it('should limit the task queue size', () => {
      setup();
      for (let i = 0; i < 5 * QUEUE_LIMIT; ++i) {
        GIAP.identify('test id');
      }

      expect(getQueueLength()).toBe(QUEUE_LIMIT);
    });

    it('should disable all functionalities when current token is disabled', async () => {
      fetch.mockResponse(JSON.stringify({ error_code: 40101 }));
      GIAP.alias('test');
      await waitForFlushOnce();
      expect(fetch).toBeCalledTimes(1);

      GIAP.track('test');
      await waitForFlushOnce();
      expect(fetch).toBeCalledTimes(1);
      expect(getQueueLength()).toBe(0);
    });
  });
});
