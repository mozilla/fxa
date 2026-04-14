/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const authMethods = require('../authMethods');
const random = require('../crypto/random');

module.exports = (log, Token, config) => {
  const MAX_AGE_WITHOUT_DEVICE =
    config.tokenLifetimes.sessionTokenWithoutDevice;

  // Convert verificationMethod to a more readable format. Maps to
  // https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-db-mysql/lib/db/util.js#L55
  const VERIFICATION_METHODS = new Map([
    [0, 'email'],
    [1, 'email-2fa'],
    [2, 'totp-2fa'],
    [3, 'recovery-code'],
    [4, 'sms-2fa'],
    [5, 'passkey'],
  ]);

  class SessionToken extends Token {
    constructor(keys, details) {
      super(keys, details);

      if (MAX_AGE_WITHOUT_DEVICE && !details.deviceId) {
        this.lifetime = MAX_AGE_WITHOUT_DEVICE;
      }

      this.setUserAgentInfo(details);
      this.setDeviceInfo(details);
      this.email = details.email || null;
      this.emailCode = details.emailCode || null;
      this.emailVerified = !!details.emailVerified;
      this.verifierSetAt = details.verifierSetAt;
      this.profileChangedAt = details.profileChangedAt;
      this.keysChangedAt = details.keysChangedAt;
      this.authAt = details.authAt || 0;
      this.locale = details.locale || null;
      this.mustVerify = !!details.mustVerify || false;

      // Tokens are considered verified if no tokenVerificationId exists
      this.tokenVerificationId = details.tokenVerificationId || null;
      this.tokenVerified = this.tokenVerificationId ? false : true;

      this.verificationMethod = details.verificationMethod || null;
      this.verificationMethodValue = VERIFICATION_METHODS.get(
        this.verificationMethod
      );
      this.verifiedAt = details.verifiedAt || null;
      this.metricsOptOutAt = details.metricsOptOutAt || null;
      this.providerId = details.providerId || null;
    }

    static create(details) {
      details = details || {};
      log.trace('SessionToken.create', { uid: details.uid });
      return Token.createNewToken(SessionToken, details);
    }

    static fromHex(string, details) {
      log.trace('SessionToken.fromHex');
      return Token.createTokenFromHexData(SessionToken, string, details || {});
    }

    lastAuthAt() {
      return Math.floor((this.authAt || this.createdAt) / 1000);
    }

    get state() {
      if (this.tokenVerified) {
        return 'verified';
      } else {
        return 'unverified';
      }
    }

    async copyTokenState() {
      // Copy verification state of the token, but generate
      // independent verification codes.
      const newVerificationState = {};
      if (this.tokenVerificationId) {
        newVerificationState.tokenVerificationId = await random.hex(
          this.tokenVerificationId.length / 2
        );
      }

      // Copy all other details from the original sessionToken.
      // We have to lie a little here and copy the creation time
      // of the original sessionToken. If we set createdAt to the
      // current time, we would falsely report the new session's
      // `lastAuthAt` value as the current timestamp.
      return {
        ...this,
        ...newVerificationState,
      };
    }

    get authenticationMethods() {
      const amrValues = new Set();
      // 'pwd' is added to every session regardless of how the user authenticated.
      // This pre-dates passwordless flows (linked accounts, email OTP, passkeys)
      // and is factually wrong for all of them. For linked accounts and email OTP
      // the error is inconsequential — {pwd, email} → {know, know} → AAL1 whether
      // or not pwd is present. For passkey sessions the 'pwd' entry incidentally
      // produces the correct AAL2 result, but only because AMR_TO_TYPE maps
      // 'webauthn' to 'have' alone. A passkey with user verification is
      // intrinsically multi-factor ('have' + 'know'/'are') and should yield AAL2
      // without needing 'pwd'. Fixing both the mapping and this invariant is
      // deferred (FXA-13432).
      amrValues.add('pwd');
      // Verified sessionTokens imply some additional authentication method(s).
      if (this.verificationMethodValue) {
        amrValues.add(
          authMethods.verificationMethodToAMR(this.verificationMethodValue)
        );
      } else if (this.tokenVerified) {
        amrValues.add('email');
      }
      return amrValues;
    }

    // The AAL of this specific session, derived from the methods used to
    // establish it. This is distinct from the account-level AAL reported
    // to RPs via profile:amr — that reflects mandatory second factors
    // configured on the account; this reflects what actually happened
    // during authentication. The fxa-aal JWT claim in OAuth assertions
    // and the acr_values enforcement in grant.js both use this value.
    get authenticatorAssuranceLevel() {
      return authMethods.maximumAssuranceLevel(this.authenticationMethods);
    }

    setUserAgentInfo(data) {
      this.uaBrowser = data.uaBrowser;
      this.uaBrowserVersion = data.uaBrowserVersion;
      this.uaOS = data.uaOS;
      this.uaOSVersion = data.uaOSVersion;
      this.uaDeviceType = data.uaDeviceType;
      this.uaFormFactor = data.uaFormFactor;
      if (data.lastAccessTime) {
        this.lastAccessTime = data.lastAccessTime;
      }
    }

    setDeviceInfo(data) {
      this.deviceId = data.deviceId;
      this.deviceName = data.deviceName;
      this.deviceType = data.deviceType;
      this.deviceCreatedAt = data.deviceCreatedAt;
      this.callbackURL = data.callbackURL;
      this.callbackPublicKey = data.callbackPublicKey;
      this.callbackAuthKey = data.callbackAuthKey;
      this.callbackIsExpired = data.callbackIsExpired;
    }
  }

  SessionToken.tokenTypeID = 'sessionToken';
  return SessionToken;
};
