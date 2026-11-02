/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('node:assert');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

function setup({ accepts }) {
  const settings = { serveSettingsPage: sinon.spy() };
  const serverErrorHandler = proxyquire('./500', {
    './logging/log': () => ({ error: () => {} }),
    './settings': settings,
  });
  const req = {
    accepts: (type) => type === accepts,
  };
  const res = {
    locals: {},
    status: sinon.spy(),
    send: sinon.spy(),
    type: sinon.stub().returnsThis(),
  };
  const next = () => {};
  serverErrorHandler(new Error('boom'), req, res, next);
  return { settings, req, res, next };
}

describe('500', () => {
  it('sets errorPage 500 and serves the settings page for HTML', () => {
    const { settings, req, res, next } = setup({ accepts: 'html' });
    assert.ok(res.status.calledWith(500));
    assert.strictEqual(res.locals.errorPage, 500);
    assert.ok(settings.serveSettingsPage.calledWith(req, res, next));
  });

  it('sends a JSON error', () => {
    const { res } = setup({ accepts: 'json' });
    assert.ok(res.status.calledWith(500));
    assert.ok(
      res.send.calledWith({ error: 'System unavailable, try again soon' })
    );
  });

  it('sends a text error', () => {
    const { res } = setup({ accepts: 'txt' });
    assert.ok(res.type.calledWith('txt'));
    assert.ok(res.send.calledWith('System unavailable, try again soon'));
  });
});
