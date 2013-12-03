/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var fs = require('fs')
var nodemailer = require('nodemailer')
var P = require('p-promise')
var handlebars = require("handlebars")

module.exports = function (config, i18n, log) {

  function loadTemplate (name) {
    return fs.readFileSync(path.join(config.template_path, name))
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
    this.verification_url = config.verification_url
    this.report_url = config.report_url
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

  Mailer.prototype.sendVerifyCode = function (account, code, preferredLang) {
    var email = Buffer(account.email, 'hex').toString()
    log.trace({ op: 'mailer.sendVerifyCode', email: email, uid: account.uid })
    var template = templates.verify
    var link = this.verification_url + '?uid=' + account.uid.toString('hex')
    link += '#code=' + code
    var reportLink = this.report_url

    var values = {
      account: account,
      l10n: i18n.localizationContext(preferredLang),
      link: link,
      reportLink: reportLink
    }
    var message = {
      sender: this.sender,
      to: email,
      subject: values.l10n.gettext(template.subject),
      text: template.text(values),
      html: template.html(values),
      headers: {
        'X-Uid': account.uid.toString('hex'),
        'X-Verify-Code': code,
        'X-Link': link
      }
    }
    return this.send(message)
  }

  Mailer.prototype.sendRecoveryCode = function (account, code, preferredLang) {
    var email = Buffer(account.email, 'hex').toString()
    log.trace({ op: 'mailer.sendRecoveryCode', email: email })
    var template = templates.reset
    var values = {
      account: account,
      l10n: i18n.localizationContext(preferredLang),
      code: code
    }
    var message = {
      sender: this.sender,
      to: email,
      subject: values.l10n.gettext(template.subject),
      text: template.text(values),
      html: template.html(values),
      headers: {
        'X-Recovery-Code': code
      }
    }
    return this.send(message)
  }

  return new Mailer(config)
}
