/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const chunk = require('lodash.chunk');
const config = require('../../config').getProperties();
const error = require('../../lib/error');
const P = require('../../lib/promise');
const readUserRecords = require('./read-user-records');
const sendEmailBatches = require('./send-email-batches');
const Senders = require('../../lib/senders');
const Translator = require('../../lib/senders/translator');
const UserRecordNormalizer = require('./normalize-user-records');
const WriteToStreamSenderMock = require('./nodemailer-mocks/stream-output-mock');
const WriteToDiskSenderMock = require('./nodemailer-mocks/write-to-disk-mock');

const oauthdbMock = {
  getClientInfo: () => P.reject('should not get called'),
};

/**
 * Send an email to users listed in the file `userRecordFilename` using `mailerMethodName`
 * in batches of `batchSize` with `batchDelayMS` between batches.
 *
 * @param {String} userRecordsFilename name of file that contains user records
 * @param {String} mailerMethodName name of the mailer method which sends the emails
 * @param {Number} batchSize batch size
 * @param {Number} batchDelayMSdelay between batches
 * @param {Boolean} shouldSend if emails should be sent, for real. If false, emails
 *   will instead be written to stdout or a directory. If `emailOutputDirname` is undefined,
 *   emails will be written to stdout, if `emailOutputDirname` is defined, it will be used
 *   as the output directory.
 * @param {String} emailOutputDirname if `shouldSend` is falsy, write emails to this directory.
 *   See `shouldSend`
 * @param {Boolean} useVerboseLogging if `true`, print info/trace messages to the console
 */
module.exports = async function (
  userRecordsFilename,
  mailerMethodName,
  batchSize,
  batchDelayMS,
  shouldSend,
  emailOutputDirname,
  useVerboseLogging
) {
  const logMock = {
    amplitudeEvent: () => {},
    error: console.error,
    info(msg) {
      if (useVerboseLogging) {
        console.info(JSON.stringify(msg));
      }
    },
    trace(msg) {
      if (useVerboseLogging) {
        console.info(JSON.stringify(msg));
      }
    },
  };

  const translator = await createTranslator(config);
  const mailer = await createMailer(
    logMock,
    config,
    translator,
    shouldSend,
    emailOutputDirname
  );
  const sendDelegate = createSendDelegate(mailer, mailerMethodName);

  const userRecords = await readUserRecords(userRecordsFilename);
  const normalizedUserRecords = await normalizeUserRecords(
    userRecords,
    translator
  );
  const batches = chunk(normalizedUserRecords, batchSize);

  const isTest = !shouldSend;

  return sendEmailBatches(batches, batchDelayMS, sendDelegate, logMock, isTest);
};

function normalizeUserRecords(userRecords, translator) {
  const normalizer = new UserRecordNormalizer();
  return normalizer.normalize(userRecords, translator);
}

function getValidMailerMethodNames(mailer) {
  return Object.keys(mailer).filter((name) => {
    return (
      typeof mailer[name] === 'function' &&
      !/translator|stop|_ungatedMailer/.test(name)
    );
  });
}

function isValidMailerMethod(mailer, method) {
  const validMethods = getValidMailerMethodNames(mailer);

  return validMethods.indexOf(method) > -1;
}

function createSendDelegate(mailer, mailerMethodName) {
  if (!isValidMailerMethod(mailer, mailerMethodName)) {
    const err = new Error(`InvalidMethodName: ${mailerMethodName}`);
    err.validNames = getValidMailerMethodNames(mailer);
    throw err;
  }

  return (userRecord) => {
    return mailer[mailerMethodName](userRecord.emails, userRecord, {
      acceptLanguage: userRecord.locale,
    });
  };
}

async function createMailer(
  log,
  config,
  translator,
  shouldSend,
  emailOutputDirname
) {
  const sender = shouldSend ? null : createSenderMock(emailOutputDirname);

  return (
    await Senders(log, config, error, translator, oauthdbMock, null, sender)
  ).email;
}

function createSenderMock(emailOutputDirname) {
  if (emailOutputDirname) {
    return new WriteToDiskSenderMock({
      failureRate: 0,
      outputDir: emailOutputDirname,
    });
  }
  return new WriteToStreamSenderMock({
    failureRate: 0,
    stream: process.stdout,
  });
}

function createTranslator(config) {
  return Translator(
    config.i18n.supportedLanguages,
    config.i18n.defaultLanguage
  );
}
