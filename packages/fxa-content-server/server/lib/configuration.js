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
  browserid_server: 'string = "https://fxaccounts.org"',
  cachify_prefix: {
    doc: "The prefix for cachify hashes in URLs",
    format: 'string = "v"'
  },
  // Longest possible cert expiration in seconds
  certificate_duration: 'integer = 300', // 5 minutes
  certifier_host: 'string = "127.0.0.1"',
  certifier_port: "integer{1,65535} = 8080",
  client_sessions: {
    cookie_name: 'string = "session"',
    secret: 'string = "YOU MUST CHANGE ME"',
    duration: 'integer = '  + (24 * 60 * 60 * 1000) // 1 day
  },
  default_lang: 'string = "en-US"',
  debug_lang: 'string = "it-CH"',
  disable_locale_check: {
    doc: "Skip checking for gettext .mo files for supported locales",
    format: 'boolean = false'
  },
  env: {
    doc: "What environment are we running in?  Note: all hosted environments are 'production'.  ",
    format: 'string ["production", "development"] = "production"',
    env: 'NODE_ENV'
  },
  http_proxy: {
    port: 'integer{1,65535}?',
    host: 'string?'
  },
  issuer: 'string = "dev.fxaccounts.mozilla.org"',
  public_url: {
    doc: "The publically visible URL of the deployment",
    format: 'string = "https://fxaccounts.persona.org"',
    env: 'PUBLIC_URL'
  },
  process_type: 'string',
  statsd: {
    enabled: {
      doc: "enable UDP based statsd reporting",
      format: 'boolean = true',
      env: 'ENABLE_STATSD'
    },
    host: 'string = "localhost"',
    port: "integer{1,65535} = 8125"
  },
  translation_directory: 'string = "static/i18n"',
  supported_languages: {
    doc: "List of languages this deployment should detect and display localized strings.",
    format: 'array { string }* = [ "en-US" ]',
    env: 'SUPPORTED_LANGUAGES'
  },
  express_log_format: 'string [ "default_bid", "dev_bid", "default", "dev", "short", "tiny" ] = "default"',
  use_https: 'boolean = false',
  var_path: {
    doc: "The path where deployment specific resources will be sought (keys, etc), and logs will be kept.",
    format: 'string?',
    env: 'VAR_PATH'
  },
  pub_key_ttl: "integer = " + (6 * 60 * 60), // 6 hours
  pub_key_path: 'string = "var/key.publickey"'
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
if (process.env.CONFIG_FILES) {
  var files = process.env.CONFIG_FILES.split(',');
  files.forEach(function(file) {
    var c = JSON.parse(fs.readFileSync(file, 'utf8'));
    conf.load(c);
  });
}

// if var path has not been set, let's default to var/
if (!conf.has('var_path')) {
  conf.set('var_path', path.join(__dirname, "..", "var"));
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
