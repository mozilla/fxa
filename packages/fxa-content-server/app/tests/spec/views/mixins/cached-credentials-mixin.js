/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import BaseView from 'views/base';
import CachedCredentialsMixin from 'views/mixins/cached-credentials-mixin';
import Cocktail from 'cocktail';
import { Model } from 'backbone';
import Relier from 'models/reliers/base';
import User from 'models/user';
import sinon from 'sinon';

class View extends BaseView {
  signIn() {}
}

Cocktail.mixin(View, CachedCredentialsMixin);

describe('views/mixins/cached-credentials-mixin', () => {
  let account;
  let formPrefill;
  let model;
  let relier;
  let user;
  let view;

  beforeEach(() => {
    account = new Model();
    formPrefill = new Model();
    model = new Model();
    relier = new Relier();
    user = new User();

    view = new View({
      formPrefill,
      model,
      relier,
      user,
    });
  });

  it('has the correct interface', () => {
    assert.lengthOf(Object.keys(CachedCredentialsMixin), 6);
    assert.isArray(CachedCredentialsMixin.dependsOn);
    assert.isFunction(CachedCredentialsMixin.getPrefillEmail);
    assert.isFunction(CachedCredentialsMixin.allowSuggestedAccount);
    assert.isFunction(CachedCredentialsMixin.isPasswordNeededForAccount);
    assert.isFunction(CachedCredentialsMixin.useLoggedInAccount);
    assert.isFunction(CachedCredentialsMixin.suggestedAccount);
  });

  describe('isPasswordNeededForAccount', () => {
    it('asks for password if no email', () => {
      account.unset('email');
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);
      sinon.stub(user, 'isSyncAccount').callsFake(() => true);
      model.unset('chooserAskForPassword');
      sinon.stub(view, 'getPrefillEmail').callsFake(() => '');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });

    it('asks for password if the relier wants keys (Sync)', () => {
      account.set('email', 'testuser@testuser.com');
      sinon.stub(relier, 'wantsKeys').callsFake(() => true);
      sinon.stub(user, 'isSyncAccount').callsFake(() => true);
      model.unset('chooserAskForPassword');
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'testuser@testuser.com');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });

    it('asks for the password if the stored session is not from sync', () => {
      account.set('email', 'testuser@testuser.com');
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);
      sinon.stub(user, 'isSyncAccount').callsFake(() => false);
      model.unset('chooserAskForPassword');
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'testuser@testuser.com');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });

    it('asks for the password if forced', () => {
      account.set('email', 'testuser@testuser.com');
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);
      sinon.stub(user, 'isSyncAccount').callsFake(() => true);
      model.set('chooserAskForPassword', true);
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'testuser@testuser.com');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });

    it('asks for the password if the prefill email is different', () => {
      account.set('email', 'testuser@testuser.com');
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);
      sinon.stub(user, 'isSyncAccount').callsFake(() => true);
      model.unset('chooserAskForPassword');
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'different@testuser.com');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });
  });

  describe('suggestedAccount', () => {
    it('returns user.chooserAccount if allowed', () => {
      sinon.stub(user, 'getChooserAccount').callsFake(() => account);
      sinon.stub(view, 'allowSuggestedAccount').callsFake(() => true);

      assert.strictEqual(view.suggestedAccount(), account);
    });

    it('returns the default account if user.chooserAccount is not allowed', () => {
      sinon.stub(user, 'getChooserAccount').callsFake(() => account);
      sinon.stub(view, 'allowSuggestedAccount').callsFake(() => false);

      const suggestedAccount = view.suggestedAccount();
      assert.notStrictEqual(suggestedAccount, account);
    });
  });

  describe('allowSuggestedAccount', () => {
    it('returns false for the default account', () => {
      assert.isFalse(view.allowSuggestedAccount(user.initAccount()));
    });

    it('returns true if no prefill email', () => {
      sinon.stub(view, 'getPrefillEmail').callsFake(() => '');

      assert.isTrue(
        view.allowSuggestedAccount(
          user.initAccount({
            email: 'testuser@testuser.com',
          })
        )
      );
    });

    it('returns false if prefill email is different', () => {
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'prefill@testuser.com');

      assert.isFalse(
        view.allowSuggestedAccount(
          user.initAccount({
            email: 'testuser@testuser.com',
          })
        )
      );
    });

    it('returns true if prefill email is the same', () => {
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'testuser@testuser.com');

      assert.isTrue(
        view.allowSuggestedAccount(
          user.initAccount({
            email: 'testuser@testuser.com',
          })
        )
      );
    });
  });

  describe('useLoggedInAccount', () => {
    let account;
    beforeEach(() => {
      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'abc123',
      });
    });

    it('delegates to signIn, saves email to formPrefill', () => {
      sinon.stub(view, 'signIn').callsFake(() => Promise.resolve());

      return view.useLoggedInAccount(account).then(() => {
        assert.isTrue(view.signIn.calledOnce);
        assert.isTrue(view.signIn.calledWith(account));
      });
    });

    it('shows an error if session is expired', () => {
      sinon.stub(view, 'getAccount').callsFake(() => account);

      sinon
        .stub(view, 'signIn')
        .callsFake(() => Promise.reject(AuthErrors.toError('SESSION_EXPIRED')));

      sinon.stub(view, 'render').callsFake(() => Promise.resolve());
      sinon.spy(view, 'displayError');

      return view.useLoggedInAccount(account).then(() => {
        assert.isTrue(view.render.calledOnce);
        assert.isTrue(view.displayError.calledOnce);
        assert.isTrue(
          AuthErrors.is(view.displayError.args[0][0], 'SESSION_EXPIRED')
        );
      });
    });
  });
});
