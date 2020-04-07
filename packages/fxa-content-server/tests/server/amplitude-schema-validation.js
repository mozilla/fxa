/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable camelcase */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const logger = {
  info: sinon.spy(),
  error: sinon.spy(),
};
const pkg = require('../../package.json');
const APP_VERSION = /([0-9]+)\.([0-9])$/.exec(pkg.version)[0];

const schemaValidatorStub = sinon.stub().returns(true);
let scope;
const mockSentry = {
  withScope: sinon.stub().callsFake(cb => {
    scope = { setContext: sinon.stub() };
    cb(scope);
  }),
  captureMessage: sinon.stub(),
};
const amplitudeConfig = {
  disabled: false,
  schemaValidation: true,
  rawEvent: false,
};
const amplitude = proxyquire(path.resolve('server/lib/amplitude'), {
  './configuration': {
    get(name) {
      if (name === 'amplitude') {
        return amplitudeConfig;
      }
    },
  },
  './logging/log': () => logger,
  '../../../fxa-shared/metrics/amplitude': { validate: schemaValidatorStub },
  '@sentry/node': mockSentry,
});
const Sentry = require('@sentry/node');

registerSuite('amplitude json schema validation', {
  beforeEach: function() {
    logger.info.resetHistory();
    logger.error.resetHistory();
    schemaValidatorStub.reset();
    amplitudeConfig.schemaValidation = true;
  },

  tests: {
    'performs schema validation': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.reset-password.submit',
        },
        {
          headers: {},
        },
        {
          deviceId: 'a5fa745ba71b416cba3eb35acea47233',
        }
      );
      assert.isTrue(schemaValidatorStub.calledOnce);
      assert.isTrue(logger.info.calledOnce);
    },
    'logs error': () => {
      schemaValidatorStub.throws(new Error('QUUX IS NOT A VALID DEVICE ID'));
      amplitude(
        {
          time: '1585321743',
          type: 'flow.reset-password.submit',
        },
        {
          headers: {},
        },
        {
          deviceId: 'a5fa745ba71b416cba3eb35acea47233',
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'en',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.isTrue(schemaValidatorStub.calledOnce);
      assert.isTrue(logger.error.calledOnce);
      assert.equal(logger.error.args[0][0], 'amplitude.validationError');
      assert.equal(
        logger.error.args[0][1]['err']['message'],
        'QUUX IS NOT A VALID DEVICE ID'
      );
      assert.deepEqual(logger.error.args[0][1]['amplitudeEvent'], {
        app_version: APP_VERSION,
        device_id: 'a5fa745ba71b416cba3eb35acea47233',
        event_properties: {},
        event_type: 'fxa_login - forgot_submit',
        language: 'en',
        op: 'amplitudeEvent',
        session_id: '1585261624219',
        time: '1585321743',
        user_id: '44794bdf0be84d4e8c7a8026b8580fa3',
        user_properties: {
          flow_id:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
        },
      });
      assert.isTrue(mockSentry.withScope.calledOnce);
      assert.isTrue(scope.setContext.calledOnce);
      assert.equal(scope.setContext.args[0][0], 'amplitude.validationError');
      assert.equal(
        scope.setContext.args[0][1]['event_type'],
        'fxa_login - forgot_submit'
      );
      assert.equal(
        scope.setContext.args[0][1]['flow_id'],
        '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484'
      );
      assert.equal(
        scope.setContext.args[0][1]['error'],
        'QUUX IS NOT A VALID DEVICE ID'
      );
      assert.isTrue(
        mockSentry.captureMessage.calledOnceWith(
          'Amplitude event failed validation: QUUX IS NOT A VALID DEVICE ID.',
          Sentry.Severity.Error
        )
      );
      assert.isTrue(logger.info.calledOnce);
    },
  },
  'skips when configured so': () => {
    amplitudeConfig.schemaValidation = false;
    schemaValidatorStub.throws(new Error('QUUX IS NOT A VALID DEVICE ID'));
    amplitude(
      {
        type: 'flow.reset-password.submit',
      },
      {
        headers: {},
      },
      {
        deviceId: 'a5fa745ba71b416cba3eb35acea47233',
        uid: '44794bdf0be84d4e8c7a8026b8580fa3',
      }
    );
    assert.isFalse(schemaValidatorStub.calledOnce);
  },
});
