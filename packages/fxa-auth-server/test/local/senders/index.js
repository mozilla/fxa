/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const config = require(`${ROOT_DIR}/config`).getProperties();
const crypto = require('crypto');
const error = require(`${ROOT_DIR}/lib/error`);
const mocks = require(`${ROOT_DIR}/test/mocks`);
const senders = require(`${ROOT_DIR}/lib/senders`);
const sinon = require('sinon');
const P = require('bluebird');

const nullLog = mocks.mockLog();

describe('lib/senders/index', () => {
  describe('email', () => {
    const UID = crypto.randomBytes(16);
    const EMAIL = `${crypto.randomBytes(16).toString('hex')}@example.test`;
    const EMAILS = [
      {
        email: EMAIL,
        isPrimary: true,
        isVerified: true,
      },
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
    const acct = {
      email: EMAIL,
      uid: UID,
    };

    function createSender(config, log) {
      return senders(
        log || nullLog,
        Object.assign({}, config, {
          sms: {
            enableBudgetChecks: false,
          },
        }),
        error,
        {}
      ).then(sndrs => {
        const email = sndrs.email;
        email._ungatedMailer.mailer.sendMail = sinon.spy((opts, cb) => {
          cb(null, {});
        });
        return email;
      });
    }

    describe('.sendVerifyEmail()', () => {
      const code = crypto.randomBytes(32);

      it('should call mailer.verifyEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.verifyEmail = sinon.spy(() => P.resolve({}));
            return email.sendVerifyEmail(EMAILS, acct, { code: code });
          })
          .then(() => {
            assert.equal(email._ungatedMailer.verifyEmail.callCount, 1);

            const args = email._ungatedMailer.verifyEmail.getCall(0).args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
          });
      });
    });

    describe('.sendVerifyLoginEmail()', () => {
      const code = crypto.randomBytes(32);

      it('should call mailer.verifyLoginEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.verifyLoginEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendVerifyLoginEmail(EMAILS, acct, { code: code });
          })
          .then(() => {
            assert.equal(email._ungatedMailer.verifyLoginEmail.callCount, 1);

            const args = email._ungatedMailer.verifyLoginEmail.getCall(0).args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set');
            assert.equal(
              args[0].ccEmails[0],
              EMAILS[1].email,
              'cc email correctly set'
            );
          });
      });
    });

    describe('.sendRecoveryEmail()', () => {
      const token = {
        email: EMAIL,
        data: crypto.randomBytes(32),
      };
      const code = crypto.randomBytes(32);

      it('should call mailer.recoveryEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.recoveryEmail = sinon.spy(() => P.resolve({}));
            return email.sendRecoveryEmail(EMAILS, acct, {
              code: code,
              token: token,
            });
          })
          .then(() => {
            assert.equal(email._ungatedMailer.recoveryEmail.callCount, 1);

            const args = email._ungatedMailer.recoveryEmail.getCall(0).args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set');
            assert.equal(
              args[0].ccEmails[0],
              EMAILS[1].email,
              'cc email correctly set'
            );
          });
      });
    });

    describe('.sendPasswordChangedEmail()', () => {
      it('should call mailer.passwordChangedEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.passwordChangedEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendPasswordChangedEmail(EMAILS, acct, {});
          })
          .then(() => {
            assert.equal(
              email._ungatedMailer.passwordChangedEmail.callCount,
              1
            );

            const args = email._ungatedMailer.passwordChangedEmail.getCall(0)
              .args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set');
            assert.equal(
              args[0].ccEmails[0],
              EMAILS[1].email,
              'cc email correctly set'
            );
          });
      });
    });

    describe('.sendPasswordResetEmail()', () => {
      it('should call mailer.passwordResetEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.passwordResetEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendPasswordResetEmail(EMAILS, acct, {});
          })
          .then(() => {
            assert.equal(email._ungatedMailer.passwordResetEmail.callCount, 1);

            const args = email._ungatedMailer.passwordResetEmail.getCall(0)
              .args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set');
            assert.equal(
              args[0].ccEmails[0],
              EMAILS[1].email,
              'cc email correctly set'
            );
          });
      });
    });

    describe('.sendNewDeviceLoginEmail()', () => {
      it('should call mailer.newDeviceLoginEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.newDeviceLoginEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendNewDeviceLoginEmail(EMAILS, acct, {});
          })
          .then(() => {
            assert.equal(email._ungatedMailer.newDeviceLoginEmail.callCount, 1);

            const args = email._ungatedMailer.newDeviceLoginEmail.getCall(0)
              .args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set');
            assert.equal(
              args[0].ccEmails[0],
              EMAILS[1].email,
              'cc email correctly set'
            );
          });
      });
    });

    describe('.sendPostVerifyEmail()', () => {
      it('should call mailer.postVerifyEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.postVerifyEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendPostVerifyEmail(EMAILS, acct, {});
          })
          .then(() => {
            assert.equal(email._ungatedMailer.postVerifyEmail.callCount, 1);

            const args = email._ungatedMailer.postVerifyEmail.getCall(0).args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.lengthOf(args[0].ccEmails, 1);
          });
      });
    });

    describe('.sendUnblockCodeEmail()', () => {
      const code = crypto.randomBytes(8).toString('hex');

      it('should call mailer.unblockCodeEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.unblockCodeEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendUnblockCodeEmail(EMAILS, acct, { code: code });
          })
          .then(() => {
            assert.equal(email._ungatedMailer.unblockCodeEmail.callCount, 1);

            const args = email._ungatedMailer.unblockCodeEmail.getCall(0).args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set');
            assert.equal(
              args[0].ccEmails[0],
              EMAILS[1].email,
              'cc email correctly set'
            );
          });
      });
    });

    describe('.sendPostAddTwoStepAuthenticationEmail()', () => {
      it('should call mailer.postAddTwoStepAuthenticationEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.postAddTwoStepAuthenticationEmail = sinon.spy(
              () => P.resolve({})
            );
            return email.sendPostAddTwoStepAuthenticationEmail(
              EMAILS,
              acct,
              {}
            );
          })
          .then(() => {
            assert.equal(
              email._ungatedMailer.postAddTwoStepAuthenticationEmail.callCount,
              1
            );

            const args = email._ungatedMailer.postAddTwoStepAuthenticationEmail.getCall(
              0
            ).args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set');
            assert.equal(
              args[0].ccEmails[0],
              EMAILS[1].email,
              'cc email correctly set'
            );
          });
      });
    });

    describe('.sendPostRemoveTwoStepAuthenticationEmail()', () => {
      it('should call mailer.postRemoveTwoStepAuthenticationEmail()', () => {
        let email;
        return createSender(config)
          .then(e => {
            email = e;
            email._ungatedMailer.postRemoveTwoStepAuthenticationEmail = sinon.spy(
              () => P.resolve({})
            );
            return email.sendPostRemoveTwoStepAuthenticationEmail(
              EMAILS,
              acct,
              {}
            );
          })
          .then(() => {
            assert.equal(
              email._ungatedMailer.postRemoveTwoStepAuthenticationEmail
                .callCount,
              1
            );

            const args = email._ungatedMailer.postRemoveTwoStepAuthenticationEmail.getCall(
              0
            ).args;
            assert.equal(args[0].email, EMAIL, 'email correctly set');
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set');
            assert.equal(
              args[0].ccEmails[0],
              EMAILS[1].email,
              'cc email correctly set'
            );
          });
      });
    });

    describe('sendDownloadSubscriptionEmail:', () => {
      it('called mailer.downloadSubscriptionEmail', async () => {
        const mailer = await createSender(config);
        mailer._ungatedMailer.downloadSubscriptionEmail = sinon.spy(() =>
          P.resolve({})
        );
        await mailer.sendDownloadSubscriptionEmail(EMAILS, acct, {
          acceptLanguage: 'wibble',
          productId: 'blee',
        });

        assert.equal(
          mailer._ungatedMailer.downloadSubscriptionEmail.callCount,
          1
        );
        const args = mailer._ungatedMailer.downloadSubscriptionEmail.args[0];
        assert.lengthOf(args, 1);
        assert.deepEqual(args[0], {
          acceptLanguage: 'wibble',
          ccEmails: EMAILS.slice(1, 2).map(e => e.email),
          email: EMAIL,
          productId: 'blee',
          uid: UID,
        });
      });
    });
  });
});
