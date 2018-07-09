/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Cocktail from 'cocktail';
import { Model } from 'backbone';
import PasswordStrenghExperimentMixin from 'views/mixins/password-strength-experiment-mixin';
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
  PasswordStrenghExperimentMixin(mixinConfig)
);


describe('views/mixins/password-strength-experiment-mixin', () => {
  let account;
  let view;

  beforeEach(() => {
    account = new Model({
      email: 'testuser@testuser.com'
    });

    view = new PasswordContainingView({
      model: new Model({
        account
      })
    });
  });

  describe('render', () => {
    beforeEach(() => {
      sinon.stub(view, 'createExperiment');
    });

    it('designF treatment', () => {
      sinon.stub(view, 'isInExperiment').callsFake(() => true);
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => 'designF');
      sinon.stub(view, '_setupDesignF');

      return view.render()
        .then(() => {
          assert.isTrue(view.createExperiment.calledOnceWith('passwordStrength', 'designF'));
          assert.isTrue(view._setupDesignF.calledOnce);
        });
    });

    it('control', () => {
      sinon.stub(view, 'isInExperiment').callsFake(() => true);
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => 'control');
      return view.render()
        .then(() => {
          assert.isTrue(view.createExperiment.calledOnceWith('passwordStrength', 'control'));
        });
    });

    it('not part of the experiment', () => {
      sinon.stub(view, 'isInExperiment').callsFake(() => false);
      return view.render()
        .then(() => {
          assert.isFalse(view.createExperiment.called);
        });
    });
  });

  it('_setupDesignF sets up the password model and view', () => {
    const passwordModel = {};
    const passwordView = {
      afterRender: sinon.spy(() => Promise.resolve('heyo'))
    };

    sinon.stub(view, '_createPasswordStrengthBalloonModel').callsFake(() => passwordModel);
    sinon.stub(view, '_createPasswordWithStrengthBalloonView').callsFake(() => passwordView);
    sinon.stub(view, 'trackChildView');
    sinon.stub(view, 'listenTo');
    sinon.stub(view, 'on');

    return view._setupDesignF()
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

    return view._setupDesignF()
      .then(() => {
        view.trigger('submitStart');
        assert.isTrue(passwordModel.get('isSubmitting'));
        view.trigger('submitEnd');
        assert.isFalse(passwordModel.get('isSubmitting'));
      });
  });

  describe('setInitialContext', () => {
    let context;
    beforeEach(() => {
      context = new Model({});
    });

    it('sets showCustomHelperBalloon to true if user is in designF', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => 'designF');
      view.setInitialContext(context);

      assert.isTrue(context.get('showCustomHelperBalloon'));
    });

    it('sets showCustomHelperBalloon to false if user is in control', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => 'control');
      view.setInitialContext(context);

      assert.isFalse(context.get('showCustomHelperBalloon'));
    });

    it('sets showCustomHelperBalloon to false if user is not in experiment', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => undefined);
      view.setInitialContext(context);

      assert.isFalse(context.get('showCustomHelperBalloon'));
    });
  });

  describe('isValidStart', () => {
    it('designF returns false if the validate function returns an error', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => 'designF');
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

    it('control returns true', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => 'control');
      // default falls back to the FormView's return value, which is true
      assert.isTrue(view.isValidStart());
    });

    it('not part of experiment', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => undefined);
      // default falls back to the FormView's return value, which is true
      assert.isTrue(view.isValidStart());
    });
  });

  describe('showValidationErrorsStart', () => {
    it('designF treatment', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => 'designF');
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

    it('control', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => 'control');
      // default falls back to the FormView's return value, which is undefined
      assert.isUndefined(view.showValidationErrorsStart());
    });

    it('not part of experiment', () => {
      sinon.stub(view, '_getPasswordStrengthExperimentGroup').callsFake(() => undefined);
      // default falls back to the FormView's return value, which is undefined
      assert.isUndefined(view.showValidationErrorsStart());
    });
  });

  it('_logErrorIfInvalid logs the validation error', () => {
    const error = new Error('uh oh');
    view.passwordModel = {
      validate: sinon.spy(() => error)
    };
    sinon.stub(view, 'logError');

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
