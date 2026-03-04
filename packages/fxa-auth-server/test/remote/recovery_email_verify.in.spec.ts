/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import url from 'url';

const Client = require('../client')();

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

describe.each(testVersions)(
  '#integration$tag - remote recovery email verify',
  ({ version, tag }) => {
    const testOptions = { version };

    it('create account verify with incorrect code', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.create(
        server.publicUrl,
        email,
        password,
        testOptions
      );

      let status = await client.emailStatus();
      expect(status.verified).toBe(false);

      try {
        await client.verifyEmail('00000000000000000000000000000000');
        fail('verified email with bad code');
      } catch (err: any) {
        expect(err.message.toString()).toBe('Invalid confirmation code');
      }

      status = await client.emailStatus();
      expect(status.verified).toBe(false);
    });

    it('verification email link', async () => {
      const email = server.uniqueEmail();
      const password = 'something';
      const config = server.config as any;
      const options = {
        ...testOptions,
        redirectTo: `https://sync.${config.smtp.redirectDomain}/`,
        service: 'sync',
      };

      await Client.create(server.publicUrl, email, password, options);

      const emailData = await server.mailbox.waitForEmail(email);
      const link = emailData.headers['x-link'];
      const query = url.parse(link, true).query;
      expect(query.uid).toBeTruthy();
      expect(query.code).toBeTruthy();
      expect(query.redirectTo).toBe(options.redirectTo);
      expect(query.service).toBe(options.service);
    });
  }
);
