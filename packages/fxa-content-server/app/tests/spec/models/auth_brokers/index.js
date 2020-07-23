/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import constants from 'lib/constants';
import index from 'models/auth_brokers/index';
import FxSyncBroker from 'models/auth_brokers/fx-sync';
import FxDesktopV3broker from 'models/auth_brokers/fx-desktop-v3';
import FxFennecV1Broker from 'models/auth_brokers/fx-fennec-v1';
import OauthRedirectBroker from 'models/auth_brokers/oauth-redirect';
import OauthRedirectChromeAndroidBroker from 'models/auth_brokers/oauth-redirect-chrome-android';
import WebBroker from 'models/auth_brokers/web';

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
    assert.equal(authBroker, FxSyncBroker);
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for desktop-v3 context', () => {
    const authBroker = index.get(constants.FX_DESKTOP_V3_CONTEXT);
    assert.equal(authBroker, FxDesktopV3broker);
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for fennec-v1 context', () => {
    const authBroker = index.get(constants.FX_FENNEC_V1_CONTEXT);
    assert.equal(authBroker, FxFennecV1Broker);
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for oauth context', () => {
    const authBroker = index.get(constants.OAUTH_CONTEXT);
    assert.equal(authBroker, OauthRedirectBroker);
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for oauth-redirect-chrome-android context', () => {
    const authBroker = index.get(constants.OAUTH_CHROME_ANDROID_CONTEXT);
    assert.equal(authBroker, OauthRedirectChromeAndroidBroker);
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get returns correct broker for web context', () => {
    const authBroker = index.get(constants.CONTENT_SERVER_CONTEXT);
    assert.equal(authBroker, WebBroker);
    assert.ok(VALID_TYPE.test(authBroker.prototype.type));
  });

  it('get falls back to the web auth broker', () => {
    const authBroker = index.get('wibble');
    assert.equal(authBroker, WebBroker);
  });
});
