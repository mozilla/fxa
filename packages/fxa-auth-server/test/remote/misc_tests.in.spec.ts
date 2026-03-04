/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import http from 'http';
import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();
const packageJson = require('../../package.json');

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

// Simple HTTP GET using Node's built-in http module.
// Avoids superagent's circular references (which crash Jest workers)
// and fetch's behavioral quirks with certain hapi routes.
function httpGet(
  url: string,
  options?: { headers?: Record<string, string> }
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string; json: () => any }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.get(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        headers: options?.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: data,
            json: () => JSON.parse(data),
          });
        });
      }
    );
    req.on('error', reject);
  });
}

function httpPost(
  url: string,
  payload: any,
  headers?: Record<string, string>
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(payload);
    const req = http.request(
      {
        method: 'POST',
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

describe.each(testVersions)(
  '#integration$tag - remote misc',
  ({ version, tag }) => {
    const testOptions = { version };

    it('unsupported api version', async () => {
      const res = await httpGet(`${server.publicUrl}/v0/account/create`);
      expect(res.statusCode).toBe(410);
    });

    it('/__heartbeat__ returns a 200 OK', async () => {
      const res = await httpGet(`${server.publicUrl}/__heartbeat__`);
      expect(res.statusCode).toBe(200);
    });

    it('/__lbheartbeat__ returns a 200 OK', async () => {
      const res = await httpGet(`${server.publicUrl}/__lbheartbeat__`);
      expect(res.statusCode).toBe(200);
    });

    it('/ returns version, git hash and source repo', async () => {
      const res = await httpGet(server.publicUrl + '/');
      const json = res.json();
      expect(Object.keys(json)).toEqual(['version', 'commit', 'source']);
      expect(json.version).toBe(packageJson.version);
      expect(json.source && json.source !== 'unknown').toBeTruthy();
      expect(json.commit).toMatch(/^[0-9a-f]{40}$/);
    });

    it('/__version__ returns version, git hash and source repo', async () => {
      const res = await httpGet(server.publicUrl + '/__version__');
      const json = res.json();
      expect(Object.keys(json)).toEqual(['version', 'commit', 'source']);
      expect(json.version).toBe(packageJson.version);
      expect(json.source && json.source !== 'unknown').toBeTruthy();
      expect(json.commit).toMatch(/^[0-9a-f]{40}$/);
    });

    it('returns no Access-Control-Allow-Origin with no Origin set', async () => {
      const res = await httpGet(`${server.publicUrl}/`);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('returns correct Access-Control-Allow-Origin with whitelisted Origin', async () => {
      const corsOrigin = (server.config as any).corsOrigin;
      const randomAllowedOrigin =
        corsOrigin[Math.floor(Math.random() * corsOrigin.length)];
      const res = await httpGet(`${server.publicUrl}/`, {
        headers: { Origin: randomAllowedOrigin },
      });
      expect(res.headers['access-control-allow-origin']).toBe(randomAllowedOrigin);
    });

    it('returns no Access-Control-Allow-Origin with not whitelisted Origin', async () => {
      const res = await httpGet(`${server.publicUrl}/`, {
        headers: { Origin: 'http://notallowed' },
      });
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('/verify_email redirects', async () => {
      const path = '/v1/verify_email?code=0000&uid=0000';
      const res = await httpGet(server.publicUrl + path);
      expect(res.statusCode).toBe(302);
    });

    it('/complete_reset_password redirects', async () => {
      const path =
        '/v1/complete_reset_password?code=0000&email=a@b.c&token=0000';
      const res = await httpGet(server.publicUrl + path);
      expect(res.statusCode).toBe(302);
    });

    it('timestamp header', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );

      await client.login();
      const url = `${client.api.baseURL}/account/keys`;
      const token = await client.api.Token.KeyFetchToken.fromHex(
        client.getState().keyFetchToken
      );

      const res = await httpGet(url, {
        headers: { 'Authorization': `Hawk id="${token.id}"` },
      });
      const now = +new Date() / 1000;
      expect(Number(res.headers.timestamp)).toBeGreaterThan(now - 60);
      expect(Number(res.headers.timestamp)).toBeLessThan(now + 60);
    });

    it('Strict-Transport-Security header', async () => {
      const res = await httpGet(`${server.publicUrl}/`);
      expect(res.headers['strict-transport-security']).toBe(
        'max-age=31536000; includeSubDomains'
      );
    });

    it('oversized payload', async () => {
      const client = new Client(server.publicUrl, testOptions);
      try {
        await client.api.doRequest(
          'POST',
          `${client.api.baseURL}/get_random_bytes`,
          null,
          { big: Buffer.alloc(8192).toString('hex') }
        );
        throw new Error('request should have failed');
      } catch (err: any) {
        if (err.errno) {
          expect(err.errno).toBe(113);
        } else {
          expect(/413 Request Entity Too Large/.test(err)).toBeTruthy();
        }
      }
    });

    it('random bytes', async () => {
      const client = new Client(server.publicUrl, testOptions);
      const x = await client.api.getRandomBytes();
      expect(x.data.length).toBe(64);
    });

    it('fetch /.well-known/browserid support document', async () => {
      const client = new Client(server.publicUrl, testOptions);
      const doc = await client.api.doRequest(
        'GET',
        server.publicUrl + '/.well-known/browserid'
      );
      expect(Object.prototype.hasOwnProperty.call(doc, 'public-key')).toBe(true);
      expect(/^[0-9]+$/.test(doc['public-key'].n)).toBe(true);
      expect(/^[0-9]+$/.test(doc['public-key'].e)).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(doc, 'authentication')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(doc, 'provisioning')).toBe(true);
      expect(doc.keys.length).toBe(1);
    });

    it('ignores fail on hawk payload mismatch', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );

      const token = await client.api.Token.SessionToken.fromHex(client.sessionToken);
      const url = `${client.api.baseURL}/account/device`;
      const payload: any = {
        name: 'my cool device',
        type: 'desktop',
      };

      payload.name = 'my stealthily-changed device name';
      const res = await httpPost(url, payload, {
        'Authorization': `Hawk id="${token.id}"`,
      });
      expect(res.statusCode).toBe(200);
    });
  }
);
