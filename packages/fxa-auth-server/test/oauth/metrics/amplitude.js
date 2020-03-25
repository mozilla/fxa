/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const mockAmplitudeConfig = { schemaValidation: true };
let sentryScope;
const mockSentry = {
  withScope: sinon.stub().callsFake(cb => {
    sentryScope = { setContext: sinon.stub() };
    cb(sentryScope);
  }),
  captureMessage: sinon.stub(),
};
const amplitudeModule = proxyquire('../../../lib/oauth/metrics/amplitude', {
  '@sentry/node': mockSentry,
});
const Sentry = require('@sentry/node');

describe('metrics/amplitude', () => {
  it('interface is correct', () => {
    assert.strictEqual(typeof amplitudeModule, 'function');
    assert.strictEqual(amplitudeModule.length, 2);
  });

  it('throws if log argument is missing', () => {
    assert.throws(() =>
      amplitudeModule(null, {
        clientIdToServiceNames: {},
        amplitude: mockAmplitudeConfig,
      })
    );
  });

  it('throws if config argument is missing', () => {
    assert.throws(() =>
      amplitudeModule(
        {},
        { clientIdToServiceNames: null, amplitude: mockAmplitudeConfig }
      )
    );
  });

  describe('instantiate', () => {
    let amplitude, log;

    beforeEach(() => {
      log = {
        error: sinon.spy(),
        info: sinon.spy(),
      };

      amplitude = amplitudeModule(log, {
        oauthServer: {
          clientIdToServiceNames: {
            0: 'amo',
            1: 'pocket',
          },
        },
        amplitude: mockAmplitudeConfig,
      });

      mockSentry.withScope.resetHistory();
      mockSentry.captureMessage.resetHistory();
    });

    it('interface is correct', () => {
      assert.isFunction(amplitude);
      assert.lengthOf(amplitude, 2);
    });

    describe('empty event argument', () => {
      beforeEach(() => {
        return amplitude('', {});
      });

      it('called log.error correctly', () => {
        assert.strictEqual(log.error.callCount, 1);
        assert.lengthOf(log.error.args[0], 2);
        assert.strictEqual(log.error.args[0][0], 'amplitude.badArgument');
        assert.deepEqual(log.error.args[0][1], {
          err: 'Bad argument',
          event: '',
        });
      });

      it('did not call log.info', () => {
        assert.strictEqual(log.info.callCount, 0);
      });
    });

    describe('missing data argument', () => {
      beforeEach(() => {
        return amplitude('foo');
      });

      it('called log.error correctly', () => {
        assert.strictEqual(log.error.callCount, 1);
        assert.lengthOf(log.error.args[0], 2);
        assert.strictEqual(log.error.args[0][0], 'amplitude.badArgument');
        assert.deepEqual(log.error.args[0][1], {
          err: 'Bad argument',
          event: 'foo',
        });
      });

      it('did not call log.info', () => {
        assert.strictEqual(log.info.callCount, 0);
      });
    });

    describe('invalid event data', () => {
      beforeEach(() => {
        return amplitude('token.created', {
          service: '0',
          uid: 'quuz',
        });
      });

      it('called log.error correctly', () => {
        assert.strictEqual(log.error.callCount, 1);
        assert.equal(log.error.args[0][0], 'amplitude.validationError');
        assert.equal(
          log.error.args[0][1]['err']['message'],
          'Invalid data: event.user_id should match pattern "^[a-fA-F0-9]{32}$"'
        );
        assert.equal(
          log.error.args[0][1]['amplitudeEvent']['op'],
          'amplitudeEvent'
        );
        assert.equal(
          log.error.args[0][1]['amplitudeEvent']['event_type'],
          'fxa_activity - access_token_created'
        );
        assert.equal(log.error.args[0][1]['amplitudeEvent']['user_id'], 'quuz');
      });

      it('called Sentry correctly', () => {
        assert.isTrue(mockSentry.withScope.calledOnce);
        assert.isTrue(sentryScope.setContext.calledOnce);
        assert.equal(
          sentryScope.setContext.args[0][0],
          'amplitude.validationError'
        );
        assert.equal(
          sentryScope.setContext.args[0][1]['event_type'],
          'fxa_activity - access_token_created'
        );
        assert.equal(sentryScope.setContext.args[0][1]['flow_id'], undefined);
        assert.equal(
          sentryScope.setContext.args[0][1]['err']['message'],
          'Invalid data: event.user_id should match pattern "^[a-fA-F0-9]{32}$"'
        );
        assert.isTrue(
          mockSentry.captureMessage.calledOnceWith(
            'Amplitude event failed validation.',
            Sentry.Severity.Error
          )
        );
      });

      it('called log.info correctly', () => {
        assert.strictEqual(log.info.callCount, 1);

        const args = log.info.args[0];
        assert.strictEqual(args.length, 2);
        assert.strictEqual(args[0], 'amplitudeEvent');
        assert.strictEqual(args[1].user_id, 'quuz');
        assert.strictEqual(
          args[1].event_type,
          'fxa_activity - access_token_created'
        );
        assert.deepEqual(args[1].event_properties, {
          service: 'amo',
          oauth_client_id: '0',
        });
        assert.deepEqual(args[1].user_properties, {
          $append: {
            fxa_services_used: 'amo',
          },
        });
        assert.isAbove(args[1].time, Date.now() - 1000);
      });
    });

    describe('responds to configuration', () => {
      it('does not perform schema validation per config', () => {
        mockAmplitudeConfig.schemaValidation = false;
        amplitude('token.created', {
          service: '0',
          uid: 'quuz',
        });
        assert.strictEqual(log.error.callCount, 0);
        assert.isFalse(mockSentry.withScope.calledOnce);
      });
    });
  });
});
