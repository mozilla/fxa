/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import { assert } from 'chai';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import SmsMessageIds from 'lib/sms-message-ids';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import { SMS_SENT } from '../../../../tests/functional/lib/selectors';
import View from 'views/sms_sent';

const { FIREFOX_MOBILE_INSTALL } = SmsMessageIds;

const Selectors = SMS_SENT;

describe('views/sms_sent', () => {
  let account;
  let metrics;
  let model;
  let relier;
  let view;

  beforeEach(() => {
    account = new Account();
    metrics = new Metrics();
    model = new Backbone.Model({
      account,
      formattedPhoneNumber: '123-456-7890',
      normalizedPhoneNumber: '+11234567890',
    });
    relier = new Relier({ service: 'sync' });

    view = new View({
      broker: new Broker({}),
      metrics,
      model,
      notifier: new Notifier(),
      relier,
      viewName: 'sms-sent',
    });

    sinon
      .stub(view, 'checkAuthorization')
      .callsFake(() => Promise.resolve(true));
  });

  afterEach(() => {
    metrics.destroy();
    metrics = null;

    view.destroy(true);
    view = null;
  });

  it('returns to `sms` if no `formattedPhoneNumber`', () => {
    sinon.spy(view, 'navigate');

    model.unset('formattedPhoneNumber');

    return view.render().then(() => {
      assert.isTrue(view.navigate.calledOnce);
      assert.isTrue(view.navigate.calledWith('sms'));
    });
  });

  it('returns to `sms` if no `normalizedPhoneNumber`', () => {
    sinon.spy(view, 'navigate');

    model.unset('normalizedPhoneNumber');

    return view.render().then(() => {
      assert.isTrue(view.navigate.calledOnce);
      assert.isTrue(view.navigate.calledWith('sms'));
    });
  });

  it('renders phone number, shows marketing', () => {
    return view.render().then(() => {
      assert.include(view.$('.success').text(), '123-456-7890');
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
        view.logFlowEvent.calledWith('link.app-store.ios', 'sms-sent')
      );

      view.$('.marketing-link-android').click();
      assert.isTrue(metrics.logMarketingClick.calledTwice);
      assert.equal(
        metrics.logMarketingClick.args[1][0],
        'autumn-2016-connect-another-device'
      );
      assert.isTrue(view.logFlowEvent.calledTwice);
      assert.isTrue(
        view.logFlowEvent.calledWith('link.app-store.android', 'sms-sent')
      );

      assert.lengthOf(view.$(Selectors.LINK_START_BROWSING), 0);
    });
  });

  it('resend success, displays the success message', () => {
    sinon.stub(account, 'sendSms').callsFake(() => Promise.resolve());
    sinon.spy(view, 'render');
    sinon.stub(view, 'getSmsFeatures').callsFake(() => ['signinCodes']);

    return view.resend().then(() => {
      assert.isTrue(account.sendSms.calledOnce);
      assert.isTrue(
        account.sendSms.calledWith('+11234567890', FIREFOX_MOBILE_INSTALL, {
          features: ['signinCodes'],
        })
      );

      assert.isTrue(view.getSmsFeatures.calledOnce);
      assert.isTrue(view.render.calledOnce);
      const successText = view.$('.success').text();
      assert.include(successText, 'resent');
      assert.include(successText, '123-456-7890');
    });
  });

  it('resend failure, displays the error message', () => {
    sinon
      .stub(account, 'sendSms')
      .callsFake(() => Promise.reject(AuthErrors.toError('THROTTLED')));
    sinon.spy(view, 'displayError');
    sinon.stub(view, 'getSmsFeatures').callsFake(() => ['signinCodes']);

    // _resend is called instead of resend to test resend-mixin integration.
    return view._resend().then(() => {
      assert.isTrue(account.sendSms.calledOnce);
      assert.isTrue(
        account.sendSms.calledWith('+11234567890', FIREFOX_MOBILE_INSTALL, {
          features: ['signinCodes'],
        })
      );

      assert.isTrue(view.getSmsFeatures.calledOnce);
      assert.isTrue(view.displayError.calledOnce);
      assert.isTrue(AuthErrors.is(view.displayError.args[0][0], 'THROTTLED'));
    });
  });

  it('renders Trailhead content', () => {
    relier.set('style', 'trailhead');

    return view.render().then(() => {
      assert.lengthOf(view.$(Selectors.LINK_START_BROWSING), 1);
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
