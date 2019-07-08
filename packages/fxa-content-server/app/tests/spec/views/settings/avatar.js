/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import chai from 'chai';
import FxaClientMock from '../../../mocks/fxa-client';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/settings/avatar';

var assert = chai.assert;

describe('views/settings/avatar', function() {
  var account;
  var fxaClientMock;
  var notifier;
  var relierMock;
  var user;
  var view;

  beforeEach(function() {
    fxaClientMock = new FxaClientMock();
    notifier = new Notifier();
    relierMock = new Relier();
    user = new User();

    view = new View({
      fxaClient: fxaClientMock,
      notifier: notifier,
      relier: relierMock,
      user: user,
    });
  });

  afterEach(function() {
    $(view.el).remove();
    view.destroy();
    view = null;
    fxaClientMock = null;
  });

  describe('with session', function() {
    beforeEach(function() {
      sinon.stub(view, 'checkAuthorization').callsFake(function() {
        return Promise.resolve(true);
      });
      account = user.initAccount({
        accessToken: 'abc123',
        email: 'a@a.com',
        verified: true,
      });

      sinon.stub(view, 'getSignedInAccount').callsFake(function() {
        return account;
      });
    });

    it('has no avatar set', function() {
      account.set('profileImageUrlDefault', true);
      sinon.stub(account, 'getAvatar').callsFake(function() {
        return Promise.resolve({});
      });

      return view.render().then(function() {
        assert.equal(view.$('.add-button').length, 1);
        assert.equal(view.$('.settings-unit-toggle.primary-button').length, 1);
      });
    });

    it('has an avatar set', function() {
      account.set('profileImageUrlDefault', false);

      return view.render().then(function() {
        assert.equal(view.$('.change-button').length, 1);
        assert.equal(
          view.$('.settings-unit-toggle.secondary-button').length,
          1
        );
      });
    });

    it('rerenders on profile updates', function() {
      sinon.stub(view, 'render').callsFake(function() {
        return Promise.resolve();
      });
      view.onProfileUpdate();
      assert.isTrue(view.render.called);
    });
  });
});
