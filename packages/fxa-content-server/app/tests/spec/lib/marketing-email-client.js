/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import MarketingEmailClient from 'lib/marketing-email-client';
import MarketingEmailErrors from 'lib/marketing-email-errors';
import sinon from 'sinon';
import xhr from 'lib/xhr';
import WindowMock from '../../mocks/window';

const BASE_URL = 'https://basket.mozilla.com';
const PREFERENCES_URL = 'https://www.allizom.org/newsletter/existing/';

describe('lib/marketing-email-client', () => {

  let client;
  let xhrMock;
  let windowMock;

  beforeEach(() => {
    // Xhr has no constructor
    xhrMock = Object.create(xhr);
    xhrMock.ajax = () => {
      return Promise.resolve();
    };

    windowMock = new WindowMock();

    client = new MarketingEmailClient({
      baseUrl: BASE_URL,
      preferencesUrl: PREFERENCES_URL,
      window: windowMock,
      xhr: xhrMock
    });
  });

  describe('_request', () => {
    it('calls xhr.ajax', () => {
      sinon.stub(xhrMock, 'ajax').callsFake(() => Promise.resolve({}));

      return client._request({
        accessToken: 'token',
        data: { key: 'value' },
        type: 'get',
        url: '/endpoint',
      }).then(() => {
        const ajaxOptions = xhrMock.ajax.args[0][0];

        assert.equal(ajaxOptions.url, BASE_URL + '/endpoint');
        assert.equal(ajaxOptions.type, 'get');
        assert.equal(ajaxOptions.headers.Authorization, 'Bearer token');
        assert.equal(ajaxOptions.data.key, 'value');
      });
    });

    it('converts any errors returned', () => {
      sinon.stub(xhrMock, 'ajax').callsFake(() => {
        return Promise.reject({
          responseJSON: {
            code: MarketingEmailErrors.toErrno('UNKNOWN_TOKEN')
          }
        });
      });

      return client._request('/endpoint', 'get', 'token')
        .then(assert.fail, function (err) {
          assert.isTrue(MarketingEmailErrors.is(err, 'UNKNOWN_TOKEN'));
        });
    });
  });

  describe('fetch', () => {
    it('returns a preferences URL for the user', () => {
      sinon.stub(xhrMock, 'ajax').callsFake(() => {
        return Promise.resolve({
          token: 'users_uuid'
        });
      });

      return client.fetch('token', 'testuser@testuser.com')
        .then(function (data) {
          assert.equal(data.token, 'users_uuid');
          assert.equal(data.preferencesUrl, PREFERENCES_URL + 'users_uuid');

          assert.isTrue(xhrMock.ajax.calledOnce);
          const request = xhrMock.ajax.args[0][0];
          assert.equal(request.url, BASE_URL + '/lookup-user?email=testuser%40testuser.com');
          assert.equal(request.type, 'get');
          assert.include(request.headers.Authorization, 'token');
        });
    });
  });

  describe('optIn', () => {
    it('opts in the user', () => {
      sinon.spy(xhrMock, 'ajax');

      windowMock.location.href =
        'https://accounts.firefox.com/settings?client_id=clientsid&' +
        'service=sync&uid=asdfasd&utm_campaign=newsletter&' +
        'utm_content=content&utm_medium=email&utm_source=menupanel&' +
        'utm_term=awesome&unknown=false&email=no@no.com';

      return client.optIn('token', 'newsletter_id')
        .then(() => {
          assert.isTrue(xhrMock.ajax.calledOnce);
          const request = xhrMock.ajax.args[0][0];
          const cleanedSourceUrl =
            'https://accounts.firefox.com/settings?client_id=clientsid&' +
            'service=sync&utm_campaign=newsletter&utm_content=content&' +
            'utm_medium=email&utm_source=menupanel&utm_term=awesome';
          assert.equal(request.url, BASE_URL + '/subscribe/');
          assert.equal(request.type, 'post');
          assert.equal(request.headers.Authorization, 'Bearer token');
          assert.equal(request.headers['X-Requested-With'], 'XMLHttpRequest');
          assert.deepEqual(request.data, {
            newsletters: 'newsletter_id',
            source_url: cleanedSourceUrl //eslint-disable-line camelcase
          });
        });
    });
  });
});
