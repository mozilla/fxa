/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  WebAuthnCredential,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';

import { uuidTransformer } from '@fxa/shared/db/mysql/core';

import { PasskeyConfig } from './passkey.config';

export interface RegistrationOptionsInput {
  /** User's uid as a hex string, used as the WebAuthn userID. */
  uid: string;
  /** User's email address, used as the WebAuthn userName. */
  email: string;
  /** Challenge from ChallengeManager. */
  challenge: string;
}

/**
 * Generate WebAuthn registration (attestation) options.
 *
 * @param config - PasskeyConfig instance
 * @param input  - Per-request inputs
 */
export async function generateWebauthnRegistrationOptions(
  config: PasskeyConfig,
  input: RegistrationOptionsInput
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  return generateRegistrationOptions({
    // rpName is deprecated field kept for backward compatibility;
    // spec recommends using rpId as a safe default.
    rpName: config.rpId,
    rpID: config.rpId,
    userName: input.email,
    userDisplayName: input.email,
    userID: uuidTransformer.to(input.uid),
    // Challenge must be passed as a Buffer (Uint8Array) so that simplewebauthn
    // base64url-encodes the raw bytes. Passing a string causes the library to
    // UTF-8-encode the text first, producing a different base64url value than
    // what was stored in Redis — breaking challenge lookup on finish.
    challenge: Buffer.from(input.challenge, 'base64url'),
    authenticatorSelection: {
      residentKey: config.residentKey,
      userVerification: config.userVerification,
      authenticatorAttachment: config.authenticatorAttachment,
    },
  });
}

export interface VerifyRegistrationInput {
  /** The raw registration response from the browser. */
  response: RegistrationResponseJSON;
  /** Challenge that was issued for this registration. */
  challenge: string;
}

export interface VerifiedRegistrationData {
  /** Credential ID as a base64url string, forwarded unchanged from SimpleWebAuthn. */
  credentialId: string;
  publicKey: Buffer;
  signCount: number;
  transports: AuthenticatorTransportFuture[];
  /** aaguid as a hyphenated-UUID string, forwarded unchanged from SimpleWebAuthn. */
  aaguid: string;
  backupEligible: boolean;
  backupState: boolean;
  prfEnabled: boolean;
}

export type RegistrationVerificationResult =
  | { verified: false; data?: never }
  | { verified: true; data: VerifiedRegistrationData };

/**
 * Extract the PRF `enabled` flag from authenticator extension results.
 */
function extractPrfEnabled(extensions: unknown): boolean {
  return Boolean(
    (extensions as { prf?: { enabled?: unknown } } | undefined)?.prf?.enabled
  );
}

/**
 * Verify a WebAuthn registration (attestation) response.
 *
 * @param config - PasskeyConfig instance
 * @param input  - Per-request inputs
 * @returns a discriminated union indicating verification success or failure;
 * `data` contains extracted credential info on success.
 * @throws wrapped library function throws `Error` on invalid input.
 * See source code for possible errors: https://github.com/MasterKale/SimpleWebAuthn/blob/320757144749c742e58ab3bb181087f9fbcac074/packages/server/src/registration/verifyRegistrationResponse.ts
 */
export async function verifyWebauthnRegistrationResponse(
  config: PasskeyConfig,
  input: VerifyRegistrationInput
): Promise<RegistrationVerificationResult> {
  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response: input.response,
    expectedChallenge: input.challenge,
    expectedOrigin: config.allowedOrigins,
    expectedRPID: config.rpId,
  });

  if (!verified) {
    return { verified: false };
  }

  const {
    credential,
    aaguid,
    credentialDeviceType,
    credentialBackedUp,
    authenticatorExtensionResults,
  } = registrationInfo;

  return {
    verified: true,
    data: {
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      signCount: credential.counter,
      transports: credential.transports ?? [],
      aaguid,
      backupEligible: credentialDeviceType === 'multiDevice',
      backupState: credentialBackedUp,
      prfEnabled: extractPrfEnabled(authenticatorExtensionResults),
    },
  };
}

