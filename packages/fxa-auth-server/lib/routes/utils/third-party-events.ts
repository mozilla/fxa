/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import axios from 'axios';
import { Provider, PROVIDER } from 'fxa-shared/db/models/auth/linked-account';
import jwt from 'jsonwebtoken';
import * as Sentry from '@sentry/node';

import { jwk2pem } from '@fxa/shared/pem-jwk';
import { StatsD } from 'hot-shots';

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
  log: any,
  statsd: StatsD
) {
  try {
    return await db.getLinkedAccount(sub, provider);
  } catch (err) {
    // If the account doesn't exist, we can ignore the event.
    // This might happen if the user has already deleted their account before we got the
    // security event.
    log.debug(`Unknown account for sub: ${sub} and provider: ${provider}`, {
      error: err.message,
      stack: err.stack,
    });
    statsd.increment('getAccountFromSub.error');
    return null;
  }
}

async function revokeThirdPartySessions(
  uid: string,
  provider: Provider,
  log: any,
  db: any,
  statsd: StatsD
) {
  try {
    const sessions = await db.sessions(uid);

    // Revoke all sessions created from third party logins
    let deletedCount = 0;
    for (const session of sessions) {
      if (session.providerId === PROVIDER[provider]) {
        try {
          await db.deleteSessionToken(session);
          deletedCount++;
        } catch (deleteError) {
            statsd.increment('revokeThirdPartySessions.deleteSessionToken.error');
          // Continue with other sessions instead of failing completely
        }
      }
    }

    log.debug(`Revoked ${deletedCount} third party sessions for user ${uid}`);
  } catch (error) {
    statsd.increment('revokeThirdPartySessions.error');
    throw error;
  }
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
 * @param statsd
 * @returns Promise<void>)
 */
async function handleAppleConsentRevokedEvent(
  eventDetails: AppleSETEvent,
  log: any,
  db: any,
  statsd: StatsD
) {
  try {
    const sub = eventDetails.sub;
    const account = await getAccountFromSub(sub, db, 'apple', log, statsd);

    // We have a guard that account exists because it is possible that it was
    // removed in another event
    if (account) {
      await revokeThirdPartySessions(account.uid, 'apple', log, db, statsd);
      await db.deleteLinkedAccount(account.uid, 'apple');
    }
  } catch (error) {
    statsd.increment('handleAppleConsentRevokedEvent.error');
    Sentry.captureException(error);
    // Don't rethrow - log and continue to prevent unhandled promise rejection
  }
}

/**
 * Handle the account delete event. Apple recommends that we revoke all sessions
 * and unlink the account.
 *
 * @param eventDetails
 * @param log
 * @param db
 * @param statsd
 */
