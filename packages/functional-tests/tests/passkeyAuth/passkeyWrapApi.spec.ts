/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * API-level coverage for the passkey wrap round-trip: seal `kB` for a passkey,
 * store it, read it back and reopen it, driven through `fxa-auth-client` with
 * no page.
 *
 * Requires `passkeys.enabled`, `registrationEnabled`, `authenticationEnabled`
 * and `passwordlessSyncEnabled` on the auth-server, a `prfSalt`, and
 * `requestPrfAtAuthentication` other than `off`.
 */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import {
  VirtualAuthenticator,
  VirtualCredential,
} from '@fxa/accounts/passkey/testing';
import type { PublicKeyCredentialJSON } from 'fxa-auth-client/lib/client';
import {
  createWrapEnvelope,
  openWrapEnvelope,
} from 'fxa-settings/src/lib/passkey-crypto';

const PASSKEY_SCOPE = 'passkey';

type CeremonyResponse =
  | ReturnType<typeof VirtualAuthenticator.createAttestationResponse>
  | ReturnType<typeof VirtualAuthenticator.createAssertionResponse>;

/**
 * `fxa-auth-client` re-declares the WebAuthn response types rather than
 * importing them, to keep nx from seeing a circular dependency, and types
 * `clientExtensionResults` as a `Record` that an interface cannot satisfy
 * without an index signature.
 */
const asCredentialJson = (
  response: CeremonyResponse
): PublicKeyCredentialJSON => response as unknown as PublicKeyCredentialJSON;

type PasskeyAccount = {
  credentials: Credentials;
  credentialId: string;
  credential: VirtualCredential;
  /** `kB` as the password derives it, hex, as `accountKeys` returns it. */
  passwordKb: string;
};

type PasskeySignIn = {
  uid: string;
  sessionToken: string;
  mfaToken?: string;
  /** The eval salt the server issued, absent when it requested no PRF. */
  prfSalt?: string;
  /** The authenticator's PRF output, absent when it cannot evaluate one. */
  prfOut?: Uint8Array;
};

/** Narrows a value the flow under test is expected to have produced. */
function required<T>(value: T | undefined, name: string): T {
  expect(value, `${name} should be present`).toBeDefined();
  return value as NonNullable<T>;
}

/**
 * The auth-server checks the ceremony origin against `passkeys.allowedOrigins`,
 * which is the content server's origin.
 */
function ceremonyOrigin(target: BaseTarget): string {
  return new URL(target.contentServerUrl).origin;
}

async function mintMfaJwt(
  target: BaseTarget,
  sessionToken: string,
  email: string
): Promise<string> {
  const { status } = await target.authClient.mfaRequestOtp(
    sessionToken,
    PASSKEY_SCOPE
  );
  expect(status).toEqual('success');

  const code = await target.emailClient.getVerifyAccountChangeCode(email);
  const { accessToken } = await target.authClient.mfaOtpVerify(
    sessionToken,
    code,
    PASSKEY_SCOPE
  );

  return accessToken;
}

/**
 * Runs the registration ceremony against a virtual authenticator. Pass
 * `prfSupported: false` for a device that cannot evaluate a PRF.
 */
async function registerPasskey(
  target: BaseTarget,
  credentials: Credentials,
  opts: { prfSupported?: boolean } = {}
): Promise<{ credentialId: string; credential: VirtualCredential }> {
  const jwt = await mintMfaJwt(
    target,
    credentials.sessionToken,
    credentials.email
  );
  const options = await target.authClient.beginPasskeyRegistration(jwt);

  const credential = VirtualAuthenticator.createCredential(opts);
  const response = VirtualAuthenticator.createAttestationResponse(credential, {
    challenge: options.challenge,
    origin: ceremonyOrigin(target),
    rpId: required(options.rp.id, 'registration rp.id'),
    extensions: options.extensions,
  });

  const { credentialId } = await target.authClient.completePasskeyRegistration(
    jwt,
    asCredentialJson(response),
    options.challenge
  );

  return { credentialId, credential };
}

