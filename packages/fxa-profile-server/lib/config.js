/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');

const convict = require('convict');

const conf = convict({
  api: {
    version: {
      doc: 'Version number prepended to API routes',
      default: 0
    }
  },
  db: {
    driver: {
      env: 'DB',
      format: ['mysql', 'memory'],
      default: 'memory'
    }
  },
  env: {
    arg: 'node-env',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['dev', 'test', 'stage', 'prod'],
    default: 'dev'
  },
  logging: {
    formatters: {
      doc: 'http://seanmonstar.github.io/intel/#formatters',
      default: {
        pretty: {
          format: '%(name)s.%(levelname)s: %(message)s',
          colorize: true
        },
        'pretty_with_time': {
          format: '[%(date)s] %(name)s.%(levelname)s: %(message)s',
          datefmt: '%Y-%m-%d %H:%M:%S.%L',
          colorize: true
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
          formatter: 'pretty',
          stream: 'process.stdout'
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
        }
      }
    },
    root: {
      doc: 'Path to find relative classes',
      default: __dirname
    }
  },
  mysql: {
    createSchema: {
      env: 'CREATE_MYSQL_SCHEMA',
      default: true
    },
    user: {
      default: 'root',
      env: 'MYSQL_USERNAME'
    },
    password: {
      default: '',
      env: 'MYSQL_PASSWORD'
    },
    database: {
      default: 'fxa',
      env: 'MYSQL_DATABASE'
    },
    host: {
      default: '127.0.0.1',
      env: 'MYSQL_HOST'
    },
    port: {
      default: '3306',
      env: 'MYSQL_PORT'
    }
  },
  oauth: {
    url: {
      doc: 'URL of fxa-oauth-server',
      format: 'url',
      default: 'http://127.0.0.1:9010/v1'
    }
  },
  publicUrl: {
    format: 'url',
    env: 'PUBLIC_URL',
    default: 'http://localhost:1111'
  },
  server: {
    host: {
      env: 'HOST',
      default: 'localhost'
    },
    port: {
      env: 'PORT',
      format: 'port',
      default: 1111
    }
  },
  uploads: {
    dir: {
      doc: 'Directory to store user uploads in.', //eek!
      default: path.join(__dirname, '..', 'uploads')
    },
    url: {
      doc: 'Domain to serve uploaded avatars from',
      default: ''
    },
    route: {
      doc: 'Path to download an uploaded avatar',
      default: '/a'
    }
  }
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync);
conf.loadFile(files);

if (conf.get('uploads.url') === conf.default('uploads.url')) {
  conf.set('uploads.url', conf.get('publicUrl'));
}

conf.validate();

module.exports = conf;
