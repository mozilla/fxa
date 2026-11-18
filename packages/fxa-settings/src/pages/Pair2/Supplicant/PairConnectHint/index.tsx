/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import GleanMetrics from '../../../../lib/glean';
import { getPairingV2VersionCheck } from '../../../../lib/pairing/v2-gate';
import { useConfig } from '../../../../models/hooks';
import AppLayout from '../../../../components/AppLayout';
import { FirefoxWordmarkImage } from '../../../../components/images';
import PairUnsupportedHint, {
  PairUnsupportedHintProps,
  PairUnsupportedViewType,
} from '../../../../components/PairUnsupportedHint';
import { detectDevice, Devices } from '../../../../lib/utilities';
import { useFtlMsgResolver } from '../../../../models';

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
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'pair2-supplicant-connect-hint-page-title',
    'Finish pairing in the app'
  );
  const view = viewType(location);
  const { pairing } = useConfig();

  useEffect(() => {
    const { reason, firefoxVersion } = getPairingV2VersionCheck(
      pairing,
      detectDevice(),
      navigator.userAgent
    );
    GleanMetrics.dtmMobile.connectHintView({
      event: {
        reason,
        firefox_version: String(firefoxVersion ?? 'unknown'),
      },
    });
    // One view per mount; useConfig can hand back a fresh object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout title={localizedPageTitle} whiteBackground>
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
