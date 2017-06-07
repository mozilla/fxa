/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const SmsMixin = require('views/mixins/sms-mixin');
  const { assert } = require('chai');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Relier = require('models/reliers/base');
  const SearchParamMixin = require('lib/search-param-mixin');
  const Template = require('stache!templates/test_template');

  const SmsView = BaseView.extend({
    template: Template
  });
  Cocktail.mixin(
    SmsView,
    SearchParamMixin,
    SmsMixin
  );

  describe('views/mixins/sms-mixin', () => {
    let relier;
    let view;

    beforeEach(() => {
      relier = new Relier();

      view = new SmsView({
        relier,
        windowMock: window
      });
    });

    describe('getSmsFeatures', () => {
      describe('relier.enableSigninCodes=true', () => {
        it('returns an array with `signinCodes`', () => {
          relier.set('enableSigninCodes', true);
          assert.isTrue(view.getSmsFeatures().indexOf('signinCodes') > -1);
        });
      });

      describe('relier.enableSigninCodes=false', () => {
        it('returns an empty array', () => {
          relier.set('enableSigninCodes', false);
          assert.deepEqual(view.getSmsFeatures(), []);
        });
      });
    });
  });
});
