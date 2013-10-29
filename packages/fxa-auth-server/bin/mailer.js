/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Hapi = require('hapi')
var config = require('../config').root()
var log = require('../log')(config)
var mailer = require('../mailer')(config.smtp, log)
var isA = Hapi.types

const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/


var server = Hapi.createServer(config.smtp.listen.host, config.smtp.listen.port)

server.route(
  {
    method: 'POST',
    path: '/send_verify_code',
    config: {
      description: 'send the verify code to the specified email address',
      handler: function (request) {
        var reply = request.reply.bind(request)
        mailer
          .sendVerifyCode(Buffer(request.payload.email, 'hex').toString(), request.payload.code, request.payload.uid)
          .done(reply, reply)
      },
      validate: {
        payload: {
          email: isA.String().regex(HEX_STRING).required(),
          uid: isA.String().max(64).required(),
          code: isA.String().required()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/send_recovery_code',
    config: {
      description: 'send the verify code to the specified email address',
      handler: function (request) {
        var reply = request.reply.bind(request)
        mailer
          .sendRecoveryCode(Buffer(request.payload.email, 'hex').toString(), request.payload.code)
          .done(reply, reply)
      },
      validate: {
        payload: {
          email: isA.String().regex(HEX_STRING).required(),
          code: isA.String().required()
        }
      }
    }
  }
)

server.start()
