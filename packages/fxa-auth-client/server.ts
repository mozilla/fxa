import http from 'http';
import https from 'https';
import AuthClient from './lib/client';

http.globalAgent = new http.Agent({
  keepAlive: true,
});
https.globalAgent = new https.Agent({
  keepAlive: true,
});

export default AuthClient;
export * from './lib/client';
export * from './lib/hawk';
