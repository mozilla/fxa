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
  template () {
    return `
      <input id="password" type="password" />
      <div id="balloon" />
    `;
  }

  getAccount () {
    return this.model.get('account');
  }
}

const mixinConfig = {
  balloonEl: '#balloon',
  passwordEl: '#password'
};

Cocktail.mixin(
  PasswordContainingView,
  PasswordStrengthMixin(mixinConfig)
);


describe('views/mixins/password-strength-mixin', () => {
  let account;
  let view;

  beforeEach(() => {
    account = new Model({
      email: 'testuser@testuser.com'
    });

    view = new PasswordContainingView({
      lang: 'ar',
      model: new Model({
        account
      }),
    });
  });

  it('afterRender sets up the password model and view', () => {
    const passwordModel = {};
    const passwordView = {
      afterRender: sinon.spy(() => Promise.resolve('heyo'))
    };

    sinon.stub(view, '_createPasswordStrengthBalloonModel').callsFake(() => passwordModel);
    sinon.stub(view, '_createPasswordWithStrengthBalloonView').callsFake(() => passwordView);
    sinon.stub(view, 'trackChildView');
    sinon.stub(view, 'listenTo');
    sinon.stub(view, 'on');

    return view.afterRender()
      .then((result) => {
        assert.equal(result, 'heyo');

        assert.isTrue(view._createPasswordStrengthBalloonModel.calledOnce);
        assert.isTrue(view.listenTo.calledOnceWith(passwordModel, 'change'));
        assert.isTrue(view.on.calledTwice);

        assert.isTrue(view._createPasswordWithStrengthBalloonView.calledOnce);
        assert.isTrue(view.trackChildView.calledOnceWith(passwordView));
        assert.isTrue(passwordView.afterRender.calledOnce);
      });
  });

  it('submitStart and submitEnd update the passwordModel', () => {
    const passwordModel = new Model({});
    const passwordView = {
      afterRender: sinon.spy(() => Promise.resolve('heyo')),
      on: sinon.spy()
    };

    sinon.stub(view, '_createPasswordStrengthBalloonModel').callsFake(() => passwordModel);
    sinon.stub(view, '_createPasswordWithStrengthBalloonView').callsFake(() => passwordView);

    return view.render()
      .then(() => {
        view.trigger('submitStart');
        assert.isTrue(passwordModel.get('isSubmitting'));
        view.trigger('submitEnd');
        assert.isFalse(passwordModel.get('isSubmitting'));
      });
  });

  describe('isValidStart', () => {
    it('returns false if the validate function returns an error', () => {
      let validationError = undefined;
      view.passwordModel = {
        validate: sinon.spy(() => validationError)
      };
      assert.isTrue(view.isValidStart());
      assert.isTrue(view.passwordModel.validate.calledOnce);

      validationError = new Error('uh oh');
      assert.isFalse(view.isValidStart());
      assert.isTrue(view.passwordModel.validate.calledTwice);
    });
  });

  describe('showValidationErrorsStart', () => {
    it('shows expected validation errors', () => {
      sinon.stub(view, 'focus');
      let validationError = undefined;
      view.passwordModel = {
        validate: sinon.spy(() => validationError)
      };
      assert.isUndefined(view.showValidationErrorsStart());
      assert.isTrue(view.passwordModel.validate.calledOnce);

      validationError = new Error('uh oh');
      assert.isTrue(view.showValidationErrorsStart());
      assert.isTrue(view.passwordModel.validate.calledTwice);

      assert.isTrue(view.focus.calledOnceWith('#password'));
    });
  });

  it('_logErrorIfInvalid only logs validation errors if the password has been checked', () => {
    const error = new Error('uh oh');
    let hasCheckedPassword = false;
    view.passwordModel = {
      get: () => hasCheckedPassword,
      validate: sinon.spy(() => error)
    };
    sinon.stub(view, 'logError');

    view._logErrorIfInvalid();
    assert.isFalse(view.logError.called);

    hasCheckedPassword = true;
    view._logErrorIfInvalid();
    assert.isTrue(view.logError.calledOnceWith(error));
  });

  it('logError triggers a `password.error` on the notifier', () => {
    view.notifier = {
      trigger: sinon.spy()
    };

    const error = new Error('uh oh');
    view.logError(error);

    assert.isTrue(view.notifier.trigger.calledOnceWith('password.error', error));
  });
});
