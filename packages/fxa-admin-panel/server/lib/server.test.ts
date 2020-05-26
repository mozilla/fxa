/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import request from 'supertest';
import app from './server';
import pkg from '../../package.json';

function expectValueNotToBeUnknown(value: string) {
  expect(value).toBeTruthy();
  expect(value).not.toBe('unknown');
}

describe('Test simple server routes', () => {
  test('__version__ should have correct structure', () => {
    return new Promise(async (done) => {
      const response = await request(app).get('/__version__');
      expect(response.status).toStrictEqual(200);
      expect(response.header['content-type']).toStrictEqual(
        'application/json; charset=utf-8'
      );
      const body = response.body;
      expect(Object.keys(body).sort()).toStrictEqual([
        'commit',
        'source',
        'version',
      ]);
      expectValueNotToBeUnknown(body.commit);
      expectValueNotToBeUnknown(body.source);
      expectValueNotToBeUnknown(body.version);
      expect(body.version).toStrictEqual(pkg.version);
      // check that the commit value looks like a git SHA
      expect(body.commit).toMatch(/^[0-9a-f]{40}$/);
      done();
    });
  });

  test('__lbheartbeat__ should return as expected', () => {
    return new Promise(async (done) => {
      const response = await request(app).get('/__lbheartbeat__');
      expect(response.status).toStrictEqual(200);
      expect(response.header['content-type']).toStrictEqual(
        'text/plain; charset=utf-8'
      );
      expect(response.text).toStrictEqual('Ok');

      done();
    });
  });
});
