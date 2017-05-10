/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const chai = require('chai');
  const constants = require('lib/constants');
  const index = require('models/auth_brokers/index');

  const assert = chai.assert;

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
    });

    it('get returns correct broker for desktop-v1 context', () => {
      const authBroker = index.get(constants.FX_DESKTOP_V1_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/fx-desktop-v1'));
    });

    it('get returns correct broker for desktop-v2 context', () => {
      const authBroker = index.get(constants.FX_DESKTOP_V2_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/fx-desktop-v2'));
    });

    it('get returns correct broker for desktop-v3 context', () => {
      const authBroker = index.get(constants.FX_DESKTOP_V3_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/fx-desktop-v3'));
    });

    it('get returns correct broker for fennec-v1 context', () => {
      const authBroker = index.get(constants.FX_FENNEC_V1_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/fx-fennec-v1'));
    });

    it('get returns correct broker for firstrun-v1 context', () => {
      const authBroker = index.get(constants.FX_FIRSTRUN_V1_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/fx-firstrun-v1'));
    });

    it('get returns correct broker for firstrun-v2 context', () => {
      const authBroker = index.get(constants.FX_FIRSTRUN_V2_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/fx-firstrun-v2'));
    });

    it('get returns correct broker for ios-v1 context', () => {
      const authBroker = index.get(constants.FX_IOS_V1_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/fx-ios-v1'));
    });

    it('get returns correct broker for oauth context', () => {
      const authBroker = index.get(constants.OAUTH_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/oauth-redirect'));
    });

    it('get returns correct broker for web context', () => {
      const authBroker = index.get(constants.CONTENT_SERVER_CONTEXT);
      assert.equal(authBroker, require('models/auth_brokers/web'));
    });

    it('get falls back to the web auth broker', () => {
      const authBroker = index.get('wibble');
      assert.equal(authBroker, require('models/auth_brokers/web'));
    });
  });
});

