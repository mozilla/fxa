/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('node:assert');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

function setup({ accepts, proxySettings = false }) {
  const settings = {
    createSettingsProxy: sinon.spy(),
    modifySettingsStatic: sinon.spy(),
  };
  const notFoundHandler = proxyquire('./404', {
    './configuration': { get: () => proxySettings },
    './beta-settings': settings,
  });
  const req = { accepts: (type) => type === accepts };
  const res = {
    locals: {},
    status: sinon.spy(),
    send: sinon.spy(),
    type: sinon.stub().returnsThis(),
  };
  const next = () => {};
  notFoundHandler(req, res, next);
  return { settings, req, res, next };
}

describe('404', () => {
  it('serves the settings page with notFound set for HTML', () => {
    const { settings, req, res } = setup({ accepts: 'html' });
    assert.ok(res.status.calledWith(404));
    assert.strictEqual(res.locals.notFound, true);
    assert.ok(settings.modifySettingsStatic.calledWith(req, res));
    assert.ok(settings.createSettingsProxy.notCalled);
  });

  it('proxies to fxa-settings for HTML when proxy_settings is on', () => {
    const { settings, req, res, next } = setup({
      accepts: 'html',
      proxySettings: true,
    });
    assert.ok(settings.createSettingsProxy.calledWith(req, res, next));
    assert.ok(settings.modifySettingsStatic.notCalled);
  });

  it('sends a JSON error', () => {
    const { res } = setup({ accepts: 'json' });
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({ error: 'Not found' }));
  });

  it('sends a text error', () => {
    const { res } = setup({ accepts: 'txt' });
    assert.ok(res.type.calledWith('txt'));
    assert.ok(res.send.calledWith('Not found'));
  });
});
