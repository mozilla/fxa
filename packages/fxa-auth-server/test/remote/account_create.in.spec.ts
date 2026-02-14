/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';

interface AuthServerError extends Error {
  errno: number;
  code: number;
  email: string;
}

interface TestConfig extends Record<string, unknown> {
  smtp: { syncUrl: string };
  publicUrl: string;
}

const Client = require('../client')();
const mocks = require('../mocks');

let server: TestServerInstance;
let config: TestConfig;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      subscriptions: { enabled: false },
    },
  });
  config = server.config as TestConfig;
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote account create',
  ({ version, tag }) => {
    const testOptions = { version };

    it('unverified account fail when getting keys', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.create(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      expect(client.authAt).toBeTruthy();

      try {
        await client.keys();
        fail('got keys before verifying email');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.errno).toBe(104);
        expect(error.message).toBe('Unconfirmed account');
      }
    });

    it('create and verify sync account', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        service: 'sync',
      });
      expect(client.authAt).toBeTruthy();

      let status = await client.emailStatus();
      expect(status.verified).toBe(false);

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-mailer']).toBeUndefined();
      expect(emailData.headers['x-template-name']).toBe('verify');

      const verifyCode = emailData.headers['x-verify-code'];
      await client.verifyEmail(verifyCode, { service: 'sync' });

      const postVerifyEmail = await server.mailbox.waitForEmail(email);
      expect(postVerifyEmail.headers['x-link']).toMatch(new RegExp(`^${config.smtp.syncUrl}`));

      status = await client.emailStatus();
      expect(status.verified).toBe(true);
    });

    it('create account with service identifier and resume', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        service: 'abcdef',
        resume: 'foo',
      });

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-service-id']).toBe('abcdef');
      expect(emailData.headers['x-link']).toContain('resume=foo');
    });

    it('create account allows localization of emails', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      let client = await Client.create(
        server.publicUrl,
        email,
        password,
        testOptions
      );

      let emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.text).toContain('Confirm account');

      const code = emailData.headers['x-verify-code'];
      await client.verifyEmail(code, {});
      await client.destroyAccount();

      client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        lang: 'pt-br',
      });

      emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.text).not.toContain('Confirm email');

      const code2 = emailData.headers['x-verify-code'];
      await client.verifyEmail(code2, {});
      await client.destroyAccount();
    });

    it('Unknown account should not exist', async () => {
      const client = new Client(server.publicUrl, testOptions);
      client.email = server.uniqueEmail();
      client.authPW = crypto.randomBytes(32);
      client.authPWVersion2 = crypto.randomBytes(32);

      try {
        await client.auth();
        fail('account should not exist');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.errno).toBe(102);
      }
    });

    it('stubs account and finishes setup', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(server.publicUrl, testOptions);
      await client.setupCredentials(email, password);

      if (testOptions.version === 'V2') {
        await client.setupCredentialsV2(email, password);
      }

      const stubResponse = await client.stubAccount('dcdb5ae7add825d2');

      const jwt = require('../../lib/oauth/jwt');
      const setupToken = jwt.sign(
        { uid: stubResponse.uid, iat: Date.now() },
        { header: { typ: 'fin+JWT' } }
      );

      const response = await client.finishAccountSetup(setupToken);
      expect(response.uid).toBeDefined();
      expect(response.sessionToken).toBeDefined();
      expect(response.verified).toBe(false);

      const client2 = await Client.login(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      expect(client2.sessionToken).toBeDefined();
    });

    it('can re-stub an unverified account', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';

      const stub = async () => {
        const client = new Client(server.publicUrl, testOptions);
        await client.setupCredentials(email, password);

        if (testOptions.version === 'V2') {
          await client.setupCredentialsV2(email, password);
        }

        return client.stubAccount('dcdb5ae7add825d2');
      };

      const first = await stub();
      expect(first.uid).toBeDefined();

      const second = await stub();
      expect(second.uid).toBeDefined();
      expect(second.uid).not.toBe(first.uid);
    });

    it('fails to create account with a corrupt setup token', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(server.publicUrl, testOptions);
      await client.setupCredentials(email, password);

      if (testOptions.version === 'V2') {
        await client.setupCredentialsV2(email, password);
      }

      await client.stubAccount('dcdb5ae7add825d2');
      await expect(client.finishAccountSetup('invalid-token')).rejects.toBeDefined();
    });

    it('fails to call finish setup again', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(server.publicUrl, testOptions);
      await client.setupCredentials(email, password);

      if (testOptions.version === 'V2') {
        await client.setupCredentialsV2(email, password);
      }

      const stubResponse = await client.stubAccount('dcdb5ae7add825d2');

      const jwt = require('../../lib/oauth/jwt');
      const setupToken = jwt.sign(
        {
          uid: stubResponse.uid,
          iat: Date.now(),
        },
        { header: { typ: 'fin+JWT' } }
      );

      await client.finishAccountSetup(setupToken);
      await expect(client.finishAccountSetup(setupToken)).rejects.toBeDefined();
    });

    it('/account/create works with proper data', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );
      expect(client.uid).toBeTruthy();

      await client.login();
      expect(client.sessionToken).toBeTruthy();
    });

    it('/account/create returns a sessionToken', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(server.publicUrl, testOptions);

      await client.setupCredentials(email, password);
      const response = await client.api.accountCreate(client.email, client.authPW);

      expect(response.sessionToken).toBeTruthy();
      expect(response.keyFetchToken).toBeUndefined();
    });

    it('/account/create returns a keyFetchToken when keys=true', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(server.publicUrl, testOptions);

      await client.setupCredentials(email, password);
      const response = await client.api.accountCreate(client.email, client.authPW, {
        keys: true,
      });

      expect(response.sessionToken).toBeTruthy();
      expect(response.keyFetchToken).toBeTruthy();
    });

    it('signup with same email, different case', async () => {
      const email = server.uniqueEmail();
      const email2 = email.toUpperCase();
      const password = 'abcdef';

      await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );

      try {
        await Client.create(server.publicUrl, email2, password, testOptions);
        fail('should have thrown');
      } catch (err: unknown) {
        const error = err as AuthServerError;
        expect(error.code).toBe(400);
        expect(error.errno).toBe(101);
        expect(error.email).toBe(email);
      }
    });

    it('re-signup against an unverified email', async () => {
      const email = server.uniqueEmail();
      const password = 'abcdef';

      await Client.create(server.publicUrl, email, password, testOptions);
      await server.mailbox.waitForEmail(email);

      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      );
      expect(client.uid).toBeTruthy();
    });

    it('invalid redirectTo', async () => {
      const api = new Client.Api(server.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        redirectTo: 'http://accounts.firefox.com.evil.us',
      };

      try {
        await api.accountCreate(email, authPW, options);
        fail('should have thrown');
      } catch (err: unknown) {
        expect((err as AuthServerError).errno).toBe(107);
      }
    });

    it('another invalid redirectTo', async () => {
      const api = new Client.Api(server.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        redirectTo: 'https://www.fake.com/.firefox.com',
      };

      try {
        await api.accountCreate(email, authPW, options);
        fail('should have thrown');
      } catch (err: unknown) {
        expect((err as AuthServerError).errno).toBe(107);
      }
    });

    it('valid metricsContext', async () => {
      const api = new Client.Api(server.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: 'bar',
          utmContent: 'baz',
          utmMedium: 'qux',
          utmSource: 'wibble',
          utmTerm: 'blee',
        },
      };

      await api.accountCreate(email, authPW, options);
    });

    it('empty metricsContext', async () => {
      const api = new Client.Api(server.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {},
      };

      await api.accountCreate(email, authPW, options);
    });

    it('invalid entrypoint', async () => {
      const api = new Client.Api(server.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: ';',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: 'foo',
          utmContent: 'bar',
          utmMedium: 'baz',
          utmSource: 'qux',
          utmTerm: 'wibble',
        },
      };

      try {
        await api.accountCreate(email, authPW, options);
        fail('should have thrown');
      } catch (err: unknown) {
        expect((err as AuthServerError).errno).toBe(107);
      }
    });

    it('create account with service query parameter', async () => {
      const email = server.uniqueEmail();

      await Client.create(server.publicUrl, email, 'foo', {
        ...testOptions,
        serviceQuery: 'bar',
      });

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-service-id']).toBe('bar');
    });

    it('account creation works with unicode email address', async () => {
      const email = server.uniqueUnicodeEmail();

      const client = await Client.create(
        server.publicUrl,
        email,
        'foo',
        testOptions
      );
      expect(client).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData).toBeTruthy();
    });

    it('account creation fails with invalid metricsContext flowId', async () => {
      const email = server.uniqueEmail();

      try {
        await Client.create(server.publicUrl, email, 'foo', {
          ...testOptions,
          metricsContext: {
            flowId: 'deadbeefbaadf00ddeadbeefbaadf00d',
            flowBeginTime: 1,
          },
        });
        fail('account creation should have failed');
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });

    it('account creation fails with invalid metricsContext flowBeginTime', async () => {
      const email = server.uniqueEmail();

      try {
        await Client.create(server.publicUrl, email, 'foo', {
          ...testOptions,
          metricsContext: {
            flowId:
              'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
            flowBeginTime: 0,
          },
        });
        fail('account creation should have failed');
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });

    it('account creation works with maximal metricsContext metadata', async () => {
      const email = server.uniqueEmail();
      const options = {
        ...testOptions,
        metricsContext: mocks.generateMetricsContext(),
      };

      const client = await Client.create(server.publicUrl, email, 'foo', options);
      expect(client).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-flow-begin-time']).toBe(
        String(options.metricsContext.flowBeginTime)
      );
      expect(emailData.headers['x-flow-id']).toBe(options.metricsContext.flowId);
    });

    it('account creation works with empty metricsContext metadata', async () => {
      const email = server.uniqueEmail();

      const client = await Client.create(server.publicUrl, email, 'foo', {
        ...testOptions,
        metricsContext: {},
      });
      expect(client).toBeTruthy();
    });

    it('account creation fails with missing flowBeginTime', async () => {
      const email = server.uniqueEmail();

      try {
        await Client.create(server.publicUrl, email, 'foo', {
          ...testOptions,
          metricsContext: {
            flowId:
              'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
          },
        });
        fail('account creation should have failed');
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });

    it('account creation fails with missing flowId', async () => {
      const email = server.uniqueEmail();

      try {
        await Client.create(server.publicUrl, email, 'foo', {
          ...testOptions,
          metricsContext: {
            flowBeginTime: Date.now(),
          },
        });
        fail('account creation should have failed');
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });

    it('create account for non-sync service, gets generic sign-up email', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.create(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      expect(client).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verify');

      const verifyCode = emailData.headers['x-verify-code'];
      await client.verifyEmail(verifyCode, { service: 'testpilot' });

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      expect(code).toBeTruthy();
    });

    it('create account for unspecified service does not get sync email', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.create(
        server.publicUrl,
        email,
        password,
        testOptions
      );
      expect(client).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verify');

      const verifyCode = emailData.headers['x-verify-code'];
      await client.verifyEmail(verifyCode, {});

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);

      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      expect(code).toBeTruthy();
    });

    it('create account and subscribe to newsletters', async () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';

      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        service: 'sync',
      });
      expect(client).toBeTruthy();

      let emailData = await server.mailbox.waitForEmail(email);
      const verifyCode = emailData.headers['x-verify-code'];

      await client.verifyEmail(verifyCode, {
        service: 'sync',
        newsletters: ['test-pilot'],
      });

      const status = await client.emailStatus();
      expect(status.verified).toBe(true);

      emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('postVerify');
    });

    if (version === 'V2') {
      it('maintains single kB value for account create with V1 & V2 credentials', async () => {
        const email = server.uniqueEmail();
        const password = 'F00BAR';

        const client = await Client.createAndVerify(
          server.publicUrl,
          email,
          password,
          server.mailbox,
          {
            ...testOptions,
            keys: true,
            service: 'sync',
          }
        );

        await client.getKeysV1();
        await client.getKeysV2();
        const originalKb = client.kB;
        const clientSalt = await client.getClientSalt();

        const login = async (loginEmail: string, loginPassword: string, loginVersion = '') => {
          return await Client.login(server.publicUrl, loginEmail, loginPassword, {
            ...testOptions,
            version: loginVersion,
            keys: true,
            service: 'sync',
          });
        };

        const clientV1 = await login(email, password, '');
        await clientV1.getKeysV1();
        const kB1 = clientV1.kB;

        const clientV2 = await login(email, password, 'V2');
        await clientV2.getKeysV2();
        const kB2 = clientV2.kB;

        expect(originalKb).toBeDefined();
        expect(
          clientSalt.startsWith('identity.mozilla.com/picl/v1/quickStretchV2:')
        ).toBe(true);
        expect(kB1).toBe(originalKb);
        expect(kB2).toBe(originalKb);
      });

      it('maintains single kB value after account password upgrade from V1 to V2', async () => {
        const email = server.uniqueEmail();
        const password = 'F00BAR';

        const client = await Client.createAndVerify(
          server.publicUrl,
          email,
          password,
          server.mailbox,
          {
            ...testOptions,
            keys: true,
            service: 'sync',
          }
        );

        await client.keys();
        const originalKb = client.getState().kB;
        await client.upgradeCredentials(password);

        const login = async (loginEmail: string, loginPassword: string, loginVersion = '') => {
          return await Client.login(server.publicUrl, loginEmail, loginPassword, {
            ...testOptions,
            version: loginVersion,
            keys: true,
            service: 'sync',
          });
        };

        const clientV1 = await login(email, password, '');
        await clientV1.getKeysV1();
        const kB1 = clientV1.kB;

        const clientV2 = await login(email, password, 'V2');
        await clientV2.getKeysV2();
        const kB2 = clientV2.kB;

        expect(originalKb).toBeDefined();
        expect(kB1).toBe(originalKb);
        expect(kB2).toBe(originalKb);
      });
    }
  }
);