async function signInWithPasskey(
  target: BaseTarget,
  credential: VirtualCredential
): Promise<PasskeySignIn> {
  const options = await target.authClient.beginPasskeyAuthentication({
    keysRequired: true,
    scope: PASSKEY_SCOPE,
  });

  const response = VirtualAuthenticator.createAssertionResponse(credential, {
    challenge: options.challenge,
    origin: ceremonyOrigin(target),
    rpId: required(options.rpId, 'authentication rpId'),
    extensions: options.extensions,
  });

  const prfSalt = options.extensions?.prf?.eval?.first;
  const returnedPrf = (
    response.clientExtensionResults as {
      prf?: { results?: { first?: string } };
    }
  ).prf?.results?.first;

  const { uid, sessionToken, mfaToken } =
    await target.authClient.completePasskeyAuthentication(
      asCredentialJson(response),
      options.challenge,
      { keysRequired: true, prfSupported: returnedPrf !== undefined }
    );

  return {
    uid,
    sessionToken,
    mfaToken,
    prfSalt,
    prfOut:
      returnedPrf === undefined
        ? undefined
        : Uint8Array.from(Buffer.from(returnedPrf, 'base64url')),
  };
}

/**
 * Creates a tracked, verified account with a registered passkey, and reads
 * `kB` out of a password sign-in.
 */
async function setUpAccountWithPasskey(
  target: BaseTarget,
  accountTracker: TestAccountTracker,
  opts: { prfSupported?: boolean } = {}
): Promise<PasskeyAccount> {
  const credentials = await accountTracker.signUp();

  const { keyFetchToken, unwrapBKey } = await target.authClient.signIn(
    credentials.email,
    credentials.password,
    { keys: true }
  );
  const { kB } = await target.authClient.accountKeys(
    required(keyFetchToken, 'keyFetchToken'),
    required(unwrapBKey, 'unwrapBKey')
  );

  const { credentialId, credential } = await registerPasskey(
    target,
    credentials,
    opts
  );

  return { credentials, credentialId, credential, passwordKb: kB };
}

test.describe('passkey wrap round-trip', () => {
  test('reopens a stored wrap to the password-derived kB', async ({
    target,
    apiAccountTracker,
  }) => {
    const account = await setUpAccountWithPasskey(target, apiAccountTracker);
    const { uid, mfaToken, prfOut } = await signInWithPasskey(
      target,
      account.credential
    );
    const envelope = await createWrapEnvelope({
      kB: Uint8Array.from(Buffer.from(account.passwordKb, 'hex')),
      prfOut: required(prfOut, 'prfOut'),
      uid,
      credentialId: account.credentialId,
    });

    const { created } = await target.authClient.createPasskeyWrap(
      required(mfaToken, 'mfaToken'),
      account.credentialId,
      envelope
    );
    expect(created).toBe(true);

    const stored = await target.authClient.getPasskeyWrap(
      required(mfaToken, 'mfaToken'),
      account.credentialId
    );
    const recovered = await openWrapEnvelope({
      envelope: stored,
      prfOut: required(prfOut, 'prfOut'),
      uid,
      credentialId: account.credentialId,
    });

    expect(Buffer.from(recovered).toString('hex')).toEqual(account.passwordKb);
  });

  test('recovers kB on a later sign-in without the password', async ({
    target,
    apiAccountTracker,
  }) => {
    const account = await setUpAccountWithPasskey(target, apiAccountTracker);
    const enrollment = await signInWithPasskey(target, account.credential);
    await target.authClient.createPasskeyWrap(
      required(enrollment.mfaToken, 'mfaToken'),
      account.credentialId,
      await createWrapEnvelope({
        kB: Uint8Array.from(Buffer.from(account.passwordKb, 'hex')),
        prfOut: required(enrollment.prfOut, 'prfOut'),
        uid: enrollment.uid,
        credentialId: account.credentialId,
      })
    );

    const signin = await signInWithPasskey(target, account.credential);
    const stored = await target.authClient.getPasskeyWrap(
      required(signin.mfaToken, 'mfaToken'),
      account.credentialId
    );
    const recovered = await openWrapEnvelope({
      envelope: stored,
      prfOut: required(signin.prfOut, 'prfOut'),
      uid: signin.uid,
      credentialId: account.credentialId,
    });

    expect(Buffer.from(recovered).toString('hex')).toEqual(account.passwordKb);
  });

  test('yields no PRF output when the authenticator cannot evaluate one', async ({
    target,
    apiAccountTracker,
  }) => {
    const account = await setUpAccountWithPasskey(target, apiAccountTracker, {
      prfSupported: false,
    });

    const signin = await signInWithPasskey(target, account.credential);

    // The salt separates a PRF the server asked for from one it has switched
    // off, which would also leave prfOut absent.
    expect(signin.prfSalt).toEqual(expect.any(String));
    expect(signin.prfOut).toBeUndefined();
    const passkeys = await target.authClient.listPasskeys(signin.sessionToken);
    expect(passkeys.map((passkey) => passkey.credentialId)).toEqual([
      account.credentialId,
    ]);
  });
});
