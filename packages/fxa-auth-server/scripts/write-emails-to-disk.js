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
 *   postVerifySecondaryEmail
 *   postVerifyTrailheadEmail
 *   postTwoStepAuthenticationDisabled
 *   postTwoStepAuthenticationEnabled
 *   recoveryEmail
 *   unblockCodeEmail
 *   verifyEmail
 *   verifySecondaryEmail
 *   verifyLoginEmail
 *   verifyLoginCodeEmail
 *
 * Emails that are written to disk can be previewed in Firefox
 * to give a rough idea of how they would render in real life.
 */

'use strict';

// HACK: Prevent config falling over due to missing secrets
process.env.NODE_ENV = 'dev';

const P = require('bluebird');
const config = require('../config').getProperties();
const error = require('../lib/error');
const createSenders = require('../lib/senders');
const fs = require('fs');
const log = require('../lib/log')({});
const mkdirp = require('mkdirp');
const path = require('path');

const OUTPUT_DIRECTORY = path.join(__dirname, '..', '.mail_output');

const messageToSend = process.argv[2] || '';

const mailSender = {
  sendMail: function(emailConfig, done) {
    const htmlOutputPath = getEmailOutputPath(emailConfig.subject, 'html');
    fs.writeFileSync(htmlOutputPath, emailConfig.html);

    const textOutputPath = getEmailOutputPath(emailConfig.subject, 'txt');
    fs.writeFileSync(textOutputPath, emailConfig.text);

    done(null);
  },

  close: function() {},
};

const bounces = {
  // this is for dev purposes, no need to check db
  check: () => P.resolve(),
};

require('../lib/senders/translator')(
  config.i18n.supportedLanguages,
  config.i18n.defaultLanguage
)
  .then(translator => {
    return createSenders(
      log,
      config,
      error,
      bounces,
      translator,
      {},
      mailSender
    );
  })
  .then(senders => {
    const mailer = senders.email._ungatedMailer;
    checkMessageType(mailer, messageToSend);

    ensureTargetDirectoryExists();

    return sendMails(mailer, getMessageTypesToWrite(mailer, messageToSend));
  })
  .then(() => {
    console.info('done');
    process.exit(0);
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });

function getEmailOutputPath(subject, extension) {
  const outputFilename = `${subject.replace(/\s+/g, '_')}.${extension}`;
  return path.join(OUTPUT_DIRECTORY, outputFilename);
}

function sendMails(mailer, messagesToSend) {
  return P.all(messagesToSend.map(sendMail.bind(null, mailer)));
}

function sendMail(mailer, messageToSend) {
  const parts = messageToSend.split(':');
  const messageType = parts[0];
  const messageSubType = parts[1];

  const message = {
    acceptLanguage: 'en;q=0.8,en-US;q=0.5,en;q=0.3"',
    code: '123123',
    email: 'testuser@testuser.com',
    ip: '10.246.67.38',
    location: {
      city: 'Madrid',
      country: 'Spain',
    },
    locations: [],
    numberRemaining: 2,
    productId: '0123456789abcdef',
    redirectTo: 'https://redirect.com/',
    resume:
      'eyJjYW1wYWlnbiI6bnVsbCwiZW50cnlwb2ludCI6bnVsbCwiZmxvd0lkIjoiM2Q1ODZiNzY4Mzc2NGJhOWFiNzhkMzMxMTdjZDU4Y2RmYjk3Mzk5MWU5NTk0NjgxODBlMDUyMmY2MThhNmEyMSIsInJlc2V0UGFzc3dvcmRDb25maXJtIjp0cnVlLCJ1bmlxdWVVc2VySWQiOiI1ODNkOGFlYS00NzU3LTRiZTQtYWJlNC0wZWQ2NWZhY2Y2YWQiLCJ1dG1DYW1wYWlnbiI6bnVsbCwidXRtQ29udGVudCI6bnVsbCwidXRtTWVkaXVtIjpudWxsLCJ1dG1Tb3VyY2UiOm51bGwsInV0bVRlcm0iOm51bGx9',
    secondaryEmail: 'secondary@email',
    style: 'trailhead',
    service: 'sync',
    token: '47b22cd271963448cf36da95cccfcfb342b5693d66f58aa635f9a95579431002',
    timeZone: 'Europe/Madrid',
    type: messageSubType,
    uaBrowser: 'Firefox',
    uaBrowserVersion: '57',
    uaOS: 'Mac OSX',
    uaOSVersion: '10.11',
    unblockCode: '1ILO0Z5P',
    tokenCode: 'LIT12345',
    uid: '6510cb04abd742c6b3e4abefc7e39c9f',
  };

  return mailer[messageType](message);
}

function checkMessageType(mailer, messageToSend) {
  const messageTypes = getMailerMessageTypes(mailer);
  messageTypes.push('all');

  if (messageTypes.indexOf(messageToSend) === -1) {
    console.error(
      `invalid message name: \`${messageToSend}\`\n` +
        `choose from: ${messageTypes.join(', ')}`
    );
    process.exit(1);
  }
}

function getMailerMessageTypes(mailer) {
  const messageTypes = [];

  for (const key in mailer) {
    if (
      typeof mailer[key] === 'function' &&
      !/^_/.test(key) &&
      !/^send/.test(key) &&
      /Email$/.test(key)
    ) {
      messageTypes.push(key);
    }
  }

  return messageTypes.sort();
}

function getMessageTypesToWrite(mailer, messageToSend) {
  if (messageToSend === 'all') {
    return getMailerMessageTypes(mailer);
  } else {
    return [messageToSend];
  }
}

function ensureTargetDirectoryExists() {
  mkdirp.sync(OUTPUT_DIRECTORY);
}
