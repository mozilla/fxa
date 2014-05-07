/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');

const convict = require('convict');

const conf = convict({
  api: {
    version: {
      doc: 'Number part of versioned endpoints - ex: /v1/token',
      default: 1
    }
  },
  browserid: {
    issuer: {
      doc: 'We only accept assertions from this issuer',
      env: 'ISSUER',
      default: 'api.accounts.firefox.com'
    },
    verificationUrl: {
      doc: 'URL to the remote verifier we will use for fxa-assertions',
      format: 'url',
      env: 'VERIFICATION_URL',
      default: 'https://verifier.accounts.firefox.com/v2'
    }
  },
  clients: {
    doc: 'Some pre-defined clients that will be inserted into the DB',
    default: []
  },
  contentUrl: {
    doc: 'URL to UI page in fxa-content-server that starts OAuth flow',
    format: 'url',
    env: 'CONTENT_URL',
    default: 'http://localhost:3030/oauth/signin'
  },
  db: {
    driver: {
      env: 'DB',
      format: ['mysql', 'memory'],
      default: 'memory'
    }
  },
  encrypt: {
    hashAlg: {
      doc: 'Hash algorithm for storing secrets/codes/tokens.',
      default: 'sha256'
    }
  },
  env: {
    arg: 'node-env',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['dev', 'test', 'stage', 'prod'],
    default: 'prod'
  },
  expiration: {
    code: {
      doc: 'Clients must trade codes for tokens before they expire',
      format: 'duration',
      default: 1000 * 60 * 15
    }
  },
  logging: {
    formatters: {
      doc: 'http://seanmonstar.github.io/intel/#formatters',
      default: {
        pretty: {
          format: '%(name)s.%(levelname)s: %(message)s',
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
          class: 'intel/handlers/console',
          formatter: 'json'
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
      doc: 'Path used for finding relative classes',
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
      default: 'fxa_oauth',
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
  publicUrl: {
    format: 'url',
    env: 'PUBLIC_URL',
    default: 'http://127.0.0.1:9010'
  },
  server: {
    host: {
      env: 'HOST',
      default: '127.0.0.1'
    },
    port: {
      env: 'PORT',
      format: 'port',
      default: 9010
    }
  },
  unique: {
    clientSecret: {
      doc: 'Bytes of generated client_secrets',
      default: 32
    },
    code: {
      doc: 'Bytes of generated codes',
      default: 32
    },
    id: {
      doc: 'Bytes of generated DB ids',
      default: 8
    },
    token: {
      doc: 'Bytes of generated tokens',
      default: 32
    }
  }
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync);
conf.loadFile(files);


conf.validate();

module.exports = conf;
