/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('node:assert');
const { EventEmitter, once } = require('node:events');
const express = require('express');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const { modifySettingsStatic, modifyProxyRes } = proxyquire('./settings', {
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
  '../../../../dist/libs/shared/feature-flags': {
    featureFlags: { init: () => {}, all: () => ({}) },
    httpSource: () => () => {},
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

describe('settings', () => {
  describe('modifySettingsStatic', () => {
    it('adds errorPage 500 to the config when the 500 handler sets it', () => {
      const res = mockRes({ errorPage: 500 });
      modifySettingsStatic({ path: '/boom' }, res);
      assert.strictEqual(injectedConfig(res.send.args[0][0]).errorPage, 500);
    });

    it('adds errorPage 404 to the config when the 404 handler sets it', () => {
      const res = mockRes({ errorPage: 404 });
      modifySettingsStatic({ path: '/no-such-page' }, res);
      assert.strictEqual(injectedConfig(res.send.args[0][0]).errorPage, 404);
    });

    it('leaves errorPage out of the config otherwise', () => {
      const res = mockRes();
      modifySettingsStatic({ path: '/signin' }, res);
      assert.strictEqual(
        injectedConfig(res.send.args[0][0]).errorPage,
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

    it('keeps status 500 and adds errorPage 500 when the 500 handler sets it', () => {
      const res = proxy({ errorPage: 500 });
      assert.ok(res.status.calledWith(500));
      assert.strictEqual(
        injectedConfig(res.send.args[0][0].toString()).errorPage,
        500
      );
    });

    it('sets status 404 and adds errorPage 404 when the 404 handler sets it', () => {
      const res = proxy({ errorPage: 404 });
      assert.ok(res.status.calledWith(404));
      assert.strictEqual(
        injectedConfig(res.send.args[0][0].toString()).errorPage,
        404
      );
    });

    it('forwards the proxied status otherwise', () => {
      const res = proxy({});
      assert.ok(res.status.calledWith(200));
    });
  });

  describe('dynamic feature flags', () => {
    it('merges admin-managed flags over config-managed ones', () => {
      const { modifySettingsStatic } = proxyquire('./settings', {
        fs: {
          readFileSync: () =>
            '<meta name="fxa-config" content="__SERVER_CONFIG__" />',
        },
        './configuration': {
          get: (key) =>
            ({
              env: 'production',
              flow_id_key: 'key',
              'featureFlags.passkeysEnabled': false,
            })[key] || '',
        },
        '../../../../dist/libs/shared/l10n': {
          supportedLanguages: [],
          rtlLocales: [],
          '@noCallThru': true,
        },
        '../../../../dist/libs/shared/feature-flags': {
          featureFlags: {
            init: () => {},
            all: () => ({ passkeysEnabled: true, 'new-checkout': true }),
          },
          httpSource: () => () => {},
          '@noCallThru': true,
        },
      });
      const res = mockRes();
      modifySettingsStatic({ path: '/' }, res);
      const { featureFlags } = injectedConfig(res.send.args[0][0]);
      assert.strictEqual(featureFlags.passkeysEnabled, true);
      assert.strictEqual(featureFlags['new-checkout'], true);
    });
  });

  describe('nova theme flag', () => {
    const novaHtml =
      '<html data-theme="__NOVA_THEME__"><meta name="fxa-config" content="__SERVER_CONFIG__" /></html>';

    function load(novaEnabled) {
      return proxyquire('./settings', {
        fs: { readFileSync: () => novaHtml },
        './configuration': {
          get: (key) =>
            ({
              env: 'production',
              flow_id_key: 'key',
              'featureFlags.novaDesignSystem': novaEnabled,
            })[key] || '',
        },
        '../../../../dist/libs/shared/l10n': {
          supportedLanguages: [],
          rtlLocales: [],
          '@noCallThru': true,
        },
        '../../../../dist/libs/shared/feature-flags': {
          featureFlags: { init: () => {}, all: () => ({}) },
          httpSource: () => () => {},
          '@noCallThru': true,
        },
      });
    }

    function staticHtml(novaEnabled) {
      const res = mockRes();
      load(novaEnabled).modifySettingsStatic({ path: '/' }, res);
      return res.send.args[0][0];
    }

    function proxyHtml(novaEnabled) {
      const proxyRes = new EventEmitter();
      proxyRes.statusCode = 200;
      proxyRes.headers = { 'content-type': 'text/html' };
      const res = mockRes();
      load(novaEnabled).modifyProxyRes(proxyRes, {}, res);
      proxyRes.emit('data', Buffer.from(novaHtml));
      proxyRes.emit('end');
      return res.send.args[0][0].toString();
    }

    it('modifySettingsStatic sets data-theme="nova" when the flag is on', () => {
      assert.ok(staticHtml(true).includes('data-theme="nova"'));
    });

    it('modifySettingsStatic clears the placeholder when the flag is off', () => {
      const html = staticHtml(false);
      assert.ok(html.includes('data-theme=""'));
      assert.ok(!html.includes('__NOVA_THEME__'));
    });

    it('modifyProxyRes sets data-theme="nova" when the flag is on', () => {
      assert.ok(proxyHtml(true).includes('data-theme="nova"'));
    });

    it('modifyProxyRes clears the placeholder when the flag is off', () => {
      const html = proxyHtml(false);
      assert.ok(html.includes('data-theme=""'));
      assert.ok(!html.includes('__NOVA_THEME__'));
    });
  });

  describe('serveSettingsPage', () => {
    function load({ proxySettings, proxy, readFileSync }) {
      return proxyquire('./settings', {
        fs: { readFileSync },
        'http-proxy-middleware': { createProxyMiddleware: () => proxy },
        './configuration': {
          get: (key) =>
            ({ env: 'production', proxy_settings: proxySettings })[key] || '',
        },
        '../../../../dist/libs/shared/l10n': {
          supportedLanguages: [],
          rtlLocales: [],
          '@noCallThru': true,
        },
        '../../../../dist/libs/shared/feature-flags': {
          featureFlags: { init: () => {}, all: () => ({}) },
          httpSource: () => () => {},
          '@noCallThru': true,
        },
      });
    }

    it('proxies to fxa-settings when proxy_settings is on', () => {
      const proxy = sinon.spy();
      const { serveSettingsPage } = load({ proxySettings: true, proxy });
      const req = { path: '/' };
      const res = mockRes();
      const next = () => {};
      serveSettingsPage(req, res, next);
      assert.ok(proxy.calledWith(req, res, next));
      assert.ok(res.send.notCalled);
    });

    it('serves the built page when proxy_settings is off', () => {
      const proxy = sinon.spy();
      const { serveSettingsPage } = load({
        proxySettings: false,
        proxy,
        readFileSync: () => '<meta content="__SERVER_CONFIG__" />',
      });
      const res = mockRes({ errorPage: 404 });
      serveSettingsPage({ path: '/' }, res, () => {});
      assert.ok(proxy.notCalled);
      assert.strictEqual(injectedConfig(res.send.args[0][0]).errorPage, 404);
    });

    // Go through Express, which turns a throw or a rejection into next(err).
    async function statusForUnknownPage(settings) {
      const app = express();
      app.use(proxyquire('./404', { './settings': settings }));
      app.use(
        proxyquire('./500', {
          './settings': settings,
          './logging/log': () => ({ error: () => {} }),
        })
      );
      const server = app.listen(0);
      await once(server, 'listening');
      try {
        const response = await fetch(
          `http://localhost:${server.address().port}/no-such-page`,
          { headers: { accept: 'text/html' } }
        );
        await response.text();
        return response.status;
      } finally {
        server.close();
      }
    }

    it('sends a 500 when serving the built page throws', async () => {
      const settings = load({
        proxySettings: false,
        readFileSync: () => {
          throw new Error('no index.html');
        },
      });
      assert.strictEqual(await statusForUnknownPage(settings), 500);
    });

    it('sends a 500 when serving the page rejects', async () => {
      const settings = load({
        proxySettings: true,
        proxy: () => Promise.reject(new Error('proxy failed')),
      });
      assert.strictEqual(await statusForUnknownPage(settings), 500);
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
      return proxyquire('./settings', {
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
        '../../../../dist/libs/shared/feature-flags': {
          featureFlags: { init: () => {}, all: () => ({}) },
          httpSource: () => () => {},
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
