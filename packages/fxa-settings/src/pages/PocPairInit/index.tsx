/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * FXA-13863 — Deep-link proof of concept (THROWAWAY). See PocDeepLink for the
 * QR harness that feeds this page.
 *
 * iOS findings, recorded here because they constrain the whole flow:
 *
 * 1. The app hand-off MUST be a top-level, user-initiated navigation. WebKit
 *    ignores external-scheme navigations made from a subframe, so the hidden
 *    iframe this page used previously never launched anything on iOS — and the
 *    store-fallback timer then fired and sent users with Firefox *installed* to
 *    the App Store. We now put the deep link in the CTA's `href` so the tap
 *    itself is the navigation.
 *
 * 2. The "address is invalid" alert cannot be suppressed with a custom scheme.
 *    When Firefox isn't installed, `firefox://` raises it, and no API reports it.
 *    Universal Links are the only alert-free mechanism, and they don't work yet:
 *    we serve accounts.firefox.com's apple-app-site-association claiming `/pair`,
 *    `/pair/*` and `/poc_deep_link` (see
 *    fxa-content-server/server/lib/routes/get-apple-app-site-association.js), but
 *    Universal Links are a two-sided handshake and Firefox iOS ships
 *    `com.apple.developer.associated-domains` as an EMPTY array — no
 *    `applinks:accounts.firefox.com` on the app side, in any build flavor. Until
 *    the app adds it (mobile-side work, FXA-13732), our AASA entries are inert.
 *
 * 3. The store fallback is therefore inferred, not detected: we treat "the page
 *    never went hidden" as "the app never opened". The trap is that iOS hands
 *    focus back to the page when the "Open in Firefox?" dialog is confirmed, a
 *    beat BEFORE it backgrounds Safari — so regained focus can only *start* a
 *    grace window, never trigger the redirect. See `armStoreFallback`.
 *
 *    Known limitation: a *cancelled* "Open in Firefox?" confirmation is
 *    genuinely indistinguishable from the error alert — both are blur → focus
 *    with nothing following — so cancelling sends a user who *has* Firefox to the
 *    App Store. That's why the redirect uses assign() and not replace(): Back
 *    returns here so they can retry.
 *
 * This mirrors the Android situation noted at `deepLink` below: the no-chooser /
 * no-alert path on both platforms is verified app links, which is app-side work.
 *
 * Android finding — the extra 'continue with firefox' tap is an iOS tax, so
 * Android doesn't pay it:
 *
 * 4. Every constraint above is WebKit-specific. Chromium follows a top-level
 *    `intent://` navigation made from page script with no user-activation bit
 *    required, and the intent carries its own store fallback in
 *    `S.browser_fallback_url`, so there is nothing for the JS watchdog to infer.
 *    Making the user tap "Continue with Firefox" on Android therefore buys
 *    nothing — they already acted, by scanning the QR. We now fire the deep link
 *    from a mount effect on Android and keep the happy path at zero taps.
 *
 *    Two things that auto-navigation forces us to handle, which a manual tap did
 *    not:
 *
 *    a. The Play Store round-trip becomes a loop risk. Back from the store
 *       returns to this page in the same tab; if Chrome reloads it rather than
 *       restoring from the back/forward cache, an unguarded effect re-fires the
 *       intent and bounces the user straight back out. `shouldAutoAttempt` /
 *       `claimAutoAttempt` spend a one-shot token in sessionStorage, which
 *       survives both a reload and the native-app round-trip. No token (storage
 *       unavailable, or already spent) ⇒ render the manual CTA instead.
 *
 *    b. In an in-app WebView (Gmail, Facebook) `intent://` silently no-ops unless
 *       the host app implements shouldOverrideUrlLoading, which would strand the
 *       user on the spinner forever. A UI-only timer reveals the manual CTA — it
 *       never navigates, so it cannot race the store fallback.
 *
 *    Still outstanding on Android: the "Choose activity" chooser, for the same
 *    reason as iOS's alert — verified app links are the fix, and they're app-side.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import { useConfig } from '../../models';
import GleanMetrics from '../../lib/glean';

export const viewName = 'poc_pair_init';

