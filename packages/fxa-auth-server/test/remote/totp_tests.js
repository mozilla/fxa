/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const crypto = require('crypto');
const config = require('../../config').default.getProperties();
const Client = require('../client')();
const otplib = require('otplib');
const { default: Container } = require('typedi');
const {
  PlaySubscriptions,
} = require('../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../lib/payments/iap/apple-app-store/subscriptions');
const { TestUtilities } = require('../test_utilities');
const mailbox = require('../mailbox')();

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote totp`, function () {

    let client, email, totpToken, authenticator;
    const password = 'pssssst';
    const metricsContext = {
      flowBeginTime: Date.now(),
      flowId:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    };

    otplib.authenticator.options = {
      crypto: crypto,
      encoding: 'hex',
      window: 10,
    };

    before(async () => {
      config.securityHistory.ipProfiling = {};
      config.signinConfirmation.skipForNewAccounts.enabled = false;

      Container.set(PlaySubscriptions, {});
      Container.set(AppStoreSubscriptions, {});

    });

    after(async () => {
    });

    function verifyTOTP(client) {
      return client
        .createTotpToken({ metricsContext })
        .then((result) => {
          authenticator = new otplib.authenticator.Authenticator();
          authenticator.options = Object.assign(
            {},
            otplib.authenticator.options,
            { secret: result.secret }
          );
          totpToken = result;
          assert.equal(
            result.recoveryCodes.length > 1,
            true,
            'backup authentication codes returned'
          );

          // Verify TOTP token
          const code = authenticator.generate();
          return client.verifyTotpCode(code, {
            metricsContext,
            service: 'sync',
          });
        })
        .then((response) => {
          assert.equal(response.success, true, 'totp codes match');
          return mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(
            emailData.headers['x-template-name'],
            'postAddTwoStepAuthentication'
          );
        });
    }

    beforeEach(() => {
      email = TestUtilities.uniqueEmail();
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        testOptions
      ).then((x) => {
        client = x;
        assert.ok(client.authAt, 'authAt was set');
        return verifyTOTP(client);
      });
    });

    it('should create totp token', () => {
      assert.ok(totpToken);
      assert.ok(totpToken.qrCodeUrl);
    });

    it('should check if totp token exists for user', () => {
      return client.checkTotpTokenExists().then((response) => {
        assert.equal(response.exists, true, 'token exists');
      });
    });

    it('should fail to create second totp token for same user', () => {
      return client.createTotpToken().then(assert.fail, (err) => {
        assert.equal(err.code, 400, 'correct error code');
        assert.equal(err.errno, 154, 'correct error errno');
      });
    });

    it('should not fail to delete unknown totp token', () => {
      email = TestUtilities.uniqueEmail();
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        testOptions
      ).then((x) => {
        client = x;
        assert.ok(client.authAt, 'authAt was set');
        return client
          .deleteTotpToken()
          .then((result) =>
            assert.ok(result, 'delete totp token successfully')
          );
      });
    });

    it('should delete totp token', () => {
      return client
        .deleteTotpToken()
        .then((result) => {
          assert.ok(result, 'delete totp token successfully');
          return mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          assert.equal(
            emailData.headers['x-template-name'],
            'postRemoveTwoStepAuthentication'
          );

          // Can create a new token
          return client.checkTotpTokenExists().then((result) => {
            assert.equal(result.exists, false, 'token does not exist');
          });
        });
    });

    it('should allow verified sessions before totp enabled to delete totp token', () => {
      let client2, code;
      email = TestUtilities.uniqueEmail();
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        testOptions
      )
        .then((x) => {
          client = x;
          return client.login({ keys: true });
        })
        .then((response) => {
          assert.equal(
            response.verificationMethod,
            'email',
            'challenge method set to email'
          );
          assert.equal(
            response.verificationReason,
            'login',
            'challenge reason set to signin'
          );
          assert.equal(response.verified, false, 'verified set to false');
          return mailbox.waitForEmail(email);
        })
        .then((emailData) => {
          code = emailData.headers['x-verify-code'];
          return client.verifyEmail(code);
        })
        .then(() => {
          // Login with a new client and enabled TOTP
          return Client.loginAndVerify(
            config.publicUrl,
            email,
            password,
            mailbox,
            {
              ...testOptions,
              keys: true,
            }
          );
        })
        .then((x) => {
          client2 = x;
          return verifyTOTP(client2);
        })
        .then((res) => {
          // Delete totp from original client that only was email verified
          return client.deleteTotpToken().then((result) => {
            assert.ok(result, 'delete totp token successfully');
            return mailbox.waitForEmail(email);
          });
        })
        .then((emailData) => {
          assert.equal(
            emailData.headers['x-template-name'],
            'postRemoveTwoStepAuthentication'
          );

          // Can create a new token
          return client.checkTotpTokenExists().then((result) => {
            assert.equal(result.exists, false, 'token does not exist');
          });
        });
    });

    it('should not allow unverified sessions before totp enabled to delete totp token', () => {
      email = TestUtilities.uniqueEmail();
      return Client.createAndVerify(
        config.publicUrl,
        email,
        password,
        mailbox,
        testOptions
      )
        .then((x) => {
          client = x;
          return client.login({ keys: true });
        })
        .then((response) => {
          assert.equal(
            response.verificationMethod,
            'email',
            'challenge method set to email'
          );
          assert.equal(
            response.verificationReason,
            'login',
            'challenge reason set to signin'
          );
          assert.equal(response.verified, false, 'verified set to false');

          return mailbox.waitForEmail(email);
        })
        .then(() => {
          // Login with a new client and enabled TOTP
          return Client.loginAndVerify(
            config.publicUrl,
            email,
            password,
            mailbox,
            {
              ...testOptions,
              keys: true,
            }
          );
        })
        .then((client2) => verifyTOTP(client2))
        .then((res) => {
          // Attempt to delete totp from original unverified session
          return client.deleteTotpToken().then(assert.fail, (err) => {
            assert.equal(err.errno, 138, 'correct unverified session errno');
          });
        });
    });

    it('should request `totp-2fa` on login if user has verified totp token', () => {
      return Client.login(config.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      }).then((response) => {
        assert.equal(
          response.verificationMethod,
          'totp-2fa',
          'verification method set'
        );
        assert.equal(
          response.verificationReason,
          'login',
          'verification reason set'
        );
      });
    });

    it('should not have `totp-2fa` verification if user has unverified totp token', () => {
      return client
        .deleteTotpToken()
        .then(() => client.createTotpToken())
        .then(() =>
          Client.login(config.publicUrl, email, password, {
            ...testOptions,
            keys: true,
          })
        )
        .then((response) => {
          assert.notEqual(
            response.verificationMethod,
            'totp-2fa',
            'verification method not set to `totp-2fa`'
          );
          assert.equal(
            response.verificationReason,
            'login',
            'verification reason set to `login`'
          );
        });
    });

    it('should not bypass `totp-2fa` by resending sign-in confirmation code', () => {
      return Client.login(config.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      }).then((response) => {
        client = response;
        assert.equal(
          response.verificationMethod,
          'totp-2fa',
          'verification method set'
        );
        assert.equal(
          response.verificationReason,
          'login',
          'verification reason set'
        );

        return client.requestVerifyEmail().then((res) => {
          assert.deepEqual(res, {}, 'returns empty response');
        });
      });
    });

    it('should not bypass `totp-2fa` by when using session reauth', () => {
      return Client.login(config.publicUrl, email, password, testOptions).then(
        (response) => {
          client = response;
          assert.equal(
            response.verificationMethod,
            'totp-2fa',
            'verification method set'
          );
          assert.equal(
            response.verificationReason,
            'login',
            'verification reason set'
          );

          // Lets attempt to sign-in reusing session reauth
          return client.reauth().then((response) => {
            assert.equal(
              response.verificationMethod,
              'totp-2fa',
              'verification method set'
            );
            assert.equal(
              response.verificationReason,
              'login',
              'verification reason set'
            );
          });
        }
      );
    });

    it('should fail reset password without verifying totp', async () => {
      const newPassword = 'anotherPassword';

      const client = await Client.login(config.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });
      assert.equal(
        client.verificationMethod,
        'totp-2fa',
        'verification method set'
      );
      assert.equal(
        client.verificationReason,
        'login',
        'verification reason set'
      );
      await client.forgotPassword();
      const code = await mailbox.waitForCode(email);
      await client.verifyPasswordResetCode(code);

      try {
        await client.resetPassword(newPassword, {}, { keys: true });
        assert.fail('should not have succeeded');
      } catch (err) {
        assert.equal(
          err.errno,
          138,
          'should have failed due to unverified session'
        );
      }
    });

    it('should reset password after verifying totp', async () => {
      const newPassword = 'anotherPassword';

      const client = await Client.login(config.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });
      assert.equal(
        client.verificationMethod,
        'totp-2fa',
        'verification method set'
      );
      assert.equal(
        client.verificationReason,
        'login',
        'verification reason set'
      );
      await client.forgotPassword();
      const code = await mailbox.waitForCode(email);

      const totpCode = authenticator.generate();
      await client.verifyTotpCodeForPasswordReset(totpCode);

      await client.verifyPasswordResetCode(code);

      const res = await client.resetPassword(newPassword, {}, { keys: true });
      assert.equal(
        res.verificationMethod,
        undefined,
        'verificationMethod not set'
      );
      assert.equal(
        res.verificationReason,
        undefined,
        'verificationMethod not set'
      );
      assert.equal(res.verified, true);
      assert.ok(res.keyFetchToken);
      assert.ok(res.sessionToken);
      assert.ok(res.authAt);
    });

    describe('totp code verification', () => {
      beforeEach(() => {
        // Create a new unverified session to test totp codes
        return Client.login(
          config.publicUrl,
          email,
          password,
          testOptions
        ).then((response) => (client = response));
      });

      it('should fail to verify totp code', () => {
        const code = authenticator.generate();
        const incorrectCode = code === '123456' ? '123455' : '123456';
        return client
          .verifyTotpCode(incorrectCode, { metricsContext, service: 'sync' })
          .then((result) => {
            assert.equal(result.success, false, 'failed');
          });
      });

      it('should reject non-numeric codes', () => {
        return client
          .verifyTotpCode('wrong', { metricsContext, service: 'sync' })
          .then(assert.fail, (err) => {
            assert.equal(err.code, 400, 'correct error code');
            assert.equal(err.errno, 107, 'correct error errno');
          });
      });

      it('should fail to verify totp code that does not have totp token', () => {
        email = TestUtilities.uniqueEmail();
        return Client.createAndVerify(
          config.publicUrl,
          email,
          password,
          mailbox,
          testOptions
        ).then((x) => {
          client = x;
          assert.ok(client.authAt, 'authAt was set');
          return client
            .verifyTotpCode('123456', { metricsContext, service: 'sync' })
            .then(assert.fail, (err) => {
              assert.equal(err.code, 400, 'correct error code');
              assert.equal(err.errno, 155, 'correct error errno');
            });
        });
      });

      it('should verify totp code', () => {
        const code = authenticator.generate();
        return client
          .verifyTotpCode(code, { metricsContext, service: 'sync' })
          .then((response) => {
            assert.equal(response.success, true, 'totp codes match');
            return mailbox.waitForEmail(email);
          })
          .then((emailData) => {
            assert.equal(
              emailData.headers['x-template-name'],
              'newDeviceLogin'
            );
          });
      });

      it('should verify totp code from previous code window', () => {
        const futureAuthenticator = new otplib.authenticator.Authenticator();
        futureAuthenticator.options = Object.assign({}, authenticator.options, {
          epoch: Date.now() / 1000 - 30,
        });
        const code = futureAuthenticator.generate();
        return client
          .verifyTotpCode(code, { metricsContext, service: 'sync' })
          .then((response) => {
            assert.equal(response.success, true, 'totp codes match');
            return mailbox.waitForEmail(email);
          })
          .then((emailData) => {
            assert.equal(
              emailData.headers['x-template-name'],
              'newDeviceLogin'
            );
          });
      });

      it('should not verify totp code from future code window', () => {
        const futureAuthenticator = new otplib.authenticator.Authenticator();
        futureAuthenticator.options = Object.assign({}, authenticator.options, {
          epoch: Date.now() / 1000 + 3000,
        });
        const code = futureAuthenticator.generate();
        return client
          .verifyTotpCode(code, { metricsContext, service: 'sync' })
          .then((response) => {
            assert.equal(response.success, false, 'totp codes do not match');
          });
      });
    });
  });
});
