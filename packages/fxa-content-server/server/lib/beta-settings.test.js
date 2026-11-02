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

    it('adds notFound to the config when the 404 handler sets it', () => {
      const res = mockRes({ notFound: true });
      modifySettingsStatic({ path: '/no-such-page' }, res);
      assert.strictEqual(injectedConfig(res.send.args[0][0]).notFound, true);
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

    it('sets status 404 and adds notFound when the 404 handler sets it', () => {
      const res = proxy({ notFound: true });
      assert.ok(res.status.calledWith(404));
      assert.strictEqual(
        injectedConfig(res.send.args[0][0].toString()).notFound,
        true
      );
    });

    it('forwards the proxied status otherwise', () => {
      const res = proxy({});
      assert.ok(res.status.calledWith(200));
    });
  });

  describe('l10n preload', () => {
    const preload =
      '<link rel="preload" href="/settings/static/locales/en/main.abc123.ftl" as="fetch" crossorigin="anonymous">';

    function assetMapHtml(content) {
      return `<meta name="fxa-l10n-asset-map" content="${content}" />__L10N_PRELOAD__`;
    }
    const enMapHtml = assetMapHtml(
      encodeURIComponent(
        JSON.stringify({ 'locales/en/main.ftl': 'locales/en/main.abc123.ftl' })
      )
    );

    // A fresh instance per test, because the module caches the index file.
    function load(html) {
      return proxyquire('./beta-settings', {
        fs: { readFileSync: () => html },
        './configuration': {
          get: (key) =>
            ({
              env: 'production',
              flow_id_key: 'key',
              'l10n.baseUrl': '/settings/static',
            })[key] || '',
        },
        '../../../../dist/libs/shared/l10n': {
          supportedLanguages: [],
          rtlLocales: [],
          '@noCallThru': true,
        },
      });
    }

    function staticHtml(html) {
      const res = mockRes();
      load(html).modifySettingsStatic({ path: '/' }, res);
      return res.send.args[0][0];
    }

    it('modifySettingsStatic adds the en main.ftl preload', () => {
      const html = staticHtml(enMapHtml);
      assert.strictEqual(html.split(preload).length - 1, 1);
      assert.ok(!html.includes('__L10N_PRELOAD__'));
    });

    it('modifyProxyRes adds the en main.ftl preload', () => {
      const proxyRes = new EventEmitter();
      proxyRes.statusCode = 200;
      proxyRes.headers = { 'content-type': 'text/html' };
      const res = mockRes();
      load('').modifyProxyRes(proxyRes, {}, res);
      proxyRes.emit('data', Buffer.from(enMapHtml));
      proxyRes.emit('end');
      const html = res.send.args[0][0].toString();
      assert.strictEqual(html.split(preload).length - 1, 1);
    });

    [
      ['the asset map meta is absent', '__L10N_PRELOAD__'],
      ['the asset map is empty', assetMapHtml('')],
      ['the asset map JSON is malformed', assetMapHtml('%7Bnot-json')],
      [
        'the asset map has no en entry',
        assetMapHtml(
          encodeURIComponent(
            JSON.stringify({ 'locales/de/main.ftl': 'locales/de/main.x.ftl' })
          )
        ),
      ],
    ].forEach(([when, html]) => {
      it(`replaces the placeholder with nothing when ${when}`, () => {
        const result = staticHtml(html);
        assert.ok(!result.includes('__L10N_PRELOAD__'));
        assert.ok(!result.includes('rel="preload"'));
      });
    });
  });
});