// Backstop for a *silent* failure — no dialog, no launch. Override with `?timeout=`.
const DEFAULT_TIMEOUT_MS = 2000;
// How long we let the app switch win after focus comes back. Tapping "Open" on
// iOS's "Open in Firefox?" dialog hands focus back to the page BEFORE Safari is
// backgrounded, so focus alone must never redirect — see `armStoreFallback`.
// Override with `?grace=` to tune on-device.
const DEFAULT_GRACE_MS = 1000;
const DEFAULT_CHANNEL_ID = 'pocChannelId00000000000000000000';
const DEFAULT_CHANNEL_KEY = 'pocChannelKey0000000000000000000000000000000';

function detectPlatform(ua: string) {
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  // Matched explicitly rather than inferred as "mobile but not iOS": we now
  // auto-navigate to `intent://` on Android, and the loose inference swept in
  // every other mobile UA (KaiOS, old Windows Phone, unusual WebViews) that
  // cannot handle that scheme. Those now fall through to the firefox:// +
  // armStoreFallback path, which degrades to a visible CTA instead.
  const isAndroid = /Android/i.test(ua);
  // 'fxios' covers Firefox on iOS, which does not contain 'firefox' in its UA.
  const isFirefox = /firefox|fxios/i.test(ua);
  return { isIos, isAndroid, isMobile, isFirefox };
}

// Custom-scheme guards for the iOS deep link. Anything not matching (or a
// dangerous scheme like javascript:/data:) falls back to a safe constant, so
// user input can never turn the `location.href = deepLink` into an XSS vector.
const DANGEROUS_SCHEMES = new Set([
  'javascript',
  'data',
  'vbscript',
  'file',
  'blob',
]);
const SAFE_SCHEME = /^[a-z][a-z0-9.+-]*$/;
const SAFE_ACTION = /^[a-z0-9/_-]+$/i;

/**
 * Only allow same-origin http(s) URLs. Returns the sanitized href, or null for
 * cross-origin / javascript: / data: / malformed input. This closes the CodeQL
 * "client-side URL redirect" and "client-side XSS" findings: every navigation
 * sink (location.assign, location.href, the desktop <a href>) receives a value
 * that has been validated against the current origin.
 */
function sameOriginHttpUrl(raw: string, origin: string): string | null {
  try {
    const u = new URL(raw, origin);
    if (
      (u.protocol === 'http:' || u.protocol === 'https:') &&
      u.origin === origin
    ) {
      return u.href;
    }
  } catch {
    // not a parseable URL — treat as unsafe
  }
  return null;
}

function readConfig(search: string) {
  const params = new URLSearchParams(search);
  const protocol = window.location.protocol.replace(':', '');
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://accounts.firefox.com';

  const rawScheme = (params.get('scheme') || 'firefox').toLowerCase();
  const scheme =
    SAFE_SCHEME.test(rawScheme) && !DANGEROUS_SCHEMES.has(rawScheme)
      ? rawScheme
      : 'firefox';

  const rawAction = (params.get('action') || 'open-url').replace(/^\/+/, '');
  const action = SAFE_ACTION.test(rawAction) ? rawAction : 'open-url';

  const timeout = Number(params.get('timeout')) || DEFAULT_TIMEOUT_MS;
  const grace = Number(params.get('grace')) || DEFAULT_GRACE_MS;

  // `?auto=0` opts out of the Android auto-attempt and restores the tap-to-continue
  // flow, so both can be compared on the same device without a rebuild.
  const autoAttempt = params.get('auto') !== '0';

  const sampleQuery = new URLSearchParams({
    channel_id: params.get('channel_id') || DEFAULT_CHANNEL_ID,
    channel_key: params.get('channel_key') || DEFAULT_CHANNEL_KEY,
  }).toString();
  const defaultTarget = `${origin}/poc_pair_start?${sampleQuery}`;

  // `?url=` may only point at our own origin — blocks open-redirects and
  // javascript:/data: URLs. Anything else falls back to the default target.
  const target =
    sameOriginHttpUrl(params.get('url') || defaultTarget, origin) ||
    defaultTarget;

  return { target, timeout, grace, scheme, action, protocol, autoAttempt };
}

/**
 * A single auto-attempt is spent per target per tab session. sessionStorage is
 * the only store that survives BOTH a reload of this page and a trip out to the
 * Play Store and back, which is exactly the pair of events we have to survive.
 * Keyed on the target so a QR for a different target still gets its own shot.
 */
