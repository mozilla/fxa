/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  generateRegistrationOptions as libGenerateRegistrationOptions,
  verifyRegistrationResponse as libVerifyRegistrationResponse,
  generateAuthenticationOptions as libGenerateAuthenticationOptions,
  verifyAuthenticationResponse as libVerifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  WebAuthnCredential,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';

import { PasskeyConfig } from './passkey.config';

export interface RegistrationOptionsInput {
  /** User's uid as a Buffer, used as the WebAuthn userID. */
  uid: Buffer;
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
export async function generateRegistrationOptions(
  config: PasskeyConfig,
  input: RegistrationOptionsInput
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  return libGenerateRegistrationOptions({
    rpName: config.rpName,
    rpID: config.rpId,
    userName: input.email,
    userID: input.uid,
    challenge: input.challenge,
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
  credentialId: Buffer;
  publicKey: Buffer;
  signCount: number;
  transports: AuthenticatorTransportFuture[];
  aaguid: Buffer;
  backupEligible: boolean;
  backupState: boolean;
}

export type RegistrationVerificationResult =
  | { verified: false; data?: never }
  | { verified: true; data: VerifiedRegistrationData };

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
export async function verifyRegistrationResponse(
  config: PasskeyConfig,
  input: VerifyRegistrationInput
): Promise<RegistrationVerificationResult> {
  const { verified, registrationInfo } = await libVerifyRegistrationResponse({
    response: input.response,
    expectedChallenge: input.challenge,
    expectedOrigin: config.allowedOrigins,
    expectedRPID: config.rpId,
  });

  if (!verified) {
    return { verified: false };
  }

  const { credential, aaguid, credentialDeviceType, credentialBackedUp } =
    registrationInfo;

  return {
    verified: true,
    data: {
      credentialId: Buffer.from(credential.id, 'base64url'),
      publicKey: Buffer.from(credential.publicKey),
      signCount: credential.counter,
      transports: credential.transports ?? [],
      aaguid: uuidToBuffer(aaguid),
      backupEligible: credentialDeviceType === 'multiDevice',
      backupState: credentialBackedUp,
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
   * Credential IDs to restrict authentication to.
   * Pass the user's stored credential IDs for known-user flows.
   * Pass an empty array for usernameless/discoverable flows.
   */
  allowCredentials: Buffer[];
}

/**
 * Generate WebAuthn authentication (assertion) options.
 *
 * @param config - PasskeyConfig instance
 * @param input  - Per-request inputs
 */
export async function generateAuthenticationOptions(
  config: PasskeyConfig,
  input: AuthenticationOptionsInput
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  return libGenerateAuthenticationOptions({
    rpID: config.rpId,
    userVerification: config.userVerification,
    challenge: input.challenge,
    allowCredentials:
      input.allowCredentials.length > 0
        ? input.allowCredentials.map((id) => ({ id: id.toString('base64url') }))
        : undefined,
  });
}

export interface VerifyAuthenticationInput {
  /** The raw authentication response from the browser. */
  response: AuthenticationResponseJSON;
  /** Challenge that was issued for this authentication. */
  challenge: string;
  credentialId: Buffer;
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
export async function verifyAuthenticationResponse(
  config: PasskeyConfig,
  input: VerifyAuthenticationInput
): Promise<AuthenticationVerificationResult> {
  const credential: WebAuthnCredential = {
    id: input.credentialId.toString('base64url'),
    publicKey: input.publicKey,
    counter: input.signCount,
  };

  const { verified, authenticationInfo } =
    await libVerifyAuthenticationResponse({
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

/**
 * Convert a UUID string to a 16-byte Buffer.
 *
 * SimpleWebAuthn returns `aaguid` as a lower-case hyphenated UUID string.
 * This strips the hyphens and parses the result to a Buffer.
 *
 * @param uuid - Lower-case hyphenated UUID string
 */
export function uuidToBuffer(uuid: string): Buffer {
  return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}
