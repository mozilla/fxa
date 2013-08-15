var nodemailer = require('nodemailer')
var P = require('p-promise')

function Mailer(config) {
  var options = {
    host: config.host,
    secureConnection: config.secure,
    port: config.port
  }
  if (config.user && config.password) {
    options.auth = {
      user: config.user,
      pass: config.password
    }
  }
  this.mailer = nodemailer.createTransport('SMTP', options)
  this.sender = config.sender
  this.subject = config.subject
}

Mailer.prototype.send = function (message) {
  var d = P.defer()
  this.mailer.sendMail(
    message,
    function (err, status) {
      return err ? d.reject(err) : d.resolve(status)
    }
  )
  return d.promise
}

Mailer.prototype.sendVerifyCode = function (email, code) {
  var message = {
    sender: this.sender,
    to: email,
    subject: this.subject,
    text: code,
    headers: {
      'X-Verify-Code': code
    }
  }
  return this.send(message)
}

Mailer.prototype.sendRecoveryCode = function (email, code) {
  var message = {
    sender: this.sender,
    to: email,
    subject: 'TODO recovery code subject',
    text: code,
    headers: {
      'X-Recovery-Code': code
    }
  }
  return this.send(message)
}

module.exports = Mailer
