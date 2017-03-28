/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../../../..'

const assert = require('insist')
const config = require(`${ROOT_DIR}/config`).getProperties()
const crypto = require('crypto')
const error = require(`${ROOT_DIR}/lib/error`)
const mocks = require(`${ROOT_DIR}/test/mocks`)
const senders = require(`${ROOT_DIR}/lib/senders`)
const sinon = require('sinon')
const P = require('bluebird')

const nullLog = mocks.mockLog()

describe('lib/senders/index', () => {

  describe('email', () => {

    const UID = crypto.randomBytes(16)
    const EMAIL = crypto.randomBytes(16).toString('hex') + '@example.test'
    const EMAILS = [{
      email: EMAIL,
      isPrimary: true,
      isVerified: true
    }, {
      email: crypto.randomBytes(16).toString('hex') + '@example.test',
      isPrimary: false,
      isVerified: true
    }, {
      email: crypto.randomBytes(16).toString('hex') + '@example.test',
      isPrimary: false,
      isVerified: false
    }]
    const bounces = {
      check: sinon.spy(() => P.resolve([]))
    }
    const acct = {
      email: EMAIL,
      uid: UID
    }

    function createSender(config, bounces) {
      return senders(nullLog, config, error, bounces, {})
        .then(sndrs => {
          const email = sndrs.email
          email._ungatedMailer.mailer.sendMail = sinon.spy((opts, cb) => {
            cb(null, {})
          })
          return email
        })
    }

    beforeEach(() => {
      bounces.check.reset()
    })

    describe('.sendVerifyCode()', () => {
      const code = crypto.randomBytes(32)

      it('should call mailer.verifyEmail()', () => {
        let email
        return createSender(config, bounces)
          .then(e => {
            email = e
            email._ungatedMailer.verifyEmail = sinon.spy(() => P.resolve({}))
            return email.sendVerifyCode(EMAILS, acct, {code: code})
          })
          .then(() => {
            assert.equal(bounces.check.callCount, 1)
            assert.equal(email._ungatedMailer.verifyEmail.callCount, 1)

            const args = email._ungatedMailer.verifyEmail.getCall(0).args
            assert.equal(args[0].email, EMAIL, 'email correctly set')
          })
      })
    })

    describe('.sendVerifyLoginEmail()', () => {
      const code = crypto.randomBytes(32)

      it('should call mailer.verifyLoginEmail()', () => {
        let email
        return createSender(config, bounces)
          .then(e => {
            email = e
            email._ungatedMailer.verifyLoginEmail = sinon.spy(() => P.resolve({}))
            return email.sendVerifyLoginEmail(EMAILS, acct, {code: code})
          })
          .then(() => {
            assert.equal(bounces.check.callCount, 1)
            assert.equal(email._ungatedMailer.verifyLoginEmail.callCount, 1)

            const args = email._ungatedMailer.verifyLoginEmail.getCall(0).args
            assert.equal(args[0].email, EMAIL, 'email correctly set')
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set')
            assert.equal(args[0].ccEmails[0], EMAILS[1].email, 'cc email correctly set')
          })
      })
    })


    describe('.sendRecoveryCode()', () => {
      const token = {
        email: EMAIL,
        data: crypto.randomBytes(32)
      }
      const code = crypto.randomBytes(32)

      it('should call mailer.recoveryEmail()', () => {
        let email
        return createSender(config, bounces)
          .then(e => {
            email = e
            email._ungatedMailer.recoveryEmail = sinon.spy(() => P.resolve({}))
            return email.sendRecoveryCode(EMAILS, acct, {code: code, token: token})
          })
          .then(() => {
            assert.equal(bounces.check.callCount, 1)
            assert.equal(email._ungatedMailer.recoveryEmail.callCount, 1)

            const args = email._ungatedMailer.recoveryEmail.getCall(0).args
            assert.equal(args[0].email, EMAIL, 'email correctly set')
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set')
            assert.equal(args[0].ccEmails[0], EMAILS[1].email, 'cc email correctly set')
          })
      })
    })

    describe('.sendPasswordChangedNotification()', () => {
      it('should call mailer.passwordChangedEmail()', () => {
        let email
        return createSender(config, bounces)
          .then(e => {
            email = e
            email._ungatedMailer.passwordChangedEmail = sinon.spy(() => P.resolve({}))
            return email.sendPasswordChangedNotification(EMAILS, acct, {})
          })
          .then(() => {
            assert.equal(email._ungatedMailer.passwordChangedEmail.callCount, 1)

            const args = email._ungatedMailer.passwordChangedEmail.getCall(0).args
            assert.equal(args[0].email, EMAIL, 'email correctly set')
            assert.equal(args[0].ccEmails.length, 2, 'email correctly set')
            assert.equal(args[0].ccEmails[0], EMAILS[1].email, 'cc email correctly set')
            assert.equal(args[0].ccEmails[1], EMAILS[2].email, 'cc email correctly set')

            assert.equal(bounces.check.callCount, 1)
          })
      })
    })

    describe('.sendPasswordResetNotification()', () => {
      it('should call mailer.passwordResetEmail()', () => {
        let email
        return createSender(config, bounces)
          .then(e => {
            email = e
            email._ungatedMailer.passwordResetEmail = sinon.spy(() => P.resolve({}))
            return email.sendPasswordResetNotification(EMAILS, acct, {})
          })
          .then(() => {
            assert.equal(email._ungatedMailer.passwordResetEmail.callCount, 1)

            const args = email._ungatedMailer.passwordResetEmail.getCall(0).args
            assert.equal(args[0].email, EMAIL, 'email correctly set')
            assert.equal(args[0].ccEmails.length, 2, 'email correctly set')
            assert.equal(args[0].ccEmails[0], EMAILS[1].email, 'cc email correctly set')
            assert.equal(args[0].ccEmails[1], EMAILS[2].email, 'cc email correctly set')

            assert.equal(bounces.check.callCount, 1)
          })
      })
    })

    describe('.sendNewDeviceLoginNotification()', () => {
      it('should call mailer.newDeviceLoginEmail()', () => {
        let email
        return createSender(config, bounces)
          .then(e => {
            email = e
            email._ungatedMailer.newDeviceLoginEmail = sinon.spy(() => P.resolve({}))
            return email.sendNewDeviceLoginNotification(EMAILS, acct, {})
          })
          .then(() => {
            assert.equal(email._ungatedMailer.newDeviceLoginEmail.callCount, 1)

            const args = email._ungatedMailer.newDeviceLoginEmail.getCall(0).args
            assert.equal(args[0].email, EMAIL, 'email correctly set')
            assert.equal(args[0].ccEmails.length, 2, 'email correctly set')
            assert.equal(args[0].ccEmails[0], EMAILS[1].email, 'cc email correctly set')
            assert.equal(args[0].ccEmails[1], EMAILS[2].email, 'cc email correctly set')

            assert.equal(bounces.check.callCount, 1)
          })
      })
    })

    describe('.sendPostVerifyEmail()', () => {
      it('should call mailer.postVerifyEmail()', () => {
        let email
        return createSender(config, bounces)
          .then(e => {
            email = e
            email._ungatedMailer.postVerifyEmail = sinon.spy(() => P.resolve({}))
            return email.sendPostVerifyEmail(EMAILS, acct, {})
          })
          .then(() => {
            assert.equal(email._ungatedMailer.postVerifyEmail.callCount, 1)

            const args = email._ungatedMailer.postVerifyEmail.getCall(0).args
            assert.equal(args[0].email, EMAIL, 'email correctly set')
            assert.equal(args[0].ccEmails, undefined, 'no cc emails set')

            assert.equal(bounces.check.callCount, 1)
          })
      })
    })

    describe('.sendUnblockCode()', () => {
      const code = crypto.randomBytes(8).toString('hex')

      it('should call mailer.unblockCodeEmail()', () => {
        let email
        return createSender(config, bounces)
          .then(e => {
            email = e
            email._ungatedMailer.unblockCodeEmail = sinon.spy(() => P.resolve({}))
            return email.sendUnblockCode(EMAILS, acct, {code: code})
          })
          .then(() => {
            assert.equal(email._ungatedMailer.unblockCodeEmail.callCount, 1)

            const args = email._ungatedMailer.unblockCodeEmail.getCall(0).args
            assert.equal(args[0].email, EMAIL, 'email correctly set')
            assert.equal(args[0].ccEmails.length, 1, 'email correctly set')
            assert.equal(args[0].ccEmails[0], EMAILS[1].email, 'cc email correctly set')

            assert.equal(bounces.check.callCount, 1)
          })
      })
    })

    describe('gated on bounces', () => {
      const code = crypto.randomBytes(8).toString('hex')

      it('errors if bounce check fails', () => {
        const errorBounces =  {
          check: sinon.spy(() => P.reject(error.emailComplaint()))
        }
        return createSender(config, errorBounces)
          .then(email => {
            email._ungatedMailer.unblockCodeEmail = sinon.spy(() => P.resolve({}))
            return email.sendUnblockCode(EMAILS, acct, {code: code})
          })
          .catch(e => {
            assert.equal(errorBounces.check.callCount, 1)
            assert.equal(e.errno, error.ERRNO.BOUNCE_COMPLAINT)
          })
      })
    })
  })
})
