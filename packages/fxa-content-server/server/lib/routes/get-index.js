/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var flowMetrics = require('../flow-metrics');

module.exports = function (config) {
  var ALLOWED_PARENT_ORIGINS = config.get('allowed_parent_origins');
  var AUTH_SERVER_URL = config.get('fxaccount_url');
  var CLIENT_ID = config.get('oauth_client_id');
  var ENV = config.get('env');
  var FLOW_ID_KEY = config.get('flow_id_key');
  var MARKETING_EMAIL_API_URL = config.get('marketing_email.api_url');
  var MARKETING_EMAIL_PREFERENCES_URL = config.get('marketing_email.preferences_url');
  var OAUTH_SERVER_URL = config.get('oauth_url');
  var PROFILE_SERVER_URL = config.get('profile_url');
  var STATIC_RESOURCE_URL = config.get('static_resource_url');
  // add version from package.json to config
  var RELEASE = require('../../../package.json').version;

  var serializedConfig = encodeURIComponent(JSON.stringify({
    allowedParentOrigins: ALLOWED_PARENT_ORIGINS,
    authServerUrl: AUTH_SERVER_URL,
    env: ENV,
    marketingEmailPreferencesUrl: MARKETING_EMAIL_PREFERENCES_URL,
    marketingEmailServerUrl: MARKETING_EMAIL_API_URL,
    oAuthClientId: CLIENT_ID,
    oAuthUrl: OAUTH_SERVER_URL,
    profileUrl: PROFILE_SERVER_URL,
    release: RELEASE
  }));

  var route = {};
  route.method = 'get';
  route.path = '/';

  route.process = function (req, res) {
    const flowEventData = flowMetrics.create(FLOW_ID_KEY, req.headers['user-agent']);

    res.render('index', {
      config: serializedConfig,
      flowBeginTime: flowEventData.flowBeginTime,
      flowId: flowEventData.flowId,
      // Note that staticResourceUrl is added to templates as a build step
      staticResourceUrl: STATIC_RESOURCE_URL
    });
  };

  return route;
};

