/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint-disable camelcase */
var convict = require('convict');
var fs = require('fs');
var path = require('path');

var conf = module.exports = convict({
  port: {
    doc: 'HTTPS port for local dev',
    format: 'port',
    default: 3030,
    env: 'PORT'
  },
  http_port: {
    doc: 'HTTP port for local dev',
    format: 'port',
    default: 3080,
    env: 'HTTP_PORT'
  },
  redirect_port: {
    doc: 'Redirect port for HTTPS',
    format: 'port',
    default: 80,
    env: 'REDIRECT_PORT'
  },
  cachify_prefix: {
    doc: 'The prefix for cachify hashes in URLs',
    default: 'v'
  },
  client_sessions: {
    cookie_name: 'session',
    secret: 'YOU MUST CHANGE ME',
    duration: {
      format: 'duration',
      default: '1 day'
    }
  },
  disable_locale_check: {
    doc: 'Skip checking for gettext .mo files for supported locales',
    default: false
  },
  env: {
    doc: 'What environment are we running in?  Note: all hosted environments are \'production\'.',
    format: ['production', 'development'],
    default: 'production',
    env: 'NODE_ENV'
  },
  http_proxy: {
    port: {
      format: 'port',
      default: undefined
    },
    host: {
      format: String,
      default: undefined
    }
  },
  public_url: {
    doc: 'The publically visible URL of the deployment',
    default: 'http://127.0.0.1:3030',
    env: 'PUBLIC_URL'
  },
  process_type: 'ephemeral',
  statsd: {
    enabled: {
      doc: 'enable UDP based statsd reporting',
      default: true,
      env: 'ENABLE_STATSD'
    },
    host: 'localhost',
    port: {
      format: 'port',
      default: 8125
    },
    sample_rate: 1
  },
  sentry: {
    endpoint: {
      doc: 'Remote Sentry endpoint',
      format: String,
      default: undefined
    },
    api_key: {
      doc: 'Sentry API key',
      format: String,
      default: undefined
    }
  },
  google_analytics_id: {
    doc: 'Google Analytics id',
    format: String,
    default: undefined
  },
  logging: {
    app: {
      default: 'fxa-content-server'
    },
    level: {
      env: 'LOG_LEVEL',
      default: 'info'
    },
    fmt: {
      format: ['heka', 'pretty'],
      default: 'heka'
    }
  },
  route_log_format: {
    format: [ 'default_fxa', 'dev_fxa', 'default', 'dev', 'short', 'tiny' ],
    default: 'default_fxa'
  },
  disable_route_logging: {
    doc: 'Disable route logging completely. Useful for trimming travis logs.',
    default: false,
    env: 'DISABLE_ROUTE_LOGGING'
  },
  use_https: false,
  var_path: {
    doc: 'The path where deployment specific resources will be sought (keys, etc), and logs will be kept.',
    default: path.resolve(__dirname, '..', 'var'),
    env: 'VAR_PATH'
  },
  fxaccount_url: {
    doc: 'The url of the Firefox Account server',
    format: 'url',
    default: 'http://127.0.0.1:9000',
    env: 'FXA_URL'
  },
  oauth_url: {
    doc: 'The url of the Firefox Account OAuth server',
    format: 'url',
    default: 'https://oauth.dev.lcip.org',
    env: 'FXA_OAUTH_URL'
  },
  profile_url: {
    doc: 'The url of the Firefox Account Profile Server',
    format: 'url',
    default: 'http://127.0.0.1:1111',
    env: 'FXA_PROFILE_URL'
  },
  profile_images_url: {
    doc: 'The url of the Firefox Account Profile Image Server',
    format: 'url',
    default: 'http://127.0.0.1:1112',
    env: 'FXA_PROFILE_IMAGES_URL'
  },
  oauth_client_id: {
    doc: 'The client_id of the content server',
    format: String,
    default: 'ea3ca969f8c6bb0d',
    env: 'FXA_OAUTH_CLIENT_ID'
  },
  allowed_parent_origins: {
    doc: 'Origins that are allowed to embed the FxA within an IFRAME',
    format: Array,
    default: []
  },
  are_dist_resources: {
    doc: 'Check if the resources are under the /dist directory',
    format: Boolean,
    default: false
  },
  static_directory: {
    doc: 'Directory that static files are served from.',
    format: String,
    default: 'app'
  },
  static_max_age: {
    doc: 'Cache max age for static assets, in ms',
    format: Number,
    default: 10 * 60 * 1000 // 10 minutes
  },
  hsts_max_age: {
    doc: 'Max age of the STS directive',
    format: 'duration',
    default: '180 days'
  },
  template_path: {
    doc: 'The location of server-rendered templates',
    default: path.resolve(__dirname, '..', 'templates')
  },
  page_template_root: {
    doc: 'The root path of server-rendered page templates',
    default: path.resolve(__dirname, '..', 'templates', 'pages')
  },
  page_template_subdirectory: {
    doc: 'Subdirectory of page_template_root for server-rendered page templates',
    format: ['src', 'dist'],
    default: 'src'
  },
  tests: {
    coverage: {
      globalThreshold: 90,
      threshold: 50,
      excludeFiles: ['/scripts/../tests/', '/scripts/vendor/', '/scripts/../bower_components/', 'require_config']
    }
  },
  i18n: {
    defaultLang: {
      format: String,
      default: 'en'
    },
    debugLang: {
      format: String,
      default: 'it-CH'
    },
    defaultLegalLang: {
      doc: 'The default langauge to use for legal (tos, pp) templates',
      format: String,
      default: 'en-US'
    },
    supportedLanguages: {
      doc: 'List of languages this deployment should detect and display localized strings.',
      format: Array,
      // the big list of locales is specified so the production build script
      // can build all the locales before config/production.json is written.
      default: [
        'af', 'an', 'ar', 'as', 'ast', 'az', 'be', 'bg', 'bn-BD', 'bn-IN', 'br',
        'bs', 'ca', 'cs', 'cy', 'da', 'de', 'dsb', 'el', 'en', 'en-GB', 'en-ZA',
        'eo', 'es', 'es-AR', 'es-CL', 'es-MX', 'et', 'eu', 'fa', 'ff', 'fi',
        'fr', 'fy', 'fy-NL', 'ga', 'ga-IE', 'gd', 'gl', 'gu', 'gu-IN', 'he',
        'hi-IN', 'hr', 'hsb', 'ht', 'hu', 'hy-AM', 'id', 'is', 'it', 'it-CH', 'ja',
        'kk', 'km', 'kn', 'ko', 'ku', 'lij', 'lt', 'lv', 'mai', 'mk', 'ml',
        'mr', 'ms', 'nb-NO', 'ne-NP', 'nl', 'nn-NO', 'or', 'pa', 'pa-IN',
        'pl', 'pt', 'pt-BR', 'pt-PT', 'rm', 'ro', 'ru', 'si', 'sk', 'sl',
        'son', 'sq', 'sr', 'sr-LATN', 'sv', 'sv-SE', 'ta', 'te', 'th', 'tr',
        'uk', 'ur', 'vi', 'xh', 'zh-CN', 'zh-TW', 'zu'
      ],
      env: 'I18N_SUPPORTED_LANGUAGES'
    },
    translationDirectory: {
      doc: 'The directory where per-locale .json files containing translations reside',
      format: String,
      default: 'app/i18n/',
      env: 'I18N_TRANSLATION_DIR'
    },
    translationType: {
      doc: 'The file format used for the translations',
      format: String,
      default: 'key-value-json',
      env: 'I18N_TRANSLATION_TYPE'
    },
    fonts: {
      unsupportedLanguages: {
        doc: 'These languages should use system fonts instead of Fira Sans',
        format: Array,
        default: [
          'an', 'ar', 'as', 'ast', 'bn-DB', 'bn-IN', 'fa', 'ff', 'gd',
          'gu', 'gu-IN', 'he', 'hi-IN', 'ht', 'hy-AM', 'ja', 'km', 'kn', 'ko', 'lij',
          'mai', 'ml', 'mr', 'ne-NP', 'or', 'pa', 'pa-IN', 'si', 'son', 'ta', 'te',
          'th', 'ur', 'vi', 'zh-CN', 'zh-TW'
        ]
      }
    }
  },
  key_path: {
    doc: 'The location of the SSL key in pem format',
    default: path.resolve(__dirname, '..', '..', 'key.pem')
  },
  cert_path: {
    doc: 'The location of the SSL certificate in pem format',
    default: path.resolve(__dirname, '..', '..', 'cert.pem')
  },
  experiments: {
    dir: {
      doc: 'path to where experiments are stored',
      default: path.resolve(__dirname, '..', '..', 'experiments')
    },
    git: {
      doc: 'git url for experiments repo. set to empty to not pull',
      default: 'github:mozilla/fxa-content-experiments#dev'
    },
    watch: {
      doc: 'poll the experiments git repo for changes',
      default: false
    }
  },
  csp: {
    enabled: {
      doc: 'Send "Content-Security-Policy" header',
      default: false, // but true in development
    },
    reportOnly: {
      doc: 'Only send the "Content-Security-Policy-Report-Only" header',
      default: false,
    },
    reportUri: {
      doc: 'Location of "report-uri"',
      default: '/_/csp-violation',
    }
  },
  basket: {
    proxy_url: {
      doc: 'Url for the Basket proxy server',
      format: String,
      default: 'http://127.0.0.1:1114'
    },
    api_url: {
      doc: 'Url for the Basket API server',
      format: String,
      default: 'http://127.0.0.1:10140'
    },
    api_key: {
      doc: 'Basket API key',
      format: String,
      default: 'test key please change'
    }
  },
  marketing_email: {
    api_url: {
      doc: 'User facing URL of the Marketing Email Server',
      format: 'url',
      default: 'http://127.0.0.1:1114',
      env: 'FXA_MARKETING_EMAIL_API_URL'
    },
    preferences_url: {
      doc: 'User facing URL where a user can manage their email preferences',
      format: 'url',
      default: 'https://www-dev.allizom.org/newsletter/existing/',
      env: 'FXA_MARKETING_EMAIL_PREFERENCES_URL'
    }
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

var DEV_CONFIG_PATH = path.join(__dirname, '..', 'config', 'local.json');
var files;

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable
if (process.env.CONFIG_FILES && process.env.CONFIG_FILES.trim() !== '') {
  files = process.env.CONFIG_FILES.split(',');
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


// For ops consistency with Browserid, we support HTTP_PROXY
// special handling of HTTP_PROXY env var
if (process.env.HTTP_PROXY) {
  var p = process.env.HTTP_PROXY.split(':');
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
var defaultLang = conf.get('i18n.defaultLang');
var supportedLanguages = conf.get('i18n.supportedLanguages');

if (supportedLanguages.indexOf(defaultLang) === -1) {
  throw new Error('Configuration error: defaultLang (' + defaultLang + ') is missing from supportedLanguages');
}

// Ensure that static resources have been generated for each languages in the supported language list
// Static resources are generated for each language in the default supported languages list, at least until issue #1434 is fixed
var staticallyGeneratedLanguages = conf.default('i18n.supportedLanguages');
var missingLangs = [];
supportedLanguages.forEach(function (l) {
  if (staticallyGeneratedLanguages.indexOf(l) === -1) {
    missingLangs.push(l);
  }
});
if (missingLangs.length) {
  throw new Error('Configuration error: (' + missingLangs.join(', ') + ') is missing from the default list of supportedLanguages');
}

var areDistResources = conf.get('static_directory') === 'dist';
conf.set('are_dist_resources', areDistResources);
var options = {
  strict: true
};

// validate the configuration based on the above specification
conf.validate(options);

