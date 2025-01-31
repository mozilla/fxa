/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const flowMetrics = require('../flow-metrics');
const logger = require('../logging/log')('routes.index');

module.exports = function (config) {
  let featureFlags;
  const featureFlagConfig = config.get('featureFlags');
  if (featureFlagConfig.enabled) {
    featureFlags = require('fxa-shared').featureFlags(
      featureFlagConfig,
      logger
    );
  } else {
    featureFlags = { get: () => ({}) };
  }

  const AUTH_SERVER_URL = config.get('fxaccount_url');
  const CLIENT_ID = config.get('oauth_client_id');
  const COPPA_ENABLED = config.get('coppa.enabled');
  const ENV = config.get('env');
  const FLOW_ID_KEY = config.get('flow_id_key');
  const MARKETING_EMAIL_ENABLED = config.get('marketing_email.enabled');
  const MARKETING_EMAIL_PREFERENCES_URL = config.get(
    'marketing_email.preferences_url'
  );
  const MX_RECORD_VALIDATION = config.get('mxRecordValidation');
  const MAX_EVENT_OFFSET = config.get('client_metrics.max_event_offset');
  const REDIRECT_CHECK_ALLOW_LIST = config.get('redirect_check.allow_list');
  const SENTRY_CLIENT_DSN = config.get('sentry.dsn');
  const SENTRY_CLIENT_ENV = config.get('sentry.env');
  const SENTRY_SAMPLE_RATE = config.get('sentry.sampleRate');
  const SENTRY_TRACES_SAMPLE_RATE = config.get('sentry.tracesSampleRate');
  const SENTRY_CLIENT_NAME = config.get('sentry.clientName');
  const OAUTH_SERVER_URL = config.get('oauth_url');
  const PAIRING_CHANNEL_URI = config.get('pairing.server_base_uri');
  const PAIRING_CLIENTS = config.get('pairing.clients');
  const PROFILE_SERVER_URL = config.get('profile_url');
  const STATIC_RESOURCE_URL = config.get('static_resource_url');
  const SCOPED_KEYS_ENABLED = config.get('scopedKeys.enabled');
  const SCOPED_KEYS_VALIDATION = config.get('scopedKeys.validation');
  const SUBSCRIPTIONS = config.get('subscriptions');
  const GOOGLE_AUTH_CONFIG = config.get('googleAuthConfig');
  const APPLE_AUTH_CONFIG = config.get('appleAuthConfig');
  const PROMPT_NONE_ENABLED = config.get('oauth.prompt_none.enabled');
  const SHOW_REACT_APP = config.get('showReactApp');
  const BRAND_MESSAGING_MODE = config.get('brandMessagingMode');
  const FEATURE_FLAGS_FXA_STATUS_ON_SETTINGS = config.get(
    'featureFlags.sendFxAStatusOnSettings'
  );
  const FEATURE_FLAGS_RECOVERY_CODE_SETUP_ON_SYNC_SIGN_IN = config.get(
    'featureFlags.recoveryCodeSetupOnSyncSignIn'
  );
  const FEATURE_FLAGS_ENABLE_ADDING_2FA_BACKUP_PHONE = config.get(
    'featureFlags.enableAdding2FABackupPhone'
  );
  const FEATURE_FLAGS_ENABLE_USING_2FA_BACKUP_PHONE = config.get(
    'featureFlags.enableUsing2FABackupPhone'
  );
  const GLEAN_ENABLED = config.get('glean.enabled');
  const GLEAN_APPLICATION_ID = config.get('glean.applicationId');
  const GLEAN_UPLOAD_ENABLED = config.get('glean.uploadEnabled');
  const GLEAN_APP_CHANNEL = config.get('glean.appChannel');
  const GLEAN_SERVER_ENDPOINT = config.get('glean.serverEndpoint');
  const GLEAN_LOG_PINGS = config.get('glean.logPings');
  const GLEAN_DEBUG_VIEW_TAG = config.get('glean.debugViewTag');

  // Rather than relay all rollout rates, hand pick the ones that are applicable
  const ROLLOUT_RATES = config.get('rolloutRates');

  // Note that this list is only enforced for clients that use login_hint/email
  // with prompt=none. id_token_hint clients are not subject to this check.
  const PROMPT_NONE_ENABLED_CLIENT_IDS = new Set(
    config.get('oauth.prompt_none.enabled_client_ids')
  );

  // add version from package.json to config
  const RELEASE = require('../../../package.json').version;
  const WEBPACK_PUBLIC_PATH = `${STATIC_RESOURCE_URL}/${config.get(
    'jsResourcePath'
  )}/`;

  const configForFrontEnd = {
    authServerUrl: AUTH_SERVER_URL,
    maxEventOffset: MAX_EVENT_OFFSET,
    env: ENV,
    isCoppaEnabled: COPPA_ENABLED,
    isPromptNoneEnabled: PROMPT_NONE_ENABLED,
    googleAuthConfig: GOOGLE_AUTH_CONFIG,
    appleAuthConfig: APPLE_AUTH_CONFIG,
    marketingEmailEnabled: MARKETING_EMAIL_ENABLED,
    marketingEmailPreferencesUrl: MARKETING_EMAIL_PREFERENCES_URL,
    mxRecordValidation: MX_RECORD_VALIDATION,
    oAuthClientId: CLIENT_ID,
    oAuthUrl: OAUTH_SERVER_URL,
    pairingChannelServerUri: PAIRING_CHANNEL_URI,
    pairingClients: PAIRING_CLIENTS,
    profileUrl: PROFILE_SERVER_URL,
    release: RELEASE,
    redirectAllowlist: REDIRECT_CHECK_ALLOW_LIST,
    rolloutRates: ROLLOUT_RATES,
    scopedKeysEnabled: SCOPED_KEYS_ENABLED,
    scopedKeysValidation: SCOPED_KEYS_VALIDATION,
    sentry: {
      dsn: SENTRY_CLIENT_DSN,
      env: SENTRY_CLIENT_ENV,
      sampleRate: SENTRY_SAMPLE_RATE,
      clientName: SENTRY_CLIENT_NAME,
      tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
    },
    staticResourceUrl: STATIC_RESOURCE_URL,
    subscriptions: SUBSCRIPTIONS,
    webpackPublicPath: WEBPACK_PUBLIC_PATH,
    showReactApp: SHOW_REACT_APP,
    brandMessagingMode: BRAND_MESSAGING_MODE,
    featureFlags: {
      sendFxAStatusOnSettings: FEATURE_FLAGS_FXA_STATUS_ON_SETTINGS,
      recoveryCodeSetupOnSyncSignIn:
        FEATURE_FLAGS_RECOVERY_CODE_SETUP_ON_SYNC_SIGN_IN,
      enableAdding2FABackupPhone: FEATURE_FLAGS_ENABLE_ADDING_2FA_BACKUP_PHONE,
      enableUsing2FABackupPhone: FEATURE_FLAGS_ENABLE_USING_2FA_BACKUP_PHONE,
    },
    glean: {
      // feature toggle
      enabled: GLEAN_ENABLED,
      // Glean SDK config
      applicationId: GLEAN_APPLICATION_ID,
      uploadEnabled: GLEAN_UPLOAD_ENABLED,
      appDisplayVersion: RELEASE,
      channel: GLEAN_APP_CHANNEL,
      serverEndpoint: GLEAN_SERVER_ENDPOINT,
      logPings: GLEAN_LOG_PINGS,
      debugViewTag: GLEAN_DEBUG_VIEW_TAG,
    },
  };

  const NO_LONGER_SUPPORTED_CONTEXTS = new Set([
    'fx_desktop_v1',
    'fx_desktop_v2',
    'fx_firstrun_v2',
    'iframe',
  ]);

  return {
    method: 'get',
    path: '/',
    process: async function (req, res) {
      const flowEventData = flowMetrics.create(FLOW_ID_KEY);

      if (NO_LONGER_SUPPORTED_CONTEXTS.has(req.query.context)) {
        return res.redirect(`/update_firefox?${req.originalUrl.split('?')[1]}`);
      }

      let flags;
      try {
        flags = await featureFlags.get();
      } catch (err) {
        logger.error('featureFlags.error', err);
        flags = {};
      }

      const isPromptNoneEnabledForClient =
        req.query.client_id &&
        PROMPT_NONE_ENABLED_CLIENT_IDS.has(req.query.client_id);

      res.render('index', {
        // Note that bundlePath is added to templates as a build step
        bundlePath: '/bundle',
        config: encodeURIComponent(
          JSON.stringify({
            ...configForFrontEnd,
            isPromptNoneEnabled: PROMPT_NONE_ENABLED,
            isPromptNoneEnabledForClient,
          })
        ),
        featureFlags: encodeURIComponent(JSON.stringify(flags)),
        flowBeginTime: flowEventData.flowBeginTime,
        flowId: flowEventData.flowId,
        // Note that staticResourceUrl is added to templates as a build step
        staticResourceUrl: STATIC_RESOURCE_URL,
      });

      if (req.headers.dnt === '1') {
        logger.info('request.headers.dnt');
      }
    },
    terminate: featureFlags.terminate,
  };
};
