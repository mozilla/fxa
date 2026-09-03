/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import LoadingSpinner, {
  SpinnerType,
} from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../../../../components/AppLayout';
import {
  FirefoxWordmarkImage,
  SyncDevicesImage,
} from '../../../../components/images';
import { LINK } from '../../../../constants';
import { Constants } from '../../../../lib/constants';
import {
  AttemptStorage,
  claimAutoAttempt,
  getAttemptStorage,
  HandoffPlan,
} from '../../../../lib/pairing/handoff';
import {
  armStoreFallback,
  STORE_FALLBACK_TIMEOUT_MS,
} from '../../../../lib/pairing/store-fallback';

export type DownloadFirefoxProps = {
  /**
   * How to reach the Firefox app from here, when we know. `planPairingHandoff`
   * decides this; the container passes it only for a device that has somewhere
   * to hand off to.
   *
   * Absent means we have no pairing channel to carry — a direct hit on this
   * URL, or a device with no Firefox app to open — and the card degrades to a
   * plain download link.
   */
  plan?: Exclude<HandoffPlan, { kind: 'none' }>;
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

const learnMoreLink = (
  <LinkExternal href={LINK.FX_SYNC} className="link-dark-grey">
    Learn more
  </LinkExternal>
);

/**
 * The mobile screen shown when pairing reaches a device that does not have
 * Firefox yet. It explains what syncing gets the user and sends them off to
 * the browser.
 *
 * With a `plan` it hands the pairing URL to the Firefox app, so the user lands
 * back in the flow instead of on a cold /pair page. The two platforms need
 * genuinely different mechanics, and the reasons are recorded in
 * `lib/pairing/store-fallback.ts` (iOS) and `lib/pairing/handoff.ts` (Android).
 * In short: iOS needs the tap itself to be the navigation and has no API that
 * reports a failed launch, so the store fallback is inferred; Android can
 * navigate from script and carries its own store fallback inside the intent.
 *
 * Both hand-offs can leave the user here with nothing having happened, so the
 * CTA stays mounted and tappable throughout and only swaps its label for a
 * spinner while an attempt is in flight. That is also the store escape hatch:
 * a second tap re-arms the iOS watchdog, and Android's intent carries
 * `S.browser_fallback_url`.
 *
 * Without a `plan` there is nothing to hand off, so the CTA is the shared
 * mobile download target rather than a per-platform App Store / Play Store
 * link: picking between the two needs user-agent sniffing that buys nothing
 * here, and mozilla.org already routes mobile visitors to the right store.
 */
const DownloadFirefox = ({
  plan,
  assign = (url: string) => window.location.assign(url),
  storage = getAttemptStorage(),
}: DownloadFirefoxProps) => {
  const isAndroid = plan?.kind === 'android';
  const willAutoAttempt = plan?.kind === 'android' && plan.autoAttempt;

  const [attempting, setAttempting] = useState(willAutoAttempt);

  // Holds the teardown for the in-flight iOS watch so we can clean up on unmount.
  const teardownRef = useRef<(() => void) | null>(null);
  useEffect(() => () => teardownRef.current?.(), []);

  useEffect(() => {
    if (!willAutoAttempt || plan?.kind !== 'android') {
      return;
    }
    // Navigate only once the one-shot token is actually ours, or Back from the
    // Play Store loops. `plan.target` is the same key `planPairingHandoff`
    // checked to set `autoAttempt`.
    if (!claimAutoAttempt(plan.target, storage)) {
      setAttempting(false);
      return;
    }
    assign(plan.deepLink);

    // WebView backstop: if the intent silently no-ops, drop the CTA back to its
    // resting state rather than spinning forever. State only — never a
    // navigation, so it cannot race S.browser_fallback_url, which unloads us
    // first when it works.
    const restTimer = window.setTimeout(
      () => setAttempting(false),
      STORE_FALLBACK_TIMEOUT_MS
    );
    return () => window.clearTimeout(restTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The tap on the anchor below performs the hand-off itself — deliberately no
  // preventDefault() and no JS navigation, since the native top-level
  // navigation is what iOS requires and routing it through JS risks losing the
  // user activation. This only arms the fallback.
  const onAttempt = () => {
    if (!plan) {
      return;
    }
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

  const ctaLabel = attempting ? (
    <>
      {/* Hidden from the accessibility tree because the label beside it
          already says what the spinner means. */}
      <span aria-hidden="true" className="flex">
        <LoadingSpinner
          spinnerType={SpinnerType.White}
          imageClassName="w-4 h-4 animate-spin"
        />
      </span>
      <FtlMsg id="pair2-supplicant-download-firefox-opening-button">
        <span>Opening Firefox…</span>
      </FtlMsg>
    </>
  ) : (
    <FtlMsg id="pair2-supplicant-download-firefox-continue-button">
      <span>Continue in Firefox</span>
    </FtlMsg>
  );

  const ctaClassName =
    'cta-primary cta-xl flex items-center justify-center gap-2';

  // With a plan the deep link must be a plain anchor: the tap has to be a
  // top-level, user-initiated navigation in this tab, which is the only form
  // iOS honours — LinkExternal's target="_blank" would break it. Without one
  // the CTA is an ordinary outbound link to mozilla.org.
  const cta = plan ? (
    <a href={plan.deepLink} onClick={onAttempt} className={ctaClassName}>
      {ctaLabel}
    </a>
  ) : (
    <LinkExternal
      href={Constants.FIREFOX_MOBILE_DOWNLOAD_URL}
      className={ctaClassName}
    >
      {ctaLabel}
    </LinkExternal>
  );

  return (
    <AppLayout>
      <div className="flex flex-col items-center text-center">
        <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

        <SyncDevicesImage className="mt-10 h-[120px] w-auto" />

        <FtlMsg id="pair2-supplicant-download-firefox-heading">
          <h1 className="card-header mt-4">Get Firefox on this device</h1>
        </FtlMsg>
        <FtlMsg
          id="pair2-supplicant-download-firefox-description"
          elems={{ linkExternal: learnMoreLink }}
        >
          <p className="mt-1 text-base">
            Download Firefox to sync bookmarks, history, and more across
            devices. {learnMoreLink}
          </p>
        </FtlMsg>

        <div className="mt-6 flex w-full">{cta}</div>
      </div>
    </AppLayout>
  );
};

export default DownloadFirefox;
