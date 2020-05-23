/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const Joi = require('@hapi/joi');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ScopeSet = require('fxa-shared/oauth/scopes');

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
      amplitude: sandbox.spy(),
      config: {
        getProperties: sinon.spy(() => ({ key: 'value' })),
      },
      log: {
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
      '../../../config': mocks.config,
      '../metrics/amplitude': sandbox.spy(() => mocks.amplitude),
      '../logging': () => mocks.log,
      '../token': mocks.token,
    };

    route = proxyquire('../../../lib/oauth/routes/verify', dependencies);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('setup', () => {
    it('initializes amplitude correctly', () => {
      assert.isTrue(dependencies['../metrics/amplitude'].calledOnce);
      const args = dependencies['../metrics/amplitude'].args[0];
      assert.strictEqual(args[0], mocks.log);
      assert.isTrue(mocks.config.getProperties.calledOnce);
      assert.deepEqual(args[1], { key: 'value' });
    });
  });

  describe('validation', () => {
    function validate(req, context = {}) {
      const result = Joi.validate(req, route.validate.payload, { context });
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
      assert.strictEqual(err, null);
    });
  });

  describe('handler', () => {
    let resp;

    beforeEach(async () => {
      resp = await route.handler({
        payload: {
          token: TOKEN,
        },
      });
    });

    it('returns the expected response', () => {
      assert.strictEqual(resp.client_id, 'foo');
      assert.strictEqual(resp.user, 'bar');
      assert.deepEqual(resp.scope, ['bar:foo', 'clients:write']);
    });

    it('verifies the token', () => {
      assert.isTrue(mocks.token.verify.calledOnceWith(TOKEN));
    });

    it('logs as expected', () => {
      assert.isTrue(
        mocks.log.info.calledOnceWith('verify.success', {
          client_id: 'foo',
          scope: ['bar:foo', 'clients:write'],
        })
      );
    });

    it('logs an amplitude event', () => {
      assert.isTrue(
        mocks.amplitude.calledOnceWith('verify.success', {
          service: 'foo',
          uid: 'bar',
        })
      );
    });
  });
});
