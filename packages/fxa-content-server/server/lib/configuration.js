/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
convict = require('convict'),
fs = require('fs'),
path = require('path');

// Side effect - Adds default_bid and dev_bid to express.logger formats
require('./custom_logger');

var conf = module.exports = convict({
  port: {
    format: "port",
    default: 3030,
    env: "PORT"
  },
  browserid_server: "https://fxaccounts.org",
  cachify_prefix: {
    doc: "The prefix for cachify hashes in URLs",
    default: "v"
  },
  certificate_duration: {
    doc: "Longest possible cert expiration in seconds",
    format: "duration",
    default: "5 minutes"
  },
  certifier_host: {
    format: String,
    default: "127.0.0.1",
    env: "CERTIFIER_HOST"
  },
  certifier_port: {
    format: "port",
    default: 8080,
    env: "CERTIFIER_PORT"
  },
  client_sessions: {
    cookie_name: "session",
    secret: "YOU MUST CHANGE ME",
    duration: {
      format: "duration",
      default: "1 day"
    }
  },
  default_lang: "en-US",
  debug_lang: "it-CH",
  disable_locale_check: {
    doc: "Skip checking for gettext .mo files for supported locales",
    default: false
  },
  env: {
    doc: "What environment are we running in?  Note: all hosted environments are 'production'.  ",
    format: ["production", "development"],
    default: "production",
    env: 'NODE_ENV'
  },
  http_proxy: {
    port: {
      format: "port",
      default: undefined
    },
    host: {
      format: String,
      default: undefined
    }
  },
  issuer: "dev.fxaccounts.mozilla.org",
  public_url: {
    doc: "The publically visible URL of the deployment",
    default: "https://fxaccounts.persona.org",
    env: 'PUBLIC_URL'
  },
  process_type: 'ephemeral',
  statsd: {
    enabled: {
      doc: "enable UDP based statsd reporting",
      default: true,
      env: 'ENABLE_STATSD'
    },
    host: "localhost",
    port: {
      format: "port",
      default: 8125
    }
  },
  translation_directory: "static/i18n",
  supported_languages: {
    doc: "List of languages this deployment should detect and display localized strings.",
    format: Array,
    default: [ "en-US" ],
    env: 'SUPPORTED_LANGUAGES'
  },
  express_log_format: {
    format: [ "default_bid", "dev_bid", "default", "dev", "short", "tiny" ],
    default: "default"
  },
  use_https: false,
  var_path: {
    doc: "The path where deployment specific resources will be sought (keys, etc), and logs will be kept.",
    default: path.join(__dirname, "..", "var"),
    env: 'VAR_PATH'
  },
  pub_key_ttl: {
    format: "duration",
    default: "6 hours"
  },
  pub_key_path: "var/key.publickey"
});

// At the time this file is required, we'll determine the "process name" for this proc
// if we can determine what type of process it is (browserid or verifier) based
// on the path, we'll use that, otherwise we'll name it 'ephemeral'.
conf.set('process_type', path.basename(process.argv[1], ".js"));

var dev_config_path = path.join(process.cwd(), 'config', 'local.json');
if (! process.env.CONFIG_FILES &&
    fs.existsSync(dev_config_path)) {
  process.env.CONFIG_FILES = dev_config_path;
}

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable
if (process.env.CONFIG_FILES &&
    process.env.CONFIG_FILES != '') {
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
