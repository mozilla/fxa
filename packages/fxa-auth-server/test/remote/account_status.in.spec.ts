/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

interface AuthServerError extends Error {
  code: number;
  errno: number;
  message: string;
}

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
  '#integration$tag - remote account status',
  ({ version, tag }) => {
    const testOptions = { version };

    it('account status with existing account', async () => {
      const c = await Client.create(
        server.publicUrl,
        server.uniqueEmail(),
        'password',
        testOptions
      );
      const response = await c.api.accountStatus(c.uid);
      expect(response.exists).toBeTruthy();
    });

    it('account status includes locale when authenticated', async () => {
      const c = await Client.create(
        server.publicUrl,
        server.uniqueEmail(),
        'password',
        { ...testOptions, lang: 'en-US' }
      );
      const response = await c.api.accountStatus(c.uid, c.sessionToken);
      expect(response.locale).toBe('en-US');
    });

    it('account status does not include locale when unauthenticated', async () => {
      const c = await Client.create(
        server.publicUrl,
        server.uniqueEmail(),
        'password',
        { ...testOptions, lang: 'en-US' }
      );
      const response = await c.api.accountStatus(c.uid);
      expect(response.locale).toBeFalsy();
    });

    it('account status unauthenticated with no uid returns an error', async () => {
      const c = await Client.create(
        server.publicUrl,
        server.uniqueEmail(),
        'password',
        { ...testOptions, lang: 'en-US' }
      );
      try {
        await c.api.accountStatus();
        fail('should get an error');
      } catch (e: unknown) {
        const err = e as AuthServerError;
        expect(err.code).toBe(400);
        expect(err.errno).toBe(108);
      }
    });

    it('account status with non-existing account', async () => {
      const api = new Client.Api(server.publicUrl, testOptions);
      const response = await api.accountStatus(
        '0123456789ABCDEF0123456789ABCDEF'
      );
      expect(response.exists).toBeFalsy();
    });

    it('account status by email with existing account', async () => {
      const email = server.uniqueEmail();
      const c = await Client.create(
        server.publicUrl,
        email,
        'password',
        testOptions
      );
      const response = await c.api.accountStatusByEmail(email);
      expect(response.exists).toBeTruthy();
    });

    it('account status by email with non-existing account', async () => {
      const email = server.uniqueEmail();
      const c = await Client.create(
        server.publicUrl,
        email,
        'password',
        testOptions
      );
      const nonExistEmail = server.uniqueEmail();
      const response = await c.api.accountStatusByEmail(nonExistEmail);
      expect(response.exists).toBeFalsy();
    });

    it('account status by email with an invalid email', async () => {
      const email = server.uniqueEmail();
      const c = await Client.create(
        server.publicUrl,
        email,
        'password',
        testOptions
      );
      try {
        await c.api.accountStatusByEmail('notAnEmail');
        fail('should not have successful request');
      } catch (e: unknown) {
        const err = e as AuthServerError;
        expect(err.code).toBe(400);
        expect(err.errno).toBe(107);
        expect(err.message).toBe('Invalid parameter in request body');
      }
    });

    it('account status by email works with unicode email address', async () => {
      const email = server.uniqueUnicodeEmail();
      const c = await Client.create(
        server.publicUrl,
        email,
        'password',
        testOptions
      );
      const response = await c.api.accountStatusByEmail(email);
      expect(response.exists).toBeTruthy();
    });
  }
);
