/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { Container } from 'typedi';

const config = require('../../config').default.getProperties();
const mocks = require('../../test/mocks');
const senders = require('./index');
const {
  ProductConfigurationManager,
} = require('../../../../libs/shared/cms/src');

const nullLog = mocks.mockLog();

describe('lib/senders/index', () => {
  afterEach(() => {
    Container.reset();
  });

  describe('email', () => {
    const UID = crypto.randomBytes(16);
    const EMAIL = `${crypto.randomBytes(16).toString('hex')}@example.test`;
    const EMAILS = [
      { email: EMAIL, isPrimary: true, isVerified: true },
      {
        email: `${crypto.randomBytes(16).toString('hex')}@example.test`,
        isPrimary: false,
        isVerified: true,
      },
      {
        email: `${crypto.randomBytes(16).toString('hex')}@example.test`,
        isPrimary: false,
        isVerified: false,
      },
    ];
    const acct = { email: EMAIL, uid: UID, metricsOptOutAt: null };

    function createSender(cfg: any, log?: any) {
      return senders(
        log || nullLog,
        Object.assign({}, cfg, {}),
        { check: jest.fn().mockResolvedValue(null) },
        {}
      ).then((sndrs: any) => {
        const email = sndrs.email;
        email._ungatedMailer.mailer.sendMail = jest.fn((_opts: any, cb: any) =>
          cb(null, {})
        );
        return email;
      });
    }

    describe('.sendVerifyEmail()', () => {
      const code = crypto.randomBytes(32);

      it('should call mailer.verifyEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.verifyEmail = jest.fn(() => Promise.resolve({}));
        await email.sendVerifyEmail(EMAILS, acct, { code });

        expect(email._ungatedMailer.verifyEmail).toHaveBeenCalledTimes(1);
        const args = email._ungatedMailer.verifyEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
      });
    });

    describe('.sendVerifyLoginEmail()', () => {
      const code = crypto.randomBytes(32);

      it('should call mailer.verifyLoginEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.verifyLoginEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await email.sendVerifyLoginEmail(EMAILS, acct, { code });

        expect(email._ungatedMailer.verifyLoginEmail).toHaveBeenCalledTimes(1);
        const args = email._ungatedMailer.verifyLoginEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('.sendRecoveryEmail()', () => {
      const token = { email: EMAIL, data: crypto.randomBytes(32) };
      const code = crypto.randomBytes(32);

      it('should call mailer.recoveryEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.recoveryEmail = jest.fn(() => Promise.resolve({}));
        await email.sendRecoveryEmail(EMAILS, acct, { code, token });

        expect(email._ungatedMailer.recoveryEmail).toHaveBeenCalledTimes(1);
        const args = email._ungatedMailer.recoveryEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('.sendPasswordChangedEmail()', () => {
      it('should call mailer.passwordChangedEmail()', async () => {
        const acctMetricsOptOut = {
          ...acct,
          metricsOptOutAt: 1642801160000,
        };
        const email = await createSender(config);
        email._ungatedMailer.passwordChangedEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await email.sendPasswordChangedEmail(EMAILS, acctMetricsOptOut, {});

        expect(
          email._ungatedMailer.passwordChangedEmail.mock.calls.length
        ).toBe(1);
        const args = email._ungatedMailer.passwordChangedEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(false);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('.sendPasswordResetEmail()', () => {
      it('should call mailer.passwordResetEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.passwordResetEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await email.sendPasswordResetEmail(EMAILS, acct, {});

        expect(email._ungatedMailer.passwordResetEmail).toHaveBeenCalledTimes(
          1
        );
        const args = email._ungatedMailer.passwordResetEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('.sendPostAddLinkedAccountEmail()', () => {
      it('should call mailer.postAddLinkedAccountEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.postAddLinkedAccountEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await email.sendPostAddLinkedAccountEmail(EMAILS, acct, {});

        expect(
          email._ungatedMailer.postAddLinkedAccountEmail.mock.calls.length
        ).toBe(1);
        const args =
          email._ungatedMailer.postAddLinkedAccountEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('.sendNewDeviceLoginEmail()', () => {
      it('should call mailer.newDeviceLoginEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.newDeviceLoginEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await email.sendNewDeviceLoginEmail(EMAILS, acct, {});

        expect(email._ungatedMailer.newDeviceLoginEmail).toHaveBeenCalledTimes(
          1
        );
        const args = email._ungatedMailer.newDeviceLoginEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('.sendPostVerifyEmail()', () => {
      it('should call mailer.postVerifyEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.postVerifyEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await email.sendPostVerifyEmail(EMAILS, acct, {});

        expect(email._ungatedMailer.postVerifyEmail).toHaveBeenCalledTimes(1);
        const args = email._ungatedMailer.postVerifyEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
        expect(args[0].ccEmails).toHaveLength(1);
      });
    });

    describe('.sendUnblockCodeEmail()', () => {
      const code = crypto.randomBytes(8).toString('hex');

      it('should call mailer.unblockCodeEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.unblockCodeEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await email.sendUnblockCodeEmail(EMAILS, acct, { code });

        expect(email._ungatedMailer.unblockCodeEmail).toHaveBeenCalledTimes(1);
        const args = email._ungatedMailer.unblockCodeEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('.sendPostAddTwoStepAuthenticationEmail()', () => {
      it('should call mailer.postAddTwoStepAuthenticationEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.postAddTwoStepAuthenticationEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await email.sendPostAddTwoStepAuthenticationEmail(EMAILS, acct, {});

        expect(
          email._ungatedMailer.postAddTwoStepAuthenticationEmail.mock.calls
            .length
        ).toBe(1);
        const args =
          email._ungatedMailer.postAddTwoStepAuthenticationEmail.mock.calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('.sendPostRemoveTwoStepAuthenticationEmail()', () => {
      it('should call mailer.postRemoveTwoStepAuthenticationEmail()', async () => {
        const email = await createSender(config);
        email._ungatedMailer.postRemoveTwoStepAuthenticationEmail = jest.fn(
          () => Promise.resolve({})
        );
        await email.sendPostRemoveTwoStepAuthenticationEmail(EMAILS, acct, {});

        expect(
          email._ungatedMailer.postRemoveTwoStepAuthenticationEmail.mock.calls
            .length
        ).toBe(1);
        const args =
          email._ungatedMailer.postRemoveTwoStepAuthenticationEmail.mock
            .calls[0];
        expect(args[0].email).toBe(EMAIL);
        expect(args[0].metricsEnabled).toBe(true);
        expect(args[0].ccEmails).toHaveLength(1);
        expect(args[0].ccEmails[0]).toBe(EMAILS[1].email);
      });
    });

    describe('sendDownloadSubscriptionEmail:', () => {
      it('called mailer.downloadSubscriptionEmail', async () => {
        const mailer = await createSender(config);
        mailer._ungatedMailer.downloadSubscriptionEmail = jest.fn(() =>
          Promise.resolve({})
        );
        await mailer.sendDownloadSubscriptionEmail(EMAILS, acct, {
          acceptLanguage: 'wibble',
          productId: 'blee',
        });

        expect(
          mailer._ungatedMailer.downloadSubscriptionEmail.mock.calls.length
        ).toBe(1);
        const args =
          mailer._ungatedMailer.downloadSubscriptionEmail.mock.calls[0];
        expect(args).toHaveLength(1);
        expect(args[0]).toEqual({
          acceptLanguage: 'wibble',
          ccEmails: EMAILS.slice(1, 2).map((e: any) => e.email),
          email: EMAIL,
          productId: 'blee',
          metricsEnabled: true,
          uid: UID,
        });
      });
    });

    describe('subscriptionAccountReminder Emails', () => {
      it('should send an email if the account is unverified', async () => {
        Container.set(
          ProductConfigurationManager,
          mocks.mockProductConfigurationManager()
        );
        const mailer = await createSender(config);
        await mailer.sendSubscriptionAccountReminderFirstEmail(EMAILS, acct, {
          email: 'test@test.com',
          uid: '123',
          planId: '456',
          acceptLanguage: 'en-US',
          productId: 'abc',
          productName: 'testProduct',
          token: 'token',
          flowId: '456',
          lowBeginTime: 123,
          deviceId: 'xyz',
          accountVerified: false,
        });

        expect(mailer._ungatedMailer.mailer.sendMail).toHaveBeenCalledTimes(1);
      });

      it('should not send an email if the account is verified', async () => {
        Container.set(
          ProductConfigurationManager,
          mocks.mockProductConfigurationManager()
        );
        const mailer = await createSender(config);
        await mailer.sendSubscriptionAccountReminderFirstEmail(EMAILS, acct, {
          email: 'test@test.com',
          uid: '123',
          planId: '456',
          acceptLanguage: 'en-US',
          productId: 'abc',
          productName: 'testProduct',
          token: 'token',
          flowId: '456',
          lowBeginTime: 123,
          deviceId: 'xyz',
          accountVerified: true,
        });

        expect(mailer._ungatedMailer.mailer.sendMail).toHaveBeenCalledTimes(0);
      });
    });
  });
});
