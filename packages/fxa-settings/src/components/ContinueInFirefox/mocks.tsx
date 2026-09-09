/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ContinueInFirefox, ContinueInFirefoxProps } from '.';
import { HandoffPlan } from '../../lib/pairing/handoff';

export const MOCK_TARGET =
  'https://accounts.firefox.com/pair#channel_id=chan-1&channel_key=key-1&v=2';

export const MOCK_IOS_PLAN: Extract<HandoffPlan, { kind: 'ios' }> = {
  kind: 'ios',
  deepLink: `firefox://open-url?url=${encodeURIComponent(MOCK_TARGET)}`,
  storeUrl: 'https://apps.apple.com/app/firefox/id989804926',
};

export const MOCK_ANDROID_PLAN: Extract<HandoffPlan, { kind: 'android' }> = {
  kind: 'android',
  deepLink:
    'intent://accounts.firefox.com/pair#Intent;scheme=https;package=org.mozilla.firefox;end',
  storeUrl: 'https://play.google.com/store/apps/details?id=org.mozilla.firefox',
  target: MOCK_TARGET,
  autoAttempt: true,
};

export const Subject = ({
  plan = MOCK_IOS_PLAN,
  assign = () => {},
  storage,
}: Partial<ContinueInFirefoxProps> = {}) => (
  <ContinueInFirefox {...{ plan, assign, storage }} />
);
