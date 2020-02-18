import QueryString from 'querystring';
import CaseConverter from './caseConverter';
import { isEmpty } from './object';

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const request = async (endpoint, method, body, customHeaders = {}, token, apiUrl) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
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
      body: (body ? JSON.stringify(CaseConverter.snakeCaseToCamelCaseWithPrefix(body)) : undefined),
    });
  } catch (e) {
    console.log('catched');
    console.log(e);
  }

  if (!res || !res.status || res.status > 499) {
    return { retry: true };
  }

  return (res.json())
    .then(res => ({ retry: false,
      data: CaseConverter.snakeCaseToCamelCase(res) }));
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
