/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint-disable camelcase */
'use strict';
const convict = require('convict');
const fs = require('fs');
const path = require('path');

const DEFAULT_SUPPORTED_LANGUAGES = require('fxa-shared').l10n.supportedLanguages;

const conf = module.exports = convict({
  allowed_iframe_contexts: {
    default: ['fx_firstrun_v2', 'iframe'],
    doc: 'context query parameters allowed to embed FxA within an IFRAME',
    format: Array
  },
  allowed_parent_origins: {
    default: [],
    doc: 'Origins that are allowed to embed FxA within an IFRAME',
    env: 'ALLOWED_PARENT_ORIGINS',
    format: Array
  },
  are_dist_resources: {
    default: false,
    doc: 'Check if the resources are under the /dist directory',
    format: Boolean
  },
  babel: {
    enabled: {
      default: true,
      doc: 'Convert ES2015 to ES5. Production builds do not use this setting',
      format: Boolean
    }
  },
  basket: {
    api_key: {
      default: 'test key please change',
      doc: 'Basket API key',
      format: String
    },
    api_timeout: {
      default: '5 seconds',
      doc: 'Timeout for talking to the Basket API server, in ms',
      format: Number
    },
    api_url: {
      default: 'http://127.0.0.1:10140',
      doc: 'Url for the Basket API server',
      format: String
    },
    proxy_url: {
      default: 'http://127.0.0.1:1114',
      doc: 'Url for the Basket proxy server',
      format: String
    }
  },
  cachify_prefix: {
    default: 'v',
    doc: 'The prefix for cachify hashes in URLs'
  },
  cert_path: {
    default: path.resolve(__dirname, '..', '..', 'cert.pem'),
    doc: 'The location of the SSL certificate in pem format'
  },
  clientAddressDepth: {
    default: 3,
    doc: 'location of the client ip address in the remote address chain',
    env: 'CLIENT_ADDRESS_DEPTH',
    format: Number
  },
  client_metrics: {
    stderr_collector_disabled: {
      default: false,
      doc: 'disable client metrics output to stderr',
      env: 'DISABLE_CLIENT_METRICS_STDERR'
    }
  },
  client_sessions: {
    cookie_name: 'session',
    duration: {
      default: '1 day',
      format: 'duration'
    },
    secret: 'YOU MUST CHANGE ME'
  },
  csp: {
    enabled: {
      default: false,
      doc: 'Send "Content-Security-Policy" header',
      env: 'CSP_ENABLED'
    },
    /*eslint-disable sorting/sort-object-props*/
    reportUri: {
      default: '/_/csp-violation',
      doc: 'Location of "report-uri" for full, blocking CSP rules',
      env: 'CSP_REPORT_URI'
    },
    reportOnly: {
      default: false,
      doc: 'DEPRECATED - Only send the "Content-Security-Policy-Report-Only" header',
      env: 'CSP_REPORT_ONLY'
    },
    reportOnlyEnabled: {
      default: false,
      doc: 'Send "Content-Security-Policy-Report-Only" header',
      env: 'CSP_REPORT_ONLY_ENABLED'
    },
    reportOnlyUri: {
      default: '/_/csp-violation-report-only',
      doc: 'Location of "report-uri" for report-only CSP rules',
      env: 'CSP_REPORT_ONLY_URI'
    }
    /*eslint-enable sorting/sort-object-props*/
  },
  disable_locale_check: {
    default: false,
    doc: 'Skip checking for gettext .mo files for supported locales'
  },
  disable_route_logging: {
    default: false,
    doc: 'Disable route logging completely. Useful for trimming travis logs.',
    env: 'DISABLE_ROUTE_LOGGING'
  },
  env: {
    default: 'production',
    doc: 'What environment are we running in?  Note: all hosted environments are \'production\'.',
    env: 'NODE_ENV',
    format: [
      'production',
      'development'
    ]
  },
  flow_id_expiry: {
    default: '2 hours',
    doc: 'Time after which flow ids are considered stale',
    env: 'FLOW_ID_EXPIRY',
    format: 'duration'
  },
  flow_id_key: {
    default: 'YOU MUST CHANGE ME',
    doc: 'HMAC key used to verify flow event data',
    env: 'FLOW_ID_KEY',
    format: String
  },
  fxa_client_configuration: {
    max_age: {
      default: '1 day',
      doc: 'Cache max age for /.well-known/fxa-client-configuration, in ms',
      format: 'duration'
    }
  },
  fxaccount_url: {
    default: 'http://127.0.0.1:9000',
    doc: 'The url of the Firefox Account auth server',
    env: 'FXA_URL',
    format: 'url'
  },
  google_analytics_id: {
    default: undefined,
    doc: 'Google Analytics id',
    env: 'GOOGLE_ANALYTICS_ID',
    format: String
  },
  hpkp: {
    enabled: {
      default: false,
      doc: 'Feature flag for appending HPKP headers',
      env: 'HPKP_ENABLE',
      format: Boolean
    },
    includeSubDomains: {
      default: true,
      doc: 'Include Sub-Domains',
      env: 'HPKP_INCLUDE_SUBDOMAINS',
      format: Boolean
    },
    maxAge: {
      default: 1,
      doc: 'Max age for HPKP headers (seconds)',
      env: 'HPKP_MAX_AGE',
      format: Number
    },
    reportOnly: {
      default: true,
      doc: 'Enable report only mode',
      env: 'HPKP_REPORT_ONLY',
      format: Boolean
    },
    reportUri: {
      default: '',
      doc: 'Enable report only mode',
      env: 'HPKP_REPORT_URI',
      format: String
    },
    sha256s: {
      default: [],
      doc: 'Supported pin-sha256s (at least two shas required)',
      env: 'HPKP_PIN_SHA256',
      format: Array
    }
  },
  hsts_max_age: {
    default: 15552000, // 180 days
    doc: 'Max age of the STS directive in seconds',
    // Note: This format is a number because the value needs to be in seconds
    format: Number
  },
  http_port: {
    default: 3080,
    doc: 'HTTP port for local dev',
    env: 'HTTP_PORT',
    format: 'port'
  },
  http_proxy: {
    host: {
      default: undefined,
      format: String
    },
    port: {
      default: undefined,
      format: 'port'
    }
  },
  i18n: {
    debugLang: {
      default: 'it-CH',
      format: String
    },
    defaultLang: {
      default: 'en',
      format: String
    },
    defaultLegalLang: {
      default: 'en-US',
      doc: 'The default langauge to use for legal (tos, pp) templates',
      format: String
    },
    fonts: {
      unsupportedLanguages: {
        default: [
          'an',
          'ar',
          'as',
          'ast',
          'bn-DB',
          'bn-IN',
          'fa',
          'ff',
          'gd',
          'gu',
          'gu-IN',
          'he',
          'hi-IN',
          'ht',
          'hy-AM',
          'ja',
          'km',
          'kn',
          'ko',
          'lij',
          'mai',
          'ml',
          'mr',
          'ne-NP',
          'or',
          'pa',
          'pa-IN',
          'si',
          'son',
          'ta',
          'te',
          'th',
          'ur',
          'vi',
          'zh-CN',
          'zh-TW'
        ],
        doc: 'These languages should use system fonts instead of Fira Sans',
        format: Array
      }
    },
    supportedLanguages: {
      default: DEFAULT_SUPPORTED_LANGUAGES,
      doc: 'List of languages this deployment should detect and display localized strings.',
      env: 'I18N_SUPPORTED_LANGUAGES',
      format: Array
    },
    translationDirectory: {
      default: 'app/i18n/',
      doc: 'The directory where per-locale .json files containing translations reside',
      env: 'I18N_TRANSLATION_DIR',
      format: String
    },
    translationType: {
      default: 'key-value-json',
      doc: 'The file format used for the translations',
      env: 'I18N_TRANSLATION_TYPE',
      format: String
    }
  },
  key_path: {
    default: path.resolve(__dirname, '..', '..', 'key.pem'),
    doc: 'The location of the SSL key in pem format'
  },
  logging: {
    app: { default: 'fxa-content-server' },
    fmt: {
      default: 'heka',
      format: [
        'heka',
        'pretty'
      ]
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL'
    }
  },
  marketing_email: {
    api_url: {
      default: 'http://127.0.0.1:1114',
      doc: 'User facing URL of the Marketing Email Server',
      env: 'FXA_MARKETING_EMAIL_API_URL',
      format: 'url'
    },
    preferences_url: {
      default: 'https://www-dev.allizom.org/newsletter/existing/',
      doc: 'User facing URL where a user can manage their email preferences',
      env: 'FXA_MARKETING_EMAIL_PREFERENCES_URL',
      format: 'url'
    }
  },
  oauth_client_id: {
    default: 'ea3ca969f8c6bb0d',
    doc: 'The client_id of the content server',
    env: 'FXA_OAUTH_CLIENT_ID',
    format: String
  },
  oauth_url: {
    default: 'http://127.0.0.1:9010',
    doc: 'The url of the Firefox Account OAuth server',
    env: 'FXA_OAUTH_URL',
    format: 'url'
  },
  openid_configuration: {
    claims_supported: [
      'aud',
      'exp',
      'iat',
      'iss',
      'sub'
    ],
    id_token_signing_alg_values_supported: ['RS256'],
    response_types_supported: ['code', 'token'],
    scopes_supported: ['openid', 'profile', 'email'],
    subject_types_supported: ['public'],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
  },
  page_template_root: {
    default: path.resolve(__dirname, '..', 'templates', 'pages'),
    doc: 'The root path of server-rendered page templates'
  },
  page_template_subdirectory: {
    default: 'src',
    doc: 'Subdirectory of page_template_root for server-rendered page templates',
    env: 'PAGE_TEMPLATE_SUBDIRECTORY',
    format: [
      'src',
      'dist'
    ]
  },
  port: {
    default: 3030,
    doc: 'HTTPS port for local dev',
    env: 'PORT',
    format: 'port'
  },
  process_type: 'ephemeral',
  profile_images_url: {
    default: 'http://127.0.0.1:1112',
    doc: 'The url of the Firefox Account Profile Image Server',
    env: 'FXA_PROFILE_IMAGES_URL',
    format: 'url'
  },
  profile_url: {
    default: 'http://127.0.0.1:1111',
    doc: 'The url of the Firefox Account Profile Server',
    env: 'FXA_PROFILE_URL',
    format: 'url'
  },
  public_url: {
    default: 'http://127.0.0.1:3030',
    doc: 'The publically visible URL of the deployment',
    env: 'PUBLIC_URL'
  },
  redirect_port: {
    default: 80,
    doc: 'Redirect port for HTTPS',
    env: 'REDIRECT_PORT',
    format: 'port'
  },
  route_log_format: {
    default: 'default_fxa',
    format: [
      'default_fxa',
      'dev_fxa',
      'default',
      'dev',
      'short',
      'tiny'
    ]
  },
  sentry: {
    api_key: {
      default: undefined,
      doc: 'Sentry API key',
      env: 'SENTRY_API_KEY',
      format: String
    },
    api_secret: {
      default: undefined,
      doc: 'Sentry API secret',
      env: 'SENTRY_API_SECRET',
      format: String
    },
    endpoint: {
      default: undefined,
      doc: 'Remote Sentry endpoint',
      env: 'SENTRY_ENDPOINT',
      format: String
    },
    server_errors_dsn: {
      default: undefined,
      doc: 'Sentry config for Express server-side errors. If not set, then no errors reported.',
      env: 'SENTRY_SERVER_ERRORS_DSN',
      format: String
    }
  },
  sms: {
    redirect: {
      channels: {
        beta: {
          default: 'c71cw4',
          doc: 'Adjust Firefox beta channel app ID',
          env: 'SMS_ADJUST_BETA_CHANNEL_APP_ID',
          format: String
        },
        nightly: {
          default: '8jy086',
          doc: 'Adjust Firefox nightly channel app ID',
          env: 'SMS_ADJUST_NIGHTLY_CHANNEL_APP_ID',
          format: String
        },
        release: {
          default: '2uo1qc',
          doc: 'Adjust Firefox release channel app ID',
          env: 'SMS_ADJUST_RELEASE_CHANNEL_APP_ID',
          format: String
        }
      },
      targetURITemplate: {
        default: 'https://app.adjust.com/${ channel }?campaign=fxa-conf-page&adgroup=sms&creative=link&deep_link=firefox%3A%2F%2Ffxa-signin%3Futm_source%3Dsms%26signin%3D${ signinCode }', //eslint-disable-line max-len
        doc: 'Redirect URI - ES6 format template string. The variables `channel` and `signinCode` are interpolated',
        env: 'SMS_REDIRECT_TARGET_URI_TEMPLATE',
        format: String
      }
    }
  },
  static_directory: {
    default: 'app',
    doc: 'Directory that static files are served from.',
    env: 'STATIC_DIRECTORY',
    format: String
  },
  static_max_age: {
    default: '10 minutes',
    doc: 'Cache max age for static assets, in ms',
    env: 'STATIC_MAX_AGE',
    format: Number
  },
  static_resource_url: {
    default: undefined,
    doc: 'The origin of the static resources',
    env: 'STATIC_RESOURCE_URL',
    format: 'url'
  },
  statsd: {
    enabled: {
      default: true,
      doc: 'enable UDP based statsd reporting',
      env: 'ENABLE_STATSD'
    },
    host: 'localhost',
    port: {
      default: 8125,
      format: 'port'
    },
    sample_rate: 1
  },
  sync_tokenserver_url: {
    default: 'http://127.0.0.1:5000/token',
    doc: 'The url of the Firefox Sync tokenserver',
    env: 'SYNC_TOKENSERVER_URL',
    format: 'url'
  },
  template_path: {
    default: path.resolve(__dirname, '..', 'templates'),
    doc: 'The location of server-rendered templates'
  },
  tests: {
    coverage: {
      excludeFiles: [
        '/scripts/../tests/',
        '/scripts/vendor/',
        '/scripts/../bower_components/',
        'require_config'
      ],
      globalThreshold: 90,
      threshold: 50
    }
  },
  use_https: false,
  var_path: {
    default: path.resolve(__dirname, '..', 'var'),
    doc: 'The path where deployment specific resources will be sought (keys, etc), and logs will be kept.',
    env: 'VAR_PATH'
  }
});

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
  files = [ DEV_CONFIG_PATH ];
}

if (files) {
  conf.loadFile(files);
}

if (! process.env.NODE_ENV) {
  process.env.NODE_ENV = conf.get('env');
}

if (! conf.has('public_url')) {
  conf.set('public_url', 'https://' + conf.get('issuer'));
}

if (! conf.has('static_resource_url')) {
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

// Ensure that supportedLanguages includes defaultLang.
const defaultLang = conf.get('i18n.defaultLang');
const supportedLanguages = conf.get('i18n.supportedLanguages');

if (supportedLanguages.indexOf(defaultLang) === -1) {
  throw new Error('Configuration error: defaultLang (' + defaultLang + ') is missing from supportedLanguages');
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
  throw new Error('Configuration error: (' + missingLangs.join(', ') + ') is missing from the default list of supportedLanguages');
}

const areDistResources = conf.get('static_directory') === 'dist';
conf.set('are_dist_resources', areDistResources);
const options = {
  strict: true
};

// validate the configuration based on the above specification
conf.validate(options);
