/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import convict from 'convict';
import fs from 'fs';
import path from 'path';

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

const conf = convict({
  amplitude: {
    hmac_key: {
      default: '',
      doc: 'A key used to create an Amplitude insert id and hash the UID',
      env: 'AMPLITUDE_HMAC_KEY',
      format: 'String',
    },
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production'],
  },
  logging: {
    app: { default: 'fxa-user-admin-server' },
    fmt: {
      default: 'heka',
      env: 'LOGGING_FORMAT',
      format: ['heka', 'pretty'],
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL',
    },
    routes: {
      enabled: {
        default: true,
        doc: 'Enable route logging. Set to false to trim CI logs.',
        env: 'ENABLE_ROUTE_LOGGING',
      },
      format: {
        default: 'default_fxa',
        format: ['default_fxa', 'dev_fxa', 'default', 'dev', 'short', 'tiny'],
      },
    },
  },
  queues: {
    pubsubProjectId: {
      default: 'default-project',
      doc: 'GCP Pub/Sub Project Id the queues are under',
      env: 'PUBSUB_PROJECT_ID',
      format: 'String',
    },
    rawEvents: {
      default: 'fxa-metrics-raw-events',
      doc: 'GCP Pub/Sub Queue for FxA Raw events',
      env: 'PUBSUB_RAW_EVENT_QUEUE',
      format: 'String',
    },
    deadLetterTopic: {
      default: 'fxa-metrics-dead-letter',
      doc: 'GCP Pub/Sub topic for FxA metric event failures',
      env: 'PUBSUB_DEADLETTER_QUEUE',
      format: 'String',
    },
    amplitudeTopic: {
      default: 'fxa-metrics-amplitude',
      doc: 'GCP Pub/Sub topic for transformed Amplitude events',
      env: 'PUBSUB_AMPLITUDE_QUEUE',
      format: 'String',
    },
    maxEventsPerBatch: {
      default: 500,
      doc: 'GCP Pub/Sub events to pull per batch',
      env: 'PUBSUB_MAX_EVENT_BATCH',
      format: 'Number',
    },
  },
  sentryDsn: {
    default: '',
    doc: 'Sentry DSN for error and log reporting',
    env: 'SENTRY_DSN',
    format: 'String',
  },
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
