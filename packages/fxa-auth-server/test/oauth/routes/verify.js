/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ScopeSet = require('fxa-shared').oauth.scopes;

const TOKEN =
  'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';

function joiRequired(err, param) {
  assert.ok(err.isJoi);
  assert.ok(err.name, 'ValidationError');
  assert.strictEqual(err.details[0].message, `"${param}" is required`);
}

describe('/verify POST', () => {
  let dependencies;
  let mocks;
  let route;
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();

    mocks = {
      log: {
        debug: sandbox.spy(),
        info: sandbox.spy(),
        warn: sandbox.spy(),
      },
      token: {
        verify: sandbox.spy(() =>
          Promise.resolve({
            client_id: 'foo',
            scope: ScopeSet.fromArray(['bar:foo', 'clients:write']),
            user: 'bar',
          })
        ),
      },
    };

    dependencies = {
      '../../oauth/token': mocks.token,
    };

    route = proxyquire(
      '../../../lib/routes/oauth/verify',
      dependencies
    )({ log: mocks.log });
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('validation', () => {
    function validate(req, context = {}) {
      const validationSchema = route.config.validate.payload;
      const result = validationSchema.validate(req, {
        context,
      });
      return result.error;
    }

    it('fails with no token', () => {
      const err = validate({
        token: undefined,
      });
      joiRequired(err, 'token');
    });

    it('no validation errors', () => {
      const err = validate({
        token: TOKEN,
      });
      assert.strictEqual(err, undefined);
    });
  });

  describe('handler', () => {
    let req;
    let resp;

    beforeEach(async () => {
      req = {
        payload: {
          token: TOKEN,
        },
        emitMetricsEvent: sinon.spy(),
      };
      resp = await route.config.handler(req);
    });

    it('returns the expected response', () => {
      assert.strictEqual(resp.client_id, 'foo');
      assert.strictEqual(resp.user, 'bar');
      assert.deepEqual(resp.scope, ['bar:foo', 'clients:write']);
    });

    it('verifies the token', () => {
      assert.isTrue(mocks.token.verify.calledOnceWith(TOKEN));
    });

    it('logs an amplitude event', () => {
      assert.isTrue(
        req.emitMetricsEvent.calledOnceWith('verify.success', {
          service: 'foo',
          uid: 'bar',
        })
      );
    });
  });
});
