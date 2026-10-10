/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import DownloadFirefox, { DownloadFirefoxProps } from '.';
import {
  HandoffPlan,
  planPairingHandoff,
} from '../../../../lib/pairing/handoff';
import { Devices } from '../../../../lib/utilities';
import {
  buildConnectHintUrl,
  buildPairUrl,
} from '../../../../lib/pairing/pair-url';

export const MOCK_CHANNEL = {
  channelId: 'chan-1',
  channelKey: 'key-1',
  version: '2',
} as const;

const MOCK_ORIGIN = 'https://accounts.firefox.com';

export const MOCK_TARGET = buildPairUrl(MOCK_CHANNEL, MOCK_ORIGIN);

export const MOCK_HINT_URL = buildConnectHintUrl(MOCK_ORIGIN);

export const MOCK_STORE_LINKS = {
  ios: 'https://apps.apple.com/app/firefox/id989804926',
  android: 'https://play.google.com/store/apps/details?id=org.mozilla.firefox',
};

type IosPlan = Extract<HandoffPlan, { kind: 'ios' }>;

// Built through `planPairingHandoff` rather than hand-written, so the deep
// links under test are byte-for-byte what the real flow produces — including
// the second `#` the Android intent picks up from the channel hash.
const buildPlan = (
  device: Devices,
  { iosHandoff = true, isSafari = false } = {}
) =>
  planPairingHandoff({
    device,
    targetUrl: MOCK_TARGET,
    hintUrl: MOCK_HINT_URL,
    storeLinks: MOCK_STORE_LINKS,
    // No storage, so `autoAttempt` is false; the Android mock overrides it.
    storage: undefined,
    build: 'firefox',
    iosScheme: 'firefox',
    // The deployment gate is the caller's business; the default fixtures
    // exercise the plan that carries the pair URL.
    iosHandoff,
    isSafari,
  });

/** A non-Safari iOS browser, once the rollout lets Firefox iOS take the pair URL. */
export const MOCK_IOS_PLAN = buildPlan(Devices.OTHER_IOS) as IosPlan;

/** Safari itself: the store is a separate CTA rather than an inferred fallback. */
export const MOCK_IOS_SAFARI_PLAN = buildPlan(Devices.OTHER_IOS, {
  isSafari: true,
}) as IosPlan;

/** Before the iOS rollout: the deep link opens the connect hint page instead. */
export const MOCK_IOS_HINT_PLAN = buildPlan(Devices.OTHER_IOS, {
  iosHandoff: false,
}) as IosPlan;

export const MOCK_ANDROID_PLAN = {
  ...(buildPlan(Devices.OTHER_ANDROID) as Extract<
    HandoffPlan,
    { kind: 'android' }
  >),
  autoAttempt: true,
};

export const Subject = ({
  plan = MOCK_IOS_PLAN,
  assign = () => {},
  storage,
}: Partial<DownloadFirefoxProps> = {}) => (
  <DownloadFirefox {...{ plan, assign, storage }} />
);
