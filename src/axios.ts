import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { HttpAgent, HttpsAgent } from 'agentkeepalive';
import { IBasicLogger } from '@rataqa/sijil';

import { makeHttpAgent, makeHttpsAgent } from './agent';
import { IAxiosFactory, IHttpRequestHeaders } from './types';

const defaultConfig: CreateAxiosDefaults = {
  timeout: 60_000,
};

export function makeAxiosFactory(
  baseURL: string,
  config: CreateAxiosDefaults = {},
  logger: IBasicLogger | null = null,
): IAxiosFactory {

  const isHttps = baseURL.toLowerCase().startsWith('https://');
  let httpAgent: HttpAgent | null = null, httpsAgent: HttpsAgent | null = null;

  if (!config.httpAgent && !isHttps) httpAgent = makeHttpAgent();
  if (!config.httpsAgent && isHttps) httpsAgent = makeHttpsAgent();

  const defaultHttpClient = makeHttpClient();
  if (logger) {
    useLogger(defaultHttpClient, logger);
  }

  function useHeaders(ax: AxiosInstance, headersToAppend: IHttpRequestHeaders = {}) {
    ax.interceptors.request.use((req) => {
      Object.entries(headersToAppend).forEach(([key, val]) => {
        req.headers.set(key, val);
      });
      return req;
    });
  }

  function useLogger(ax: AxiosInstance, l: IBasicLogger) {
    ax.interceptors.request.use((req) => {
      const { method, url, params: query, headers, data: body = null } = req;
      l.info('axios request', { method, url, query, headers, body });
      return req;
    });

    ax.interceptors.response.use(
      function handleResponse(res) {
        const { status, data: body, headers, config: { method, url } } = res;
        l.info('axios response', { method, url, status, headers, body });
        return res;
      },
      function handleError(err) {
        if (err.response) {
          const { status, data: body, headers, config: { method, url } } = err.response;
          l.error('axios response error', { method, url, status, headers, body });
        }
        return Promise.reject(err);
      }
    );
  }

  function makeHttpClient(headers: IHttpRequestHeaders = {}) {
    return axios.create({ baseURL, ...defaultConfig, httpAgent, httpsAgent, headers, ...config });
  }

  function makeAxiosPerRequest(headers: IHttpRequestHeaders, l: IBasicLogger) {
    const _http = makeHttpClient(headers);
    useLogger(_http, l);
    return _http;
  }

  return {
    defaultHttpClient,
    httpAgent,
    httpsAgent,
    makeAxiosPerRequest,
    makeHttpClient,
    useLogger,
    useHeaders,
  };
}
