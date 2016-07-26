/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var extend = require('util')._extend

var P = require('bluebird')
var test = require('tap').test

var nullLog = {
  trace: function () {},
  info: function () {}
}

var config = require('../../config')
var Mailer = require('../../mailer')(nullLog)

var messageTypes = [
  'newDeviceLoginEmail',
  'passwordChangedEmail',
  'passwordResetEmail',
  'passwordResetRequiredEmail',
  'postVerifyEmail',
  'recoveryEmail',
  'suspiciousLocationEmail',
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
  'suspiciousLocationEmail'
]

var typesContainPasswordChangeLinks = [
  'newDeviceLoginEmail',
  'verifyLoginEmail'
]

var typesContainSignInLinks = [
  'recoveryEmail'
]

var typesContainAndroidStoreLinks = [
  'postVerifyEmail'
]

var typesContainIOSStoreLinks = [
  'postVerifyEmail'
]

function includes(haystack, needle) {
  return (haystack.indexOf(needle) > -1)
}

P.all(
  [
    require('../../translator')(['en'], 'en'),
    require('../../templates')()
  ]
)
.spread(
  function (translator, templates) {

    messageTypes.forEach(
      function (type) {
        var mailer = new Mailer(translator, templates, config.get('mail'))

        var message = {
          code: 'abc123',
          email: 'a@b.com',
          locations: [],
          service: 'service',
          uid: 'uid',
        }

        var supportHtmlLink = new RegExp('<a href="' + config.get('mail').supportUrl + '" style="color: #0095dd; text-decoration: none; font-family: sans-serif;">Mozilla Support</a>')
        var supportTextLink = config.get('mail').supportUrl

        if (includes(typesContainSupportLinks, type)) {
          test(
            'test support link is in email template output for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                t.equal(!! emailConfig.html.match(supportHtmlLink), true)
                t.equal(!! emailConfig.text.match(supportTextLink), true)
                t.end()
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainPasswordResetLinks, type)) {
          var resetPasswordLink = mailer.createPasswordResetLink(message.email)

          test(
            'reset password link is in email template output for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                t.ok(includes(emailConfig.html, resetPasswordLink))
                t.ok(includes(emailConfig.text, resetPasswordLink))
                t.end()
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainPasswordChangeLinks, type)) {
          var passwordChangeLink = mailer.createPasswordChangeLink(message.email)
          test(
            'password change link is in email template output for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                t.ok(includes(emailConfig.html, passwordChangeLink))
                t.ok(includes(emailConfig.text, passwordChangeLink))
                t.end()
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainAndroidStoreLinks, type)) {
          var androidStoreLink = mailer.androidUrl

          test(
            'Android store link is in email template output for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                t.ok(includes(emailConfig.html, androidStoreLink))
                // only the html email contains links to the store
                t.end()
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainIOSStoreLinks, type)) {
          var iosStoreLink = mailer.iosUrl

          test(
            'IOS store link is in email template output for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                t.ok(includes(emailConfig.html, iosStoreLink))
                // only the html email contains links to the store
                t.end()
              }
              mailer[type](message)
            }
          )
        }

        if (includes(typesContainSignInLinks, type)) {
          var signInLink = mailer.createSignInLink(message.email)
          test(
            'sign in link is in email template output for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                t.ok(includes(emailConfig.html, signInLink))
                t.ok(includes(emailConfig.text, signInLink))
                t.end()
              }
              mailer[type](message)
            }
          )
        }

        if (type === 'verifyLoginEmail') {
          test(
            'test verify token email',
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                var verifyLoginUrl = config.get('mail').verifyLoginUrl
                t.ok(emailConfig.html.indexOf(verifyLoginUrl) > 0)
                t.ok(emailConfig.text.indexOf(verifyLoginUrl) > 0)

                t.end()
              }
              mailer[type](message)
            }
          )
        } else if (type === 'postVerifyEmail') {
          test(
            'test utm params for ' + type,
            function (t) {
              var utmParam = '?utm_source=email&utm_medium=email&utm_campaign=fx-account-verified'

              mailer.mailer.sendMail = function (emailConfig) {
                t.ok(emailConfig.html.indexOf(config.get('mail').androidUrl + utmParam) > 0)
                t.ok(emailConfig.html.indexOf(config.get('mail').iosUrl + utmParam) > 0)
                t.ok(emailConfig.html.indexOf(config.get('mail').syncUrl + utmParam) > 0)
                t.end()
              }
              mailer[type](message)
            }
          )
        } else if (type === 'suspiciousLocationEmail') {
          var locations = [
            {
              device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:48.0) Gecko/20100101 Firefox/48.0',
              location: 'Mountain View, CA',
              timestamp: (new Date()).toString()
            },
            {
              device: 'MSIE 10',
              location: 'London, United Kingdom',
              timestamp: (new Date()).toString()
            }
          ]

          message = {
            email: 'a@b.com',
            locations: locations
          }

          test(
            'test suspicious location entries are added for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                locations.forEach(function (location) {
                  t.ok(includes(emailConfig.html, location.device))
                  t.ok(includes(emailConfig.html, location.location))
                  t.ok(includes(emailConfig.html, location.timestamp))

                  t.ok(includes(emailConfig.text, location.device))
                  t.ok(includes(emailConfig.text, location.location))
                  t.ok(includes(emailConfig.text, location.timestamp))
                })

                t.end()
              }
              mailer[type](message)
            }
          )
        } else if (type === 'verificationReminderEmail') {
          var reminderMessage = extend(message, {
            type: 'customType'
          })

          test(
            'custom reminder types are supported in output for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                t.ok(includes(emailConfig.html, 'reminder=customType'))
                t.ok(includes(emailConfig.text, 'reminder=customType'))
                t.end()
              }
              mailer[type](reminderMessage)
            }
          )
        }
      }
    )

    test(
      'test user-agent info rendering',
      function (t) {
        var mailer = new Mailer(translator, templates, config.get('mail'))

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'Firefox',
          uaBrowserVersion: '32',
          uaOS: 'Windows',
          uaOSVersion: '8.1'
        }), 'Firefox 32, Windows 8.1')

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'Chrome',
          uaBrowserVersion: undefined,
          uaOS: 'Windows',
          uaOSVersion: '10',
        }), 'Chrome, Windows 10')

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: undefined,
          uaBrowserVersion: '12',
          uaOS: 'Windows',
          uaOSVersion: '10'
        }), 'Windows 10')

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'MSIE',
          uaBrowserVersion: '6',
          uaOS: 'Linux',
          uaOSVersion: '9'
        }), 'MSIE 6, Linux 9')

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'MSIE',
          uaBrowserVersion: undefined,
          uaOS: 'Linux',
          uaOSVersion: undefined
        }), 'MSIE, Linux')

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'MSIE',
          uaBrowserVersion: '8',
          uaOS: undefined,
          uaOSVersion: '4'
        }), 'MSIE 8')

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: 'MSIE',
          uaBrowserVersion: undefined,
          uaOS: undefined,
          uaOSVersion: undefined
        }), 'MSIE')

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: undefined,
          uaBrowserVersion: undefined,
          uaOS: 'Windows',
          uaOSVersion: undefined
        }), 'Windows')

        t.equal(mailer._formatUserAgentInfo({
          uaBrowser: undefined,
          uaBrowserVersion: undefined,
          uaOS: undefined,
          uaOSVersion: undefined
        }), '')

        t.end()
      }
    )

  }
)

