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
           assert.equal(emailData.headers['x-template-name'], 'recovery');
           return emailData.headers['x-recovery-code'];
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

     it('forgot password limits verify attempts', () => {
       let code = null;
       const email = server.uniqueEmail();
       const password = 'hothamburger';
       let client = null;
       return Client.createAndVerify(
         config.publicUrl,
         email,
         password,
         server.mailbox,
         testOptions
       )
         .then(() => {
           client = new Client(config.publicUrl, testOptions);
           client.email = email;
           return client.forgotPassword();
         })
         .then(() => {
           return server.mailbox.waitForCode(email);
         })
         .then((c) => {
           code = c;
         })
         .then(() => {
           return client.reforgotPassword();
         })
         .then(() => {
           return server.mailbox.waitForCode(email);
         })
         .then((c) => {
           assert.equal(code, c, 'same code as before');
         })
         .then(() => {
           return resetPassword(
             client,
             '00000000000000000000000000000000',
             'password'
           );
         })
         .then(
           () => {
             assert(false, 'reset password with bad code');
           },
           (err) => {
             assert.equal(err.tries, 2, 'used a try');
             assert.equal(
               err.message,
               'Invalid confirmation code',
               'bad attempt 1'
             );
           }
         )
         .then(() => {
           return resetPassword(
             client,
             '00000000000000000000000000000000',
             'password'
           );
         })
         .then(
           () => {
             assert(false, 'reset password with bad code');
           },
           (err) => {
             assert.equal(err.tries, 1, 'used a try');
             assert.equal(
               err.message,
               'Invalid confirmation code',
               'bad attempt 2'
             );
           }
         )
         .then(() => {
           return resetPassword(
             client,
             '00000000000000000000000000000000',
             'password'
           );
         })
         .then(
           () => {
             assert(false, 'reset password with bad code');
           },
           (err) => {
             assert.equal(err.tries, 0, 'used a try');
             assert.equal(
               err.message,
               'Invalid confirmation code',
               'bad attempt 3'
             );
           }
         )
         .then(() => {
           return resetPassword(
             client,
             '00000000000000000000000000000000',
             'password'
           );
         })
         .then(
           () => {
             assert(false, 'reset password with invalid token');
           },
           (err) => {
             assert.equal(
               err.message,
               'Invalid authentication token: Missing authentication',
               'token is now invalid'
             );
           }
         );
     });

     it('recovery email link', () => {
       const email = server.uniqueEmail();
       const password = 'something';
       let client = null;
       const options = {
         ...testOptions,
         redirectTo: `https://sync.${config.smtp.redirectDomain}/`,
         service: 'sync',
       };
       return Client.create(config.publicUrl, email, password, options)
         .then((c) => {
           client = c;
         })
         .then(() => {
           return server.mailbox.waitForEmail(email);
         })
         .then(() => {
           return client.forgotPassword();
         })
         .then(() => {
           return server.mailbox.waitForEmail(email);
         })
         .then((emailData) => {
           const link = emailData.headers['x-link'];
           const query = url.parse(link, true).query;
           assert.ok(query.token, 'uid is in link');
           assert.ok(query.code, 'code is in link');
           assert.equal(
             query.redirectTo,
             options.redirectTo,
             'redirectTo is in link'
           );
           assert.equal(query.service, options.service, 'service is in link');
           assert.equal(query.email, email, 'email is in link');
         });
     });

     it('password forgot status with valid token', () => {
       const email = server.uniqueEmail();
       const password = 'something';
       return Client.create(config.publicUrl, email, password, testOptions).then(
         (c) => {
           return c
             .forgotPassword()
             .then(() => {
               return c.api.passwordForgotStatus(c.passwordForgotToken);
             })
             .then((x) => {
               assert.equal(x.tries, 3, 'three tries remaining');
               assert.ok(
                 x.ttl > 0 && x.ttl <= config.tokenLifetimes.passwordForgotToken,
                 'ttl is ok'
               );
             });
         }
       );
     });

     it('password forgot status with invalid token', () => {
       const client = new Client(config.publicUrl, testOptions);
       return client.api
         .passwordForgotStatus(
           '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
         )
         .then(
           () => assert(false),
           (err) => {
             assert.equal(err.errno, 110, 'invalid token');
           }
         );
     });

     it('/password/forgot/verify_code should set an unverified account as verified', () => {
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
           return server.mailbox.waitForCode(email); // ignore this code
         })
         .then(() => {
           return client.forgotPassword();
         })
         .then(() => {
           return server.mailbox.waitForCode(email);
         })
         .then((code) => {
           return client.verifyPasswordResetCode(code);
         })
         .then(() => {
           return client.emailStatus();
         })
         .then((status) => {
           assert.equal(status.verified, true, 'account unverified');
         });
     });

     it('forgot password with service query parameter', () => {
       const email = server.uniqueEmail();
       const options = {
         ...testOptions,
         redirectTo: `https://sync.${config.smtp.redirectDomain}/`,
         serviceQuery: 'sync',
       };
       let client;
       return Client.create(config.publicUrl, email, 'wibble', options)
         .then((c) => {
           client = c;
         })
         .then(() => {
           return server.mailbox.waitForEmail(email);
         })
         .then(() => {
           return client.forgotPassword();
         })
         .then(() => {
           return server.mailbox.waitForEmail(email);
         })
         .then((emailData) => {
           const link = emailData.headers['x-link'];
           const query = url.parse(link, true).query;
           assert.equal(
             query.service,
             options.serviceQuery,
             'service is in link'
           );
         });
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


     async function resetPassword(client, code, newPassword, headers, options) {
       await client.verifyPasswordResetCode(code, headers, options);
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
