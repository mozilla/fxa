#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: this script will fail if run against official production
// auth-server, since `/v1/account/lock` is, of course, not available
// there.

const crypto = require('crypto')
const commander = require('commander')

const P = require('../../lib/promise')
const Client = require('../../test/client')
const mailbox = require('../../test/mailbox')
const validateEmail = require('./validate-email')

const emailMessages = {}
var program

function configure() {
  commander
    .option('-a, --auth-server [url]',
            'URL of FxA Auth Server',
            'https://api-accounts.stage.mozaws.net')
    .option('-l, --locales [path]',
            'Path to file with a list of locales to test',
            '../../config/supportedLanguages.js')
    .option('-r, --restmail-domain [fqdn]',
            'URL of the restmail server',
            'restmail.net')
    .option('-L, --locale <en[,zh-TW,de,...]>',
            'Test only this csv list of locales',
            function(list) {
              return list.split(/,/)
            })
    .parse(process.argv)

  commander.basename = crypto.randomBytes(8).toString('hex')
  commander.password = crypto.randomBytes(16).toString('hex')

  commander.supportedLanguages = commander.locale ||
    require(commander.locales).slice(0)

  var mailserver = commander.mailserver = mailbox(commander.restmailDomain, 80)

  mailserver.eventEmitter.on('email:message', function(email, message) {
    emailMessages[email] = emailMessages[email] || []
    emailMessages[email].push(message)
  })

  mailserver.eventEmitter.on('email:error', function(email, error) {
    emailMessages[email] = emailMessages[email] || []
    emailMessages[email].push(error)
  })

  return commander
}

function log(level /*, rest */) {
  if (level < log.level) return
  var args = Array.prototype.slice.call(arguments)
  var timestamp = '[' + new Date().toISOString() + ']'
  args[0] = timestamp
  console.log.apply(null, args)
}

log.ERROR = 3
log.INFO = 2
log.DEBUG = 1
log.level = log.INFO

function emailFromLang(lang) {
  return program.basename + '-' + lang + '@' + program.restmailDomain
}

function langFromEmail(email) {
  // is like 'deadbeef-es@...' or 'deadbeef-es-AR@...'
  return email.split('@')[0].match(/^[^-]*-([^-]*(?:-[^-]*)?)/)[1]
}

/*
  - signup for service sync
  - signin as if second device
  - change the password
  - trigger a password reset
  - force  an account lock, and then do account unlock

  With the collected emails:
  - CHECK that I get a signup email
  - CHECK that I get a notification email of a second device
  - CHECK that I get a notification email of a password change
  - CHECK that I get a password reset email
  - CHECK that I get a notification email of a password reset
  - CHECK that I get an unlock email (but it's moot if I unlock a test account)

*/

function signupForSync(lang) {
  var email = emailFromLang(lang)
  var options = {
    service: 'sync',
    keys: true,
    lang: lang
  }

  return Client.createAndVerify(program.authServer,
                                email,
                                program.password,
                                program.mailserver,
                                options)
}

function signinAsSecondDevice(client) {
  var email = client.email
  var password = program.password
  var opts = {
    service: 'sync',
    reason: 'signin',
    lang: client.options.lang
  }

  return Client.login(program.authServer, email, password, opts)
    .then(function(client) {
      return fetchNotificationEmail(email, client)
    })
}

function changePassword(client) {
  var email = client.email
  var password = program.password
  var lang = langFromEmail(email)

  var headers = {
    'accept-language': lang
  }

  return Client.changePassword(program.authServer, email, password, password, headers)
    .then(function (client) {
      return fetchNotificationEmail(email, client)
    })
}

function passwordReset(client) {
  var email = client.email
  var password = program.password
  var lang = langFromEmail(email)

  var headers = {
    'accept-language': lang
  }

  return Client.login(program.authServer, email, password)
    .then(function (client) {
      return client.forgotPassword(lang)
        .then(function () {
          return program.mailserver.waitForCode(email)
        })
        .then(function (code) {
          return client.verifyPasswordResetCode(code, headers)
        })
        .then(function() {
          return client.resetPassword(program.password, headers)
        })
    })
    .then(function () {
      return Client.login(program.authServer, email, program.password)
        .then(function (client) {
          return fetchNotificationEmail(email, client)
        })
    })
}

// Note: /account/lock is not available in production
//XXX should I bother to complete the unlock?
function lockAndUnlockAccount(client) {
  var email = client.email
  var password = program.password
  var lang = langFromEmail(email)
  var authServer = program.authServer

  return Client.login(authServer, email, password)
    .then(function (client) {
      return client.lockAccount(email, password)
        .then(function () {
          return client.resendAccountUnlockCode(lang)
        })
        .then(function () {
          return fetchNotificationEmail(email, client)
        })
    })
}

function fetchNotificationEmail(email, client) {
  // Gather the notification email that was just sent for (new-device-added,
  // password-change, password-reset, account-unlock).
  return program.mailserver.waitForEmail(email)
    .then(function (/* message */) {
      return client
    })
}

function checkLocale(lang, index) {
  // AWS SES in `stage` has rate-limiting of 5/sec, so start slow.
  var delay = index * 750

  return P.delay(delay)
    .then(function() {
      log(log.INFO, 'Starting', lang)
      return signupForSync(lang)
        .then(signinAsSecondDevice)
        .then(changePassword)
        .then(passwordReset)
        .then(lockAndUnlockAccount)
    })
}

function dumpMessages(messages) {
  console.log('---')
  console.log('--- Dumping messages ---')
  console.log('---')
  Object.keys(messages)
    .map(function(key) {
      console.log('--- %s ---', key)
      emailMessages[key]
        .map(function(email) {
          console.log(email.to[0], email.subject)
        })
    })
}

function main() {
  program = configure()

  var checks = program.supportedLanguages.map(checkLocale)

  P.all(checks)
    .then(function() {
      if (process.env.DEBUG) {
        dumpMessages(emailMessages)
      }
      var errors = validateEmail(emailMessages, log)
      var output = []
      var errorCount = 0
      Object.keys(errors).sort().forEach(function(lang) {
        output.push('  ' + lang + ':')
        var errorList = errors[lang]
        errorList.forEach(function(err) {
          errorCount++
          output.push('    ' + err)
        })
      })
      if (errorCount > 0) {
        console.log('\nLocalization or other email errors found. However, some untranslated')
        console.log('locales are listed in ./localeQuirks to get the full state.\n')
        console.log(output.join('\n'))
        process.exit(1)
      } else {
        console.log('\nAll strings expected to be translated are ok.\n')
        process.exit(0)
      }
    }).catch(function(err) {
      log(log.ERROR, err.stack || err)
    })
}

main()
