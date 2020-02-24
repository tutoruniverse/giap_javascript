import GIAP from '../index';
import { QUEUE_INTERVAL } from '../constants/lib';

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
    try {
      GIAP.track('TEST');
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      GIAP.alias('TEST');
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      GIAP.identify();
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      GIAP.setProfileProperties();
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }
    try {
      GIAP.reset();
    } catch (e) {
      expect(e.message).toBe('Analytics library not initialized');
    }

    try {
      GIAP.initialize(token);
    } catch (e) {
      expect(e.message).toBe('Missing initialization config');
    }

    GIAP.initialize(token, apiUrl);

    try {
      GIAP.initialize(token, apiUrl);
    } catch (e) {
      expect(e.message).toBe('GIAP can be initialized only once');
    }
  });

  it('should ensure required params for each methods', async () => {
    setup();
    try {
      GIAP.alias();
    } catch (e) {
      expect(e.message).toBe('Missing userId to create alias');
    }
    try {
      GIAP.identify();
    } catch (e) {
      expect(e.message).toBe('Missing userId to identify');
    }
    try {
      GIAP.track();
    } catch (e) {
      expect(e.message).toBe('Missing event name');
    }
    try {
      GIAP.setProfileProperties({});
    } catch (e) {
      expect(e.message).toBe('Missing profile properties to update');
    }
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
});
