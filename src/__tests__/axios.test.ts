import { equal } from 'node:assert';
import { describe, it } from 'node:test';
import { makeLogger } from '@rataqa/sijil';

import { makeAxiosFactory } from '../axios';

describe('axios', () => {

  it('should make axios for HTTP', async () => {
    const logger = makeLogger('pino', { appName: 'axios test', appVersion: '1.0.0' });
    const options = { headers: { 'x-api-key': 'your-api-key' } };
    const f = makeAxiosFactory('http://example.com', options, logger.defaultLogger);

    equal(typeof f, 'object', 'makeAxios should return an object');
    equal(typeof f.defaultHttpClient.get, 'function', 'makeAxios should have an http property that is an object');

    const res1 = await f.defaultHttpClient.get('/');
    equal(String(res1.data).includes('Example Domain'), true, 'makeAxios should be able to make a request to the server');

    const correlation_id = '11223344';
    const ctx = { correlation_id };
    const headers = { 'x-correlation-id': correlation_id };
    const rl = logger.makeLoggerPerRequest(ctx);
    const api = f.makeAxiosPerRequest(headers, rl);
    const res2 = await api.get('/');
    equal(String(res2.data).includes('Example Domain'), true, 'makeAxios should be able to make a request to the server');
  });

  it.skip('should make axios for HTTPS', async () => {
    const f = makeAxiosFactory('https://example.com');
    equal(typeof f, 'object', 'makeAxios should return an object');
    equal(typeof f.defaultHttpClient.get, 'function', 'makeAxios should have an http property that is an object');
    const res = await f.defaultHttpClient.get('/');
    equal(String(res.data).includes('Example Domain'), true, 'makeAxios should be able to make a request to the server');
  });
});
