/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const crypto = require('crypto');
const Client = require('../client')();
const config = require('../../config').default.getProperties();
const mocks = require('../mocks');
const { default: Container } = require('typedi');
const {
  PlaySubscriptions,
} = require('../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../lib/payments/iap/apple-app-store/subscriptions');

// Note, intentionally not indenting for code review.
[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote account create`, function () {
    this.timeout(60000);
    let server;

    before(async function () {
      config.subscriptions = {
        enabled: true,
        stripeApiKey: 'fake_key',
        paypalNvpSigCredentials: {
          enabled: false,
        },
        paymentsServer: {
          url: 'http://fakeurl.com',
        },
        productConfigsFirestore: { enabled: true },
      };
      const mockStripeHelper = {};
      mockStripeHelper.hasActiveSubscription = async () =>
        Promise.resolve(false);
      mockStripeHelper.removeCustomer = async () => Promise.resolve();

      Container.set(PlaySubscriptions, {});
      Container.set(AppStoreSubscriptions, {});

      server = await TestServer.start(config, false, {
        authServerMockDependencies: {
          '../lib/payments/stripe': {
            StripeHelper: mockStripeHelper,
            createStripeHelper: () => mockStripeHelper,
          },
        },
      });
      return server;
    });

    after(async function () {
      await TestServer.stop(server);
    });

    it('unverified account fail when getting keys', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.create(config.publicUrl, email, password, testOptions)
        .then((x) => {
          client = x;
          assert.ok(client.authAt, 'authAt was set');
        })
        .then(() => {
          return client.keys();
        })
        .then(
          (keys) => {
            assert(false, 'got keys before verifying email');
          },
          (err) => {
            assert.equal(err.errno, 104, 'Unverified account error code');
            assert.equal(
              err.message,
              'Unconfirmed account',
              'Unverified account error message'
            );
          }
        );
    });

    it('create and verify sync account', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.create(config.publicUrl, email, password, {
        ...testOptions,
        service: 'sync',
      })
        .then((x) => {
          client = x;
          assert.ok(client.authAt, 'authAt was set');
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, false);
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-mailer'], undefined);
          assert.equal(emailData.headers['x-template-name'], 'verify');
          return emailData.headers['x-verify-code'];
        })
        .then((verifyCode) => {
          return client.verifyEmail(verifyCode, { service: 'sync' });
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(
            emailData.headers['x-link'].indexOf(config.smtp.syncUrl),
            0,
            'sync url present'
          );
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true);
        });
    });

    it('create account with service identifier and resume', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      return Client.create(config.publicUrl, email, password, {
        ...testOptions,
        service: 'abcdef',
        resume: 'foo',
      })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-service-id'], 'abcdef');
          assert.ok(emailData.headers['x-link'].indexOf('resume=foo') > -1);
        });
    });

    it('create account allows localization of emails', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.create(config.publicUrl, email, password, testOptions)
        .then((x) => {
          client = x;
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then(async (emailData) => {
          assert.include(emailData.text, 'Confirm account', 'en-US');
          // TODO: reinstate after translations catch up
          //assert.notInclude(emailData.text, 'Ativar agora', 'not pt-BR');
          const code = emailData.headers['x-verify-code'];
          await client.verifyEmail(code, {});
          return client.destroyAccount();
        })
        .then(() => {
          return Client.create(config.publicUrl, email, password, {
            ...testOptions,
            lang: 'pt-br',
          });
        })
        .then((x) => {
          client = x;
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then(async (emailData) => {
          assert.notInclude(emailData.text, 'Confirm email', 'not en-US');
          // TODO: reinstate after translations catch up
          //assert.include(emailData.text, 'Ativar agora', 'is pt-BR');
          const code = emailData.headers['x-verify-code'];
          await client.verifyEmail(code, {});
          return client.destroyAccount();
        });
    });

    it('Unknown account should not exist', () => {
      const client = new Client(config.publicUrl, testOptions);
      client.email = server.uniqueEmail();
      client.authPW = crypto.randomBytes(32);
      client.authPWVersion2 = crypto.randomBytes(32);
      return client.auth().then(
        () => {
          assert(false, 'account should not exist');
        },
        (err) => {
          assert.equal(err.errno, 102, 'account does not exist');
        }
      );
    });

    it('stubs account and finishes setup', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(config.publicUrl, testOptions);
      await client.setupCredentials(email, password);

      if (testOptions.version === 'V2') {
        await client.setupCredentialsV2(email, password);
      }

      // Stub account for 123Done
      const stubResponse = await client.stubAccount('dcdb5ae7add825d2');
      assert.exists(stubResponse.setup_token);

      // Finish the setup.
      const response = await client.finishAccountSetup(
        stubResponse.setup_token
      );
      assert.exists(response.uid);
      assert.exists(response.sessionToken);
      assert.exists(response.verified);
      assert.isFalse(response.verified);

      // Now a client should be able login
      const client2 = await Client.login(
        config.publicUrl,
        email,
        password,
        testOptions
      );
      assert.exists(client2.sessionToken);
    });

    it('cannot stub the same account twice', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const stub = async () => {
        const client = new Client(config.publicUrl, testOptions);
        await client.setupCredentials(email, password);

        if (testOptions.version === 'V2') {
          await client.setupCredentialsV2(email, password);
        }

        const stubResponse = await client.stubAccount('dcdb5ae7add825d2');
        assert.exists(stubResponse.setup_token);
      };

      // The second attempt to stub should fail, because the email has already been
      // stubbed
      await stub();
      assert.isRejected(stub());
    });

    it('fails to create account with a corrupt setup token', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(config.publicUrl, testOptions);
      await client.setupCredentials(email, password);

      if (testOptions.version === 'V2') {
        await client.setupCredentialsV2(email, password);
      }

      const stubResponse = await client.stubAccount('dcdb5ae7add825d2');
      assert.exists(stubResponse.setup_token);

      // modify the setup token and make sure it fails
      stubResponse.setup_token = stubResponse.setup_token
        .toString()
        .substring(2);

      // Finish the setup. Should fail because the setup token is bad
      assert.isRejected(client.finishAccountSetup(stubResponse.setup_token));
    });

    it('fails to call finish setup again', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(config.publicUrl, testOptions);
      await client.setupCredentials(email, password);

      if (testOptions.version === 'V2') {
        await client.setupCredentialsV2(email, password);
      }

      const stubResponse = await client.stubAccount('dcdb5ae7add825d2');
      await client.finishAccountSetup(stubResponse.setup_token);

      //Should fail because finish account setup was already called
      assert.isRejected(client.finishAccountSetup(stubResponse.setup_token));
    });

    it('/account/create works with proper data', () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      let client;
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      )
        .then((x) => {
          client = x;
          assert.ok(client.uid, 'account created');
        })
        .then(() => {
          return client.login();
        })
        .then(() => {
          assert.ok(client.sessionToken, 'client can login');
        });
    });

    it('/account/create returns a sessionToken', () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(config.publicUrl, testOptions);
      return client.setupCredentials(email, password).then((c) => {
        return c.api.accountCreate(c.email, c.authPW).then((response) => {
          assert.ok(response.sessionToken, 'has a sessionToken');
          assert.equal(
            response.keyFetchToken,
            undefined,
            'no keyFetchToken without keys=true'
          );
        });
      });
    });

    it('/account/create returns a keyFetchToken when keys=true', () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = new Client(config.publicUrl, testOptions);
      return client.setupCredentials(email, password).then((c) => {
        return c.api
          .accountCreate(c.email, c.authPW, { keys: true })
          .then((response) => {
            assert.ok(response.sessionToken, 'has a sessionToken');
            assert.ok(response.keyFetchToken, 'keyFetchToken with keys=true');
          });
      });
    });

    it('signup with same email, different case', () => {
      const email = server.uniqueEmail();
      const email2 = email.toUpperCase();
      const password = 'abcdef';
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      )
        .then((c) => {
          return Client.create(config.publicUrl, email2, password, testOptions);
        })
        .then(assert.fail, (err) => {
          assert.equal(err.code, 400);
          assert.equal(err.errno, 101, 'Account already exists');
          assert.equal(
            err.email,
            email,
            'The existing email address is returned'
          );
        });
    });

    it('re-signup against an unverified email', () => {
      const email = server.uniqueEmail();
      const password = 'abcdef';
      return Client.create(config.publicUrl, email, password, testOptions)
        .then(() => {
          // delete the first verification email
          return server.mailbox.waitForEmail(email);
        })
        .then(() => {
          return Client.createAndVerify(
            config.publicUrl,
            email,
            password,
            server.mailbox,
            testOptions
          );
        })
        .then((client) => {
          assert.ok(client.uid, 'account created');
        });
    });

    it('invalid redirectTo', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        redirectTo: 'http://accounts.firefox.com.evil.us',
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 107, 'bad redirectTo rejected');
        })
        .then(() => {
          return api.passwordForgotSendCode(email, options);
        })
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 107, 'bad redirectTo rejected');
        });
    });

    it('another invalid redirectTo', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        redirectTo: 'https://www.fake.com/.firefox.com',
      };

      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 107, 'bad redirectTo rejected');
        })
        .then(() => {
          return api.passwordForgotSendCode(email, {
            redirectTo: 'https://fakefirefox.com',
          });
        })
        .then(assert.fail, (err) => {
          assert.equal(err.errno, 107, 'bad redirectTo rejected');
        });
    });

    it('valid metricsContext', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: 'bar',
          utmContent: 'baz',
          utmMedium: 'qux',
          utmSource: 'wibble',
          utmTerm: 'blee',
        },
      };
      return api.accountCreate(email, authPW, options);
    });

    it('empty metricsContext', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {},
      };
      return api.accountCreate(email, authPW, options);
    });

    it('invalid entrypoint', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: ';',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: 'foo',
          utmContent: 'bar',
          utmMedium: 'baz',
          utmSource: 'qux',
          utmTerm: 'wibble',
        },
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => assert.equal(err.errno, 107));
    });

    it('invalid entrypointExperiment', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: ';',
          entrypointVariation: 'var',
          utmCampaign: 'bar',
          utmContent: 'baz',
          utmMedium: 'qux',
          utmSource: 'wibble',
          utmTerm: 'blee',
        },
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => assert.equal(err.errno, 107));
    });

    it('invalid entrypointVariation', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: 'exp',
          entrypointVariation: ';',
          utmCampaign: 'bar',
          utmContent: 'baz',
          utmMedium: 'qux',
          utmSource: 'wibble',
          utmTerm: 'blee',
        },
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => assert.equal(err.errno, 107));
    });

    it('invalid utmCampaign', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: ';',
          utmContent: 'bar',
          utmMedium: 'baz',
          utmSource: 'qux',
          utmTerm: 'wibble',
        },
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => assert.equal(err.errno, 107));
    });

    it('invalid utmContent', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: 'bar',
          utmContent: ';',
          utmMedium: 'baz',
          utmSource: 'qux',
          utmTerm: 'wibble',
        },
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => assert.equal(err.errno, 107));
    });

    it('invalid utmMedium', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: 'bar',
          utmContent: 'baz',
          utmMedium: ';',
          utmSource: 'qux',
          utmTerm: 'wibble',
        },
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => assert.equal(err.errno, 107));
    });

    it('invalid utmSource', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: 'bar',
          utmContent: 'baz',
          utmMedium: 'qux',
          utmSource: ';',
          utmTerm: 'wibble',
        },
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => assert.equal(err.errno, 107));
    });

    it('invalid utmTerm', () => {
      const api = new Client.Api(config.publicUrl, testOptions);
      const email = server.uniqueEmail();
      const authPW =
        '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      const options = {
        ...testOptions,
        metricsContext: {
          entrypoint: 'foo',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          utmCampaign: 'bar',
          utmContent: 'baz',
          utmMedium: 'qux',
          utmSource: 'wibble',
          utmTerm: ';',
        },
      };
      return api
        .accountCreate(email, authPW, options)
        .then(assert.fail, (err) => assert.equal(err.errno, 107));
    });

    it('create account with service query parameter', () => {
      const email = server.uniqueEmail();
      return Client.create(config.publicUrl, email, 'foo', {
        ...testOptions,
        serviceQuery: 'bar',
      })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(
            emailData.headers['x-service-id'],
            'bar',
            'service query parameter was propagated'
          );
        });
    });

    it('account creation works with unicode email address', () => {
      const email = server.uniqueUnicodeEmail();
      return Client.create(config.publicUrl, email, 'foo', testOptions)
        .then((client) => {
          assert.ok(client, 'created account');
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.ok(emailData, 'received email');
        });
    });

    it('account creation fails with invalid metricsContext flowId', () => {
      const email = server.uniqueEmail();
      return Client.create(config.publicUrl, email, 'foo', {
        ...testOptions,
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00d',
          flowBeginTime: 1,
        },
      }).then(
        () => {
          assert(false, 'account creation should have failed');
        },
        (err) => {
          assert.ok(err, 'account creation failed');
        }
      );
    });

    it('account creation fails with invalid metricsContext flowBeginTime', () => {
      const email = server.uniqueEmail();
      return Client.create(config.publicUrl, email, 'foo', {
        ...testOptions,
        metricsContext: {
          flowId:
            'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
          flowBeginTime: 0,
        },
      }).then(
        () => {
          assert(false, 'account creation should have failed');
        },
        (err) => {
          assert.ok(err, 'account creation failed');
        }
      );
    });

    it('account creation works with maximal metricsContext metadata', () => {
      const email = server.uniqueEmail();
      const options = {
        ...testOptions,
        metricsContext: mocks.generateMetricsContext(),
      };
      return Client.create(config.publicUrl, email, 'foo', options)
        .then((client) => {
          assert.ok(client, 'created account');
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(
            emailData.headers['x-flow-begin-time'],
            options.metricsContext.flowBeginTime,
            'flow begin time set'
          );
          assert.equal(
            emailData.headers['x-flow-id'],
            options.metricsContext.flowId,
            'flow id set'
          );
        });
    });

    it('account creation works with empty metricsContext metadata', () => {
      const email = server.uniqueEmail();
      return Client.create(config.publicUrl, email, 'foo', {
        ...testOptions,
        metricsContext: {},
      }).then((client) => {
        assert.ok(client, 'created account');
      });
    });

    it('account creation fails with missing flowBeginTime', () => {
      const email = server.uniqueEmail();
      return Client.create(config.publicUrl, email, 'foo', {
        ...testOptions,
        metricsContext: {
          flowId:
            'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
        },
      }).then(
        () => {
          assert(false, 'account creation should have failed');
        },
        (err) => {
          assert.ok(err, 'account creation failed');
        }
      );
    });

    it('account creation fails with missing flowId', () => {
      const email = server.uniqueEmail();
      return Client.create(config.publicUrl, email, 'foo', {
        ...testOptions,
        metricsContext: {
          flowBeginTime: Date.now(),
        },
      }).then(
        () => {
          assert(false, 'account creation should have failed');
        },
        (err) => {
          assert.ok(err, 'account creation failed');
        }
      );
    });

    it('create account for non-sync service, gets generic sign-up email and does not get post-verify email', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.create(config.publicUrl, email, password, testOptions)
        .then((x) => {
          client = x;
          assert.ok('account was created');
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'verify');
          return emailData.headers['x-verify-code'];
        })
        .then((verifyCode) => {
          return client.verifyEmail(verifyCode, { service: 'testpilot' });
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true);
        })
        .then(() => {
          // It's hard to test for "an email didn't arrive.
          // Instead trigger sending of another email and test
          // that there wasn't anything in the queue before it.
          return client.forgotPassword();
        })
        .then(() => {
          return server.mailbox.waitForCode(email);
        })
        .then((code) => {
          assert.ok(code, 'the next email was reset-password, not post-verify');
        });
    });

    it('create account for unspecified service does not get create sync email and no post-verify email', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.create(config.publicUrl, email, password, testOptions)
        .then((x) => {
          client = x;
          assert.ok('account was created');
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'verify');
          return emailData.headers['x-verify-code'];
        })
        .then((verifyCode) => {
          return client.verifyEmail(verifyCode, {}); // no 'service' param
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true);
        })
        .then(() => {
          // It's hard to test for "an email didn't arrive.
          // Instead trigger sending of another email and test
          // that there wasn't anything in the queue before it.
          return client.forgotPassword();
        })
        .then(() => {
          return server.mailbox.waitForCode(email);
        })
        .then((code) => {
          assert.ok(code, 'the next email was reset-password, not post-verify');
        });
    });

    it('create account and subscribe to newsletters', () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.create(config.publicUrl, email, password, {
        ...testOptions,
        service: 'sync',
      })
        .then((x) => {
          client = x;
          assert.ok('account was created');
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          return emailData.headers['x-verify-code'];
        })
        .then((verifyCode) => {
          return client.verifyEmail(verifyCode, {
            service: 'sync',
            newsletters: ['test-pilot'],
          });
        })
        .then(() => {
          return client.emailStatus();
        })
        .then((status) => {
          assert.equal(status.verified, true);
        })
        .then(() => {
          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'postVerify');
        });
    });

    it('maintains single kB value for account create with V1 & V2 credentials', async function () {
      if (testOptions.version !== 'V2') {
        return this.skip();
      }

      const email = server.uniqueEmail();
      const password = 'F00BAR';

      const client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
          service: 'sync',
        }
      );

      await client.getKeysV1();
      await client.getKeysV2();
      const originalKb = client.kB;
      const clientSalt = await client.getClientSalt();

      // Log in with new clients and grab kbs
      const clientV1 = await login(email, password);
      await clientV1.getKeysV1();
      const kB1 = clientV1.kB;

      const clientV2 = await login(email, password, 'V2');
      await clientV2.getKeysV2();
      const kB2 = clientV2.kB;

      assert.exists(originalKb);
      assert.isTrue(
        clientSalt.startsWith('identity.mozilla.com/picl/v1/quickStretchV2:')
      );
      assert.equal(kB1, originalKb);
      assert.equal(kB2, originalKb);
    });

    it('maintains single kB value after account password upgrade from V1 to V2', async function () {
      if (testOptions.version !== 'V2') {
        return this.skip();
      }

      const email = server.uniqueEmail();
      const password = 'F00BAR';

      const client = await Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        {
          ...testOptions,
          keys: true,
          service: 'sync',
        }
      );

      await client.keys();

      const originalKb = client.getState().kB;
      await client.upgradeCredentials(password);

      // Login with two different client versions and check the kB values
      const clientV1 = await login(email, password);
      await clientV1.getKeysV1();

      const kB1 = clientV1.kB;

      const clientV2 = await login(email, password, 'V2');
      await clientV2.getKeysV2();
      const kB2 = clientV2.kB;

      assert.exists(originalKb);
      assert.equal(kB1, originalKb);
      assert.equal(kB2, originalKb);
    });

    async function login(email, password, version = '') {
      return await Client.login(config.publicUrl, email, password, {
        ...testOptions,
        version,
        keys: true,
        service: 'sync',
      });
    }
  });
});
