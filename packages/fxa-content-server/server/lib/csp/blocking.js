/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to take care of CSP. CSP headers are not sent unless config
// option 'csp.enabled' is set (default true in development), with a special
// exception for the /tests/index.html path, which are the frontend unit
// tests.

const url = require('url');

function getOrigin(link) {
  const parsed = url.parse(link);
  return `${parsed.protocol}//${parsed.host}`;
}

/**
 * blockingCspMiddleware is where to declare rules that will cause a resource
 * to be blocked if it runs afowl of a rule.
 */
module.exports = function(config) {
  const AUTH_SERVER = getOrigin(config.get('fxaccount_url'));
  const BLOB = 'blob:';
  const CDN_URL = config.get('static_resource_url');
  const DATA = 'data:';
  const GRAVATAR = 'https://secure.gravatar.com';
  const MARKETING_EMAIL_SERVER = getOrigin(
    config.get('marketing_email.api_url')
  );
  const OAUTH_SERVER = getOrigin(config.get('oauth_url'));
  const PROFILE_SERVER = getOrigin(config.get('profile_url'));
  const PROFILE_IMAGES_SERVER = getOrigin(config.get('profile_images_url'));
  const PUBLIC_URL = config.get('public_url');
  const PAIRING_SERVER_WEBSOCKET = getOrigin(
    config.get('pairing.server_base_uri')
  );
  const PAIRING_SERVER_HTTP = PAIRING_SERVER_WEBSOCKET.replace(/^ws/, 'http');
  const SENTRY_SERVER = 'https://sentry.prod.mozaws.net';
  //
  // Double quoted values
  //
  const NONE = "'none'";
  // keyword sources - https://www.w3.org/TR/CSP2/#keyword_source
  // Note: "'unsafe-inline'" and "'unsafe-eval'" are not used in this module.
  const SELF = "'self'";

  function addCdnRuleIfRequired(target) {
    if (CDN_URL !== PUBLIC_URL) {
      target.push(CDN_URL);
    }

    return target;
  }

  const rules = {
    directives: {
      connectSrc: [
        SELF,
        AUTH_SERVER,
        OAUTH_SERVER,
        PROFILE_SERVER,
        MARKETING_EMAIL_SERVER,
        PAIRING_SERVER_WEBSOCKET,
        PAIRING_SERVER_HTTP,
        SENTRY_SERVER,
      ],
      defaultSrc: [SELF],
      fontSrc: addCdnRuleIfRequired([SELF]),
      imgSrc: addCdnRuleIfRequired([
        SELF,
        DATA,
        // Gravatar support was removed in #4927, but we don't want
        // to break the site for users who already use a Gravatar as
        // their profile image.
        GRAVATAR,
        PROFILE_IMAGES_SERVER,
      ]),
      mediaSrc: [BLOB],
      objectSrc: [NONE],
      reportUri: config.get('csp.reportUri'),
      scriptSrc: addCdnRuleIfRequired([SELF]),
      styleSrc: addCdnRuleIfRequired([SELF]),
    },
    reportOnly: false,
    // Sources are exported for unit tests
    Sources: {
      AUTH_SERVER,
      BLOB,
      CDN_URL,
      DATA,
      GRAVATAR,
      MARKETING_EMAIL_SERVER,
      NONE,
      OAUTH_SERVER,
      PAIRING_SERVER_HTTP,
      PAIRING_SERVER_WEBSOCKET,
      PROFILE_IMAGES_SERVER,
      PROFILE_SERVER,
      PUBLIC_URL,
      SELF,
      SENTRY_SERVER,
    },
  };

  return rules;
};