export const AUTO_ATTEMPT_KEY_PREFIX = 'poc_pair_init_auto_attempted:';

const autoAttemptKey = (target: string) =>
  `${AUTO_ATTEMPT_KEY_PREFIX}${target}`;

/** Storage surface we need — lets tests pass a stub, including a throwing one. */
type AttemptStorage = Pick<Storage, 'getItem' | 'setItem'>;

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
 * Read-only decision: should this page hand off to Firefox without waiting for a
 * tap? Android only — iOS requires the navigation to come from the tap itself
 * (finding 1), and inside Firefox there is nothing to hand off to (see the mount
 * effect). No usable storage counts as "no", because without a spent-token
 * record we cannot stop a Play Store bounce loop (finding 4a), and today's
 * manual CTA is the safe way to fail.
 */
export function shouldAutoAttempt({
  isAndroid,
  isFirefox,
  autoAttempt,
  target,
  storage,
}: {
  isAndroid: boolean;
  isFirefox: boolean;
  autoAttempt: boolean;
  target: string;
  storage: AttemptStorage | undefined;
}): boolean {
  if (!isAndroid || isFirefox || !autoAttempt || !storage) {
    return false;
  }
  try {
    return storage.getItem(autoAttemptKey(target)) === null;
  } catch {
    return false;
  }
}

/**
 * Spend the one-shot token. Returns whether we now own the attempt — callers must
 * navigate only on `true`, since a `getItem` that works alongside a `setItem`
 * that throws would otherwise re-attempt forever.
 */
export function claimAutoAttempt(
  target: string,
  storage: AttemptStorage | undefined
): boolean {
  try {
    storage?.setItem(autoAttemptKey(target), '1');
    return storage !== undefined;
  } catch {
    return false;
  }
}

type Status = 'redirecting' | 'prompt' | 'attempting' | 'desktop';

