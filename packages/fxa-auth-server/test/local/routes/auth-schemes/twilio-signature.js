/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Container } = require('typedi');
const { assert } = require('chai');
const AppError = require('../../../../lib/error');
const {
  strategy,
} = require('../../../../lib/routes/auth-schemes/twilio-signature');
const { RecoveryPhoneService } = require('@fxa/accounts/recovery-phone');
const sinon = require('sinon');

describe('lib/routes/auth-schemes/twilio-signature', () => {
  let mockRecoveryPhoneService;
  let tempRecoveryPhoneService;

  function getTwilioAuth() {
    return strategy()();
  }

  before(() => {
    tempRecoveryPhoneService = Container.get(RecoveryPhoneService);
    mockRecoveryPhoneService = {
      // There is already test coverage that signature validation works
      // in the recovery-phone library, so using a simplified mock here.
      validateTwilioSignature: sinon.fake((signature) => {
        return signature === 'VALID_SIGNATURE';
      }),
    };
    Container.set(RecoveryPhoneService, mockRecoveryPhoneService);
  });

  after(() => {
    Container.set(RecoveryPhoneService, tempRecoveryPhoneService);
  });

  it('should return valid signature', async () => {
    const request = {
      headers: { 'X-Twilio-Signature': 'VALID_SIGNATURE' },
      payload: { foo: 'bar' },
    };
    const result = await getTwilioAuth().authenticate(request, { foo: 'bar' });
    assert.equal(result.signature, 'VALID_SIGNATURE');
  });

  it('throw on missing header', async () => {
    const request = {
      headers: {},
      payload: { foo: 'bar' },
    };
    try {
      await getTwilioAuth().authenticate(request, {});
      assert.fail('Missing X-Twilio-Signature header should have thrown');
    } catch (err) {
      assert.deepEqual(
        err,
        AppError.unauthorized('X-Twilio-Signature header missing')
      );
    }
  });

  it('should throw on missing payload', async () => {
    const request = {
      headers: { 'X-Twilio-Signature': 'VALID_SIGNATURE' },
    };
    try {
      await getTwilioAuth().authenticate(request, {});
      assert.fail('Missing payload should have thrown');
    } catch (err) {
      assert.deepEqual(err, AppError.unauthorized('Invalid payload'));
    }
  });

  it('should throw on invalid signature', async () => {
    const request = {
      headers: { 'X-Twilio-Signature': 'INVALID_SIGNATURE' },
      payload: { foo: 'bar' },
    };
    try {
      await getTwilioAuth().authenticate(request);
      assert.fail('Invalid X-Twilio-Signature header should have thrown');
    } catch (err) {
      assert.deepEqual(
        err,
        AppError.unauthorized('X-Twilio-Signature header invalid')
      );
    }
  });
});
