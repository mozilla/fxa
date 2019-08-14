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

describe('views/mixins/user-card-mixin', () => {
  let account;
  let view;
  class View extends BaseView {
    getAccount() {
      return account;
    }
    displayAccountProfileImage() {}
  }
  Cocktail.mixin(View, UserCardMixin);

  beforeEach(() => {
    account = new Account({
      accessToken: 'access-token',
      email: 'testuser@testuser.com',
    });

    view = new View({});
  });

  describe('change:accessToken listener', () => {
    it('rerenders if the accessToken is revoked', () => {
      sinon.stub(view, 'rerender').callsFake(() => {});

      account.unset('accessToken');

      assert.isTrue(view.rerender.calledOnce);
    });
  });

  describe('setInitialContext', () => {
    it('sets userCardHTML', () => {
      const context = new Model({});
      view.setInitialContext(context);
      assert.ok(context.get('userCardHTML'));
    });
  });
});
