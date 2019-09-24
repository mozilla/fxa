/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Cloudwatch = require('aws-sdk/clients/cloudwatch');
const error = require('../error');
const MockSns = require('../../test/mock-sns');
const P = require('bluebird');
const Sns = require('aws-sdk/clients/sns');
const time = require('../time');

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * 1000;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * 60;
const PERIOD_IN_MINUTES = 5;

class MockCloudwatch {
  getMetricStatistics() {
    return {
      promise: () => P.resolve({ Datapoints: [{ Maximum: 0 }] }),
    };
  }
}

module.exports = (log, translator, templates, config, statsd) => {
  const cloudwatch = initService(config, Cloudwatch, MockCloudwatch);
  const sns = initService(config, Sns, MockSns);

  const { minimumCreditThresholdUSD: CREDIT_THRESHOLD } = config.sms;

  let isBudgetOk = true;

  if (config.sms.enableBudgetChecks) {
    setImmediate(pollCurrentSpend);
  }

  return {
    isBudgetOk: () => isBudgetOk,

    send(phoneNumber, templateName, acceptLanguage, signinCode) {
      log.trace('sms.send', { templateName, acceptLanguage });

      return P.resolve().then(() => {
        const message = getMessage(templateName, acceptLanguage, signinCode);
        const params = {
          Message: message.trim(),
          MessageAttributes: {
            'AWS.SNS.SMS.MaxPrice': {
              // The maximum amount in USD that you are willing to spend to send the SMS message.
              DataType: 'String',
              StringValue: '1.0',
            },
            'AWS.SNS.SMS.SenderID': {
              // Up to 11 alphanumeric characters, including at least one letter and no spaces
              DataType: 'String',
              StringValue: 'Firefox',
            },
            'AWS.SNS.SMS.SMSType': {
              // 'Promotional' for cheap marketing messages, 'Transactional' for critical transactions
              DataType: 'String',
              StringValue: 'Promotional',
            },
          },
          PhoneNumber: phoneNumber,
        };
        const startTime = Date.now();

        return sns
          .publish(params)
          .promise()
          .then(result => {
            if (statsd) {
              statsd.timing('sms.send', Date.now() - startTime);
            }
            log.info('sms.send.success', {
              templateName,
              acceptLanguage,
              messageId: result.MessageId,
            });
          })
          .catch(sendError => {
            if (statsd) {
              statsd.timing('sms.send', Date.now() - startTime);
            }
            const { message, code, statusCode } = sendError;
            log.error('sms.send.error', { message, code, statusCode });

            throw error.messageRejected(message, code);
          });
      });
    },
  };

  function pollCurrentSpend() {
    let limit;

    sns
      .getSMSAttributes({ attributes: ['MonthlySpendLimit'] })
      .promise()
      .then(result => {
        limit = parseFloat(result.attributes.MonthlySpendLimit);
        if (isNaN(limit)) {
          throw new Error(
            `Invalid getSMSAttributes result "${result.attributes.MonthlySpendLimit}"`
          );
        }

        const endTime = new Date();
        const startTime = new Date(
          endTime.getTime() - PERIOD_IN_MINUTES * MILLISECONDS_PER_MINUTE
        );
        return cloudwatch
          .getMetricStatistics({
            Namespace: 'AWS/SNS',
            MetricName: 'SMSMonthToDateSpentUSD',
            StartTime: time.startOfMinute(startTime),
            EndTime: time.startOfMinute(endTime),
            Period: PERIOD_IN_MINUTES * SECONDS_PER_MINUTE,
            Statistics: ['Maximum'],
          })
          .promise();
      })
      .then(result => {
        let current;

        try {
          current = parseFloat(result.Datapoints[0].Maximum);
        } catch (err) {
          err.result = JSON.stringify(result);
          throw err;
        }

        if (isNaN(current)) {
          throw new Error(
            `Invalid getMetricStatistics result "${result.Datapoints[0].Maximum}"`
          );
        }

        isBudgetOk = current <= limit - CREDIT_THRESHOLD;
        log.info('sms.budget.ok', {
          isBudgetOk,
          current,
          limit,
          threshold: CREDIT_THRESHOLD,
        });
      })
      .catch(err => {
        log.error('sms.budget.error', { err: err.message, result: err.result });

        // If we failed to query the data, assume current spend is fine
        isBudgetOk = true;
      })
      .then(() => setTimeout(pollCurrentSpend, MILLISECONDS_PER_HOUR));
  }

  function getMessage(templateName, acceptLanguage, signinCode) {
    try {
      let link;
      if (signinCode) {
        link = `${
          config.sms.installFirefoxWithSigninCodeBaseUri
        }/${urlSafeBase64(signinCode)}`;
      } else {
        link = config.sms[`${templateName}Link`];
      }

      return templates.render(`sms.${templateName}`, null, {
        link,
        translator: translator.getTranslator(acceptLanguage),
      }).text;
    } catch (err) {
      log.error('sms.getMessage.error', { templateName });
      throw error.invalidMessageId();
    }
  }
};

function initService(config, Class, MockClass) {
  const options = {
    region: config.sms.apiRegion,
  };

  if (config.sms.useMock) {
    return new MockClass(options, config);
  }

  return new Class(options);
}

function urlSafeBase64(hex) {
  return Buffer.from(hex, 'hex')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
