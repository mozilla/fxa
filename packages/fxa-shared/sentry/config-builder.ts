/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ILogger } from '../log';
import { SentryConfigOpts } from './models/SentryConfigOpts';

const sentryEnvMap: Record<string, string> = {
  test: 'test',
  local: 'local',
  dev: 'dev',
  ci: 'ci',
  stage: 'stage',
  prod: 'prod',
  production: 'prod',
  development: 'dev',
};

function toEnv(val: any) {
  if (typeof val === 'string') {
    return sentryEnvMap[val] || '';
  }
  return '';
}

export function buildSentryConfig(config: SentryConfigOpts, log: ILogger) {
  if (log) {
    checkSentryConfig(config, log);
  }

  const opts = {
    dsn: config.sentry?.dsn || '',
    release: config.release || config.version,
    environment: toEnv(config.sentry?.env),
    sampleRate: config.sentry?.sampleRate,
    clientName: config.sentry?.clientName,
    serverName: config.sentry?.serverName,
    fxaName: config.sentry?.clientName || config.sentry?.serverName,
    tracesSampleRate: config.sentry?.tracesSampleRate,
  };

  return opts;
}

function checkSentryConfig(config: SentryConfigOpts, log: ILogger) {
  if (!config || !config.sentry || !config.sentry?.dsn) {
    raiseError('sentry.dsn not specified. sentry disabled.');
    return;
  } else {
    log?.info('sentry-config-builder', {
      msg: `Config setting for sentry.dsn specified, enabling sentry for env ${config.sentry.env}!`,
    });
  }

  if (!config.sentry.env) {
    raiseError('config missing either environment or env.');
  } else if (!toEnv(config.sentry.env)) {
    raiseError(
      `invalid config.env. ${config.sentry.env} options are: ${Object.keys(
        sentryEnvMap
      ).join(',')}`
    );
  } else {
    log?.info('sentry-config-builder', {
      msg: 'sentry targeting: ' + sentryEnvMap[config.sentry.env],
    });
  }

  if (!config.release && !config.version) {
    raiseError('config missing either release or version.');
  }

  if (config.sentry?.sampleRate == null) {
    raiseError('config missing sentry.sampleRate');
  }
  if (!config.sentry.clientName && !config.sentry.serverName) {
    raiseError('config missing either sentry.clientName or sentry.serverName');
  }

  function raiseError(msg: string) {
    log?.warn('sentry-config-builder', { msg });
    if (config.sentry?.strict) {
      throw new SentryConfigurationBuildError(msg);
    }
  }
}

class SentryConfigurationBuildError extends Error {}
