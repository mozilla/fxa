/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable no-console */

'use strict';
const MailParser = require('mailparser').MailParser;
const simplesmtp = require('simplesmtp');
const Redis = require('ioredis');
const config = require('../config').default.getProperties();

const TEMPLATES_WITH_NO_CODE = new Set(['passwordResetEmail']);

// SMS polling
const redis = new Redis(config.redis);
const usersLastSms = {};
async function printMatchingKeys(startUp = false) {
  const redisKeyPattern = 'recovery-phone:sms-attempt:*:*';
  try {
    const keys = await redis.keys(redisKeyPattern);

    if (keys.length > 0) {
      for (const key of keys) {
        const keyParts = key.split(':');
        const uid = keyParts[2];
        const code = keyParts[3];

        if (!usersLastSms[uid]) {
          usersLastSms[uid] = {};
        }

        // Check if this code was already printed for this user
        if (!usersLastSms[uid][code]) {
          if (!startUp) {
            console.log('\x1B[36mRecovery Phone Otp:', code, '\x1B[39m');
          }
          usersLastSms[uid][code] = true;
        }
      }
    }
  } catch (error) {
    console.error('Failed to retrieve keys:', error);
  } finally {
    // 1s delay seems reasonable
    setTimeout(printMatchingKeys, 1000);
  }
}

// SMTP half

const users = {};

function emailName(emailAddress) {
  const utf8Address = Buffer.from(emailAddress, 'binary').toString('utf-8');
  return utf8Address.split('@')[0];
}

module.exports = (printLogs) => {
  printLogs = printLogs || process.env.MAIL_HELPER_LOGS;
  const console = printLogs
    ? global.console
    : {
        log() {},
        error() {},
      };
  return new Promise((resolve, reject) => {
    const smtp = simplesmtp.createSimpleServer(
      {
        SMTPBanner: 'FXATEST',
      },
      (req) => {
        const mp = new MailParser({ defaultCharset: 'utf-8' });
        mp.on('end', (mail) => {
          const link = mail.headers['x-link'];
          const rc = mail.headers['x-recovery-code'];
          const rul = mail.headers['x-report-signin-link'];
          const uc = mail.headers['x-unblock-code'];
          const vc = mail.headers['x-verify-code'];
          const vsc = mail.headers['x-verify-short-code'];
          const sc = mail.headers['x-signin-verify-code'];
          const rpc = mail.headers['x-password-forgot-otp'];
          const template = mail.headers['x-template-name'];

          // Workaround because the email service wraps this header in `< >`.
          // See: https://github.com/mozilla/fxa-content-server/pull/6470#issuecomment-415224438
          // eslint-disable-next-line no-useless-escape
          const name = emailName(mail.headers.to.replace(/\<(.*?)\>/g, '$1'));

          if (vsc) {
            console.log('\x1B[34mSignin code', vsc, '\x1B[39m');
          } else if (vc) {
            console.log('\x1B[32m', link || vc, '\x1B[39m');
          } else if (sc) {
            console.log('\x1B[32mToken code: ', sc, '\x1B[39m');
          } else if (rc) {
            console.log('\x1B[34m', link, '\x1B[39m');
          } else if (uc) {
            console.log('\x1B[36mUnblock code:', uc, '\x1B[39m');
            console.log('\x1B[36mReport link:', rul, '\x1B[39m');
          } else if (rpc) {
            console.log('\x1B[36mReset password Otp:', rpc, '\x1B[39m');
          } else if (TEMPLATES_WITH_NO_CODE.has(template)) {
            console.log(`Notification email: ${template}`);
          } else {
            console.error('\x1B[31mNo verify code match\x1B[39m');
            console.error(mail);
          }

          if (users[name]) {
            users[name].push(mail);
          } else {
            users[name] = [mail];
          }

          if (mail.headers.cc) {
            // Support for CC headers
            const ccName = emailName(mail.headers.cc);

            if (users[ccName]) {
              users[ccName].push(mail);
            } else {
              users[ccName] = [mail];
            }
          }
        });
        req.pipe(mp);
        req.accept();
      }
    );

    smtp.listen(config.smtp.port, (err) => {
      if (!err) {
        console.log(`Local SMTP server listening on port ${config.smtp.port}`);
      } else {
        console.log('Error starting SMTP server...');
        console.log(err.message);
      }
    });

    // HTTP half

    const hapi = require('@hapi/hapi');
    const api = new hapi.Server({
      host: config.smtp.api.host,
      port: config.smtp.api.port,
    });

    function loop(email, cb) {
      const mail = users[email];
      if (!mail) {
        return setTimeout(loop.bind(null, email, cb), 50);
      }
      cb(mail);
    }

    api.route([
      {
        method: 'GET',
        path: '/mail/{email}',
        handler: async function (request) {
          const emailLoop = function () {
            return new Promise((resolve) => {
              loop(decodeURIComponent(request.params.email), (emailData) => {
                resolve(emailData);
              });
            });
          };

          return emailLoop().then((emailData) => {
            return emailData;
          });
        },
      },
      {
        method: 'DELETE',
        path: '/mail/{email}',
        handler: async function (request) {
          delete users[decodeURIComponent(request.params.email)];
          return {};
        },
      },
    ]);

    api.start().then(async () => {
      console.log('mail_helper started...');
      printMatchingKeys(true);
      return resolve({
        close() {
          return new Promise((resolve, reject) => {
            let smtpClosed = false;
            let apiClosed = false;
            redis.quit();
            smtp.server.end(() => {
              smtpClosed = true;
              if (apiClosed) {
                resolve();
              }
            });
            api.stop().then(() => {
              apiClosed = true;
              if (smtpClosed) {
                resolve();
              }
            });
          });
        },
      });
    });
  });
};

if (require.main === module) {
  module.exports(true);
}
