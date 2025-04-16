/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint-disable camelcase */
'use strict';
const convict = require('convict');
const fs = require('fs');
const path = require('path');

const versionInfo = require('./version');

const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
const DEFAULT_SUPPORTED_LANGUAGES = require('../../../../libs/shared/l10n/src/lib/supported-languages.json');

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));
convict.addFormats(
  require('fxa-shared/configuration/convict-format-allow-list').format
);

const conf = (module.exports = convict({
  allowed_iframe_contexts: {
    default: [],
    doc: 'DEPRECATED - context query parameters allowed to embed FxA within an IFRAME',
    format: Array,
  },
  allowed_metrics_flow_cors_origins: {
    default: [null],
    doc: 'Origins that are allowed to request the /metrics-flow endpoint',
    env: 'ALLOWED_METRICS_FLOW_ORIGINS',
    format: Array,
  },
  allowed_parent_origins: {
    default: [],
    doc: 'DEPRECATED - Origins that are allowed to embed FxA within an IFRAME',
    env: 'ALLOWED_PARENT_ORIGINS',
    format: Array,
  },
  amplitude: {
    disabled: {
      default: false,
      doc: 'Disable amplitude events',
      env: 'AMPLITUDE_DISABLED',
      format: Boolean,
    },
    schemaValidation: {
      default: true,
      doc: 'Validate events against a JSON schema',
      env: 'AMPLITUDE_SCHEMA_VALIDATION',
      format: Boolean,
    },
    rawEvents: {
      default: false,
      doc: 'Log raw Amplitude events',
      env: 'AMPLITUDE_RAW_EVENTS',
      format: Boolean,
    },
  },
  are_dist_resources: {
    default: false,
    doc: 'Check if the resources are under the /dist directory',
    format: Boolean,
  },
  cachify_prefix: {
    default: 'v',
    doc: 'The prefix for cachify hashes in URLs',
  },
  cert_path: {
    default: path.resolve(__dirname, '..', '..', 'cert.pem'),
    doc: 'The location of the SSL certificate in pem format',
  },
  client_metrics: {
    max_event_offset: {
      default: '2 days',
      doc: 'Maximum event offset',
      env: 'CLIENT_METRICS_MAX_EVENT_OFFSET',
      format: 'duration',
    },
    stderr_collector_disabled: {
      default: false,
      doc: 'disable client metrics output to stderr',
      env: 'DISABLE_CLIENT_METRICS_STDERR',
    },
  },
  client_sessions: {
    cookie_name: 'session',
    duration: {
      default: '1 day',
      format: 'duration',
    },
    secret: 'YOU MUST CHANGE ME',
  },
  clientAddressDepth: {
    default: 3,
    doc: 'location of the client ip address in the remote address chain',
    env: 'CLIENT_ADDRESS_DEPTH',
    format: Number,
  },
  coppa: {
    enabled: {
      default: true,
      doc: 'Is the COPPA age check enabled?',
      env: 'COPPA_ENABLED',
      format: Boolean,
    },
  },
  csp: {
    enabled: {
      default: false,
      doc: 'Send "Content-Security-Policy" header',
      env: 'CSP_ENABLED',
    },
    reportUri: {
      default: '/_/csp-violation',
      doc: 'Location of "report-uri" for full, blocking CSP rules',
      env: 'CSP_REPORT_URI',
    },
    reportOnly: {
      default: false,
      doc: 'DEPRECATED - Only send the "Content-Security-Policy-Report-Only" header',
      env: 'CSP_REPORT_ONLY',
    },
    reportOnlyEnabled: {
      default: false,
      doc: 'Send "Content-Security-Policy-Report-Only" header',
      env: 'CSP_REPORT_ONLY_ENABLED',
    },
    reportOnlyUri: {
      default: '/_/csp-violation-report-only',
      doc: 'Location of "report-uri" for report-only CSP rules',
      env: 'CSP_REPORT_ONLY_URI',
    },
  },
  disable_locale_check: {
    default: false,
    doc: 'Skip checking for gettext .mo files for supported locales',
  },
  disable_route_logging: {
    default: false,
    doc: 'Disable route logging completely. Useful for trimming CI logs.',
    env: 'DISABLE_ROUTE_LOGGING',
  },
  env: {
    default: 'production',
    doc: "What environment are we running in?  Note: all hosted environments are 'production'.",
    env: 'NODE_ENV',
    format: ['production', 'development'],
  },
  version: {
    default: versionInfo.version,
  },
  featureFlags: {
    enabled: {
      default: true,
      doc: 'Enable feature flagging',
      env: 'FEATURE_FLAGS_ENABLED',
      format: Boolean,
    },
    interval: {
      default: '30 seconds',
      doc: 'The refresh interval for feature-flagging',
      env: 'FEATURE_FLAGS_INTERVAL',
      format: 'duration',
    },
    redis: {
      host: {
        default: 'localhost',
        doc: 'Redis host name or IP address',
        env: 'FEATURE_FLAGS_REDIS_HOST',
        format: String,
      },
      password: {
        default: '',
        doc: 'Redis password',
        env: 'REDIS_PASSWORD',
        sensitive: true,
        format: String,
      },
      initialBackoff: {
        default: '100 milliseconds',
        doc: 'Initial backoff for feature-flagging Redis connection retries, increases exponentially with each attempt',
        env: 'FEATURE_FLAGS_REDIS_TIMEOUT',
        format: 'duration',
      },
      maxConnections: {
        default: 1,
        doc: 'Maximum connection count for feature-flagging Redis pool',
        env: 'FEATURE_FLAGS_REDIS_MAX_CONNECTIONS',
        format: 'nat',
      },
      maxPending: {
        default: 10,
        doc: 'Maximum waiting client count for feature-flagging Redis pool',
        env: 'FEATURE_FLAGS_REDIS_MAX_PENDING',
        format: 'nat',
      },
      minConnections: {
        default: 1,
        doc: 'Minimum connection count for feature-flagging Redis pool',
        env: 'FEATURE_FLAGS_REDIS_MIN_CONNECTIONS',
        format: 'nat',
      },
      port: {
        default: 6379,
        doc: 'Redis port',
        env: 'FEATURE_FLAGS_REDIS_PORT',
        format: 'port',
      },
      retryCount: {
        default: 5,
        doc: 'Retry limit for feature-flagging Redis connection attempts',
        env: 'FEATURE_FLAGS_REDIS_RETRY_COUNT',
        format: 'int',
      },
    },
    sendFxAStatusOnSettings: {
      default: false,
      doc: 'Sends a webchannel message on the settings page to request auth data from the browser',
      format: Boolean,
      env: 'FEATURE_FLAGS_FXA_STATUS_ON_SETTINGS',
    },
    keyStretchV2: {
      default: true,
      doc: 'Enables V2 key stretching',
      format: Boolean,
      env: 'FEATURE_FLAGS_KEY_STRETCH_V2',
    },
    recoveryCodeSetupOnSyncSignIn: {
      default: false,
      doc: 'Enables setting up a recovery code after a Sync sign in',
      format: Boolean,
      env: 'FEATURE_FLAGS_RECOVERY_CODE_SETUP_ON_SYNC_SIGN_IN',
    },
    enableAdding2FABackupPhone: {
      default: false,
      doc: 'Enables adding a new backup phone number for 2FA',
      format: Boolean,
      env: 'FEATURE_FLAGS_ADDING_2FA_BACKUP_PHONE',
    },
    enableUsing2FABackupPhone: {
      default: false,
      doc: 'Enables using and managing an already confirmed backup phone number for 2FA',
      format: Boolean,
      env: 'FEATURE_FLAGS_USING_2FA_BACKUP_PHONE',
    },
  },
  showReactApp: {
    emailFirstRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of "email first" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_EMAIL_FIRST_ROUTES',
    },
    simpleRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of "simple" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_SIMPLE_ROUTES',
    },
    resetPasswordRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of "reset_password" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_RESET_PASSWORD_ROUTES',
    },
    oauthRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of routes requiring oauth',
      format: Boolean,
      env: 'REACT_CONVERSION_OAUTH_ROUTES',
    },
    signInRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of "signin" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_SIGNIN_ROUTES',
    },
    signUpRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of "signup" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_SIGNUP_ROUTES',
    },
    pairRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of "pair" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_PAIR_ROUTES',
    },
    postVerifyOtherRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of any other "post verify" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_POST_VERIFY_OTHER_ROUTES',
    },
    postVerifyThirdPartyAuthRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of third party auth "post verify" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_POST_VERIFY_THIRD_PARTY_AUTH',
    },
    postVerifyCADViaQRRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of "post verify CAD via QR code" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_POST_VERIFY_CAD_VIA_QR_ROUTES',
    },
    webChannelExampleRoutes: {
      default: false,
      doc: 'Enable users to visit the React version of "web channel example" routes',
      format: Boolean,
      env: 'REACT_CONVERSION_WEB_CHANNEL_EXAMPLE_ROUTES',
    },
  },
  brandMessagingMode: {
    default: 'none',
    doc: 'The type of messaging to show. Options are prelaunch, postlaunch, or none',
    env: 'BRAND_MESSAGING_MODE',
    format: String,
  },
  flow_id_expiry: {
    default: '2 hours',
    doc: 'Time after which flow ids are considered stale',
    env: 'FLOW_ID_EXPIRY',
    format: 'duration',
  },
  flow_id_key: {
    default: 'YOU MUST CHANGE ME',
    doc: 'HMAC key used to verify flow event data',
    env: 'FLOW_ID_KEY',
    format: String,
  },
  flow_metrics_disabled: {
    default: false,
    doc: 'Disable flow metrics output to stderr',
    env: 'FLOW_METRICS_DISABLED',
    format: Boolean,
  },
  fxa_client_configuration: {
    max_age: {
      default: '1 day',
      doc: 'Cache max age for /.well-known/fxa-client-configuration, in ms',
      format: 'duration',
    },
  },
  fxaccount_url: {
    default: 'http://localhost:9000',
    doc: 'The url of the Firefox Account auth server',
    env: 'FXA_URL',
    format: 'url',
  },
  serverGleanMetrics: {
    enabled: {
      default: true,
      doc: 'Enable Glean metrics logging',
      env: 'CONTENT_SERVER_GLEAN_ENABLED',
      format: Boolean,
    },
    applicationId: {
      default: 'accounts_backend_dev',
      doc: 'The Glean application id',
      env: 'CONTENT_SERVER_GLEAN_APP_ID',
      format: String,
    },
    channel: {
      default: 'development',
      doc: 'The application channel, e.g. development, stage, production, etc.',
      env: 'CONTENT_SERVER_GLEAN_APP_CHANNEL',
      format: String,
    },
    loggerAppName: {
      default: 'fxa-content',
      doc: 'Used to form the mozlog logger name',
      env: 'CONTENT_SERVER_GLEAN_LOGGER_APP_NAME',
      format: String,
    },
  },
  nimbusPreview: {
    default: false,
    doc: 'Enables preview mode for nimbus experiments for development and testing.',
    format: Boolean,
    env: 'NIMBUS_PREVIEW',
  },
  glean: {
    enabled: {
      default: false,
      env: 'GLEAN_ENABLED',
      format: Boolean,
    },
    applicationId: {
      default: 'accounts_frontend_dev',
      env: 'GLEAN_APPLICATION_ID',
      format: String,
    },
    uploadEnabled: {
      default: true,
      env: 'GLEAN_UPLOAD_ENABLED',
      format: Boolean,
    },
    appChannel: {
      default: 'development',
      env: 'GLEAN_APP_CHANNEL',
      format: String,
    },
    serverEndpoint: {
      default: 'https://incoming.telemetry.mozilla.org',
      env: 'GLEAN_SERVER_ENDPOINT',
      format: 'url',
    },

    // debug configs
    logPings: {
      default: true,
      doc: 'log pings to the console',
      env: 'GLEAN_LOG_PINGS',
      format: Boolean,
    },
    debugViewTag: {
      default: '',
      doc: 'the tag with which to log pings to The Glean Debug View (https://mozilla.github.io/glean/book/user/debugging/index.html#glean-debug-view)',
      env: 'GLEAN_DEBUG_VIEW_TAG',
      format: String,
    },
  },
  settings_gql_url: {
    default: 'http://localhost:8290',
    doc: 'The URL of the Firefox Account settings GraphQL server',
    env: 'FXA_GQL_URL',
    format: 'url',
  },
  googleAuthConfig: {
    enabled: {
      default: true,
      env: 'GOOGLE_AUTH_ENABLED',
      format: String,
    },
    clientId: {
      default:
        '218517873053-th4taguk9dvf03rrgk8sigon84oigf5l.apps.googleusercontent.com',
      env: 'GOOGLE_AUTH_CLIENT_ID',
      format: String,
      doc: 'Google auth client id',
    },
    redirectUri: {
      default: 'http://localhost:3030/post_verify/third_party_auth/callback',
      env: 'GOOGLE_AUTH_REDIRECT_URI',
      format: String,
      doc: 'Google auth redirect uri',
    },
    authorizationEndpoint: {
      default: 'https://accounts.google.com/o/oauth2/v2/auth',
      env: 'GOOGLE_AUTH_AUTHORIZATION_ENDPOINT',
      format: String,
      doc: 'Google auth token endpoint',
    },
  },
  appleAuthConfig: {
    enabled: {
      default: true,
      env: 'APPLE_AUTH_ENABLED',
      format: String,
    },
    clientId: {
      default: 'com.mozilla.firefox.accounts.auth',
      env: 'APPLE_AUTH_CLIENT_ID',
      format: String,
      doc: 'Apple auth client id',
    },
    redirectUri: {
      default:
        'https://localhost.dev:3030/post_verify/third_party_auth/callback',
      env: 'APPLE_AUTH_REDIRECT_URI',
      format: String,
      doc: 'Apple auth redirect uri',
    },
    authorizationEndpoint: {
      default: 'https://appleid.apple.com/auth/authorize',
      env: 'APPLE_AUTH_AUTHORIZATION_ENDPOINT',
      format: String,
      doc: 'Apple auth token endpoint',
    },
  },
  geodb: {
    dbPath: {
      default: path.resolve(__dirname, '../../../fxa-geodb/db/cities-db.mmdb'),
      doc: 'Path to maxmind database file',
      env: 'GEODB_DBPATH',
      format: String,
    },
    enabled: {
      default: true,
      doc: 'Feature flag for geolocation',
      env: 'GEODB_ENABLED',
      format: Boolean,
    },
  },
  hsts_max_age: {
    default: 31536000, // a year
    doc: 'Max age of the STS directive in seconds',
    // Note: This format is a number because the value needs to be in seconds
    format: Number,
  },
  http_port: {
    default: 3080,
    doc: 'HTTP port for local dev',
    env: 'HTTP_PORT',
    format: 'port',
  },
  http_proxy: {
    host: {
      default: undefined,
      format: String,
    },
    port: {
      default: undefined,
      format: 'port',
    },
  },
  i18n: {
    debugLang: {
      default: 'it-CH',
      format: String,
    },
    defaultLang: {
      default: 'en',
      format: String,
    },
    fonts: {
      unsupportedLanguages: {
        default: [],
        doc: 'DEPRECATED: These languages should use system fonts instead of Fira Sans',
        format: Array,
      },
    },
    localeSubdirSuffix: {
      default: '',
      doc: 'Enable alternative localized resources for Mozilla Online with private use subtag',
      env: 'I18N_LOCALE_SUBDIR_SUFFIX',
      format: ['', '_x_mococn'],
    },
    supportedLanguages: {
      default: DEFAULT_SUPPORTED_LANGUAGES,
      doc: 'List of languages this deployment should detect and display localized strings.',
      env: 'I18N_SUPPORTED_LANGUAGES',
      format: Array,
    },
    translationDirectory: {
      default: path.resolve(__dirname, '../../app/i18n/'),
      doc: 'The directory where per-locale .json files containing translations reside',
      env: 'I18N_TRANSLATION_DIR',
      format: String,
    },
    translationType: {
      default: 'key-value-json',
      doc: 'The file format used for the translations',
      env: 'I18N_TRANSLATION_TYPE',
      format: String,
    },
  },
  jsResourcePath: {
    default: 'bundle',
    doc: 'The directory where the JavaScript resources are served from',
    format: String,
  },
  key_path: {
    default: path.resolve(__dirname, '..', '..', 'key.pem'),
    doc: 'The location of the SSL key in pem format',
  },
  logging: {
    app: { default: 'fxa-content-server' },
    fmt: {
      default: 'heka',
      format: ['heka', 'pretty'],
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL',
    },
  },
  marketing_email: {
    enabled: {
      default: true,
      doc: 'Feature flag for communication preferences in settings',
      env: 'FXA_MARKETING_EMAIL_ENABLED',
      format: Boolean,
    },
    preferences_url: {
      default: 'https://basket.allizom.org/fxa/',
      doc: 'User facing URL where a user can manage their email preferences',
      env: 'FXA_MARKETING_EMAIL_PREFERENCES_URL',
      format: 'url',
    },
  },
  mxRecordValidation: {
    enabled: {
      default: true,
      doc: 'Feature flag for MX record validation',
      env: 'FXA_MX_RECORD_VALIDATION',
      format: Boolean,
    },
    exclusions: {
      default: [],
      doc: 'List of domains that we will not perform MX record validation on',
      format: Array,
      env: 'FXA_MX_RECORD_EXCLUSIONS',
    },
  },
  oauth_client_id: {
    default: 'ea3ca969f8c6bb0d',
    doc: 'The client_id of the content server',
    env: 'FXA_OAUTH_CLIENT_ID',
    format: String,
  },
  oauth_client_id_map: {
    default: {
      dcdb5ae7add825d2: '123done',
      '325b4083e32fe8e7': '321done',
    },
    doc: 'Mappings from client id to service name: { "id1": "name-1", "id2": "name-2" }',
    env: 'OAUTH_CLIENT_IDS',
    format: Object,
  },
  oauth_url: {
    default: 'http://localhost:9000',
    doc: 'The url of the Firefox Account OAuth server',
    env: 'FXA_OAUTH_URL',
    format: 'url',
  },
  oauth: {
    prompt_none: {
      enabled: {
        default: true,
        doc: 'Is prompt=none enabled globally?',
        env: 'OAUTH_PROMPT_NONE_ENABLED',
        format: Boolean,
      },
      enabled_client_ids: {
        // 123done enabled for functional tests, 321done is not.
        default: ['dcdb5ae7add825d2', '7f368c6886429f19', '32aaeb6f1c21316a'],
        doc: 'client_ids for which prompt=none is enabled',
        env: 'OAUTH_PROMPT_NONE_ENABLED_CLIENT_IDS',
        format: Array,
      },
    },
    react_feature_flags: {
      enabled_client_ids: {
        // 123done enabled for functional tests, 321done is not.
        default: ['dcdb5ae7add825d2', '7f368c6886429f19'],
        doc: 'client_ids for which feature flags in react are supported',
        env: 'OAUTH_REACT_FEATURE_FLAGS_ENABLED_CLIENT_IDS',
        format: Array,
      },
    },
  },
  openid_configuration: {
    claims_supported: ['aud', 'exp', 'iat', 'iss', 'sub'],
    id_token_signing_alg_values_supported: ['RS256'],
    response_types_supported: ['code', 'token'],
    scopes_supported: ['openid', 'profile', 'email'],
    subject_types_supported: ['public'],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
  },
  page_template_root: {
    default: path.resolve(__dirname, '..', 'templates', 'pages'),
    doc: 'The root path of server-rendered page templates',
  },
  page_template_subdirectory: {
    default: 'dist',
    doc: 'Subdirectory of page_template_root for server-rendered page templates',
    env: 'PAGE_TEMPLATE_SUBDIRECTORY',
    format: ['src', 'dist'],
  },
  nimbus: {
    host: {
      default: 'http://localhost:8001',
      doc: 'Base URI for cirrus (Nimbus experimentation endpoint).',
      env: 'NIMBUS_CIRRUS_HOST',
      format: String,
    },
    timeout: {
      default: 200,
      doc: 'Amount of time in milliseconds to wait for a response from cirrus',
      env: 'NIMBUS_CIRRUS_TIMEOUT',
      format: Number,
    },
  },
  pairing: {
    clients: {
      default: [
        '3c49430b43dfba77', // Reference browser
        'a2270f727f45f648', // Fenix
        '1b1a3e44c54fbb58', // Firefox for iOS
      ],
      doc: 'OAuth Client IDs that are allowed to pair. Remove all clients from this list to disable pairing.',
      env: 'PAIRING_CLIENTS',
      format: Array,
    },
    server_base_uri: {
      default: 'wss://channelserver.services.mozilla.com',
      doc: 'The url of the Pairing channel server.',
      env: 'PAIRING_SERVER_BASE_URI',
    },
  },
  port: {
    default: 3030,
    doc: 'HTTPS port for local dev',
    env: 'PORT',
    format: 'port',
  },
  process_type: 'ephemeral',
  profile_images_url: {
    default: 'http://localhost:1112',
    doc: 'The url of the Firefox Account Profile Image Server',
    env: 'FXA_PROFILE_IMAGES_URL',
    format: 'url',
  },
  profile_url: {
    default: 'http://localhost:1111',
    doc: 'The url of the Firefox Account Profile Server',
    env: 'FXA_PROFILE_URL',
    format: 'url',
  },
  public_url: {
    default: 'http://localhost:3030',
    doc: 'The publically visible URL of the deployment',
    env: 'PUBLIC_URL',
  },
  recovery_codes: {
    count: {
      default: 8,
      doc: 'The default number of backup authentication codes to create',
      env: 'RECOVERY_CODE_COUNT',
      format: 'nat',
    },
    length: {
      default: 10,
      doc: 'The default length of a backup authentication code',
      env: 'RECOVERY_CODE_LENGTH',
      format: 'nat',
    },
  },
  redirect_port: {
    default: 80,
    doc: 'Redirect port for HTTPS',
    env: 'REDIRECT_PORT',
    format: 'port',
  },
  redirect_check: {
    allow_list: {
      default:
        '*.mozilla.org,*.mozilla.com,*.mozaws.net,*.mozgcp.net,*.firefox.com,firefox.com,localhost'.split(
          ','
        ),
      doc: `A comma separated list of hostname rules to let through on redirects. Rules support wildcards.

        - A postfix wildcard is not allowed, e.g. 'foo.*' is invalid.
        - Empty fragments are not allowed. This means things like 'foo. .bar', '..', '.' are all invalid.
        - Partial matching is allowed. So 'foo.b*.bar' would match 'foo.baz.bar'.
        - Note that for partial matching each segment is evaluated in isolation. This means that 'foo.b*.bar' would not allow 'foo.b.az.bar'.
      `,
      env: 'REDIRECT_CHECK_ALLOW_LIST',
      format: 'allowlist',
    },
  },
  route_log_format: {
    default: 'default_fxa',
    format: ['default_fxa', 'dev_fxa', 'default', 'dev', 'short', 'tiny'],
  },
  scopedKeys: {
    enabled: {
      default: true,
      doc: 'Enable Scoped Key OAuth features',
      env: 'SCOPED_KEYS_ENABLED',
      format: Boolean,
    },
    validation: {
      default: {
        'https://identity.mozilla.com/apps/lockbox': {
          redirectUris: [
            'https://2aa95473a5115d5f3deb36bb6875cf76f05e4c4d.extensions.allizom.org/',
            'https://mozilla-lockbox.github.io/fxa/ios-redirect.html',
            'https://lockbox.firefox.com/fxa/ios-redirect.html',
            'https://lockbox.firefox.com/fxa/android-redirect.html',
          ],
        },
        'https://identity.mozilla.com/apps/notes': {
          redirectUris: [
            'https://dee85c67bd72f3de1f0a0fb62a8fe9b9b1a166d7.extensions.allizom.org/',
            'https://mozilla.github.io/notes/fxa/android-redirect.html',
          ],
        },
        'https://identity.mozilla.com/apps/oldsync': {
          redirectUris: [
            'https://lockbox.firefox.com/fxa/ios-redirect.html',
            'https://lockbox.firefox.com/fxa/android-redirect.html',
            'https://accounts.firefox.com/oauth/success/a2270f727f45f648', // Fenix
            'https://accounts.firefox.com/oauth/success/3c49430b43dfba77', // Reference browser
            'https://accounts.firefox.com/oauth/success/85da77264642d6a1', // Firefox for FireTV
            'https://accounts.firefox.com/oauth/success/1b1a3e44c54fbb58', // Firefox for iOS
            'urn:ietf:wg:oauth:2.0:oob:pair-auth-webchannel',
            'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel', // Firefox for iOS Rust client
          ],
        },
        'https://identity.mozilla.com/apps/send': {
          redirectUris: [
            'https://send.firefox.com/oauth',
            'https://send.firefox.com/fxa/android-redirect.html',
            'https://send2.dev.lcip.org/oauth',
          ],
        },
        'https://identity.mozilla.com/apps/123done': {
          redirectUris: [
            'http://localhost:8080/api/oauth',
            'https://stage-123done.herokuapp.com/api/oauth',
          ],
        },
        'https://identity.thunderbird.net/apps/sync': {
          redirectUris: [
            'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel', // Thunderbird
            'net.thunderbird.android://mozilla-accounts-redirect', // Thunderbird for Android (release)
            'net.thunderbird.android.beta://mozilla-accounts-redirect', // Thunderbird for Android (beta)
            'net.thunderbird.android.daily://mozilla-accounts-redirect', // Thunderbird for Android (daily)
            'net.thunderbird.android.debug://mozilla-accounts-redirect', // Thunderbird for Android (development/debug build)
          ],
        },
      },
      doc: 'Validates redirect uris for requested scopes',
      env: 'SCOPED_KEYS_VALIDATION',
      format: Object,
    },
  },
  sentry: {
    dsn: {
      default: '',
      doc: 'Sentry config for reporting errors. If not set, then no errors reported.',
      env: 'SENTRY_DSN',
      format: String,
    },
    env: {
      doc: 'Environment name to report to sentry',
      default: 'local',
      format: ['local', 'ci', 'dev', 'stage', 'prod'],
      env: 'SENTRY_ENV',
    },
    clientName: {
      default: 'fxa-content-client',
    },
    serverName: {
      default: 'fxa-content-server',
    },
    sampleRate: {
      default: 1,
      doc: 'Sentry config for client side errors. If not set, then no errors reported.',
      env: 'SENTRY_SAMPLE_RATE',
      format: Number,
    },
    tracesSampleRate: {
      doc: 'Rate at which sentry traces are captured',
      default: 0,
      format: 'Number',
      env: 'SENTRY_TRACES_SAMPLE_RATE',
    },
  },
  sourceMapType: {
    default: 'source-map',
    doc: 'Type of source maps created. See https://webpack.js.org/configuration/devtool/',
    env: 'SOURCE_MAP_TYPE',
    format: String,
  },
  webpackModeOverride: {
    default: undefined,
    doc: 'Tells webpack how to optimize build. See https://webpack.js.org/configuration/mode/',
    env: 'WEBPACK_MODE_OVERRIDE',
    format: String,
  },
  rolloutRates: {
    keyStretchV2: {
      default: 0,
      doc: 'The rollout rate for key stretching changes. Valid values are from 0 to 1.0',
      env: 'ROLLOUT_KEY_STRETCH_V2',
      format: Number,
    },
    generalizedReactApp: {
      default: 0,
      doc: 'The rollout rate for the generalized react app experiment. Valid values are from 0 to 1.0. Applies to react route groups that are enabled but not set to fullProdRollout',
      env: 'ROLLOUT_GENERALIZED_REACT_APP',
      format: Number,
    },
  },
  statsd: {
    enabled: {
      doc: 'Enable StatsD',
      format: Boolean,
      default: false,
      env: 'METRIC_ENABLED',
    },
    sampleRate: {
      doc: 'Sampling rate for StatsD',
      format: Number,
      default: 1,
      env: 'METRIC_SAMPLE_RATE',
    },
    maxBufferSize: {
      doc: 'StatsD message buffer size in number of characters',
      format: Number,
      default: 500,
      env: 'METRIC_BUFFER_SIZE',
    },
    host: {
      doc: 'StatsD host to report to',
      format: String,
      default: 'localhost',
      env: 'METRIC_HOST',
    },
    port: {
      doc: 'Port number of StatsD server',
      format: Number,
      default: 8125,
      env: 'METRIC_PORT',
    },
    prefix: {
      doc: 'StatsD metrics name prefix for content server',
      format: String,
      default: 'fxa-content.',
      env: 'METRIC_PREFIX',
    },
  },
  proxy_settings: {
    default: false,
    doc: 'Indicates if settings requests should proxy to fxa-settings. This should only be true for local development.',
    env: 'PROXY_SETTINGS',
    format: Boolean,
  },
  static_directory: {
    default: 'dist',
    doc: 'Directory that static files are served from.',
    env: 'STATIC_DIRECTORY',
    format: String,
  },
  static_settings_directory: {
    default: 'prod',
    doc: 'Directory in fxa-settings build folder that contains the target output.',
    env: 'STATIC_SETTINGS_DIRECTORY',
    format: ['dev', 'stage', 'prod'],
  },
  static_max_age: {
    default: '10 minutes',
    doc: 'Cache max age for static assets, in ms',
    env: 'STATIC_MAX_AGE',
    format: 'duration',
  },
  static_resource_url: {
    default: undefined,
    doc: 'The origin of the static resources',
    env: 'STATIC_RESOURCE_URL',
    format: 'url',
  },
  subscriptions: {
    enabled: {
      default: false,
      doc: 'Indicates whether subscriptions APIs are enabled',
      env: 'SUBSCRIPTIONS_ENABLED',
      format: Boolean,
    },
    managementClientId: {
      default: '59cceb6f8c32317c',
      doc: 'OAuth client ID for subscriptions management pages',
      env: 'SUBSCRIPTIONS_MANAGEMENT_CLIENT_ID',
      format: String,
    },
    managementScopes: {
      default: `profile ${OAUTH_SCOPE_SUBSCRIPTIONS}`,
      doc: 'OAuth scopes needed for the subscription management pages to access auth server APIs',
      env: 'SUBSCRIPTIONS_MANAGEMENT_SCOPES',
      format: String,
    },
    managementTokenTTL: {
      default: 1800,
      doc: 'OAuth token time-to-live (in seconds) for subscriptions management pages',
      env: 'SUBSCRIPTIONS_MANAGEMENT_TOKEN_TTL',
      format: 'nat',
    },
    managementUrl: {
      default: 'http://localhost:3031',
      doc: 'The publicly visible URL of the subscription management server',
      env: 'SUBSCRIPTIONS_MANAGEMENT_URL',
      format: String,
    },
    allowUnauthenticatedRedirects: {
      default: true,
      doc: 'Whether to allow any redirects to Payments for an unauthenticated user',
      env: 'SUBSCRIPTIONS_UNAUTHED_REDIRECTS',
      format: Boolean,
    },
    useFirestoreProductConfigs: {
      default: false,
      doc: 'Feature flag on whether to expect Firestore (and not Stripe metadata) based product and plan configurations',
      env: 'SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED',
      format: Boolean,
    },
  },
  sync_tokenserver_url: {
    default: 'http://localhost:8000/token',
    doc: 'The url of the Firefox Sync tokenserver',
    env: 'SYNC_TOKENSERVER_URL',
    format: 'url',
  },
  template_path: {
    default: path.resolve(__dirname, '..', 'templates'),
    doc: 'The location of server-rendered templates',
  },
  tests: {
    coverage: {
      excludeFiles: [
        '/scripts/../tests/',
        '/scripts/vendor/',
        'require_config',
      ],
      globalThreshold: 90,
      threshold: 50,
    },
  },
  use_https: false,
  var_path: {
    default: path.resolve(__dirname, '..', 'var'),
    doc: 'The path where deployment specific resources will be sought (keys, etc), and logs will be kept.',
    env: 'VAR_PATH',
  },
  l10n: {
    baseUrl: {
      default: '/settings/static',
      doc: 'The path (or url) where ftl files are held.',
      env: 'L10N_BASE_URL',
    },
  },
}));

