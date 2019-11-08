#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const commander = require('commander');

const P = require('../../lib/promise');
const Client = require('../../test/client')();
const mailbox = require('../../test/mailbox');
const validateEmail = require('./validate-email');

const emailMessages = {};
let program;

function configure() {
  commander
    .option(
      '-a, --auth-server [url]',
      'URL of FxA Auth Server',
      'https://api-accounts.stage.mozaws.net'
    )
    .option(
      '-l, --locales [path]',
      'Path to file with a list of locales to test',
      '../../config/supportedLanguages.js'
    )
    .option(
      '-r, --restmail-domain [fqdn]',
      'URL of the restmail server',
      'restmail.net'
    )
    .option(
      '-L, --locale <en[,zh-TW,de,...]>',
      'Test only this csv list of locales',
      list => {
        return list.split(/,/);
      }
    )
    .parse(process.argv);

  commander.basename = crypto.randomBytes(8).toString('hex');
  commander.password = crypto.randomBytes(16).toString('hex');

  commander.supportedLanguages =
    commander.locale || require(commander.locales).slice(0);

  const mailserver = (commander.mailserver = mailbox(
    commander.restmailDomain,
    80
  ));

  mailserver.eventEmitter.on('email:message', (email, message) => {
    emailMessages[email] = emailMessages[email] || [];
    emailMessages[email].push(message);
  });

  mailserver.eventEmitter.on('email:error', (email, error) => {
    emailMessages[email] = emailMessages[email] || [];
    emailMessages[email].push(error);
  });

  return commander;
}

function log(level /*, rest */) {
  if (level < log.level) {
    return;
  }
  const args = Array.prototype.slice.call(arguments);
  const timestamp = `[${new Date().toISOString()}]`;
  args[0] = timestamp;
  console.log.apply(null, args);
}

log.ERROR = 3;
log.INFO = 2;
log.DEBUG = 1;
log.level = log.INFO;

function emailFromLang(lang) {
  return `${program.basename}-${lang}@${program.restmailDomain}`;
}

function langFromEmail(email) {
  // is like 'deadbeef-es@...' or 'deadbeef-es-AR@...'
  return email.split('@')[0].match(/^[^-]*-([^-]*(?:-[^-]*)?)/)[1];
}

/*
  - signup for service sync
  - signin as if second device
  - change the password
  - trigger a password reset

  With the collected emails:
  - CHECK that I get a signup email
  - CHECK that I get a notification email of a second device
  - CHECK that I get a notification email of a password change
  - CHECK that I get a password reset email
  - CHECK that I get a notification email of a password reset

*/

function signupForSync(lang) {
  const email = emailFromLang(lang);
  const options = {
    service: 'sync',
    keys: true,
    lang: lang,
  };

  return Client.createAndVerify(
    program.authServer,
    email,
    program.password,
    program.mailserver,
    options
  );
}

function signinAsSecondDevice(client) {
  const email = client.email;
  const password = program.password;
  const opts = {
    service: 'sync',
    keys: true,
    reason: 'signin',
    lang: client.options.lang,
  };

  return Client.login(program.authServer, email, password, opts).then(
    client => {
      return client.keys().then(() => {
        return fetchNotificationEmail(client);
      });
    }
  );
}

function changePassword(client) {
  const email = client.email;
  const password = program.password;
  const lang = langFromEmail(email);

  const headers = {
    'accept-language': lang,
  };

  return client
    .changePassword(password, headers, client.sessionToken)
    .then(() => {
      return fetchNotificationEmail(client);
    });
}

function passwordReset(client) {
  const email = client.email;
  const lang = langFromEmail(email);

  const headers = {
    'accept-language': lang,
  };

  return client
    .forgotPassword(lang)
    .then(() => {
      return program.mailserver.waitForCode(email);
    })
    .then(code => {
      return client.verifyPasswordResetCode(code, headers);
    })
    .then(() => {
      return client.resetPassword(program.password, headers);
    })
    .then(() => {
      return fetchNotificationEmail(client);
    });
}

function fetchNotificationEmail(client) {
  // Gather the notification email that was just sent for (new-device-added,
  // password-change, password-reset).
  return program.mailserver.waitForEmail(client.email).then(() => {
    return client;
  });
}

function checkLocale(lang, index) {
  // AWS SES in `stage` has rate-limiting of 5/sec, so start slow.
  const delay = index * 750;

  return P.delay(delay).then(() => {
    log(log.INFO, 'Starting', lang);
    return signupForSync(lang)
      .then(signinAsSecondDevice)
      .then(changePassword)
      .then(passwordReset);
  });
}

function dumpMessages(messages) {
  console.log('---');
  console.log('--- Dumping messages ---');
  console.log('---');
  Object.keys(messages).map(key => {
    console.log('--- %s ---', key);
    emailMessages[key].map(email => {
      console.log(email.to[0], email.subject);
    });
  });
}

function main() {
  program = configure();

  const checks = program.supportedLanguages.map(checkLocale);

  P.all(checks)
    .then(() => {
      if (process.env.DEBUG) {
        dumpMessages(emailMessages);
      }
      const errors = validateEmail(emailMessages, log);
      const output = [];
      let errorCount = 0;
      Object.keys(errors)
        .sort()
        .forEach(lang => {
          output.push(`  ${lang}:`);
          const errorList = errors[lang];
          errorList.forEach(err => {
            errorCount++;
            output.push(`    ${err}`);
          });
        });
      if (errorCount > 0) {
        console.log(
          '\nLocalization or other email errors found. However, some untranslated'
        );
        console.log(
          'locales are listed in ./localeQuirks to get the full state.\n'
        );
        console.log(output.join('\n'));
        process.exit(1);
      } else {
        console.log('\nAll strings expected to be translated are ok.\n');
        process.exit(0);
      }
    })
    .catch(err => {
      log(log.ERROR, err.stack || err);
      process.exit(1);
    });
}

main();
