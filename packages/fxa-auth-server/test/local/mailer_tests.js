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
  'verifyEmail',
  'recoveryEmail',
  'unlockEmail',
  'passwordChangedEmail',
  'passwordResetEmail',
  'newSyncDeviceEmail',
  'postVerifyEmail',
  'verificationReminderEmail'
]

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
          email: 'a@b.com',
          uid: 'uid',
          code: 'abc123',
          service: 'service',
        }

        var supportHtmlLink = new RegExp('<a href="' + config.get('mail').supportUrl + '" style="color: #0095dd; text-decoration: none; font-family: sans-serif;">Mozilla Support</a>')
        var supportTextLink = config.get('mail').supportUrl

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
        }

      }
    )
  }
)

