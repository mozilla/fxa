/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');

const convict = require('convict');
const convict_format_with_validator = require('convict-format-with-validator');
const convict_format_with_moment = require('convict-format-with-moment');
convict.addFormats(convict_format_with_validator);
convict.addFormats(convict_format_with_moment);

const conf = convict({
  api: {
    version: {
      doc: 'Version number prepended to API routes',
      default: 1,
    },
  },
  authServer: {
    url: {
      doc: 'URL of fxa-auth-server',
      env: 'AUTH_SERVER_URL',
      default: 'http://localhost:9000/v1',
    },
  },
  clientAddressDepth: {
    doc: 'location of the client ip address in the remote address chain',
    format: Number,
    env: 'CLIENT_ADDRESS_DEPTH',
    default: 3,
  },
  db: {
    driver: {
      env: 'DB',
      format: ['mysql', 'memory'],
      default: 'memory',
    },
  },
  env: {
    arg: 'node-env',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production'],
    default: 'production',
  },
  events: {
    enabled: {
      doc: 'Whether or not config.events has to be properly set in production',
      format: Boolean,
      default: true,
      env: 'EVENTS_ENABLED',
    },
    region: {
      doc: 'AWS Region of fxa account events',
      format: String,
      default: '',
      env: 'EVENTS_REGION',
    },
    queueUrl: {
      doc: 'SQS queue url for fxa account events',
      format: String,
      default: '',
      env: 'EVENTS_QUEUE_URL',
    },
  },
  img: {
    driver: {
      env: 'IMG',
      format: ['local', 'aws'],
      default: 'aws',
    },
    providers: {
      gravatar: {
        doc: 'Patterns to match a URL to ensure we only accept Gravatar URLs.',
        default:
          '^https://secure\\.gravatar\\.com' +
          '/avatar/[0-9a-f]{32}(\\?s=\\d+)?$',
      },
      fxa: {
        doc: 'Patterns to match a URL to ensure we only accept certain URLs.',
        default: '^http://localhost:1112/a/[0-9a-f]{32}$',
        env: 'IMG_PROVIDERS_FXA',
      },
    },
    uploads: {
      cacheControlSeconds: {
        doc: 'Number of seconds in Cache-Control: max-age=seconds header',
        default: '31536000', // One year
        env: 'IMG_UPLOADS_CACHE_CONTROL_SECONDS',
      },
      dest: {
        public: {
          doc: 'Path or bucket name for images to be served publicly.',
          default: 'BUCKET_NAME',
          env: 'IMG_UPLOADS_DEST_PUBLIC',
        },
      },
      maxSize: {
        doc: 'Maximum bytes allow for uploads',
        default: 1024 * 1024 * 1, // 1MB
        env: 'IMG_UPLOADS_DEST_MAX_SIZE',
      },
      types: {
        doc: 'A mapping of allowed mime types and their file signatures',
        format: Object,
        default: {
          // see https://en.wikipedia.org/wiki/List_of_file_signatures
          'image/jpeg': [
            [0xff, 0xd8, 0xff, 0xdb],
            [0xff, 0xd8, 0xff, 0xe0],
            [0xff, 0xd8, 0xff, 0xe1],
          ],
          'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
        },
      },
    },
    compute: {
      maxBacklog: {
        default: 500,
      },
      maxRequestTime: {
        doc: 'seconds we will let the user wait before returning a 503',
        format: 'duration',
        default: 10,
      },
      maxProcesses: {
        doc: 'max child processes for compute-cluster',
        default: Math.ceil(require('os').cpus().length * 1.25),
        env: 'IMG_COMPUTE_MAX_PROCESSES',
      },
    },
    gm: {
      limits: {
        // See http://www.graphicsmagick.org/GraphicsMagick.html#details-limit
        disk: '64MB',
        files: '8',
        map: '32MB',
        memory: '64MB',
        pixels: '16K',
        threads: '8',
      },
    },
    url: {
      doc: 'Pattern to generate FxA avatar URLs. {id} will be replaced.',
      default: 'http://localhost:1112/a/{id}',
      env: 'IMG_URL',
    },
    defaultAvatarId: {
      default: '00000000000000000000000000000000',
      doc: 'Default avatar id',
      env: 'DEFAULT_AVATAR_ID',
      format: String,
    },
  },
  logging: {
    app: {
      default: 'fxa-profile-server',
    },
    fmt: {
      format: ['heka', 'pretty'],
      default: 'heka',
    },
    level: {
      env: 'LOG_LEVEL',
      default: 'info',
    },
    debug: {
      env: 'LOG_DEBUG',
      default: false,
    },
  },
  mysql: {
    createSchema: {
      env: 'CREATE_MYSQL_SCHEMA',
      default: true,
    },
    user: {
      default: 'root',
      env: 'MYSQL_USERNAME',
    },
    password: {
      default: '',
      sensitive: true,
      env: 'MYSQL_PASSWORD',
    },
    database: {
      default: 'fxa_profile',
      env: 'MYSQL_DATABASE',
    },
    host: {
      default: 'localhost',
      env: 'MYSQL_HOST',
    },
    port: {
      default: '3306',
      env: 'MYSQL_PORT',
    },
  },
  oauth: {
    url: {
      doc: 'URL of fxa-oauth-server',
      env: 'OAUTH_SERVER_URL',
      default: 'http://localhost:9000/v1',
    },
  },
  customsUrl: {
    doc: 'fraud / abuse server url',
    default: 'none',
    env: 'CUSTOMS_SERVER_URL',
  },
  publicUrl: {
    format: 'url',
    env: 'PUBLIC_URL',
    default: 'http://localhost:1111',
  },
  server: {
    host: {
      env: 'HOST',
      default: 'localhost',
    },
    port: {
      env: 'PORT',
      format: 'port',
      default: 1111,
    },
  },
  worker: {
    host: {
      env: 'WORKER_HOST',
      default: 'localhost',
    },
    port: {
      env: 'WORKER_PORT',
      format: 'port',
      default: 1113,
    },
    url: {
      default: 'http://localhost:1113',
      env: 'WORKER_URL',
    },
  },
  authServerMessaging: {
    region: {
      doc: 'The region where the queues live',
      format: String,
      env: 'AUTH_SERVER_MESSAGING_REGION',
      default: '',
    },
    profileUpdatesQueueUrl: {
      doc:
        'The queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'PROFILE_UPDATES_QUEUE_URL',
      default: '',
    },
  },
  serverCache: {
    redis: {
      host: {
        default: 'localhost',
        env: 'REDIS_HOST',
        format: String,
        doc: 'Url for redis host',
      },
      keyPrefix: {
        default: 'fxa-profile',
        env: 'REDIS_KEY_PREFIX',
        format: String,
        doc: 'which redis key prefix to use for hapi server cache',
      },
      port: {
        default: 6379,
        env: 'REDIS_PORT',
        format: 'port',
        doc: 'port for redis server',
      },
    },
    useRedis: {
      default: true,
      doc: 'Enable redis cache',
      format: Boolean,
      env: 'USE_REDIS',
    },
    expiresIn: {
      default: '1 hour',
      format: 'duration',
      env: 'CACHE_EXPIRES_IN',
      doc: 'how long before cached resources expire',
    },
    generateTimeout: {
      default: '11 seconds',
      format: 'duration',
      env: 'CACHE_GENERATE_TIMEOUT',
      doc:
        'how long catbox will wait for a value from db to cache before timing out',
    },
  },
  sentryDsn: {
    doc: 'Sentry DSN for error and log reporting',
    sensitive: true,
    default: '',
    format: 'String',
    env: 'SENTRY_DSN',
  },
  secretBearerToken: {
    default: 'supersecret',
    doc: 'Secret for server-to-server bearer token auth',
    env: 'AUTH_SECRET_BEARER_TOKEN',
    format: 'String',
  },
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',')
  .filter(fs.existsSync);
conf.loadFile(files);

if (
  conf.get('img.driver') === 'local' &&
  conf.get('img.uploads.dest.public') === 'BUCKET_NAME'
) {
  conf.set(
    'img.uploads.dest.public',
    path.join(__dirname, '..', 'var', 'public')
  );
}

if (conf.get('env') === 'test') {
  process.env.AWS_ACCESS_KEY_ID = 'TESTME';
  process.env.AWS_SECRET_ACCESS_KEY = 'TESTME';
}

process.env.NODE_ENV = conf.get('env');

var options = {
  allowed: 'strict',
};

conf.validate(options);

conf.toString = function() {
  // RegExp instances serialise to empty objects, display regex strings instead.
  return JSON.stringify(conf.getProperties(), (k, v) =>
    v && v.constructor === RegExp ? v.toString() : v
  );
};

module.exports = conf;
