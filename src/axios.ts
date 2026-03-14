import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { HttpOptions, HttpsOptions } from 'agentkeepalive';
import { IBasicLogger } from '@rataqa/sijil';

import { makeHttpAgent, makeHttpsAgent } from './agent';
import { IAxiosFactory, IHttpRequestHeaders } from './types';

const defaultAxiosOptions: CreateAxiosDefaults = {
  timeout: 60_000,
  headers: {},
};

export function makeAxiosFactory(
  baseURL: string,
  axiosOptions: CreateAxiosDefaults = {},
  logger: IBasicLogger | null = null,
  httpAgentOptions: HttpOptions = {},
  httpsAgentOptions: HttpsOptions = {},
): IAxiosFactory {

  const mergedAxiosOptions = { ...defaultAxiosOptions, baseURL, ...axiosOptions };

  const isHttps = mergedAxiosOptions.baseURL.toLowerCase().startsWith('https://');

  if (!mergedAxiosOptions.httpAgent && !isHttps) mergedAxiosOptions.httpAgent = makeHttpAgent(httpAgentOptions);
  if (!mergedAxiosOptions.httpsAgent && isHttps) mergedAxiosOptions.httpsAgent = makeHttpsAgent(httpsAgentOptions);

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
    ax.interceptors.request.use(
      function handleRequest(req) {
        const { method, url, params: query, headers, data: body = null } = req;
        l.info('outgoing http request', { method, url, query, headers, body });
        return req;
      }
    );

    ax.interceptors.response.use(
      function handleResponse(res) {
        const { status, data: body, headers, config: { method, url } } = res;
        l.info('incoming http response', { method, url, status, headers, body });
        return res;
      },
      function handleError(err) {
        if (err.response) {
          const { status, data: body, headers, config: { method, url } } = err.response;
          l.error('incoming http response error', { method, url, status, headers, body });
        }
        return Promise.reject(err);
      }
    );
  }

  function makeHttpClient(headersOverride: IHttpRequestHeaders = {}) {
    let { headers, ...otherOptions } = mergedAxiosOptions;
    headers = { ...headers, ...headersOverride };
    return axios.create({ ...otherOptions, headers });
  }

  function makeAxiosPerRequest(headers: IHttpRequestHeaders, l: IBasicLogger) {
    const http = makeHttpClient(headers);
    useLogger(http, l);
    return http;
  }

  return {
    defaultHttpClient,
    makeAxiosPerRequest,
    makeHttpClient,
    useLogger,
    useHeaders,
  };
}
