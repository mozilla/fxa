/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var FxaClientMock = require('../../../mocks/fxa-client');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var User = require('models/user');
  var View = require('views/settings/avatar');

  var assert = chai.assert;
  var IMG_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('views/settings/avatar', function () {
    var account;
    var fxaClientMock;
    var notifier;
    var relierMock;
    var user;
    var view;

    beforeEach(function () {
      fxaClientMock = new FxaClientMock();
      notifier = new Notifier();
      relierMock = new Relier();
      user = new User();

      view = new View({
        fxaClient: fxaClientMock,
        notifier: notifier,
        relier: relierMock,
        user: user
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      fxaClientMock = null;
    });

    describe('with session', function () {
      beforeEach(function () {
        view.isUserAuthorized = function () {
          return p(true);
        };
        account = user.initAccount({
          accessToken: 'abc123',
          email: 'a@a.com',
          verified: true
        });

        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });
      });

      it('has no avatar set', function () {
        sinon.stub(account, 'getAvatar', function () {
          return p({});
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.add-button').length, 1);
          });
      });

      it('has an avatar set', function () {
        account.set('profileImageUrl', IMG_URL);

        return view.render()
          .then(function () {
            assert.equal(view.$('.change-button').length, 1);
          });
      });

      it('rerenders on profile updates', function () {
        sinon.stub(view, 'render', function () {
          return p();
        });
        view.onProfileUpdate();
        assert.isTrue(view.render.called);
      });

    });
  });
});
