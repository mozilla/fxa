/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import { Model } from 'backbone';
import UserCardMixin from 'views/mixins/user-card-mixin';
import sinon from 'sinon';

class View extends BaseView {}

Cocktail.mixin(View, UserCardMixin);

describe('views/mixins/user-card-mixin', () => {
  let account;
  let view;

  beforeEach(() => {
    account = new Account({ email: 'testuser@testuser.com' });
    view = new View({});

    sinon.stub(view, 'getAccount').callsFake(() => account);
    sinon.stub(view, 'displayAccountProfileImage').callsFake(() => {});
  });

  describe('afterVisible', () => {
    it('hooks up a `change:accessToken` listener, displays account profile photo', () => {
      sinon.spy(view, 'listenTo');

      view.afterVisible();

      assert.isTrue(
        view.listenTo.calledOnceWith(account, 'change:accessToken')
      );
      assert.isTrue(
        view.displayAccountProfileImage.calledOnceWith(account, {
          spinner: true,
        })
      );
    });
  });

  describe('setInitialContext', () => {
    it('sets userCardHTML', () => {
      const context = new Model({});
      view.setInitialContext(context);
      assert.ok(context.get('userCardHTML'));
    });
  });

  describe('_onAccessTokenChange', () => {
    it('sets the default placeholder if the account has no access token', () => {
      sinon.stub(view, 'setDefaultPlaceholderAvatar');

      account.set('accessToken', 'token');
      view._onAccessTokenChange();
      assert.isFalse(view.setDefaultPlaceholderAvatar.called);

      account.unset('accessToken');
      view._onAccessTokenChange();
      assert.isTrue(view.setDefaultPlaceholderAvatar.calledOnce);
    });
  });
});
