/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Mail = require('lazysmtp').Mail
var MailParser = require('mailparser').MailParser
var hapi = require('hapi')
var config = require('../config').root()

process.title = 'mail_helper.js'

// SMTP half

var mail = new Mail(config.smtp.host)
var users = {}

function emailName(emailAddress) {
  return emailAddress.split('@')[0]
}

mail.on(
  'mail',
  function (email) {
    var mp = new MailParser({ defaultCharset: 'utf8' })
    mp.on(
      'end',
      function (mail) {
        //console.log(mail)
        var uid = mail.headers['x-uid']
        var link = mail.headers['x-link']
        var rc = mail.headers['x-recovery-code']
        var vc = mail.headers['x-verify-code']
        if (vc) {
          console.log('\x1B[32m', link, '\x1B[39m')
          console.log(
            "curl -v -XPOST -H'Content-Type: application/json' %s -d '%s'",
            config.publicUrl + '/v1/recovery_email/verify_code',
            JSON.stringify(
              {
                uid: uid,
                code: vc
              }
            )
          )
        }
        else if (rc) {
          console.log('\x1B[34mrecovery: %s email: %s', rc, mail.headers.to, '\x1B[39m')
        }
        else {
          console.error('\x1B[31mNo verify code match\x1B[39m')
          console.error(email)
        }
        users[emailName(mail.headers.to)] = mail
      }
    )
    mp.write(email)
    mp.end()
  }
)

mail.start(config.smtp.port)

// HTTP half

var api = hapi.createServer(config.smtp.api.host, config.smtp.api.port)

function loop(email, cb) {
  var mail = users[email]
  if (!mail) {
    return setTimeout(loop.bind(null, email, cb), 50)
  }
  cb(mail)
}

api.route(
  [
    {
      method: 'GET',
      path: '/mail/{email}',
      handler: function (request) {
        loop(
          request.params.email,
          function (emailData) {
            request.reply([emailData])
          }
        )
      }
    },
    {
      method: 'DELETE',
      path: '/mail/{email}',
      handler: function (request) {
        delete users[request.params.email]
        request.reply()
      }
    }
  ]
)

api.start()
