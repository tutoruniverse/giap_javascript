import RequestHelper from '../request';

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
    expect(res).toEqual(response);

    fetch.mockRejectedValue(response);
    try {
      res = await instance.get();
    } catch (e) {
      expect(e).toEqual(response);
    }
  });
});
