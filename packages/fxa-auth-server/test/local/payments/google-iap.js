/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const { default: Container } = require('typedi');

const { mockLog } = require('../../mocks');
const { AuthFirestore, AuthLogger, AppConfig } = require('../../../lib/types');
const { GoogleIAP } = require('../../../lib/payments/google-iap');

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
};

describe('GoogleIAP', () => {
  let sandbox;
  let firestore;
  let log;
  let googleIap;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    firestore = {};
    log = mockLog();
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);

    // Create and set a new one per test
    googleIap = new GoogleIAP();
    Container.set(GoogleIAP, googleIap);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('can be instantiated', () => {
    const googleIap = Container.get(GoogleIAP);
    assert.strictEqual(googleIap.log, log);
    assert.strictEqual(googleIap.firestore, firestore);
    assert.strictEqual(googleIap.prefix, 'mock-fxa-googleIap');
  });

  describe('plans', () => {
    it('returns successfully', async () => {
      firestore.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: sinon.fake.returns({ plans: 'testObject' }),
        }),
      });
      const result = await googleIap.plans();
      assert.strictEqual(result, 'testObject');
    });

    it('throws error with no document found', async () => {
      firestore.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await googleIap.plans();
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Google Plans default document does not exist.'
        );
      }
    });
  });
});
