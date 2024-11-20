/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Client = require('../client')();
const TestServer = require('../test_server');
const config = require('../../config').default.getProperties();

const { assert } = chai;
chai.use(chaiAsPromised);

describe(`#integration - recovery phone`, function () {
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

  it('adds a recovery phone number to the account', async () => {
    const email = server.uniqueEmail();
    const password = 'password';
    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      {
        version: 'V2',
      }
    );

    const promise = client.createRecoveryPhoneNumber('+15550005555');

    // TODO: Setup test account / twilio emulator
    assert.isRejected(promise, 'A backend service request failed.');
  });
});
