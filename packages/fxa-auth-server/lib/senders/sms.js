/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Cloudwatch = require('aws-sdk/clients/cloudwatch');
const error = require('../error');
const MockSns = require('../../test/mock-sns');
const Sns = require('aws-sdk/clients/sns');
const time = require('../time');
const { default: Renderer } = require('./renderer');
const { NodeRendererBindings } = require('./renderer/bindings-node');
const { join } = require('path');

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * 1000;
const PERIOD_IN_MINUTES = 5;

class MockCloudwatch {
  getMetricStatistics() {
    return {
      promise: () => Promise.resolve({ Datapoints: [{ Maximum: 0 }] }),
    };
  }
}

module.exports = (log, config, statsd) => {
  const cloudwatch = initService(config, Cloudwatch, MockCloudwatch);
  const sns = initService(config, Sns, MockSns);

  const {
    minimumCreditThresholdUSD: CREDIT_THRESHOLD,
    pollCurrentSpendInterval: POLL_CURRENT_SPEND_INTERVAL,
  } = config.sms;

  let isBudgetOk = true;
  let close = () => {};

  if (config.sms.enableBudgetChecks) {
    let timeoutHandle;
    const poll = async () => {
      try {
        await getCurrentSpend();
      } catch (err) {
        // try again later
      }
      timeoutHandle = setTimeout(poll, POLL_CURRENT_SPEND_INTERVAL);
    };
    close = () => clearTimeout(timeoutHandle);
    setImmediate(poll);
  }

  const allowedSmsType = ['Promotional', 'Transactional'];
  const smsType = allowedSmsType.includes(config.sms.smsType)
    ? config.sms.smsType
    : 'Promotional';

  return {
    isBudgetOk: () => isBudgetOk,

    async send(phoneNumber, templateName, acceptLanguage, signinCode) {
      log.trace('sms.send', { templateName, acceptLanguage });
      const message = await getMessage(
        templateName,
        acceptLanguage,
        signinCode
      );
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
            StringValue: smsType,
          },
        },
        PhoneNumber: phoneNumber,
      };
      const startTime = Date.now();
      try {
        const result = await sns.publish(params).promise();
        if (statsd) {
          statsd.timing('sms.send.success', Date.now() - startTime);
        }
        log.info('sms.send.success', {
          templateName,
          acceptLanguage,
          messageId: result.MessageId,
        });
      } catch (sendError) {
        if (statsd) {
          statsd.timing('sms.send.error', Date.now() - startTime);
        }
        const { message, code, statusCode } = sendError;
        log.error('sms.send.error', { message, code, statusCode });

        throw error.messageRejected(message, code);
      }
    },
    getCurrentSpend,
    close,
  };

  async function getCurrentSpend() {
    try {
      const smsAttrs = await sns
        .getSMSAttributes({ attributes: ['MonthlySpendLimit'] })
        .promise();

      const limit = parseFloat(smsAttrs.attributes.MonthlySpendLimit);
      if (isNaN(limit)) {
        throw new Error(
          `Invalid getSMSAttributes result "${smsAttrs.attributes.MonthlySpendLimit}"`
        );
      }

      const endTime = new Date();
      const startTime = new Date(
        endTime.getTime() - PERIOD_IN_MINUTES * MILLISECONDS_PER_MINUTE
      );
      const metricStats = await cloudwatch
        .getMetricStatistics({
          Namespace: 'AWS/SNS',
          MetricName: 'SMSMonthToDateSpentUSD',
          StartTime: time.startOfMinute(startTime),
          EndTime: time.startOfMinute(endTime),
          Period: PERIOD_IN_MINUTES * SECONDS_PER_MINUTE,
          Statistics: ['Maximum'],
        })
        .promise();
      let current;

      try {
        current = parseFloat(metricStats.Datapoints[0].Maximum);
      } catch (err) {
        err.result = JSON.stringify(metricStats);
        throw err;
      }

      if (isNaN(current)) {
        throw new Error(
          `Invalid getMetricStatistics result "${metricStats.Datapoints[0].Maximum}"`
        );
      }

      isBudgetOk = current <= limit - CREDIT_THRESHOLD;
      log.info('sms.budget.ok', {
        isBudgetOk,
        current,
        limit,
        threshold: CREDIT_THRESHOLD,
      });
    } catch (err) {
      log.error('sms.budget.error', { err: err.message, result: err.result });

      // If we failed to query the data, assume current spend is fine
      isBudgetOk = true;
    }
  }

  async function getMessage(templateName, acceptLanguage, signinCode) {
    const renderer = new Renderer(
      new NodeRendererBindings({
        ejs: {
          root: join(__dirname, '../senders/sms'),
        },
      })
    );

    try {
      let link;
      if (signinCode) {
        link = `${
          config.sms.installFirefoxWithSigninCodeBaseUri
        }/${urlSafeBase64(signinCode)}`;
      } else {
        link = config.sms[`${templateName}Link`];
      }

      return await renderer.renderSms({
        acceptLanguage: acceptLanguage || 'en',
        template: templateName,
        link,
      });
    } catch (err) {
      console.log('error', err);
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
