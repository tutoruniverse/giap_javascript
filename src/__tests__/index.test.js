import GIAPLib from '..';
import RequestType from '../constants/requestType';
import { QUEUE_INTERVAL } from '../constants/app';

describe('index', () => {
  let instance;
  let persistence;
  let sendRequest;
  const token = 'secret_token';
  const apiUrl = 'https://www.random-server-url.com/';

  beforeEach(() => {
    instance = new GIAPLib();
    instance.initialize(token, apiUrl);
    sendRequest = jest.spyOn(instance, 'sendRequest');
    persistence = instance.persistence;
    persistence.persist = jest.fn();
    instance.fetch = {
      put: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
    };
  });

  it('should initialize properly', () => {
    expect(persistence).toBeTruthy();
    expect(instance.token).toBe(token);
    expect(instance.apiUrl).toBe(apiUrl);
  });

  it('should create alias properly', () => {
    instance.identify = jest.fn();
    instance.alias('test');
    expect(instance.identify).toHaveBeenCalledWith('test');
    expect(sendRequest).toHaveBeenCalledWith(
      RequestType.ALIAS,
      {
        userId: 'test',
        distinctId: persistence.getDistinctId(),
      });
  });

  it('should track event properly', () => {
    instance.track('Sample Name', { data: 'test' });
    expect(sendRequest.mock.calls[0][0]).toBe('TRACK');
    expect(sendRequest.mock.calls[0][1].data).toBe('test');
  });

  it('should have correct flushing state', () => {
    expect(instance.isFlushing).toBeFalsy();
    instance.flush();
    expect(instance.isFlushing).toBeTruthy();
  });

  it('should persist queue and toggle state after flushing', async () => {
    await instance.flush();
    expect(instance.isFlushing).toBeFalsy();
    expect(persistence.persist).toHaveBeenCalled();
  });

  it('should emit events on batches', async () => {
    instance.track();
    instance.track();
    instance.track();
    instance.track();
    instance.setProfileProperties();
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(instance.fetch.post).toHaveBeenCalledTimes(1);
    expect(instance.fetch.put).toHaveBeenCalledTimes(0);

    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(instance.fetch.post).toHaveBeenCalledTimes(1);
    expect(instance.fetch.put).toHaveBeenCalledTimes(1);
  });

  it('should send one request each interval', async () => {
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(instance.fetch.post).toHaveBeenCalledTimes(1);
    expect(instance.fetch.get).toHaveBeenCalledTimes(0);

    instance.alias();
    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(instance.fetch.post).toHaveBeenCalledTimes(2);
    expect(instance.fetch.get).toHaveBeenCalledTimes(0);

    await new Promise(resolve => setTimeout(resolve, QUEUE_INTERVAL));
    expect(instance.fetch.post).toHaveBeenCalledTimes(2);
    expect(instance.fetch.get).toHaveBeenCalledTimes(1);
  });
});