/**
 * Per-request inputs for generating WebAuthn authentication options.
 * `rpID` and `userVerification` are supplied by PasskeyConfig.
 */
export interface AuthenticationOptionsInput {
  /** Challenge from ChallengeManager. */
  challenge: string;
  /**
   * Credential IDs (base64url) to restrict authentication to.
   * Pass the user's stored credential IDs for known-user flows.
   * Pass an empty array for usernameless/discoverable flows.
   */
  allowCredentials: string[];
}

/**
 * Generate WebAuthn authentication (assertion) options.
 *
 * @param config - PasskeyConfig instance
 * @param input  - Per-request inputs
 */
export async function generateWebauthnAuthenticationOptions(
  config: PasskeyConfig,
  input: AuthenticationOptionsInput
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  return generateAuthenticationOptions({
    rpID: config.rpId,
    userVerification: config.userVerification,
    // See comment in generateRegistrationOptions — same base64url roundtrip fix.
    challenge: Buffer.from(input.challenge, 'base64url'),
    allowCredentials:
      input.allowCredentials.length > 0
        ? input.allowCredentials.map((id) => ({ id }))
        : undefined,
  });
}

export interface VerifyAuthenticationInput {
  /** The raw authentication response from the browser. */
  response: AuthenticationResponseJSON;
  /** Challenge that was issued for this authentication. */
  challenge: string;
  /** Credential ID as a base64url string. */
  credentialId: string;
  publicKey: Buffer;
  signCount: number;
}

/**
 * Extracted data from a successful authentication verification.
 * Use `newSignCount` and `backupState` to update the stored passkey record.
 */
export interface VerifiedAuthenticationData {
  /** New sign count after successful authentication. */
  newSignCount: number;
  /** Current backup state of the credential. */
  backupState: boolean;
}

export type AuthenticationVerificationResult =
  | { verified: false; data?: never }
  | { verified: true; data: VerifiedAuthenticationData };

/**
 * Verify a WebAuthn authentication (assertion) response.
 *
 * NOTE: the wrapped library function follows the spec strictly and throws an
 * `Error` when signCount is non-zero and non-incrementing. This might reject
 * existing authenticators following older spec versions where incrementing
 * signCount was optional. Caller should catch and handle potential errors from
 * the library, in addition to checking the `verified` boolean in the result.
 * We should log signCount errors, to decide whether to relax this requirement
 * in the future for better compatibility (by custom implementations or switching
 * to a different library).
 *
 * @param config - PasskeyConfig instance
 * @param input  - Per-request inputs
 * @returns a discriminated union indicating verification success or failure;
 * `data` contains extracted new signCount and backupState on success.
 * @throws wrapped library function throws `Error` on invalid input.
 * See source code for possible errors: https://github.com/MasterKale/SimpleWebAuthn/blob/320757144749c742e58ab3bb181087f9fbcac074/packages/server/src/authentication/verifyAuthenticationResponse.ts
 */
export async function verifyWebauthnAuthenticationResponse(
  config: PasskeyConfig,
  input: VerifyAuthenticationInput
): Promise<AuthenticationVerificationResult> {
  const credential: WebAuthnCredential = {
    id: input.credentialId,
    publicKey: input.publicKey,
    counter: input.signCount,
  };

  const { verified, authenticationInfo } = await verifyAuthenticationResponse({
    response: input.response,
    expectedChallenge: input.challenge,
    expectedOrigin: config.allowedOrigins,
    expectedRPID: config.rpId,
    credential,
  });

  if (!verified) {
    return { verified: false };
  }

  return {
    verified: true,
    data: {
      newSignCount: authenticationInfo.newCounter,
      backupState: authenticationInfo.credentialBackedUp,
    },
  };
}

