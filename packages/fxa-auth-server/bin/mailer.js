var Hapi = require('hapi')
var Mailer = require('../mailer')
var config = require('../config').root()
var isA = Hapi.types

const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/


config.smtp.subject = 'PiCL email verification'
config.smtp.sender = config.smtp.sender || config.smtp.user

var mailer = new Mailer(config.smtp)

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
          .sendVerifyCode(Buffer(request.payload.email, 'hex').toString(), request.payload.code)
          .done(reply, reply)
      },
      validate: {
        payload: {
          email: isA.String().regex(HEX_STRING).required(),
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
