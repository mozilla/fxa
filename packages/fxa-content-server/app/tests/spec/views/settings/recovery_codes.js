/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const $ = require('jquery');
const assert = require('chai').assert;
const Metrics = require('lib/metrics');
const { Model } = require('backbone');
const Notifier = require('lib/channels/notifier');
const sinon = require('sinon');
const TestHelpers = require('../../../lib/helpers');
const User = require('models/user');
const View = require('views/settings/recovery_codes');
const WindowMock = require('../../../mocks/window');

describe('views/settings/recovery_codes', () => {
  let account;
  let email;
  let model;
  let metrics;
  let notifier;
  const UID = '123';
  let user;
  let view;
  let windowMock;

  function initView() {
    windowMock = new WindowMock();
    windowMock.document = {
      body: {},
      execCommand: () => {},
      getElementById: () => {}
    };

    view = new View({
      metrics: metrics,
      model: model,
      notifier: notifier,
      user: user,
      window: windowMock
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    sinon.stub(account, 'replaceRecoveryCodes').callsFake(() => Promise.resolve({
      recoveryCodes: [
        '11110000',
        '22220000'
      ]
    }));

    return view.render()
      .then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    model = new Model();
    model.set('recoveryCodes', [
      '00001111',
      '00002222',
      '00003333',
      '00004444',
      '00005555',
      '00006666',
      '00007777',
      '00008888'
    ]);
    metrics = new Metrics({notifier});
    user = new User();
    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true
    });

    return initView();
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('should show recovery codes', () => {
    it('show codes', () => {
      assert.equal(view.$('.recovery-code').length, 8);
      assert.equal(view.$('.recovery-code:first').text(), '00001111', 'correct recovery code');
      assert.include(view.$('.modal-success').text(), 'authentication enabled');
    });
  });

  describe('should print codes', () => {
    let printDocument;
    beforeEach(() => {
      printDocument = {
        close: () => {},
        document: {
          close: () => {},
          write: () => {}
        },
        focus: () => {},
        print: () => {}
      };
      sinon.spy(printDocument.document, 'write');
      sinon.spy(printDocument, 'print');
      sinon.stub(view.window, 'open').callsFake(() => {
        return printDocument;
      });
      return view.$('.print-codes').click();
    });

    it('print codes', () => {
      assert.equal(view.window.open.called, true, 'open window called');
      const template = '00003333';
      assert.include(printDocument.document.write.args[0][0], template, 'window contains code');
      assert.equal(printDocument.print.called, true, 'called print');
    });
  });

  describe('should copy codes', () => {
    beforeEach(() => {
      sinon.stub(view.window.document, 'execCommand').callsFake(() => {});
      sinon.spy(view, '_displaySuccess');
      return view.$('.copy-codes').click();
    });

    it('copy codes', () => {
      assert.equal(view.window.document.execCommand.called, true, 'execCommand called');
      assert.equal(view._displaySuccess.called, true, 'display success called');
    });
  });

  describe('should download codes', () => {
    beforeEach(() => {
      sinon.stub(view.window.document, 'getElementById').callsFake(() => {
        return {
          click: () => {}
        };
      });
      return view.$('.download-codes').click();
    });

    it('download codes', () => {
      assert.equal(view.window.document.getElementById.called, true, 'getElementById called');
    });
  });

  describe('should replaces codes', () => {
    beforeEach(() => {
      return view._replaceRecoveryCodes();
    });

    it('show codes', () => {
      assert.equal(view.recoveryCodes.length, 2);
      assert.equal(view.recoveryCodes[0], '11110000');
    });
  });

  describe('should return to /two_step_authentication', () => {
    beforeEach(() => {
      sinon.spy(view, 'navigate');
      return view.$('.two-step-authentication-done').click();
    });

    it('navigates', () => {
      const args = view.navigate.args[0];
      assert.equal(args[0], 'settings/two_step_authentication', 'correct path set');
    });
  });
});
