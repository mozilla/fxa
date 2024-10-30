/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { buildSentryConfig } from './config-builder';
import { SentryConfigOpts } from './models/sentry-config-opts';
import { Logger } from './sentry.types';

describe('config-builder', () => {
  function cloneConfig(val: any) {
    return structuredClone(val);
  }

  const mockLogger: Logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  const testConfig: SentryConfigOpts = {
    release: '1.0.1',
    version: '1.0.2',
    sentry: {
      dsn: 'https://foo.sentry.io',
      env: 'test',
      sampleRate: 1,
      serverName: 'fxa-shared-test',
      clientName: 'fxa-shared-client-test',
    },
  };

  it('builds', () => {
    const config = buildSentryConfig(testConfig, mockLogger);
    expect(config).toBeDefined();
    expect(mockLogger.info).toBeCalledWith('sentry-config-builder', {
      msg: `Config setting for sentry.dsn specified, enabling sentry for env ${testConfig.sentry?.env}!`,
    });
  });

  it('picks correct defaults', () => {
    const config = buildSentryConfig(testConfig, mockLogger);
    expect(config.environment).toEqual(testConfig.sentry?.env);
    expect(config.release).toEqual(testConfig.release);
    expect(config.fxaName).toEqual(testConfig.sentry?.clientName);
  });

  it('falls back', () => {
    const clone = cloneConfig(testConfig);
    delete clone.sentry.clientName;
    delete clone.release;

    const config = buildSentryConfig(clone, mockLogger);

    expect(config.release).toEqual(testConfig.version);
    expect(config.fxaName).toEqual(testConfig.sentry?.serverName);
  });

  it('warns about missing config', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.dsn = '';

    buildSentryConfig(clone, mockLogger);

    expect(mockLogger.warn).toBeCalledTimes(1);
  });

  it('errors on missing dsn', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.strict = true;
    clone.sentry.dsn = '';

    expect(() => {
      buildSentryConfig(clone, mockLogger);
    }).toThrow('sentry.dsn not specified. sentry disabled.');
    expect(mockLogger.warn).toBeCalledTimes(1);
  });

  it('errors on unknown environment', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.strict = true;
    clone.sentry.env = 'xyz';

    expect(() => {
      buildSentryConfig(clone, mockLogger);
    }).toThrow(
      'invalid config.env. xyz options are: test,local,dev,ci,stage,prod,production,development'
    );
    expect(mockLogger.warn).toBeCalledTimes(1);
  });

  it('errors on missing release', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.strict = true;
    delete clone.release;
    delete clone.version;

    expect(() => {
      buildSentryConfig(clone, mockLogger);
    }).toThrow('config missing either release or version.');
    expect(mockLogger.warn).toBeCalledTimes(1);
  });

  it('errors on missing sampleRate', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.strict = true;
    delete clone.sentry.sampleRate;

    expect(() => {
      buildSentryConfig(clone, mockLogger);
    }).toThrow('sentry.sampleRate');
    expect(mockLogger.warn).toBeCalledTimes(1);
  });

  it('can use moz logger', () => {
    const mozlog = require('mozlog')({
      app: 'fxa-shared-test',
      level: 'trace',
    });
    const logger = mozlog('fxa-shared-testing');
    const config = buildSentryConfig(testConfig, logger);

    expect(config).toBeDefined();
  });

  it('can use console logger', () => {
    const config = buildSentryConfig(testConfig, console);
    expect(config).toBeDefined();
  });
});
