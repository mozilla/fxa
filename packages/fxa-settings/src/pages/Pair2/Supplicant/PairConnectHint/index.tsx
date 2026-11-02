/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useLocation } from 'react-router';
import AppLayout from '../../../../components/AppLayout';
import { FirefoxWordmarkImage } from '../../../../components/images';
import PairUnsupportedHint, {
  PairUnsupportedHintProps,
  PairUnsupportedViewType,
} from '../../../../components/PairUnsupportedHint';
import { detectDevice, Devices } from '../../../../lib/utilities';

// Only iOS reaches this page through the hand-off, so other devices get iOS.
const detectOs = (): PairUnsupportedHintProps['os'] =>
  [Devices.FIREFOX_ANDROID, Devices.OTHER_ANDROID].includes(detectDevice())
    ? 'android'
    : 'ios';

// When firefox opens a 'custom tab',
function viewType({
  search,
  state,
}: {
  search: string;
  state: { embed?: string };
}): PairUnsupportedViewType {
  if (state?.embed === 'customtab') {
    return 'webview';
  }
  const searchParams = new URLSearchParams(search);
  if (searchParams.has('embed') && searchParams.get('embed') === 'customtab') {
    return 'webview';
  }
  return 'tab';
}

/**
 * The mobile screen for a user who scanned the pairing QR code with the
 * system camera instead of Firefox, but already has Firefox installed. It
 * walks them through scanning the code again from inside Firefox.
 */
const PairConnectHint = ({
  os = detectOs(),
}: Partial<Pick<PairUnsupportedHintProps, 'os'>>) => {
  const location = useLocation();
  const view = viewType(location);
  return (
    <AppLayout whiteBackground>
      <div className="flex flex-col items-center text-center">
        <FirefoxWordmarkImage className="mb-10 h-8 w-24 text-black dark:text-white" />

        <PairUnsupportedHint
          view={view}
          os={os}
          learnMoreGleanId="dtm_mobile_connect_hint_learn_more"
        />
      </div>
    </AppLayout>
  );
};

export default PairConnectHint;
