import giap, { getQueueLength } from '../index';
import * as LibConst from '../constants/lib';

describe('index', () => {
  const token = 'secret_token';
  const apiUrl = 'https://www.random-server-url.com';

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
  });

  const setup = () => {
    /* localStorage.clear(); */
  };

  const waitForFlushOnce = async () => {
    await new Promise(resolve => setTimeout(resolve, LibConst.QUEUE_INTERVAL));
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
  };

  const getLastFetchParams = () => fetch.mock.calls.slice(-1)[0][1];
  const getLastFetchUrl = () => fetch.mock.calls.slice(-1)[0][0];

  it('should inform about initialization properly', () => {
    expect(
      () => { giap.track('TEST'); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { giap.alias('TEST'); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { giap.identify(); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { giap.setProfileProperties(); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { giap.increase(); }
    ).toThrowError('Analytics library not initialized');
    expect(
      () => { giap.reset(); }
    ).toThrowError('Analytics library not initialized');

    expect(
      () => { giap.initialize(token); })
      .toThrowError('Missing initialization config');

    giap.initialize(token, apiUrl);

    expect(
      () => { giap.initialize(token, apiUrl); })
      .toThrowError('GIAP can be initialized only once');
  });

  it('should ensure required params for each methods', async () => {
    expect(
      () => { giap.alias(); })
      .toThrowError('Missing userId to create alias');
    expect(
      () => { giap.identify(); })
      .toThrowError('Missing userId to identify');
    expect(
      () => { giap.track(); })
      .toThrowError('Missing event name');
    expect(
      () => { giap.setProfileProperties({}); })
      .toThrowError('Missing profile properties to update');
  });

  it('should create new distinctId on reset call', async () => {
    giap.track('TEST');
    await waitForFlushOnce();
    const oldDistinctId = JSON.parse(getLastFetchParams().body).events[0].$distinct_id;

    giap.reset();
    giap.track('TEST');
    await waitForFlushOnce();
    const newDistinctId = JSON.parse(getLastFetchParams().body).events[0].$distinct_id;

    expect(oldDistinctId).not.toEqual(newDistinctId);
  });

  it('should call identify with currentDistinctId as queryString', async () => {
    giap.track('TEST');
    giap.identify('userTest');

    await waitForFlushOnce();
    const currentDistinctId = JSON.parse(getLastFetchParams().body).events[0].$distinct_id;
    await waitForFlushOnce();
    expect(getLastFetchUrl().includes(currentDistinctId)).toBeTruthy();
  });

  describe('Queue process', () => {
    it('should emit events on batches', async () => {
      await waitForFlushOnce();
      expect(fetch).not.toHaveBeenCalled();

      giap.track('TEST');
      giap.track('TEST');
      giap.track('TEST');
      giap.track('TEST');
      giap.setProfileProperties({ phone: '12345' });

      await waitForFlushOnce();
      expect(getLastFetchParams().method).toBe('POST');

      await waitForFlushOnce();
      expect(getLastFetchParams().method).toBe('PUT');
    });

    it('should retry with request failed with server side error', async () => {
      fetch.mockResponse(JSON.stringify({}), { status: 500 });

      giap.alias('userTest');

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

  it('should have the ability to notify after requests fetched', async () => {
    giap.notification.didEmitEvents = jest.fn();
    giap.notification.didResetWithDistinctId = jest.fn();
    fetch.mockResponse(JSON.stringify({ testNotification: true }));

    giap.track('TEST');
    giap.reset();
    await waitForFlushOnce();

    const { didEmitEvents, didResetWithDistinctId } = giap.notification;
    expect(didEmitEvents.mock.calls[0][1]).toEqual({ testNotification: true });

    const distinctId = didEmitEvents.mock.calls[0][0][0].$distinctId;
    expect(didResetWithDistinctId).toHaveBeenCalledWith(distinctId);
  });

  describe('Modify Profile Property', () => {
    it('should provide certain profile modification operations', async () => {
      giap.increase('prop', 123);
      await waitForFlushOnce();

      expect(getLastFetchParams().body).toEqual(JSON.stringify({
        operation: 'increase',
        value: 123,
      }));
    });

    it('should prevent invalid value type', () => {
      try {
        giap.increase('prop');
      } catch (e) {
        expect(e.message).toBe('Invalid value type');
      }
      try {
        giap.remove('prop', 'test');
      } catch (e) {
        expect(e.message).toBe('Invalid value type');
      }
    });
  });

  describe('Version check', () => {
    it('should not handle requests of different lib version', async () => {
      fetch.mockResponse(JSON.stringify({ error_code: 404 }));
      giap.alias('test');

      LibConst.LIB_VERSION = 'abc';

      await waitForFlushOnce();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Disable token', () => {
    it('should limit the task queue size', () => {
      for (let i = 0; i < 5 * LibConst.QUEUE_LIMIT; ++i) {
        giap.identify('test id');
      }

      expect(getQueueLength()).toBe(LibConst.QUEUE_LIMIT);
    });

    /* Currently this should be the last test case to be run */
    it('should disable all functionalities when current token is disabled', async () => {
      fetch.mockResponse(JSON.stringify({ error_code: 40101 }));
      giap.alias('test');
      await waitForFlushOnce();
      expect(fetch).toBeCalledTimes(1);

      giap.track('test');
      await waitForFlushOnce();
      expect(fetch).toBeCalledTimes(1);
      expect(getQueueLength()).toBe(0);
    });
  });
});
