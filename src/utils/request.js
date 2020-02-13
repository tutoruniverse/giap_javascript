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
  let data = null;
  if (body) {
    data = JSON.stringify(body);
  }
  const fetchOpts = {
    method,
    headers,
  };
  if (method !== 'HEAD' && method !== 'GET') {
    fetchOpts.body = data;
  }
  try {
    const response = await fetch(endpoint, fetchOpts);
    let json = await response.json();
    // json = removeDataProperty(json);
    json = CaseConverter.snakeCaseToCamelCase(json);
    if (response.status < 200 || response.status >= 300) {
      if (json) {
        throw new Error(json);
      } else {
        throw new Error(response.statusText);
      }
    }
    return json;
  } catch (err) {
    console.error(err);
  }
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
