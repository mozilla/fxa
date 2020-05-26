#!/usr/bin/env ts-node-script

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = require('../../config').getProperties();

const args = parseArgs();
const log = require('../../lib/log')(config.log.level, 'send-sms');

require('../../lib/senders/translator')(
  config.i18n.supportedLanguages,
  config.i18n.defaultLanguage
)
  .then((translator) => {
    return require('../../lib/senders')(log, config, {}, null, translator);
  })
  .then((senders) => {
    return senders.sms.send.apply(null, args);
  })
  .then(() => {
    console.log('SENT!');
  })
  .catch((error) => {
    let message = error.message;
    if (error.reason && error.reasonCode) {
      message = `${message}: ${error.reasonCode} ${error.reason}`;
    } else if (error.stack) {
      message = error.stack;
    }
    fail(message);
  });

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs() {
  let acceptLanguage, messageName, phoneNumber;

  switch (process.argv.length) {
    /* eslint-disable indent, no-fallthrough */
    case 5:
      acceptLanguage = process.argv[5];
    case 4:
      messageName = process.argv[4];
    case 3:
      phoneNumber = process.argv[2];
      break;
    default:
      fail(
        `Usage: ${process.argv[1]} phoneNumber [messageName] [acceptLanguage]`
      );
    /* eslint-enable indent, no-fallthrough */
  }

  return [phoneNumber, messageName || 'installFirefox', acceptLanguage || 'en'];
}
