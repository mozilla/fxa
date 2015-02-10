/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Mail = require('lazysmtp').Mail
var MailParser = require('mailparser').MailParser
var restify = require('restify')
var config = require('rc')(
  'fxa_mail_helper',
  {
    mail: {
      host: '127.0.0.1',
      port: 9999
    },
    http: {
      host: '127.0.0.1',
      port: 9001
    }
  }
)

// SMTP half

var mail = new Mail(config.mail.host)
var users = {}

function emailName(emailAddress) {
  return emailAddress.split('@')[0]
}

require('simplesmtp').createSimpleServer(
  {
    SMTPBanner: "FXATEST"
  },
  function (req) {
    var mp = new MailParser({ defaultCharset: 'utf8' })
    mp.on('end',
      function (mail) {
        var uid = mail.headers['x-uid']
        var link = mail.headers['x-link']
        var rc = mail.headers['x-recovery-code']
        var vc = mail.headers['x-verify-code']
        var uc = mail.headers['x-unlock-code']
        var name = emailName(mail.headers.to)
        if (vc) {
          console.log('\x1B[32m', link, '\x1B[39m')
        }
        else if (rc) {
          console.log('\x1B[34m %s', link, '\x1B[39m')
        }
        else if (uc) {
          console.log('\x1B[36m %s', link, '\x1B[39m')
        }
        else {
          console.error('\x1B[31mNo verify code match\x1B[39m')
          console.error(mail)
        }
        if (users[name]) {
          users[name].push(mail)
        } else {
          users[name] = [mail]
        }
      }
    )
    req.pipe(mp)
    req.accept()
  }
).listen(config.mail.port, config.mail.host)

// HTTP half

var api = restify.createServer()

function loop(email, cb) {
  var mail = users[email]
  if (!mail) {
    return setTimeout(loop.bind(null, email, cb), 50)
  }
  cb(mail)
}

api.get(
  '/mail/:email',
  function (req, res, next) {
    loop(
      req.params.email,
      function (emailData) {
        res.send(emailData)
        next()
      }
    )
  }
)

api.del(
  '/mail/:email',
  function (req, res, next) {
    delete users[req.params.email]
    res.send(200)
    next()
  }
)

api.listen(config.http.port, config.http.host)
