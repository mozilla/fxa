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
      default: 1
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
  git: {
    commit: {
      doc: 'Commit SHA when in stage/production',
      format: String,
      default: ''
    }
  },
  img: {
    driver: {
      env: 'IMG',
      format: ['local', 'aws'],
      default: 'aws'
    },
    providers: {
      doc: 'Patterns to match a URL to ensure we only accept certain URLs.',
      default: {
        'gravatar':
            '^http(://www|s://secure)\\.gravatar\\.com' +
            '/avatar/[0-9a-f]{32}(\\?s=\\d+)?$',
        'fxa': '^http://127.0.0.1:1112/a/[0-9a-f]{32}$'
      }
    },
    uploads: {
      dest: {
        public: {
          doc: 'Path or bucket name for images to be served publicly.',
          default: 'BUCKET_NAME'
        }
      }
    },
    compute: {
      maxBacklog: {
        default: 500
      },
      maxRequestTime: {
        doc: 'seconds we will let the user wait before returning a 503',
        format: 'duration',
        default: 10
      },
      maxProcesses: {
        doc: 'max child processes for compute-cluster',
        default: Math.ceil(require('os').cpus().length * 1.25)
      }
    },
    resize: {
      height: {
        default: 600
      },
      width: {
        default: 600
      }
    },
    url: {
      doc: 'Pattern to generate FxA avatar URLs. {id} will be replaced.',
      default: 'http://127.0.0.1:1112/a/{id}'
    }
  },
  logging: {
    app: {
      default: 'fxa-profile-server'
    },
    fmt: {
      format: ['heka', 'pretty'],
      default: 'heka'
    },
    level: {
      env: 'LOG_LEVEL',
      default: 'info'
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
      default: 'fxa_profile',
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
    default: 'http://127.0.0.1:1111'
  },
  server: {
    host: {
      env: 'HOST',
      default: '127.0.0.1'
    },
    port: {
      env: 'PORT',
      format: 'port',
      default: 1111
    }
  },
  worker: {
    host: {
      env: 'WORKER_HOST',
      default: '127.0.0.1'
    },
    port: {
      env: 'WORKER_PORT',
      format: 'port',
      default: 1113
    },
    url: {
      default: 'http://127.0.0.1:1113'
    }
  }
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync);
conf.loadFile(files);

if (conf.get('img.driver') === 'local') {
  conf.set('img.uploads.dest.public',
    path.join(__dirname, '..', 'var', 'public'));
}

if (conf.get('env') === 'test') {
  process.env.AWS_ACCESS_KEY_ID = 'TESTME';
  process.env.AWS_SECRET_ACCESS_KEY = 'TESTME';
}

process.env.NODE_ENV = conf.get('env');

conf.validate();

module.exports = conf;
