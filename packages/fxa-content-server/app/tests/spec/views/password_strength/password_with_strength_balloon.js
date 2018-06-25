/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import { assign } from 'underscore';
import { Events } from 'backbone';
import Model from 'models/password_strength/password_strength_balloon';
import PasswordWithStrengthBalloon from 'views/password_strength/password_with_strength_balloon';
import { requiresFocus } from '../../../lib/helpers';
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

  it('renders the pw balloon in afterRender', () => {
    assert.isTrue(view.passwordHelperBalloon.render.calledOnce);
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

  it('the invalid class is added if password has been entered and is invalid', () => {
    model.set({
      hasEnteredPassword: false,
      isValid: false
    }, { silent: true });
    view.updateStyles();
    assert.isFalse($('#password').hasClass('invalid'));

    model.set('hasEnteredPassword', true, { silent: true });
    view.updateStyles();
    assert.isTrue($('#password').hasClass('invalid'));

    model.set('isValid', true, { silent: true });
    view.updateStyles();
    assert.isFalse($('#password').hasClass('invalid'));
  });

  it('passwordHelperBalloon updates cause updateStyles', (done) => {
    sinon.stub(view, 'updateStyles').callsFake(() => done());
    passwordHelperBalloon.trigger('rendered');
  });

  it('focusIfInvalid focuses the password if an invalid one has been entered', (done) => {
    requiresFocus(() => {
      model.set({
        hasEnteredPassword: true,
        isValid: false
      }, { silent: true });

      $('#password').one('focus', () => done());

      view.focusIfInvalidPassword();
    }, done);
  });
});
