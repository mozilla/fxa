/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Write emails to disk. Output is written to ./.mail_output/<email type>.html
 *
 * Usage:
 * node ./scripts/write-to-disk.js <email type>
 *
 * Where <email type> is one of:
 *   all
 *   newDeviceLoginEmail
 *   passwordChangedEmail
 *   passwordResetEmail
 *   passwordResetRequiredEmail
 *   postVerifyEmail
 *   recoveryEmail
 *   unblockCodeEmail
 *   verificationReminderEmail:first
 *   verificationReminderEmail:second
 *   verifyEmail
 *   verifyLoginEmail
 *
 * Emails that are written to disk can be previewed in Firefox
 * to give a rough idea of how they would render in real life.
 */

var P = require('bluebird')
var config = require('../config')
const createSenders = require('../lib/senders')
var fs = require('fs')
const log = require('../lib/senders/legacy_log')(require('../lib/senders/log')('server'))
var mkdirp = require('mkdirp')
var path = require('path')

var OUTPUT_DIRECTORY = path.join(__dirname, '..', '.mail_output')

var messageToSend = process.argv[2] || ''

var mailSender = {
  sendMail: function (emailConfig,  done) {
    var htmlOutputPath = getEmailOutputPath(emailConfig.subject, 'html')
    fs.writeFileSync(htmlOutputPath, emailConfig.html)

    var textOutputPath = getEmailOutputPath(emailConfig.subject, 'txt')
    fs.writeFileSync(textOutputPath, emailConfig.text)

    done(null)
  },

  close: function () {}
}


createSenders(config.getProperties(), log, mailSender)
  .then((senders) => {
    const mailer = senders.email
    checkMessageType(mailer, messageToSend)

    ensureTargetDirectoryExists()

    return sendMails(mailer, getMessageTypesToWrite(mailer, messageToSend))
  })
  .then(() => {
    console.info('done')
  })

function getEmailOutputPath(subject, extension) {
  var outputFilename = subject.replace(/\s+/g, '_') + '.' + extension
  return path.join(OUTPUT_DIRECTORY, outputFilename)
}


function sendMails(mailer, messagesToSend) {
  return P.all(messagesToSend.map(sendMail.bind(null, mailer)))
}

function sendMail(mailer, messageToSend) {
  var parts = messageToSend.split(':')
  var messageType = parts[0]
  var messageSubType = parts[1]

  var message = {
    acceptLanguage: 'en;q=0.8,en-US;q=0.5,en;q=0.3"',
    code: 'ae35999f861ffc81d594034eb4560af8',
    email: 'testuser@testuser.com',
    ip: '10.246.67.38',
    location: {
      city: 'Madrid',
      country: 'Spain'
    },
    locations: [],
    redirectTo: 'https://redirect.com/',
    resume: 'eyJjYW1wYWlnbiI6bnVsbCwiZW50cnlwb2ludCI6bnVsbCwiZmxvd0lkIjoiM2Q1ODZiNzY4Mzc2NGJhOWFiNzhkMzMxMTdjZDU4Y2RmYjk3Mzk5MWU5NTk0NjgxODBlMDUyMmY2MThhNmEyMSIsInJlc2V0UGFzc3dvcmRDb25maXJtIjp0cnVlLCJ1bmlxdWVVc2VySWQiOiI1ODNkOGFlYS00NzU3LTRiZTQtYWJlNC0wZWQ2NWZhY2Y2YWQiLCJ1dG1DYW1wYWlnbiI6bnVsbCwidXRtQ29udGVudCI6bnVsbCwidXRtTWVkaXVtIjpudWxsLCJ1dG1Tb3VyY2UiOm51bGwsInV0bVRlcm0iOm51bGx9',
    service: 'sync',
    token: '47b22cd271963448cf36da95cccfcfb342b5693d66f58aa635f9a95579431002',
    timeZone: 'Europe/Madrid',
    type: messageSubType,
    uaBrowser: 'Firefox',
    uaBrowserVersion: '51',
    uaOS: 'Mac OSX',
    uaOSVersion: '10.11',
    unblockCode: '1ILO0Z5P',
    uid: '6510cb04abd742c6b3e4abefc7e39c9f'
  }

  return mailer[messageType](message)
}

function checkMessageType(mailer, messageToSend) {
  var messageTypes = getMailerMessageTypes(mailer)
  messageTypes.push('all')

  if (messageTypes.indexOf(messageToSend) === -1) {
    console.error('invalid message name: `' + messageToSend + '`\n' +
              'choose from: ' + messageTypes.join(', '))
    process.exit(1)
  }
}


function getMailerMessageTypes(mailer) {
  var messageTypes = []

  for (var key in mailer) {
    if (typeof mailer[key] === 'function' && ! /^_/.test(key) && /Email$/.test(key)) {
      messageTypes.push(key)
    }
  }

  return messageTypes.sort()
}

function getMessageTypesToWrite(mailer, messageToSend) {
  if (messageToSend === 'all') {
    return getMailerMessageTypes(mailer)
  } else {
    return [messageToSend]
  }
}

function ensureTargetDirectoryExists() {
  mkdirp.sync(OUTPUT_DIRECTORY)
}
