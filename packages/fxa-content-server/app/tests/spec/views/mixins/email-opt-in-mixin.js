/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Cocktail from 'cocktail';
import EmailOptInMixin, { MARKETING_EMAIL_CHECKBOX_SELECTOR } from 'views/mixins/email-opt-in-mixin';
import sinon from 'sinon';
import BaseView from 'views/base';

const View = BaseView.extend({
  template: (context) => {
    if (context.isEmailOptInEnabled) {
      return '<div><input type="checkbox" id="marketing-email-optin" class="marketing-email-optin" /></div>';
    } else {
      return '<div />';
    }
  }
});

Cocktail.mixin(
  View,
  EmailOptInMixin
);

describe('views/mixins/email-opt-in-mixin', function () {
  let experimentGroupingRules;
  let marketingEmailEnabled;
  let view;

  beforeEach(() => {
    experimentGroupingRules = {
      choose: () => {}
    };
    marketingEmailEnabled = true;

    view = new View({
      experimentGroupingRules,
      marketingEmailEnabled
    });
  });

  it('exports correct interface', function () {
    assert.isObject(EmailOptInMixin);
    assert.lengthOf(Object.keys(EmailOptInMixin), 8);
    assert.isFunction(EmailOptInMixin.hasOptedInToMarketingEmail);
    assert.isFunction(EmailOptInMixin.isEmailOptInEnabled);
    assert.isFunction(EmailOptInMixin.isEmailOptInVisible);
    assert.isFunction(EmailOptInMixin.hasOptedInToMarketingEmail);
    assert.isFunction(EmailOptInMixin.isBetaNewsletterEnabled);
    assert.isFunction(EmailOptInMixin.isOnlineSafetyNewsletterEnabled);
  });

  describe('render', () => {
    let communicationPrefsVisible;

    beforeEach(() => {
      sinon.stub(experimentGroupingRules, 'choose').callsFake(() => communicationPrefsVisible);
      sinon.spy(view, 'logViewEvent');
      sinon.spy(view, 'template');
    });


    describe('enabled for user', () => {
      beforeEach(() => {
        communicationPrefsVisible = true;
        return view.render();
      });

      it('sets `isEmailOptInEnabled=true, logs correctly`', () => {
        assert.isTrue(view.template.calledOnce);
        const templateArgs = view.template.args[0][0];
        assert.isTrue(templateArgs.isEmailOptInEnabled);

        assert.isTrue(view.logViewEvent.calledOnce);
        assert.isTrue(view.logViewEvent.calledWith('email-optin.visible.true'));
        assert.isTrue(view.isEmailOptInVisible());
      });
    });

    describe('disabled for user', () => {
      beforeEach(() => {
        communicationPrefsVisible = false;
        return view.render();
      });

      it('sets `isEmailOptInEnabled=false, logs correctly`', () => {
        assert.isTrue(view.template.calledOnce);
        const templateArgs = view.template.args[0][0];
        assert.isFalse(templateArgs.isEmailOptInEnabled);

        assert.isTrue(view.logViewEvent.calledOnce);
        assert.isTrue(view.logViewEvent.calledWith('email-optin.visible.false'));
        assert.isFalse(view.isEmailOptInVisible());
      });
    });
  });

  describe('hasOptedInToMarketingEmail', () => {
    beforeEach(() => {
      sinon.stub(experimentGroupingRules, 'choose').callsFake(() => true);
      return view.render();
    });

    it('returns `true` if the checkbox is checked', () => {
      view.$(MARKETING_EMAIL_CHECKBOX_SELECTOR).attr('checked', 'checked');
      assert.isTrue(view.hasOptedInToMarketingEmail());
    });

    it('returns `false` if the checkbox is unchecked', () => {
      view.$(MARKETING_EMAIL_CHECKBOX_SELECTOR).removeAttr('checked');
      assert.isFalse(view.hasOptedInToMarketingEmail());
    });
  });

  describe('isBetaNewsletterEnabled', () => {
    it('returns false', () => {
      assert.isFalse(view.isBetaNewsletterEnabled());
    });
  });

  describe('isOnlineSafetyNewsletterEnabled', () => {
    it('returns false', () => {
      assert.isFalse(view.isOnlineSafetyNewsletterEnabled());
    });
  });
});
