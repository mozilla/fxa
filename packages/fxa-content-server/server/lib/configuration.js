/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint-disable camelcase */
'use strict';
const convict = require('convict');
const fs = require('fs');
const path = require('path');

const versionInfo = require('./version');

const DEFAULT_SUPPORTED_LANGUAGES = require('fxa-shared').l10n
  .supportedLanguages;

const conf = (module.exports = convict({
  allowed_iframe_contexts: {
    default: [],
    doc:
      'DEPRECATED - context query parameters allowed to embed FxA within an IFRAME',
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
  },
  are_dist_resources: {
    default: false,
    doc: 'Check if the resources are under the /dist directory',
    format: Boolean,
  },
  basket: {
    api_key: {
      default: 'test key please change',
      doc: 'DEPRECATED - Basket API key',
      format: String,
    },
    api_timeout: {
      default: '5 seconds',
      doc: 'DEPRECATED - Timeout for talking to the Basket API server, in ms',
      format: Number,
    },
    api_url: {
      default: 'http://127.0.0.1:10140',
      doc: 'DEPRECATED - Url for the Basket API server',
      format: String,
    },
    email_preferences_url: {
      default: 'https://basket.allizom.org/fxa/',
      doc: 'DEPRECATED - Url for the Basket proxy server',
      format: String,
    },
    proxy_url: {
      default: 'http://127.0.0.1:1114',
      doc: 'DEPRECATED - Url for the Basket proxy server',
      format: String,
    },
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
    /*eslint-disable sorting/sort-object-props*/
    reportUri: {
      default: '/_/csp-violation',
      doc: 'Location of "report-uri" for full, blocking CSP rules',
      env: 'CSP_REPORT_URI',
    },
    reportOnly: {
      default: false,
      doc:
        'DEPRECATED - Only send the "Content-Security-Policy-Report-Only" header',
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
    /*eslint-enable sorting/sort-object-props*/
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
    doc:
      "What environment are we running in?  Note: all hosted environments are 'production'.",
    env: 'NODE_ENV',
    format: ['production', 'development'],
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
        default: '127.0.0.1',
        doc: 'Redis host name or IP address',
        env: 'FEATURE_FLAGS_REDIS_HOST',
        format: String,
      },
      initialBackoff: {
        default: '100 milliseconds',
        doc:
          'Initial backoff for feature-flagging Redis connection retries, increases exponentially with each attempt',
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
    default: 'http://127.0.0.1:9000',
    doc: 'The url of the Firefox Account auth server',
    env: 'FXA_URL',
    format: 'url',
  },
  geodb: {
    dbPath: {
      default: path.resolve(
        __dirname,
        '../../node_modules/fxa-geodb/db/cities-db.mmdb'
      ),
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
    default: 15552000, // 180 days
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
    defaultLegalLang: {
      default: 'en-US',
      doc: 'The default language to use for legal (tos, pp) templates',
      format: String,
    },
    fonts: {
      unsupportedLanguages: {
        default: [],
        doc:
          'DEPRECATED: These languages should use system fonts instead of Fira Sans',
        format: Array,
      },
    },
    localeSubdirSuffix: {
      default: '',
      doc:
        'Enable alternative localized resources for Mozilla Online with private use subtag',
      env: 'I18N_LOCALE_SUBDIR_SUFFIX',
      format: ['', '_x_mococn'],
    },
    supportedLanguages: {
      default: DEFAULT_SUPPORTED_LANGUAGES,
      doc:
        'List of languages this deployment should detect and display localized strings.',
      env: 'I18N_SUPPORTED_LANGUAGES',
      format: Array,
    },
    translationDirectory: {
      default: 'app/i18n/',
      doc:
        'The directory where per-locale .json files containing translations reside',
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
    api_url: {
      default: 'http://127.0.0.1:1114',
      doc: 'DEPRECATED - User facing URL of the Marketing Email Server',
      env: 'FXA_MARKETING_EMAIL_API_URL',
      format: 'url',
    },
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
  oauth_client_id: {
    default: 'ea3ca969f8c6bb0d',
    doc: 'The client_id of the content server',
    env: 'FXA_OAUTH_CLIENT_ID',
    format: String,
  },
  oauth_client_id_map: {
    default: {},
    doc:
      'Mappings from client id to service name: { "id1": "name-1", "id2": "name-2" }',
    env: 'OAUTH_CLIENT_IDS',
    format: Object,
  },
  oauth_url: {
    default: 'http://127.0.0.1:9010',
    doc: 'The url of the Firefox Account OAuth server',
    env: 'FXA_OAUTH_URL',
    format: 'url',
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
    default: 'src',
    doc:
      'Subdirectory of page_template_root for server-rendered page templates',
    env: 'PAGE_TEMPLATE_SUBDIRECTORY',
    format: ['src', 'dist'],
  },
  pairing: {
    clients: {
      default: [
        '3c49430b43dfba77', // Reference browser
        'a2270f727f45f648', // Fenix
      ],
      doc:
        'OAuth Client IDs that are allowed to pair. Remove all clients from this list to disable pairing.',
      env: 'PAIRING_CLIENTS',
      format: Array,
    },
    server_base_uri: {
      default: 'wss://dev.channelserver.nonprod.cloudops.mozgcp.net',
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
    default: 'http://127.0.0.1:1112',
    doc: 'The url of the Firefox Account Profile Image Server',
    env: 'FXA_PROFILE_IMAGES_URL',
    format: 'url',
  },
  profile_url: {
    default: 'http://127.0.0.1:1111',
    doc: 'The url of the Firefox Account Profile Server',
    env: 'FXA_PROFILE_URL',
    format: 'url',
  },
  public_url: {
    default: 'http://127.0.0.1:3030',
    doc: 'The publically visible URL of the deployment',
    env: 'PUBLIC_URL',
  },
  redirect_port: {
    default: 80,
    doc: 'Redirect port for HTTPS',
    env: 'REDIRECT_PORT',
    format: 'port',
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
            'urn:ietf:wg:oauth:2.0:oob:pair-auth-webchannel',
          ],
        },
        'https://identity.mozilla.com/apps/send': {
          redirectUris: [
            'https://send.firefox.com/oauth',
            'https://send.firefox.com/fxa/android-redirect.html',
            'https://send2.dev.lcip.org/oauth',
          ],
        },
      },
      doc: 'Validates redirect uris for requested scopes',
      env: 'SCOPED_KEYS_VALIDATION',
      format: Object,
    },
  },
  sentry: {
    api_key: {
      default: undefined,
      doc: 'Sentry API key',
      env: 'SENTRY_API_KEY',
      format: String,
    },
    api_secret: {
      default: undefined,
      doc: 'Sentry API secret',
      env: 'SENTRY_API_SECRET',
      format: String,
    },
    endpoint: {
      default: undefined,
      doc: 'Remote Sentry endpoint',
      env: 'SENTRY_ENDPOINT',
      format: String,
    },
    server_errors_dsn: {
      default: undefined,
      doc:
        'Sentry config for Express server-side errors. If not set, then no errors reported.',
      env: 'SENTRY_SERVER_ERRORS_DSN',
      format: String,
    },
  },
  sms: {
    redirect: {
      channels: {
        beta: {
          default: 'c71cw4',
          doc: 'Adjust Firefox beta channel app ID',
          env: 'SMS_ADJUST_BETA_CHANNEL_APP_ID',
          format: String,
        },
        nightly: {
          default: '8jy086',
          doc: 'Adjust Firefox nightly channel app ID',
          env: 'SMS_ADJUST_NIGHTLY_CHANNEL_APP_ID',
          format: String,
        },
        release: {
          default: '2uo1qc',
          doc: 'Adjust Firefox release channel app ID',
          env: 'SMS_ADJUST_RELEASE_CHANNEL_APP_ID',
          format: String,
        },
      },
      targetURITemplate: {
        default:
          'https://app.adjust.com/${ channel }?campaign=fxa-conf-page&adgroup=sms&creative=link&deep_link=firefox%3A%2F%2Ffxa-signin%3Futm_source%3Dsms%26signin%3D${ signinCode }', //eslint-disable-line max-len
        doc:
          'Redirect URI - ES6 format template string. The variables `channel` and `signinCode` are interpolated',
        env: 'SMS_REDIRECT_TARGET_URI_TEMPLATE',
        format: String,
      },
    },
  },
  sourceMapType: {
    default: 'source-map',
    doc:
      'Type of source maps created. See https://webpack.js.org/configuration/devtool/',
    env: 'SOURCE_MAP_TYPE',
    format: String,
  },
  static_directory: {
    default: 'app',
    doc: 'Directory that static files are served from.',
    env: 'STATIC_DIRECTORY',
    format: String,
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
    allowedLanguages: {
      default: ['en'],
      doc: 'Which languages are allowed to access subscription features?',
      env: 'SUBSCRIPTIONS_ALLOWED_LANGUAGES',
      format: Array,
    },
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
      default: 'profile https://identity.mozilla.com/account/subscriptions',
      doc:
        'OAuth scopes needed for the subscription management pages to access auth server APIs',
      env: 'SUBSCRIPTIONS_MANAGEMENT_SCOPES',
      format: String,
    },
    managementTokenTTL: {
      default: 900,
      doc:
        'OAuth token time-to-live (in seconds) for subscriptions management pages',
      env: 'SUBSCRIPTIONS_MANAGEMENT_TOKEN_TTL',
      format: 'nat',
    },
    managementUrl: {
      default: 'http://127.0.0.1:3031',
      doc: 'The publicly visible URL of the subscription management server',
      env: 'SUBSCRIPTIONS_MANAGEMENT_URL',
      format: String,
    },
  },
  sync_tokenserver_url: {
    default: 'http://127.0.0.1:5000/token',
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
    doc:
      'The path where deployment specific resources will be sought (keys, etc), and logs will be kept.',
    env: 'VAR_PATH',
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
supportedLanguages.forEach(function(l) {
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
const options = {
  strict: true,
};

// validate the configuration based on the above specification
conf.validate(options);
