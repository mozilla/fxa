/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var nock = require('nock');

var config = require('../../lib/config');

var API_KEY = config.get('basket.api_key');
var API_URL = config.get('basket.api_url');
var VERIFY_URL = config.get('oauth_url') + '/v1/verify';
var PROFILE_URL = config.get('fxaccount_url') + '/v1/account/profile';

module.exports.mockOAuthResponse = function mockOAuthResponse() {
  return nock(VERIFY_URL).post('');
};

module.exports.mockProfileResponse = function mockOAuthResponse() {
  return nock(PROFILE_URL).get('');
};

module.exports.mockBasketResponse = function mockBasketResponse(opts) {
  opts = opts || {};
  opts.reqheaders = opts.reqheaders || {};
  opts.reqheaders['x-api-key'] = API_KEY;
  return nock(API_URL, opts);
};
