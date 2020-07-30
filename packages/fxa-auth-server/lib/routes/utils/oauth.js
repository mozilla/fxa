/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const encrypt = require('../../../lib/oauth/encrypt');
const {
  OAUTH_SCOPE_OLD_SYNC,
  MAX_NEW_ACCOUNT_AGE,
} = require('../../constants');
const ScopeSet = require('fxa-shared').oauth.scopes;

// right now we only care about notifications for the following scopes
// if not a match, then we don't notify
const NOTIFICATION_SCOPES = ScopeSet.fromArray([OAUTH_SCOPE_OLD_SYNC]);

module.exports = {
  newTokenNotification: async function newTokenNotification(
    db,
    oauthdb,
    mailer,
    devices,
    request,
    grant
  ) {
    const clientId = request.payload.client_id;
    const scopeSet = ScopeSet.fromString(grant.scope);
    const credentials = (request.auth && request.auth.credentials) || {};

    if (!scopeSet.intersects(NOTIFICATION_SCOPES)) {
      // right now we only care about notifications for the `oldsync` scope
      // if not a match, then we don't do any notifications
      return;
    }

    if (!credentials.uid) {
      // this can be removed once issue #3000 has been resolved
      const tokenVerify = await oauthdb.checkAccessToken(grant.access_token);
      // some grant flows won't have the uid in `credentials`
      credentials.uid = tokenVerify.user;
    }

    if (!credentials.refreshTokenId) {
      // provide a refreshToken for the device creation below
      credentials.refreshTokenId = encrypt
        .hash(grant.refresh_token)
        .toString('hex');
    }

    if (!credentials.id && grant.session_token_id) {
      // if the caller also requested apps/oldsync scope and a refresh token, then
      // we will end up creating a placeholder device record for that refresh token.
      // We should ensure that the sessionToken also gets attached to that same device record.
      // the 'id' field is part of the raw Hapi 'credentials' object.
      credentials.id = grant.session_token_id;
    }

    // we set tokenVerified because the granted scope is part of NOTIFICATION_SCOPES
    credentials.tokenVerified = true;
    credentials.client = await oauthdb.getClientInfo(clientId);

    // Connect the new refreshToken to the existing device record, or create a new placeholder if there isn't one.
    await devices.upsert(request, credentials, {
      // We don't provide any other device info, but credentials.client will let it generate a default name for the device.
      // Pass in the deviceId associated with the credential to reuse the existing device id.
      id: credentials.deviceId,
    });

    // Email the user about their new device connection
    // (but don't send anything if it was an existing device or new account)
    if (!credentials.deviceId) {
      const account = await db.account(credentials.uid);
      const isNewAccount = Date.now() - account.createdAt < MAX_NEW_ACCOUNT_AGE;

      if (!isNewAccount) {
        const geoData = request.app.geo;
        const ip = request.app.clientAddress;
        const emailOptions = {
          acceptLanguage: request.app.acceptLanguage,
          ip,
          location: geoData.location,
          service: clientId,
          timeZone: geoData.timeZone,
          uid: credentials.uid,
        };
        await mailer.sendNewDeviceLoginEmail(
          account.emails,
          account,
          emailOptions
        );
      }
    }
  },
};
