var path = require('path')
var fs = require('fs')
var nodemailer = require('nodemailer')
var P = require('p-promise')
var handlebars = require("handlebars")

var TEMPLATE_PATH = path.join(__dirname, "templates", "email");

function loadTemplate (name) {
  return fs.readFileSync(path.join(TEMPLATE_PATH, name))
}

// a map of all the different emails we send
var templates = {
  verify: {
    subject: 'Confirm email address for your Firefox Account',
    text: loadTemplate('verify.txt'),
    html: loadTemplate('verify.html')
  },
  reset: {
    subject: 'Reset password for your Firefox Account',
    text: loadTemplate('reset.txt'),
    html: loadTemplate('reset.html')
  }
}

// now turn file contents into compiled templates
Object.keys(templates).forEach(function(type) {
  templates[type].text = handlebars.compile(templates[type].text.toString())
  templates[type].html = handlebars.compile(templates[type].html.toString())
})


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
  this.verification_url = config.verification_url
  this.report_url = config.report_url
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
  var template = templates.verify
  var link = this.verification_url + '?code=' + code
  var reportLink = this.report_url

  var values = {
    link: link,
    reportLink: reportLink
  }
  var message = {
    sender: this.sender,
    to: email,
    subject: template.subject,
    text: template.text(values),
    html: template.html(values),
    headers: {
      'X-Verify-Code': code
    }
  }
  return this.send(message)
}

Mailer.prototype.sendRecoveryCode = function (email, code) {
  var template = templates.reset
  var values = {
    code: code
  }
  var message = {
    sender: this.sender,
    to: email,
    subject: template.subject,
    text: template.text(values),
    html: template.html(values),
    headers: {
      'X-Recovery-Code': code
    }
  }
  return this.send(message)
}

module.exports = Mailer
