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

    GIAP.reset();
    GIAP.track('TEST');
    await waitForFlushOnce();

    const oldDistinctId = JSON.parse(fetch.mock.calls[0][1].body).events[0].$distinct_id;
    const newDistinctId = JSON.parse(fetch.mock.calls[1][1].body).events[0].$distinct_id;

    expect(oldDistinctId).not.toEqual(newDistinctId);
  });

  it('should call identify with currentDistinctId as queryString', async () => {
    setup();
    GIAP.track('TEST');
    GIAP.identify('userTest');

    await waitForFlushOnce();
    await waitForFlushOnce();

    const currentDistinctId = JSON.parse(fetch.mock.calls[0][1].body).events[0].$distinct_id;
    expect(fetch.mock.calls[1][0].includes(currentDistinctId)).toBeTruthy();
  });

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
    await waitForFlushOnce();

    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(fetch.mock.calls[1][1].method).toBe('PUT');
  });

  it('should retry with request failed with server side error', async () => {
    setup();
    fetch.mockResponse(JSON.stringify({}), { status: 500 });

    GIAP.alias('userTest');
    GIAP.identify('userTest');

    await waitForFlushOnce();
    await waitForFlushOnce();
    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(fetch.mock.calls[1][1].method).toBe('POST');

    fetch.mockResponse(JSON.stringify({}), { status: 400 });
    await waitForFlushOnce();
    expect(fetch.mock.calls[2][1].method).toBe('POST');
    await waitForFlushOnce();
    await waitForFlushOnce();
    expect(fetch.mock.calls[3][1].method).toBe('GET');
    expect(fetch.mock.calls[4][1].method).toBe('GET');
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
