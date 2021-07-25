/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const { mockLog } = require('../../../mocks');
const {
  GoogleIapHandler,
} = require('../../../../lib/routes/subscriptions/google');
const { default: Container } = require('typedi');
const { AuthLogger } = require('../../../../lib/types');
const { GoogleIAP } = require('../../../../lib/payments/google-iap');

describe('GoogleIapHandler', () => {
  let googleIap;
  let log;
  let googleIapHandler;

  beforeEach(() => {
    log = mockLog();
    googleIap = {};
    Container.set(AuthLogger, log);
    Container.set(GoogleIAP, googleIap);
    googleIapHandler = new GoogleIapHandler();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('plans', () => {
    it('returns the plans', async () => {
      googleIap.plans = sinon.fake.resolves({ test: 'plan' });
      const result = await googleIapHandler.plans();
      assert.calledOnce(googleIap.plans);
      assert.deepEqual(result, { test: 'plan' });
    });
  });
});
