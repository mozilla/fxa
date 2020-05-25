/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const P = require('../lib/promise');

module.exports = MockSNS;

function MockSNS(options, config) {
  const mailerOptions = {
    host: config.smtp.host,
    secure: config.smtp.secure,
    ignoreTLS: !config.smtp.secure,
    port: config.smtp.port,
  };
  if (config.smtp.user && config.smtp.password) {
    mailerOptions.auth = {
      user: config.smtp.user,
      password: config.smtp.password,
    };
  }
  const mailer = require('nodemailer').createTransport(mailerOptions);

  return {
    getSMSAttributes() {
      return {
        promise: () =>
          P.resolve({
            attributes: {
              MonthlySpendLimit: config.sms.minimumCreditThresholdUSD,
            },
          }),
      };
    },

    publish(params) {
      const promise = new P((resolve) => {
        // HACK: Enable remote tests to see what was sent
        mailer.sendMail(
          {
            from: config.smtp.sender,
            to: `sms.${params.PhoneNumber}@restmail.net`,
            subject: 'MockSNS.publish',
            text: params.Message,
          },
          () => {
            resolve({
              MessageId: 'fake message id',
            });
          }
        );
      });
      return {
        promise: () => promise,
      };
    },
  };
}
