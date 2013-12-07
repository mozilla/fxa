#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Mail = require('lazysmtp').Mail
var hapi = require('hapi')
var config = require('../config').root()

// SMTP half

var codeMatch = /X-(\w+)-Code: (\w+)/
var toMatch = /To: (\w+@\w+\.\w+)/
var uidMatch = /X-Uid: (\w+)/
var linkMatch = /X-Link: (\S+)/

var mail = new Mail(config.smtp.host)
var emailCodes = {}
mail.on(
  'mail',
  function (email) {
    var matchCode = codeMatch.exec(email)
    var matchEmail = toMatch.exec(email)
    if (matchCode && matchEmail) {
      emailCodes[matchEmail[1]] = matchCode[2]
      if (matchCode[1] === 'Verify') {
        var matchUid = uidMatch.exec(email)
        var matchLink = linkMatch.exec(email)
        console.log(matchLink[1])
        console.log(
          "curl -v -XPOST -H'Content-Type: application/json' %s -d '%s'",
          config.public_url + '/v1/recovery_email/verify_code',
          JSON.stringify(
            {
              uid: matchUid[1],
              code: matchCode[2]
            }
          )
        )
      }
    }
    else {
      console.error('No verify code match')
      console.error(email)
    }
  }
)

mail.start(config.smtp.port)

// HTTP half

var api = hapi.createServer(config.smtp.api.host, config.smtp.api.port)

function loop(email, cb) {
  var code = emailCodes[email]
  if (!code) {
    return setTimeout(loop.bind(null, email, cb), 50)
  }
  delete emailCodes[email]
  cb(code)
}

api.route(
  {
    method: 'POST',
    path: '/pop',
    handler: function (request) {
      loop(
        request.payload.email,
        function (code) {
          request.reply(JSON.stringify(code))
        }
      )
    }
  }
)

api.start()
