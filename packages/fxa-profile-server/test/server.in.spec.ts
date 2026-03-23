/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assertSecurityHeaders } from './lib/util';
const Server = require('./lib/server');
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
});
