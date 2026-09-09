/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assertSecurityHeaders } from './lib/util';
import config from '../lib/config';
const Server = require('./lib/server');
const Static = require('./lib/static');
const packageJson = require('../package.json');

describe('#integration - server', () => {
  let testServer: any;

  beforeAll(async () => {
    testServer = await Server.create();
  });

  afterAll(async () => {
    return testServer.server.stop();
  });

  async function checkVersionAndHeaders(_path: string) {
    const res = await Server.get('/');
    expect(res.statusCode).toBe(200);
    expect(res.result.version).toBe(packageJson.version);
    expect(res.result.commit).toBeTruthy();

    assertSecurityHeaders(res);

    // but the other security builtin headers from hapi are not set
    var other: Record<string, number> = {
      'x-download-options': 1,
    };

    Object.keys(res.headers).forEach(function (header) {
      expect(other[header.toLowerCase()]).toBeFalsy();
    });
  }

  describe('/', () => {
    it('should return the version', () => {
      return checkVersionAndHeaders('/');
    });
  });

  describe('/__version__', () => {
    it('should return the version', () => {
      return checkVersionAndHeaders('/__version__');
    });
  });

  describe('/__heartbeat__', () => {
    it('should succeed', async () => {
      const res = await Server.get('/__heartbeat__');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('/__lbheartbeat__', () => {
    it('should succeed', async () => {
      const res = await Server.get('/__lbheartbeat__');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('cookie handling', () => {
    // Raw unencoded JSON, matching the consent-manager cookie set on
    // `.firefox.com`. The `"` and `,` violate RFC 6265, which Hapi rejects with
    // a 400 in `onPreAuth` unless cookie parsing is off.
    const MOCK_MALFORMED_COOKIE =
      'tcm={"purposes":{"Analytics":true},"confirmed":true}';

    it('serves the monogram avatar when the request carries a malformed cookie', async () => {
      const res = await Server.api.get({
        url: '/avatar/l',
        headers: { cookie: MOCK_MALFORMED_COOKIE },
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('image/svg+xml; charset=UTF-8');
      expect(res.result).toContain('>L</text>');
    });

    // The static image server is a separate Hapi instance, so it needs its own
    // coverage — otherwise half the fix can regress without failing a test.
    it('serves a default avatar image when the request carries a malformed cookie', async () => {
      const res = await Static.get({
        url: `/a/${config.get('img.defaultAvatarId')}`,
        headers: { cookie: MOCK_MALFORMED_COOKIE },
      });

      expect(res.statusCode).toBe(200);
    });
  });
});
