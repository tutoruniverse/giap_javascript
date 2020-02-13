import QueryString from 'querystring';
import CaseConverter from './caseConverter';
import { isEmpty } from '.';

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export const request = async (endpoint, method, body, customHeaders = {}) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const headers = {
    ...defaultHeaders,
    ...customHeaders,
  };

  const res = await fetch(endpoint, {
    method,
    headers,
    body: (body ? JSON.stringify(CaseConverter.camelCaseToSnakeCase(body)) : undefined),
  });

  if (res.ok) {
    return (res.json())
      .then(res => CaseConverter.snakeCaseToCamelCase(res));
  }
  throw res.json();
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
    return request(url, 'GET');
  };

  post = (endpoint, body, headers = defaultHeaders) => (
    request(endpoint, 'POST', body, headers)
  );

  put = (endpoint, body) => (
    request(endpoint, 'PUT', body)
  );

  del = (endpoint, body) => (
    request(endpoint, 'DELETE', body)
  );
}
