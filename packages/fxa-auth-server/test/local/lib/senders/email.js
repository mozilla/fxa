/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../../../..'

const assert = require('insist')
var extend = require('util')._extend
var sinon = require('sinon')
var P = require('bluebird')

var nullLog = {
  trace: function () {},
  info: function () {},
  error: function () {}
}

var config = require(`${ROOT_DIR}/mailer/config`)
var Mailer = require(`${ROOT_DIR}/lib/senders/email`)(nullLog)

var messageTypes = [
  'newDeviceLoginEmail',
  'passwordChangedEmail',
  'passwordResetEmail',
  'passwordResetRequiredEmail',
  'postVerifyEmail',
  'recoveryEmail',
  'unblockCodeEmail',
  'verificationReminderEmail',
  'verifyEmail',
  'verifyLoginEmail'
]

var typesContainSupportLinks = [
  'newDeviceLoginEmail',
  'passwordChangedEmail',
  'passwordResetEmail',
  'postVerifyEmail',
  'recoveryEmail',
  'verificationReminderEmail',
  'verifyEmail'
]

var typesContainPasswordResetLinks = [
  'passwordChangedEmail',
  'passwordResetEmail',
  'passwordResetRequiredEmail',
]

var typesContainPasswordChangeLinks = [
  'newDeviceLoginEmail',
  'verifyLoginEmail'
]

var typesContainUnblockCode = [
  'unblockCodeEmail'
]

var typesContainReportSignInLinks = [
  'unblockCodeEmail'
]

var typesContainAndroidStoreLinks = [
  'postVerifyEmail'
]

var typesContainIOSStoreLinks = [
  'postVerifyEmail'
]

var typesContainLocationData = [
  'newDeviceLoginEmail',
  'passwordChangedEmail',
  'unblockCodeEmail',
  'recoveryEmail',
  'verifyEmail',
  'verifyLoginEmail'
]

var typesContainPasswordManagerInfoLinks = [
  'passwordResetRequiredEmail',
]

function includes(haystack, needle) {
  return (haystack.indexOf(needle) > -1)
}

function getLocationMessage (location) {
  return {
    device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:48.0) Gecko/20100101 Firefox/48.0',
    email: 'a@b.com',
    ip: '219.129.234.194',
    location: location,
    service: 'sync',
    timeZone: 'America/Los_Angeles'
  }
}

function sesMessageTagsHeaderValue(templateName) {
  return 'messageType=fxa-' + templateName + ', app=fxa'
}

