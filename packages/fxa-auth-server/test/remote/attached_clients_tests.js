/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').getProperties();
const tokens = require('../../lib/tokens')({ trace: () => {} }, config);
const testUtils = require('../lib/util');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;
const buf = require('buf').hex;
const hashRefreshToken = require('../../lib/oauth/encrypt').hash;

const PUBLIC_CLIENT_ID = '3c49430b43dfba77';

describe('attached clients listing', function() {
  this.timeout(15000);
  let server, oauthServerDb;
  before(async () => {
    config.lastAccessTimeUpdates = {
      enabled: true,
      sampleRate: 1,
      earliestSaneTimestamp: config.lastAccessTimeUpdates.earliestSaneTimestamp,
    };
    testUtils.disableLogs();
    server = await TestServer.start(config, false);
    oauthServerDb = require('../../lib/oauth/db');
  });

  it('correctly lists a variety of attached clients', async () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    );
    const mySessionTokenId = (
      await tokens.SessionToken.fromHex(client.sessionToken)
    ).id;
    const deviceInfo = {
      name: 'test device 🍓🔥在𝌆',
      type: 'mobile',
      availableCommands: { foo: 'bar' },
      pushCallback: '',
      pushPublicKey: '',
      pushAuthKey: '',
    };

    let allClients = await client.attachedClients();

    assert.equal(allClients.length, 1);
    assert.equal(allClients[0].sessionTokenId, mySessionTokenId);
    assert.equal(allClients[0].deviceId, null);
    assert.equal(allClients[0].lastAccessTimeFormatted, 'a few seconds ago');

    const device = await client.updateDevice(deviceInfo);

    allClients = await client.attachedClients();
    assert.equal(allClients.length, 1);
    assert.equal(allClients[0].sessionTokenId, mySessionTokenId);
    assert.equal(allClients[0].deviceId, device.id);
    assert.equal(allClients[0].name, deviceInfo.name);

    const refreshToken = await oauthServerDb.generateRefreshToken({
      clientId: buf(PUBLIC_CLIENT_ID),
      userId: buf(client.uid),
      email: client.email,
      scope: ScopeSet.fromArray([
        'profile',
        'https://identity.mozilla.com/apps/oldsync',
      ]),
    });
    const refreshTokenId = hashRefreshToken(refreshToken.token).toString('hex');

    allClients = await client.attachedClients();
    assert.equal(allClients.length, 2);
    assert.equal(allClients[0].sessionTokenId, mySessionTokenId);
    assert.equal(allClients[1].sessionTokenId, null);
    assert.equal(allClients[1].refreshTokenId, refreshTokenId);
    assert.equal(allClients[1].lastAccessTimeFormatted, 'a few seconds ago');
    assert.equal(allClients[1].name, 'Android Components Reference Browser');

    const device2 = await client.updateDeviceWithRefreshToken(
      refreshToken.token.toString('hex'),
      { name: 'test device', type: 'mobile' }
    );
    allClients = await client.attachedClients();
    assert.equal(allClients.length, 2);
    const one = allClients.findIndex(c => c.name === 'test device');
    const zero = (one + 1) % allClients.length;
    assert.equal(allClients[zero].sessionTokenId, mySessionTokenId);
    assert.equal(allClients[zero].deviceId, device.id);
    assert.equal(allClients[one].refreshTokenId, refreshTokenId);
    assert.equal(allClients[one].deviceId, device2.id);
    assert.equal(allClients[one].name, 'test device');
  });

  it('correctly deletes by device id', async () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    );
    const mySessionTokenId = (
      await tokens.SessionToken.fromHex(client.sessionToken)
    ).id;

    const client2 = await Client.login(config.publicUrl, email, password);
    const device = await client2.updateDevice({
      name: 'test',
      type: 'desktop',
    });

    let allClients = await client.attachedClients();
    assert.equal(allClients.length, 2);

    await client.destroyAttachedClient({
      deviceId: device.id,
    });

    allClients = await client.attachedClients();
    assert.equal(allClients.length, 1);
    assert.equal(allClients[0].sessionTokenId, mySessionTokenId);
  });

  it('correctly deletes by sessionTokenId', async () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    );
    const mySessionTokenId = (
      await tokens.SessionToken.fromHex(client.sessionToken)
    ).id;

    const client2 = await Client.login(config.publicUrl, email, password);
    const otherSessionTokenId = (
      await tokens.SessionToken.fromHex(client2.sessionToken)
    ).id;

    let allClients = await client.attachedClients();
    assert.equal(allClients.length, 2);

    await client.destroyAttachedClient({
      sessionTokenId: otherSessionTokenId,
    });

    allClients = await client.attachedClients();
    assert.equal(allClients.length, 1);
    assert.equal(allClients[0].sessionTokenId, mySessionTokenId);
  });

  it('correctly deletes by refreshTokenId', async () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    const client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    );
    const mySessionTokenId = (
      await tokens.SessionToken.fromHex(client.sessionToken)
    ).id;

    const refreshToken = await oauthServerDb.generateRefreshToken({
      clientId: buf(PUBLIC_CLIENT_ID),
      userId: buf(client.uid),
      email: client.email,
      scope: ScopeSet.fromArray([
        'profile',
        'https://identity.mozilla.com/apps/oldsync',
      ]),
    });
    const refreshTokenId = hashRefreshToken(refreshToken.token).toString('hex');

    let allClients = await client.attachedClients();
    assert.equal(allClients.length, 2);

    await client.destroyAttachedClient({
      refreshTokenId,
      clientId: PUBLIC_CLIENT_ID,
    });

    allClients = await client.attachedClients();
    assert.equal(allClients.length, 1);
    assert.equal(allClients[0].sessionTokenId, mySessionTokenId);
    assert.equal(allClients[0].refreshTokenId, null);
  });

  after(async () => {
    await TestServer.stop(server);
    testUtils.restoreStdoutWrite();
  });
});
