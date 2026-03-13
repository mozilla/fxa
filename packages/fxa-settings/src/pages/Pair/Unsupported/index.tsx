/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useMemo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../../../components/CardHeader';
import { usePageViewEvent } from '../../../lib/metrics';
import { HeartsBrokenImage } from '../../../components/images';
import { REACT_ENTRYPOINT } from '../../../constants';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Banner from '../../../components/Banner';

type PairUnsupportedProps = { error?: string };
export const viewName = 'pair-unsupported';

/**
 * Detect device context to show appropriate messaging.
 * Matches Backbone's pair/unsupported.js setInitialContext().
 */
function useDeviceContext() {
  return useMemo(() => {
    const ua = navigator.userAgent;
    const isFirefox = /Firefox/i.test(ua) || /FxiOS/i.test(ua);
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const isIos = /iPhone|iPad|iPod/i.test(ua);

    // System camera URL: mobile with channel_id and channel_key in hash
    const hash = window.location.hash;
    const isSystemCameraUrl =
      isMobile && hash.includes('channel_id') && hash.includes('channel_key');

    const isDesktopNonFirefox = !isFirefox && !isMobile;

    const downloadLink = isIos
      ? 'https://apps.apple.com/app/firefox-private-safe-browser/id989804926'
      : 'https://play.google.com/store/apps/details?id=org.mozilla.firefox';

    return { isFirefox, isMobile, isIos, isSystemCameraUrl, isDesktopNonFirefox, downloadLink };
  }, []);
}

const PairUnsupported = ({
  error,
}: PairUnsupportedProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const { isSystemCameraUrl, isDesktopNonFirefox, isMobile, downloadLink } =
    useDeviceContext();

  // Mobile without system camera URL = no header (matches Backbone behavior)
  const showHeader = !isMobile || isSystemCameraUrl;

  return (
    <>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      {showHeader && (
        <CardHeader
          headingTextFtlId="pair-unsupported-header"
          headingText="Pair using an app"
        />
      )}
      <HeartsBrokenImage className="w-3/5 mx-auto" />
      {isDesktopNonFirefox ? (
        // Desktop user not on Firefox
        <>
          <FtlMsg id="pair-unsupported-download-firefox">
            <p className="text-sm mb-4">
              To use device pairing, download Firefox for desktop.
            </p>
          </FtlMsg>
          <LinkExternal
            href="https://www.mozilla.org/firefox/new/"
            className="cta-primary cta-xl"
          >
            Download Firefox
          </LinkExternal>
        </>
      ) : isMobile && !isSystemCameraUrl ? (
        // Mobile user without system camera URL (e.g. opened link in mobile Chrome)
        <>
          <FtlMsg id="pair-unsupported-download-firefox-mobile">
            <p className="text-sm mb-4">
              Get Firefox for mobile to complete pairing.
            </p>
          </FtlMsg>
          <LinkExternal href={downloadLink} className="cta-primary cta-xl">
            Download Firefox
          </LinkExternal>
        </>
      ) : (
        // System camera URL or generic fallback
        <FtlMsg id="pair-unsupported-message">
          <p className="text-sm">
            Did you use the system camera? You must pair from within a Firefox
            app.
          </p>
        </FtlMsg>
      )}
    </>
  );
};

export default PairUnsupported;
