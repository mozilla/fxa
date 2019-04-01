/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const SmsMixin = require('views/mixins/sms-mixin');
const { assert } = require('chai');
const BaseView = require('views/base');
const Cocktail = require('cocktail');
const Template = require('templates/test_template.mustache');

const SmsView = BaseView.extend({
  template: Template
});
Cocktail.mixin(
  SmsView,
  SmsMixin
);

describe('views/mixins/sms-mixin', () => {
  let view;

  beforeEach(() => {

    view = new SmsView({
      windowMock: window
    });
  });

  it('getSmsFeatures returns an array with `signinCodes`', () => {
    assert.isTrue(view.getSmsFeatures().indexOf('signinCodes') > -1);
  });
});
