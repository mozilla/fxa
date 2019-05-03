/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/settings/subscription';
import WindowMock from '../../../mocks/window';

describe('views/settings/subscription', function () {
  var account;
  var user;
  var view;
  var tokenMock;
  var windowMock;
  var config;

  function render() {
    return view.render()
      .then(() => view.afterVisible());
  }

  beforeEach(function () {
    user = new User();
    account = new Account();
    windowMock = new WindowMock();
    config = {
      subscriptions: {
        managementClientId: 'MOCK_CLIENT_ID',
        managementScopes: 'MOCK_SCOPES',
        managementTokenTTL: 900,
        managementUrl: 'http://example.com',
      }
    };
    tokenMock = {
      get: () => 'MOCK_TOKEN'
    };

    sinon.stub(account, 'createOAuthToken').callsFake(() => Promise.resolve(tokenMock));

    view = new View({ config, user, window: windowMock });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.stub(view, 'navigateAway');

    return render();
  });

  afterEach(function () {
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  describe('render', () => {
    it('renders correctly', () => {
      assert.lengthOf(view.$('#manage-subscription'), 1);
    });
  });

  describe('submit', () => {
    it('creates an OAuth token on submit', () => {
      return view.submit().then(() => {
        assert.lengthOf(view.getSignedInAccount.args, 1);
        assert.deepEqual(
          account.createOAuthToken.args[0],
          [
            config.subscriptions.managementScopes,
            {
              //eslint-disable-next-line camelcase
              client_id: config.subscriptions.managementClientId,
              ttl: config.subscriptions.managementTokenTTL
            }
          ]
        );
        assert.deepEqual(
          view.navigateAway.args[0],
          [ `${config.subscriptions.managementUrl}/#accessToken=MOCK_TOKEN` ]
        );
      });
    });
  });

});
