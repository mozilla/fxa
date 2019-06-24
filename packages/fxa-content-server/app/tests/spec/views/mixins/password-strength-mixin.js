/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Cocktail from 'cocktail';
import { Model } from 'backbone';
import PasswordStrengthMixin from 'views/mixins/password-strength-mixin';
import FormView from 'views/form';
import sinon from 'sinon';

class PasswordContainingView extends FormView {
  template() {
    return `
      <input id="password" type="password" />
      <div id="balloon" />
    `;
  }

  getAccount() {
    return this.model.get('account');
  }
}

const mixinConfig = {
  balloonEl: '#balloon',
  passwordEl: '#password',
};

Cocktail.mixin(PasswordContainingView, PasswordStrengthMixin(mixinConfig));

class NoPasswordContainingView extends FormView {
  template() {
    return `
      <div id="balloon" />
    `;
  }

  getAccount() {
    return this.model.get('account');
  }
}

Cocktail.mixin(NoPasswordContainingView, PasswordStrengthMixin(mixinConfig));

describe('views/mixins/password-strength-mixin', () => {
  let account;
  let view;

  beforeEach(() => {
    account = new Model({
      email: 'testuser@testuser.com',
    });

    view = new PasswordContainingView({
      lang: 'ar',
      model: new Model({
        account,
      }),
    });
  });

  it('render does nothing if the view has no password field', () => {
    const noPasswordView = new NoPasswordContainingView({
      lang: 'ar',
      model: new Model({
        account,
      }),
    });

    const passwordModel = {};
    const passwordView = {
      afterRender: sinon.spy(() => Promise.resolve('heyo')),
    };

    sinon
      .stub(noPasswordView, '_createPasswordStrengthBalloonModel')
      .callsFake(() => passwordModel);
    sinon
      .stub(noPasswordView, '_createPasswordWithStrengthBalloonView')
      .callsFake(() => passwordView);

    return noPasswordView.render().then(() => {
      assert.isFalse(noPasswordView._createPasswordStrengthBalloonModel.called);
      assert.isFalse(
        noPasswordView._createPasswordWithStrengthBalloonView.called
      );
    });
  });

  it('render sets up the password model and view', () => {
    const passwordModel = {
      fetch: sinon.spy(() => Promise.resolve()),
    };
    const passwordView = {};

    sinon
      .stub(view, '_createPasswordStrengthBalloonModel')
      .callsFake(() => passwordModel);
    sinon
      .stub(view, '_createPasswordWithStrengthBalloonView')
      .callsFake(() => passwordView);
    sinon.stub(view, 'trackChildView');
    sinon.stub(view, 'listenTo');

    return view.render().then(() => {
      assert.isTrue(view._createPasswordStrengthBalloonModel.calledOnce);
      assert.isTrue(view.listenTo.calledOnceWith(passwordModel, 'invalid'));

      assert.isTrue(view._createPasswordWithStrengthBalloonView.calledOnce);
      assert.isTrue(view.trackChildView.calledOnceWith(passwordView));

      assert.isTrue(passwordModel.fetch.calledOnce);
    });
  });

  it('_logErrorIfInvalid only logs validation errors if the password has been checked', () => {
    view.passwordModel = {
      get: () => true,
    };

    sinon.stub(view, 'logError');

    view._logErrorIfInvalid();
    assert.isFalse(view.logError.called);

    const error = new Error('uh oh');
    view.passwordModel.validationError = error;

    view._logErrorIfInvalid();
    assert.isTrue(view.logError.calledOnceWith(error));
  });
});
