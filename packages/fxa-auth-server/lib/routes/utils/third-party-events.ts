/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import jwt from 'jsonwebtoken';
import { jwk2pem } from 'pem-jwk';
import axios from 'axios';

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

// See events at https://developers.google.com/identity/protocols/risc#supported_event_types
export const eventHandlers = {
  'https://schemas.openid.net/secevent/risc/event-type/verification':
    handleTestEvent,
};

function handleTestEvent(eventDetails: SETEvent, log: any) {
  log.debug(`Received test event: ${eventDetails.state}`);
}

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
