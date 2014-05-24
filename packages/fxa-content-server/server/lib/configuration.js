/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    doc: 'Max age of the STS directive, in seconds',
    format: Number,
    default: 180 * 24 * 60 * 60            // 180 days
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
      // Ignore oauth scripts until tests are enabled (issue #1141)
      excludeFiles: ['/scripts/../tests/','/scripts/vendor/','oauth']
    }
  },
  i18n: {
    defaultLang: {
      format: String,
      default: 'en-US'
    },
    debugLang: {
      format: String,
      default: 'it-CH'
    },
    supportedLanguages: {
      doc: 'List of languages this deployment should detect and display localized strings.',
      format: Array,
      // the big list of locales is specified so the production build script
      // can build all the locales before config/production.json is written.
      default: ['af', 'an', 'ar', 'as', 'ast', 'be', 'bg', 'bn-BD', 'bn-IN', 'br',
          'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'en-GB', 'en-US', 'en-ZA',
          'eo', 'es', 'es-AR', 'es-CL', 'es-MX', 'et', 'eu', 'fa', 'ff', 'fi',
          'fr', 'fy', 'fy-NL', 'ga', 'ga-IE', 'gd', 'gl', 'gu', 'gu-IN', 'he',
          'hi-IN', 'hr', 'ht', 'hu', 'hy-AM', 'id', 'is', 'it', 'it-CH', 'ja',
          'kk', 'km', 'kn', 'ko', 'ku', 'lij', 'lt', 'lv', 'mai', 'mk', 'ml',
          'mr', 'ms', 'nb-NO', 'ne-NP', 'nl', 'nn-NO', 'or', 'pa', 'pa-IN',
          'pl', 'pt', 'pt-BR', 'pt-PT', 'rm', 'ro', 'ru', 'si', 'sk', 'sl',
          'son', 'sq', 'sr', 'sr-LATN', 'sv', 'sv-SE', 'ta', 'te', 'th', 'tr',
          'uk', 'ur', 'vi', 'xh', 'zh-CN', 'zh-TW', 'zu'],
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
    }
  },
  metrics: {
    sample_rate: {
      doc: 'Front end metrics sample rate - must be between 0 and 1',
      format: Number,
      default: 0,
      env: 'METRICS_SAMPLE_RATE'
    }
  },
  key_path: {
      doc: 'The location of the SSL key in pem format',
      default: path.resolve(__dirname, '..', '..','key.pem')
  },
  cert_path: {
	doc: 'The location of the SSL certificate in pem format',
	default: path.resolve(__dirname, '..', '..','cert.pem')
  }
});

// At the time this file is required, we'll determine the "process name" for this proc
// if we can determine what type of process it is (browserid or verifier) based
// on the path, we'll use that, otherwise we'll name it 'ephemeral'.
conf.set('process_type', path.basename(process.argv[1], '.js'));

var DEV_CONFIG_PATH = path.join(__dirname, '..', 'config', 'local.json');
if (! process.env.CONFIG_FILES &&
    fs.existsSync(DEV_CONFIG_PATH)) {
  process.env.CONFIG_FILES = DEV_CONFIG_PATH;
}

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable
if (process.env.CONFIG_FILES &&
    process.env.CONFIG_FILES !== '') {
  var files = process.env.CONFIG_FILES.split(',');
  conf.loadFile(files);
}

if (! process.env.NODE_ENV) {
  process.env.NODE_ENV = conf.get('env');
}

if (!conf.has('public_url')) {
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

var areDistResources = conf.get('static_directory') === 'dist';
conf.set('are_dist_resources', areDistResources);

// validate the configuration based on the above specification
conf.validate();

