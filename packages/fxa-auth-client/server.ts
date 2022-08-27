import http from 'http';
import https from 'https';
import { Crypto } from '@peculiar/webcrypto';
import fetch, { Headers } from 'node-fetch';
import { btoa } from 'abab';
import AbortController from 'abort-controller';
import AuthClient from './lib/client';

http.globalAgent = new http.Agent({
  keepAlive: true,
});
https.globalAgent = new https.Agent({
  keepAlive: true,
});

// @ts-ignore
global.crypto = new Crypto();
// @ts-ignore
global.fetch = fetch;
// @ts-ignore
global.AbortController = AbortController;
// @ts-ignore
global.Headers = Headers;
// @ts-ignore
global.btoa = btoa;

export default AuthClient;
export * from './lib/client';
export * from './lib/hawk';
