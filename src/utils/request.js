import QueryString from 'querystring';
import CaseConverter from './caseConverter';
import { isEmpty } from './object';

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const request = async (endpoint, method, body, customHeaders = {}, token, apiUrl) => {
  const url = apiUrl + endpoint;
  const headers = {
    ...defaultHeaders,
    ...customHeaders,
    Authorization: `Bearer ${token}`,
  };
  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: (body ? JSON.stringify(CaseConverter.camelCaseToSnakeCase(body)) : undefined),
    });
  } catch (e) {
    // pass
  }

  if (!res || !res.status || res.status > 499) {
    return { retry: true };
  }

  return (res.json())
    .then(res => ({ retry: false,
      data: CaseConverter.snakeCaseToCamelCaseWithPrefix(res) }));
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
      url += `?${QueryString.stringify(CaseConverter.camelCaseToSnakeCase(params), { encode: true })}`;
    }
    return this.request(url, 'GET');
  };

  post = (endpoint, body, headers = defaultHeaders) => (
    this.request(endpoint, 'POST', body, headers)
  );

  put = (endpoint, body) => (
    this.request(endpoint, 'PUT', body)
  );

  del = (endpoint, body) => (
    this.request(endpoint, 'DELETE', body)
  );

  request = (endpoint, method, body, customHeaders = {}) => (
    request(endpoint, method, body, customHeaders, this.token, this.apiUrl)
  )
}
