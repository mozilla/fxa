/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const { default: Container } = require('typedi');

const { mockLog } = require('../../mocks');
const { AuthFirestore, AuthLogger } = require('../../../lib/types');
const { GoogleIAP } = require('../../../lib/payments/google-iap');

describe('GoogleIAP', () => {
  let sandbox;
  let firestore;
  let log;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    firestore = {};
    log = mockLog();
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, log);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('can be instantiated', () => {
    const googleIap = Container.get(GoogleIAP);
    assert.strictEqual(googleIap.log, log);
    assert.strictEqual(googleIap.firestore, firestore);
  });
});
