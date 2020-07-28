import http from 'http'
import https from 'https'
import { Crypto } from '@peculiar/webcrypto';
import fetch, { Headers } from 'node-fetch';
import { btoa } from 'abab';
import AuthClient from './lib/client';

declare global {
  namespace NodeJS {
    interface Global {
        fetch: typeof fetch,
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
global.Headers = Headers;
global.btoa = btoa;

export default AuthClient;
export * from './lib/client';
