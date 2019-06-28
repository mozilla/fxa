/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as convict from 'convict';
import * as fs from 'fs';
import * as path from 'path';

const FIVE_MINUTES = 60 * 5;

const conf = convict({
  clientCapabilityFetch: {
    authToken: {
      default: '',
      doc: 'Authorization token to use with the request',
      env: 'CAPABILITY_AUTH_TOKEN',
      format: String
    },
    clientUrl: {
      default: '',
      doc: 'The FxA Auth server /oauth/subscriptions/clients url',
      env: 'CAPABILITY_URL',
      format: String
    },
    refreshInterval: {
      default: FIVE_MINUTES,
      doc: 'Refresh interval in seconds for fetching capability updates',
      env: 'CAPABILITY_REFRESH_INTERVAL',
      format: Number
    }
  },
  clientWebhooks: {
    default: {},
    doc: 'Object of clientId:webhookUrl mappings for in-memory database for dev server',
    env: 'CLIENT_WEBHOOK_URLS',
    format: Object
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production']
  },
  firestore: {
    credentials: {
      client_email: {
        default: 'test@localtest.com',
        doc: 'GCP Client key credential',
        env: 'FIRESTORE_CLIENT_EMAIL_CREDENTIAL',
        format: String
      },
      private_key: {
        default: '',
        doc: 'GCP Private key credential',
        env: 'FIRESTORE_PRIVATE_KEY_CREDENTIAL',
        format: String
      }
    },
    enabled: {
      default: true,
      doc: 'Whether to use firestore',
      env: 'FIRESTORE_ENABLED',
      format: Boolean
    },
    keyFilename: {
      default: path.resolve(__dirname, '../../../fxa-auth-server/config/secret-key.json'),
      doc: 'Path to GCP key file',
      env: 'FIRESTORE_KEY_FILE',
      format: String
    },
    prefix: {
      default: 'fxa-eb-',
      doc: 'Firestore collection prefix',
      env: 'FIRESTORE_COLLECTION_PREFIX',
      format: String
    },
    projectId: {
      default: '',
      doc: 'GCP Project id',
      env: 'FIRESTORE_PROJECT_ID',
      format: String
    }
  },
  log: {
    app: {
      default: 'fxa-event-broker',
      env: 'LOG_APP_NAME'
    },
    fmt: {
      default: 'heka',
      env: 'LOG_FORMAT',
      format: ['heka', 'pretty']
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL'
    }
  },
  openid: {
    issuer: {
      default: '',
      doc: 'OpenID Issuer',
      env: 'OPENID_ISSUER',
      format: String
    },
    key: {
      default: {},
      doc: 'Private JWK to sign Security Event Tokens',
      env: 'OPENID_KEY'
    },
    keyFile: {
      default: '',
      doc: 'OpenID Keyfile',
      env: 'OPENID_KEYFILE',
      format: String
    }
  },
  proxy: {
    port: {
      default: 8090,
      doc: 'Port to run PubSub proxy on',
      env: 'PUBSUB_PROXY_PORT',
      format: Number
    }
  },
  pubsub: {
    audience: {
      default: 'example.com',
      doc: 'PubSub JWT Audience for incoming Push Notifications',
      env: 'PUBSUB_AUDIENCE',
      format: String
    },
    authenticate: {
      default: true,
      doc: 'Authenticate that incoming Push Notifcation originate from Google',
      env: 'PUBSUB_AUTHENTICATE',
      format: Boolean
    },
    verificationToken: {
      default: '',
      doc: 'PubSub Verification Token for incoming Push Notifications',
      env: 'PUBSUB_VERIFICATION_TOKEN',
      format: String
    }
  },
  sentryDsn: {
    default: '',
    doc: 'Sentry DSN for error and log reporting',
    env: 'SENTRY_DSN',
    format: String
  },
  serviceNotificationQueueUrl: {
    default: '',
    doc:
      'The queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
    env: 'SERVICE_NOTIFICATION_QUEUE_URL',
    format: String
  }
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

// Need to move two dirs up as we're in the compiled directory now
const configDir = path.dirname(path.dirname(__dirname));
let envConfig = path.join(configDir, 'config', `${conf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate({ allowed: 'strict' });

// Replace openid key if file specified
if (conf.get('openid.keyFile')) {
  // tslint:disable-next-line
  let key = require(conf.get('openid.keyFile'));
  conf.set('openid.key', key);
}

const Config = conf;

export default Config;
