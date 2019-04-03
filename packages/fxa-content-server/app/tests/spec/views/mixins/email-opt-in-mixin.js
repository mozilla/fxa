/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import Cocktail from 'cocktail';
import EmailOptInMixin from 'views/mixins/email-opt-in-mixin';
import sinon from 'sinon';
import BaseView from 'views/base';

const View = BaseView.extend({
  template: () => `
    <input type="checkbox" class="marketing-email-optin" checked>Opt-in to email</input>
  `
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
    assert.lengthOf(Object.keys(EmailOptInMixin), 5);
    assert.isFunction(EmailOptInMixin.hasOptedInToMarketingEmail);
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

      it('sets `isEmailOptInVisible=true, logs correctly`', () => {
        assert.isTrue(view.template.calledOnce);
        const templateArgs = view.template.args[0][0];
        assert.isTrue(templateArgs.isEmailOptInVisible);

        assert.isTrue(view.logViewEvent.calledOnce);
        assert.isTrue(view.logViewEvent.calledWith('email-optin.visible.true'));
      });
    });

    describe('disabled for user', () => {
      beforeEach(() => {
        communicationPrefsVisible = false;
        return view.render();
      });

      it('sets `isEmailOptInVisible=false, logs correctly`', () => {
        assert.isTrue(view.template.calledOnce);
        const templateArgs = view.template.args[0][0];
        assert.isFalse(templateArgs.isEmailOptInVisible);

        assert.isTrue(view.logViewEvent.calledOnce);
        assert.isTrue(view.logViewEvent.calledWith('email-optin.visible.false'));
      });
    });
  });

  describe('hasOptedInToMarketingEmail', () => {
    beforeEach(() => {
      return view.render();
    });

    it('returns `true` if the checkbox is checked', () => {
      view.$('.marketing-email-optin').attr('checked', 'checked');
      assert.isTrue(view.hasOptedInToMarketingEmail());
    });

    it('returns `false` if the checkbox is unchecked', () => {
      view.$('.marketing-email-optin').removeAttr('checked');
      assert.isFalse(view.hasOptedInToMarketingEmail());
    });
  });
});
