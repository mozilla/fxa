/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const request = require('request');
const error = require('../error');

const ERRNO = {
  // From fxa-email-service, src/app_errors/mod.rs
  COMPLAINT: 106,
  SOFT_BOUNCE: 107,
  HARD_BOUNCE: 108,
};

module.exports = config => {
  function sendMail(emailConfig, cb) {
    // Email service requires that all headers are strings.
    const headers = {};
    for (const header in emailConfig.headers) {
      // Check to make sure header is not null. Issue #2771
      if (emailConfig.headers[header]) {
        headers[header] = emailConfig.headers[header].toString();
      }
    }
    const options = {
      url: `http://${config.emailService.host}:${config.emailService.port}/send`,
      method: 'POST',
      json: true,
      body: {
        cc: emailConfig.cc,
        to: emailConfig.to,
        subject: emailConfig.subject,
        headers,
        body: {
          text: emailConfig.text,
          html: emailConfig.html,
        },
      },
    };

    if (emailConfig.provider) {
      options.body.provider = emailConfig.provider;
    }

    request(options, (err, res, body) => {
      if (!err && res.statusCode >= 400) {
        err = marshallError(res.statusCode, body);
      }
      cb(err, {
        messageId: body && body.messageId,
        message: body && body.message,
      });
    });
  }

  function marshallError(status, body) {
    if (status === 429) {
      // Error structure is changing in mozilla/fxa-email-service#198,
      // temporarily handle both formats
      return marshallBounceError(body.errno, body.bouncedAt || body.time);
    }

    return error.unexpectedError();
  }

  function marshallBounceError(errno, bouncedAt) {
    switch (errno) {
      case ERRNO.COMPLAINT:
        return error.emailComplaint(bouncedAt);
      case ERRNO.SOFT_BOUNCE:
        return error.emailBouncedSoft(bouncedAt);
      case ERRNO.HARD_BOUNCE:
      default:
        return error.emailBouncedHard(bouncedAt);
    }
  }

  function close() {}

  return {
    sendMail,
    close,
  };
};
