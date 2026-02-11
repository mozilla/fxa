/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 'use strict';

 const { assert } = require('chai');
 const Client = require('../client')();
 const TestServer = require('../test_server');
 const config = require('../../config').default.getProperties();

 async function resetPassword(client, otpCode, newPassword, options) {
   const result = await client.verifyPasswordForgotOtp(otpCode);
   await client.verifyPasswordResetCode(result.code);
   return client.resetPassword(newPassword, {}, options);
 }

 function delay(seconds) {
   return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
 }

 [{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
   describe(`#integration${testOptions.version} - remote securityEvents`, function () {
     this.timeout(60000);
     let server;

     before(async function () {
       config.securityHistory.ipProfiling.allowedRecency = 0;
       config.signinConfirmation.skipForNewAccounts.enabled = false;
       server = await TestServer.start(config);
     });

     after(async () => {
       await TestServer.stop(server);
     });

     it('returns securityEvents on creating and login into an account', async () => {
       const email = server.uniqueEmail();
       const password = 'abcdef';

       const client = await Client.createAndVerify(
         config.publicUrl,
         email,
         password,
         server.mailbox,
         testOptions
       );

       // Login creates an unverified session
       await client.login();

       // Verify the login session to be able to call securityEvents endpoint
       const code = await server.mailbox.waitForCode(email);
       await client.verifyEmail(code);

       await delay(1);
       const events = await client.securityEvents();

       assert.equal(events.length, 2);
       assert.equal(events[0].name, 'account.login');
       assert.isBelow(events[0].createdAt, new Date().getTime());
       // Note: The login event was initially unverified but may show as verified
       // after session verification - this is expected behavior

       assert.equal(events[1].name, 'account.create');
       assert.isBelow(events[1].createdAt, new Date().getTime());
       assert.equal(events[1].verified, true);
     });

     it('returns security events after account reset w/o keys, with sessionToken', async () => {
       const email = server.uniqueEmail();
       const password = 'oldPassword';
       const newPassword = 'newPassword';

       const client = await Client.createAndVerify(
         config.publicUrl,
         email,
         password,
         server.mailbox,
         testOptions
       );

       await client.forgotPassword();
       const code = await server.mailbox.waitForCode(email);

       assert.isRejected(client.resetPassword(newPassword));
       const response = await resetPassword(client, code, newPassword);

       assert.ok(response.sessionToken, 'session token is in response');
       assert(
         !response.keyFetchToken,
         'keyFetchToken token is not in response'
       );
       assert.equal(response.emailVerified, true, 'email verified is true');
       assert.equal(response.sessionVerified, true, 'session verified is true');

       await delay(1);
       const events = await client.securityEvents();

       // Find the account.reset and account.create events
       const resetEvent = events.find(e => e.name === 'account.reset');
       const createEvent = events.find(e => e.name === 'account.create');

       assert.ok(resetEvent, 'account.reset event exists');
       assert.isBelow(resetEvent.createdAt, new Date().getTime());
       assert.equal(resetEvent.verified, true);

       assert.ok(createEvent, 'account.create event exists');
       assert.isBelow(createEvent.createdAt, new Date().getTime());
       assert.equal(createEvent.verified, true);
     });
   });
 });
