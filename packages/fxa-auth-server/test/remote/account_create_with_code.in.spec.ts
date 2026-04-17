/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import net from 'net';
import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import { MAIL_HELPER_ENV_FILE } from '../support/jest-global-setup';
import * as otplib from 'otplib';

function tcpProbe(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = net.createConnection({ host, port }, () => {
      sock.destroy();
      resolve(true);
    });
    sock.on('error', () => resolve(false));
    sock.setTimeout(2000, () => {
      sock.destroy();
      resolve(false);
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  console.log(
    '[test:env] MAIL_HELPER_ENV_FILE exists:',
    fs.existsSync(MAIL_HELPER_ENV_FILE)
  );
  if (fs.existsSync(MAIL_HELPER_ENV_FILE)) {
    console.log(
      '[test:env] MAIL_HELPER_ENV_FILE contents:',
      fs.readFileSync(MAIL_HELPER_ENV_FILE, 'utf-8')
    );
  }
  console.log('[test:env] process.env.MAILER_HOST:', process.env.MAILER_HOST);
  console.log('[test:env] process.env.MAILER_PORT:', process.env.MAILER_PORT);
  console.log('[test:env] process.env.SMTP_PORT:', process.env.SMTP_PORT);

  server = await getSharedTestServer();

  console.log('[test:env] server.publicUrl:', server.publicUrl);
  const smtpCfg = (server.config as any).smtp;
  console.log(
    '[test:env] server.config.smtp (outgoing):',
    JSON.stringify({
      host: smtpCfg?.host,
      port: smtpCfg?.port,
      api: smtpCfg?.api,
    })
  );

  // Verify mail_helper SMTP and API ports are actually accepting connections
  const smtpHost = process.env.SMTP_HOST || '127.0.0.1';
  const smtpPort = Number(process.env.SMTP_PORT || 39101);
  const apiHost = process.env.MAILER_HOST || '127.0.0.1';
  const apiPort = Number(process.env.MAILER_PORT || 39001);
  const smtpOpen = await tcpProbe(smtpHost, smtpPort);
  const apiOpen = await tcpProbe(apiHost, apiPort);
  console.log(
    `[test:env] mail_helper SMTP ${smtpHost}:${smtpPort} open:`,
    smtpOpen
  );
  console.log(
    `[test:env] mail_helper API  ${apiHost}:${apiPort} open:`,
    apiOpen
  );
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote account create with sign-up code',
  ({ version, tag }) => {
    const testOptions = { version };
    const password = '4L6prUdlLNfxGIoj';

    it('create and verify sync account', async () => {
      const email = server.uniqueEmail();
      console.log('[test] server.publicUrl:', server.publicUrl);
      console.log('[test] calling Client.create...');
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        service: 'sync',
        verificationMethod: 'email-otp',
      });
      console.log('[test] Client.create done, authAt:', client.authAt);
      expect(client.authAt).toBeTruthy();

      console.log('[test] calling emailStatus...');
      let emailStatus = await client.emailStatus();
      console.log('[test] emailStatus:', emailStatus);
      expect(emailStatus.verified).toBe(false);

      console.log('[test] waiting for email...');
      // Give the auth server a moment to deliver the email via SMTP, then
      // snapshot what the mail_helper has stored before the long-poll starts.
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const snap = await fetch(
          `http://127.0.0.1:${process.env.MAILER_PORT || '39001'}/mail`
        );
        console.log(
          '[test] mail_helper stored keys after 1.5s:',
          await snap.json()
        );
      } catch (e: any) {
        console.log('[test] mail_helper /mail snapshot failed:', e.message);
      }
      let emailData = await server.mailbox.waitForEmail(email);
      console.log(
        '[test] got email, template:',
        emailData.headers['x-template-name']
      );
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      console.log('[test] calling verifyShortCodeEmail...');
      await client.verifyShortCodeEmail(
        emailData.headers['x-verify-short-code'],
        { service: 'sync' }
      );
      console.log('[test] verifyShortCodeEmail done');

      console.log('[test] waiting for second email...');
      emailData = await server.mailbox.waitForEmail(email);
      console.log('[test] got second email');
      expect(emailData.headers['x-link']).toContain(
        (server.config as any).smtp.syncUrl
      );

      emailStatus = await client.emailStatus();
      expect(emailStatus.verified).toBe(true);
      console.log('[test] done');
    });

    it('create and verify account', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });
      expect(client.authAt).toBeTruthy();

      let emailStatus = await client.emailStatus();
      expect(emailStatus.verified).toBe(false);

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.verifyShortCodeEmail(
        emailData.headers['x-verify-short-code']
      );

      emailStatus = await client.emailStatus();
      expect(emailStatus.verified).toBe(true);

      // It's hard to test for "an email didn't arrive".
      // Instead trigger sending of another email and test
      // that there wasn't anything in the queue before it.
      await client.forgotPassword();
      const code = await server.mailbox.waitForCode(email);
      expect(code).toBeTruthy();
    });

    it('throws for expired code', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });
      expect(client.authAt).toBeTruthy();

      let emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.requestVerifyEmail();
      emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verify');

      const secret = emailData.headers['x-verify-code'];
      const futureAuthenticator = new otplib.authenticator.Authenticator();
      futureAuthenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        (server.config as any).otp,
        { secret, epoch: Date.now() / 1000 - 60 * 60 } // Code 60mins old
      );
      const expiredCode = futureAuthenticator.generate();

      await expect(
        client.verifyShortCodeEmail(expiredCode)
      ).rejects.toMatchObject({ code: 400, errno: 183 });
    });

    it('throws for invalid code', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });
      expect(client.authAt).toBeTruthy();

      const emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      const invalidCode = String(
        Number(emailData.headers['x-verify-short-code']) + 1
      );

      await expect(
        client.verifyShortCodeEmail(invalidCode)
      ).rejects.toMatchObject({ code: 400, errno: 183 });
    });

    it('create and resend authentication code', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });

      let emailData = await server.mailbox.waitForEmail(email);
      const originalMessageId = emailData['messageId'];
      const originalCode = emailData.headers['x-verify-short-code'];

      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.resendVerifyShortCodeEmail();

      emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');
      expect(emailData['messageId']).not.toBe(originalMessageId);
      expect(emailData.headers['x-verify-short-code']).toBe(originalCode);
    });

    it('should verify code from previous code window', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });

      let emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.requestVerifyEmail();
      emailData = await server.mailbox.waitForEmail(email);

      // Each code window is 10 minutes
      const secret = emailData.headers['x-verify-code'];
      const futureAuthenticator = new otplib.authenticator.Authenticator();
      futureAuthenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        (server.config as any).otp,
        { secret, epoch: Date.now() / 1000 - 60 * 10 } // Code 10mins old
      );

      const previousWindowCode = futureAuthenticator.generate(secret);
      const response = await client.verifyShortCodeEmail(previousWindowCode);
      expect(response).toBeTruthy();
    });

    it('should not verify code from future code window', async () => {
      const email = server.uniqueEmail();
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        verificationMethod: 'email-otp',
      });

      let emailData = await server.mailbox.waitForEmail(email);
      expect(emailData.headers['x-template-name']).toBe('verifyShortCode');

      await client.requestVerifyEmail();
      emailData = await server.mailbox.waitForEmail(email);

      // Each code window is 10 minutes
      const secret = emailData.headers['x-verify-code'];
      const futureAuthenticator = new otplib.authenticator.Authenticator();
      futureAuthenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        (server.config as any).otp,
        { secret, epoch: Date.now() / 1000 + 60 * 30 } // Code 30mins in future
      );

      const futureWindowCode = futureAuthenticator.generate(secret);

      await expect(
        client.verifyShortCodeEmail(futureWindowCode)
      ).rejects.toMatchObject({ code: 400, errno: 183 });
    });
  }
);