// At the time this file is required, we'll determine the "process name" for this proc
// if we can determine what type of process it is (browserid or verifier) based
// on the path, we'll use that, otherwise we'll name it 'ephemeral'.
conf.set('process_type', path.basename(process.argv[1], '.js'));

// Always send CSP headers in development mode
if (conf.get('env') === 'development') {
  conf.set('csp.enabled', true);
}

const DEV_CONFIG_PATH = path.join(__dirname, '..', 'config', 'local.json');
let files;

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable
if (process.env.CONFIG_FILES && process.env.CONFIG_FILES.trim() !== '') {
  files = process.env.CONFIG_FILES.split(',').filter(fs.existsSync);
} else if (fs.existsSync(DEV_CONFIG_PATH)) {
  files = [DEV_CONFIG_PATH];
}

if (files) {
  conf.loadFile(files);
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = conf.get('env');
}

if (!conf.has('public_url')) {
  conf.set('public_url', 'https://' + conf.get('issuer'));
}

if (!conf.has('static_resource_url')) {
  conf.set('static_resource_url', conf.get('public_url'));
}

// For ops consistency with Browserid, we support HTTP_PROXY
// special handling of HTTP_PROXY env var
if (process.env.HTTP_PROXY) {
  const p = process.env.HTTP_PROXY.split(':');
  conf.set('http_proxy.host', p[0]);
  conf.set('http_proxy.port', p[1]);
}

