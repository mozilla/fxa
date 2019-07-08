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
    const bounces = {
      check: sinon.spy(() => P.resolve([])),
    };
    const acct = {
      email: EMAIL,
      uid: UID,
    };

    function createSender(config, bounces, log) {
      return senders(
        log || nullLog,
        Object.assign({}, config, {
          sms: {
            enableBudgetChecks: false,
          },
        }),
        error,
        bounces,
        {}
      ).then(sndrs => {
        const email = sndrs.email;
        email._ungatedMailer.mailer.sendMail = sinon.spy((opts, cb) => {
          cb(null, {});
        });
        return email;
      });
    }

    beforeEach(() => {
      bounces.check.resetHistory();
    });

    describe('.sendVerifyCode()', () => {
      const code = crypto.randomBytes(32);

      it('should call mailer.verifyEmail()', () => {
        let email;
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.verifyEmail = sinon.spy(() => P.resolve({}));
            return email.sendVerifyCode(EMAILS, acct, { code: code });
          })
          .then(() => {
            assert.equal(bounces.check.callCount, 1);
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
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.verifyLoginEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendVerifyLoginEmail(EMAILS, acct, { code: code });
          })
          .then(() => {
            assert.equal(bounces.check.callCount, 2);
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

    describe('.sendRecoveryCode()', () => {
      const token = {
        email: EMAIL,
        data: crypto.randomBytes(32),
      };
      const code = crypto.randomBytes(32);

      it('should call mailer.recoveryEmail()', () => {
        let email;
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.recoveryEmail = sinon.spy(() => P.resolve({}));
            return email.sendRecoveryCode(EMAILS, acct, {
              code: code,
              token: token,
            });
          })
          .then(() => {
            assert.equal(bounces.check.callCount, 2);
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

    describe('.sendPasswordChangedNotification()', () => {
      it('should call mailer.passwordChangedEmail()', () => {
        let email;
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.passwordChangedEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendPasswordChangedNotification(EMAILS, acct, {});
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
            assert.equal(bounces.check.callCount, 2);
          });
      });
    });

    describe('.sendPasswordResetNotification()', () => {
      it('should call mailer.passwordResetEmail()', () => {
        let email;
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.passwordResetEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendPasswordResetNotification(EMAILS, acct, {});
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
            assert.equal(bounces.check.callCount, 2);
          });
      });
    });

    describe('.sendNewDeviceLoginNotification()', () => {
      it('should call mailer.newDeviceLoginEmail()', () => {
        let email;
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.newDeviceLoginEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendNewDeviceLoginNotification(EMAILS, acct, {});
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
            assert.equal(bounces.check.callCount, 2);
          });
      });
    });

    describe('.sendPostVerifyEmail()', () => {
      it('should call mailer.postVerifyEmail()', () => {
        let email;
        return createSender(config, bounces)
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
            assert.equal(args[0].ccEmails, undefined, 'no cc emails set');
            assert.equal(bounces.check.callCount, 1);
          });
      });
    });

    describe('.sendUnblockCode()', () => {
      const code = crypto.randomBytes(8).toString('hex');

      it('should call mailer.unblockCodeEmail()', () => {
        let email;
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.unblockCodeEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendUnblockCode(EMAILS, acct, { code: code });
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

            assert.equal(bounces.check.callCount, 2);
          });
      });
    });

    describe('.sendPostAddTwoStepAuthNotification()', () => {
      it('should call mailer.sendPostAddTwoStepAuthNotification()', () => {
        let email;
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.postAddTwoStepAuthenticationEmail = sinon.spy(
              () => P.resolve({})
            );
            return email.sendPostAddTwoStepAuthNotification(EMAILS, acct, {});
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

            assert.equal(bounces.check.callCount, 2);
          });
      });
    });

    describe('.sendPostRemoveTwoStepAuthNotification()', () => {
      it('should call mailer.sendPostRemoveTwoStepAuthNotification()', () => {
        let email;
        return createSender(config, bounces)
          .then(e => {
            email = e;
            email._ungatedMailer.postRemoveTwoStepAuthenticationEmail = sinon.spy(
              () => P.resolve({})
            );
            return email.sendPostRemoveTwoStepAuthNotification(
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

            assert.equal(bounces.check.callCount, 2);
          });
      });
    });

    describe('gated on bounces', () => {
      const code = crypto.randomBytes(8).toString('hex');

      it('errors if bounce check fails', () => {
        const log = mocks.mockLog();
        const DATE = Date.now() - 10000;
        const errorBounces = {
          check: sinon.spy(() => P.reject(error.emailComplaint(DATE))),
        };
        return createSender(config, errorBounces, log)
          .then(email => {
            email._ungatedMailer.unblockCodeEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendUnblockCode(EMAILS, acct, { code: code });
          })
          .then(
            () => {
              assert.fail('should have blocked the send');
            },
            e => {
              assert.equal(errorBounces.check.callCount, 2);
              assert.equal(e.errno, error.ERRNO.BOUNCE_COMPLAINT);

              assert.isAtLeast(log.info.callCount, 3);
              const msg = log.info.args[2];
              assert.equal(msg[0], 'mailer.blocked');
              assert.equal(msg[1].errno, e.errno);
              assert.equal(msg[1].bouncedAt, DATE);
            }
          );
      });

      it('on gated primary email + verified secondary, sends to secondary', () => {
        const log = mocks.mockLog();
        const DATE = Date.now() - 10000;
        let email;
        const errorBounces = {
          check: sinon.spy(email => {
            if (email === EMAIL) {
              return P.reject(error.emailComplaint(DATE));
            }
            return P.resolve({});
          }),
        };
        return createSender(config, errorBounces, log)
          .then(e => {
            email = e;
            email._ungatedMailer.unblockCodeEmail = sinon.spy(() =>
              P.resolve({})
            );
            return email.sendUnblockCode(EMAILS, acct, { code: code });
          })
          .then(() => {
            const args = email._ungatedMailer.unblockCodeEmail.getCall(0).args;
            assert.equal(args[0].email, EMAILS[1].email, 'email correctly set');
            assert.equal(
              args[0].ccEmails.length,
              0,
              'email does not appear twice'
            );
            assert.equal(errorBounces.check.callCount, 2);
          });
      });

      it('on gated primary email + unverified secondary, blocks the send', () => {
        const log = mocks.mockLog();
        const DATE = Date.now() - 10000;
        let email;
        const errorBounces = {
          check: sinon.spy(email => {
            if (email === EMAIL) {
              return P.reject(error.emailComplaint(DATE));
            }
            return P.resolve({});
          }),
        };
        return createSender(config, errorBounces, log)
          .then(e => {
            email = e;
            email._ungatedMailer.unblockCodeEmail = sinon.spy(() =>
              P.resolve({})
            );
            EMAILS[1].isVerified = false;
            return email.sendUnblockCode(EMAILS, acct, { code: code });
          })
          .then(
            () => {
              assert.fail('should have blocked the send');
            },
            e => {
              assert.equal(errorBounces.check.callCount, 1);
              assert.equal(e.errno, error.ERRNO.BOUNCE_COMPLAINT);

              assert.isAtLeast(log.info.callCount, 3);
              const msg = log.info.args[2];
              assert.equal(msg[0], 'mailer.blocked');
              assert.equal(msg[1].errno, e.errno);
              assert.equal(msg[1].bouncedAt, DATE);
            }
          )
          .finally(() => {
            EMAILS[1].isVerified = true;
          });
      });
    });
  });
});
