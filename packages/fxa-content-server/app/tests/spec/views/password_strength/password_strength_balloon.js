/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import { Model } from 'backbone';
import PasswordStrengthBalloonView from 'views/password_strength/password_strength_balloon';
import sinon from 'sinon';

let model;
let view;

describe('views/password_strength/password_strength_balloon', () => {
  beforeEach(() => {
    model = new Model({});

    view = new PasswordStrengthBalloonView({
      delayBeforeHideMS: 5,
      model,
    });
  });

  afterEach(() => {
    view.destroy(true);
  });

  describe('render', () => {
    it('renders with default values', () => {
      return view.render().then(() => {
        assert.lengthOf(view.$('.password-strength-balloon'), 1);
        assert.lengthOf(view.$('.min-length.unmet'), 1);
        assert.lengthOf(view.$('.not-email.unmet'), 1);
        assert.lengthOf(view.$('.not-common.unmet'), 1);
      });
    });

    it('too short', () => {
      model.set({
        hasUserTakenAction: true,
      });
      model.validationError = AuthErrors.toError('PASSWORD_TOO_SHORT');

      return view.render().then(() => {
        assert.lengthOf(view.$('.min-length.fail'), 1);
        assert.lengthOf(view.$('.not-email.unmet'), 1);
        assert.lengthOf(view.$('.not-common.unmet'), 1);
      });
    });

    it('missing', () => {
      model.set({
        hasUserTakenAction: true,
      });
      model.validationError = AuthErrors.toError('PASSWORD_REQUIRED');

      return view.render().then(() => {
        assert.lengthOf(view.$('.min-length.fail'), 1);
        assert.lengthOf(view.$('.not-email.unmet'), 1);
        assert.lengthOf(view.$('.not-common.unmet'), 1);
      });
    });

    it('same as email', () => {
      model.set({
        hasUserTakenAction: true,
      });
      model.validationError = AuthErrors.toError('PASSWORD_SAME_AS_EMAIL');

      return view.render().then(() => {
        assert.lengthOf(view.$('.min-length.met'), 1);
        assert.lengthOf(view.$('.not-email.fail'), 1);
        assert.lengthOf(view.$('.not-common.unmet'), 1);
      });
    });

    it('too common', () => {
      model.set({
        hasUserTakenAction: true,
      });
      model.validationError = AuthErrors.toError('PASSWORD_TOO_COMMON');

      return view.render().then(() => {
        assert.lengthOf(view.$('.min-length.met'), 1);
        assert.lengthOf(view.$('.not-email.met'), 1);
        assert.lengthOf(view.$('.not-common.fail'), 1);
      });
    });

    it('all criteria met', () => {
      model.set({
        hasUserTakenAction: true,
        isTooShort: false,
      });
      return view.render().then(() => {
        assert.lengthOf(view.$('.min-length.met'), 1);
        assert.lengthOf(view.$('.not-email.met'), 1);
        assert.lengthOf(view.$('.not-common.met'), 1);
      });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      sinon.spy(view, 'render');
    });

    it('renders', () => {
      return view.update().then(() => {
        assert.isTrue(view.render.calledOnce);
      });
    });
  });

  describe('hideOrShow', () => {
    beforeEach(() => {
      sinon.spy(view, 'hideOrShow');
      sinon.spy(view, 'hide');
    });

    it('does not hide if error', () => {
      model.validationError = AuthErrors.toError('PASSWORD_SAME_AS_EMAIL');
      view.hideOrShow();
      assert.isFalse(view.hide.called);
    });

    it('does not hide if input is focused', () => {
      model.set('inputFocused', true);
      view.hideOrShow();
      assert.isFalse(view.hide.called);
    });

    it('hides onblur if no error', () => {
      model.set('inputFocused', false);
      view.hideOrShow();
      assert.isTrue(view.hide.called);
    });
  });
});
