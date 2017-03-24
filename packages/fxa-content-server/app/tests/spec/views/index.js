/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const IndexView = require('views/index');
  const Notifier = require('lib/channels/notifier');
  const User = require('models/user');
  const sinon = require('sinon');

  describe('views/index', () => {
    let user;
    let view;

    beforeEach(() => {
      user = new User();
      view = new IndexView({
        notifier: new Notifier(),
        user
      });

      sinon.spy(view, 'navigate');
    });

    it('navigates to the signup page if there is no current account', function () {
      sinon.stub(user, 'getSignedInAccount', () => user.initAccount({}));

      return view.render()
        .then(() => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('signup', {}, { replace: true, trigger: true }));
        });
    });

    it('navigates to the settings page if there is a current account', function () {
      let signedInAccount = user.initAccount({
        sessionToken: 'token'
      });
      sinon.stub(user, 'getSignedInAccount', () => signedInAccount);
      return view.render()
        .then(() => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('settings', {}, { replace: true, trigger: true }));
        });
    });
  });
});
