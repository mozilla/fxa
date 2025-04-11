/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global fetch */

import { Provider, PROVIDER } from 'fxa-shared/db/models/auth/linked-account';
import jwt from 'jsonwebtoken';

import { jwk2pem } from '@fxa/shared/pem-jwk';

const RISC_CONFIG_URI =
  'https://accounts.google.com/.well-known/risc-configuration';

const APPLE_PUBLIC_KEYS = 'https://appleid.apple.com/auth/keys';

export type GoogleSETEvent = {
  subject: {
    subject_type: string;
    iss: string;
    sub: string;
  };
  reason?: string;
  state?: string; // Only present for test events
};

export type GoogleSETEvents = {
  [key: string]: GoogleSETEvent;
};

export type GoogleJWTSETPayload = {
  iss: string;
  aud: string;
  iat: number;
  jti: string;
  events: GoogleSETEvents;
};

export type AppleSETEvent = {
  type: string;
  sub: string;
  email?: string;
  is_private_email?: boolean;
  event_time: number;
};

export type AppleJWTSETPayload = {
  iss: string;
  aud: string;
  iat: number;
  jti: string;
  events: string;
};

async function getAccountFromSub(
  sub: string,
  db: any,
  provider: Provider,
  log: any
) {
  try {
    return db.getLinkedAccount(sub, provider);
  } catch (err) {
    // If the account doesn't exist, we can ignore the event.
    // This might happen if the user has already deleted their account before we got the
    // security event.
    log.debug(`Unknown account for sub: ${sub} and provider: ${provider}`);
    return null;
  }
}

async function revokeThirdPartySessions(
  uid: string,
  provider: Provider,
  log: any,
  db: any
) {
  const sessions = await db.sessions(uid);

  // Revoke all sessions created from third party logins
  let deletedCount = 0;
  for (const session of sessions) {
    if (session.providerId === PROVIDER[provider]) {
      await db.deleteSessionToken(session);
      deletedCount++;
    }
  }

  log.debug(`Revoked ${deletedCount} third party sessions for user ${uid}`);
}

// See events at https://developers.google.com/identity/protocols/risc#supported_event_types
export const googleEventHandlers = {
  'https://schemas.openid.net/secevent/risc/event-type/verification':
    handleGoogleTestEvent,
  'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked':
    handleGoogleSessionsRevokedEvent,
  'https://schemas.openid.net/secevent/risc/event-type/account-disabled':
    handleGoogleAccountDisabledEvent,
  'https://schemas.openid.net/secevent/risc/event-type/account-enabled':
    handleGoogleAccountEnabledEvent,
  'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked':
    handleGoogleSessionsRevokedEvent,

  // Since we don't store refresh tokens, we can't revoke it. Instead,
  // lets handle this like a sessions-revoked event.
  'https://schemas.openid.net/secevent/oauth/event-type/token-revoked':
    handleGoogleSessionsRevokedEvent,

  // We don't support purging accounts, so lets handle this like an account-disabled
  // event, ie revoke all third party sessions and unlink the account.
  'https://schemas.openid.net/secevent/risc/event-type/account-purged':
    handleGoogleAccountDisabledEvent,

  'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required':
    handleGoogleSessionsRevokedEvent,
};

// See https://developer.apple.com/documentation/sign_in_with_apple/processing_changes_for_sign_in_with_apple_accounts
export const appleEventHandlers = {
  // We don't support disabling/enabling emails, so noop for now
  'email-disabled': handleNoopEvent,
  'email-enabled': handleNoopEvent,

  'consent-revoked': handleAppleConsentRevokedEvent,
  'account-delete': handleAppleAccountDeleteEvent,
};

/**
 * Handle the consent revoked event. Apple recommends that we revoke all sessions
 * and unlink the account.
 *
 * @param eventDetails
 * @param log
 * @param db
 * @returns {Promise<void>}
 */
async function handleAppleConsentRevokedEvent(
  eventDetails: AppleSETEvent,
  log: any,
  db: any
) {
  const sub = eventDetails.sub;
  const account = await getAccountFromSub(sub, db, 'apple', log);

  // We have a guard that account exists because it is possible that it was
  // removed in another security event
  if (account) {
    await revokeThirdPartySessions(account.uid, 'apple', log, db);
    await db.deleteLinkedAccount(account.uid, 'apple');
  }
}

/**
 * Handle the account delete event. Apple recommends that we revoke all sessions
 * and unlink the account.
 *
 * @param eventDetails
 * @param log
 * @param db
 */
async function handleAppleAccountDeleteEvent(
  eventDetails: AppleSETEvent,
  log: any,
  db: any
) {
  const sub = eventDetails.sub;
  const account = await getAccountFromSub(sub, db, 'apple', log);

  if (account) {
    await revokeThirdPartySessions(account.uid, 'apple', log, db);
    await db.deleteLinkedAccount(account.uid, 'apple');
  }
}

