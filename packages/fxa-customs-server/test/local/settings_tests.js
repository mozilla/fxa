/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const P = require('bluebird');
const sinon = require('sinon');
const test = require('tap').test;

const config = {
  limits: {
    maxEmails: 5,
    smsRateLimit: {
      limitIntervalSeconds: 1800,
      maxSms: 5,
    },
  },
  requestChecks: {
    treatEveryoneWithSuspicion: true,
  },
};
const mc = {};
const log = {
  info: sinon.spy(),
  error() {},
};
const Settings = require('../../lib/settings/settings')(config, mc, log);

class TestSettings extends Settings {
  constructor() {
    super('tests');
  }

  setAll(settings) {
    this.testOption = !! settings.testOption;
    return this;
  }

  validate(other) {
    if (! other) {
      throw new Settings.Missing();
    }
    return other;
  }
}

test('refresh without pushOnMissing does not call push', t => {
  let pushed;
  mc.getAsync = () => P.resolve(pushed);
  mc.setAsync = (key, val) => {
    pushed = val;
    return P.resolve(val);
  };
  const settings = new TestSettings();
  settings.setAll({ testOption: true });
  return settings.refresh().then(t.fail, err => {
    t.equal(pushed, undefined);
    t.ok(err instanceof Settings.Missing);
  });
});

test('refresh pushOnMissing works on Missing error', t => {
  let pushed;
  mc.getAsync = () => P.resolve(pushed);
  mc.setAsync = (key, val) => {
    pushed = val;
    return P.resolve(val);
  };
  const settings = new TestSettings();
  settings.setAll({ testOption: true });
  return settings.refresh({ pushOnMissing: true }).then(() => {
    t.deepEqual(pushed, { testOption: true });
  }, t.fail);
});

test('refresh pushOnMissing returns other Errors', t => {
  const mcError = new Error('memcached error');
  mc.getAsync = () => P.reject(mcError);
  mc.setAsync = (key, val) => {
    return P.reject(new Error('setAsync should not have been called'));
  };
  const settings = new TestSettings();
  settings.setAll({ testOption: true });
  return settings.refresh({ pushOnMissing: true }).then(t.fail, err => {
    t.equal(err, mcError);
  });
});

test('limits.validate logs changes', t => {
  const current = require('../../lib/settings/limits')(config, Settings, log);
  const future = require('../../lib/settings/limits')(config, Settings, log);

  log.info.resetHistory();
  future.maxEmails += 1;
  future.smsRateLimit = { ...current.smsRateLimit };
  future.smsRateLimit.limitIntervalSeconds *= 2;

  current.validate(future);

  t.equal(log.info.callCount, 2);

  let args = log.info.args[0];
  t.equal(args.length, 1);
  t.equal(args[0].op, 'limits.validate.changed');
  t.equal(args[0].key, 'maxEmails');
  t.equal(args[0].maxEmails, undefined);
  t.equal(typeof args[0].currentMaxEmails, 'number');
  t.equal(typeof args[0].futureMaxEmails, 'number');
  t.equal(args[0].currentMaxEmails, config.limits.maxEmails);
  t.equal(args[0].futureMaxEmails, config.limits.maxEmails + 1);

  args = log.info.args[1];
  t.equal(args.length, 1);
  t.equal(args[0].op, 'limits.validate.changed');
  t.equal(args[0].key, 'smsRateLimit');
  t.equal(args[0].smsRateLimit, undefined);
  t.equal(typeof args[0].currentSmsRateLimit, 'object');
  t.equal(typeof args[0].futureSmsRateLimit, 'object');
  t.equal(
    args[0].currentSmsRateLimit.limitIntervalSeconds,
    config.limits.smsRateLimit.limitIntervalSeconds
  );
  t.equal(
    args[0].futureSmsRateLimit.limitIntervalSeconds,
    config.limits.smsRateLimit.limitIntervalSeconds * 2
  );

  t.end();
});

test('requestChecks.validate logs changes', t => {
  const current = require('../../lib/settings/requestChecks')(
    config,
    Settings,
    log
  );
  const future = require('../../lib/settings/requestChecks')(
    config,
    Settings,
    log
  );

  log.info.resetHistory();
  future.treatEveryoneWithSuspicion = false;

  current.validate(future);

  t.equal(log.info.callCount, 1);

  const args = log.info.args[0];
  t.equal(args.length, 1);
  t.equal(args[0].op, 'requestChecks.validate.changed');
  t.equal(args[0].key, 'treatEveryoneWithSuspicion');
  t.equal(args[0].treatEveryoneWithSuspicion, undefined);
  t.equal(typeof args[0].currentTreatEveryoneWithSuspicion, 'boolean');
  t.equal(typeof args[0].futureTreatEveryoneWithSuspicion, 'boolean');
  t.equal(args[0].currentTreatEveryoneWithSuspicion, true);
  t.equal(args[0].futureTreatEveryoneWithSuspicion, false);

  t.end();
});