// But under the covers... OpenID and OAuth libraries need
// HTTP_PROXY_HOST, HTTP_PROXY_PORT, HTTPS_PROXY_HOST and HTTPS_PROXY_PORT
if (conf.has('http_proxy.host')) {
  process.env.HTTP_PROXY_HOST = conf.get('http_proxy.host');
  process.env.HTTPS_PROXY_HOST = conf.get('http_proxy.host');
}

if (conf.has('http_proxy.port')) {
  process.env.HTTP_PROXY_PORT = conf.get('http_proxy.port');
  process.env.HTTPS_PROXY_PORT = conf.get('http_proxy.port');
}

// Setup WebPack bundle path for production
if (conf.get('env') === 'production') {
  conf.set('jsResourcePath', `bundle-${versionInfo.commit}`);
}

// Ensure that supportedLanguages includes defaultLang.
const defaultLang = conf.get('i18n.defaultLang');
const supportedLanguages = conf.get('i18n.supportedLanguages');

if (supportedLanguages.indexOf(defaultLang) === -1) {
  throw new Error(
    'Configuration error: defaultLang (' +
      defaultLang +
      ') is missing from supportedLanguages'
  );
}

// Ensure that static resources have been generated for each languages in the supported language list
// Static resources are generated for each language in the default supported languages list, at least until issue #1434 is fixed
const staticallyGeneratedLanguages = conf.default('i18n.supportedLanguages');
const missingLangs = [];
supportedLanguages.forEach(function (l) {
  if (staticallyGeneratedLanguages.indexOf(l) === -1) {
    missingLangs.push(l);
  }
});
if (missingLangs.length) {
  throw new Error(
    'Configuration error: (' +
      missingLangs.join(', ') +
      ') is missing from the default list of supportedLanguages'
  );
}

const areDistResources = conf.get('static_directory') === 'dist';
conf.set('are_dist_resources', areDistResources);

// TODO: convict 6+ doesn't like the schema definition we've got
// for `scopedKeys.validation`. It doesn't cause runtime problems
// but fails validation. We should change it to pass validation.

// const options = {
//   strict: true,
// };

// validate the configuration based on the above specification
// conf.validate(options);
