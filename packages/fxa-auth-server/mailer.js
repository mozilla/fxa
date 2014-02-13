/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var fs = require('fs')
var qs = require('querystring')
var nodemailer = require('nodemailer')
var P = require('./promise')
var handlebars = require("handlebars")
var request = require('request')

module.exports = function (config, log) {
  // A map of all the different emails we send. The templates are retrieved from
  // the 'fxa-content-server'.
  //
  // The map is populated by 'lang' then 'type'.
  // e.g.
  //     templates['en']['reset']
  //     templates['it-CH']['verify']
  //
  // We read the languages from config.i18n.supportedLanguages and
  // the types are currently 'verify' and 'reset'.
  var templates = {}

  var types = [ 'verify', 'reset' ]
  function fetchTemplates() {
    var p = P.defer()

    var remaining = config.i18n.supportedLanguages.length * types.length;
    config.i18n.supportedLanguages.forEach(function(lang) {
      // somewhere to store the templates
      templates[lang] = templates[lang] || {}

      types.forEach(function(type) {
        var opts = {
          uri : config.contentServer.url + '/template/' + lang + '/' + type,
          json : true,
        }
        request(opts, function(err, res, body) {
          templates[lang][type] = body

          // compile the templates
          templates[lang][type].html = handlebars.compile(templates[lang][type].html)
          templates[lang][type].text = handlebars.compile(templates[lang][type].text)

          remaining -= 1
          if ( remaining === 0 ) {
            p.resolve()
          }
        })
      })
    })
    return p.promise
  }


  function Mailer(smtp) {
    var options = {
      host: config.smtp.host,
      secureConnection: config.smtp.secure,
      port: config.smtp.port
    }
    if (config.smtp.user && config.smtp.password) {
      options.auth = {
        user: config.smtp.user,
        pass: config.smtp.password
      }
    }
    this.mailer = nodemailer.createTransport('SMTP', options)
    this.sender = config.smtp.sender
    this.verificationUrl = config.smtp.verificationUrl
    this.passwordResetUrl = config.smtp.passwordResetUrl
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

    var lang = opts.preferredLang || config.defaultLang
    lang = lang in templates ? lang : 'en'

    var template = templates[lang].verify
    var query = {
      uid: account.uid.toString('hex'),
      code: code
    }
    if (opts.service) { query.service = opts.service }
    if (opts.redirectTo) { query.redirectTo = opts.redirectTo }

    var link = this.verificationUrl + '?' + qs.stringify(query)
    var values = {
      link: link,
    }

    var message = {
      sender: this.sender,
      to: account.email,
      subject: template.subject,
      text: template.text(values),
      html: template.html(values),
      headers: {
        'X-Uid': account.uid.toString('hex'),
        'X-Verify-Code': code,
        'X-Service-ID': opts.service,
        'X-Link': link,
        'Content-Language': lang,
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
    var lang = opts.preferredLang || config.defaultLang
    lang = lang in templates ? lang : 'en'
    var template = templates[lang].reset
    var query = {
      token: token.data.toString('hex'),
      code: code,
      email: token.email
    }
    if (opts.service) { query.service = opts.service }
    if (opts.redirectTo) { query.redirectTo = opts.redirectTo }

    var link = this.passwordResetUrl + '?' + qs.stringify(query)
    var values = {
      link: link,
      code: code
    }
    var message = {
      sender: this.sender,
      to: token.email,
      subject: template.subject,
      text: template.text(values),
      html: template.html(values),
      headers: {
        'X-Recovery-Code': code,
        'X-Link': link,
        'Content-Language': lang,
      }
    }
    return this.send(message)
  }

  // fetch the templates first, then resolve the new Mailer
  var p = P.defer()
  fetchTemplates().then(function() {
    return p.resolve(new Mailer(config.smtp))
  })
  return p.promise
}
