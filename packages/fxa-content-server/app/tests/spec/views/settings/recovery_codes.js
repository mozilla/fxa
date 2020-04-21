/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Broker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import { Model } from 'backbone';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/recovery_codes';
import WindowMock from '../../../mocks/window';

describe('views/settings/recovery_codes', () => {
  let account;
  let broker;
  let email;
  let hasToken;
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
      getElementById: () => {},
    };

    view = new View({
      broker,
      metrics: metrics,
      model: model,
      notifier: notifier,
      user: user,
      window: windowMock,
    });

    sinon.stub(view, 'translate').callsFake(msg => `translated ${msg}`);

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    sinon.stub(account, 'replaceRecoveryCodes').callsFake(() =>
      Promise.resolve({
        recoveryCodes: ['11110000', '22220000'],
      })
    );

    sinon.stub(view, 'verifyTotpStatus').callsFake(() => hasToken);

    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
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
      '00008888',
    ]);
    metrics = new Metrics({ notifier });
    user = new User();
    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });

    sinon.stub(account, 'checkTotpTokenExists').callsFake(() => {
      return Promise.resolve({ exists: hasToken, verified: hasToken });
    });

    hasToken = true;

    return initView();
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('beforeRender', () => {
    beforeEach(() => {
      sinon.spy(view, 'navigate');
    });

    describe('totp is not setup', () => {
      beforeEach(() => {
        hasToken = false;
        return view.beforeRender();
      });

      it('should redirect to `settings/two_step_authentication`', () => {
        assert.equal(view.navigate.callCount, 1);
        assert.isTrue(
          view.navigate.calledWith('settings/two_step_authentication')
        );
      });
    });

    describe('totp is setup', () => {
      beforeEach(() => {
        hasToken = true;

        return view.beforeRender();
      });

      it('should not redirect to `settings/two_step_authentication`', () => {
        assert.equal(view.navigate.callCount, 0);
      });
    });
  });

  it('should show recovery codes, translated success message', () => {
    assert.equal(view.$('.recovery-code').length, 8);
    assert.equal(
      view.$('.recovery-code:first').text(),
      '00001111',
      'correct recovery code'
    );
  });

  describe('should print codes', () => {
    let printDocument;
    beforeEach(() => {
      printDocument = {
        close: () => {},
        document: {
          close: () => {},
          write: () => {},
        },
        focus: () => {},
        print: () => {},
      };
      sinon.spy(printDocument.document, 'write');
      sinon.spy(printDocument, 'print');
      sinon.stub(view.window, 'open').callsFake(() => {
        return printDocument;
      });
      return view.$('.print-option').click();
    });

    it('print codes', () => {
      assert.equal(view.window.open.called, true, 'open window called');
      const template = '00003333';
      assert.include(
        printDocument.document.write.args[0][0],
        template,
        'window contains code'
      );
      assert.equal(printDocument.print.called, true, 'called print');
    });
  });

  describe('should copy codes', () => {
    beforeEach(() => {
      sinon.stub(view.window.document, 'execCommand').callsFake(() => {});
      sinon.spy(view, '_displaySuccess');
      return view.$('.copy-option').click();
    });

    it('copy codes', () => {
      assert.equal(
        view.window.document.execCommand.called,
        true,
        'execCommand called'
      );
      assert.equal(view._displaySuccess.called, true, 'display success called');
    });
  });

  describe('should download codes', () => {
    beforeEach(() => {
      sinon.stub(view.window.document, 'getElementById').callsFake(() => {
        return {
          click: () => {},
        };
      });
      return view.$('.download-option').click();
    });

    it('download codes', () => {
      assert.equal(
        view.window.document.getElementById.called,
        true,
        'getElementById called'
      );
    });

    it('should truncate long filenames', () => {
      const padding = Array(256).join('1');
      email = `${padding}@email.com`;
      account.set('email', email);
      const formattedFilename = view.getFormatedRecoveryCodeFilename();
      assert.equal(formattedFilename.length, 200, 'truncated filename');
      assert.equal(
        formattedFilename.indexOf('.txt') > 0,
        true,
        'contains text extension'
      );
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
      assert.equal(
        args[0],
        'settings/two_step_authentication',
        'correct path set'
      );
    });
  });

  describe('should only show `generate recovery codes` if model does not have recovery codes', () => {
    beforeEach(() => {
      model.set('recoveryCodes', null);
      return view.render().then(() => $('#container').html(view.$el));
    });

    it('only show `generate recovery codes`', () => {
      assert.equal(view.$('.replace-codes-link').length, 1);
      assert.equal(view.$('#recovery-code-container').length, 0);
    });
  });

  describe('iOS copy work around', () => {
    beforeEach(() => {
      windowMock.navigator.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone ' +
        'OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) ' +
        'Version/5.1 Mobile/9A334 Safari/7534.48.3';
      return view.render().then(() => $('#container').html(view.$el));
    });

    it('should only show `copy recovery codes`', () => {
      assert.equal(view.$('.graphic-copy-option').length, 1);
      assert.equal(view.$('.graphic-print-option').length, 0);
      assert.equal(view.$('.graphic-download-option').length, 0);
    });
  });

  describe('should continue sign-in after generating from low recovery codes', () => {
    beforeEach(() => {
      view.model.set('previousViewName', 'sign_in_recovery_code');
      sinon.spy(view, 'invokeBrokerMethod');
      return view.$('.two-step-authentication-done').click();
    });

    it('call correct broker method', () => {
      const args = view.invokeBrokerMethod.args[0];
      assert.equal(view.invokeBrokerMethod.callCount, 1, 'broker called');
      assert.equal(args[0], 'afterCompleteSignInWithCode', 'correct method');
      assert.equal(args[1], account, 'called with account');
    });
  });
});
