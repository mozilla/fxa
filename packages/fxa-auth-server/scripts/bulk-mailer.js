#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var commandLineOptions = require('commander')
var config = require('../config').getProperties()
var fs = require('fs')
var leftpad = require('leftpad')
var log = require('../lib/log')(config.log.level, 'bulk-mailer')
var Mailer = require('../mailer/index')
var nodeMailerMock = require('./bulk-mailer/nodemailer-mock')
var P = require('../lib/promise')
var path = require('path')

commandLineOptions
  .option('-b, --batchsize [size]', 'Number of emails to send in a batch. Defaults to 10', parseInt)
  .option('-d, --delay [seconds]', 'Delay in seconds between batches. Defaults to 5', parseInt)
  .option('-e, --errors [filename]', 'JSON output file that contains errored emails. Defaults to ./errors.json')
  .option('-i, --input <filename>', 'JSON input file')
  .option('-t, --template <template>', 'Template filename to render')
  .option('-u, --unsent [filename]', 'JSON output file that contains emails that were not sent. Defaults to ./unsent.json')
  .option('-w, --write [directory]', 'Directory where emails should be stored')
  .option('--real', 'Use real email addresses, fake ones are used by default')
  .option('--send', 'Send emails, for real. *** THIS REALLY SENDS ***')
  .parse(process.argv)

var BATCH_DELAY = typeof commandLineOptions.delay === 'undefined' ? 5 : commandLineOptions.delay
var BATCH_SIZE = commandLineOptions.batchsize || 10

var ERRORS_REPORT_FILENAME = path.resolve(commandLineOptions.errors || 'errors.json')
var UNSENT_REPORT_FILENAME = path.resolve(commandLineOptions.unsent || 'unsent.json')

var requiredOptions = [
  'input',
  'template'
]

requiredOptions.forEach(checkRequiredOption)

var mailer
var mailerFunctionName = templateToMailerFunctionName(commandLineOptions.template)

var currentBatch = []
var emailQueue = []
var errorCount = 0
var runningError
var successCount = 0

P.resolve()
  .then(createMailer)
  .then(function (_mailer) {
    mailer = _mailer

    if (! mailer[mailerFunctionName]) {
      console.error(commandLineOptions.template, 'is not a valid template')
      process.exit(1)
    }
  })
  .then(readRecords)
  .then(normalizeRecords)
  .then(function (normalizedRecords) {
    emailQueue = normalizedRecords

    log.info({
      op: 'send.begin',
      count: emailQueue.length,
      test: ! commandLineOptions.send
    })
  })
  .then(nextBatch)
  .then(function () {
    log.info({
      op: 'send.complete',
      count: errorCount + successCount,
      successCount: successCount,
      errorCount: errorCount
    })
  })
  .then(null, function (error) {
    log.error({
      op: 'send.abort',
      err: error
    })
    runningError = error
  })
  .then(writeErrors)
  .then(writeUnsent)
  .then(function () {
    process.exit(runningError || errorCount ? 1 : 0)
  })

var fakeEmailCount = 0
function normalizeRecords(records) {
  return records.filter(function (record) {
    // no email can be sent if the record does not contain an email
    return !! record.email
  }).map(function (record) {
    // real emails are replaced by fake emails by default.
    if (! commandLineOptions.real) {
      record.email = 'fake_email' + fakeEmailCount + '@fakedomain.com'
      fakeEmailCount++
    }

    // The Chinese translations were handed to us as "zh" w/o a country
    // specified. We put these translations into "zh-cn", use "zh-cn" for
    // Taiwan as well.
    if (! record.acceptLanguage && record.locale) {
      record.acceptLanguage = record.locale.replace(/zh-tw/gi, 'zh-cn')
    }

    if (! record.locations) {
      record.locations = []
    } else {
      var translator = mailer.translator(record.acceptLanguage)
      var language = translator.language
      record.language = language

      record.locations.forEach(function (location) {
        var timestamp = new Date(location.timestamp || location.date)
        location.timestamp = formatTimestamp(timestamp, record.acceptLanguage)

        // first, try to generate a localized locality
        if (! location.location && location.citynames && location.countrynames) {
          var parts = []

          var localizedCityName = location.citynames[language]
          if (localizedCityName) {
            parts.push(localizedCityName)
          }

          var localizedCountryName = location.countrynames[language]
          if (localizedCountryName) {
            parts.push(localizedCountryName)
          }

          location.location = parts.join(', ')
        }

        // if that can't be done, fall back to the english locality
        if (! location.location && location.locality) {
          location.location = location.locality
        }
      })
    }

    return record
  })
}

