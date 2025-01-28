/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const config = require('../../config').default.getProperties();
const TestServer = require('../test_server');
const Client = require('../client')();
const otplib = require('otplib');
const BASE_36 = require('../../lib/routes/validators').BASE_36;

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote backup authentication codes`, function () {
    this.timeout(60000);

    let server, client, email, recoveryCodes;
    const recoveryCodeCount = 9;
    const password = 'pssssst';
    const metricsContext = {
      flowBeginTime: Date.now(),
      flowId:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    };

    otplib.authenticator.options = {
      encoding: 'hex',
      window: 10,
    };

    before(async () => {
      config.totp.recoveryCodes.count = recoveryCodeCount;
      config.totp.recoveryCodes.notifyLowCount = recoveryCodeCount - 2;
      server = await TestServer.start(config);
    });

    after(async () => {
      await TestServer.stop(server);
    });

    beforeEach(() => {
      email = server.uniqueEmail();
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        server.mailbox,
        testOptions
      ).then((x) => {
        client = x;
        assert.ok(client.authAt, 'authAt was set');
        return client.createTotpToken({ metricsContext }).then((result) => {
          otplib.authenticator.options = {
            secret: result.secret,
          };
          recoveryCodes = result.recoveryCodes;
          assert.equal(
            result.recoveryCodes.length,
            recoveryCodeCount,
            'backup authentication codes returned'
          );

          // Verify TOTP token so that initial backup authentication codes are generated
          const code = otplib.authenticator.generate();
          return client
            .verifyTotpCode(code, { metricsContext })
            .then((response) => {
              assert.equal(response.success, true, 'totp codes match');

              return server.mailbox.waitForEmail(email);
            })
            .then((emailData) => {
              assert.equal(
                emailData.headers['x-template-name'],
                'postAddTwoStepAuthentication'
              );
            });
        });
      });
    });

    it('should create backup authentication codes', () => {
      assert.ok(recoveryCodes);
      assert.equal(
        recoveryCodes.length,
        recoveryCodeCount,
        'backup authentication codes returned'
      );
      recoveryCodes.forEach((code) => {
        assert.equal(code.length > 1, true, 'correct length');
        assert.equal(BASE_36.test(code), true, 'code is hex');
      });
    });

    it('should replace backup authentication codes', () => {
      return client
        .replaceRecoveryCodes()
        .then((result) => {
          assert.ok(
            result.recoveryCodes.length,
            recoveryCodeCount,
            'backup authentication codes returned'
          );
          assert.notDeepEqual(
            result,
            recoveryCodes,
            'backup authentication codes should not match'
          );

          return server.mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(
            emailData.headers['x-template-name'],
            'postNewRecoveryCodes'
          );
        });
    });

    describe('backup authentication code verification', () => {
      beforeEach(() => {
        // Create a new unverified session to test backup authentication codes
        return Client.login(config.publicUrl, email, password, testOptions)
          .then((response) => {
            client = response;
            return client.emailStatus();
          })
          .then((res) =>
            assert.equal(res.sessionVerified, false, 'session not verified')
          );
      });

      it('should fail to consume unknown backup authentication code', () => {
        return client
          .consumeRecoveryCode('1234abcd', { metricsContext })
          .then(assert.fail, (err) => {
            assert.equal(err.code, 400, 'correct error code');
            assert.equal(err.errno, 156, 'correct error errno');
          });
      });

      it('should consume backup authentication code and verify session', () => {
        return client
          .consumeRecoveryCode(recoveryCodes[0], { metricsContext })
          .then((res) => {
            assert.equal(
              res.remaining,
              recoveryCodeCount - 1,
              'correct remaining codes'
            );
            return client.emailStatus();
          })
          .then((res) => {
            assert.equal(res.sessionVerified, true, 'session verified');
            return server.mailbox.waitForEmail(email);
          })
          .then((emailData) => {
            assert.equal(
              emailData.headers['x-template-name'],
              'postSigninRecoveryCode'
            );
          });
      });

      it('should consume backup authentication code and can remove TOTP token', () => {
        return client
          .consumeRecoveryCode(recoveryCodes[0], { metricsContext })
          .then((res) => {
            assert.equal(
              res.remaining,
              recoveryCodeCount - 1,
              'correct remaining codes'
            );
            return server.mailbox.waitForEmail(email);
          })
          .then((emailData) => {
            assert.equal(
              emailData.headers['x-template-name'],
              'postSigninRecoveryCode'
            );
            return client.deleteTotpToken();
          })
          .then((result) => {
            assert.ok(result, 'delete totp token successfully');
            return server.mailbox.waitForEmail(email);
          })
          .then((emailData) => {
            assert.equal(
              emailData.headers['x-template-name'],
              'postRemoveTwoStepAuthentication'
            );
          });
      });
    });

    describe('should notify user when backup authentication codes are low', () => {
      beforeEach(() => {
        // Create a new unverified session to test backup authentication codes
        return Client.login(config.publicUrl, email, password, testOptions)
          .then((response) => {
            client = response;
            return client.emailStatus();
          })
          .then((res) =>
            assert.equal(res.sessionVerified, false, 'session not verified')
          );
      });

      it('should consume backup authentication code and verify session', () => {
        return client
          .consumeRecoveryCode(recoveryCodes[0], { metricsContext })
          .then((res) => {
            assert.equal(
              res.remaining,
              recoveryCodeCount - 1,
              'correct remaining codes'
            );
            return server.mailbox.waitForEmail(email);
          })
          .then((emailData) => {
            assert.equal(
              emailData.headers['x-template-name'],
              'postSigninRecoveryCode'
            );
            return client.consumeRecoveryCode(recoveryCodes[1], {
              metricsContext,
            });
          })
          .then((res) => {
            assert.equal(
              res.remaining,
              recoveryCodeCount - 2,
              'correct remaining codes'
            );
            return server.mailbox.waitForEmail(email);
          })
          .then((emails) => {
            // The order in which the emails are sent is not guaranteed, test for both possible templates
            const email1 = emails[0].headers['x-template-name'];
            const email2 = emails[1].headers['x-template-name'];
            if (email1 === 'postSigninRecoveryCode') {
              assert.equal(email2, 'lowRecoveryCodes');
            }

            if (email1 === 'lowRecoveryCodes') {
              assert.equal(email2, 'postSigninRecoveryCode');
            }
          });
      });
    });
  });
});
