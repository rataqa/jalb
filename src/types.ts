import { IBasicLogger } from '@rataqa/sijil';
import { HttpAgent, HttpsAgent } from 'agentkeepalive';
import { AxiosInstance } from 'axios';

export interface IObject {
  [key: string]: unknown;
}

export interface IAppInfo {
  appName: string;
  appVersion: string;
}

export interface IHttpRequestContext extends IObject {
  correlation_id: string;
}

export interface IHttpRequestHeaders {
  [key: string]: string | string[];
}

export interface IAxiosFactory {
  defaultHttpClient: AxiosInstance;
  httpAgent: HttpAgent | null;
  httpsAgent: HttpsAgent | null;
  makeAxiosPerRequest: (headers: IHttpRequestHeaders, logger: IBasicLogger) => AxiosInstance;
  makeHttpClient: (headers?: IHttpRequestHeaders) => AxiosInstance;
  useLogger: (ax: AxiosInstance, l: IBasicLogger) => void;
  useHeaders: (ax: AxiosInstance, headersToAppend: IHttpRequestHeaders) => void;
}
