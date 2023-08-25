import RequestHelper from '../request';
import { MAXIMUM_RETRY_TIME } from '../../constants/lib';

describe('utils/request', () => {
  let instance;
  let response;

  beforeEach(() => {
    instance = new RequestHelper('sample token', 'sample url');
    response = {
      categories: [{ name: 'test' }],
    };
  });

  it('should create request for each method', () => {
    instance.request = jest.fn();
    instance.get();
    expect(instance.request.mock.calls[0][1]).toBe('GET');
    instance.post();
    expect(instance.request.mock.calls[1][1]).toBe('POST');
    instance.put();
    expect(instance.request.mock.calls[2][1]).toBe('PUT');
    instance.del();
    expect(instance.request.mock.calls[3][1]).toBe('DELETE');
  });

  it('should handle success and failure response accordingly', async () => {
    fetch.mockResponse(JSON.stringify(response));
    let res = await instance.get();
    expect(res).toEqual({ retry: false, data: response });

    fetch.mockRejectedValue(response);
    res = await instance.get();
    expect(res).toEqual({ retry: true, data: undefined });
  });

  it('should handle maximum retry times for consecutive failed requests', async () => {
    // Mock first request to be success to reset retry time counter
    fetch.mockResponse(JSON.stringify(response));
    const successResponse = await instance.get();
    expect(successResponse).toEqual({ retry: false, data: response });

    const requestArr = new Array(MAXIMUM_RETRY_TIME - 1).fill();

    // Next four requests are failed, able to retry
    const results = await Promise.all(
      requestArr.map(async () => {
        fetch.mockReject(
          new Error({
            status: 500,
          }),
        );
        const res = await instance.get();
        return res;
      }),
    );

    results.forEach((result) => {
      expect(result).toEqual({ retry: true, data: undefined });
    });

    // Fifth request is failed, should not retry
    fetch.mockReject(new Error('fake error message'));
    const res = await instance.get();
    expect(res).toEqual({ retry: false, data: undefined });
  });
});
