/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../../../components/AppLayout';
import { FirefoxWordmarkImage } from '../../../../components/images';
import PairUnsupportedHint, {
  PairUnsupportedHintProps,
} from '../../../../components/PairUnsupportedHint';
import { detectDevice, Devices } from '../../../../lib/utilities';

// Only iOS reaches this page through the hand-off, so other devices get iOS.
const detectOs = (): PairUnsupportedHintProps['os'] =>
  [Devices.FIREFOX_ANDROID, Devices.OTHER_ANDROID].includes(detectDevice())
    ? 'android'
    : 'ios';

/**
 * The mobile screen for a user who scanned the pairing QR code with the
 * system camera instead of Firefox, but already has Firefox installed. It
 * walks them through scanning the code again from inside Firefox.
 *
 * The download screen opens this page in a Firefox tab, so it shows the tab
 * variant of the hint.
 */
const PairConnectHint = ({
  os = detectOs(),
}: Partial<Pick<PairUnsupportedHintProps, 'os'>>) => (
  <AppLayout whiteBackground>
    <div className="flex flex-col items-center text-center">
      <FirefoxWordmarkImage className="mb-10 h-8 w-24 text-black dark:text-white" />

      <PairUnsupportedHint
        view="tab"
        os={os}
        learnMoreGleanId="dtm_mobile_connect_hint_learn_more"
      />
    </div>
  </AppLayout>
);

export default PairConnectHint;
