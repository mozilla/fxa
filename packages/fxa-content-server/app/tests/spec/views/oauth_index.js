/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const OAuthIndexView = require('views/oauth_index');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/base');
  const User = require('models/user');
  const sinon = require('sinon');

  describe('views/oauth_index', () => {
    let relier;
    let user;
    let view;

    beforeEach(() => {
      relier = new Relier();
      user = new User();
      view = new OAuthIndexView({
        notifier: new Notifier(),
        relier,
        user
      });

      sinon.spy(view, 'navigate');
    });

    describe('relier does not have an email', () => {
      it('navigates to signup page if there is no current account', () => {
        return view.render()
          .then(() => {
            assert.isTrue(view.navigate.calledOnce);
            assert.isTrue(view.navigate.calledWith('oauth/signup', {}, { replace: true, trigger: true }));
          });
      });

      it('navigates to the signin page if there is a user signed in', () => {
        sinon.stub(user, 'getChooserAccount', () => user.initAccount({
          sessionToken: 'abc123'
        }));

        return view.render()
          .then(() => {
            assert.isTrue(view.navigate.calledOnce);
            assert.isTrue(view.navigate.calledWith('oauth/signin', {}, { replace: true, trigger: true }));
          });
      });
    });

    describe('relier has an email', () => {
      beforeEach(() => {
        relier.set('email', 'testuser@testuser.com');
      });

      it('navigate to signup page if email is not associated with account', () => {
        sinon.stub(user, 'checkAccountEmailExists', () => p(false));

        return view.render()
          .then(() => {
            assert.isTrue(view.navigate.calledOnce);
            assert.isTrue(view.navigate.calledWith('oauth/signup', {}, { replace: true, trigger: true }));
          });
      });

      it('navigate to signin page if email is associated with account', () => {
        sinon.stub(user, 'checkAccountEmailExists', () => p(true));

        return view.render()
          .then(() => {
            assert.isTrue(view.navigate.calledOnce);
            assert.isTrue(view.navigate.calledWith('oauth/signin', {}, { replace: true, trigger: true }));
          });
      });

      it('logs and swallows any errors that are thrown checking whether the email is registered', () => {
        var err = AuthErrors.toError('THROTTLED');
        sinon.stub(user, 'checkAccountEmailExists', () => p.reject(err));
        // return a default account to ensure user is sent to signup
        sinon.stub(user, 'getChooserAccount', () => user.initAccount({}));

        sinon.spy(view, 'logError');

        return view.render()
          .then(() => {
            assert.isTrue(view.logError.calledWith(err));
            assert.isTrue(view.navigate.calledOnce);
            assert.isTrue(view.navigate.calledWith('oauth/signup', {}, { replace: true, trigger: true }));
          });
      });
    });
  });
});
