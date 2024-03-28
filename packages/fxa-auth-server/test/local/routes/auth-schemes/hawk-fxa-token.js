/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const AppError = require('../../../../lib/error');
const {
  strategy,
} = require('../../../../lib/routes/auth-schemes/hawk-fxa-token');

const HAWK_HEADER = 'Hawk id="123", ts="123", nonce="123", mac="123"';

describe('lib/routes/auth-schemes/hawk-fxa-token', () => {
  it('should throw an error if no authorization header is provided', async () => {
    const getCredentialsFunc = sinon.fake.resolves(null);
    const authStrategy = strategy(getCredentialsFunc)();

    const request = { headers: {}, auth: { mode: 'required' } };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.instanceOf(err, AppError);
      const errorResponse = err.output.payload;
      assert.equal(errorResponse.code, 401);
      assert.equal(errorResponse.errno, 110);
      assert.equal(errorResponse.message, 'Unauthorized for route');
      assert.equal(errorResponse.detail, 'Token not found');
    }
  });

  it('should authenticate with parsable Hawk header and valid token', async () => {
    const getCredentialsFunc = sinon.fake.resolves({ id: 'validToken' });
    const authStrategy = strategy(getCredentialsFunc)();

    const request = {
      headers: { authorization: HAWK_HEADER },
      auth: { mode: 'required' },
    };
    const h = { authenticated: sinon.fake() };

    await authStrategy.authenticate(request, h);
    assert.isTrue(
      h.authenticated.calledOnceWith({ credentials: { id: 'validToken' } })
    );
  });

  it('should not authenticate with parsable Hawk header and invalid token', async () => {
    const getCredentialsFunc = sinon.fake.resolves(null);
    const authStrategy = strategy(getCredentialsFunc)();

    const request = {
      headers: { authorization: HAWK_HEADER },
      auth: { mode: 'required' },
    };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.instanceOf(err, AppError);
      const errorResponse = err.output.payload;
      assert.equal(errorResponse.code, 401);
      assert.equal(errorResponse.errno, 110);
      assert.equal(errorResponse.message, 'Unauthorized for route');
      assert.equal(errorResponse.detail, 'Token not found');
    }
  });

  it('should not authenticate with unparseable Hawk header', async () => {
    const getCredentialsFunc = sinon.fake.resolves(null);
    const authStrategy = strategy(getCredentialsFunc)();

    const request = {
      headers: { authorization: 'Invalid Hawk Header' },
      auth: { mode: 'required' },
    };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown an error');
    } catch (err) {
      const errorResponse = err.output.payload;
      assert.equal(errorResponse.statusCode, 401);
      assert.equal(errorResponse.message, 'Unauthorized');
    }
  });
});
