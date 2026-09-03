/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import { usePageViewEvent } from '../../../../lib/metrics';
import GleanMetrics from '../../../../lib/glean';
import { REACT_ENTRYPOINT } from '../../../../constants';
import config from '../../../../lib/config';
import { detectDevice } from '../../../../lib/utilities';
import {
  buildPairUrl,
  isPairingChannelInfo,
} from '../../../../lib/pairing/pair-url';
import {
  getAttemptStorage,
  HandoffPlan,
  planPairingHandoff,
} from '../../../../lib/pairing/handoff';
import DownloadFirefox from '.';

export const viewName = 'pair-supplicant-download-firefox';

/**
 * Rebuilds the hand-off plan for the pairing channel `Pair/Index` handed us.
 *
 * The channel arrives in router state rather than the URL: the channel key is
 * the pairing PSK, so it must not follow us into a second address bar entry.
 * The trade is that a load with no state — a pasted link, a new tab — has no
 * channel to hand off, and the page falls back to a plain download link rather
 * than erroring.
 *
 * The plan is rebuilt here rather than passed down whole so `autoAttempt` is
 * read from live `sessionStorage` on every load. A stale `true` frozen into a
 * history entry is what the Play Store back-loop guard exists to prevent.
 */
export const DownloadFirefoxContainer = () => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const location = useLocation();

  useEffect(() => {
    GleanMetrics.cadFireFox.downloadFirefoxView();
  }, []);

  const plan = useMemo(() => {
    const channelInfo = location.state;
    if (!isPairingChannelInfo(channelInfo)) {
      return undefined;
    }

    const handoffPlan: HandoffPlan = planPairingHandoff({
      device: detectDevice(),
      targetUrl: buildPairUrl(channelInfo),
      storeLinks: config.mobileStoreLinks,
      storage: getAttemptStorage(),
      build: config.pairing.browserBuild,
    });

    // `none` means this device has no Firefox app to open — desktop, or Firefox
    // itself. Same outcome as no channel at all: just offer the download.
    return handoffPlan.kind === 'none' ? undefined : handoffPlan;
  }, [location.state]);

  return <DownloadFirefox plan={plan} />;
};

export default DownloadFirefoxContainer;
