/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to take care of CSP. CSP headers are not sent unless config
// option 'csp.enabled' is set (default true).

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
  const AUTH_SERVER = getOrigin(config.get('servers.auth.url'));
  const CDN_URL = config.get('staticResources.url');
  const DATA = 'data:';
  const GRAVATAR = 'https://secure.gravatar.com';
  const ACCOUNTS_STATIC_CDN = 'https://accounts-static.cdn.mozilla.net/';
  const SENTRY_SERVER = getOrigin(config.get('sentry.url'));
  const OAUTH_SERVER = getOrigin(config.get('servers.oauth.url'));
  const PROFILE_SERVER = getOrigin(config.get('servers.profile.url'));
  const PROFILE_IMAGES_SERVER = getOrigin(
    config.get('servers.profileImages.url')
  );
  const PUBLIC_URL = config.get('listen.publicUrl');
  const HOT_RELOAD_WEBSOCKET = PUBLIC_URL.replace(/^http/, 'ws');

  const STRIPE_API_URL = getOrigin(config.get('stripe.apiUrl'));
  const STRIPE_HOOKS_URL = getOrigin(config.get('stripe.hooksUrl'));
  const STRIPE_SCRIPT_URL = getOrigin(config.get('stripe.scriptUrl'));

  const EXTRA_IMG_SRC = config.get('csp.extraImgSrc');

  //
  // Double quoted values
  //
  const NONE = "'none'";
  // keyword sources - https://www.w3.org/TR/CSP2/#keyword_source
  // Note: "'unsafe-eval'" is not used in this module, and "'unsafe-inline'" is
  // needed for Stripe inline styles.
  const SELF = "'self'";
  const UNSAFE_INLINE = "'unsafe-inline'";

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
        SENTRY_SERVER,
        STRIPE_API_URL,
      ],
      defaultSrc: [SELF],
      fontSrc: addCdnRuleIfRequired([SELF]),
      frameSrc: [STRIPE_SCRIPT_URL, STRIPE_HOOKS_URL],
      imgSrc: addCdnRuleIfRequired([
        SELF,
        DATA,
        // Gravatar support was removed in #4927, but we don't want
        // to break the site for users who already use a Gravatar as
        // their profile image.
        GRAVATAR,
        PROFILE_IMAGES_SERVER,
        ACCOUNTS_STATIC_CDN,
        ...EXTRA_IMG_SRC,
      ]),
      mediaSrc: [NONE],
      objectSrc: [NONE],
      reportUri: config.get('csp.reportUri'),
      scriptSrc: addCdnRuleIfRequired([SELF, STRIPE_SCRIPT_URL]),
      styleSrc: addCdnRuleIfRequired([SELF, UNSAFE_INLINE]),
    },
    reportOnly: false,
    // Sources are exported for unit tests
    Sources: {
      AUTH_SERVER,
      CDN_URL,
      DATA,
      GRAVATAR,
      NONE,
      OAUTH_SERVER,
      HOT_RELOAD_WEBSOCKET,
      PROFILE_IMAGES_SERVER,
      ACCOUNTS_STATIC_CDN,
      PROFILE_SERVER,
      PUBLIC_URL,
      SENTRY_SERVER,
      STRIPE_API_URL,
      STRIPE_HOOKS_URL,
      STRIPE_SCRIPT_URL,
      SELF,
      UNSAFE_INLINE,
    },
  };

  if (config.get('env') === 'development') {
    rules.directives.connectSrc.push(HOT_RELOAD_WEBSOCKET);
  }

  return rules;
};
