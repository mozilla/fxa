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
		path: '/send_code',
		config: {
			description: 'send the verify code to the specified email address',
			handler: function (request) {
				var reply = request.reply.bind(request)
				mailer
					.sendCode(request.payload.email, request.payload.code)
					.done(reply, reply)
			},
			validate: {
				payload: {
					email: isA.String().email().required(),
					code: isA.String().regex(HEX_STRING).required()
				}
			}
		}
	}
)

server.start()
