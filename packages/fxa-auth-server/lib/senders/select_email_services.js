/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Promise = require('../promise');
const safeRegex = require('safe-regex');
const Sandbox = require('sandbox');

const SERVICES = {
  internal: Symbol(),
  external: {
    sendgrid: Symbol(),
    socketlabs: Symbol(),
    ses: Symbol(),
  },
};

module.exports = (log, config, mailer, emailService) => {
  const redis = require('../redis')(
    Object.assign({}, config.redis, config.redis.email),
    log
  ) || {
    // Fallback to a stub implementation if redis is disabled
    get: () => Promise.resolve(),
  };

  // Based on the to and cc email addresses of a message, return an array of
  // `Service` objects that control how email traffic will be routed.
  //
  // It will attempt to read live config data from Redis and live config takes
  // precedence over local static config. If no config is found at all, email
  // will be routed locally via the auth server.
  //
  // Live config looks like this (every property is optional):
  //
  // {
  //   sendgrid: {
  //     percentage: 100,
  //     regex: "^.+@example\.com$"
  //   },
  //   socketlabs: {
  //     percentage: 100,
  //     regex: "^.+@example\.org$"
  //   },
  //   ses: {
  //     percentage: 10,
  //     regex: ".*",
  //   }
  // }
  //
  // Where a percentage and a regex are both present, an email address must
  // satisfy both criteria to count as a match. Where an email address matches
  // sendgrid and ses, sendgrid wins. Where an email address matches socketlabs
  // and ses, socketlabs wins. Where an email address matches sendgrid and
  // socketlabs, sendgrid wins.
  //
  // If a regex has a star height greater than 1, the email address will be
  // treated as a non-match without executing the regex (to prevent us redosing
  // ourselves). If a regex takes longer than 100 milliseconds to execute,
  // it will be killed and the email address will be treated as a non-match.
  //
  // @param {Object} message
  //
  // @returns {Promise} Resolves to an array of `Service` objects.
  //
  // @typedef {Object} Service
  //
  // @property {Object} mailer           The object on which to invoke the `sendMail`
  //                                     method.
  //
  // @property {String[]} emailAddresses The array of email addresses to send to.
  //                                     The address at index 0 will be used as the
  //                                     `to` address and any remaining addresses
  //                                     will be included as `cc` addresses.
  //
  // @property {String} emailService     The name of the email service for metrics.
  //
  // @property {String} emailSender      The name of the underlying email sender,
  //                                     used for both metrics and sent as the
  //                                     `provider` param in external requests.
  return async message => {
    const emailAddresses = [message.email];
    if (Array.isArray(message.ccEmails)) {
      emailAddresses.push(...message.ccEmails);
    }

    let liveConfig;
    try {
      liveConfig = await redis.get('config');
    } catch (err) {
      log.error('emailConfig.read.error', { err: err.message });
    }

    if (liveConfig) {
      try {
        liveConfig = JSON.parse(liveConfig);
      } catch (err) {
        log.error('emailConfig.parse.error', { err: err.message });
      }
    }

    const services = await emailAddresses.reduce(
      async (promise, emailAddress) => {
        const services = await promise;

        if (liveConfig) {
          const isMatched = await ['sendgrid', 'socketlabs', 'ses'].reduce(
            async (promise, key) => {
              if (await promise) {
                return true;
              }

              const senderConfig = liveConfig[key];

              if (
                senderConfig &&
                (await isLiveConfigMatch(senderConfig, emailAddress))
              ) {
                upsertServicesMap(
                  services,
                  SERVICES.external[key],
                  emailAddress,
                  {
                    mailer: emailService,
                    emailService: 'fxa-email-service',
                    emailSender: key,
                  }
                );

                return true;
              }

              return false;
            },
            Promise.resolve()
          );

          if (isMatched) {
            return services;
          }
        }

        if (config.emailService.forcedEmailAddresses.test(emailAddress)) {
          return upsertServicesMap(
            services,
            SERVICES.external.ses,
            emailAddress,
            {
              mailer: emailService,
              emailService: 'fxa-email-service',
              emailSender: 'ses',
            }
          );
        }

        return upsertServicesMap(services, SERVICES.internal, emailAddress, {
          mailer,
          emailService: 'fxa-auth-server',
          emailSender: 'ses',
        });
      },
      Promise.resolve(new Map())
    );

    return Array.from(services.values());
  };
};

async function isLiveConfigMatch(liveConfig, emailAddress) {
  return new Promise(resolve => {
    const { percentage, regex } = liveConfig;

    if (
      percentage >= 0 &&
      percentage < 100 &&
      Math.floor(Math.random() * 100) >= percentage
    ) {
      resolve(false);
      return;
    }

    if (regex) {
      if (
        regex.indexOf('"') !== -1 ||
        emailAddress.indexOf('"') !== -1 ||
        !safeRegex(regex)
      ) {
        resolve(false);
        return;
      }

      // Execute the regex inside a sandbox and kill it if it takes > 100 ms
      const sandbox = new Sandbox({ timeout: 100 });
      sandbox.run(`new RegExp("${regex}").test("${emailAddress}")`, output => {
        resolve(output.result === 'true');
      });
      return;
    }

    resolve(true);
  });
}

function upsertServicesMap(services, service, emailAddress, data) {
  if (services.has(service)) {
    services.get(service).emailAddresses.push(emailAddress);
  } else {
    services.set(service, { emailAddresses: [emailAddress], ...data });
  }

  return services;
}
