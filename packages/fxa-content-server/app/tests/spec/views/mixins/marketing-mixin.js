/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Backbone = require('backbone');
  const BaseBroker = require('models/auth_brokers/base');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const sinon = require('sinon');
  const Template = require('stache!templates/test_template');
  const MarketingMixin = require('views/mixins/marketing-mixin');

  const View = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(
    View,
    MarketingMixin
  );

  describe('views/mixins/marketing-mixin', () => {
    let broker;
    let view;

    beforeEach(() => {
      broker = new BaseBroker({});

      view = new View({
        broker,
        lang: 'de',
        model: new Backbone.Model({}),
        relier: new Backbone.Model({})
      });
      sinon.spy(view, 'trackChildView');
    });

    describe('broker does not support emailVerificationMarketingSnippet', () => {
      it('does not create the marketing snippet', () => {
        broker.setCapability('emailVerificationMarketingSnippet', false);

        return view.render()
          .then(() => {
            assert.isFalse(view.trackChildView.called);
          });
      });
    });

    describe('broker supports emailVerificationMarketingSnippet', () => {
      it('creates and tracks the marketing snippet', () => {
        broker.setCapability('emailVerificationMarketingSnippet', true);

        return view.render()
          .then(() => {
            assert.isTrue(view.trackChildView.calledOnce);

            // the correct language is passed through.
            const marketingSnippet = view.trackChildView.args[0][0];
            assert.equal(marketingSnippet.lang, 'de');
          });
      });
    });
  });
});
