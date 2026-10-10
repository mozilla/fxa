/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import GleanMetrics from '../glean';
import type { queryParamsToMetricsContext } from '../metrics';
import type { PublicKeyCredentialJSON } from './webauthn';
import { handleWebAuthnError } from './webauthn-errors';
import {
  extractPrfOutput,
  extractPrfSupport,
  getCredentialWithPrfFallback,
  stripPrfResults,
} from './prf-fallback';
import {
  PASSKEY_SIGNIN_SURFACES,
  passkeyErrorBanner,
  passkeyTimeoutBanner,
  passkeyTroubleBanner,
  resolvePasskeyService,
  type PasskeyAuthCompletion,
  type PasskeySignInAuthClient,
  type PasskeySignInBanner,
  type PasskeySignInIntegration,
  type PasskeySignInSurface,
} from './signin-flow';

type PasskeyAuthenticationArgs = {
  authClient: Pick<
    PasskeySignInAuthClient,
    'beginPasskeyAuthentication' | 'completePasskeyAuthentication'
  >;
  integration: PasskeySignInIntegration;
  surface: PasskeySignInSurface;
  ftlMsgResolver: FtlMsgResolver;
  /** Sent to both server calls; the server defers login metrics until keys exist. */
  keysRequired: boolean;
  /**
   * Asks `/finish` for the `mfa:passkey` proof and keeps the PRF output, for
   * a sign-in that may go on to store a passkey wrap.
   */
  withWrapMaterial: boolean;
  metricsContext: ReturnType<typeof queryParamsToMetricsContext>;
};

type PasskeyAuthenticationResult =
  | {
      ok: true;
      completion: PasskeyAuthCompletion;
      credentialId: string;
      prfOut?: Uint8Array;
    }
  | { ok: false; banner: PasskeySignInBanner };

/**
 * Runs the discoverable-credential ceremony and completes it with the server.
 * A WebAuthn failure (cancelled, timed out, unsupported authenticator) comes
 * back as the banner to show; server errors are thrown for the caller's
 * generic handling.
 */
export async function authenticateWithPasskey({
  authClient,
  integration,
  surface,
  ftlMsgResolver,
  keysRequired,
  withWrapMaterial,
  metricsContext,
}: PasskeyAuthenticationArgs): Promise<PasskeyAuthenticationResult> {
  const { glean } = PASSKEY_SIGNIN_SURFACES[surface];

  // Discoverable credentials only — the Signin page's email field is
  // intentionally ignored. The browser surfaces all credentials for the
  // RP and the user picks one. The keysRequired hint lets the server decide
  // whether to attach the PRF extension to the returned options. The scope
  // makes /finish mint the `mfa:passkey` proof that storing a wrap needs.
  const challengeOptions = await authClient.beginPasskeyAuthentication({
    keysRequired,
    ...(withWrapMaterial ? { scope: 'passkey' } : {}),
  });

  // Isolated try/catch so a network-layer TypeError (e.g. fetch failure)
  // from surrounding auth-client calls can't be miscategorised as a
  // WebAuthn error.
  let credential: PublicKeyCredentialJSON;
  try {
    // If the server attached PRF and the first attempt fails in a way PRF
    // could have caused, retry once without PRF (never blocks sign-in).
    credential = await getCredentialWithPrfFallback(
      challengeOptions,
      undefined,
      ({ reason, outcome }) => {
        GleanMetrics.passkey.signinRetryWithoutPrfRequest({
          event: { reason, outcome },
        });
      }
    );
  } catch (err) {
    if (err instanceof DOMException || err instanceof TypeError) {
      const categorized = handleWebAuthnError(
        err,
        'authentication',
        Sentry.captureException
      );
      glean.submitFrontendError(categorized.gleanReason);
      // Cancelled and timed-out ceremonies are benign — warn, don't error.
      if (categorized.gleanReason === 'not_allowed') {
        return {
          ok: false,
          banner: passkeyTroubleBanner(ftlMsgResolver, surface),
        };
      }
      if (categorized.gleanReason === 'timeout') {
        return { ok: false, banner: passkeyTimeoutBanner(ftlMsgResolver) };
      }
      return {
        ok: false,
        banner: passkeyErrorBanner(
          ftlMsgResolver,
          categorized.ftlId,
          categorized.fallbackText
        ),
      };
    }
    throw err;
  }

  // Read support (presence only) before stripping the output from the
  // credential; only meaningful when the server requested PRF.
  const prfRequested = !!challengeOptions.extensions?.prf;
  const prfSupported = prfRequested && extractPrfSupport(credential);
  if (prfRequested) {
    GleanMetrics.passkey.signinPrfSupport({
      event: { supported: prfSupported ? 'present' : 'absent' },
    });
  }
  const prfOut = withWrapMaterial ? extractPrfOutput(credential) : undefined;
  credential = stripPrfResults(credential);

  const serviceForRequest = resolvePasskeyService(integration);
  let completion;
  try {
    completion = await authClient.completePasskeyAuthentication(
      credential,
      challengeOptions.challenge,
      {
        ...(serviceForRequest ? { service: serviceForRequest } : {}),
        keysRequired,
        ...(prfRequested ? { prfSupported } : {}),
        metricsContext,
      }
    );
  } catch (err) {
    // `prfOut` only reaches a caller that can zero it once this returns, so a
    // throw here is the one path that would leave the bytes readable.
    prfOut?.fill(0);
    throw err;
  }

  glean.submitSuccess();
  return { ok: true, completion, credentialId: credential.id, prfOut };
}
