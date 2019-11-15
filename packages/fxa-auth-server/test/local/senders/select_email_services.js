/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const config = require(`${ROOT_DIR}/config`).getProperties();
const cp = require('child_process');
const mocks = require('../../mocks');
const path = require('path');
const Promise = require(`${ROOT_DIR}/lib/promise`);
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

cp.execAsync = Promise.promisify(cp.exec, { multiArgs: true });

describe('selectEmailServices:', () => {
  const emailAddress = 'foo@example.com';
  const emailAddresses = ['a@example.com', 'b@example.com', 'c@example.com'];

  let log, redis, mailer, emailService, selectEmailServices, random;

  before(() => {
    log = mocks.mockLog();
    redis = {};
    mailer = { mailer: true };
    emailService = { emailService: true };
    selectEmailServices = proxyquire(
      `${ROOT_DIR}/lib/senders/select_email_services`,
      {
        '../redis': () => redis,
      }
    )(log, config, mailer, emailService);
    random = Math.random;
  });

  after(() => (Math.random = random));

  describe('redis.get returns sendgrid percentage-only match:', () => {
    before(() => {
      redis.get = sinon.spy(() =>
        Promise.resolve(JSON.stringify({ sendgrid: { percentage: 11 } }))
      );
      Math.random = () => 0.109;
    });

    it('selectEmailServices returns the correct data', async () => {
      const result = await selectEmailServices({ email: emailAddress });
      assert.deepEqual(result, [
        {
          mailer: emailService,
          emailAddresses: [emailAddress],
          emailService: 'fxa-email-service',
          emailSender: 'sendgrid',
        },
      ]);
    });
  });

  describe('redis.get returns sendgrid percentage-only mismatch:', () => {
    before(() => {
      redis.get = sinon.spy(() =>
        Promise.resolve(JSON.stringify({ sendgrid: { percentage: 11 } }))
      );
      Math.random = () => 0.11;
    });

    it('selectEmailServices returns the correct data', async () => {
      const result = await selectEmailServices({ email: emailAddress });
      assert.deepEqual(result, [
        {
          mailer: mailer,
          emailAddresses: [emailAddress],
          emailService: 'fxa-auth-server',
          emailSender: 'ses',
        },
      ]);
    });

    describe('redis.get returns sendgrid regex-only match:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({ sendgrid: { regex: '^foo@example\\.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
          },
        ]);
      });
    });

    describe('redis.get returns sendgrid regex-only mismatch:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({ sendgrid: { regex: '^fo@example\\.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns sendgrid combined match:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({
              sendgrid: {
                percentage: 1,
                regex: '^foo@example\\.com$',
              },
            })
          )
        );
        Math.random = () => 0.009;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
          },
        ]);
      });
    });

    describe('redis.get returns sendgrid combined mismatch (percentage):', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({
              sendgrid: {
                percentage: 1,
                regex: '^foo@example\\.com$',
              },
            })
          )
        );
        Math.random = () => 0.01;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns sendgrid combined mismatch (regex):', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({
              sendgrid: {
                percentage: 1,
                regex: '^ffoo@example\\.com$',
              },
            })
          )
        );
        Math.random = () => 0;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns socketlabs percentage-only match:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(JSON.stringify({ socketlabs: { percentage: 42 } }))
        );
        Math.random = () => 0.419;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'socketlabs',
          },
        ]);
      });
    });

    describe('redis.get returns socketlabs percentage-only mismatch:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(JSON.stringify({ socketlabs: { percentage: 42 } }))
        );
        Math.random = () => 0.42;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns socketlabs regex-only match:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({ socketlabs: { regex: '^foo@example\\.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'socketlabs',
          },
        ]);
      });
    });

    describe('redis.get returns ses percentage-only match:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(JSON.stringify({ ses: { percentage: 100 } }))
        );
        Math.random = () => 0.999;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns ses percentage-only mismatch:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(JSON.stringify({ ses: { percentage: 99 } }))
        );
        Math.random = () => 0.999;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns ses regex-only match:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({ ses: { regex: '^foo@example\\.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns sendgrid and ses matches:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({
              sendgrid: { percentage: 10 },
              ses: { regex: '^foo@example\\.com$' },
            })
          )
        );
        Math.random = () => 0.09;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
          },
        ]);
      });
    });

    describe('redis.get returns sendgrid match and ses mismatch:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({
              sendgrid: { percentage: 10 },
              ses: { regex: '^ffoo@example\\.com$' },
            })
          )
        );
        Math.random = () => 0.09;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
          },
        ]);
      });
    });

    describe('redis.get returns sendgrid mismatch and ses match:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({
              sendgrid: { percentage: 10 },
              ses: { regex: '^foo@example\\.com$' },
            })
          )
        );
        Math.random = () => 0.1;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: emailService,
            emailAddresses: [emailAddress],
            emailService: 'fxa-email-service',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns sendgrid and ses mismatches:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({
              sendgrid: { percentage: 10 },
              ses: { regex: '^ffoo@example\\.com$' },
            })
          )
        );
        Math.random = () => 0.1;
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns undefined:', () => {
      before(() => {
        redis.get = sinon.spy(() => Promise.resolve());
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns unsafe regex:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({ sendgrid: { regex: '^(.+)+@example\\.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get returns quote-terminating regex:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({ sendgrid: { regex: '"@example\\.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('email address contains quote-terminator:', () => {
      before(() => {
        redis.get = sinon.spy(() =>
          Promise.resolve(
            JSON.stringify({ sendgrid: { regex: '@example\\.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', async () => {
        const result = await selectEmailServices({ email: '"@example.com' });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: ['"@example.com'],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });
    });

    describe('redis.get fails:', () => {
      before(() => {
        log.error.resetHistory();
        redis.get = sinon.spy(() => Promise.reject({ message: 'wibble' }));
      });

      it('selectEmailServices returns fallback data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
        assert.equal(log.error.callCount, 1);
        const args = log.error.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0], 'emailConfig.read.error');
        assert.deepEqual(args[1], {
          err: 'wibble',
        });
      });
    });

    describe('redis.get returns invalid JSON:', () => {
      before(() => {
        log.error.resetHistory();
        redis.get = sinon.spy(() => Promise.resolve('wibble'));
      });

      it('selectEmailServices returns fallback data', async () => {
        const result = await selectEmailServices({ email: emailAddress });
        assert.deepEqual(result, [
          {
            mailer: mailer,
            emailAddresses: [emailAddress],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
        assert.equal(log.error.callCount, 1);
        assert.equal(log.error.args[0][0], 'emailConfig.parse.error');
      });
    });
  });

  describe('redis.get returns sendgrid match:', () => {
    before(() => {
      redis.get = sinon.spy(() =>
        Promise.resolve(
          JSON.stringify({ sendgrid: { regex: 'example\\.com' } })
        )
      );
    });

    it('selectEmailServices returns the correct data', async () => {
      const result = await selectEmailServices({ email: emailAddress });
      assert.deepEqual(result, [
        {
          mailer: emailService,
          emailAddresses: [emailAddress],
          emailService: 'fxa-email-service',
          emailSender: 'sendgrid',
        },
      ]);
    });
  });

  describe('redis.get returns sendgrid mismatch:', () => {
    before(() => {
      redis.get = sinon.spy(() =>
        Promise.resolve(
          JSON.stringify({ sendgrid: { regex: 'example\\.org' } })
        )
      );
    });

    it('selectEmailServices returns the correct data', async () => {
      const result = await selectEmailServices({ email: emailAddress });
      assert.deepEqual(result, [
        {
          mailer: mailer,
          emailAddresses: [emailAddress],
          emailService: 'fxa-auth-server',
          emailSender: 'ses',
        },
      ]);
    });
  });

  describe('redis.get returns sendgrid and ses matches and a mismatch:', () => {
    before(() => {
      redis.get = sinon.spy(() =>
        Promise.resolve(
          JSON.stringify({
            sendgrid: { regex: '^a' },
            ses: { regex: '^b' },
          })
        )
      );
    });

    it('selectEmailServices returns the correct data', async () => {
      const result = await selectEmailServices({
        email: emailAddresses[0],
        ccEmails: emailAddresses.slice(1),
      });
      assert.deepEqual(result, [
        {
          mailer: emailService,
          emailAddresses: emailAddresses.slice(0, 1),
          emailService: 'fxa-email-service',
          emailSender: 'sendgrid',
        },
        {
          mailer: emailService,
          emailAddresses: emailAddresses.slice(1, 2),
          emailService: 'fxa-email-service',
          emailSender: 'ses',
        },
        {
          mailer: mailer,
          emailAddresses: emailAddresses.slice(2),
          emailService: 'fxa-auth-server',
          emailSender: 'ses',
        },
      ]);
    });
  });

  describe('redis.get returns a sendgrid match and two ses matches:', () => {
    before(() => {
      redis.get = sinon.spy(() =>
        Promise.resolve(
          JSON.stringify({
            sendgrid: { regex: '^a' },
            ses: { regex: '^b|c' },
          })
        )
      );
    });

    it('selectEmailServices returns the correct data', async () => {
      const result = await selectEmailServices({
        email: emailAddresses[0],
        ccEmails: emailAddresses.slice(1),
      });
      assert.deepEqual(result, [
        {
          mailer: emailService,
          emailAddresses: emailAddresses.slice(0, 1),
          emailService: 'fxa-email-service',
          emailSender: 'sendgrid',
        },
        {
          mailer: emailService,
          emailAddresses: emailAddresses.slice(1),
          emailService: 'fxa-email-service',
          emailSender: 'ses',
        },
      ]);
    });
  });

  describe('redis.get returns three mismatches:', () => {
    before(() => {
      redis.get = sinon.spy(() =>
        Promise.resolve(
          JSON.stringify({
            sendgrid: { regex: 'wibble' },
            ses: { regex: 'blee' },
          })
        )
      );
    });

    it('selectEmailServices returns the correct data', async () => {
      const result = await selectEmailServices({
        email: emailAddresses[0],
        ccEmails: emailAddresses.slice(1),
      });
      assert.deepEqual(result, [
        {
          mailer: mailer,
          emailAddresses: emailAddresses,
          emailService: 'fxa-auth-server',
          emailSender: 'ses',
        },
      ]);
    });
  });
});

describe('selectEmailServices with mocked sandbox:', () => {
  const emailAddress = 'foo@example.com';

  let log, redis, Sandbox, sandbox, mailer, emailService, selectEmailServices;

  before(() => {
    log = mocks.mockLog();
    redis = {
      get: sinon.spy(() =>
        Promise.resolve(
          JSON.stringify({ sendgrid: { regex: '^foo@example\\.com$' } })
        )
      ),
    };
    // eslint-disable-next-line prefer-arrow-callback
    Sandbox = sinon.spy(function() {
      return sandbox;
    });
    sandbox = {
      run: sinon.spy(),
    };
    mailer = { mailer: true };
    emailService = { emailService: true };

    selectEmailServices = proxyquire(
      `${ROOT_DIR}/lib/senders/select_email_services`,
      {
        '../redis': () => redis,
        sandbox: Sandbox,
      }
    )(log, config, mailer, emailService);
  });

  afterEach(() => {
    sandbox.run.resetHistory();
  });

  describe('call selectEmailServices:', () => {
    let promise, result, failed;

    beforeEach(done => {
      promise = selectEmailServices({ email: emailAddress })
        .then(r => (result = r))
        .catch(() => (failed = true));

      // HACK: Ensure enough ticks pass to reach the sandbox step
      setImmediate(() =>
        setImmediate(() => setImmediate(() => setImmediate(done)))
      );
    });

    it('called the sandbox correctly', () => {
      assert.equal(Sandbox.callCount, 1);

      let args = Sandbox.args[0];
      assert.equal(args.length, 1);
      assert.deepEqual(args[0], {
        timeout: 100,
      });

      assert.equal(sandbox.run.callCount, 1);

      args = sandbox.run.args[0];
      assert.equal(args.length, 2);
      assert.equal(
        args[0],
        'new RegExp("^foo@example\\.com$").test("foo@example.com")'
      );
      assert.equal(typeof args[1], 'function');
    });

    describe('call sandbox result handler with match:', () => {
      beforeEach(() => {
        sandbox.run.args[0][1]({ result: 'true' });
        return promise;
      });

      it('resolved', () => {
        assert.deepEqual(result, [
          {
            emailAddresses: ['foo@example.com'],
            mailer: emailService,
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
          },
        ]);
      });

      it('did not fail', () => {
        assert.equal(failed, undefined);
      });
    });

    describe('call sandbox result handler with timeout:', () => {
      beforeEach(() => {
        sandbox.run.args[0][1]({ result: 'TimeoutError' });
        return promise;
      });

      it('resolved', () => {
        assert.deepEqual(result, [
          {
            emailAddresses: ['foo@example.com'],
            mailer: mailer,
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
          },
        ]);
      });

      it('did not fail', () => {
        assert.equal(failed, undefined);
      });
    });
  });
});

describe('call selectEmailServices with mocked safe-regex, regex-only match and redos regex:', () => {
  const emailAddress = 'foo@example.com';

  let log, redis, safeRegex, mailer, emailService, selectEmailServices;

  before(() => {
    log = mocks.mockLog();
    redis = {
      get: sinon.spy(() =>
        Promise.resolve(
          JSON.stringify({
            sendgrid: { regex: '^((((.*)*)*)*)*@example\\.com$' },
          })
        )
      ),
    };
    // eslint-disable-next-line prefer-arrow-callback
    safeRegex = sinon.spy(function() {
      return true;
    });
    mailer = { mailer: true };
    emailService = { emailService: true };

    selectEmailServices = proxyquire(
      `${ROOT_DIR}/lib/senders/select_email_services`,
      {
        '../redis': () => redis,
        'safe-regex': safeRegex,
      }
    )(log, config, mailer, emailService);
  });

  it('email address was treated as mismatch', async () => {
    const result = await selectEmailServices({ email: emailAddress });
    assert.deepEqual(result, [
      {
        mailer: mailer,
        emailAddresses: [emailAddress],
        emailService: 'fxa-auth-server',
        emailSender: 'ses',
      },
    ]);

    assert.equal(safeRegex.callCount, 1);
    const args = safeRegex.args[0];
    assert.equal(args.length, 1);
    assert.equal(args[0], '^((((.*)*)*)*)*@example\\.com$');
  });
});

if (config.redis.email.enabled) {
  describe('selectEmailServices with real redis:', function() {
    const emailAddress = 'foo@example.com';

    let emailService, selectEmailServices;

    this.timeout(10000);

    before(() => {
      emailService = { emailService: true };
      selectEmailServices = require(`${ROOT_DIR}/lib/senders/select_email_services`)(
        mocks.mockLog(),
        config,
        { mailer: true },
        emailService
      );
    });

    it('returned the correct results', async () => {
      // eslint-disable-next-line space-unary-ops
      await ['sendgrid', 'ses', 'socketlabs'].reduce(
        async (promise, service) => {
          await promise;

          await redisWrite({
            [service]: {
              regex: '^foo@example.com$',
              percentage: 100,
            },
          });
          const result = await selectEmailServices({ email: emailAddress });
          await redisRevert();

          assert.deepEqual(result, [
            {
              emailAddresses: [emailAddress],
              emailService: 'fxa-email-service',
              emailSender: service,
              mailer: emailService,
            },
          ]);
        },
        Promise.resolve()
      );
    });
  });
}

function redisWrite(emailConfig) {
  return cp.execAsync(
    `echo '${JSON.stringify(emailConfig)}' | node scripts/email-config write`,
    {
      cwd: path.resolve(__dirname, '../../..'),
    }
  );
}

function redisRevert() {
  return cp.execAsync('node scripts/email-config revert', {
    cwd: path.resolve(__dirname, '../../..'),
  });
}
