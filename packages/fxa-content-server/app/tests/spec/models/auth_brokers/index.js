/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import constants from 'lib/constants';
import index from 'models/auth_brokers/index';

// Unfortunately, until we have shared validation on both
// server and client, this regexp is copied from /server/lib/validate.js
const VALID_TYPE = /^[0-9a-z-]+$/;

describe('models/auth_brokers/index', () => {
  it('interface is correct', () => {
    assert.isObject(index);
    assert.lengthOf(Object.keys(index), 1);

    assert.isFunction(index.get);
    assert.lengthOf(index.get, 1);
  });

  it('get returns correct broker for fx-sync context', () => {
    const authBroker = index.get(constants.FX_SYNC_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/fx-sync'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for desktop-v2 context', () => {
    const authBroker = index.get(constants.FX_DESKTOP_V2_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/fx-desktop-v2'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for desktop-v3 context', () => {
    const authBroker = index.get(constants.FX_DESKTOP_V3_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/fx-desktop-v3'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for fennec-v1 context', () => {
    const authBroker = index.get(constants.FX_FENNEC_V1_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/fx-fennec-v1'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for firstrun-v1 context', () => {
    const authBroker = index.get(constants.FX_FIRSTRUN_V1_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/fx-firstrun-v1'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for firstrun-v2 context', () => {
    const authBroker = index.get(constants.FX_FIRSTRUN_V2_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/fx-firstrun-v2'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for ios-v1 context', () => {
    const authBroker = index.get(constants.FX_IOS_V1_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/fx-ios-v1'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for oauth context', () => {
    const authBroker = index.get(constants.OAUTH_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/oauth-redirect'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for oauth-redirect-chrome-android context', () => {
    const authBroker = index.get(constants.OAUTH_CHROME_ANDROID_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/oauth-redirect-chrome-android').default);
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for web context', () => {
    const authBroker = index.get(constants.CONTENT_SERVER_CONTEXT);
    assert.equal(authBroker, require('models/auth_brokers/web'));
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get falls back to the web auth broker', () => {
    const authBroker = index.get('wibble');
    assert.equal(authBroker, require('models/auth_brokers/web'));
  });
});
