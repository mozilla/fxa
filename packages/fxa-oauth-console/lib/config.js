/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');

const convict = require('convict');


const conf = convict({
  /**
   * Environment
   */
  env: {
    arg: 'node-env',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['dev', 'test', 'staging', 'prod'],
    default: 'dev'
  },
  git: {
    commit: {
      doc: 'Commit SHA when in stage/production',
      format: String,
      default: ''
    }
  },
  /**
   * Server Properties
   */
  server: {
    host: {
      env: 'HOST',
      default: '127.0.0.1'
    },
    port: {
      env: 'PORT',
      format: 'port',
      default: 10137
    }
  },
  /**
   * FxA OAuth
   */
   //TODO: update with production settings
  fxaOAuth: {
    client_id: {
      doc: "The FxA client_id (8 bytes key encoded as hex)",
      format: String,
      default: ""
    },
    client_secret: {
      doc: "The FxA client secret (32 bytes key encoded as hex)",
      format: String,
      default: ""
    },
    oauth_uri: {
      doc: "The location of the FxA OAuth server.",
      format: "url",
      default: "https://oauth-latest.dev.lcip.org/v1"
    },
    content_uri: {
      doc: "The location of the FxA content server.",
      format: "url",
      default: "https://latest.dev.lcip.org"
    },
    redirect_uri: {
      doc: "The redirect_uri.",
      format: String,
      default: "https://127.0.0.1:10137/oauth/redirect"
    },
    profile_uri: {
      doc: "The FxA profile uri.",
      format: "url",
      default: "https://latest.dev.lcip.org/profile/v1"
    },
    scope: {
      doc: "The scope we're requesting access to",
      format: String,
      default: "profile"
    }
  },
  /**
   * Logging
   */
  logging: {
    formatters: {
      doc: 'http://seanmonstar.github.io/intel/#formatters',
      default: {
        pretty: {
          format: '[p%(pid)s] %(name)s.%(levelname)s: %(message)s',
          colorize: true
        },
        'pretty_with_time': {
          format: '[%(date)s] %(name)s.%(levelname)s: %(message)s',
          datefmt: '%Y-%m-%d %H:%M:%S.%L'
        },
        json: {
          class: './logging/json'
        }
      }
    },
    handlers: {
      doc: 'http://seanmonstar.github.io/intel/#handlers',
      default: {
        console: {
          class: 'intel/handlers/stream',
          formatter: 'json',
          stream: 'stderr'
        }
      }
    },
    loggers: {
      doc: 'http://seanmonstar.github.io/intel/#logging',
      default: {
        fxa: {
          handlers: ['console'],
          handleExceptions: true,
          level: 'INFO',
          propagate: false
        },
        'fxa.server.web.hapi': {
          level: 'ERROR'
        }
      }
    },
    root: {
      doc: 'Path to find relative classes',
      default: __dirname
    }
  }
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync);
conf.loadFile(files);

if (process.env.LOG_LEVEL) {
  conf.set('logging.loggers.fxa.level', process.env.LOG_LEVEL);
}
process.env.NODE_ENV = conf.get('env');

conf.validate();


module.exports = conf;