async function handleAppleAccountDeleteEvent(
  eventDetails: AppleSETEvent,
  log: any,
  db: any,
  statsd: StatsD
) {
  try {
    const sub = eventDetails.sub;
    const account = await getAccountFromSub(sub, db, 'apple', log, statsd);

    if (account) {
      await revokeThirdPartySessions(account.uid, 'apple', log, db, statsd);
      await db.deleteLinkedAccount(account.uid, 'apple');
    }
  } catch (error) {
    statsd.increment('handleAppleAccountDeleteEvent.error');
    // Don't rethrow - log and continue to prevent unhandled promise rejection
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
 * @param statsd
 */
async function handleGoogleSessionsRevokedEvent(
  eventDetails: GoogleSETEvent,
  log: any,
  db: any,
  statsd: StatsD
) {
  try {
    if (!eventDetails.subject) {
      return;
    }
    const { sub } = eventDetails.subject;
    const account = await getAccountFromSub(sub, db, 'google', log, statsd);

    if (account) {
      await revokeThirdPartySessions(account.uid, 'google', log, db, statsd);
    }
  } catch (error) {
      statsd.increment('handleGoogleSessionsRevokedEvent.error');
    // Don't rethrow - log and continue to prevent unhandled promise rejection
  }
}

/**
 * Handle the account disabled event. Google recommends that we revoke all
 * third party sessions and unlink the account.
 *
 * @param eventDetails
 * @param log
 * @param db
 * @param statsd
 */
async function handleGoogleAccountDisabledEvent(
  eventDetails: GoogleSETEvent,
  log: any,
  db: any,
  statsd: StatsD
) {
  try {
    const { sub } = eventDetails.subject;

    const account = await getAccountFromSub(sub, db, 'google', log, statsd);

    if (account) {
      await revokeThirdPartySessions(account.uid, 'google', log, db, statsd);
      await db.deleteLinkedAccount(account.uid, 'google');
    }
  } catch (error) {
    statsd.increment('handleGoogleAccountDisabledEvent.error');
    // Don't rethrow - log and continue to prevent unhandled promise rejection
  }
}

/**
 * Handle the account enabled event. For now, we don't do anything.
 */
async function handleGoogleAccountEnabledEvent() {}

export function handleGoogleOtherEventType(eventType: string, log: any) {
  log.debug(`Received unknown event: ${eventType}`);
}

export function normalizeGoogleSETEventType(eventType: string): string {
  // Map of known event types to clear, concise names
  const eventTypeMap: { [key: string]: string } = {
    'https://schemas.openid.net/secevent/risc/event-type/verification': 'verification',
    'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked': 'sessions_revoked',
    'https://schemas.openid.net/secevent/risc/event-type/account-disabled': 'account_disabled',
    'https://schemas.openid.net/secevent/risc/event-type/account-enabled': 'account_enabled',
    'https://schemas.openid.net/secevent/risc/event-type/account-purged': 'account_purged',
    'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required': 'credential_change_required',
    'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked': 'tokens_revoked',
    'https://schemas.openid.net/secevent/oauth/event-type/token-revoked': 'token_revoked',
    'https://schemas.openid.net/secevent/risc/event-type/unknown': 'unknown',
  };

  // Return mapped name if available, otherwise fall back to URL normalization
  if (eventTypeMap[eventType]) {
    return eventTypeMap[eventType];
  }

  // Fallback: normalize unknown event types by replacing special characters
  return eventType
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 *  Get Apple's public key from their public key endpoint.
 *
 *  Ref: https://developer.apple.com/documentation/sign_in_with_apple/fetch_apple_s_public_key_for_verifying_token_signature
 *
 * @param token
 * @param statsd
 */
export async function getApplePublicKey(token: string, statsd: StatsD) {
  try {
    const appleCerts = await axios.get(APPLE_PUBLIC_KEYS);
    const jwtHeader = jwt.decode(token, { complete: true })?.header;
    const keyId = jwtHeader?.kid;
    if (!keyId) {
      throw new Error('No valid keyId found.');
    }

    const publicKey = appleCerts.data.keys.find(
      (key: { kid: string }) => key.kid === keyId
    );

    if (!publicKey) {
      throw new Error('Public key certificate not found.');
    }

    return {
      pem: jwk2pem(publicKey),
    };
  } catch (error) {
    statsd.increment('getApplePublicKey.error');
    throw new Error(`Failed to get Apple public key: ${error.message}`);
  }
}

/**
 * Get Google's public key from their RISC configuration.
 *
 * @param token
 * @param statsd
 * @returns {Promise<{pem: string, issuer: string}>}
 */
export async function getGooglePublicKey(
  token: string,
  statsd: StatsD
): Promise<{ pem: string; issuer: string }> {
  try {
    const riscConfig = await axios.get(RISC_CONFIG_URI);
    const { jwks_uri: jwksUri, issuer } = riscConfig.data;

    const googleCerts = await axios.get(jwksUri);
    const jwtHeader = jwt.decode(token, { complete: true })?.header;
    const keyId = jwtHeader.kid;
    if (!keyId) {
      throw new Error('No valid keyId found.');
    }

    const publicKey = googleCerts.data.keys.find(
      (key: { kid: string }) => key.kid === keyId
    );

    if (!publicKey) {
      throw new Error('Public key certificate not found.');
    }

    return {
      pem: jwk2pem(publicKey),
      issuer,
    };
  } catch (error) {
    statsd.increment('getGooglePublicKey.error');
    throw new Error(`Failed to get Google public key: ${error.message}`);
  }
}

/**
 * Validate a JWT security token against public key.
 *
 * @param token
 * @param clientIds
 * @param publicKeyPem
 * @param issuer
 * @param statsd
 * @returns {Promise}
 */
export async function validateSecurityToken(
  token: string,
  clientIds: [string],
  publicKeyPem: any,
  issuer: string,
  statsd: StatsD
) {
  try {
    return jwt.verify(token, publicKeyPem, {
      algorithms: ['RS256'],
      issuer,
      audience: clientIds,
    });
  } catch (error) {
    statsd.increment('validateSecurityToken.error');
    return undefined; // Return undefined if verification fails
  }
}

/**
 * Check to see if the JWT token aud value matches the client ID. We
 * should ignore events from other clients. Currently specific to Google.
 *
 * @param token
 * @param clientId
 */
export function isValidClientId(token: string, clientId: string) {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      return false;
    }
    return decoded.payload.aud === clientId;
  } catch (error) {
    // If we can't decode the token, it's not valid
    return false;
  }
}
