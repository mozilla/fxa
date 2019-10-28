/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const amplitudeModule = require('../../../lib/oauth/metrics/amplitude');
const sinon = require('sinon');

describe('metrics/amplitude', () => {
  it('interface is correct', () => {
    assert.strictEqual(typeof amplitudeModule, 'function');
    assert.strictEqual(amplitudeModule.length, 2);
  });

  it('throws if log argument is missing', () => {
    assert.throws(() => amplitudeModule(null, { clientIdToServiceNames: {} }));
  });

  it('throws if config argument is missing', () => {
    assert.throws(() => amplitudeModule({}, { clientIdToServiceNames: null }));
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
      });
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

    describe('token.created', () => {
      beforeEach(() => {
        return amplitude('token.created', {
          service: '0',
          uid: 'blee',
        });
      });

      it('did not call log.error', () => {
        assert.strictEqual(log.error.callCount, 0);
      });

      it('called log.info correctly', () => {
        assert.strictEqual(log.info.callCount, 1);

        const args = log.info.args[0];
        assert.strictEqual(args.length, 2);
        assert.strictEqual(args[0], 'amplitudeEvent');
        assert.strictEqual(args[1].user_id, 'blee');
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

    describe('verify.success', () => {
      beforeEach(() => {
        const now = Date.now();
        return amplitude('verify.success', {
          service: '1',
          time: now,
          uid: 'biz',
        });
      });

      it('did not call log.error', () => {
        assert.strictEqual(log.error.callCount, 0);
      });

      it('called log.info correctly', () => {
        assert.strictEqual(log.info.callCount, 1);

        const args = log.info.args[0];
        assert.strictEqual(args.length, 2);
        assert.strictEqual(args[0], 'amplitudeEvent');
        assert.strictEqual(args[1].user_id, 'biz');
        assert.strictEqual(
          args[1].event_type,
          'fxa_activity - access_token_checked'
        );
        assert.deepEqual(args[1].event_properties, {
          service: 'pocket',
          oauth_client_id: '1',
        });
        assert.deepEqual(args[1].user_properties, {
          $append: {
            fxa_services_used: 'pocket',
          },
        });
        assert.isAbove(args[1].time, Date.now() - 1000);
      });
    });
  });
});
