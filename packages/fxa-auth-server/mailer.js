/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var fs = require('fs')
var qs = require('querystring')
var nodemailer = require('nodemailer')
var P = require('./promise')
var handlebars = require("handlebars")

module.exports = function (config, i18n, log) {

  function loadTemplate (name) {
    return fs.readFileSync(path.join(config.templatePath, name))
  }

  // Make the 'gettext' function available in the templates.
  handlebars.registerHelper('gettext', function(string) {
    if (this.l10n) {
      return this.l10n.gettext(string)
    }
    return string
  })

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
    this.verificationUrl = config.verificationUrl
    this.passwordResetUrl = config.passwordResetUrl
  }

  Mailer.prototype.stop = function () {
    this.mailer.close()
  }

  Mailer.prototype.send = function (message) {
    log.trace({ op: 'mailer.send', email: message && message.to })
    var d = P.defer()
    this.mailer.sendMail(
      message,
      function (err, status) {
        log.trace(
          {
            op: 'mailer.send.1',
            err: err && err.message,
            status: status && status.message,
            id: status && status.messageId
          }
        )
        return err ? d.reject(err) : d.resolve(status)
      }
    )
    return d.promise
  }

  // Sends a verification email to the user.
  //
  // - account : the account containing account.email and account.uid
  // - code : the code which proves the user got the email
  // - opts : object of options:
  //   - service : the service we came from
  //   - redirectTo : where to redirect the user once clicked
  //   - preferredLang : the preferred language of the user
  Mailer.prototype.sendVerifyCode = function (account, code, opts) {
    log.trace({ op: 'mailer.sendVerifyCode', email: account.email, uid: account.uid })
    code = code.toString('hex')
    opts = opts || {}
    var template = templates.verify
    var query = {
      uid: account.uid.toString('hex'),
      code: code
    }
    if (opts.service) { query.service = opts.service }
    if (opts.redirectTo) { query.redirectTo = opts.redirectTo }

    var link = this.verificationUrl + '?' + qs.stringify(query)
    var values = {
      l10n: i18n.localizationContext(opts.preferredLang),
      link: link,
    }
    var message = {
      sender: this.sender,
      to: account.email,
      subject: values.l10n.gettext(template.subject),
      text: template.text(values),
      html: template.html(values),
      headers: {
        'X-Uid': account.uid.toString('hex'),
        'X-Verify-Code': code,
        'X-Service-ID': opts.service,
        'X-Link': link,
        'Content-Language': opts.preferredLang || i18n.defaultLang
      }
    }
    return this.send(message)
  }

  // Sends an account recovery email to the user.
  //
  // - token : the token containing token.email and token.data
  // - code : the code which proves the user got the email
  // - opts : object of options:
  //   - service : the service we came from
  //   - redirectTo : where to redirect the user once clicked
  //   - preferredLang : the preferred language of the user
  Mailer.prototype.sendRecoveryCode = function (token, code, opts) {
    log.trace({ op: 'mailer.sendRecoveryCode', email: token.email })
    code = code.toString('hex')
    opts = opts || {}
    var template = templates.reset
    var query = {
      token: token.data.toString('hex'),
      code: code,
      email: token.email
    }
    if (opts.service) { query.service = opts.service }
    if (opts.redirectTo) { query.redirectTo = opts.redirectTo }

    var link = this.passwordResetUrl + '?' + qs.stringify(query)
    var values = {
      l10n: i18n.localizationContext(opts.preferredLang),
      link: link,
      code: code
    }
    var message = {
      sender: this.sender,
      to: token.email,
      subject: values.l10n.gettext(template.subject),
      text: template.text(values),
      html: template.html(values),
      headers: {
        'X-Recovery-Code': code,
        'X-Link': link,
        'Content-Language': opts.preferredLang || i18n.defaultLang
      }
    }
    return this.send(message)
  }

  return new Mailer(config)
}
