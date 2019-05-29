/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as convict from 'convict';
import * as fs from 'fs';
import * as path from 'path';

const conf = convict({
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production']
  },
  firestore: {
    credentials: {
      client_email: {
        default: '',
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
      default: '',
      doc: 'Path to GCP key file',
      env: 'FIRESTORE_KEY_FILE',
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
  sentryDsn: {
    default: '',
    doc: 'Sentry DSN for error and log reporting',
    env: 'SENTRY_DSN',
    format: 'String'
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
const Config = conf;

export default Config;
