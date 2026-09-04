/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../AppLayout';
import { FirefoxWordmarkImage, SyncDevicesImage } from '../images';
import {
  AttemptStorage,
  claimAutoAttempt,
  getAttemptStorage,
  HandoffPlan,
} from '../../lib/pairing/handoff';
import {
  armStoreFallback,
  STORE_FALLBACK_TIMEOUT_MS,
} from '../../lib/pairing/store-fallback';

export type ContinueInFirefoxProps = {
  /**
   * How to reach the Firefox app from here. `planPairingHandoff` decides this;
   * a `none` plan never reaches this component.
   */
  plan: Exclude<HandoffPlan, { kind: 'none' }>;
  /**
   * Navigation sink, injected so tests can observe the hand-off without a real
   * page load. Defaults to `window.location.assign`.
   *
   * assign(), not replace(): Back returns to this card, so a user who cancelled
   * an "Open in Firefox?" confirmation can retry. See `store-fallback`.
   */
  assign?: (url: string) => void;
  storage?: AttemptStorage;
};

/**
 * Shown when a pairing QR is opened in a browser that is not Firefox. It hands
 * the pairing URL to the Firefox app, and sends the user to the app store when
 * the app is not installed.
 *
 * The two platforms need genuinely different mechanics, and the reasons are
 * recorded in `lib/pairing/store-fallback.ts` (iOS) and `lib/pairing/handoff.ts`
 * (Android). In short: iOS needs the tap itself to be the navigation and has no
 * API that reports a failed launch, so the store fallback is inferred; Android
 * can navigate from script and carries its own store fallback inside the intent.
 */
export const ContinueInFirefox = ({
  plan,
  assign = (url: string) => window.location.assign(url),
  storage = getAttemptStorage(),
}: ContinueInFirefoxProps) => {
  const isAndroid = plan.kind === 'android';
  const willAutoAttempt = plan.kind === 'android' && plan.autoAttempt;

  const [attempting, setAttempting] = useState(willAutoAttempt);
  // Android auto-attempts on mount, so the CTA starts hidden and is revealed
  // only if that silently fails.
  const [ctaRevealed, setCtaRevealed] = useState(!willAutoAttempt);

  // Holds the teardown for the in-flight iOS watch so we can clean up on unmount.
  const teardownRef = useRef<(() => void) | null>(null);
  useEffect(() => () => teardownRef.current?.(), []);

  useEffect(() => {
    if (!willAutoAttempt) {
      return;
    }
    // Navigate only once the one-shot token is actually ours, or Back from the
    // Play Store loops. `plan.target` is the same key `planPairingHandoff`
    // checked to set `autoAttempt`.
    if (!claimAutoAttempt(plan.target, storage)) {
      setCtaRevealed(true);
      setAttempting(false);
      return;
    }
    assign(plan.deepLink);

    // WebView backstop: if the intent silently no-ops, reveal the manual CTA
    // rather than spinning forever. State only — never a navigation, so it
    // cannot race S.browser_fallback_url, which unloads us first when it works.
    const revealTimer = window.setTimeout(
      () => setCtaRevealed(true),
      STORE_FALLBACK_TIMEOUT_MS
    );
    return () => window.clearTimeout(revealTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The tap on the anchor below performs the hand-off itself — deliberately no
  // preventDefault() and no JS navigation, since the native top-level
  // navigation is what iOS requires and routing it through JS risks losing the
  // user activation. This only arms the fallback.
  const onAttempt = () => {
    setAttempting(true);
    // Android's intent:// carries its own store fallback via
    // S.browser_fallback_url, so it needs no JS watchdog.
    if (isAndroid) {
      return;
    }
    teardownRef.current?.();
    teardownRef.current = armStoreFallback({
      onFallback: () => assign(plan.storeUrl),
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col items-center text-center">
        <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

        <SyncDevicesImage className="mt-10 h-[120px] w-auto" />

        <FtlMsg id="pair-continue-in-firefox-heading">
          <h1 className="card-header mt-4">Continue in Firefox</h1>
        </FtlMsg>
        <FtlMsg id="pair-continue-in-firefox-description">
          <p className="mt-1 text-base">
            Pairing happens in Firefox. Open it to finish connecting this
            device.
          </p>
        </FtlMsg>

        {ctaRevealed && (
          /* The deep link lives in `href` so the tap is a top-level,
             user-initiated navigation — the only form iOS honours. */
          <FtlMsg id="pair-continue-in-firefox-button">
            <a
              href={plan.deepLink}
              onClick={onAttempt}
              className="cta-primary cta-xl mt-6 w-full"
            >
              Continue in Firefox
            </a>
          </FtlMsg>
        )}

        {attempting && (
          <p className="mt-6 flex items-center justify-center gap-2 text-base">
            <LoadingSpinner imageClassName="w-4 h-4 animate-spin" />
            <FtlMsg id="pair-continue-in-firefox-opening">
              <span>Opening Firefox…</span>
            </FtlMsg>
          </p>
        )}

        {/* Escape hatch, not the primary path — both platforms redirect to the
            store on their own. It covers the residual cases: an iOS version
            where the error alert happens to fire visibilitychange, and an
            Android auto-attempt that was spent, blocked, or swallowed by a
            WebView so S.browser_fallback_url never ran. */}
        <FtlMsg id="pair-continue-in-firefox-get-firefox-link">
          <a href={plan.storeUrl} className="link-blue mt-4 text-sm">
            Don’t have Firefox? Get it now
          </a>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default ContinueInFirefox;
