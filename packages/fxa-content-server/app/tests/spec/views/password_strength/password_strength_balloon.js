/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import PasswordStrengthBalloonModel from 'models/password_strength/password_strength_balloon';
import PasswordStrengthBalloonView from 'views/password_strength/password_strength_balloon';
import sinon from 'sinon';

let model;
let view;

describe('views/password_strength/password_strength_balloon', () => {
  beforeEach(() => {
    model = new PasswordStrengthBalloonModel({});

    view = new PasswordStrengthBalloonView({
      delayBeforeHideMS: 5,
      delayBeforeUpdateMS: 5,
      model
    });
  });

  afterEach(() => {
    view.destroy(true);
  });

  describe('render', () => {
    it('renders with default values', () => {
      return view.render()
        .then(() => {
          assert.lengthOf(view.$('.password-strength-balloon'), 1);
          assert.lengthOf(view.$('.min-length.unmet'), 1);
          assert.lengthOf(view.$('.not-email.unmet'), 1);
          assert.lengthOf(view.$('.not-common.unmet'), 1);
        });
    });

    it('too short', () => {
      model.set({
        hasEnteredPassword: true,
        isTooShort: true
      });
      return view.render()
        .then(() => {
          assert.lengthOf(view.$('.min-length.fail'), 1);
          assert.lengthOf(view.$('.not-email.unmet'), 1);
          assert.lengthOf(view.$('.not-common.unmet'), 1);
        });
    });

    it('same as email', () => {
      model.set({
        hasEnteredPassword: true,
        isSameAsEmail: true,
        isTooShort: false,
      });
      return view.render()
        .then(() => {
          assert.lengthOf(view.$('.min-length.met'), 1);
          assert.lengthOf(view.$('.not-email.fail'), 1);
          assert.lengthOf(view.$('.not-common.unmet'), 1);
        });
    });

    it('too common', () => {
      model.set({
        hasEnteredPassword: true,
        isCommon: true,
        isTooShort: false,
      });
      return view.render()
        .then(() => {
          assert.lengthOf(view.$('.min-length.met'), 1);
          assert.lengthOf(view.$('.not-email.met'), 1);
          assert.lengthOf(view.$('.not-common.fail'), 1);
        });
    });

    it('all criteria met', () => {
      model.set({
        hasEnteredPassword: true,
        isTooShort: false,
      });
      return view.render()
        .then(() => {
          assert.lengthOf(view.$('.min-length.met'), 1);
          assert.lengthOf(view.$('.not-email.met'), 1);
          assert.lengthOf(view.$('.not-common.met'), 1);
        });
    });
  });


  it('hides if the model is valid', () => {
    sinon.spy(view, 'hideAfterDelay');
    model.set('isValid', true);

    assert.isTrue(view.hideAfterDelay.calledOnce);
  });

  [
    'hasEnteredPassword',
    'isCommon',
    'isSameAsEmail',
    'isTooShort'
  ].forEach(attributeName => {
    it(`updates when ${attributeName} changes`, () => {
      model.set(attributeName, false, { silent: true });

      sinon.stub(view, 'update');
      model.set(attributeName, true);

      assert.isTrue(view.update.calledOnce);
    });
  });

  it('hideAfterDelay re-renders and then hides if the view is supposed to be visible', () => {
    sinon.stub(view, 'setTimeout').callsFake((callback) => callback.call(view));
    sinon.stub(view, 'renderAfterDelay');
    sinon.stub(view, 'hide');

    model.set('isVisible', false);
    view.hideAfterDelay();
    assert.isFalse(view.renderAfterDelay.called);

    model.set('isVisible', true);
    view.hideAfterDelay();

    assert.isTrue(view.renderAfterDelay.calledOnce);
    assert.isTrue(view.setTimeout.calledOnce);
    assert.isTrue(view.hide.calledOnce);
  });
});
