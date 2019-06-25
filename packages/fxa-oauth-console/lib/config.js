/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global require, module, process, __dirname */

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
    format: ['dev', 'test', 'staging', 'production'],
    default: 'dev',
  },
  git: {
    commit: {
      doc: 'Commit SHA when in stage/production',
      format: String,
      default: '',
      env: 'GIT_COMMIT_SHA',
    },
  },
  /**
   * Server Properties
   */
  server: {
    host: {
      env: 'HOST',
      default: '127.0.0.1',
    },
    port: {
      env: 'PORT',
      format: 'port',
      default: 10137,
    },
    session: {
      env: 'COOKIE_SECRET',
      format: String,
      default: 'cookie_secret',
    },
  },
  base_url: {
    doc: 'Base URL of the application. Note: MUST end with a trailing slash',
    format: String,
    env: 'BASE_URL',
    default: '/',
  },
  /**
   * FxA OAuth
   */
  //TODO: update with production settings
  fxaOAuth: {
    client_id: {
      doc: 'The FxA client_id (8 bytes key encoded as hex)',
      format: String,
      default: '',
      env: 'FXA_OAUTH_CLIENT_ID',
    },
    client_secret: {
      doc: 'The FxA client secret (32 bytes key encoded as hex)',
      format: String,
      default: '',
      env: 'FXA_OAUTH_CLIENT_SECRET',
    },
    oauth_uri: {
      doc: 'The location of the FxA OAuth server.',
      format: 'url',
      default: 'https://127.0.0.1:9010/v1',
      env: 'OAUTH_URI',
    },
    oauth_internal_uri: {
      doc: 'The location of the FxA OAuth internal server.',
      format: 'url',
      default: 'https://127.0.0.1:9011/v1',
      env: 'OAUTH_INTERNAL_URI',
    },
    redirect_uri: {
      doc: 'The redirect_uri.',
      format: String,
      default: 'https://127.0.0.1:10137/oauth/redirect',
      env: 'FXA_OAUTH_REDIRECT_URI',
    },
    profile_uri: {
      doc: 'The FxA profile uri.',
      format: 'url',
      default: 'https://127.0.0.1:1111/profile/v1',
      env: 'PROFILE_URI',
    },
    scopes: {
      doc: 'The oauth server scopes',
      format: String,
      default: 'profile oauth',
      env: 'FXA_OAUTH_SCOPES',
    },
  },
  /**
   * Logging
   */
  logging: {
    default: {
      app: 'fxa-oauth-console',
    },
  },
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',')
  .filter(fs.existsSync);
conf.loadFile(files);

require('mozlog').config(conf.get('logging'));
process.env.NODE_ENV = conf.get('env');

conf.validate();

module.exports = conf;
