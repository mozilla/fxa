/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('chai').assert;
const Backbone = require('backbone');
const BaseView = require('views/base');
const Cocktail = require('cocktail');
const VerificationReasons = require('lib/verification-reasons');
const VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

const View = BaseView.extend({});
Cocktail.mixin(
  View,
  VerificationReasonMixin
);

describe('views/mixins/verification-reason-mixin', () => {
  let view;

  before(() => {
    view = new View({});
  });

  describe('constructor', () => {
    describe('model has a type', () => {
      let view;

      before(() => {
        const model = new Backbone.Model();
        model.set('type', VerificationReasons.SIGN_IN);

        view = new View({
          model: model
        });
      });

      it('uses the type set in the model', () => {
        assert.equal(view.model.get('type'), VerificationReasons.SIGN_IN);
      });
    });

    describe('model has no type, option set', () => {
      let view;

      before(() => {
        view = new View({
          type: VerificationReasons.SIGN_IN
        });
      });

      it('uses the type set in the options', () => {
        assert.equal(view.model.get('type'), VerificationReasons.SIGN_IN);
      });
    });

    describe('model has no type, option not set', () => {
      it('uses the SIGN_UP type by default', () => {
        assert.equal(view.model.get('type'), VerificationReasons.SIGN_UP);
      });
    });
  });

  describe('isSignIn', () => {
    it('returns `true` for SIGN_IN type', () => {
      view.model.set('type', VerificationReasons.SIGN_IN);
      assert.isTrue(view.isSignIn());
    });

    it('returns `false` for other types', () => {
      view.model.set('type', VerificationReasons.SIGN_UP);
      assert.isFalse(view.isSignIn());
    });
  });

  describe('isSignUp', () => {
    it('returns `true` for SIGN_UP type', () => {
      view.model.set('type', VerificationReasons.SIGN_UP);
      assert.isTrue(view.isSignUp());
    });

    it('returns `false` for other types', () => {
      view.model.set('type', VerificationReasons.SIGN_IN);
      assert.isFalse(view.isSignUp());
    });
  });

  describe('isSecondaryEmail', () => {
    it('returns `true` for SECONDARY_EMAIL_VERIFIED type', () => {
      view.model.set('type', VerificationReasons.SECONDARY_EMAIL_VERIFIED);
      assert.isTrue(view.isSecondaryEmail());
    });

    it('returns `false` for other types', () => {
      view.model.set('type', VerificationReasons.SIGN_IN);
      assert.isFalse(view.isSecondaryEmail());
    });
  });

  describe('keyOfType', () => {
    it('returns the correct value', () => {
      assert.equal(
        view.keyOfVerificationReason(VerificationReasons.SIGN_IN), 'SIGN_IN');
    });
  });
});
