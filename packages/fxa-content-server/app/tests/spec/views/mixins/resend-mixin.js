/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const assert = require('chai').assert;
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const p = require('lib/promise');
  const ResendMixin = require('views/mixins/resend-mixin');
  const sinon = require('sinon');
  const TestTemplate = require('stache!templates/confirm');

  const View = BaseView.extend({
    template: TestTemplate,

    resendError: null,
    resend () {
      if (this.resendError) {
        return p.reject(this.resendError);
      }

      return p();
    }
  });

  Cocktail.mixin(
    View,
    ResendMixin
  );

  describe('views/mixins/resend-mixin', () => {
    let view;

    beforeEach(() => {
      view = new View();

      return view.render()
        .then(() => {
          $('#container').html(view.el);
        });
    });

    it('hooks up to `click` on #resend', () => {
      sinon.spy(view, '_resend');

      view.$('section').click();
      assert.equal(view._resend.callCount, 0);

      view.$('#resend').click();
      assert.equal(view._resend.callCount, 1);
    });

    it('debounces resend calls - submit on first four attempts', () => {
      sinon.spy(view, 'logViewEvent');
      sinon.spy(view, 'displaySuccess');
      sinon.spy(view, 'resend');

      return view._resend()
        .then(() => {
          assert.equal(view.logViewEvent.callCount, 1);
          assert.isTrue(view.logViewEvent.calledWith('resend'));
          assert.isFalse(view.logViewEvent.calledWith('too_many_attempts'));
          assert.equal(view.resend.callCount, 1);
          assert.equal(view.displaySuccess.callCount, 1);
          assert.isTrue(view.displaySuccess.calledWith('Email resent'));
          assert.lengthOf(view.$('#resend:visible'), 1);

          return view._resend();
        }).then(() => {
          assert.equal(view.logViewEvent.callCount, 2);
          assert.isFalse(view.logViewEvent.calledWith('too_many_attempts'));
          assert.equal(view.resend.callCount, 2);
          assert.equal(view.displaySuccess.callCount, 2);
          assert.lengthOf(view.$('#resend:visible'), 1);

          return view._resend();
        }).then(() => {
          assert.equal(view.logViewEvent.callCount, 3);
          assert.isFalse(view.logViewEvent.calledWith('too_many_attempts'));
          assert.equal(view.resend.callCount, 3);
          assert.equal(view.displaySuccess.callCount, 3);
          assert.lengthOf(view.$('#resend:visible'), 1);

          return view._resend();
        }).then(() => {
          assert.equal(view.logViewEvent.callCount, 5);
          assert.isTrue(view.logViewEvent.calledWith('too_many_attempts'));
          assert.equal(view.resend.callCount, 4);
          assert.equal(view.displaySuccess.callCount, 4);
          assert.lengthOf(view.$('#resend:visible'), 0);
        });
    });
  });
});
