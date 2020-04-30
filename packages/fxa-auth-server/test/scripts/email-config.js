/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';
const LIB_DIR = `${ROOT_DIR}/lib`;

const { assert } = require('chai');
const cp = require('child_process');
const mocks = require(`${ROOT_DIR}/test/mocks`);
const P = require('bluebird');
const path = require('path');

cp.execAsync = P.promisify(cp.exec);

const config = require(`${ROOT_DIR}/config`).getProperties();
const redis = require(`${LIB_DIR}/redis`)(
  {
    ...config.redis,
    ...config.redis.email,
  },
  mocks.mockLog()
);

const cwd = path.resolve(__dirname, ROOT_DIR);

const KEYS = {
  current: 'config',
  previous: 'config.previous',
};

describe('scripts/email-config:', () => {
  let current, previous;

  beforeEach(() => {
    return redis
      .get(KEYS.current)
      .then(result => {
        current = result;
        return redis.get(KEYS.previous);
      })
      .then(result => {
        previous = result;
        return redis.del(KEYS.current);
      })
      .then(() => redis.del(KEYS.previous));
  });

  afterEach(() => {
    return P.resolve()
      .then(() => {
        if (current) {
          return redis.set(KEYS.current, current);
        }

        return redis.del(KEYS.current);
      })
      .then(() => {
        if (previous) {
          return redis.set(KEYS.previous, previous);
        }

        return redis.del(KEYS.previous);
      });
  });

  it('read does not fail', () => {
    return cp.execAsync('npx ts-node scripts/email-config read', { cwd });
  });

  it('write does not fail', () => {
    return cp.execAsync(
      'echo \'{"sendgrid":{"percentage":100,"regex":".*"}}\' | npx ts-node scripts/email-config write',
      { cwd }
    );
  });

  it('write fails if stdin is not valid JSON', () => {
    return cp
      .execAsync('echo "wibble" | npx ts-node scripts/email-config write', {
        cwd,
      })
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write fails if stdin is empty object', () => {
    return cp
      .execAsync('echo "{}" | npx ts-node scripts/email-config write', { cwd })
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write fails if stdin contains unexpected key', () => {
    return cp
      .execAsync(
        'echo \'{"sendgrid":{"percentage":1,"regx":".*"}}\' | npx ts-node scripts/email-config write',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write fails if percentage is greater than 100', () => {
    return cp
      .execAsync(
        'echo \'{"sendgrid":{"percentage":100.1,"regex":".*"}}\' | npx ts-node scripts/email-config write',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write fails if percentage is less than 0', () => {
    return cp
      .execAsync(
        'echo \'{"sendgrid":{"percentage":-0.1,"regex":".*"}}\' | npx ts-node scripts/email-config write',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write fails if regex is not string', () => {
    return cp
      .execAsync(
        'echo \'{"sendgrid":{"percentage":1,"regex":{}}}\' | npx ts-node scripts/email-config write',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write fails if regex contains quote character', () => {
    return cp
      .execAsync(
        'echo \'{"sendgrid":{"percentage":1,"regex":".*\\""}}\' | npx ts-node scripts/email-config write',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write fails if regex is unsafe', () => {
    return cp
      .execAsync(
        'echo \'{"sendgrid":{"percentage":1,"regex":"(.*)*"}}\' | npx ts-node scripts/email-config write',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write does not fail if percentage is missing', () => {
    return cp.execAsync(
      'echo \'{"sendgrid":{"regex":".*"}}\' | npx ts-node scripts/email-config write',
      { cwd }
    );
  });

  it('write fails if service is invalid', () => {
    return cp
      .execAsync(
        'echo \'{"sendgri":{"percentage":1,"regex":{}}}\' | npx ts-node scripts/email-config write',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        () => {}
      );
  });

  it('write does not fail if regex is missing', () => {
    return cp.execAsync(
      'echo \'{"sendgrid":{"percentage":1}}\' | npx ts-node scripts/email-config write',
      { cwd }
    );
  });

  it('write does not fail if service is ses', () => {
    return cp.execAsync(
      'echo \'{"ses":{"percentage":1}}\' | npx ts-node scripts/email-config write',
      { cwd }
    );
  });

  it('write does not fail if service is socketlabs', () => {
    return cp.execAsync(
      'echo \'{"socketlabs":{"percentage":1}}\' | npx ts-node scripts/email-config write',
      { cwd }
    );
  });

  it('revert does not fail', () => {
    return cp.execAsync('npx ts-node scripts/email-config revert', { cwd });
  });

  it('check does not fail', () => {
    return cp.execAsync(
      'npx ts-node scripts/email-config check foo@example.com',
      {
        cwd,
      }
    );
  });

  it('check fails without argument', () => {
    return cp.execAsync('npx ts-node scripts/email-config check', { cwd }).then(
      () => assert(false, 'script should have failed'),
      () => {}
    );
  });

  describe('write config with regex:', () => {
    let config;

    beforeEach(() => {
      config = {
        sendgrid: {
          regex: 'foo',
          percentage: 42,
        },
      };
      return cp.execAsync(
        `echo '${JSON.stringify(
          config
        )}' | npx ts-node scripts/email-config write`,
        { cwd }
      );
    });

    it('read prints the config to stdout', () => {
      return cp
        .execAsync('npx ts-node scripts/email-config read', { cwd })
        .then((stdout, stderr) => {
          assert.equal(stdout, `${JSON.stringify(config, null, '  ')}\n`);
          assert.equal(stderr, undefined);
        });
    });

    it('check matching email prints the config to stdout', () => {
      return cp
        .execAsync('npx ts-node scripts/email-config check foo@example.com', {
          cwd,
        })
        .then((stdout, stderr) => {
          assert.equal(stdout, `${JSON.stringify(config, null, '  ')}\n`);
          assert.equal(stderr, undefined);
        });
    });

    it('check non-matching email does not print', () => {
      return cp
        .execAsync('npx ts-node scripts/email-config check bar@example.com', {
          cwd,
        })
        .then((stdout, stderr) => {
          assert.equal(stdout, '{}\n');
          assert.equal(stderr, undefined);
        });
    });

    describe('write config without regex:', () => {
      beforeEach(() => {
        config.socketlabs = {
          percentage: 10,
        };
        return cp.execAsync(
          `echo '${JSON.stringify(
            config
          )}' | npx ts-node scripts/email-config write`,
          { cwd }
        );
      });

      it('read prints the config to stdout', () => {
        return cp
          .execAsync('npx ts-node scripts/email-config read', { cwd })
          .then((stdout, stderr) => {
            assert.equal(stdout, `${JSON.stringify(config, null, '  ')}\n`);
            assert.equal(stderr, undefined);
          });
      });

      it('check matching email prints the both configs to stdout', () => {
        return cp
          .execAsync('npx ts-node scripts/email-config check foo@example.com', {
            cwd,
          })
          .then((stdout, stderr) => {
            assert.equal(stdout, `${JSON.stringify(config, null, '  ')}\n`);
            assert.equal(stderr, undefined);
          });
      });

      it('check non-matching email prints one config to stdout', () => {
        return cp
          .execAsync('npx ts-node scripts/email-config check bar@example.com', {
            cwd,
          })
          .then((stdout, stderr) => {
            const expected = {
              socketlabs: config.socketlabs,
            };
            assert.equal(stdout, `${JSON.stringify(expected, null, '  ')}\n`);
            assert.equal(stderr, undefined);
          });
      });

      describe('revert:', () => {
        beforeEach(() => {
          return cp.execAsync('npx ts-node scripts/email-config revert', {
            cwd,
          });
        });

        it('read prints the previous config to stdout', () => {
          return cp
            .execAsync('npx ts-node scripts/email-config read', { cwd })
            .then((stdout, stderr) => {
              const expected = {
                sendgrid: config.sendgrid,
              };
              assert.equal(stdout, `${JSON.stringify(expected, null, '  ')}\n`);
              assert.equal(stderr, undefined);
            });
        });

        it('check matching email prints the previous config to stdout', () => {
          return cp
            .execAsync(
              'npx ts-node scripts/email-config check foo@example.com',
              {
                cwd,
              }
            )
            .then((stdout, stderr) => {
              const expected = {
                sendgrid: config.sendgrid,
              };
              assert.equal(stdout, `${JSON.stringify(expected, null, '  ')}\n`);
              assert.equal(stderr, undefined);
            });
        });

        it('check non-matching email does not print', () => {
          return cp
            .execAsync(
              'npx ts-node scripts/email-config check bar@example.com',
              {
                cwd,
              }
            )
            .then((stdout, stderr) => {
              assert.equal(stdout, '{}\n');
              assert.equal(stderr, undefined);
            });
        });
      });
    });

    describe('revert:', () => {
      beforeEach(() => {
        return cp.execAsync('npx ts-node scripts/email-config revert', { cwd });
      });

      it('read does not print', () => {
        return cp
          .execAsync('npx ts-node scripts/email-config read', { cwd })
          .then((stdout, stderr) => {
            assert.equal(stdout, '');
            assert.equal(stderr, undefined);
          });
      });

      it('check matching email does not print', () => {
        return cp
          .execAsync('npx ts-node scripts/email-config check foo@example.com', {
            cwd,
          })
          .then((stdout, stderr) => {
            assert.equal(stdout, '');
            assert.equal(stderr, undefined);
          });
      });
    });
  });
});
