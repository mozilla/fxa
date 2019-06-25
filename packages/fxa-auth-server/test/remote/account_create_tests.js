/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const crypto = require('crypto');
const Client = require('../client')();
const config = require('../../config').getProperties();
const mocks = require('../mocks');

describe('remote account create', function() {
  this.timeout(15000);
  let server;
  before(async () => {
    server = await TestServer.start(config);
    return server;
  });

  it('unverified account fail when getting keys', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.create(config.publicUrl, email, password)
      .then(x => {
        client = x;
        assert.ok(client.authAt, 'authAt was set');
      })
      .then(() => {
        return client.keys();
      })
      .then(
        keys => {
          assert(false, 'got keys before verifying email');
        },
        err => {
          assert.equal(err.errno, 104, 'Unverified account error code');
          assert.equal(
            err.message,
            'Unverified account',
            'Unverified account error message'
          );
        }
      );
  });

  it('create and verify sync account', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.create(config.publicUrl, email, password, { service: 'sync' })
      .then(x => {
        client = x;
        assert.ok(client.authAt, 'authAt was set');
      })
      .then(() => {
        return client.emailStatus();
      })
      .then(status => {
        assert.equal(status.verified, false);
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(emailData.headers['x-mailer'], undefined);
        assert.equal(emailData.headers['x-template-name'], 'verifySyncEmail');
        assert.equal(emailData.html.indexOf('IP address') > -1, true); // Ensure some location data is present
        return emailData.headers['x-verify-code'];
      })
      .then(verifyCode => {
        return client.verifyEmail(verifyCode, { service: 'sync' });
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(
          emailData.headers['x-link'].indexOf(config.smtp.syncUrl),
          0,
          'sync url present'
        );
      })
      .then(() => {
        return client.emailStatus();
      })
      .then(status => {
        assert.equal(status.verified, true);
      });
  });

  it('create account with service identifier and resume', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null; // eslint-disable-line no-unused-vars
    const options = { service: 'abcdef', resume: 'foo' };
    return Client.create(config.publicUrl, email, password, options)
      .then(x => {
        client = x;
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(emailData.headers['x-service-id'], 'abcdef');
        assert.ok(emailData.headers['x-link'].indexOf('resume=foo') > -1);
      });
  });

  it('create account allows localization of emails', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.create(config.publicUrl, email, password)
      .then(x => {
        client = x;
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert(emailData.text.indexOf('Activate now') !== -1, 'not en-US');
        assert(emailData.text.indexOf('Ativar agora') === -1, 'not pt-BR');
        return client.destroyAccount();
      })
      .then(() => {
        return Client.create(config.publicUrl, email, password, {
          lang: 'pt-br',
        });
      })
      .then(x => {
        client = x;
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert(emailData.text.indexOf('Activate now') === -1, 'not en-US');
        assert(emailData.text.indexOf('Ativar agora') !== -1, 'is pt-BR');
        return client.destroyAccount();
      });
  });

  it('Unknown account should not exist', () => {
    const client = new Client(config.publicUrl);
    client.email = server.uniqueEmail();
    client.authPW = crypto.randomBytes(32);
    return client.auth().then(
      () => {
        assert(false, 'account should not exist');
      },
      err => {
        assert.equal(err.errno, 102, 'account does not exist');
      }
    );
  });

  it('/account/create works with proper data', () => {
    const email = server.uniqueEmail();
    const password = 'ilikepancakes';
    let client;
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(x => {
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
    const client = new Client(config.publicUrl);
    return client.setupCredentials(email, password).then(c => {
      return c.api.accountCreate(c.email, c.authPW).then(response => {
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
    const client = new Client(config.publicUrl);
    return client.setupCredentials(email, password).then(c => {
      return c.api
        .accountCreate(c.email, c.authPW, { keys: true })
        .then(response => {
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
      server.mailbox
    )
      .then(c => {
        return Client.create(config.publicUrl, email2, password);
      })
      .then(assert.fail, err => {
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
    return Client.create(config.publicUrl, email, password)
      .then(() => {
        // delete the first verification email
        return server.mailbox.waitForEmail(email);
      })
      .then(() => {
        return Client.createAndVerify(
          config.publicUrl,
          email,
          password,
          server.mailbox
        );
      })
      .then(client => {
        assert.ok(client.uid, 'account created');
      });
  });

  it('invalid redirectTo', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
      redirectTo: 'http://accounts.firefox.com.evil.us',
    };
    return api
      .accountCreate(email, authPW, options)
      .then(assert.fail, err => {
        assert.equal(err.errno, 107, 'bad redirectTo rejected');
      })
      .then(() => {
        return api.passwordForgotSendCode(email, options);
      })
      .then(assert.fail, err => {
        assert.equal(err.errno, 107, 'bad redirectTo rejected');
      });
  });

  it('another invalid redirectTo', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
      redirectTo: 'https://www.fake.com/.firefox.com',
    };

    return api
      .accountCreate(email, authPW, options)
      .then(assert.fail, err => {
        assert.equal(err.errno, 107, 'bad redirectTo rejected');
      })
      .then(() => {
        return api.passwordForgotSendCode(email, {
          redirectTo: 'https://fakefirefox.com',
        });
      })
      .then(assert.fail, err => {
        assert.equal(err.errno, 107, 'bad redirectTo rejected');
      });
  });

  it('valid metricsContext', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
      metricsContext: {},
    };
    return api.accountCreate(email, authPW, options);
  });

  it('invalid entrypoint', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
      .then(assert.fail, err => assert.equal(err.errno, 107));
  });

  it('invalid entrypointExperiment', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
      .then(assert.fail, err => assert.equal(err.errno, 107));
  });

  it('invalid entrypointVariation', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
      .then(assert.fail, err => assert.equal(err.errno, 107));
  });

  it('invalid utmCampaign', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
      .then(assert.fail, err => assert.equal(err.errno, 107));
  });

  it('invalid utmContent', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
      .then(assert.fail, err => assert.equal(err.errno, 107));
  });

  it('invalid utmMedium', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
      .then(assert.fail, err => assert.equal(err.errno, 107));
  });

  it('invalid utmSource', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
      .then(assert.fail, err => assert.equal(err.errno, 107));
  });

  it('invalid utmTerm', () => {
    const api = new Client.Api(config.publicUrl);
    const email = server.uniqueEmail();
    const authPW =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const options = {
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
      .then(assert.fail, err => assert.equal(err.errno, 107));
  });

  it('create account with service query parameter', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'foo', {
      serviceQuery: 'bar',
    })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(
          emailData.headers['x-service-id'],
          'bar',
          'service query parameter was propagated'
        );
      });
  });

  it('account creation works with unicode email address', () => {
    const email = server.uniqueUnicodeEmail();
    return Client.create(config.publicUrl, email, 'foo')
      .then(client => {
        assert.ok(client, 'created account');
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.ok(emailData, 'received email');
      });
  });

  it('account creation fails with invalid metricsContext flowId', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'foo', {
      metricsContext: {
        flowId: 'deadbeefbaadf00ddeadbeefbaadf00d',
        flowBeginTime: 1,
      },
    }).then(
      () => {
        assert(false, 'account creation should have failed');
      },
      err => {
        assert.ok(err, 'account creation failed');
      }
    );
  });

  it('account creation fails with invalid metricsContext flowBeginTime', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'foo', {
      metricsContext: {
        flowId:
          'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
        flowBeginTime: 0,
      },
    }).then(
      () => {
        assert(false, 'account creation should have failed');
      },
      err => {
        assert.ok(err, 'account creation failed');
      }
    );
  });

  it('account creation works with maximal metricsContext metadata', () => {
    const email = server.uniqueEmail();
    const opts = {
      metricsContext: mocks.generateMetricsContext(),
    };
    return Client.create(config.publicUrl, email, 'foo', opts)
      .then(client => {
        assert.ok(client, 'created account');
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(
          emailData.headers['x-flow-begin-time'],
          opts.metricsContext.flowBeginTime,
          'flow begin time set'
        );
        assert.equal(
          emailData.headers['x-flow-id'],
          opts.metricsContext.flowId,
          'flow id set'
        );
      });
  });

  it('account creation works with empty metricsContext metadata', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'foo', {
      metricsContext: {},
    }).then(client => {
      assert.ok(client, 'created account');
    });
  });

  it('account creation fails with missing flowBeginTime', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'foo', {
      metricsContext: {
        flowId:
          'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
      },
    }).then(
      () => {
        assert(false, 'account creation should have failed');
      },
      err => {
        assert.ok(err, 'account creation failed');
      }
    );
  });

  it('account creation fails with missing flowId', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'foo', {
      metricsContext: {
        flowBeginTime: Date.now(),
      },
    }).then(
      () => {
        assert(false, 'account creation should have failed');
      },
      err => {
        assert.ok(err, 'account creation failed');
      }
    );
  });

  it('create account for non-sync service, gets generic sign-up email and does not get post-verify email', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.create(config.publicUrl, email, password)
      .then(x => {
        client = x;
        assert.ok('account was created');
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(emailData.headers['x-template-name'], 'verifyEmail');
        return emailData.headers['x-verify-code'];
      })
      .then(verifyCode => {
        return client.verifyEmail(verifyCode, { service: 'testpilot' });
      })
      .then(() => {
        return client.emailStatus();
      })
      .then(status => {
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
      .then(code => {
        assert.ok(code, 'the next email was reset-password, not post-verify');
      });
  });

  it('create account for unspecified service does not get create sync email and no post-verify email', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.create(config.publicUrl, email, password)
      .then(x => {
        client = x;
        assert.ok('account was created');
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(emailData.headers['x-template-name'], 'verifyEmail');
        assert.equal(emailData.html.indexOf('IP address') === -1, true); // Does not contain location data
        return emailData.headers['x-verify-code'];
      })
      .then(verifyCode => {
        return client.verifyEmail(verifyCode, {}); // no 'service' param
      })
      .then(() => {
        return client.emailStatus();
      })
      .then(status => {
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
      .then(code => {
        assert.ok(code, 'the next email was reset-password, not post-verify');
      });
  });

  it('create account for trailhead accounts get trailhead emails', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.create(config.publicUrl, email, password, {
      service: 'sync',
      style: 'trailhead',
    })
      .then(x => {
        client = x;
        assert.ok('account was created');
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(
          emailData.headers['x-template-name'],
          'verifyTrailheadEmail'
        );
        assert.equal(emailData.html.indexOf('IP address') === -1, true); // Does not contain location data
        return emailData.headers['x-verify-code'];
      })
      .then(verifyCode => {
        return client.verifyEmail(verifyCode, {
          service: 'sync',
          style: 'trailhead',
        });
      })
      .then(() => {
        return client.emailStatus();
      })
      .then(status => {
        assert.equal(status.verified, true);
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(
          emailData.headers['x-template-name'],
          'postVerifyTrailheadEmail'
        );
      });
  });

  it('create account and subscribe to newsletters', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let client = null;
    return Client.create(config.publicUrl, email, password, { service: 'sync' })
      .then(x => {
        client = x;
        assert.ok('account was created');
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        return emailData.headers['x-verify-code'];
      })
      .then(verifyCode => {
        return client.verifyEmail(verifyCode, {
          service: 'sync',
          newsletters: ['test-pilot'],
        });
      })
      .then(() => {
        return client.emailStatus();
      })
      .then(status => {
        assert.equal(status.verified, true);
      })
      .then(() => {
        return server.mailbox.waitForEmail(email);
      })
      .then(emailData => {
        assert.equal(emailData.headers['x-template-name'], 'postVerifyEmail');
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
