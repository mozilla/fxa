/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import { assign } from 'underscore';
import { Events } from 'backbone';
import Model from 'models/password_strength/password_strength_balloon';
import PasswordWithStrengthBalloon from 'views/password_strength/password_with_strength_balloon';
import sinon from 'sinon';

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

    passwordHelperBalloon = assign({
      render: sinon.spy()
    }, Events);

    view = new PasswordWithStrengthBalloon({
      balloonEl: '#balloon',
      el: '#password',
      model,
      passwordHelperBalloon
    });

    return view.afterRender();
  });

  it('renders the pw balloon in afterRender, sets the aria field', () => {
    assert.isTrue(view.passwordHelperBalloon.render.calledOnce);
    assert.equal(view.$el.attr('aria-described-by'), 'password-strength-balloon');
  });

  it('updates the model for the password element value', () => {
    $('#password').val('password');
    sinon.spy(view, 'updateModelForPassword');

    return view.afterRender()
      .then(() => {
        assert.isTrue(view.updateModelForPassword.calledOnce);
      });
  });

  it('updateModelForPassword updates delegates to the model', () => {
    $('#password').val('password');
    sinon.spy(model, 'updateForPassword');
    view.updateModelForPassword();
    assert.isTrue(model.updateForPassword.calledOnceWith('password'));
  });

  it('the element is marked as invalid if password has been entered and is invalid', () => {
    sinon.stub(view, 'markElementValid');
    sinon.stub(view, 'markElementInvalid');
    model.set({
      hasEnteredPassword: false,
      isValid: false
    }, { silent: true });

    view.updateStyles();
    assert.isFalse(view.markElementInvalid.called);
    assert.isTrue(view.markElementValid.calledOnceWith(view.$el));

    model.set('hasEnteredPassword', true, { silent: true });
    sinon.stub(view, '_getDescribedById').callsFake(() => 'password-too-short');
    view.updateStyles();
    assert.isTrue(view.markElementInvalid.calledOnceWith(view.$el, 'password-too-short'));

    model.set('isValid', true, { silent: true });
    view.updateStyles();
    assert.isTrue(view.markElementValid.calledTwice);
    assert.equal(view.markElementValid.args[1][0], view.$el);
  });

  it('passwordHelperBalloon updates cause updateStyles', (done) => {
    sinon.stub(view, 'updateStyles').callsFake(() => done());
    passwordHelperBalloon.trigger('rendered');
  });

  describe('_getDescribedById', () => {
    beforeEach(() => {
      model.set({
        isCommon: false,
        isSameAsEmail: false,
        isTooShort: false,
      });
    });

    it('returns `password-too-short` if password is too short', () => {
      model.set('isTooShort', true);
      assert.equal(view._getDescribedById(), 'password-too-short');
    });

    it('returns `password-same-as-email` if same as email', () => {
      model.set('isSameAsEmail', true);
      assert.equal(view._getDescribedById(), 'password-same-as-email');
    });

    it('returns `password-too-common` when too common', () => {
      model.set('isCommon', true);
      assert.equal(view._getDescribedById(), 'password-too-common');
    });
  });
});