function handleNoopEvent() {}

function handleGoogleTestEvent(eventDetails: GoogleSETEvent, log: any) {
  log.debug(`Received test event: ${eventDetails.state}`);
}

/**
 * Handle the sessions revoked event. Google recommends that we revoke all third
 * party sessions.
 *
 * @param eventDetails
 * @param log
 * @param db
 */
async function handleGoogleSessionsRevokedEvent(
  eventDetails: GoogleSETEvent,
  log: any,
  db: any
) {
  if (!eventDetails.subject) {
    return;
  }
  const { sub } = eventDetails.subject;
  const account = await getAccountFromSub(sub, db, 'google', log);

  if (account) {
    await revokeThirdPartySessions(account.uid, 'google', log, db);
  }
}

/**
 * Handle the account disabled event. Google recommends that we revoke all
 * third party sessions and unlink the account.
 *
 * @param eventDetails
 * @param log
 * @param db
 */
async function handleGoogleAccountDisabledEvent(
  eventDetails: GoogleSETEvent,
  log: any,
  db: any
) {
  const { sub } = eventDetails.subject;

  const account = await getAccountFromSub(sub, db, 'google', log);

  if (account) {
    await revokeThirdPartySessions(account.uid, 'google', log, db);
    await db.deleteLinkedAccount(account.uid, 'google');
  }
}

/**
 * Handle the account enabled event. For now, we don't do anything.
 */
async function handleGoogleAccountEnabledEvent() {}

export function handleGoogleOtherEventType(eventType: string, log: any) {
  log.debug(`Received unknown event: ${eventType}`);
}

/**
 *  Get Apple's public key from their public key endpoint.
 *
 *  Ref: https://developer.apple.com/documentation/sign_in_with_apple/fetch_apple_s_public_key_for_verifying_token_signature
 *
 * @param token
 */
export async function getApplePublicKey(token: string) {
  const response = await fetch(APPLE_PUBLIC_KEYS);
  if (!response.ok) {
    throw new Error(`Failed to fetch Apple public keys: ${response.status}`);
  }
  const appleCerts = await response.json();
  const jwtHeader = jwt.decode(token, { complete: true })?.header;
  const keyId = jwtHeader?.kid;
  if (!keyId) {
    throw new Error('No valid keyId found.');
  }

  const publicKey = appleCerts.keys.find(
    (key: { kid: string }) => key.kid === keyId
  );

  if (!publicKey) {
    throw new Error('Public key certificate not found.');
  }

  return {
    pem: jwk2pem(publicKey),
  };
}
/**
 * Get Google's public key from their RISC configuration.
 *
 * @param token
 * @returns {Promise<{pem: string, issuer: string}>}
 */
export async function getGooglePublicKey(
  token: string
): Promise<{ pem: string; issuer: string }> {
  const riscResponse = await fetch(RISC_CONFIG_URI);
  if (!riscResponse.ok) {
    throw new Error(`Failed to fetch RISC config: ${riscResponse.status}`);
  }
  const riscConfig = await riscResponse.json();
  const { jwks_uri: jwksUri, issuer } = riscConfig;

  const googleResponse = await fetch(jwksUri);
  if (!googleResponse.ok) {
    throw new Error(
      `Failed to fetch Google public keys: ${googleResponse.status}`
    );
  }
  const googleCerts = await googleResponse.json();
  const jwtHeader = jwt.decode(token, { complete: true })?.header;
  const keyId = jwtHeader.kid;
  if (!keyId) {
    throw new Error('No valid keyId found.');
  }

  const publicKey = googleCerts.keys.find(
    (key: { kid: string }) => key.kid === keyId
  );

  if (!publicKey) {
    throw new Error('Public key certificate not found.');
  }

  return {
    pem: jwk2pem(publicKey),
    issuer,
  };
}

/**
 * Validate a JWT security token against public key.
 *
 * @param token
 * @param clientIds
 * @param publicKeyPem
 * @param issuer
 * @returns {Promise}
 */
export async function validateSecurityToken(
  token: string,
  clientIds: [string],
  publicKeyPem: any,
  issuer: string
) {
  // Decode the token, validating its signature, audience, and issuer
  return jwt.verify(token, publicKeyPem, {
    algorithms: ['RS256'],
    audience: clientIds,
    issuer: issuer,
  });
}

/**
 * Check to see if the JWT token aud value matches the client ID. We
 * should ignore events from other clients. Currently specific to Google.
 *
 * @param token
 * @param clientId
 */
export function isValidClientId(token: string, clientId: string) {
  const decoded = jwt.decode(token, { complete: true }) as {
    payload: GoogleJWTSETPayload;
  };
  return decoded && decoded.payload.aud.includes(clientId);
}
