import http from 'http';
import https from 'https';
import fetch, { Headers } from 'node-fetch';
import AuthClient from './lib/client';

http.globalAgent = new http.Agent({
  keepAlive: true,
});
https.globalAgent = new https.Agent({
  keepAlive: true,
});

// @ts-ignore
global.fetch = fetch;
// @ts-ignore
global.Headers = Headers;

export default AuthClient;
export * from './lib/client';
export * from './lib/hawk';
