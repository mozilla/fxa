/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthBroker from 'models/auth_brokers/oauth-redirect';
import AuthErrors from 'lib/auth-errors';
import FormPrefill from 'models/form-prefill';
import OAuthIndexView from 'views/oauth_index';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import User from 'models/user';
import sinon from 'sinon';

describe('views/oauth_index', () => {
  let broker;
  let formPrefill;
  let notifier;
  let relier;
  let user;
  let view;

  beforeEach(() => {
    broker = new AuthBroker();
    formPrefill = new FormPrefill();
    notifier = new Notifier();
    relier = new Relier();
    user = new User();
    view = new OAuthIndexView({
      broker,
      formPrefill,
      notifier,
      relier,
      user,
    });

    sinon.spy(view, 'replaceCurrentPage');
  });

  describe('email-first flow', () => {
    beforeEach(() => {
      relier.set('action', 'email');
    });

    describe('relier does not have an email', () => {
      it('displays the enter-email page page', () => {
        return view.render().then(() => {
          assert.isFalse(view.replaceCurrentPage.called);
        });
      });
    });

    describe('relier has an email', () => {
      it('delegates to `checkEmail`', () => {
        sinon.stub(view, 'checkEmail');
        const email = 'testuser@testuser.com';
        relier.set('email', email);
        return view.render().then(() => {
          assert.isFalse(view.replaceCurrentPage.called);
          assert.isTrue(view.checkEmail.calledOnceWith(email));
        });
      });
    });
  });

  describe('best-choice flow', () => {
    describe('relier does not have an email', () => {
      it('navigates to signup page if there is no current account', () => {
        return view.render().then(() => {
          assert.isTrue(view.replaceCurrentPage.calledOnceWith('signup'));
        });
      });

      it('navigates to the signin page if there is a user signed in', () => {
        sinon.stub(user, 'getChooserAccount').callsFake(() =>
          user.initAccount({
            sessionToken: 'abc123',
          })
        );

        return view.render().then(() => {
          assert.isTrue(view.replaceCurrentPage.calledOnceWith('signin'));
        });
      });
    });

    describe('relier has an email', () => {
      beforeEach(() => {
        relier.set('email', 'testuser@testuser.com');
      });

      it('navigate to signup page if email is not associated with account', () => {
        sinon
          .stub(user, 'checkAccountEmailExists')
          .callsFake(() => Promise.resolve(false));

        return view.render().then(() => {
          assert.isTrue(view.replaceCurrentPage.calledOnceWith('signup'));
        });
      });

      it('navigate to signin page if email is associated with account', () => {
        sinon
          .stub(user, 'checkAccountEmailExists')
          .callsFake(() => Promise.resolve(true));

        return view.render().then(() => {
          assert.isTrue(view.replaceCurrentPage.calledOnceWith('signin'));
        });
      });

      it('logs and swallows any errors that are thrown checking whether the email is registered', () => {
        var err = AuthErrors.toError('THROTTLED');
        sinon
          .stub(user, 'checkAccountEmailExists')
          .callsFake(() => Promise.reject(err));
        // return a default account to ensure user is sent to signup
        sinon
          .stub(user, 'getChooserAccount')
          .callsFake(() => user.initAccount({}));

        sinon.spy(view, 'logError');

        return view.render().then(() => {
          assert.isTrue(view.logError.calledWith(err));
          assert.isTrue(view.replaceCurrentPage.calledOnceWith('signup'));
        });
      });
    });
  });
});
