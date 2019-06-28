/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import PasswordResetMixin from 'views/mixins/password-reset-mixin';
import sinon from 'sinon';

describe('views/mixins/password-reset-mixin', function() {
  describe('interface', function() {
    it('exports the `resetPassword` method', function() {
      assert.isFunction(PasswordResetMixin.resetPassword);
    });
  });

  describe('resetPassword', function() {
    var account;
    var email;
    var relier;
    var view;

    beforeEach(function() {
      account = {
        resetPassword: sinon.spy(function() {
          return Promise.resolve({
            passwordForgotToken: 'password forgot token',
          });
        }),
      };
      email = 'testuser@testuser.com';

      relier = {};

      view = {
        getStringifiedResumeToken: sinon.spy(() => 'resume token'),
        navigate: sinon.spy(),
        relier: relier,
        user: {
          initAccount: sinon.spy(function(accountData) {
            return account;
          }),
        },
      };

      return PasswordResetMixin.resetPassword.call(view, email);
    });

    it('initiates an account and calls the expected account method', function() {
      assert.isTrue(view.getStringifiedResumeToken.calledOnce);
      assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
      assert.isTrue(view.user.initAccount.calledWith({ email: email }));
      assert.isTrue(
        account.resetPassword.calledWith(relier, {
          resume: 'resume token',
        })
      );
    });

    it('redirects to /confirm_reset_password if auth server is happy', function() {
      assert.isTrue(
        view.navigate.calledWith(
          'confirm_reset_password',
          {
            email: 'testuser@testuser.com',
            passwordForgotToken: 'password forgot token',
          },
          {
            clearQueryParams: true,
          }
        )
      );
    });
  });

  describe('retryResetPassword', function() {
    var account;
    var email;
    var passwordForgotToken;
    var relier;
    var view;

    beforeEach(function() {
      account = {
        retryResetPassword: sinon.spy(function() {
          return Promise.resolve();
        }),
      };
      email = 'testuser@testuser.com';
      passwordForgotToken = 'password forgot token';

      relier = {};

      view = {
        getStringifiedResumeToken: sinon.spy(() => 'resume token'),
        navigate: sinon.spy(),
        relier: relier,
        user: {
          initAccount: sinon.spy(function(accountData) {
            return account;
          }),
        },
      };

      return PasswordResetMixin.retryResetPassword.call(
        view,
        email,
        passwordForgotToken
      );
    });

    it('initiates an account and calls the expected account method', () => {
      assert.isTrue(view.getStringifiedResumeToken.calledOnce);
      assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
      assert.isTrue(view.user.initAccount.calledWith({ email: email }));
      assert.isTrue(
        account.retryResetPassword.calledWith(passwordForgotToken, relier, {
          resume: 'resume token',
        })
      );
    });
  });
});