describe(
  'lib/senders/email:',
  () => {
    let mailer

    before(() => {
      return P.all([
        require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
        require(`${ROOT_DIR}/lib/senders/templates`)()
      ]).spread((translator, templates) => {
        mailer = new Mailer(translator, templates, config.get('mail'))
      })
    })

    messageTypes.forEach(
      function (type) {
        var message = {
          code: 'abc123',
          email: 'a@b.com',
          locations: [],
          service: 'sync',
          uid: 'uid',
          unblockCode: 'AS6334PK',
          flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          flowBeginTime: Date.now()
        }

        it(
          'Contains template header for ' + type,
          function () {
            mailer.mailer.sendMail = function (emailConfig) {
              var templateName = emailConfig.headers['X-Template-Name']

              if (type === 'verificationReminderEmail') {
                // Handle special case for verification reminders
                assert.equal(templateName, 'verificationReminderFirstEmail' || 'verificationReminderSecondEmail')
              } else if (type === 'verifyEmail') {
                // Handle special case for verify email
                assert.equal(templateName, 'verifySyncEmail')
              } else {
                assert.equal(templateName, type)
              }
            }
            mailer[type](message)
          }
        )

        it(
          'Contains flow headers for ' + type,
          function () {
            if (type !== 'verificationReminderEmail') {
              mailer.mailer.sendMail = function (emailConfig) {
                var flowIdHeader = emailConfig.headers['X-Flow-Id']
                assert.equal(flowIdHeader, message.flowId)

                var flowBeginHeader = emailConfig.headers['X-Flow-Begin-Time']
                assert.equal(flowBeginHeader, message.flowBeginTime)
              }
              mailer[type](message)
            }
          }
        )

        it(
          'test privacy link is in email template output for ' + type,
          function () {
            var privacyLink = mailer.createPrivacyLink(type)

            mailer.mailer.sendMail = function (emailConfig) {
              assert.ok(includes(emailConfig.html, privacyLink))
              assert.ok(includes(emailConfig.text, privacyLink))
            }
            mailer[type](message)
          }
        )

        it(
          'If sesConfigurationSet is not defined, then outgoing email does not contain X-SES* headers, for type ' + type,
          function () {
            mailer.mailer.sendMail = function (emailConfig) {
              var sesConfigurationSetHeader = emailConfig.headers['X-SES-CONFIGURATION-SET']
              assert.ok(! sesConfigurationSetHeader)
              var sesMessageTags = emailConfig.headers['X-SES-MESSAGE-TAGS']
              assert.ok(! sesMessageTags)
            }

            mailer[type](message) // invoke
          }
        )

        it(
          'If sesConfigurationSet is defined, then outgoing email will contain X-SES* headers, for type ' + type,
          function () {
            var savedSesConfigurationSet = mailer.sesConfigurationSet
            mailer.sesConfigurationSet = 'some-defined-value'

            mailer.mailer.sendMail = function (emailConfig) {
              var sesConfigurationSetHeader = emailConfig.headers['X-SES-CONFIGURATION-SET']
              assert.equal(sesConfigurationSetHeader, 'some-defined-value')

              var sesMessageTags = emailConfig.headers['X-SES-MESSAGE-TAGS']
              var expectedSesMessageTags = sesMessageTagsHeaderValue(type)
              if (type === 'verificationReminderEmail') {
                expectedSesMessageTags = sesMessageTagsHeaderValue('verificationReminderFirstEmail')
                if (message.type === 'second') {
                  expectedSesMessageTags = sesMessageTagsHeaderValue('verificationReminderSecondEmail')
                }
              }
              assert.equal(sesMessageTags, expectedSesMessageTags)

              mailer.sesConfigurationSet = savedSesConfigurationSet
            }

            mailer[type](message) // invoke
          }
        )

        if (includes(typesContainSupportLinks, type)) {
          it(
            'test support link is in email template output for ' + type,
            function () {
              var supportTextLink = mailer.createSupportLink(type)

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, supportTextLink))
                assert.ok(includes(emailConfig.text, supportTextLink))
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainPasswordResetLinks, type)) {
          it(
            'reset password link is in email template output for ' + type,
            function () {
              var resetPasswordLink = mailer.createPasswordResetLink(message.email, type)

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, resetPasswordLink))
                assert.ok(includes(emailConfig.text, resetPasswordLink))
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainPasswordChangeLinks, type)) {
          it(
            'password change link is in email template output for ' + type,
            function () {
              var passwordChangeLink = mailer.createPasswordChangeLink(message.email, type)

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, passwordChangeLink))
                assert.ok(includes(emailConfig.text, passwordChangeLink))
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainUnblockCode, type)) {
          it(
            'unblock code is in email template output for ' + type,
            function () {
              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, message.unblockCode))
                assert.ok(includes(emailConfig.text, message.unblockCode))
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainReportSignInLinks, type)) {
          it(
            'report sign-in link is in email template output for ' + type,
            function () {
              mailer.mailer.sendMail = function (emailConfig) {
                var reportSignInLink =
                  mailer.createReportSignInLink(type, message)
                assert.ok(includes(emailConfig.html, reportSignInLink))
                assert.ok(includes(emailConfig.text, reportSignInLink))
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainAndroidStoreLinks, type)) {
          it(
            'Android store link is in email template output for ' + type,
            function () {
              var androidStoreLink = mailer.androidUrl

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, androidStoreLink))
                // only the html email contains links to the store
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainIOSStoreLinks, type)) {
          it(
            'IOS store link is in email template output for ' + type,
            function () {
              var iosStoreLink = mailer.iosUrl

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, iosStoreLink))
                // only the html email contains links to the store
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainPasswordManagerInfoLinks, type)) {
          it(
            'password manager info link is in email template output for ' + type,
            function () {
              var passwordManagerInfoUrl = mailer._generateLinks(config.get('mail').passwordManagerInfoUrl, message.email, {}, type).passwordManagerInfoUrl

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, passwordManagerInfoUrl))
                assert.ok(includes(emailConfig.text, passwordManagerInfoUrl))
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainLocationData, type)) {

          var defaultLocation = {
            city: 'Mountain View',
            country: 'USA',
            stateCode: 'CA'
          }

          it(
            'ip data is in template for ' + type,
            function () {
              var message = getLocationMessage(defaultLocation)

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, message.ip))

                assert.ok(includes(emailConfig.text, message.ip))
              }
              mailer[type](message)
            }
          )

          it(
            'location is correct with city, country, stateCode for ' + type,
            function () {
              var location = defaultLocation
              var message = getLocationMessage(defaultLocation)

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, location.city + ', ' + location.stateCode + ', ' + location.country))
                assert.ok(includes(emailConfig.text, location.city + ', ' + location.stateCode + ', ' + location.country))
              }
              mailer[type](message)
            }
          )

          it(
            'location is correct with city, country for ' + type,
            function () {
              var location = extend({}, defaultLocation)
              delete location.stateCode
              var message = getLocationMessage(location)


              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, location.city + ', ' + location.country))
                assert.ok(includes(emailConfig.text, location.city + ', ' + location.country))
              }
              mailer[type](message)
            }
          )

          it(
            'location is correct with stateCode, country for ' + type,
            function () {
              var location = extend({}, defaultLocation)
              delete location.city
              var message = getLocationMessage(location)

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, location.stateCode + ', ' + location.country))
                assert.ok(includes(emailConfig.text, location.stateCode + ', ' + location.country))
              }
              mailer[type](message)
            }
          )

          it(
            'location is correct with country for ' + type,
            function () {
              var location = extend({}, defaultLocation)
              delete location.city
              delete location.stateCode
              var message = getLocationMessage(location)


              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, location.country))
                assert.ok(includes(emailConfig.text, location.country))
              }
              mailer[type](message)
            }
          )

        }

        if (type === 'verifyLoginEmail') {
          it(
            'test verify token email',
            function () {
              mailer.mailer.sendMail = function (emailConfig) {
                var verifyLoginUrl = config.get('mail').verifyLoginUrl
                assert.ok(emailConfig.html.indexOf(verifyLoginUrl) > 0)
                assert.ok(emailConfig.text.indexOf(verifyLoginUrl) > 0)
              }
              mailer[type](message)
            }
          )
        } else if (type === 'postVerifyEmail') {
          it(
            'test utm params for ' + type,
            function () {
              var syncLink = mailer._generateUTMLink(config.get('mail').syncUrl, {}, type, 'connect-device')
              var androidLink = mailer._generateUTMLink(config.get('mail').androidUrl, {}, type, 'connect-android')
              var iosLink = mailer._generateUTMLink(config.get('mail').iosUrl, {}, type, 'connect-ios')

              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, syncLink))
                assert.ok(includes(emailConfig.html, androidLink))
                assert.ok(includes(emailConfig.html, iosLink))
              }
              mailer[type](message)
            }
          )
        } else if (type === 'verificationReminderEmail') {
          var reminderMessage = extend(message, {
            type: 'customType'
          })

          it(
            'custom reminder types are supported in output for ' + type,
            function () {
              mailer.mailer.sendMail = function (emailConfig) {
                assert.ok(includes(emailConfig.html, 'reminder=customType'))
                assert.ok(includes(emailConfig.text, 'reminder=customType'))
              }
              mailer[type](reminderMessage)
            }
          )
        }
      }
    )

    it(
      'test user-agent info rendering',
      function () {
        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'Firefox',
          uaBrowserVersion: '32',
          uaOS: 'Windows',
          uaOSVersion: '8.1'
        }), 'Firefox on Windows 8.1')

        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'Chrome',
          uaBrowserVersion: undefined,
          uaOS: 'Windows',
          uaOSVersion: '10',
        }), 'Chrome on Windows 10')

        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: undefined,
          uaBrowserVersion: '12',
          uaOS: 'Windows',
          uaOSVersion: '10'
        }), 'Windows 10')

        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'MSIE',
          uaBrowserVersion: '6',
          uaOS: 'Linux',
          uaOSVersion: '9'
        }), 'MSIE on Linux 9')

        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'MSIE',
          uaBrowserVersion: undefined,
          uaOS: 'Linux',
          uaOSVersion: undefined
        }), 'MSIE on Linux')

        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'MSIE',
          uaBrowserVersion: '8',
          uaOS: undefined,
          uaOSVersion: '4'
        }), 'MSIE')

        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'MSIE',
          uaBrowserVersion: undefined,
          uaOS: undefined,
          uaOSVersion: undefined
        }), 'MSIE')

        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: undefined,
          uaBrowserVersion: undefined,
          uaOS: 'Windows',
          uaOSVersion: undefined
        }), 'Windows')

        assert.equal(mailer._formatUserAgentInfo({
          uaBrowser: undefined,
          uaBrowserVersion: undefined,
          uaOS: undefined,
          uaOSVersion: undefined
        }), '')
      }
    )

    it(
      'resolves sendMail status',
      function () {
        sinon.stub(mailer.mailer, 'sendMail', function (config, cb) {
          cb(null, { resp: 'ok' })
        })

        var message = {
          email: 'test@restmail.net',
          subject: 'subject',
          template: 'verifyLoginEmail',
          uid: 'foo'
        }

        return mailer.send(message)
          .then(function (status) {
            assert.equal(status.resp, 'ok')
          })
      }
    )

    it(
      'rejects sendMail status',
      function () {
        mailer.mailer.sendMail.reset()

        var message = {
          email: 'test@restmail.net',
          subject: 'subject',
          template: 'verifyLoginEmail',
          uid: 'foo'
        }

        return mailer.send(message)
          .then(assert.notOk, function (err) {
            assert.equal(err.message, 'Fail')
          })
      }
    )


  }
)
