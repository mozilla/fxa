/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Client = require('../client')();
const config = require('../../config').default.getProperties();
const TestServer = require('../test_server');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

describe('#integration - remote password change JWT', function () {
  this.timeout(60000);
  let server;

  before(async () => {
    server = await TestServer.start(config);
  });

  after(async () => {
    await TestServer.stop(server);
  });
  [{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
    describe(`#integration${testOptions.version} - remote password change with JWT`, function () {
      it('should change password with valid JWT', async function() {
        const email = server.uniqueEmail();
        const password = 'allyourbasearebelongtous';
        const newPassword = 'foobar';

        // Create and verify account
        const client = await Client.createAndVerify(
          config.publicUrl,
          email,
          password,
          server.mailbox,
          {
            ...testOptions,
            keys: true
          }
        );

        const oldAuthPW = client.authPW.toString('hex');

        // Get the initial keys to compare to after password change keys
        const originalKeys = await client.keys();

        // Get session token for JWT generation
        const sessionTokenHex = client.sessionToken;
        const sessionToken = require('../../lib/tokens')({
          trace: function() {}
        }).SessionToken.fromHex(sessionTokenHex);
        const sessionTokenId = (await sessionToken).id;

        // Generate MFA JWT with password scope
        const now = Math.floor(Date.now() / 1000);
        const claims = {
          sub: client.uid,
          scope: ['mfa:password'],
          iat: now,
          jti: uuid.v4(),
          stid: sessionTokenId,
        };

        const jwtToken = jwt.sign(claims, config.mfa.jwt.secretKey, {
          algorithm: 'HS256',
          expiresIn: config.mfa.jwt.expiresInSec,
          audience: config.mfa.jwt.audience,
          issuer: config.mfa.jwt.issuer,
        });

        // Prepare new password credentials
        const newCreds = await client.setupCredentials(email, newPassword);

        client.deriveWrapKbFromKb();

        const payload = {
          email,
          oldAuthPW,
          authPW: newCreds.authPW.toString('hex'),
          wrapKb: client.wrapKb,
          clientSalt: client.clientSalt,
        }
        if (testOptions.version === 'V2') {
          // Create new credentials for the new password
          await client.setupCredentialsV2(email, newPassword);

          // Derive wrapKb from the new unwrapBKey and the current kB. This ensures
          // kB will remain constant even after a password change.
          client.deriveWrapKbVersion2FromKb();

          payload.authPWVersion2 = newCreds.authPWVersion2.toString('hex');
          payload.wrapKbVersion2 = client.wrapKbVersion2;
        }

        // Call the new JWT endpoint
        const response = await client.changePasswordJWT(jwtToken, payload)

        // Verify response
        assert.ok(response.uid);
        assert.ok(response.sessionToken);
        assert.ok(response.authAt);

        // Verify we can login with new password
        const newClient = await Client.login(
          config.publicUrl,
          email,
          newPassword,
          {
            ...testOptions,
            keys: true,
          }
        );
        assert.ok(newClient.sessionToken);

        const newClientKeys = await newClient.keys();
        assert.equal(newClientKeys.kA.toString('hex'), originalKeys.kA.toString('hex'));
        assert.equal(newClientKeys.kB.toString('hex'), originalKeys.kB.toString('hex'));
      });
    })
  })
});
