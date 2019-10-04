/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const mocks = require('../../mocks');
const P = require('bluebird');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const ROOT_DIR = '../../..';
const ISO_8601_FORMAT = /^20[1-9][0-9]-[01][0-9]-[0-3][0-9]T[012][0-9]:[0-5][0-9]:00Z$/;

describe('lib/senders/sms:', () => {
  let config,
    log,
    results,
    cloudwatch,
    sns,
    mockSns,
    smsModule,
    translator,
    templates;

  beforeEach(() => {
    config = {
      smtp: {},
      sms: {
        apiRegion: 'us-east-1',
        enableBudgetChecks: true,
        installFirefoxLink: 'https://baz/qux',
        installFirefoxWithSigninCodeBaseUri: 'https://wibble',
        minimumCreditThresholdUSD: 2,
        useMock: false,
      },
    };
    log = mocks.mockLog();
    results = {
      getMetricStatistics: { Datapoints: [{ Maximum: 0 }] },
      getSMSAttributes: {
        attributes: { MonthlySpendLimit: config.sms.minimumCreditThresholdUSD },
      },
      publish: P.resolve({ MessageId: 'foo' }),
    };
    cloudwatch = {
      getMetricStatistics: sinon.spy(() => ({
        promise: () => P.resolve(results.getMetricStatistics),
      })),
    };
    sns = {
      getSMSAttributes: sinon.spy(() => ({
        promise: () => P.resolve(results.getSMSAttributes),
      })),
      publish: sinon.spy(() => ({
        promise: () => results.publish,
      })),
    };
    mockSns = {
      getSMSAttributes: sinon.spy(() => ({
        promise: () => P.resolve(results.getSMSAttributes),
      })),
      publish: sinon.spy(() => ({
        promise: () => results.publish,
      })),
    };
    smsModule = proxyquire(`${ROOT_DIR}/lib/senders/sms`, {
      'aws-sdk/clients/cloudwatch': function() {
        return cloudwatch;
      },
      'aws-sdk/clients/sns': function() {
        return sns;
      },
      '../../test/mock-sns': function() {
        return mockSns;
      },
    });
    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`)(mocks.mockLog()),
    ]).then(results => {
      translator = results[0];
      templates = results[1];
    });
  });

  describe('initialise:', () => {
    let sms;

    beforeEach(() => {
      sms = smsModule(log, translator, templates, config);
    });

    it('returned the expected interface', () => {
      assert.equal(typeof sms.isBudgetOk, 'function');
      assert.equal(sms.isBudgetOk.length, 0);

      assert.equal(typeof sms.send, 'function');
      assert.equal(sms.send.length, 4);
    });

    it('did not call the AWS SDK', () => {
      assert.equal(sns.getSMSAttributes.callCount, 0);
      assert.equal(sns.publish.callCount, 0);
      assert.equal(cloudwatch.getMetricStatistics.callCount, 0);
    });

    it('isBudgetOk returns true', () => {
      assert.strictEqual(sms.isBudgetOk(), true);
    });

    describe('wait a tick:', () => {
      beforeEach(done => setImmediate(done));

      it('called sns.getSMSAttributes correctly', () => {
        assert.equal(sns.getSMSAttributes.callCount, 1);
        const args = sns.getSMSAttributes.args[0];
        assert.equal(args.length, 1);
        assert.deepEqual(args[0], { attributes: ['MonthlySpendLimit'] });
      });

      it('called cloudwatch.getMetricStatistics correctly', () => {
        const PERIOD_IN_MINUTES = 5; // matches setting in ../../../lib/senders/sms.js
        assert.equal(cloudwatch.getMetricStatistics.callCount, 1);
        const args = cloudwatch.getMetricStatistics.args[0];
        assert.equal(args.length, 1);
        assert.equal(args[0].Namespace, 'AWS/SNS');
        assert.equal(args[0].MetricName, 'SMSMonthToDateSpentUSD');
        assert(ISO_8601_FORMAT.test(args[0].StartTime));
        assert(ISO_8601_FORMAT.test(args[0].EndTime));
        assert(
          new Date(args[0].StartTime).getTime() ===
            new Date(args[0].EndTime).getTime() - PERIOD_IN_MINUTES * 60000
        );
        assert(
          new Date(args[0].EndTime).getTime() >
            Date.now() - PERIOD_IN_MINUTES * 60000
        );
        assert.equal(args[0].Period, PERIOD_IN_MINUTES * 60);
        assert.deepEqual(args[0].Statistics, ['Maximum']);
      });

      it('called log.info correctly', () => {
        assert.equal(log.info.callCount, 1);
        const args = log.info.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'sms.budget.ok');
        assert.deepEqual(args[1], {
          isBudgetOk: true,
          current: 0,
          limit: config.sms.minimumCreditThresholdUSD,
          threshold: config.sms.minimumCreditThresholdUSD,
        });
      });

      it('isBudgetOk returns true', () => {
        assert.strictEqual(sms.isBudgetOk(), true);
      });

      it('did not call sns.publish', () => {
        assert.equal(sns.publish.callCount, 0);
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });

    describe('spend > threshold:', () => {
      beforeEach(() => {
        results.getMetricStatistics.Datapoints[0].Maximum = 1;
      });

      it('isBudgetOk returns true', () => {
        assert.strictEqual(sms.isBudgetOk(), true);
      });

      describe('wait a tick:', () => {
        beforeEach(done => setImmediate(done));

        it('isBudgetOk returns false', () => {
          assert.strictEqual(sms.isBudgetOk(), false);
        });

        it('did not call log.error', () => {
          assert.equal(log.error.callCount, 0);
        });
      });
    });

    describe('invalid data:', () => {
      beforeEach(() => {
        results.getMetricStatistics.Datapoints[0].Maximum = 'wibble';
      });

      describe('wait a tick:', () => {
        beforeEach(done => setImmediate(done));

        it('isBudgetOk returns true', () => {
          assert.strictEqual(sms.isBudgetOk(), true);
        });

        it('called log.error correctly', () => {
          assert.equal(log.error.callCount, 1);
          const args = log.error.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'sms.budget.error');
          assert.deepEqual(args[1], {
            err: 'Invalid getMetricStatistics result "wibble"',
            result: undefined,
          });
        });
      });
    });

    describe('unexpected response:', () => {
      beforeEach(() => {
        results.getMetricStatistics.Datapoints = [];
      });

      describe('wait a tick:', () => {
        beforeEach(done => setImmediate(done));

        it('isBudgetOk returns true', () => {
          assert.strictEqual(sms.isBudgetOk(), true);
        });

        it('called log.error correctly', () => {
          assert.equal(log.error.callCount, 1);
          const args = log.error.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'sms.budget.error');
          assert.deepEqual(args[1], {
            err: "Cannot read property 'Maximum' of undefined",
            result: JSON.stringify(results.getMetricStatistics),
          });
        });
      });
    });

    describe('send a valid sms without a signinCode:', () => {
      beforeEach(() => {
        return sms.send('+442078553000', 'installFirefox', 'en');
      });

      it('called sns.publish correctly', () => {
        assert.equal(sns.publish.callCount, 1);
        const args = sns.publish.args[0];
        assert.equal(args.length, 1);
        assert.deepEqual(args[0], {
          Message:
            'Thanks for choosing Firefox! You can install Firefox for mobile here: https://baz/qux',
          MessageAttributes: {
            'AWS.SNS.SMS.MaxPrice': {
              DataType: 'String',
              StringValue: '1.0',
            },
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: 'Firefox',
            },
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Promotional',
            },
          },
          PhoneNumber: '+442078553000',
        });
      });

      it('called log.trace correctly', () => {
        assert.equal(log.trace.callCount, 1);
        const args = log.trace.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'sms.send');
        assert.deepEqual(args[1], {
          templateName: 'installFirefox',
          acceptLanguage: 'en',
        });
      });

      it('called log.info correctly', () => {
        assert.equal(log.info.callCount, 2);
        const args = log.info.args[1];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'sms.send.success');
        assert.deepEqual(args[1], {
          templateName: 'installFirefox',
          acceptLanguage: 'en',
          messageId: 'foo',
        });
      });

      it('did not call mockSns.publish', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });

    describe('send a valid sms with a signinCode:', () => {
      beforeEach(() => {
        return sms.send(
          '+442078553000',
          'installFirefox',
          'en',
          Buffer.from('++//ff0=', 'base64')
        );
      });

      it('called sns.publish correctly', () => {
        assert.equal(sns.publish.callCount, 1);
        assert.equal(
          sns.publish.args[0][0].Message,
          'Thanks for choosing Firefox! You can install Firefox for mobile here: https://wibble/--__ff0'
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });

    describe('attempt to send an sms with an invalid template name:', () => {
      let error;

      beforeEach(() => {
        return sms
          .send(
            '+442078553000',
            'wibble',
            'en',
            Buffer.from('++//ff0=', 'base64')
          )
          .catch(e => (error = e));
      });

      it('failed correctly', () => {
        assert.equal(error.errno, 131);
        assert.equal(error.message, 'Invalid message id');
      });

      it('called log.error correctly', () => {
        assert.equal(log.error.callCount, 1);
        const args = log.error.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'sms.getMessage.error');
        assert.deepEqual(args[1], {
          templateName: 'wibble',
        });
      });

      it('did not call sns.publish', () => {
        assert.equal(sns.publish.callCount, 0);
      });
    });

    describe('attempt to send an sms that is rejected by the network provider:', () => {
      let error;

      beforeEach(() => {
        results.publish = P.reject({
          statusCode: 400,
          code: 42,
          message: 'this is an error',
        });
        return sms
          .send(
            '+442078553000',
            'installFirefox',
            'en',
            Buffer.from('++//ff0=', 'base64')
          )
          .catch(e => (error = e));
      });

      it('failed correctly', () => {
        assert.equal(error.errno, 132);
        assert.equal(error.message, 'Message rejected');
        assert.equal(error.output.payload.reason, 'this is an error');
        assert.equal(error.output.payload.reasonCode, 42);
      });
    });

    describe('with statsd present:', () => {
      let statsd, sms;

      beforeEach(() => {
        statsd = { timing: sinon.stub() };
        sms = smsModule(log, translator, templates, config, statsd);
      });

      it('should collect timing stat on success', async () => {
        await sms.send('+15558675309', 'installFirefox', 'en');
        assert.equal(statsd.timing.calledOnce, true, 'statsd was called');
        assert.equal(
          statsd.timing.args[0][0],
          'sms.send',
          'correct stat name was used'
        );
        assert.equal(
          typeof statsd.timing.args[0][1],
          'number',
          'stat value was a number'
        );
      });

      it('should collect timing stat on failure', async () => {
        results.publish = P.reject({
          statusCode: 400,
          code: 42,
          message: 'this is an error',
        });
        try {
          await sms.send('+15558675309', 'installFirefox', 'en');
        } catch (err) {
          // NOOP
        }
        assert.equal(statsd.timing.calledOnce, true, 'statsd was called');
        assert.equal(
          statsd.timing.args[0][0],
          'sms.send',
          'correct stat name was used'
        );
        assert.equal(
          typeof statsd.timing.args[0][1],
          'number',
          'stat value was a number'
        );
      });
    });
  });

  describe('initialise, useMock=true:', () => {
    let sms;

    beforeEach(() => {
      config.sms.useMock = true;
      sms = smsModule(log, translator, templates, config);
    });

    it('isBudgetOk returns true', () => {
      assert.strictEqual(sms.isBudgetOk(), true);
    });

    describe('wait a tick:', () => {
      beforeEach(done => setImmediate(done));

      it('isBudgetOk returns true', () => {
        assert.strictEqual(sms.isBudgetOk(), true);
      });

      it('did not call the AWS SDK', () => {
        assert.equal(sns.getSMSAttributes.callCount, 0);
        assert.equal(cloudwatch.getMetricStatistics.callCount, 0);
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });

    describe('send an sms:', () => {
      beforeEach(() => {
        return sms.send('+442078553000', 'installFirefox', 'en');
      });

      it('called mockSns.publish correctly', () => {
        assert.equal(mockSns.publish.callCount, 1);
        const args = mockSns.publish.args[0];
        assert.equal(args.length, 1);
        assert.deepEqual(args[0], {
          Message:
            'Thanks for choosing Firefox! You can install Firefox for mobile here: https://baz/qux',
          MessageAttributes: {
            'AWS.SNS.SMS.MaxPrice': {
              DataType: 'String',
              StringValue: '1.0',
            },
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: 'Firefox',
            },
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Promotional',
            },
          },
          PhoneNumber: '+442078553000',
        });
      });

      it('did not call sns.publish', () => {
        assert.equal(sns.publish.callCount, 0);
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });
  });
});
