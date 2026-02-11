/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Notifier from 'lib/channels/notifier';
import P from 'lib/promise';
import BaseBroker from 'models/auth_brokers/base';
import Relier from 'models/reliers/relier';
import User from 'models/user';
import sinon from 'sinon';
import View from 'views/pair/index';
import GleanMetrics from '../../../../scripts/lib/glean';
import WindowMock from '../../../mocks/window';

const UA_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36';
const UA_FIREFOX =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0';

describe('views/pair/index', () => {
  let account;
  let user;
  let view;
  let broker;
  let notifier;
  let relier;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    notifier = new Notifier();
    relier = new Relier(
      {},
      {
        window: windowMock,
      }
    );
    user = new User();
    account = user.initAccount();
    sinon.stub(account, 'accountProfile').callsFake(() => {
      return Promise.resolve({
        authenticationMethods: ['pwd', 'email'],
        authenticatorAssuranceLevel: 1,
        email: 'a@a.com',
      });
    });
    broker = new BaseBroker({
      relier,
      window: windowMock,
    });
    view = new View({
      broker,
      notifier,
      relier,
      viewName: 'pairIndex',
      window: windowMock,
    });
    sinon.stub(view, 'navigate');
    sinon.spy(view, 'replaceCurrentPage');
    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
  });

  afterEach(function () {
    view.destroy();
  });

  describe('render', () => {
    it('redirects to unsupported for non-Firefox desktop', () => {
      windowMock.navigator.userAgent = UA_CHROME;

      return view.render().then(() => {
        assert.isTrue(
          view.replaceCurrentPage.calledOnceWith('pair/unsupported')
        );
      });
    });

    it('redirects to unsupported for Firefox desktop but capability turned off', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      broker.setCapability('supportsPairing', false);

      return view.render().then(() => {
        assert.isTrue(
          view.replaceCurrentPage.calledOnceWith('pair/unsupported')
        );
      });
    });

    it('redirects to unsupported if no capability', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      broker.unsetCapability('supportsPairing');

      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'abc123',
        uid: 'uid',
      });
      return view.render().then(() => {
        assert.isTrue(
          view.replaceCurrentPage.calledOnceWith('pair/unsupported')
        );
      });
    });

    it('redirects to CAD if not signed in', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      broker.setCapability('supportsPairing', true);

      return view.render().then(() => {
        assert.isTrue(
          view.replaceCurrentPage.calledOnceWith('connect_another_device')
        );
      });
    });

    it('shows the code button', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'abc123',
        uid: 'uid',
        verified: true,
      });
      broker.setCapability('supportsPairing', true);

      return view.render().then(() => {
        assert.isFalse(
          view.replaceCurrentPage.calledOnceWith('pair/unsupported')
        );
        assert.ok(
          view.$el.find('#pair-header').text(),
          'Download Firefox on your phone or tablet'
        );
      });
    });

    it('navigates away to sync signin for unverified accounts', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'abc123',
        uid: 'uid',
        verified: false,
      });
      broker.setCapability('supportsPairing', true);
      sinon.stub(view, 'navigateAway').callsFake(() => {});

      return view.render().then(() => {
        assert.isTrue(view.navigateAway.calledOnce);
      });
    });

    it('navigates away to sync signin for accounts with no sessionToken', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      account.set({
        email: 'testuser@testuser.com',
        uid: 'uid',
        verified: true,
      });
      broker.setCapability('supportsPairing', true);
      sinon.stub(view, 'navigateAway').callsFake(() => {});

      return view.render().then(() => {
        assert.isTrue(view.navigateAway.calledOnce);
      });
    });

    describe('askMobileStatus is true', () => {
      let viewChoiceEventStub;
      beforeEach(() => {
        viewChoiceEventStub = sinon.stub(GleanMetrics.cadFirefox, 'choiceView');
        return view.render();
      });

      afterEach(() => {
        viewChoiceEventStub.restore();
      });

      it('renders elements as expected', () => {
        const heading = view.$('#cad-header');
        assert.strictEqual(heading.text(), 'Connect another device');

        const backBtn = view.$('#back-btn');
        assert.strictEqual(backBtn.length, 0);

        const subheading = view.$('#pair-header');
        assert.strictEqual(subheading.text(), 'Sync your Firefox experience');
        assert.equal(view.$('#pair-header-mobile').length, 0);

        assert.strictEqual(view.$('#form-ask-mobile-status').length, 1);

        const radioButtons = view.$('input[type=radio]');
        assert.strictEqual(radioButtons.length, 2);
        assert.strictEqual(view.$(radioButtons[0]).attr('id'), 'has-mobile');
        assert.strictEqual(
          view.$(radioButtons[0]).attr('name'),
          'mobile-download'
        );
        assert.strictEqual(view.$(radioButtons[1]).attr('id'), 'needs-mobile');
        assert.strictEqual(
          view.$(radioButtons[1]).attr('name'),
          'mobile-download'
        );

        const radioButtonLabels = view.$('.input-radio-label');
        assert.strictEqual(radioButtonLabels.length, 2);

        assert.include(
          view.$(radioButtonLabels[0]).text(),
          'I already have Firefox for mobile'
        );
        assert.strictEqual(
          view.$(radioButtonLabels[0]).attr('for'),
          'has-mobile'
        );
        assert.include(
          view.$(radioButtonLabels[1]).text(),
          'I don’t have Firefox for mobile'
        );
        assert.strictEqual(
          view.$(radioButtonLabels[1]).attr('for'),
          'needs-mobile'
        );

        const choiceSubmitBtn = view.$('#set-needs-mobile');
        assert.equal(choiceSubmitBtn.length, 1);
        assert.ok(view.$(choiceSubmitBtn).attr('disabled'));

        const notNowBtn = view.$('#choice-pair-not-now');
        assert.equal(notNowBtn.length, 1);
      });

      it('logs Glean view event on render', () => {
        sinon.assert.calledOnce(viewChoiceEventStub);
      });

      describe('handleRadioEngage', () => {
        let engageChoiceEventStub;
        beforeEach(() => {
          engageChoiceEventStub = sinon.stub(
            GleanMetrics.cadFirefox,
            'choiceEngage'
          );
        });

        afterEach(() => {
          engageChoiceEventStub.restore();
        });

        it('on selection has-mobile radio, sends Glean ping and enables submit', () => {
          const choiceSubmitBtn = view.$('#set-needs-mobile');
          const hasMobile = view.$('#has-mobile');
          view.$(hasMobile).click();
          sinon.assert.calledOnce(engageChoiceEventStub);
          sinon.assert.calledWith(engageChoiceEventStub, {
            reason: 'has mobile',
          });
          assert.equal(view.$(choiceSubmitBtn).attr('disabled'), undefined);
        });

        it('on selection of needs-mobile radio, sends Glean ping and enables submit', () => {
          const choiceSubmitBtn = view.$('#set-needs-mobile');
          const hasMobile = view.$('#needs-mobile');
          view.$(hasMobile).click();
          sinon.assert.calledOnce(engageChoiceEventStub);
          sinon.assert.calledWith(engageChoiceEventStub, {
            reason: 'does not have mobile',
          });
          assert.equal(view.$(choiceSubmitBtn).attr('disabled'), undefined);
        });
      });

      describe('setNeedsMobile submission', () => {
        let submitChoiceEventStub;
        let submitSyncDeviceEventStub;
        let viewMobileDownloadEventStub;
        let submitSpy;
        beforeEach(() => {
          submitChoiceEventStub = sinon.stub(
            GleanMetrics.cadFirefox,
            'choiceSubmit'
          );
          submitSyncDeviceEventStub = sinon.stub(
            GleanMetrics.cadFirefox,
            'syncDeviceSubmit'
          );
          viewMobileDownloadEventStub = sinon.stub(
            GleanMetrics.cadFirefox,
            'view'
          );
          submitSpy = sinon.spy(view, 'submit');
        });

        afterEach(() => {
          submitChoiceEventStub.restore();
          submitSyncDeviceEventStub.restore();
          viewMobileDownloadEventStub.restore();
          submitSpy.restore();
        });

        it('on submission of has-mobile radio, sends Glean pings and calls submit', () => {
          view.$('#has-mobile').click();
          view.$('#set-needs-mobile').click();

          sinon.assert.calledWith(submitChoiceEventStub, {
            reason: 'has mobile',
          });
          sinon.assert.notCalled(submitSyncDeviceEventStub);
          sinon.assert.called(submitSpy);
          sinon.assert.notCalled(viewMobileDownloadEventStub);
        });

        it('on submission of needs-mobile radio, sends Glean ping and renders mobile download state', async () => {
          view.$('#needs-mobile').click();
          view.$('#set-needs-mobile').click();

          sinon.assert.calledWith(submitChoiceEventStub, {
            reason: 'does not have mobile',
          });
          // called on submit
          sinon.assert.notCalled(submitSyncDeviceEventStub);
          sinon.assert.notCalled(submitSpy);

          await P.delay(100);
          sinon.assert.called(viewMobileDownloadEventStub);
          const heading = view.$('#pair-header-mobile');
          assert.strictEqual(heading.text(), 'Download Firefox for mobile');

          assert.strictEqual(view.$('#back-btn').length, 1);

          const stepsList = view.$('ol');
          assert.equal(stepsList.length, 1);
          view.$(stepsList).text().includes('Step 1');
          view.$(stepsList).text().includes('Step 2');

          const qrCode = view.$('.bg-image-cad-qr-code');
          assert.equal(qrCode.length, 1);

          const pairButton = view.$('#start-pairing');
          assert.equal(pairButton.length, 1);
        });

        it('after mobile download state is rendered, on back button click, renders choice screen', async () => {
          view.$('#needs-mobile').click();
          view.$('#set-needs-mobile').click();

          await P.delay(100);
          assert.equal(view.$('#pair-header-mobile').length, 1);
          view.$('#back-btn').click();

          await P.delay(100);
          assert.strictEqual(
            view.$('#pair-header').text(),
            'Sync your Firefox experience'
          );
        });
      });

      describe('choicePairNotNowHandler', () => {
        let notNowChoiceEventStub;
        beforeEach(() => {
          notNowChoiceEventStub = sinon.stub(
            GleanMetrics.cadFirefox,
            'choiceNotnowSubmit'
          );
        });

        afterEach(() => {
          notNowChoiceEventStub.restore();
        });

        it('on not now button click, sends Glean ping', () => {
          view.$('#choice-pair-not-now').click();
          sinon.assert.calledOnce(notNowChoiceEventStub);
        });
      });
    });

    describe('pairNotNowHandler', () => {
      let notNowEventStub;
      beforeEach(() => {
        notNowEventStub = sinon.stub(GleanMetrics.cadFirefox, 'notnowSubmit');
      });
      afterEach(() => {
        notNowEventStub.restore();
      });
      it('on not now button click, sends Glean ping', () => {
        view.model.set('needsMobileConfirmed', true);
        return view.render().then(() => {
          view.$('#pair-not-now').click();
          sinon.assert.calledOnce(notNowEventStub);
        });
      });
    });
  });

  describe('submit', () => {
    let submitSyncDeviceEventStub;
    beforeEach(() => {
      submitSyncDeviceEventStub = sinon.stub(
        GleanMetrics.cadFirefox,
        'syncDeviceSubmit'
      );
    });
    afterEach(() => {
      submitSyncDeviceEventStub.restore();
    });
    it('submits', () => {
      sinon.spy(view.broker, 'openPairPreferences');
      return view.render().then(() => {
        view.submit();
        assert.isTrue(view.broker.openPairPreferences.calledOnce);
        sinon.assert.notCalled(submitSyncDeviceEventStub);
      });
    });
    it('submits and sends expected Glean event when needsMobileConfirmed is true', () => {
      sinon.spy(view.broker, 'openPairPreferences');
      view.model.set('needsMobileConfirmed', true);
      return view.render().then(() => {
        view.submit();
        assert.isTrue(view.broker.openPairPreferences.calledOnce);
        sinon.assert.calledOnce(submitSyncDeviceEventStub);
      });
    });
  });
});
