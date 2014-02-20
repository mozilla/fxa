/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var convict = require('convict');
var fs = require('fs');
var path = require('path');

var conf = module.exports = convict({
  port: {
    format: 'port',
    default: 3030,
    env: 'PORT'
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
  use_https: false,
  var_path: {
    doc: 'The path where deployment specific resources will be sought (keys, etc), and logs will be kept.',
    default: path.resolve(__dirname, '..', 'var'),
    env: 'VAR_PATH'
  },
  fxaccount_url: {
    doc: 'The url of the Firefox Account server',
    format: 'url',
    default: 'http://127.0.0.1:9000/v1',
    env: 'FXA_URL'
  },
  static_directory: {
    doc: 'Directory that static files are served from.',
    format: String,
    default: 'app'
  },
  font_max_age_ms: {
    doc: 'Cache fonts for this amount of time, in ms',
    format: Number,
    default: 180 * 24 * 60 * 60 * 1000      // 180 days
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
  i18n: {
    defaultLang: {
      format: String,
      default: 'en'
    },
    debugLang: {
      format: String,
      default: 'it-CH'
    },
    supportedLanguages: {
      doc: 'List of languages this deployment should detect and display localized strings.',
      format: Array,
      default: ['en', 'it-CH'],
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

// validate the configuration based on the above specification
conf.validate();
