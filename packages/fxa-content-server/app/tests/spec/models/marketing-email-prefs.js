/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import Constants from 'lib/constants';
import MarketingEmailClient from 'lib/marketing-email-client';
import MarketingEmailPrefs from 'models/marketing-email-prefs';
import OAuthToken from 'models/oauth-token';
import sinon from 'sinon';

describe('models/marketing-email-prefs', function () {
  var account;
  var oAuthToken;
  var marketingEmailPrefs;
  var marketingEmailClient;

  var BASE_URL = 'http://basket.proxy.org';
  var PREFERENCES_URL = 'https://www.allizom.org/newsletter/existing/';
  var NEWSLETTER_ID = Constants.NEWSLETTER_ID_FXA_JOURNEY;

  beforeEach(function () {
    marketingEmailClient = new MarketingEmailClient({
      baseUrl: BASE_URL,
      preferencesUrl: PREFERENCES_URL
    });

    account = new Account({});
    oAuthToken = new OAuthToken({
      token: 'oauth_token'
    });
    sinon.stub(oAuthToken, 'destroy').callsFake(function () {
      return Promise.resolve();
    });

    sinon.stub(account, 'createOAuthToken').callsFake(function () {
      return Promise.resolve(oAuthToken);
    });

    marketingEmailPrefs = new MarketingEmailPrefs({
      account: account,
      marketingEmailClient: marketingEmailClient
    });
  });

  describe('fetch', function () {
    it('fetches the user\'s email preferences from basket', function () {
      sinon.stub(marketingEmailClient, 'fetch').callsFake(function () {
        return Promise.resolve({
          newsletters: [NEWSLETTER_ID],
          preferencesUrl: PREFERENCES_URL + 'user_token'
        });
      });

      return marketingEmailPrefs.fetch()
        .then(function () {
          assert.isTrue(marketingEmailClient.fetch.calledWith('oauth_token'));
          assert.isTrue(marketingEmailPrefs.isOptedIn(NEWSLETTER_ID));
          assert.equal(
            marketingEmailPrefs.get('preferencesUrl'), PREFERENCES_URL + 'user_token');
          assert.isTrue(oAuthToken.destroy.called);
        });
    });
  });

  describe('optIn', function () {
    it('does nothing if the user is already opted in', function () {
      sinon.spy(marketingEmailClient, 'optIn');

      marketingEmailPrefs.set('newsletters', [NEWSLETTER_ID]);
      return marketingEmailPrefs.optIn(NEWSLETTER_ID)
        .then(function () {
          assert.isFalse(marketingEmailClient.optIn.called);
        });
    });

    it('opts the user in to marketing email if not opted already in', function () {
      sinon.stub(marketingEmailClient, 'optIn').callsFake(function () {
        return Promise.resolve();
      });

      marketingEmailPrefs.set('newsletters', []);
      return marketingEmailPrefs.optIn(NEWSLETTER_ID)
        .then(function () {
          assert.isTrue(
            marketingEmailClient.optIn.calledWith(
              'oauth_token',
              NEWSLETTER_ID
            )
          );
          assert.isTrue(marketingEmailPrefs.isOptedIn(NEWSLETTER_ID));
          assert.isTrue(oAuthToken.destroy.called);
        });
    });
  });
});
