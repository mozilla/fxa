/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Model from 'models/password_strength/password_strength_balloon';
import PasswordWithStrengthBalloon from 'views/password_strength/password_with_strength_balloon';
import helpers from '../../../lib/helpers';
import sinon from 'sinon';

const { requiresFocus } = helpers;

const template = `
  <div>
    <input type="password" id="password" value="" />
    <div id="balloon"></div>
  </div>
`;

let model;
let passwordHelperBalloon;
let view;

describe('views/password_strength/password_with_strength_ballon', () => {
  beforeEach(() => {
    $('#container').html(template);

    model = new Model({});

    view = new PasswordWithStrengthBalloon({
      balloonEl: '#balloon',
      el: '#password',
      model,
      passwordHelperBalloon,
    });
  });

  it('sets data.validate on the element', () => {
    assert.isFunction(view.$el.data('validate'));
  });

  it('creates the balloon on element focus', () => {
    requiresFocus(() => {
      sinon.stub(view, 'createBalloonIfNeeded');
      view.$el.trigger('focus');

      assert.isTrue(view.createBalloonIfNeeded.calledOnce);
    });
  });

  it('creates the balloon on validation error', () => {
    sinon.stub(view, 'createBalloonIfNeeded');
    model.trigger('invalid');

    assert.isTrue(view.createBalloonIfNeeded.calledOnce);
  });

  describe('createBalloonIfNeeded', () => {
    it('creates the balloon if `shouldCreateBalloon` says to', () => {
      sinon.stub(view, 'shouldCreateBalloon').callsFake(() => true);
      sinon.stub(view, 'createBalloon');

      view.createBalloonIfNeeded();
      assert.isTrue(view.createBalloon.calledOnce);
    });

    it('does not create the balloon if `shouldCreateBalloon` says no', () => {
      sinon.stub(view, 'shouldCreateBalloon').callsFake(() => false);
      sinon.stub(view, 'createBalloon');

      view.createBalloonIfNeeded();
      assert.isFalse(view.createBalloon.called);
    });
  });

  it('createBalloon creates the balloon', () => {
    sinon.stub(view, 'shouldCreateBalloon').callsFake(() => true);
    sinon.stub(view, 'updateStyles');
    return view.createBalloon().then(() => {
      assert.isTrue(view.updateStyles.calledOnce);
      assert.equal(
        view.$el.attr('aria-described-by'),
        'password-strength-balloon'
      );
    });
  });

  it('passwordHelperBalloon and element update styles at the same time', () => {
    sinon.stub(view, 'updateStyles');
    return view.createBalloon().then(() => {
      assert.isTrue(view.updateStyles.calledOnce);
      view.passwordHelperBalloon.trigger('rendered');
      assert.isTrue(view.updateStyles.calledTwice);
    });
  });

  it('updateModel updates delegates to the model', () => {
    $('#password').val('password');
    view.updateModel();

    assert.equal(model.get('password'), 'password');
  });

  it('the element is marked as invalid if password has been entered and is invalid', () => {
    sinon.stub(view, 'markElementValid');
    sinon.stub(view, 'markElementInvalid');

    view.updateStyles();
    assert.isFalse(view.markElementInvalid.called);
    assert.isTrue(view.markElementValid.calledOnceWith(view.$el));

    model.validationError = AuthErrors.toError('PASSWORD_TOO_SHORT');
    view.updateStyles();
    assert.isTrue(
      view.markElementInvalid.calledOnceWith(view.$el, 'password-too-short')
    );

    delete model.validationError;
    view.updateStyles();
    assert.isTrue(view.markElementValid.calledTwice);
    assert.equal(view.markElementValid.args[1][0], view.$el);
  });

  describe('_getDescribedById', () => {
    it('returns `password-too-short` if no password', () => {
      assert.equal(
        view._getDescribedById(AuthErrors.toError('PASSWORD_REQUIRED')),
        'password-too-short'
      );
    });

    it('returns `password-too-short` if password is too short', () => {
      assert.equal(
        view._getDescribedById(AuthErrors.toError('PASSWORD_TOO_SHORT')),
        'password-too-short'
      );
    });

    it('returns `password-same-as-email` if same as email', () => {
      assert.equal(
        view._getDescribedById(AuthErrors.toError('PASSWORD_SAME_AS_EMAIL')),
        'password-same-as-email'
      );
    });

    it('returns `password-too-common` when too common', () => {
      assert.equal(
        view._getDescribedById(AuthErrors.toError('PASSWORD_TOO_COMMON')),
        'password-too-common'
      );
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      sinon.stub(view, 'updateModel');
    });

    it('updates the model, does not throw if valid', () => {
      sinon.stub(model, 'isValid').callsFake(() => true);
      view.validate();

      assert.isTrue(view.updateModel.calledOnce);
    });

    it('updates the model, throws if invalid', () => {
      sinon.stub(model, 'isValid').callsFake(() => false);

      const err = AuthErrors.toError('PASSWORD_SAME_AS_EMAIL');
      model.validationError = err;

      assert.throws(() => {
        view.validate();
      }, err);

      assert.isTrue(view.updateModel.calledOnce);
      assert.equal(err.describedById, 'password-same-as-email');
    });
  });
});
