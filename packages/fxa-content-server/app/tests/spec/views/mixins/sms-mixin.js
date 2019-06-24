/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SmsMixin from 'views/mixins/sms-mixin';
import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Template from 'templates/test_template.mustache';

const SmsView = BaseView.extend({
  template: Template,
});
Cocktail.mixin(SmsView, SmsMixin);

describe('views/mixins/sms-mixin', () => {
  let view;

  beforeEach(() => {
    view = new SmsView({
      windowMock: window,
    });
  });

  it('getSmsFeatures returns an array with `signinCodes`', () => {
    assert.isTrue(view.getSmsFeatures().indexOf('signinCodes') > -1);
  });
});
