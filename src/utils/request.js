import CaseConverter from './caseConverter';
import { isEmpty } from './object';
import { MAXIMUM_RETRY_TIME } from '../constants/lib';

let retryTime = 0;

const defaultHeaders = {
  Accept: 'application/json',
};

const request = async (
  endpoint,
  method,
  body,
  customHeaders = {},
  token,
  apiUrl,
) => {
  const url = apiUrl + endpoint;
  const headers = {
    ...defaultHeaders,
    ...customHeaders,
    Authorization: `Bearer ${token}`,
  };
  let res;

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    res = await fetch(url, {
      method,
      headers,
      body: body
        ? JSON.stringify(CaseConverter.camelCaseToSnakeCase(body))
        : undefined,
    });
    retryTime = 0;
  } catch (e) {
    retryTime++;
    if (retryTime >= MAXIMUM_RETRY_TIME) {
      retryTime = 0;
      return {
        retry: false,
        data: undefined,
      };
    }
  }

  if (!res || !res.status || res.status > 499) {
    return { retry: true, data: undefined || res };
  }

  return res.json().then((res) => ({
    retry: false,
    data: CaseConverter.snakeCaseToCamelCaseWithPrefix(res),
  }));
};

export default class RequestHelper {
  token;

  apiUrl;

  constructor(token, apiUrl) {
    this.token = token;
    this.apiUrl = apiUrl;
  }

  get = (endpoint, params) => {
    let url = endpoint;
    if (params && !isEmpty(params)) {
      const paramsObj = new URLSearchParams(
        CaseConverter.camelCaseToSnakeCase(params),
      );
      url += `?${paramsObj.toString()}`;
    }
    return this.request(url, 'GET');
  };

  post = (endpoint, body, headers = defaultHeaders) =>
    this.request(endpoint, 'POST', body, headers);

  put = (endpoint, body) => this.request(endpoint, 'PUT', body);

  del = (endpoint, body) => this.request(endpoint, 'DELETE', body);

  request = (endpoint, method, body, customHeaders = {}) =>
    request(endpoint, method, body, customHeaders, this.token, this.apiUrl);
}
