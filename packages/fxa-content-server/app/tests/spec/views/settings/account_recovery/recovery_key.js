/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Broker from 'models/auth_brokers/base';
import { Model } from 'backbone';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import sinon from 'sinon';
import TestHelpers from '../../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/account_recovery/recovery_key';
import WindowMock from '../../../../mocks/window';

describe('views/settings/account_recovery/recovery_key', () => {
  let account,
    broker,
    email,
    notifier,
    relier,
    user,
    view,
    model,
    windowMock,
    keyExists;
  const UID = '123',
    recoveryKey = 'AV4TY1EXMEQARDBQ';

  function initView() {
    windowMock = new WindowMock();
    windowMock.document = {
      body: {},
      execCommand: () => {},
      getElementById: () => {},
    };

    view = new View({
      broker,
      model,
      notifier,
      relier,
      user,
      window: windowMock,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    user = new User();
    model = new Model();
    model.set('recoveryKey', recoveryKey);
    account = user.initAccount({
      email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    relier = new Relier();
    sinon.stub(account, 'checkRecoveryKeyExists').callsFake(() => {
      return Promise.resolve({ exists: keyExists });
    });

    keyExists = true;
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('should show recovery key', () => {
    beforeEach(() => {
      return initView();
    });

    it('shows recovery key', () => {
      assert.equal(
        view.$('.recovery-key')[0].innerText,
        view.formatRecoveryKey(recoveryKey),
        'displays recovery key'
      );
      assert.equal(
        view.$('.description').length > 0,
        true,
        'displays warnings'
      );
    });
  });

  describe('should print recovery key', () => {
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
      return initView().then(() => {
        sinon.stub(view.window, 'open').callsFake(() => {
          return printDocument;
        });
        view.$('.print-option').click();
      });
    });

    it('print key', () => {
      assert.equal(view.window.open.called, true, 'open window called');
      assert.include(
        printDocument.document.write.args[0][0],
        view.formatRecoveryKey(recoveryKey),
        'window contains recovery key'
      );
      assert.equal(printDocument.print.called, true, 'called print');
    });
  });

  describe('should download key', () => {
    beforeEach(() => {
      return initView().then(() => {
        sinon.stub(view.window.document, 'getElementById').callsFake(() => {
          return {
            click: () => {},
          };
        });
        return view.$('.download-option').click();
      });
    });

    it('download key', () => {
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
      const formattedFilename = view.getFormatedRecoveryKeyFilename();
      assert.equal(formattedFilename.length, 200, 'truncated filename');
      assert.equal(
        formattedFilename.indexOf('.txt') > 0,
        true,
        'contains text extension'
      );
    });
  });

  describe('beforeRender', () => {
    describe('should redirect to /settings/account_recovery if no key exists', () => {
      beforeEach(() => {
        view = new View({
          broker,
          notifier,
          relier,
          user,
        });
        sinon.spy(view, 'navigate');
        keyExists = false;
        sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
        return view.render();
      });

      it('redirects correctly', () => {
        assert.equal(
          account.checkRecoveryKeyExists.callCount,
          1,
          'check key status'
        );
        assert.equal(
          view.navigate.args[0][0],
          '/settings/account_recovery',
          'navigated to account recovery'
        );
      });
    });
  });

  describe('iOS copy workaround', () => {
    beforeEach(() => {
      return initView()
        .then(() => {
          windowMock.navigator.userAgent =
            'Mozilla/5.0 (iPhone; CPU iPhone ' +
            'OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) ' +
            'Version/5.1 Mobile/9A334 Safari/7534.48.3';
          return view.render();
        })
        .then(() => $('#container').html(view.$el));
    });

    it('should only show `copy recovery key`', () => {
      assert.equal(view.$('.graphic-copy-option').length, 1);
      assert.equal(view.$('.graphic-print-option').length, 0);
      assert.equal(view.$('.graphic-download-option').length, 0);
    });
  });
});
