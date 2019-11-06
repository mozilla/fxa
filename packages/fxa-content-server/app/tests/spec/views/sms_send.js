/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import Broker from 'models/auth_brokers/base';
import Backbone from 'backbone';
import CountryTelephoneInfo from 'lib/country-telephone-info';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import SmsMessageIds from 'lib/sms-message-ids';
import View from 'views/sms_send';

describe('views/sms_send', () => {
  let account;
  let broker;
  let formPrefill;
  let metrics;
  let model;
  let notifier;
  let relier;
  let view;

  function createView() {
    view = new View({
      broker,
      formPrefill,
      metrics,
      model,
      notifier,
      relier,
      viewName: 'sms-send',
    });
    sinon
      .stub(view, 'checkAuthorization')
      .callsFake(() => Promise.resolve(true));
  }

  beforeEach(() => {
    account = new Account({ sessionToken: 'token' });
    broker = new Broker();
    formPrefill = new Backbone.Model({});
    metrics = new Metrics();
    model = new Backbone.Model({ account, showSuccessMessage: true });
    notifier = new Notifier();
    relier = new Relier({ service: 'sync' });

    createView();

    return view.render();
  });

  afterEach(() => {
    metrics.destroy();
    metrics = null;

    view.destroy(true);
    view = null;
  });

  describe('render', () => {
    it('with default country, it renders correctly for country, renders marketing', () => {
      assert.equal(view.$('input[type=tel]').__val(), '');
      assert.equal(view.$('input[type=tel]').data('country'), 'US');
      assert.lengthOf(view.$('.marketing-link'), 2);

      // ensure clicks on the marketing links work as expected.
      sinon.spy(metrics, 'logMarketingClick');
      sinon.spy(view, 'logFlowEvent');
      $('#container').html(view.$el);

      view.$('.marketing-link-ios').click();
      assert.isTrue(metrics.logMarketingClick.calledOnce);
      assert.equal(
        metrics.logMarketingClick.args[0][0],
        'autumn-2016-connect-another-device'
      );
      assert.isTrue(view.logFlowEvent.calledOnce);
      assert.isTrue(
        view.logFlowEvent.calledWith('link.app-store.ios', 'sms-send')
      );

      view.$('.marketing-link-android').click();
      assert.isTrue(metrics.logMarketingClick.calledTwice);
      assert.equal(
        metrics.logMarketingClick.args[1][0],
        'autumn-2016-connect-another-device'
      );
      assert.isTrue(view.logFlowEvent.calledTwice);
      assert.isTrue(
        view.logFlowEvent.calledWith('link.app-store.android', 'sms-send')
      );
    });

    it('with model set country, it renders correctly for country', () => {
      formPrefill.unset('phoneNumber');
      model.set('country', 'RO');

      return view.render().then(() => {
        assert.equal(view.$('input[type=tel]').__val(), '+40');
        assert.equal(view.$('input[type=tel]').data('country'), 'RO');
      });
    });

    it('with relier set country, it renders correctly for country', () => {
      formPrefill.unset('phoneNumber');
      relier.set('country', 'GB');

      return view.render().then(() => {
        assert.equal(view.$('input[type=tel]').__val(), '+44');
        assert.equal(view.$('input[type=tel]').data('country'), 'GB');
      });
    });

    it('with relier set country that is not supported, it renders correctly for the US/CA, renders marketing', () => {
      formPrefill.unset('phoneNumber');
      relier.set('country', 'KZ');

      return view.render().then(() => {
        assert.equal(view.$('input[type=tel]').__val(), '');
        assert.equal(view.$('input[type=tel]').data('country'), 'US');
        assert.lengthOf(view.$('.marketing-link'), 2);
      });
    });

    it('with no relier set country, it renders correctly for the US/CA', () => {
      formPrefill.unset('phoneNumber');
      relier.unset('country');
      return view.render().then(() => {
        assert.equal(view.$('input[type=tel]').__val(), '');
        assert.equal(view.$('input[type=tel]').data('country'), 'US');
        assert.lengthOf(view.$('.marketing-link'), 2);
      });
    });

    it('for signin, renders extra text', () => {
      sinon.stub(view, 'isSignIn').callsFake(() => true);
      return view.render().then(() => {
        assert.include(
          view
            .$('.send-sms > p')
            .text()
            .toLowerCase(),
          'send firefox directly to your smartphone'
        );
      });
    });

    it('with showSuccessMessage set to false, no success message is rendered', () => {
      model.set('showSuccessMessage', false);

      return view.render().then(() => {
        assert.lengthOf(view.$('.success'), 0);
      });
    });
  });

  describe('submit', () => {
    describe('succeeds', () => {
      it('it delegates to `account.sendSms`, calls `_onSendSmsSuccess`', () => {
        sinon
          .stub(account, 'sendSms')
          .callsFake(() =>
            Promise.resolve({ formattedPhoneNumber: '123-456-7890' })
          );
        sinon.spy(view, '_onSendSmsSuccess');
        sinon.stub(view, 'getSmsFeatures').callsFake(() => ['signinCodes']);
        view.$('input[type=tel]').val('1234567890');

        return view.submit().then(() => {
          assert.isTrue(account.sendSms.calledOnce);
          assert.isTrue(
            account.sendSms.calledWith(
              '+11234567890',
              SmsMessageIds.FIREFOX_MOBILE_INSTALL,
              {
                features: ['signinCodes'],
              }
            )
          );

          assert.isTrue(view.getSmsFeatures.calledOnce);
          assert.isTrue(view._onSendSmsSuccess.calledOnce);
          assert.isTrue(view._onSendSmsSuccess.calledWith('123-456-7890'));
        });
      });
    });

    describe('errors', () => {
      it('it delegates to `account.sendSms`, calls `_onSendSmsError` with the error', () => {
        const err = AuthErrors.toError('UNEXPECTED ERROR');
        sinon.stub(account, 'sendSms').callsFake(() => Promise.reject(err));
        sinon.spy(view, '_onSendSmsError');
        view.$('input[type=tel]').val('1234567890');

        return view.submit().then(assert.fail, _err => {
          assert.strictEqual(_err, err);
          assert.isTrue(account.sendSms.calledOnce);
          assert.isTrue(
            account.sendSms.calledWith(
              '+11234567890',
              SmsMessageIds.FIREFOX_MOBILE_INSTALL
            )
          );
          assert.isTrue(view._onSendSmsError.calledOnce);
          assert.isTrue(view._onSendSmsError.calledWith(err));
        });
      });
    });
  });

  describe('_onSendSmsSuccess', () => {
    it('navigates to `sms/sent`', () => {
      sinon.spy(view, 'navigate');
      sinon
        .stub(view, '_formatServerPhoneNumber')
        .callsFake(() => '098-765-4321');
      view.$('input[type=tel]').val('1234567890');

      view._onSendSmsSuccess('123-456-7890');

      assert.isTrue(view.navigate.calledOnce);
      assert.isTrue(view.navigate.calledWith('sms/sent'));
      const navigateOptions = view.navigate.args[0][1];
      assert.equal(navigateOptions.country, 'US');
      assert.equal(navigateOptions.formattedPhoneNumber, '098-765-4321');
      assert.equal(navigateOptions.normalizedPhoneNumber, '+11234567890');
      assert.instanceOf(navigateOptions.account, Account);
    });
  });

  describe('_onSendSmsError', () => {
    beforeEach(() => {
      sinon.spy(view, 'showValidationError');
    });

    function testPhoneNumberShowValidationError(err) {
      const $phoneNumberEl = view.$('input[type=tel]');
      view._onSendSmsError(err);
      assert.isTrue(view.showValidationError.calledWith($phoneNumberEl, err));
    }

    describe('fails with AuthErrors.INVALID_PHONE_NUMBER', () => {
      it('prints the validation error', () => {
        testPhoneNumberShowValidationError(
          AuthErrors.toError('INVALID_PHONE_NUMBER')
        );
      });
    });

    describe('all other errors', () => {
      it('propagates the error', () => {
        const err = AuthErrors.toError('UNEXPECTED_ERROR');
        assert.throws(() => {
          view._onSendSmsError(err);
        }, err);
      });
    });
  });

  describe('_formatServerPhoneNumber', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      relier.set('country', 'US');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('returns a formatted phone number', () => {
      // no country code prefix
      sandbox
        .stub(CountryTelephoneInfo.US, 'format')
        .callsFake(() => '098-765-4321');
      assert.equal(
        view._formatServerPhoneNumber('123-456-7890'),
        '098-765-4321'
      );
      assert.isTrue(CountryTelephoneInfo.US.format.calledOnce);
      assert.isTrue(CountryTelephoneInfo.US.format.calledWith('123-456-7890'));
    });
  });

  describe('_getNormalizedPhoneNumber', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      relier.set('country', 'US');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('returns a normalized phone number', () => {
      // no country code prefix
      sandbox
        .stub(CountryTelephoneInfo.US, 'normalize')
        .callsFake(() => '+10987654321');
      view.$('input[type=tel]').val('1234567890');
      assert.equal(view._getNormalizedPhoneNumber(), '+10987654321');
      assert.isTrue(CountryTelephoneInfo.US.normalize.calledOnce);
      assert.isTrue(CountryTelephoneInfo.US.normalize.calledWith('1234567890'));
    });
  });

  describe('flow events', () => {
    beforeEach(() => {
      sinon.spy(view, 'logFlowEvent');
      sinon.spy(view, 'logFlowEventOnce');
      sinon.stub(view, 'navigate').callsFake(() => {});
    });

    it('logs a click on `why is this required`', () => {
      view.$('a[href="/sms/why"]').click();
      assert.isTrue(view.logFlowEvent.calledOnce);
      assert.isTrue(view.logFlowEvent.calledWith('link.why'));
    });

    it('logs a click in the phone number field', () => {
      view
        .$('input[type=tel]')
        .val('1234')
        .click();
      assert.isTrue(view.logFlowEventOnce.calledOnce);
      assert.isTrue(view.logFlowEventOnce.calledWith('engage'));
    });
  });

  describe('formPrefill', () => {
    const USER_ENTERED_PHONE_NUMBER = '44(1234) 567890';
    it('destroy saves phoneNumber into formPrefill', () => {
      view.$('input[type=tel]').val(USER_ENTERED_PHONE_NUMBER);

      view.destroy();

      assert.equal(formPrefill.get('phoneNumber'), USER_ENTERED_PHONE_NUMBER);
    });

    it('render with formPrefill fills in information correctly', () => {
      formPrefill.set('phoneNumber', USER_ENTERED_PHONE_NUMBER);
      createView();

      return view.render().then(() => {
        const $telEl = view.$('input[type=tel]');
        assert.equal($telEl.__val(), USER_ENTERED_PHONE_NUMBER);
      });
    });
  });

  describe('svg-graphic', () => {
    const userAgentObj = {
      supportsSvgTransformOrigin: () => true,
    };

    beforeEach(() => {
      return view.render();
    });

    it('shows animated hearts where supportsSvgTransformOrigin is supported', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => userAgentObj);
      assert.equal(
        view.$el.find('.graphic-connect-another-device-hearts').length,
        1
      );
      assert.equal(view.$el.find('.graphic-connect-another-device').length, 0);
    });

    it('shows non-animated hearts where supportsSvgTransformOrigin is not supported', () => {
      userAgentObj.supportsSvgTransformOrigin = () => false;
      sinon.stub(view, 'getUserAgent').callsFake(() => userAgentObj);
      return view.render().then(() => {
        assert.equal(
          view.$el.find('.graphic-connect-another-device-hearts').length,
          0
        );
        assert.equal(
          view.$el.find('.graphic-connect-another-device').length,
          1
        );
      });
    });
  });
});
