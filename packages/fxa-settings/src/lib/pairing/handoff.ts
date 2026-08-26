/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Deciding how to hand a pairing URL off to the Firefox app when the browser
 * that scanned the QR is not Firefox. Ported from the FXA-13863 proof of
 * concept, whose on-device findings are recorded here and in `store-fallback`.
 *
 * Android finding — the extra "continue with Firefox" tap is an iOS tax, so
 * Android does not pay it:
 *
 * Chromium follows a top-level `intent://` navigation made from page script
 * with no user-activation bit required, and the intent carries its own store
 * fallback in `S.browser_fallback_url`, so there is nothing for a JS watchdog
 * to infer. Making the user tap "Continue with Firefox" on Android therefore
 * buys nothing — they already acted, by scanning the QR. We fire the deep link
 * from a mount effect on Android and keep the happy path at zero taps.
 *
 * Two things auto-navigation forces us to handle, which a manual tap did not:
 *
 *   a. The Play Store round-trip becomes a loop risk. Back from the store
 *      returns to the page in the same tab; if Chrome reloads it rather than
 *      restoring from the back/forward cache, an unguarded effect re-fires the
 *      intent and bounces the user straight back out. `shouldAutoAttempt` /
 *      `claimAutoAttempt` spend a one-shot token in sessionStorage, which
 *      survives both a reload and the native-app round-trip. No token (storage
 *      unavailable, or already spent) means render the manual CTA instead.
 *
 *   b. In an in-app WebView (Gmail, Facebook) `intent://` silently no-ops
 *      unless the host app implements shouldOverrideUrlLoading, which would
 *      strand the user on a spinner forever. A UI-only timer reveals the manual
 *      CTA — it never navigates, so it cannot race the store fallback.
 *
 * Still outstanding on Android: the "Choose activity" chooser. Chrome strips an
 * explicit `component` from intent:// for security, so we cannot force a direct
 * launch that way. The real no-chooser mechanism is verified Android App Links
 * (https + assetlinks.json + app autoVerify), which is app-side work.
 */

import { Devices } from '../utilities';

export const HANDOFF_ATTEMPT_KEY_PREFIX = 'fxa_pairing_';

/** Storage surface we need — lets tests pass a stub, including a throwing one. */
export type AttemptStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type StoreLinks = { ios: string; android: string };

export enum BrowserBuild {
  FIREFOX = 'firefox',
  FIREFOX_NIGHTLY = 'fenix',
}

/**
 * How this device should be handed off to Firefox, or `none` when there is
 * nothing to hand off to. Modelled as a discriminated union so the caller
 * cannot render an iOS card with an Android intent in it.
 */
export type HandoffPlan =
  | { kind: 'none' }
  | { kind: 'ios'; deepLink: string; storeUrl: string }
  | {
      kind: 'android';
      deepLink: string;
      storeUrl: string;
      /**
       * The URL being handed off, carried so the caller spends the one-shot
       * token under the same key `shouldAutoAttempt` checked. Keying on the
       * target rather than the deep link keeps the identity stable if the
       * store URL ever changes underneath us.
       */
      target: string;
      /**
       * Whether this page load owns the one-shot auto-navigation. False once
       * the token is spent, or when there is no storage to spend it in.
       */
      autoAttempt: boolean;
    };

const attemptKey = (target: string) => `${HANDOFF_ATTEMPT_KEY_PREFIX}${target}`;

/**
 * `window.sessionStorage` is a getter that itself throws in some sandboxed
 * WebViews, so even reaching it needs a guard.
 */
export function getAttemptStorage(): AttemptStorage | undefined {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Read-only: is this page load allowed to hand off without waiting for a tap?
 * No usable storage counts as "no", because without a spent-token record we
 * cannot stop a Play Store bounce loop, and the manual CTA is the safe way to
 * fail.
 */
export function shouldAutoAttempt({
  target,
  storage,
}: {
  target: string;
  storage?: AttemptStorage;
}): boolean {
  if (!storage) {
    return false;
  }
  try {
    return storage.getItem(attemptKey(target)) === null;
  } catch {
    return false;
  }
}

/**
 * Spend the one-shot token. Returns whether we now own the attempt — callers
 * must navigate only on `true`, since a `getItem` that works alongside a
 * `setItem` that throws would otherwise re-attempt forever.
 */
export function claimAutoAttempt(
  target: string,
  storage?: AttemptStorage
): boolean {
  try {
    storage?.setItem(attemptKey(target), '1');
    return storage !== undefined;
  } catch {
    return false;
  }
}

/**
 * Package-pinned intent that opens `target` in Firefox, with a built-in store
 * fallback for when it is not installed.
 */
function buildAndroidDeepLink(target: string, storeUrl: string, build: 'firefox' | 'fenix'): string {
  const scheme = target.startsWith('http://') ? 'http' : 'https';
  const withoutScheme = target.replace(/^https?:\/\//, '');
  return (
    `intent://${withoutScheme}#Intent` +
    `;scheme=${scheme}` +
    `;package=org.mozilla.${build}` +
    `;S.browser_fallback_url=${encodeURIComponent(storeUrl)}` +
    `;end`
  );
}

function buildIosDeepLink(target: string): string {
  return `firefox://open-url?url=${encodeURIComponent(target)}`;
}

/**
 * Decide how — or whether — to hand `targetUrl` to the Firefox app.
 *
 * Only a non-Firefox phone gets a plan. Inside Firefox there is nothing to hand
 * off to and `firefox://` is a no-op, and on desktop there is no app to open,
 * so both fall through to `none` and the caller keeps its existing behaviour.
 */
export function planPairingHandoff({
  device,
  targetUrl,
  storeLinks,
  storage,
  build
}: {
  device: Devices;
  targetUrl: string;
  storeLinks: StoreLinks;
  storage?: AttemptStorage;
  build: 'firefox' | 'fenix'
}): HandoffPlan {
  if (!targetUrl) {
    return { kind: 'none' };
  }

  switch (device) {
    case Devices.OTHER_IOS:
      return {
        kind: 'ios',
        deepLink: buildIosDeepLink(targetUrl),
        storeUrl: storeLinks.ios,
      };
    case Devices.OTHER_ANDROID:
      return {
        kind: 'android',
        deepLink: buildAndroidDeepLink(targetUrl, storeLinks.android, build),
        storeUrl: storeLinks.android,
        target: targetUrl,
        autoAttempt: shouldAutoAttempt({ target: targetUrl, storage }),
      };
    default:
      return { kind: 'none' };
  }
}
