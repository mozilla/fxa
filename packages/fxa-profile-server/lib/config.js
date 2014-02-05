/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const convict = require('convict');

const config = convict({
  db: {
    driver: {
      env: 'DB',
      format: ['mysql', 'memory'],
      default: 'memory'
    }
  },
  logging: {
    formatters: {
      doc: 'http://seanmonstar.github.io/intel/#formatters',
      default: {
        console: {
          format: '%(name)s.%(levelname)s: %(message)s',
          colorize: true
        }
      }
    },
    handlers: {
      doc: 'http://seanmonstar.github.io/intel/#handlers',
      default: {
        console: {
          class: 'intel/handlers/console',
          formatter: 'console'
        }
      }
    },
    loggers: {
      doc: 'http://seanmonstar.github.io/intel/#logging',
      default: {
        fxa: {
          handlers: ['console'],
          level: 0,
          propagate: false
        }
      }
    }
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
  }
});

config.validate();

module.exports = config;
