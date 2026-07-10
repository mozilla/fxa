/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import { useConfig } from '../../models';

export const viewName = 'poc_pair_init';

const DEFAULT_TIMEOUT_MS = 1500;
const DEFAULT_CHANNEL_ID = 'pocChannelId00000000000000000000';
const DEFAULT_CHANNEL_KEY = 'pocChannelKey0000000000000000000000000000000';

function detectPlatform(ua: string) {
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  // 'fxios' covers Firefox on iOS, which does not contain 'firefox' in its UA.
  const isFirefox = /firefox|fxios/i.test(ua);
  return { isIos, isAndroid: isMobile && !isIos, isMobile, isFirefox };
}

// Custom-scheme guards for the iOS deep link. Anything not matching (or a
// dangerous scheme like javascript:/data:) falls back to a safe constant, so
// user input can never turn the `location.href = deepLink` into an XSS vector.
const DANGEROUS_SCHEMES = new Set(['javascript', 'data', 'vbscript', 'file', 'blob']);
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
    if ((u.protocol === 'http:' || u.protocol === 'https:') && u.origin === origin) {
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

  const sampleQuery = new URLSearchParams({
    channel_id: params.get('channel_id') || DEFAULT_CHANNEL_ID,
    channel_key: params.get('channel_key') || DEFAULT_CHANNEL_KEY,
  }).toString();
  const defaultTarget = `${origin}/poc_pair_start?${sampleQuery}`;

  // `?url=` may only point at our own origin — blocks open-redirects and
  // javascript:/data: URLs. Anything else falls back to the default target.
  const target =
    sameOriginHttpUrl(params.get('url') || defaultTarget, origin) || defaultTarget;

  return { target, timeout, scheme, action, protocol };
}

type Status = 'redirecting' | 'prompt' | 'attempting' | 'desktop';

const PocPairInit = () => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const location = useLocation();
  const search =
    typeof window !== 'undefined' ? window.location.search : location.search;
  const { target, timeout, scheme, action, protocol } = readConfig(search);

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
  const deepLink = isAndroid
    ? `intent://${target.replace(/^https?:\/\//, '')}` +
      `#Intent;scheme=${protocol};package=org.mozilla.firefox;` +
      `S.browser_fallback_url=${encodeURIComponent(storeUrl)};end`
    : `${scheme}://${action}?url=${encodeURIComponent(target)}`;

  const [status, setStatus] = useState<Status>(
    isFirefox ? 'redirecting' : isMobile ? 'prompt' : 'desktop'
  );
  // Ref so the visibility listener and the timer share one source of truth.
  const appOpenedRef = useRef(false);
  // Holds the teardown for the in-flight attempt so we can clean up on unmount.
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanupRef.current?.(), []);

  // Already in Firefox: skip the button entirely and navigate the current tab
  // straight to the target. A firefox:// scheme navigation from inside Firefox
  // does nothing, and no app hand-off is needed — we're already in Firefox.
  useEffect(() => {
    if (isFirefox) {
      window.location.assign(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Triggered by a user gesture (button tap). Attaching the listeners and firing
  // the deep link synchronously here preserves the user-activation that iOS needs
  // to follow a custom scheme, and ensures the listeners are live before we fire.
  const continueWithFirefox = () => {
    cleanupRef.current?.();
    appOpenedRef.current = false;
    setStatus('attempting');

    // The store fallback differs by platform. On Android the intent:// URL's
    // `S.browser_fallback_url` handles the not-installed case natively, so no JS
    // fallback is needed. On iOS the custom scheme silently no-ops when Firefox
    // isn't installed, so we watch for the app opening and, failing that within
    // `timeout`, redirect to the App Store.
    if (!isAndroid) {
      // Primary signal: page hidden/backgrounded ⇒ the app opened ⇒ cancel store.
      const onHidden = () => {
        if (document.hidden) {
          appOpenedRef.current = true;
        }
      };
      const onLeave = () => {
        appOpenedRef.current = true;
      };
      document.addEventListener('visibilitychange', onHidden);
      window.addEventListener('pagehide', onLeave);
      window.addEventListener('blur', onLeave);

      // Still here after `timeout` ⇒ Firefox didn't open ⇒ go to the store.
      // replace() so Back doesn't loop the user back into this interstitial.
      const timer = window.setTimeout(() => {
        if (!appOpenedRef.current && !document.hidden) {
          window.location.replace(storeUrl);
        }
      }, timeout);

      cleanupRef.current = () => {
        document.removeEventListener('visibilitychange', onHidden);
        window.removeEventListener('pagehide', onLeave);
        window.removeEventListener('blur', onLeave);
        window.clearTimeout(timer);
        cleanupRef.current = null;
      };
    }

    // Fire the attempt within the gesture, after any listeners are attached.
    window.location.href = deepLink;
  };

  return (
    <AppLayout>
      <CardHeader headingText="Pair Start" headingTextFtlId="poc_pair_init-header" />

      {status === 'redirecting' && (
        <p className="text-sm text-grey-400 mt-2">Continuing in Firefox…</p>
      )}

      {status === 'desktop' && (
        <p className="text-sm text-grey-400 mt-2">
          This open-or-store flow is for mobile. On desktop, just open the target
          directly:{' '}
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
          <button
            className="cta-primary cta-xl"
            onClick={continueWithFirefox}
          >
            Continue with Firefox
          </button>
          {status === 'attempting' && (
            <p className="flex items-center justify-center gap-2 text-sm text-grey-400">
              <LoadingSpinner imageClassName="w-4 h-4 animate-spin" />
              Opening Firefox…
            </p>
          )}
        </div>
      )}

      {/* Debug block — POC visibility into what this page resolved. */}
      <pre className="text-xs text-start break-all whitespace-pre-wrap mt-6 text-grey-400">
        {`deepLink: ${deepLink}\ntarget:   ${target}\ntimeout:  ${timeout}ms`}
      </pre>
    </AppLayout>
  );
};

export default PocPairInit;
