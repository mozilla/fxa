import http from 'http'
import https from 'https'
import { Crypto } from '@peculiar/webcrypto';
import fetch, { Headers } from 'node-fetch';
import { btoa } from 'abab';
import AbortController from 'abort-controller';
import AuthClient from './lib/client';

declare global {
  namespace NodeJS {
    interface Global {
        fetch: typeof fetch,
        AbortController: typeof AbortController,
        Headers: typeof Headers,
        crypto: Crypto,
        btoa: typeof btoa
    }
  }
}

http.globalAgent = new http.Agent({
  keepAlive: true
})
https.globalAgent = new https.Agent({
  keepAlive: true
})

global.crypto = new Crypto();
global.fetch = fetch;
global.AbortController = AbortController;
global.Headers = Headers;
global.btoa = btoa;

export default AuthClient;
export * from './lib/client';
