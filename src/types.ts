import { IBasicLogger } from '@rataqa/sijil';
import { AxiosInstance } from 'axios';

export interface IObject {
  [key: string]: unknown;
}

export interface IAppInfo {
  appName: string;
  appVersion: string;
}

export interface IHttpRequestContext {
  correlation_id: string;
}

export interface IHttpRequestHeaders {
  [key: string]: string | string[] | number;
}

export interface IAxiosFactory {
  defaultHttpClient: AxiosInstance;
  makeAxiosPerRequest: (headers: IHttpRequestHeaders, logger: IBasicLogger) => AxiosInstance;
  makeHttpClient: (headers?: IHttpRequestHeaders) => AxiosInstance;
  useLogger: (ax: AxiosInstance, l: IBasicLogger) => void;
  useHeaders: (ax: AxiosInstance, headersToAppend: IHttpRequestHeaders) => void;
}
