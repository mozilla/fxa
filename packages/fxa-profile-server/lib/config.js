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
  authServer: {
    url: {
      doc: 'URL of fxa-auth-server',
      env: 'AUTH_SERVER_URL',
      format: 'url',
      default: 'http://127.0.0.1:9000/v1'
    }
  },
  clientAddressDepth: {
    doc: 'location of the client ip address in the remote address chain',
    format: Number,
    env: 'CLIENT_ADDRESS_DEPTH',
    default: 3
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
  events: {
    region: {
      doc: 'AWS Region of fxa account events',
      format: String,
      default: '',
      env: 'EVENTS_REGION'
    },
    queueUrl: {
      doc: 'SQS queue url for fxa account events',
      format: String,
      default: '',
      env: 'EVENTS_QUEUE_URL'
    }
  },
  img: {
    driver: {
      env: 'IMG',
      format: ['local', 'aws'],
      default: 'aws'
    },
    providers: {
      gravatar: {
        doc: 'Patterns to match a URL to ensure we only accept Gravatar URLs.',
        default: '^https://secure\\.gravatar\\.com' +
          '/avatar/[0-9a-f]{32}(\\?s=\\d+)?$'
      },
      fxa: {
        doc: 'Patterns to match a URL to ensure we only accept certain URLs.',
        default: '^http://127.0.0.1:1112/a/[0-9a-f]{32}$',
        env: 'IMG_PROVIDERS_FXA'
      }
    },
    uploads: {
      dest: {
        public: {
          doc: 'Path or bucket name for images to be served publicly.',
          default: 'BUCKET_NAME',
          env: 'IMG_UPLOADS_DEST_PUBLIC'
        }
      },
      maxSize: {
        doc: 'Maximum bytes allow for uploads',
        default: 1024 * 1024 * 1, // 1MB
        env: 'IMG_UPLOADS_DEST_MAX_SIZE'
      },
      types: {
        doc: 'A mapping of allowed mime types and their file signatures',
        default: {
          // see https://en.wikipedia.org/wiki/List_of_file_signatures
          'image/jpeg': [
            [0xFF, 0xD8, 0xFF, 0xDB],
            [0xFF, 0xD8, 0xFF, 0xE0],
            [0xFF, 0xD8, 0xFF, 0xE1]
          ],
          'image/png': [
            [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
          ]
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
        default: Math.ceil(require('os').cpus().length * 1.25),
        env: 'IMG_COMPUTE_MAX_PROCESSES'
      }
    },
    gm: {
      limits: {
        // See http://www.graphicsmagick.org/GraphicsMagick.html#details-limit
        disk: '64MB',
        files: '8',
        map: '32MB',
        memory: '64MB',
        pixels: '16K',
        threads: '8'
      }
    },
    url: {
      doc: 'Pattern to generate FxA avatar URLs. {id} will be replaced.',
      default: 'http://127.0.0.1:1112/a/{id}',
      env: 'IMG_URL'
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
    },
    debug: {
      env: 'LOG_DEBUG',
      default: false
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
      env: 'OAUTH_SERVER_URL',
      default: 'http://127.0.0.1:9010/v1'
    }
  },
  customsUrl: {
    doc: 'fraud / abuse server url',
    default: 'none',
    env: 'CUSTOMS_SERVER_URL'
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
      default: 'http://127.0.0.1:1113',
      env: 'WORKER_URL'
    }
  },
  hpkpConfig: {
    enabled: {
      default: false,
      doc: 'Feature flag for appending HPKP headers',
      format: Boolean,
      env: 'HPKP_ENABLE'
    },
    reportOnly: {
      default: true,
      doc: 'Enable report only mode',
      format: Boolean,
      env: 'HPKP_REPORT_ONLY'
    },
    reportUri: {
      default: '',
      doc: 'Enable report only mode',
      format: String,
      env: 'HPKP_REPORT_URI'
    },
    includeSubDomains: {
      default: true,
      doc: 'Include Sub-Domains',
      format: Boolean,
      env: 'HPKP_INCLUDE_SUBDOMAINS'
    },
    maxAge: {
      default: 1,
      doc: 'Max age for HPKP headers (seconds)',
      format: Number,
      env: 'HPKP_MAX_AGE'
    },
    sha256s: {
      default: [],
      doc: 'Supported pin-sha256s',
      format: Array,
      env: 'HPKP_PIN_SHA256'
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

var options = {
  strict: true
};

conf.validate(options);

module.exports = conf;
