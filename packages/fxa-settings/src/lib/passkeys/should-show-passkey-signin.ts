/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Feature-flag slice of config consulted by {@link shouldShowPasskeySignin}. */
export type PasskeySigninFlags = {
  featureFlags?: {
    passkeysEnabled?: boolean;
    passkeyAuthenticationEnabled?: boolean;
  };
};

/**
 * Whether passkey sign-in is enabled from the feature flags alone.
 *
 * Email-first uses this directly (the account isn't known yet, so it shows the
 * CTA whenever the feature is on). Other surfaces use {@link shouldShowPasskeySignin},
 * which layers the per-account `hasPasskey`/WebAuthn checks on top.
 */
export function passkeySigninFeatureEnabled(
  config: PasskeySigninFlags
): boolean {
  return !!(
    config.featureFlags?.passkeysEnabled &&
    config.featureFlags?.passkeyAuthenticationEnabled
  );
}

/**
 * Whether to show the "Sign in with Passkey" CTA on sign-in surfaces other than
 * email-first. Requires the feature flags, `hasPasskey === true`, and WebAuthn
 * support; fails closed otherwise.
 *
 * `isWebAuthnSupported` defaults to `true`, so the CTA is only suppressed on a
 * definitive "not supported" — callers should thread `isWebAuthnSupported()`
 * from `lib/passkeys/webauthn`.
 *
 * Email-first intentionally does NOT use this — it shows the button
 * unconditionally because the account isn't known there yet.
 */
export function shouldShowPasskeySignin(
  config: PasskeySigninFlags,
  {
    hasPasskey,
    isSignup = false,
    isWebAuthnSupported = true,
  }: {
    hasPasskey?: boolean;
    isSignup?: boolean;
    isWebAuthnSupported?: boolean;
  }
): boolean {
  return !!(
    hasPasskey === true &&
    !isSignup &&
    isWebAuthnSupported &&
    passkeySigninFeatureEnabled(config)
  );
}
