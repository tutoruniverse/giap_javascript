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
    GIAP.initialize(token, apiUrl);
  };

  it('should prevent calling any methods before initializing', () => {
    try {
      GIAP.track();
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
  });

  it('should create new distinctId on reset call', async () => {
    setup();
    GIAP.track();
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    const oldDistinctId = JSON.parse(fetch.mock.calls[0][1].body).events[0].$distinct_id;

    GIAP.reset();
    GIAP.track();
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    const newDistinctId = JSON.parse(fetch.mock.calls[1][1].body).events[0].$distinct_id;

    expect(oldDistinctId).not.toEqual(newDistinctId);
  });

  it('should call identify with currentDistinctId as queryString', async () => {
    setup();
    GIAP.track();
    GIAP.identify();

    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));

    const currentDistinctId = JSON.parse(fetch.mock.calls[0][1].body).events[0].$distinct_id;
    expect(fetch.mock.calls[1][0].includes(currentDistinctId)).toBeTruthy();
  });

  it('should emit events on batches', async () => {
    setup();
    GIAP.track();
    GIAP.track();
    GIAP.track();
    GIAP.track();
    GIAP.setProfileProperties();
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch.mock.calls[0][1].method).toBe('POST');

    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch.mock.calls[1][1].method).toBe('PUT');
  });

  it('should retry with request failed with server side error', async () => {
    setup();
    fetch.mockResponse(JSON.stringify({}), { status: 500 });

    GIAP.alias();
    GIAP.identify();

    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(fetch.mock.calls[1][1].method).toBe('POST');
    expect(fetch.mock.calls[2][1].method).toBe('POST');
  });

  /* it('should handle isFlushing flag correctly', async () => {
    fetch.mockResponse(
      () => new Promise(resolve => setTimeout(() => resolve({ body: '{}' }), 1500))
    );
    setup();
    GIAP.alias();
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch).toHaveBeenCalledTimes(1);
  }); */
});
