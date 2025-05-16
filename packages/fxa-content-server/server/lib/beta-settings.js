/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { readFileSync } = require('fs');
const { join } = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./configuration');
const FLOW_ID_KEY = config.get('flow_id_key');
const flowMetrics = require('./flow-metrics');

const env = config.get('env');

let settingsIndexFile;
function getSettingsIndexFile() {
  if (settingsIndexFile === undefined) {
    const proxy_settings = config.get('proxy_settings');
    if (!proxy_settings) {
      const static_directory = config.get('static_directory');
      const static_settings_directory = config.get('static_settings_directory');
      const settingsIndexPath = join(
        __dirname,
        '..',
        '..',
        static_directory,
        'settings',
        static_settings_directory,
        'index.html'
      );
      settingsIndexFile = readFileSync(settingsIndexPath, {
        encoding: 'utf-8',
      });
    }
  }
  return settingsIndexFile;
}

const settingsConfig = {
  env,
  version: config.get('version'),
  marketingEmailPreferencesUrl: config.get('marketing_email.preferences_url'),
  l10n: {
    strict: false,
    baseUrl: config.get('l10n.baseUrl'),
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
    emailFirstRoutes: config.get('showReactApp.emailFirstRoutes'),
  },
  rolloutRates: {
    keyStretchV2: config.get('rolloutRates.keyStretchV2'),
    generalizedReactApp: config.get('rolloutRates.generalizedReactApp'),
  },
  featureFlags: {
    keyStretchV2: config.get('featureFlags.keyStretchV2'),
    recoveryCodeSetupOnSyncSignIn: config.get(
      'featureFlags.recoveryCodeSetupOnSyncSignIn'
    ),
  },
  nimbusPreview: config.get('nimbusPreview'),
};

// Inject Settings content into the index HTML
// This used to inject the configs and flow metrics values.
function swapBetaMeta(html, tmplContent = {}) {
  let result = html;

  Object.keys(tmplContent).forEach((key) => {
    let val = tmplContent[key];
    if (typeof val === 'object') {
      val = encodeURIComponent(JSON.stringify(tmplContent[key]));
    }

    result = result.replace(key, val);
  });

  return result;
}

const preconnectLinks = [];
function preconnect(val) {
  if (!val) {
    return '';
  }

  // Don't create duplicate pre-connect links
  if (preconnectLinks.includes(val)) {
    return '';
  }

  // Don't allow more than 5 pre-connects
  if (preconnectLinks.length > 5) {
    return '';
  }

  preconnectLinks.push(val);
  return `<link rel="preconnect" href="${val}">`;
}

function resolvePreConnectDirectives(settingsConfig) {
   // Using '?' will breaks l10n extraction :9
  let gqlUrl, authUrl, oauthUrl, sentryUrl;
  try { gqlUrl = settingsConfig.servers.gql.url; } catch (e) {}
  try { authUrl = settingsConfig.servers.auth.url; } catch (e) {}
  try { oauthUrl = settingsConfig.servers.oauth.url; } catch (e) {}
  try { sentryUrl = settingsConfig.sentry.dsn.replace(/\/\d*$/, ''); } catch (e) {}

  return {
    __GQL_URL_PRECONNECT__: preconnect(gqlUrl),
    __AUTH_URL_PRECONNECT__: preconnect(authUrl),
    __OAUTH_URL_PRECONNECT__: preconnect(oauthUrl),
    __SENTRY_URL_PRECONNECT__: preconnect(sentryUrl),
  }
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
      const flowEventData = flowMetrics.create(FLOW_ID_KEY);
      html = swapBetaMeta(html, {
        __SERVER_CONFIG__: settingsConfig,
        __FLOW_ID__: flowEventData.flowId,
        __FLOW_BEGIN_TIME__: flowEventData.flowBeginTime,
        ...resolvePreConnectDirectives(settingsConfig)
      });
      res.send(new Buffer.from(html));
    } else {
      // remove transfer-encoding header, a Content-Length header will be added
      // automatically, and these two headers are incompatible. If this is not
      // set any fetch request will fail with:
      //  - Parse Error: Content-Length can't be present with Transfer-Encoding
      res.removeHeader('Transfer-Encoding');
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
  const indexFile = getSettingsIndexFile();
  if (indexFile === undefined) {
    throw new Error('Could not locate settings index file.');
  }

  const flowEventData = flowMetrics.create(FLOW_ID_KEY);
  return res.send(
    swapBetaMeta(indexFile, {
      __SERVER_CONFIG__: settingsConfig,
      __FLOW_ID__: flowEventData.flowId,
      __FLOW_BEGIN_TIME__: flowEventData.flowBeginTime,
      ...resolvePreConnectDirectives(settingsConfig)
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
