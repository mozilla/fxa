/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import path from 'path';
import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const superagent = require('superagent');

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      oldPublicKeyFile: path.resolve(__dirname, '../../config/public-key.json'),
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
});

describe('#integration - remote sign key', () => {
  it('.well-known/public-keys serves the primary and old keys', async () => {
    const res = await superagent.get(
      `${server.publicUrl}/.well-known/public-keys`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.keys.length).toBe(2);
  });
});
