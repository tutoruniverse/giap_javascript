import giap from '../index';
import { QUEUE_INTERVAL } from '../constants/lib';

describe('index', () => {
  const token = 'secret_token';
  const apiUrl = 'https://www.random-server-url.com';

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
    try {
      giap.track('TEST');
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      giap.alias('TEST');
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      giap.identify();
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      giap.setProfileProperties();
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      giap.reset();
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      giap.increase();
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }

    try {
      giap.initialize(token);
    } catch (e) {
      expect(e.message).toBe('Missing initialization config');
    }

    giap.initialize(token, apiUrl);

    try {
      giap.initialize(token, apiUrl);
    } catch (e) {
      expect(e.message).toBe('GIAP can be initialized only once');
    }
  });

  it('should ensure required params for each methods', async () => {
    setup();
    try {
      giap.alias();
    } catch (e) {
      expect(e.message).toBe('Missing userId to create alias');
    }
    try {
      giap.identify();
    } catch (e) {
      expect(e.message).toBe('Missing userId to identify');
    }
    try {
      giap.track();
    } catch (e) {
      expect(e.message).toBe('Missing event name');
    }
    try {
      giap.setProfileProperties({});
    } catch (e) {
      expect(e.message).toBe('Missing profile properties to update');
    }
  });

  it('should create new distinctId on reset call', async () => {
    setup();
    giap.track('TEST');
    await waitForFlushOnce();

    giap.reset();
    giap.track('TEST');
    await waitForFlushOnce();

    const oldDistinctId = JSON.parse(fetch.mock.calls[0][1].body).events[0].$distinct_id;
    const newDistinctId = JSON.parse(fetch.mock.calls[1][1].body).events[0].$distinct_id;

    expect(oldDistinctId).not.toEqual(newDistinctId);
  });

  it('should call identify with currentDistinctId as queryString', async () => {
    setup();
    giap.track('TEST');
    giap.identify('userTest');

    await waitForFlushOnce();
    await waitForFlushOnce();

    const currentDistinctId = JSON.parse(fetch.mock.calls[0][1].body).events[0].$distinct_id;
    expect(fetch.mock.calls[1][0].includes(currentDistinctId)).toBeTruthy();
  });

  it('should emit events on batches', async () => {
    setup();
    giap.track('TEST');
    giap.track('TEST');
    giap.track('TEST');
    giap.track('TEST');
    giap.setProfileProperties({ phone: '12345' });
    await waitForFlushOnce();
    await waitForFlushOnce();

    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(fetch.mock.calls[1][1].method).toBe('PUT');
  });

  it('should retry with request failed with server side error', async () => {
    setup();
    fetch.mockResponse(JSON.stringify({}), { status: 500 });

    giap.alias('userTest');
    giap.identify('userTest');

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

  it('should have the ability to notify after requests fetched', async () => {
    setup();
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
      setup();
      giap.increase('prop', 123);
      await waitForFlushOnce();

      expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify({
        operation: 'increase',
        value: 123,
      }));
    });

    it('should prevent invalid value type', () => {
      setup();
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
});
