/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { assert } from 'chai';
import { buildSentryConfig, SentryConfigOpts } from '../../sentry';
import Sinon, { SinonSpiedInstance } from 'sinon';
import { ILogger } from '../../log';

describe('config-builder', () => {
  function cloneConfig(val: any) {
    return JSON.parse(JSON.stringify(val));
  }

  const emptyLogger: ILogger = {
    info: function (...args: any): void {},
    trace: function (...args: any): void {},
    warn: function (...args: any): void {
      console.log('WARNING', ...args);
    },
    error: function (...args: any): void {},
    debug: function (...args: any): void {},
  };

  const sandbox = Sinon.createSandbox();
  const loggerSpy: SinonSpiedInstance<ILogger> = sandbox.spy(emptyLogger);

  afterEach(() => {
    sandbox.reset();
  });

  const testConfig: SentryConfigOpts = {
    release: '1.0.1',
    version: '1.0.2',
    sentry: {
      dsn: 'https://foo.sentry.io',
      env: 'test',
      sampleRate: 1,
      tracesSampleRate: 1,
      serverName: 'fxa-shared-test',
      clientName: 'fxa-shared-client-test',
    },
  };

  it('builds', () => {
    const config = buildSentryConfig(testConfig, loggerSpy);
    assert.exists(config);
    assert.isTrue(loggerSpy.info.called);
  });

  it('picks correct defaults', () => {
    const config = buildSentryConfig(testConfig, loggerSpy);
    assert.equal(config.environment, testConfig.sentry?.env);
    assert.equal(config.release, testConfig.release);
    assert.equal(config.fxaName, testConfig.sentry?.clientName);
  });

  it('falls back', () => {
    const clone = cloneConfig(testConfig);
    delete clone.sentry.clientName;
    delete clone.release;

    const config = buildSentryConfig(clone, loggerSpy);

    assert.equal(config.release, testConfig.version);
    assert.equal(config.fxaName, testConfig.sentry?.serverName);
  });

  it('warns about missing config', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.dsn = '';

    buildSentryConfig(clone, loggerSpy);

    assert.isTrue(loggerSpy.warn.called);
  });

  it('errors on missing dsn', () => {
    const clone = JSON.parse(JSON.stringify(testConfig));
    clone.sentry.strict = true;
    clone.sentry.dsn = '';

    assert.throws(() => {
      buildSentryConfig(clone, loggerSpy);
    }, 'sentry.dsn not specified. sentry disabled.');
    assert.isTrue(loggerSpy.warn.called);
  });

  it('errors on unknown environment', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.strict = true;
    clone.sentry.env = 'xyz';

    assert.throws(() => {
      buildSentryConfig(clone, loggerSpy);
    }, 'invalid config.env. xyz options are: test,local,dev,ci,stage,prod,production,development');
    assert.isTrue(loggerSpy.warn.called);
  });

  it('errors on missing release', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.strict = true;
    delete clone.release;
    delete clone.version;

    assert.throws(() => {
      buildSentryConfig(clone, loggerSpy);
    }, 'config missing either release or version.');
    assert.isTrue(loggerSpy.warn.called);
  });

  it('errors on missing sampleRate', () => {
    const clone = cloneConfig(testConfig);
    clone.sentry.strict = true;
    delete clone.sentry.sampleRate;

    assert.throws(() => {
      buildSentryConfig(clone, loggerSpy);
    }, 'sentry.sampleRate');
    assert.isTrue(loggerSpy.warn.called);
  });

  it('can use mozlogger', () => {
    const mozlog = require('mozlog')({
      app: 'fxa-shared-test',
      level: 'trace',
    });
    const logger = mozlog('fxa-shared-testing');
    const config = buildSentryConfig(testConfig, logger);

    assert.exists(config);
  });

  it('can use console logger', () => {
    const config = buildSentryConfig(testConfig, console);
    assert.exists(config);
  });
});
