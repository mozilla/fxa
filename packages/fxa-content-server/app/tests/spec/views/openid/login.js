/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var FxaClient = require('lib/fxa-client');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var RouterMock = require('../../../mocks/router');
  var sinon = require('sinon');
  var User = require('models/user');
  var View = require('views/openid/login');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('views/openid/login', function () {
    var view;
    var windowMock;
    var routerMock;
    var fxaClient;
    var notifier;
    var user;
    var broker;

    beforeEach(function () {

      windowMock = new WindowMock();
      routerMock = new RouterMock();
      fxaClient = new FxaClient();
      notifier = new Notifier();
      user = new User({
        fxaClient: fxaClient,
        notifier: notifier
      });
      broker = new Broker();

      view = new View({
        broker: broker,
        fxaClient: fxaClient,
        router: routerMock,
        user: user,
        window: windowMock
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    it('redirects to settings on success', function () {
      var accountData = {
        email: 'test@example.com',
        keyFetchToken: '00000000',
        sessionToken: '00000000',
        uid: '00000000',
        unwrapBKey: '00000000',
        verified: true
      };
      sinon.stub(fxaClient, '_getClient', function () {
        return p({
          request: {
            send: function () {
              return p(accountData);
            }
          }
        });
      });
      sinon.spy(user, 'initAccount');
      sinon.spy(broker, 'afterSignIn');
      sinon.stub(view, 'navigate', function () { });

      return view.render()
        .then(function () {
          var account = user.initAccount.returnValues[0];
          assert.equal(account.get('email'), accountData.email);
          assert.isTrue(broker.afterSignIn.calledWith(account));
          assert.isTrue(view.navigate.calledWith('settings'));
        });
    });
  });
});
