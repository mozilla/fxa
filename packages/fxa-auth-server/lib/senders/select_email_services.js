/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Promise = require('../promise');
const { SandboxedRegExp } = require('sandboxed-regexp');

const SERVICES = {
  internal: Symbol(),
  external: {
    sendgrid: Symbol(),
    socketlabs: Symbol(),
    ses: Symbol(),
  },
};

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
// Regular expressions are executed using the `SandboxedRegExp` class in order
// to protect againt DoS if a malicious regex happened to make its way into the
// live config; as a result the regex syntax may differ from that of standard
// javascript, but you shouldn't be putting complex regex in here anyway.
//
// See https://github.com/mozilla/sandboxed-regexp#being-careful-with-it
// for details.

class LiveConfigForSender {
  constructor(props) {
    const { percentage, regex } = props;
    if (percentage && percentage >= 0 && percentage < 100) {
      this.percentage = percentage;
    } else {
      this.percentage = 0;
    }
    if (regex) {
      this.regex = new SandboxedRegExp(regex);
    } else {
      this.regex = null;
    }
  }

  match(emailAddress) {
    if (this.percentage && Math.floor(Math.random() * 100) >= this.percentage) {
      return false;
    }
    if (this.regex && !this.regex.test(emailAddress)) {
      return false;
    }
    return true;
  }
}

class LiveConfig {
  constructor(sendgrid, socketlabs, ses) {
    /** @type {LiveConfigForSender} */
    this.sendgrid = sendgrid;
    /** @type {LiveConfigForSender} */
    this.socketlabs = socketlabs;
    /** @type {LiveConfigForSender} */
    this.ses = ses;
  }

  /**
   *
   * @param {string} string
   * @returns {LiveConfig}
   */
  static parse(string) {
    const obj = JSON.parse(string);
    return new LiveConfig(
      obj.sendgrid ? new LiveConfigForSender(obj.sendgrid) : null,
      obj.socketlabs ? new LiveConfigForSender(obj.socketlabs) : null,
      obj.ses ? new LiveConfigForSender(obj.ses) : null
    );
  }

  match(emailAddress) {
    if (this.sendgrid && this.sendgrid.match(emailAddress)) {
      return 'sendgrid';
    }
    if (this.socketlabs && this.socketlabs.match(emailAddress)) {
      return 'socketlabs';
    }
    if (this.ses && this.ses.match(emailAddress)) {
      return 'ses';
    }
    return null;
  }
}

module.exports = (log, config, mailer, emailService) => {
  const redis = require('../redis')(
    Object.assign({}, config.redis, config.redis.email),
    log
  ) || {
    // Fallback to a stub implementation if redis is disabled
    get: () => Promise.resolve(),
  };

  // We don't expect the live config to change very often, so this
  // is a simple one-item cache to avoid re-processing the value.
  let lastSeenLiveConfig = null;
  let lastSeenLiveConfigParsed = null;

  // Based on the to and cc email addresses of a message, return an array of
  // `Service` objects that control how email traffic will be routed.
  //
  // It will attempt to read live config data from Redis and live config takes
  // precedence over local static config. If no config is found at all, email
  // will be routed locally via the auth server. See the `LiveConfig` class
  // for details of the config format.
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
  return async (message) => {
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
      if (liveConfig === lastSeenLiveConfig) {
        liveConfig = lastSeenLiveConfigParsed;
      } else {
        try {
          lastSeenLiveConfig = liveConfig;
          liveConfig = LiveConfig.parse(liveConfig);
          lastSeenLiveConfigParsed = liveConfig;
        } catch (err) {
          lastSeenLiveConfig = lastSeenLiveConfigParsed = null;
          log.error('emailConfig.parse.error', { err: err.message });
        }
      }
    }

    const services = emailAddresses.reduce((services, emailAddress) => {
      if (liveConfig) {
        const which = liveConfig.match(emailAddress);
        if (which) {
          return upsertServicesMap(
            services,
            SERVICES.external[which],
            emailAddress,
            {
              mailer: emailService,
              emailService: 'fxa-email-service',
              emailSender: which,
            }
          );
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
    }, new Map());

    return Array.from(services.values());
  };
};

function upsertServicesMap(services, service, emailAddress, data) {
  if (services.has(service)) {
    services.get(service).emailAddresses.push(emailAddress);
  } else {
    services.set(service, { emailAddresses: [emailAddress], ...data });
  }

  return services;
}
