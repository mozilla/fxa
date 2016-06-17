/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var assert = require('chai').assert;
  var Backbone = require('backbone');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var VerificationReasons = require('lib/verification-reasons');
  var VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  var View = BaseView.extend({});
  Cocktail.mixin(
    View,
    VerificationReasonMixin
  );

  describe('views/mixins/verification-reason-mixin', function () {
    describe('constructor', function () {
      describe('model has a type', function () {
        var view;

        before(function () {
          var model = new Backbone.Model();
          model.set('type', VerificationReasons.SIGN_IN);

          view = new View({
            model: model
          });
        });

        it('uses the type set in the model', function () {
          assert.equal(view.model.get('type'), VerificationReasons.SIGN_IN);
        });
      });

      describe('model has no type, option set', function () {
        var view;

        before(function () {
          view = new View({
            type: VerificationReasons.SIGN_IN
          });
        });

        it('uses the type set in the options', function () {
          assert.equal(view.model.get('type'), VerificationReasons.SIGN_IN);
        });
      });

      describe('model has no type, option not set', function () {
        var view;

        before(function () {
          view = new View({});
        });

        it('uses the SIGN_UP type by default', function () {
          assert.equal(view.model.get('type'), VerificationReasons.SIGN_UP);
        });
      });
    });

    describe('isSignIn', function () {
      var view;

      before(function () {
        view = new View({});
      });

      it('returns `true` for SIGN_IN type', function () {
        view.model.set('type', VerificationReasons.SIGN_IN);
        assert.isTrue(view.isSignIn());
      });

      it('returns `false` for other types', function () {
        view.model.set('type', VerificationReasons.SIGN_UP);
        assert.isFalse(view.isSignIn());
      });
    });

    describe('isSignUp', function () {
      var view;

      before(function () {
        view = new View({});
      });

      it('returns `true` for SIGN_UP type', function () {
        view.model.set('type', VerificationReasons.SIGN_UP);
        assert.isTrue(view.isSignUp());
      });

      it('returns `false` for other types', function () {
        view.model.set('type', VerificationReasons.SIGN_IN);
        assert.isFalse(view.isSignUp());
      });
    });

    describe('keyOfType', function () {
      var view;

      before(function () {
        view = new View({});
      });

      it('returns the correct value', function () {
        assert.equal(
          view.keyOfVerificationReason(VerificationReasons.SIGN_IN), 'SIGN_IN');
      });
    });
  });
});

