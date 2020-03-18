/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AccountByUidMixin from 'views/mixins/account-by-uid-mixin';
import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Notifier from 'lib/channels/notifier';
import NullChannel from 'lib/channels/null';
import Relier from 'models/reliers/relier';
import Session from 'lib/session';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';

const UID = TestHelpers.createUid();
const View = BaseView.extend({});
Cocktail.mixin(View, AccountByUidMixin);

describe('views/mixins/account-by-uid-mixin', function() {
  let notifier;
  let relier;
  let tabChannelMock;
  let user;
  let view;

  beforeEach(function() {
    relier = new Relier();
    tabChannelMock = new NullChannel();
    user = new User();
    notifier = new Notifier({
      tabChannel: tabChannelMock,
    });

    sinon
      .stub(relier, 'get')
      .withArgs('uid')
      .returns(UID);

    view = new View({
      notifier: notifier,
      relier: relier,
      user: user,
    });
  });

  afterEach(function() {
    relier.get.restore();

    view.remove();
    view.destroy();
    view = null;
  });

  describe('getUidAndSetSignedInAccount', function() {
    it('gets the uid from the relier', function() {
      sinon.spy(notifier, 'trigger');
      sinon.stub(user, 'clearSignedInAccountUid');

      view.getUidAndSetSignedInAccount();
      assert.isTrue(relier.get.calledWith('uid'));
      assert.isTrue(notifier.trigger.calledWith('set-uid', UID));

      notifier.trigger.restore();
      user.clearSignedInAccountUid.restore();
    });

    it('sets signed in account with uid when account exists', function() {
      sinon.stub(user, 'getAccountByUid').returns({ isDefault: () => false });
      sinon.stub(user, 'setSignedInAccountByUid');

      view.getUidAndSetSignedInAccount();
      assert.isTrue(user.getAccountByUid.calledWith(UID));
      assert.isTrue(user.setSignedInAccountByUid.calledWith(UID));

      user.setSignedInAccountByUid.restore();
      user.getAccountByUid.restore();
    });

    it('forces the user to sign in when account does not exist', function() {
      sinon.stub(user, 'getAccountByUid').returns({ isDefault: () => true });
      sinon.stub(user, 'clearSignedInAccountUid');
      sinon.stub(Session, 'clear');
      sinon.stub(view, 'logViewEvent');

      view.getUidAndSetSignedInAccount();
      assert.isTrue(Session.clear.calledOnce);
      assert.isTrue(user.clearSignedInAccountUid.calledOnce);
      assert.isTrue(view.logViewEvent.calledWith('signout.forced'));

      view.logViewEvent.restore();
      Session.clear.restore();
      user.clearSignedInAccountUid.restore();
      user.getAccountByUid.restore();
    });
  });
});