const PocPairInit = () => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const location = useLocation();
  const search =
    typeof window !== 'undefined' ? window.location.search : location.search;
  const { target, timeout, grace, scheme, action, protocol, autoAttempt } =
    readConfig(search);

  const config = useConfig();
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const { isIos, isAndroid, isMobile, isFirefox } = detectPlatform(ua);
  const storeName = isIos ? 'App Store' : 'Play Store';
  const storeUrl = isIos
    ? config.mobileStoreLinks.ios
    : config.mobileStoreLinks.android;

  // Android: package-pinned intent:// that opens the target in Firefox, with a
  // built-in store fallback (S.browser_fallback_url) when it isn't installed.
  // NOTE: a "Choose activity" chooser can still appear — Chrome strips an
  // explicit `component` from intent:// for security, so we can't force a
  // direct launch that way. The real no-chooser mechanism is verified Android
  // App Links (https + assetlinks.json + app autoVerify), which
  // cannot work in the local http setup, and must be done in a follow up. For
  // this POC, we will have to live the activity chooser when testing on local host.
  const deepLink = (() => {
    if (isAndroid) {
      return `intent://${target.replace(/^https?:\/\//, '')}#Intent;scheme=${protocol};package=org.mozilla.firefox;S.browser_fallback_url=${encodeURIComponent(storeUrl)};end`;
    }
    return `${scheme}://${action}?url=${encodeURIComponent(target)}`;
  })();

  // Read-only, so it is safe to evaluate during render (and under StrictMode's
  // double render). The token is only spent in the mount effect below.
  const storage = getAttemptStorage();
  const willAutoAttempt = shouldAutoAttempt({
    isAndroid,
    isFirefox,
    autoAttempt,
    target,
    storage,
  });

  const [status, setStatus] = useState<Status>(
    isFirefox
      ? 'redirecting'
      : willAutoAttempt
        ? 'attempting'
        : isMobile
          ? 'prompt'
          : 'desktop'
  );
  // Shared source of truth for "the app took the foreground", written by the
  // visibility listeners and read by both store-fallback triggers.
  const appOpenedRef = useRef(false);
  // Holds the teardown for the in-flight attempt so we can clean up on unmount.
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanupRef.current?.(), []);

  useEffect(() => {
    // Already in Firefox: skip the button entirely and navigate the current tab
    // straight to the target. A firefox:// scheme navigation from inside Firefox
    // does nothing, and no app hand-off is needed — we're already in Firefox.
    if (isFirefox) {
      GleanMetrics.dtmMobile.deeplinkFirefoxDetected();
      // Glean queues pings asynchronously, so navigating in the same tick can
      // drop this one. Waiting is free here — the user is leaving regardless.
      GleanMetrics.isDone().then(() => window.location.assign(target));
      return;
    }

    // Android: hand off immediately, no tap (finding 4). Navigate only once the
    // one-shot token is actually ours, or Back from the Play Store loops.
    if (!willAutoAttempt || !claimAutoAttempt(target, storage)) {
      return;
    }
    // Deliberately not awaiting GleanMetrics.isDone() here, unlike the other two
    // navigations on this page: this is the happy path, and delaying the app
    // hand-off to flush a ping is a cost the user pays on every successful
    // pairing. Some of these attempts will be lost to the navigation.
    GleanMetrics.dtmMobile.deeplinkAttempt({ event: { reason: 'android' } });
    window.location.assign(deepLink);

    // WebView backstop: if the intent silently no-ops, reveal the manual CTA
    // rather than spinning forever. State only — never a navigation, so it can't
    // race S.browser_fallback_url (a successful fallback unloads us first). We
    // don't gate on visibilityState: if the hand-off did work, this fires while
    // backgrounded and the user simply returns to a usable retry card.
    const revealTimer = window.setTimeout(() => {
      GleanMetrics.dtmMobile.deeplinkWebviewFallback();
      setStatus('prompt');
    }, timeout);
    return () => window.clearTimeout(revealTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Watch for the deep link failing and send the user to the store when it does.
   *
   * There is no API that reports "the custom scheme didn't resolve", so we infer
   * it (finding 3 up top). The subtlety that makes this hard: iOS dismisses BOTH
   * native dialogs the same way as far as the page can see.
   *
   *   not installed:  tap → blur ("address is invalid") → focus (tapped OK)
   *                   → nothing else ever happens.
   *   installed:      tap → blur ("Open in Firefox?") → focus (tapped Open!)
   *                   → *then* Safari is backgrounded → blur + hidden.
   *
   * So the regained focus is NOT the decision point — it arrives on the happy
   * path too, before iOS has backgrounded us. Redirecting there sent people who
   * tapped "Open" to the App Store. Instead focus only opens a `grace` window,
   * and any of hidden/pagehide/a second blur cancels it. Nothing left to cancel
   * it by the time the window closes ⇒ the launch really did fail.
   */
  const armStoreFallback = () => {
    cleanupRef.current?.();
    appOpenedRef.current = false;
    let sawBlur = false;
    let sawFocus = false;
    let graceTimer = 0;

    const goToStore = (reason: 'timeout' | 'focus_grace') => {
      if (appOpenedRef.current || document.visibilityState !== 'visible') {
        return;
      }
      GleanMetrics.dtmMobile.deeplinkStoreRedirect({ event: { reason } });
      cleanupRef.current?.();
      // assign(), not replace(): Back returns to this interstitial, so a user who
      // cancelled an "Open in Firefox?" confirmation can retry (finding 3).
      // Flush first — this is the event the store-fallback data rests on, and
      // navigating in the same tick would drop it.
      GleanMetrics.isDone().then(() => window.location.assign(storeUrl));
    };

    // Definitive "the app opened" signals — a real background/teardown.
    const onHidden = () => {
      if (document.hidden) {
        appOpenedRef.current = true;
        window.clearTimeout(graceTimer);
      }
    };
    const onLeave = () => {
      appOpenedRef.current = true;
      window.clearTimeout(graceTimer);
    };

    const onBlur = () => {
      window.clearTimeout(graceTimer);
      // A blur *after* we'd already regained focus is the app taking the
      // foreground on its second act — i.e. the dialog was confirmed and the
      // launch is under way. Treat it as opened, so this still holds together on
      // any iOS version where visibilitychange doesn't fire for an app switch.
      if (sawFocus) {
        appOpenedRef.current = true;
      }
      sawBlur = true;
    };

    const onFocus = () => {
      if (appOpenedRef.current) {
        return;
      }
      sawFocus = true;
      window.clearTimeout(graceTimer);
      graceTimer = window.setTimeout(() => goToStore('focus_grace'), grace);
    };

    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', onLeave);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    // Backstop for a silent failure: the scheme no-ops with no dialog at all, so
    // there's no blur/focus pair to key off. Deliberately gated on `!sawBlur` —
    // if a dialog did appear, the blur/focus machinery owns the decision, and
    // firing here could redirect while that dialog is still on screen (which is
    // what a bare timer does to anyone slow to tap "Open").
    const timer = window.setTimeout(() => {
      if (!sawBlur) {
        goToStore('timeout');
      }
    }, timeout);

    cleanupRef.current = () => {
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', onLeave);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.clearTimeout(timer);
      window.clearTimeout(graceTimer);
      cleanupRef.current = null;
    };
  };

  // The tap on the <a href={deepLink}> below performs the hand-off itself —
  // deliberately no preventDefault() and no JS navigation, since the native
  // top-level navigation is what iOS requires (finding 1) and routing it through
  // JS only risks losing the user activation. This just arms the fallback.
  const onAttempt = () => {
    setStatus('attempting');
    // Named for the hand-off mechanism, not the device: 'other' is a mobile
    // browser that handles neither intent:// nor the iOS scheme reliably, which
    // is why its outcome is worth telling apart from iOS's.
    GleanMetrics.dtmMobile.deeplinkAttempt({
      event: { reason: isIos ? 'ios' : isAndroid ? 'android' : 'other' },
    });
    // Android's intent:// carries its own store fallback via
    // S.browser_fallback_url, so it needs no JS watchdog.
    if (!isAndroid) {
      armStoreFallback();
    }
  };

  return (
    <AppLayout>
      <CardHeader
        headingText="Pair Start"
        headingTextFtlId="poc_pair_init-header"
      />

      {status === 'redirecting' && (
        <p className="text-sm text-grey-400 mt-2">Continuing in Firefox…</p>
      )}

      {status === 'desktop' && (
        <p className="text-sm text-grey-400 mt-2">
          This open-or-store flow is for mobile. On desktop, just open the
          target directly:{' '}
          <a className="link-blue break-all" href={target}>
            {target}
          </a>
          .
        </p>
      )}

      {(status === 'prompt' || status === 'attempting') && (
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-sm text-grey-400">
            {'To continue, you’ll need to use Firefox. Tap below to open it — ' +
              `if Firefox isn’t installed, you’ll be taken to the ${storeName}.`}
          </p>
          {/* The deep link lives in `href` so the tap is a top-level,
              user-initiated navigation — the only form iOS honours. */}
          <a
            className="cta-primary cta-xl"
            href={deepLink}
            onClick={onAttempt}
            data-glean-id="dtm_mobile_deeplink_continue_submit"
          >
            Continue with Firefox
          </a>
          {status === 'attempting' && (
            <p className="flex items-center justify-center gap-2 text-sm text-grey-400">
              <LoadingSpinner imageClassName="w-4 h-4 animate-spin" />
              Opening Firefox…
            </p>
          )}
          {/* Escape hatch, not the primary path — armStoreFallback() redirects on
              its own. On iOS this covers the residual case where the alert happens
              to fire visibilitychange on some iOS version, which correctly
              suppresses both triggers and would otherwise leave the user sitting
              here. It now shows on Android too: reaching this card there means the
              auto-attempt was spent, blocked, or silently swallowed by a WebView,
              so S.browser_fallback_url never got the chance to run. */}
          <p className="text-sm text-grey-400">
            {status === 'attempting'
              ? 'Firefox didn’t open? '
              : 'Don’t have Firefox? '}
            <a
              className="link-blue"
              href={storeUrl}
              data-glean-id="dtm_mobile_deeplink_store_link"
            >
              Get Firefox on the {storeName}
            </a>
          </p>
        </div>
      )}

      {/* Debug block — POC visibility into what this page resolved. */}
      <pre className="text-xs text-start break-all whitespace-pre-wrap mt-6 text-grey-400">
        {`deepLink: ${deepLink}\ntarget:   ${target}\ntimeout:  ${timeout}ms\ngrace:    ${grace}ms\nauto:     ${autoAttempt ? 'on' : 'off (?auto=0)'} — ${
          willAutoAttempt
            ? 'attempted on load'
            : `manual (${!isAndroid ? 'not android' : !storage ? 'no sessionStorage' : 'already attempted'})`
        }`}
      </pre>
    </AppLayout>
  );
};

export default PocPairInit;
