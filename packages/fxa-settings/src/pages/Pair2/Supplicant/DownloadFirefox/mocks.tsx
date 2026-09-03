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
import { buildPairUrl } from '../../../../lib/pairing/pair-url';

export const MOCK_CHANNEL = {
  channelId: 'chan-1',
  channelKey: 'key-1',
  version: '2',
} as const;

export const MOCK_TARGET = buildPairUrl(
  MOCK_CHANNEL,
  'https://accounts.firefox.com'
);

export const MOCK_STORE_LINKS = {
  ios: 'https://apps.apple.com/app/firefox/id989804926',
  android: 'https://play.google.com/store/apps/details?id=org.mozilla.firefox',
};

// Built through `planPairingHandoff` rather than hand-written, so the deep
// links under test are byte-for-byte what the real flow produces — including
// the second `#` the Android intent picks up from the channel hash.
const buildPlan = (device: Devices) =>
  planPairingHandoff({
    device,
    targetUrl: MOCK_TARGET,
    storeLinks: MOCK_STORE_LINKS,
    // No storage, so `autoAttempt` is false; the Android mock overrides it.
    storage: undefined,
    build: 'firefox',
  });

export const MOCK_IOS_PLAN = buildPlan(Devices.OTHER_IOS) as Extract<
  HandoffPlan,
  { kind: 'ios' }
>;

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
