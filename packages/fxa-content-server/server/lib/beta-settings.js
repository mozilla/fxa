/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { readFileSync } = require('fs');
const { join } = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./configuration');

let settingsIndexFile;
const env = config.get('env');
const settingsIndexPath = join(
  __dirname,
  '..',
  '..',
  config.get('static_directory'),
  'settings',
  'index.html'
);

if (env !== 'development') {
  settingsIndexFile = readFileSync(settingsIndexPath, {
    encoding: 'utf-8',
  });
}

const settingsConfig = {
  env,
  version: config.get('version'),
  marketingEmailPreferencesUrl: config.get('marketing_email.preferences_url'),
  metrics: {
    navTiming: {
      enabled: config.get('statsd.enabled'),
      endpoint: '/navigation-timing',
    },
  },
  sentry: {
    dsn: config.get('sentry.dsn'),
    env: config.get('sentry.env'),
    sampleRate: config.get('sentry.sampleRate'),
    tracesSampleRate: config.get('sentry.tracesSampleRate'),
    clientName: config.get('sentry.clientName'),
    serverName: config.get('sentry.serverName'),
  },
  servers: {
    gql: {
      url: config.get('settings_gql_url'),
    },
    oauth: {
      url: config.get('fxaccount_url'),
    },
    auth: {
      url: config.get('fxaccount_url'),
    },
    profile: {
      url: config.get('profile_url'),
    },
  },
  oauth: {
    clientId: config.get('oauth_client_id'),
    scopedKeysEnabled: config.get('scopedKeys.enabled'),
    scopedKeysValidation: config.get('scopedKeys.validation'),
    isPromptNoneEnabled: config.get('oauth.prompt_none.enabled'),
    isPromptNoneEnabledClientIds: config.get(
      'oauth.prompt_none.enabled_client_ids'
    ),
    reactClientIdsEnabled: config.get(
      'oauth.react_feature_flags.enabled_client_ids'
    ),
  },
  recoveryCodes: {
    count: config.get('recovery_codes.count'),
    length: config.get('recovery_codes.length'),
  },
  googleAuthConfig: config.get('googleAuthConfig'),
  appleAuthConfig: config.get('appleAuthConfig'),
  brandMessagingMode: config.get('brandMessagingMode'),
  glean: { ...config.get('glean'), appDisplayVersion: config.get('version') },
  redirectAllowlist: config.get('redirect_check.allow_list'),
  sendFxAStatusOnSettings: config.get('featureFlags.sendFxAStatusOnSettings'),
  showReactApp: {
    signUpRoutes: config.get('showReactApp.signUpRoutes'),
    signInRoutes: config.get('showReactApp.signInRoutes'),
  },
  rolloutRates: {
    keyStretchV2: config.get('rolloutRates.keyStretchV2'),
  },
  featureFlags: {
    keyStretchV2: config.get('featureFlags.keyStretchV2'),
  },
};

// Inject Beta Settings meta content
// This is only used to replace __SERVER_CONFIG__ with a stringified,
// sanitized config object in the html page, before returning the page to
// the client.
function swapBetaMeta(html, metaContent = {}) {
  let result = html;

  Object.keys(metaContent).forEach((key) => {
    let val = metaContent[key];
    if (typeof val === 'object') {
      val = encodeURIComponent(JSON.stringify(metaContent[key]));
    }

    result = result.replace(key, val);
  });

  return result;
}

// Conditionally modify the response
function modifyProxyRes(proxyRes, req, res) {
  const bodyChunks = [];

  proxyRes.on('data', (chunk) => {
    bodyChunks.push(chunk);
  });

  proxyRes.on('end', () => {
    const body = Buffer.concat(bodyChunks);

    // forward existing response data
    res.status(proxyRes.statusCode);
    Object.keys(proxyRes.headers).forEach((key) => {
      res.append(key, proxyRes.headers[key]);
    });

    // if it's an html content type, inject server config
    if (
      proxyRes.headers['content-type'] &&
      proxyRes.headers['content-type'].includes('text/html')
    ) {
      let html = body.toString();
      html = swapBetaMeta(html, {
        __SERVER_CONFIG__: settingsConfig,
      });
      res.send(new Buffer.from(html));
    } else {
      // remove transfer-encoding header, a Content-Length header will be added
      // automatically, and these two headers are incompatible. If this is not
      // set any fetch request will fail with:
      //  - Parse Error: Content-Length can't be present with Transfer-Encoding
      res.set('Transfer-Encoding', '');
      res.send(body);
    }

    res.end();
  });
}

const createSettingsProxy = createProxyMiddleware({
  target: 'http://localhost:3000',
  ws: true,
  selfHandleResponse: true, // ensure res.end is not called early
  onProxyRes: modifyProxyRes,
});

// Modify the static settings page by replacing __SERVER_CONFIG__ with the config object
const modifySettingsStatic = function (req, res) {
  return res.send(
    swapBetaMeta(settingsIndexFile, {
      __SERVER_CONFIG__: settingsConfig,
    })
  );
};

module.exports = {
  createSettingsProxy,
  modifySettingsStatic,
  swapBetaMeta,
  modifyProxyRes,
  settingsConfig,
};