function nextBatch() {
  currentBatch = emailQueue.splice(0, BATCH_SIZE)

  if (! currentBatch.length) {
    return
  }

  return sendBatch(currentBatch)
    .then(function () {
      currentBatch = []
    })
    .then(function () {
      if (emailQueue.length) {
        return P.delay(BATCH_DELAY * 1000)
          .then(nextBatch)
      }
    })
}

function sendBatch(batch) {
  return P.all(
    batch.map(function (emailConfig) {
      return mailer[mailerFunctionName](emailConfig)
        .then(function () {
          successCount++
          log.info({
            op: 'send.success',
            email: emailConfig.email
          })
        }, function (err) {
          handleEmailError(emailConfig, err)
        })
    })
  )
}

var erroredEmailConfigs = []
function handleEmailError(emailConfig, error) {
  errorCount++

  emailConfig.error = String(error)
  erroredEmailConfigs.push(emailConfig)

  log.error({
    op: 'send.error',
    email: emailConfig.email,
    error: error
  })
}

// output format should be identical to the input format. This makes it
// possible to use the error output as input to another test run.
function writeErrors() {
  fs.writeFileSync(ERRORS_REPORT_FILENAME, JSON.stringify(cleanEmailConfigsConfigs(erroredEmailConfigs), null, 2))
}

function writeUnsent() {
  // consider all emails in the current batch +
  // all emails in the emailQueue as unsent.
  // If there was an error sending the current batch,
  // we aren't fully sure which are sent, and which aren't.
  var unsentEmails = [].concat(currentBatch).concat(emailQueue)

  fs.writeFileSync(UNSENT_REPORT_FILENAME, JSON.stringify(cleanEmailConfigsConfigs(unsentEmails), null, 2))
}

function cleanEmailConfigsConfigs(erroredEmailConfigs) {
  return erroredEmailConfigs.map(function (emailConfig) {
    emailConfig.locations.forEach(function (location) {
      delete location.translator
    })
    return emailConfig
  })
}

function camelize(str) {
  return str.replace(/_(.)/g,
    function(match, c) {
      return c.toUpperCase()
    }
  )
}

function templateToMailerFunctionName(templateName) {
  return camelize(templateName) + 'Email'
}

function createMailer () {
  var sender = commandLineOptions.send ? null : nodeMailerMock({
    failureRate: 0,
    outputDir: commandLineOptions.write ? path.resolve(commandLineOptions.write) : null
  })

  var defaultLanguage = config.i18n.defaultLanguage

  return Mailer(log, {
    locales: config.i18n.supportedLanguages,
    defaultLanguage: defaultLanguage,
    mail: config.smtp
  }, sender).email
}

function checkRequiredOption(optionName) {
  if (! commandLineOptions[optionName]) {
    console.error('--' + optionName + ' required')
    process.exit(1)
  }
}

function readRecords() {
  var inputFileName = path.resolve(commandLineOptions.input)
  var fsStats
  try {
    fsStats = fs.statSync(inputFileName)
  } catch (e) {
    console.error(inputFileName, 'invalid filename')
    process.exit(1)
  }

  if (! fsStats.isFile()) {
    console.error(inputFileName, 'is not a file')
    process.exit(1)
  }

  var records = []
  try {
    records = require(inputFileName)
  } catch(e) {
    console.error(inputFileName, 'does not contain JSON')
    process.exit(1)
  }

  if (! records.length) {
    console.error('uh oh, no emails found')
    process.exit(1)
  }

  return records
}

function formatTimestamp(timestamp, locale) {
  return timestamp.getUTCFullYear() + '-' + leftpad(timestamp.getUTCMonth(), 2) + '-' + leftpad(timestamp.getUTCDate(), 2) + ' @ ' + leftpad(timestamp.getUTCHours(), 2) + ':' + leftpad(timestamp.getUTCMinutes(), 2) + ' UTC'
}
