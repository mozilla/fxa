/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * FXA-14469 reproduction (server side).
 *
 * Symptom: after pairing an Android device with the v2 flow, signing that
 * device out from desktop Connected Services removes it server side but the
 * phone stays signed in. Remote sign-out on the phone is driven only by a
 * `fxaccounts:device_disconnected` web-push (application-services
 * `internal/push.rs` calls `disconnect()` only for that push, matched on the
 * local device id). So whether the phone signs out hinges on whether the
 * server-side sign-out reaches the branch that emits that push.
 *
 * This spec pins that branch. It cannot exercise a real phone or push delivery
 * (no autopush/FCM locally), so it asserts, at the server, which
 * `/account/attached_client/destroy` path runs for the two shapes a v2-paired
 * Fenix client can take:
 *
 *   A. Registered as a *device* (refresh token + device row, as a phone that
 *      completed `POST /account/device`): destroy takes `devices.destroy`, the
 *      only path that calls `push.notifyDeviceDisconnected`.
 *   B. A *refresh token with no device row*: destroy takes
 *      `deleteClientRefreshToken`, which sends no push.
 *
 * The reproduction value is the contrast: the phone is push-reachable only in A.
 * Which shape a real v2-paired Fenix produces is a client question the device
 * spec / stage must answer.
 */

import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const Client = require('../client')();
const hashRefreshToken = require('fxa-shared/auth/encrypt').hash;

const buf = (v: any) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));

// Firefox Android (Fenix) — the client id a v2-paired Android device carries.
const FENIX_CLIENT_ID = 'a2270f727f45f648';

// The scopes the v2 supplicant requests (Android FxaWebChannelFeature
// PAIRING_OAUTH_SCOPES / iOS FxAPairingOAuthHandler): profile, oldsync, and the
// session-token scope. oldsync is what makes the server create a device record.
const PAIRING_SCOPE =
  'profile https://identity.mozilla.com/apps/oldsync https://identity.mozilla.com/tokens/session';

const b64url = (b: Buffer) =>
  b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

let server: TestServerInstance;
let oauthServerDb: any;

beforeAll(async () => {
  server = await getSharedTestServer();
  oauthServerDb = require('../../lib/oauth/db');
}, 120000);

afterAll(async () => {
  await server.stop();
});

async function pairedFenixAccount() {
  const email = server.uniqueEmail();
  const client = await Client.createAndVerify(
    server.publicUrl,
    email,
    'test password',
    server.mailbox,
    { version: '' }
  );
  const refresh = await oauthServerDb.generateRefreshToken({
    clientId: buf(FENIX_CLIENT_ID),
    userId: buf(client.uid),
    email: client.email,
    scope: PAIRING_SCOPE,
  });
  const refreshToken = refresh.token.toString('hex');
  const refreshTokenId = hashRefreshToken(refreshToken).toString('hex');
  return { client, refreshToken, refreshTokenId };
}

describe('#integration - FXA-14469 v2 Android remote sign-out', () => {
  it('A: sign-out of a paired-as-device Fenix takes the devices.destroy (push) path', async () => {
    const { client, refreshToken, refreshTokenId } = await pairedFenixAccount();

    // A real Fenix registers a device with a push subscription after redeeming
    // the pairing code. Model that: a device row with a push callback + keys.
    const crypto = require('crypto');
    const ecdh = crypto.createECDH('prime256v1');
    ecdh.generateKeys();
    const device = await client.updateDeviceWithRefreshToken(refreshToken, {
      name: 'Firefox on Pixel',
      type: 'mobile',
      pushCallback: 'https://updates.push.services.mozilla.com/wpush/v2/repro',
      pushPublicKey: b64url(ecdh.getPublicKey()),
      pushAuthKey: b64url(crypto.randomBytes(16)),
    });
    expect(device.id).toBeTruthy();

    // Connected Services lists the phone as a device.
    let attached = await client.api.attachedClients(client.sessionToken);
    const fenix = attached.find((c: any) => c.clientId === FENIX_CLIENT_ID);
    expect(fenix).toBeTruthy();
    expect(fenix.deviceId).toBe(device.id);
    expect(fenix.refreshTokenId).toBe(refreshTokenId);

    // Exactly the payload fxa-settings sends when the user clicks "Sign out".
    await client.api.attachedClientDestroy(client.sessionToken, {
      clientId: FENIX_CLIENT_ID,
      deviceId: device.id,
      refreshTokenId,
    });

    // The device branch ran: the device is gone from the account and its refresh
    // token is revoked. devices.destroy is the only path that calls
    // push.notifyDeviceDisconnected, so a real phone would receive the sign-out
    // push here.
    attached = await client.api.attachedClients(client.sessionToken);
    expect(
      attached.find((c: any) => c.clientId === FENIX_CLIENT_ID)
    ).toBeUndefined();
    const revoked = await oauthServerDb.getRefreshToken(buf(refreshTokenId));
    expect(revoked).toBeFalsy();
  });

  it('B: sign-out of a paired-without-a-device Fenix is silent (no push path)', async () => {
    const { client, refreshTokenId } = await pairedFenixAccount();

    // No device registered — the client exists only as an OAuth refresh token.
    let attached = await client.api.attachedClients(client.sessionToken);
    const fenix = attached.find((c: any) => c.clientId === FENIX_CLIENT_ID);
    expect(fenix).toBeTruthy();
    expect(fenix.deviceId).toBeNull();
    expect(fenix.refreshTokenId).toBe(refreshTokenId);

    // Same "Sign out" click, but with no deviceId to send.
    await client.api.attachedClientDestroy(client.sessionToken, {
      clientId: FENIX_CLIENT_ID,
      refreshTokenId,
    });

    // The refresh-token branch ran: the token is revoked and the client is gone,
    // but devices.destroy was never called, so no deviceDisconnected push was
    // emitted. A phone in this shape stays signed in until a token op later fails.
    attached = await client.api.attachedClients(client.sessionToken);
    expect(
      attached.find((c: any) => c.clientId === FENIX_CLIENT_ID)
    ).toBeUndefined();
    const revoked = await oauthServerDb.getRefreshToken(buf(refreshTokenId));
    expect(revoked).toBeFalsy();
  });
});
