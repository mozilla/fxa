/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const cp = require('child_process');
const os = require('os');
const path = require('path');
const Promise = require(`${ROOT_DIR}/promise`);

cp.execAsync = Promise.promisify(cp.exec);

const redis = require(`${ROOT_DIR}/redis`)(
  {
    enabled: true,
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    prefix: 'featureFlags:',
    maxConnections: 2,
    maxPending: 1,
    minConnections: 1,
  },
  {
    error() {},
    info() {},
    warn() {},
  }
);

const KEYS = {
  current: 'current',
  previous: 'previous',
};
const SCRIPT = `node scripts${path.sep}feature-flags`;

const cwd = path.resolve(__dirname, ROOT_DIR);

describe('scripts/feature-flags:', () => {
  let current, previous;

  beforeEach(async () => {
    current = await redis.get(KEYS.current);
    previous = await redis.get(KEYS.previous);
    await redis.del(KEYS.current);
    await redis.del(KEYS.previous);
  });

  afterEach(async () => {
    if (current) {
      await redis.set(KEYS.current, current);
    } else {
      await redis.del(KEYS.current);
    }
    if (previous) {
      await redis.set(KEYS.previous, previous);
    } else {
      await redis.del(KEYS.previous);
    }
  });

  after(() => redis.close());

  it('read does not fail', () => {
    return cp.execAsync(`${SCRIPT} read`, { cwd });
  });

  if (os.platform() === 'win32') {
    // The commands below assume a POSIX environment
    return;
  }

  ['write', 'merge'].forEach((command) => {
    it(`${command} does not fail`, () => {
      return cp.execAsync(`echo '{}' | ${SCRIPT} ${command}`, { cwd });
    });

    it(`${command} fails if stdin is not valid JSON`, () => {
      return cp.execAsync(`echo "wibble" | ${SCRIPT} ${command}`, { cwd }).then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
    });

    it(`${command} fails if stdin contains unexpected key`, () => {
      return cp
        .execAsync(`echo '{"wibble":{}}' | ${SCRIPT} ${command}`, { cwd })
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} does not fail with valid communicationPrefLanguages`, () => {
      return cp.execAsync(
        `echo '{"communicationPrefLanguages":["fr","pt-br","en-[a-z]{2}"]}' | ${SCRIPT} ${command}`,
        { cwd }
      );
    });

    it(`${command} fails if communicationPrefLanguages is not array`, () => {
      return cp
        .execAsync(
          `echo '{"communicationPrefLanguages":{"0":"en"}}' | ${SCRIPT} ${command}`,
          { cwd }
        )
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} fails if communicationPrefLanguages contains empty string`, () => {
      return cp
        .execAsync(
          `echo '{"communicationPrefLanguages":["en",""]}' | ${SCRIPT} ${command}`,
          { cwd }
        )
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} fails if communicationPrefLanguages contains object`, () => {
      return cp
        .execAsync(
          `echo '{"communicationPrefLanguages":[{}]}' | ${SCRIPT} ${command}`,
          { cwd }
        )
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} does not fail with metricsSampleRate 0`, () => {
      return cp.execAsync(
        `echo '{"metricsSampleRate":0}' | ${SCRIPT} ${command}`,
        { cwd }
      );
    });

    it(`${command} does not fail with metricsSampleRate 1`, () => {
      return cp.execAsync(
        `echo '{"metricsSampleRate":1}' | ${SCRIPT} ${command}`,
        { cwd }
      );
    });

    it(`${command} does not fail with metricsSampleRate between 0 and 1`, () => {
      return cp.execAsync(
        `echo '{"metricsSampleRate":0.5}' | ${SCRIPT} ${command}`,
        { cwd }
      );
    });

    it(`${command} fails if metricsSampleRate is negative`, () => {
      return cp
        .execAsync(`echo '{"metricsSampleRate":-0.1}' | ${SCRIPT} ${command}`, {
          cwd,
        })
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} fails if metricsSampleRate is greater than 1`, () => {
      return cp
        .execAsync(`echo '{"metricsSampleRate":1.1}' | ${SCRIPT} ${command}`, {
          cwd,
        })
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} does not fail with sentrySampleRate 0`, () => {
      return cp.execAsync(
        `echo '{"sentrySampleRate":0}' | ${SCRIPT} ${command}`,
        { cwd }
      );
    });

    it(`${command} does not fail with sentrySampleRate 1`, () => {
      return cp.execAsync(
        `echo '{"sentrySampleRate":1}' | ${SCRIPT} ${command}`,
        { cwd }
      );
    });

    it(`${command} does not fail with sentrySampleRate between 0 and 1`, () => {
      return cp.execAsync(
        `echo '{"sentrySampleRate":0.5}' | ${SCRIPT} ${command}`,
        { cwd }
      );
    });

    it(`${command} fails if sentrySampleRate is negative`, () => {
      return cp
        .execAsync(`echo '{"sentrySampleRate":-0.1}' | ${SCRIPT} ${command}`, {
          cwd,
        })
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} fails if sentrySampleRate is greater than 1`, () => {
      return cp
        .execAsync(`echo '{"sentrySampleRate":1.1}' | ${SCRIPT} ${command}`, {
          cwd,
        })
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} does not fail with valid tokenCodeClients`, () => {
      return cp.execAsync(
        `echo '{"tokenCodeClients":{"0123456789abcdef":{"enableTestEmails":true,"groups":["treatment"],"name":"wibble","rolloutRate":1}}}' | ${SCRIPT} ${command}`,
        { cwd }
      );
    });

    it(`${command} fails if tokenCodeClients contains non-boolean enableTestEmails`, () => {
      return cp
        .execAsync(
          `echo '{"tokenCodeClients":{"0123456789abcdef":{"enableTestEmails":1,"groups":["treatment"],"name":"wibble","rolloutRate":1}}}' | ${SCRIPT} ${command}`,
          { cwd }
        )
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} fails if tokenCodeClients contains empty groups string`, () => {
      return cp
        .execAsync(
          `echo '{"tokenCodeClients":{"0123456789abcdef":{"enableTestEmails":true,"groups":[""],"name":"wibble","rolloutRate":1}}}' | ${SCRIPT} ${command}`,
          { cwd }
        )
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} fails if tokenCodeClients contains empty name`, () => {
      return cp
        .execAsync(
          `echo '{"tokenCodeClients":{"0123456789abcdef":{"enableTestEmails":true,"groups":["treatment"],"name":"","rolloutRate":1}}}' | ${SCRIPT} ${command}`,
          { cwd }
        )
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });

    it(`${command} fails if tokenCodeClients contains rolloutRate greater than 1`, () => {
      return cp
        .execAsync(
          `echo '{"tokenCodeClients":{"0123456789abcdef":{"enableTestEmails":true,"groups":["treatment"],"name":"wibble","rolloutRate":1.1}}}' | ${SCRIPT} ${command}`,
          { cwd }
        )
        .then(
          () => assert(false, 'script should have failed'),
          () => {}
        );
    });
  });

  it('clear does not fail', () => {
    return cp.execAsync(`${SCRIPT} revert`, { cwd });
  });

  it('revert does not fail', () => {
    return cp.execAsync(`${SCRIPT} revert`, { cwd });
  });

  describe('write:', () => {
    let flags;

    beforeEach(() => {
      flags = {
        communicationPrefLanguages: ['en', 'fr'],
        metricsSampleRate: 1,
      };
      return cp.execAsync(`echo '${JSON.stringify(flags)}' | ${SCRIPT} write`, {
        cwd,
      });
    });

    it('read prints the flags to stdout', async () => {
      const stdout = await cp.execAsync(`${SCRIPT} read`, { cwd });
      assert.equal(stdout, `${JSON.stringify(flags, null, '  ')}\n`);
    });

    describe('merge:', () => {
      let moreFlags;

      beforeEach(() => {
        moreFlags = {
          communicationPrefLanguages: ['en', 'de'],
          sentrySampleRate: 0,
        };
        return cp.execAsync(
          `echo '${JSON.stringify(moreFlags)}' | ${SCRIPT} merge`,
          { cwd }
        );
      });

      it('read prints the merged flags to stdout', async () => {
        const stdout = await cp.execAsync(`${SCRIPT} read`, { cwd });
        assert.equal(
          stdout,
          `${JSON.stringify({ ...flags, ...moreFlags }, null, '  ')}\n`
        );
      });

      describe('revert:', () => {
        beforeEach(() => {
          return cp.execAsync(`${SCRIPT} revert`, { cwd });
        });

        it('read prints the previous flags to stdout', async () => {
          const stdout = await cp.execAsync(`${SCRIPT} read`, { cwd });
          assert.equal(stdout, `${JSON.stringify(flags, null, '  ')}\n`);
        });
      });

      describe('clear:', () => {
        beforeEach(() => {
          return cp.execAsync(`${SCRIPT} clear`, { cwd });
        });

        it('read prints no flags', async () => {
          const stdout = await cp.execAsync(`${SCRIPT} read`, { cwd });
          assert.equal(stdout, '{}\n');
        });
      });
    });

    describe('revert:', () => {
      beforeEach(() => {
        return cp.execAsync(`${SCRIPT} revert`, { cwd });
      });

      it('read does not print', async () => {
        const stdout = await cp.execAsync(`${SCRIPT} read`, { cwd });
        assert.equal(stdout, '{}\n');
      });
    });
  });
});
