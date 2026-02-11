/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as http from 'http';
import { JWTool, PrivateJWK } from '../index';

describe('JWTool', () => {
  let server: http.Server;
  let trustedJKUs: any;
  let secretJWK: PrivateJWK;
  const msg = { bar: 'baz' };

  beforeAll(async () => {
    server = http.createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ keys: [publicJWK] }));
    });
    const isListening = new Promise((resolve) =>
      server.once('listening', resolve)
    );
    server.listen(0, '127.0.0.1');
    await isListening;
    const serverAddress = server.address();
    if (!serverAddress) throw new Error('Server address not available');
    const port =
      typeof serverAddress === 'string' ? serverAddress : serverAddress.port;
    trustedJKUs = ['http://127.0.0.1:' + port + '/'];
    secretJWK = JWTool.JWK.fromPEM(secretKey, {
      jku: trustedJKUs[0],
      kid: 'test1',
    }) as PrivateJWK;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('should sign and verify a public key', async () => {
    const str = JWTool.sign({ header: { foo: 'x' }, payload: msg }, secretKey);
    const jwt = JWTool.verify(str, publicKey);
    expect(jwt).toStrictEqual(msg);
  });

  it('should verify a JWK', async () => {
    const jwtool = new JWTool(trustedJKUs);
    const payload = await jwtool.verify(secretJWK.signSync(msg));
    expect(payload.bar).toBe('baz');
  });
});

const secretKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAsV7Zn+AEa+8+eAwH32PAAIinwiUgWh7ootTt7AGtbeaDz163
qSmycqPXpHyDiM7tB1KMVK/+yJpgFqllmqjwG/1N1jnM9+8lIG1XA283sUV+aF9o
VyuzVdbaBnO6frRIfIyvmuGGDWI9U6jO1zk/2oPs2kYtHdEQSsM1PA2MY10I45jK
YpQuWJNZxQdiR2A+c0iS5kcOjse9+9xuUR2tHlN96afceXlrbXcW+DRTIg/wL/B/
tvS3c5Ri4v4ehq0P5jXT4HhHnJgIabyFfKfTo5/bicPu+pOksWTF/pjUOSMFHWuy
I3Y1PwW6A3fgPWj0x2Rl9S1Nic7JbQ/S9tvqBwIDAQABAoIBAQCoKRr+vm6yvjJl
slJMcs/4MZeLM5PGnYNFzcZ8eOKqTWAuXMiXsxaiJcAvDHXQYQ7MYHD3YZyXJ/Vt
xtCznvN2NeNz9Xzkm3CBm+hhMzKD+TTtU3cjHiV6fqZac6IeumH245MhritfyQIH
rQXde0OUsnr+PoZLvIhLuWNhOh8dm+SlruYEvd33S1EuWaboM8FKgTvxcKqwJ2WC
anZKp/su5h30nE3cGYcquICNNFFZDhkZ2wc5+nV2Wde9qobRr7zCfcppq6ZNf6+U
OFrj2L5bcjYnObFEJy89Py1alNgJxvh0WJzK7GY6YTIeHi+uVLzZ8IK2ecDh5dnW
fYHp163xAoGBANx3SUuXC9hQ/Ae2rN5mlEhQOVL6TPoc9lgiFdjCZKi46Badr0Ep
m+Oyz9bFsGWscDr4sdxqJ0ofa4bFtJtf4ntCjKkQjuPoU0law43yX/lqNRyuYO/T
5sOw0XkcQ3pXJSIu21A30bNX60O6JieijMRSpXwkc6EexqKPevMnqtgFAoGBAM31
Y5gxaEUywapNZXYVo4U4PB/QohkfJsB2F+3Y5GLkTDGy+0ITm10s5+Pslb+8pAI2
gsFwT53+CydARjCCVpjh0JW7T498995Y3PhhPMsNniALfFd4hAJ/QmUgwKUY5pDJ
oHRdNHOiumUmRay4aG79ESHFVdhwYHJ+Qs7SE9ObAoGAMbkhqc/GVyJkxWSY9owS
M4EMfL+BLwPrN5Nwc/Pb+gXCKp+j0EGPLDq/D4SEtVm/8jz2+Gxksh4GBV5/zm9A
yGYJDXRzlclnR2sWIeShasJeejqGGHElYct2YydRvLz83gnNYvlD7XwNzrekNVo+
/2RYeHhML/GeATn1E/RFXvUCgYAv4MKlR58IrxLsRw+2ErOvrXH0p2h3VJGKnilT
5l65Sn8X8paMNsigMWc6ye3J481wokFlPHmVrc/j8QIgFryQz7XQiPmmzpNEgf3k
U55xSZofsuvV3bM6bWD+501BU/eNYwHE60HdO8/+4ZXC4B+O5Y+M/TXGmeEh3I4l
TBrFzwKBgDXC9zDwYyt/2na3sFTL13IHqgiMnOUytSZ8caD1464IzX4hZcJbQaS3
uUaGvnI81NNl3YkNwYvZIJcfuZIjjS6itG6DQsTeq9xzxZHoPNXgCtdq0GTb6D6x
liaw3qdreLkZe9ra8HS6bAhUp8h8fVIuhDHsu0gkVyj2xpN7SZkS
-----END RSA PRIVATE KEY-----
`.trim();

const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsV7Zn+AEa+8+eAwH32PA
AIinwiUgWh7ootTt7AGtbeaDz163qSmycqPXpHyDiM7tB1KMVK/+yJpgFqllmqjw
G/1N1jnM9+8lIG1XA283sUV+aF9oVyuzVdbaBnO6frRIfIyvmuGGDWI9U6jO1zk/
2oPs2kYtHdEQSsM1PA2MY10I45jKYpQuWJNZxQdiR2A+c0iS5kcOjse9+9xuUR2t
HlN96afceXlrbXcW+DRTIg/wL/B/tvS3c5Ri4v4ehq0P5jXT4HhHnJgIabyFfKfT
o5/bicPu+pOksWTF/pjUOSMFHWuyI3Y1PwW6A3fgPWj0x2Rl9S1Nic7JbQ/S9tvq
BwIDAQAB
-----END PUBLIC KEY-----
`.trim();

const publicJWK = JWTool.JWK.fromPEM(publicKey, {
  kid: 'test1',
});
