/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import jwt from 'jsonwebtoken';
import { jwk2pem } from 'pem-jwk';
import axios from 'axios';
import { Provider, PROVIDER } from 'fxa-shared/db/models/auth/linked-account';

const RISC_CONFIG_URI =
  'https://accounts.google.com/.well-known/risc-configuration';

export type SETEvent = {
  subject: {
    subject_type: string;
    iss: string;
    sub: string;
  };
  reason?: string;
  state?: string; // Only present for test events
};

export type SETEvents = {
  [key: string]: SETEvent;
};

export type JWTSETPayload = {
  iss: string;
  aud: string;
  iat: number;
  jti: string;
  events: SETEvents;
};

async function getUidFromSub(sub: string, db: any, provider: Provider) {
  const { uid } = await db.getLinkedAccount(sub, provider);
  return uid;
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
export const eventHandlers = {
  'https://schemas.openid.net/secevent/risc/event-type/verification':
    handleTestEvent,
  'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked':
    handleSessionsRevokedEvent,
  'https://schemas.openid.net/secevent/risc/event-type/account-disabled':
    handleAccountDisabledEvent,
  'https://schemas.openid.net/secevent/risc/event-type/account-enabled':
    handleAccountEnabledEvent,
};

function handleTestEvent(eventDetails: SETEvent, log: any) {
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
async function handleSessionsRevokedEvent(
  eventDetails: SETEvent,
  log: any,
  db: any
) {
  const { sub } = eventDetails.subject;
  const uid = await getUidFromSub(sub, db, 'google');
  await revokeThirdPartySessions(uid, 'google', log, db);
}

/**
 * Handle the account disabled event. Google recommends that we revoke all
 * third party sessions and unlink the account.
 *
 * @param eventDetails
 * @param log
 * @param db
 */
async function handleAccountDisabledEvent(
  eventDetails: SETEvent,
  log: any,
  db: any
) {
  const { sub } = eventDetails.subject;
  const uid = await getUidFromSub(sub, db, 'google');
  await revokeThirdPartySessions(uid, 'google', log, db);
  await db.deleteLinkedAccount(uid, 'google');
}

/**
 * Handle the account enabled event. For now we don't do anything.
 */
async function handleAccountEnabledEvent() {}

export function handleOtherEventType(eventType: string, log: any) {
  log.debug(`Received unknown event: ${eventType}`);
}

/**
 * Get Google's public key from their RISC configuration.
 *
 * @param token
 * @returns {Promise<{pem: string, issuer: string}>}
 */
export async function getGooglePublicKey(token: string) {
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
}

/**
 * Validate a JWT security token against Google's public key.
 *
 * @param token
 * @param clientId
 * @param publicKey
 * @returns {Promise<JWTSETPayload>}
 */
export async function validateSecurityToken(
  token: string,
  clientId: string,
  publicKey: { pem: any; issuer: string }
): Promise<JWTSETPayload> {
  // Decode the token, validating its signature, audience, and issuer
  return jwt.verify(token, publicKey.pem, {
    algorithms: ['RS256'],
    audience: [clientId],
    issuer: publicKey.issuer,
  }) as JWTSETPayload;
}

/**
 * Check to see if the JWT token aud value matches the client ID. We
 * should ignore events from other clients.
 *
 * @param token
 * @param clientId
 */
export function isValidClientId(token: string, clientId: string) {
  const decoded = jwt.decode(token, { complete: true }) as {
    payload: JWTSETPayload;
  };
  return decoded && decoded.payload.aud.includes(clientId);
}
