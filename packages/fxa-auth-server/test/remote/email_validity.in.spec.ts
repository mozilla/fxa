/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

interface AuthServerError extends Error {
  code: number;
}

const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      accountDestroy: {
        requireVerifiedAccount: false,
        requireVerifiedSession: false,
      },
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote email validity',
  ({ version, tag }) => {
    const testOptions = { version };

    it('/account/create with a variety of malformed email addresses', async () => {
      const pwd = '123456';

      const emails = [
        'notAnEmailAddress',
        '\n@example.com',
        'me@hello world.com',
        'me@hello+world.com',
        'me@.example',
        'me@example',
        'me@example.com-',
        'me@example..com',
        'me@example-.com',
        'me@example.-com',
        '\uD83D\uDCA9@unicodepooforyou.com',
      ];

      const results = await Promise.all(
        emails.map((email) =>
          Client.create(server.publicUrl, email, pwd, testOptions).then(
            () => {
              throw new Error(`Email ${email} should have been rejected`);
            },
            (err: AuthServerError) => {
              expect(err.code).toBe(400);
            }
          )
        )
      );
    });

    it('/account/create with a variety of unusual but valid email addresses', async () => {
      const pwd = '123456';

      const emails = [
        'tim@tim-example.net',
        'a+b+c@example.com',
        '#!?-@t-e-s-assert.c-o-m',
        `${String.fromCharCode(1234)}@example.com`,
        `test@${String.fromCharCode(5678)}.com`,
      ];

      await Promise.all(
        emails.map((email) =>
          Client.create(server.publicUrl, email, pwd, testOptions).then(
            (c: any) => c.destroyAccount(),
            () => {
              fail(
                `Email address ${email} should have been allowed, but it wasn't`
              );
            }
          )
        )
      );
    });
  }
);
