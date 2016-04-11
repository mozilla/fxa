/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('bluebird')
var test = require('tap').test

var nullLog = {
  trace: function () {},
  info: function () {}
}

var config = require('../../config')
var Mailer = require('../../mailer')(nullLog)

var messageTypes = [
  'newSyncDeviceEmail',
  'passwordChangedEmail',
  'passwordResetEmail',
  'passwordResetRequiredEmail',
  'postVerifyEmail',
  'recoveryEmail',
  'suspiciousLocationEmail',
  'unlockEmail',
  'verificationReminderEmail',
  'verifyEmail'
]

var typesWithSupportLinks = [
  'newDeviceLoginEmail',
  'passwordChangedEmail',
  'passwordResetEmail',
  'postVerifyEmail',
  'recoveryEmail',
  'unlockEmail',
  'verificationReminderEmail',
  'verifyEmail'
]

var typesContainConfirmlessPasswordResetLinks = [
  'passwordResetRequiredEmail',
  'suspiciousLocationEmail'
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

        if (includes(typesWithSupportLinks, type)) {
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

        if (includes(typesContainConfirmlessPasswordResetLinks, type)) {
          var confirmlessResetPasswordLink = mailer.createPasswordResetLink(message.email, { reset_password_confirm: false })

          test(
            'reset password link is in email template output for ' + type,
            function (t) {
              mailer.mailer.sendMail = function (emailConfig) {
                t.ok(includes(emailConfig.html, confirmlessResetPasswordLink))
                t.ok(includes(emailConfig.text, confirmlessResetPasswordLink))
                t.end()
              }
              mailer[type](message)
            }
          )
        }

        if (type === 'postVerifyEmail') {
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
        }
      }
    )
  }
)

