/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const { modifySettingsStatic, modifyProxyRes } = proxyquire('./beta-settings', {
  fs: {
    readFileSync: () =>
      '<meta name="fxa-config" content="__SERVER_CONFIG__" />',
  },
  './configuration': {
    get: (key) => ({ env: 'production', flow_id_key: 'key' })[key] || '',
  },
  '../../../../dist/libs/shared/l10n': {
    supportedLanguages: [],
    rtlLocales: [],
    '@noCallThru': true,
  },
});

function injectedConfig(html) {
  const content = html.match(/content="([^"]*)"/)[1];
  return JSON.parse(decodeURIComponent(content));
}

function mockRes(locals = {}) {
  return {
    locals,
    status: sinon.spy(),
    append: () => {},
    removeHeader: () => {},
    send: sinon.spy(),
    end: () => {},
  };
}

describe('beta-settings', () => {
  describe('modifySettingsStatic', () => {
    it('adds serverError to the config when the 500 handler sets it', () => {
      const res = mockRes({ serverError: true });
      modifySettingsStatic({ path: '/boom' }, res);
      assert.strictEqual(injectedConfig(res.send.args[0][0]).serverError, true);
    });

    it('leaves serverError out of the config otherwise', () => {
      const res = mockRes();
      modifySettingsStatic({ path: '/signin' }, res);
      assert.strictEqual(
        injectedConfig(res.send.args[0][0]).serverError,
        undefined
      );
    });
  });

  describe('modifyProxyRes', () => {
    function proxy(locals) {
      const proxyRes = new EventEmitter();
      proxyRes.statusCode = 200;
      proxyRes.headers = { 'content-type': 'text/html' };
      const res = mockRes(locals);
      modifyProxyRes(proxyRes, {}, res);
      proxyRes.emit(
        'data',
        Buffer.from('<meta name="fxa-config" content="__SERVER_CONFIG__" />')
      );
      proxyRes.emit('end');
      return res;
    }

    it('keeps status 500 and adds serverError when the 500 handler sets it', () => {
      const res = proxy({ serverError: true });
      assert.ok(res.status.calledWith(500));
      assert.strictEqual(
        injectedConfig(res.send.args[0][0].toString()).serverError,
        true
      );
    });

    it('forwards the proxied status otherwise', () => {
      const res = proxy({});
      assert.ok(res.status.calledWith(200));
    });
  });
});
