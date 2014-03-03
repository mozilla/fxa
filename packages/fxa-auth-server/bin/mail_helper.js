/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Mail = require('lazysmtp').Mail
var MailParser = require('mailparser').MailParser
var hapi = require('hapi')
var config = require('../config').root()

process.title = 'mail_helper.js'

// SMTP half

var mail = new Mail(config.smtp.host)
var users = {}

function emailName(emailAddress) {
  return emailAddress.split('@')[0]
}

mail.on(
  'mail',
  function (email) {
    var mp = new MailParser({ defaultCharset: 'utf8' })
    mp.on(
      'end',
      function (mail) {
        //console.log(mail)
        var uid = mail.headers['x-uid']
        var link = mail.headers['x-link']
        var rc = mail.headers['x-recovery-code']
        var vc = mail.headers['x-verify-code']
        var name = emailName(mail.headers.to)
        if (vc) {
          console.log('\x1B[32m', link, '\x1B[39m')
          console.log(
            "curl -v -XPOST -H'Content-Type: application/json' %s -d '%s'",
            config.publicUrl + '/v1/recovery_email/verify_code',
            JSON.stringify(
              {
                uid: uid,
                code: vc
              }
            )
          )
        }
        else if (rc) {
          console.log('\x1B[34m %s', link, '\x1B[39m')
        }
        else {
          console.error('\x1B[31mNo verify code match\x1B[39m')
          console.error(email)
        }
        if (users[name]) {
          users[name].push(mail)
        } else {
          users[name] = [mail]
        }
      }
    )
    mp.write(email)
    mp.end()
  }
)

mail.start(config.smtp.port)

// HTTP half

var api = hapi.createServer(config.smtp.api.host, config.smtp.api.port)

function loop(email, cb) {
  var mail = users[email]
  if (!mail) {
    return setTimeout(loop.bind(null, email, cb), 50)
  }
  cb(mail)
}

var template = {
  'en-US' : {
    verify : {
      subject : 'Confirm Your Account',
      html : '<p>Welcome.<br>Firefox Accounts<br><br>Congratulations! {{{email}}}, you are seconds away from verifying your Firefox Account.<br>Verify: {{{link}}}<br><br>If you received this email in error, no action is required.</p>',
      text : 'Welcome.\n\nFirefox Accounts\n\nCongratulations! {{{email}}}, you are seconds away from verifying your Firefox Account.\nVerify: {{{link}}}\n\nIf you received this email in error, no action is required.',
    },
    reset : {
      subject : 'Reset Password Request',
      html : '<p>Firefox Accounts<br><br>A request to reset the password for {{{email}}} has been made.\nReset password: {{{link}}}<br><br>If you received this email in error, no action is required.</p>',
      text : 'Firefox Accounts\n\nA request to reset the password for {{{email}}} has been made.\nReset password: {{{link}}}\n\nIf you received this email in error, no action is required.\n',
    },
  },
  'en-AU' : {
    verify : {
      subject : 'Confirm Your Account',
      html : '<p>GDay<br>Firefox Accounts<br><br>Congratulations! {{{email}}}, you are seconds away from verifying your Firefox Account.<br>Verify: {{{link}}}<br><br>If you received this email in error, no action is required.</p>',
      text : 'GDay\n\nFirefox Accounts\n\nCongratulations! {{{email}}}, you are seconds away from verifying your Firefox Account.\nVerify: {{{link}}}\n\nIf you received this email in error, no action is required.',
    },
    reset : {
      subject : 'Reset Password Request',
      html : '<p>Firefox Accounts<br><br>A request to reset the password for {{{email}}} has been made.\nReset password: {{{link}}}<br><br>If you received this email in error, no action is required.</p>',
      text : 'Firefox Accounts\n\nA request to reset the password for {{{email}}} has been made.\nReset password: {{{link}}}\n\nIf you received this email in error, no action is required.\n',
    },
  },
  'it-CH' : {
    verify : {
      subject : 'ʇunoɔɔ∀ ɹno⅄ ɯɹıɟuoↃ',
      html : '<p>sʇunoɔɔ∀ xoɟǝɹıℲ<br><br>.ʇunoɔɔ∀ xoɟǝɹıℲ ɹnoʎ ƃuıʎɟıɹǝʌ ɯoɹɟ ʎaʍa spuoɔǝs ǝɹa noʎ ´{{{email}}} ¡suoıʇaʅnʇaɹƃuoↃ<br>:ʎɟıɹǝɅ {{{link}}}<br><br>.pǝɹınbǝɹ sı uoıʇɔa ou ´ɹoɹɹǝ uı ʅıaɯǝ sıɥʇ pǝʌıǝɔǝɹ noʎ ɟI</p>',
      text : 'sʇunoɔɔ∀ xoɟǝɹıℲ\n\n.ʇunoɔɔ∀ xoɟǝɹıℲ ɹnoʎ ƃuıʎɟıɹǝʌ ɯoɹɟ ʎaʍa spuoɔǝs ǝɹa noʎ ´{{{email}}} ¡suoıʇaʅnʇaɹƃuoↃ\n:ʎɟıɹǝɅ {{{link}}}\n\n.pǝɹınbǝɹ sı uoıʇɔa ou ´ɹoɹɹǝ uı ʅıaɯǝ sıɥʇ pǝʌıǝɔǝɹ noʎ ɟI\n',
    },
    reset : {
      subject : 'ʇsǝnbǝᴚ pɹoʍssaԀ ʇǝsǝᴚ',
      html : '<p>sʇunoɔɔ∀ xoɟǝɹıℲ<br><br>.ǝpaɯ uǝǝq saɥ {{{email}}} ɹoɟ pɹoʍssad ǝɥʇ ʇǝsǝɹ oʇ ʇsǝnbǝɹ ∀<br>:pɹoʍssad ʇǝsǝᴚ {{{link}}}<br><br>.pǝɹınbǝɹ sı uoıʇɔa ou ´ɹoɹɹǝ uı ʅıaɯǝ sıɥʇ pǝʌıǝɔǝɹ noʎ ɟI</p>',
      text : 'sʇunoɔɔ∀ xoɟǝɹıℲ\n\n.ǝpaɯ uǝǝq saɥ {{{email}}} ɹoɟ pɹoʍssad ǝɥʇ ʇǝsǝɹ oʇ ʇsǝnbǝɹ ∀\n:pɹoʍssad ʇǝsǝᴚ {{{link}}}\n\n.pǝɹınbǝɹ sı uoıʇɔa ou ´ɹoɹɹǝ uı ʅıaɯǝ sıɥʇ pǝʌıǝɔǝɹ noʎ ɟI',
    },
  }
}

api.route(
  [
    {
      method: 'GET',
      path: '/mail/{email}',
      handler: function (request, reply) {
        loop(
          request.params.email,
          function (emailData) {
            reply(emailData)
          }
        )
      }
    },
    {
      method: 'DELETE',
      path: '/mail/{email}',
      handler: function (request, reply) {
        delete users[request.params.email]
        reply()
      }
    },
    {
      method: 'GET',
      path: '/template/{lang}/{type}',
      handler: function (request, reply) {
        var lang = request.params.lang
        var type = request.params.type
        // request.log('Looking for template: lang=' + lang + ', type=' + type)

        // default to 'en-US' if we don't know this lang
        if ( !template[lang] ) {
          lang = 'en-US'
        }

        if ( template[lang][type] ) {
          // request.log('Found template lang=' + lang + ', type=' + type)
          return reply(template[lang][type])
        }
        reply({}).code(404);
      }
    }
  ]
)

api.start()
