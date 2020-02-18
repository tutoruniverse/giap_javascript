import GIAP from '../index';
import { QUEUE_INTERVAL } from '../constants/lib';

describe('index', () => {
  const token = 'secret_token';
  const apiUrl = 'https://www.random-server-url.com/';
  GIAP.initialize(token, apiUrl);
  jest.setTimeout(QUEUE_INTERVAL * 5);
  fetch.mockResponse(JSON.stringify({}));

  it('should emit events on batches', async () => {
    GIAP.track();
    GIAP.track();
    GIAP.track();
    GIAP.track();
    GIAP.setProfileProperties();
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].method).toBe('POST');

    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][1].method).toBe('PUT');
  });

  /* it('should send one request each interval', async () => {
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch).toHaveBeenCalledTimes(2);

    GIAP.alias();
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch).toHaveBeenCalledTimes(3);

    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(fetch).toHaveBeenCalledTimes(4);
  }); */
});
