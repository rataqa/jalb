import { HttpAgent, HttpsAgent, HttpOptions, HttpsOptions } from 'agentkeepalive';

const defaultOptions: HttpOptions = {
  maxSockets       : 100,
  maxFreeSockets   : 5,
  timeout          : 60_000,   // active socket keepalive for 60 seconds
  freeSocketTimeout: 30_000,   // free socket keepalive for 30 seconds
};

export function makeHttpAgent(options: HttpOptions = {}): HttpAgent {
  return new HttpAgent({ ...defaultOptions, ...options });
}

export function makeHttpsAgent(options: HttpsOptions = {}): HttpsAgent {
  return new HttpsAgent({ ...defaultOptions, ...options });
}

export function makeAgent(baseURL: string, options: HttpOptions | HttpsOptions = {}): HttpAgent | HttpsAgent {
  if (baseURL.toLowerCase().startsWith('https://')) {
    return makeHttpsAgent(options);
  } else {
    return makeHttpAgent(options);
  }
}
