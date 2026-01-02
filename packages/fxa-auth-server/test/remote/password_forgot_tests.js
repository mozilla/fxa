/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 'use strict';

 const { assert } = require('chai');
 const url = require('url');
 const Client = require('../client')();
 const TestServer = require('../test_server');
 const crypto = require('crypto');
 const base64url = require('base64url');

 const config = require('../../config').default.getProperties();
 const mocks = require('../mocks');

 [{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
   describe(`#integration${testOptions.version} - remote password forgot`, function () {
     this.timeout(15000);
     let server;
     before(async () => {
       config.securityHistory.ipProfiling.allowedRecency = 0;
       config.signinConfirmation.skipForNewAccounts.enabled = true;
       server = await TestServer.start(config)
     });

     after(async () => {
      await TestServer.stop(server);
    });

     it('forgot password', () => {
       const email = server.uniqueEmail();
       const password = 'allyourbasearebelongtous';
       const newPassword = 'ez';
       let wrapKb = null;
       let kA = null;
       let client = null;
       const options = {
         ...testOptions,
         keys: true,
         metricsContext: mocks.generateMetricsContext(),
       };
       return Client.createAndVerify(
         config.publicUrl,
         email,
         password,
         server.mailbox,
         options
       )
         .then((x) => {
           client = x;
           return client.keys();
         })
         .then((keys) => {
           wrapKb = keys.wrapKb;
           kA = keys.kA;
           return client.forgotPassword();
         })
         .then(() => {
           return server.mailbox.waitForEmail(email);
         })
         .then((emailData) => {
           assert.equal(emailData.headers['x-template-name'], 'passwordForgotOtp');
           return emailData.headers['x-password-forgot-otp'];
         })
         .then((code) => {
           assert.isRejected(client.resetPassword(newPassword));
           return resetPassword(client, code, newPassword, undefined, options);
         })
         .then(() => {
           return server.mailbox.waitForEmail(email);
         })
         .then((emailData) => {
           const link = emailData.headers['x-link'];
           const query = url.parse(link, true).query;
           assert.ok(query.email, 'email is in the link');
           assert.equal(emailData.headers['x-template-name'], 'passwordReset');
         })
         .then(() => {
           return upgradeCredentials(email, newPassword);
         })
         .then(
           // make sure we can still login after password reset
           () => {
             return Client.login(config.publicUrl, email, newPassword, {
               ...testOptions,
               keys: true,
             });
           }
         )
         .then((x) => {
           client = x;
           return client.keys();
         })
         .then((keys) => {
           assert.equal(typeof keys.wrapKb, 'string', 'yep, wrapKb');
           assert.notEqual(wrapKb, keys.wrapKb, 'wrapKb was reset');
           assert.equal(kA, keys.kA, 'kA was not reset');
           assert.equal(typeof client.kB, 'string');
           assert.equal(client.kB.length, 64, 'kB exists, has the right length');
         });
     });

     it('forgot password limits verify attempts', async () => {
       const email = server.uniqueEmail();
       const password = 'hothamburger';
       await Client.createAndVerify(
         config.publicUrl,
         email,
         password,
         server.mailbox,
         testOptions
       );
       const client = new Client(config.publicUrl, testOptions);
       client.email = email;

       // Send OTP
       await client.forgotPassword();
       const code = await server.mailbox.waitForCode(email);

       try {
         await client.verifyPasswordForgotOtp('00000000');
         assert.fail('verify otp with bad code should fail');
       } catch (err) {
         assert.equal(err.message, 'Invalid confirmation code', 'bad OTP code rejected');
       }

       // Try again with another bad code
       try {
         await client.verifyPasswordForgotOtp('11111111');
         assert.fail('verify otp with bad code should fail');
       } catch (err) {
         assert.equal(err.message, 'Invalid confirmation code', 'bad OTP code rejected again');
       }

       // Now use the correct code - should work
       await resetPassword(client, code, 'newpassword');
     });

     it('recovery email contains OTP code', async () => {
       const email = server.uniqueEmail();
       const password = 'something';
       const options = {
         ...testOptions,
         service: 'sync',
       };
       const client = await Client.createAndVerify(
         config.publicUrl,
         email,
         password,
         server.mailbox,
         options
       );
       await client.forgotPassword();
       const emailData = await server.mailbox.waitForEmail(email);
       assert.equal(emailData.headers['x-template-name'], 'passwordForgotOtp');
       const otpCode = emailData.headers['x-password-forgot-otp'];
       assert.ok(otpCode, 'OTP code is in email header');
       assert.match(otpCode, /^\d{8}$/, 'OTP code is 8 digits');
     });

     it.skip('password forgot status with valid token', async () => {
     });

     it.skip('password forgot status with invalid token', () => {
     });

     it('OTP flow rejects unverified accounts', () => {
       const email = server.uniqueEmail();
       const password = 'something';
       let client = null;
       return Client.create(config.publicUrl, email, password, testOptions)
         .then((c) => {
           client = c;
         })
         .then(() => {
           return client.emailStatus();
         })
         .then((status) => {
           assert.equal(status.verified, false, 'email unverified');
         })
         .then(() => {
           return server.mailbox.waitForCode(email); // ignore verification code
         })
         .then(() => {
           return client.forgotPassword();
         })
         .then(
           () => {
             assert(false, 'forgotPassword should fail for unverified account');
           },
           (err) => {
             assert.equal(err.errno, 102, 'unknown account error for unverified');
           }
         );
     });

     it('forgot password with service query parameter', async () => {
       const email = server.uniqueEmail();
       const options = {
         ...testOptions,
         serviceQuery: 'sync',
       };
       const client = await Client.createAndVerify(
         config.publicUrl,
         email,
         'wibble',
         server.mailbox,
         options
       );
       // Send OTP with service parameter
       await client.forgotPassword();
       const emailData = await server.mailbox.waitForEmail(email);
       assert.equal(emailData.headers['x-template-name'], 'passwordForgotOtp');
       assert.ok(emailData.headers['x-password-forgot-otp'], 'OTP code present');
     });

     it('forgot password, then get device list', () => {
       const email = server.uniqueEmail();
       const newPassword = 'foo';
       let client;
       return Client.createAndVerify(
         config.publicUrl,
         email,
         'bar',
         server.mailbox,
         testOptions
       )
         .then((c) => {
           client = c;
           return client.updateDevice({
             name: 'baz',
             type: 'mobile',
             pushCallback: 'https://updates.push.services.mozilla.com/qux',
             pushPublicKey: mocks.MOCK_PUSH_KEY,
             pushAuthKey: base64url(crypto.randomBytes(16)),
           });
         })
         .then(() => {
           return client.devices();
         })
         .then((devices) => {
           assert.equal(devices.length, 1, 'devices list contains 1 item');
         })
         .then(() => {
           return client.forgotPassword();
         })
         .then(() => {
           return server.mailbox.waitForCode(email);
         })
         .then((code) => {
           return resetPassword(client, code, newPassword);
         })
         .then(() => {
           return upgradeCredentials(email, newPassword);
         })
         .then(() => {
           return Client.login(
             config.publicUrl,
             email,
             newPassword,
             testOptions
           );
         })
         .then((client) => {
           return client.devices();
         })
         .then((devices) => {
           assert.equal(devices.length, 0, 'devices list is empty');
         });
     });


     async function resetPassword(client, otpCode, newPassword, headers, options) {
       const result = await client.verifyPasswordForgotOtp(otpCode, options);
       await client.verifyPasswordResetCode(result.code, headers, options);
       await client.resetPassword(newPassword, {}, options);
     }

     async function upgradeCredentials(email, newPassword) {
       if (testOptions.version === 'V2') {
         await Client.upgradeCredentials(config.publicUrl, email, newPassword, {
           version: '',
           key: true,
         });
       }
     }
   });
 });
