/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useMemo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../../../components/CardHeader';
import { usePageViewEvent } from '../../../lib/metrics';
import {
  HeartsBrokenImage,
  HeartsVerifiedImage,
} from '../../../components/images';
import { REACT_ENTRYPOINT } from '../../../constants';
import LinkExternal from 'fxa-react/components/LinkExternal';
import AppLayout from '../../../components/AppLayout';
import Banner from '../../../components/Banner';
import GleanMetrics from '../../../lib/glean';

type PairUnsupportedProps = { error?: string };
export const viewName = 'pair-unsupported';

/**
 * Detect device context to show appropriate messaging.
 * Mirrors Backbone `pair/unsupported.js` setInitialContext() and the
 * branch logic in `templates/pair/unsupported.mustache`.
 */
function useDeviceContext() {
  return useMemo(() => {
    const ua = navigator.userAgent;
    const isFirefox = /Firefox/i.test(ua) || /FxiOS/i.test(ua);
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const isIos = /iPhone|iPad|iPod/i.test(ua);

    // System camera URL: mobile with channel_id/channel_key in the URL hash.
    const hash = window.location.hash;
    const isSystemCameraUrl =
      isMobile && hash.includes('channel_id') && hash.includes('channel_key');

    // Four mutually exclusive Backbone template branches:
    //   1. Desktop non-Firefox            → "Oops! not using Firefox" + Download CTA
    //   2. Mobile + system-camera URL     → "Pair using an app" + camera warning
    //   3. Mobile + NO system-camera URL  → "Connecting your mobile device..." instructions
    //                                       (plus inline orange banner when not Firefox)
    //   4. Desktop Firefox fallback       → "Something went wrong. Please close this tab."
    const isDesktopNonFirefox = !isFirefox && !isMobile;
    const isMobileWithSystemCamera = isMobile && isSystemCameraUrl;
    const isMobileNoSystemCamera = isMobile && !isSystemCameraUrl;
    const isMobileNonFirefoxNoCamera = isMobileNoSystemCamera && !isFirefox;
    const isDesktopFirefoxFallback = !isMobile && isFirefox;

    const downloadLink = isIos
      ? 'https://apps.apple.com/app/firefox-private-safe-browser/id989804926'
      : 'https://play.google.com/store/apps/details?id=org.mozilla.firefox';

    return {
      isDesktopNonFirefox,
      isMobileWithSystemCamera,
      isMobileNoSystemCamera,
      isMobileNonFirefoxNoCamera,
      isDesktopFirefoxFallback,
      downloadLink,
    };
  }, []);
}

const PairUnsupported = ({
  error,
}: PairUnsupportedProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const {
    isDesktopNonFirefox,
    isMobileWithSystemCamera,
    isMobileNoSystemCamera,
    isMobileNonFirefoxNoCamera,
    isDesktopFirefoxFallback,
    downloadLink,
  } = useDeviceContext();

  // Emit Glean view events per device context (matches Backbone unsupported.js logView).
  useEffect(() => {
    if (isDesktopNonFirefox) {
      GleanMetrics.cadRedirectDesktop.view();
    } else if (isMobileWithSystemCamera) {
      GleanMetrics.cadMobilePairUseApp.view();
    } else if (isMobileNoSystemCamera) {
      GleanMetrics.cadRedirectMobile.view();
    } else {
      GleanMetrics.cadRedirectDesktop.defaultView();
    }
  }, [isDesktopNonFirefox, isMobileWithSystemCamera, isMobileNoSystemCamera]);

  return (
    <AppLayout>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}

      {isDesktopNonFirefox && (
        <>
          <FtlMsg id="pair-unsupported-oops-header">
            <h2
              id="pair-unsupported-header"
              className="card-header focus:outline-none mt-5"
              tabIndex={-1}
            >
              Oops! It looks like you’re not using Firefox.
            </h2>
          </FtlMsg>
          <div className="flex bg-orange-50 dark:bg-orange-900/30 px-4 py-3 mt-6 rounded-lg mb-4">
            <div
              className="bg-icon-warning bg-contain bg-center bg-no-repeat w-6"
              aria-label="Attention:"
              role="img"
            />
            <FtlMsg id="pair-unsupported-switch-to-firefox">
              <p className="ps-3">
                Switch to Firefox and open this page to connect another device.
              </p>
            </FtlMsg>
          </div>
          <HeartsBrokenImage className="w-3/5 mx-auto" />
          <div className="flex">
            <LinkExternal
              href="https://www.mozilla.org/firefox/new/"
              className="cta-primary cta-xl"
              onClick={() => GleanMetrics.cadRedirectDesktop.download()}
            >
              Download Firefox
            </LinkExternal>
          </div>
        </>
      )}

      {isMobileWithSystemCamera && (
        <>
          <HeartsBrokenImage className="w-3/5 mx-auto" />
          <CardHeader
            headingTextFtlId="pair-unsupported-header"
            headingText="Pair using an app"
          />
          <FtlMsg id="pair-unsupported-message">
            <p className="text-sm">
              Did you use the system camera? You must pair from within a Firefox
              app.
            </p>
          </FtlMsg>
        </>
      )}

      {isMobileNoSystemCamera && (
        <>
          {isMobileNonFirefoxNoCamera && (
            // Inline orange "Oops! not using Firefox" banner for mobile
            // non-Firefox users. Firefox mobile users skip this and go
            // straight to the "Connecting your mobile device" instructions.
            <div className="flex bg-orange-50 dark:bg-orange-900/30 px-4 py-3 rounded-lg mb-8">
              <div
                className="bg-icon-warning bg-contain bg-center bg-no-repeat w-10"
                aria-label="Attention:"
                role="img"
              />
              <p className="ps-3 text-sm">
                <FtlMsg id="pair-unsupported-oops-mobile">
                  <span>Oops! It looks like you’re not using Firefox. </span>
                </FtlMsg>
                <LinkExternal
                  href={downloadLink}
                  className="link-blue"
                  data-glean-id="cad_redirect_mobile_download"
                >
                  Download Firefox now
                </LinkExternal>
              </p>
            </div>
          )}
          <HeartsVerifiedImage className="w-3/5 mx-auto" />
          <FtlMsg id="pair-unsupported-connecting-mobile-header-v2">
            <h1
              id="pair-unsupported-header"
              className="card-header focus:outline-none"
              tabIndex={-1}
            >
              Connecting your mobile device with your Mozilla account
            </h1>
          </FtlMsg>
          <FtlMsg
            id="pair-unsupported-connecting-mobile-instructions-v2"
            elems={{ b: <b className="whitespace-nowrap" /> }}
          >
            <p className="mt-4 text-base">
              Open Firefox on your computer, visit{' '}
              <b className="whitespace-nowrap">firefox.com/pair</b>, and follow
              the on-screen instructions to connect your mobile device.
            </p>
          </FtlMsg>
          <p className="mt-3">
            <LinkExternal
              href="https://support.mozilla.org/kb/how-do-i-set-sync-my-computer"
              className="link-blue"
              data-glean-id="cad_redirect_mobile_learn_more"
            >
              <FtlMsg id="pair-unsupported-learn-more-link-v2">
                Learn more
              </FtlMsg>
            </LinkExternal>
          </p>
        </>
      )}

      {isDesktopFirefoxFallback && (
        <>
          <HeartsBrokenImage className="w-3/5 mx-auto" />
          <FtlMsg id="pair-unsupported-desktop-firefox-fallback-header-v2">
            <h2
              id="pair-unsupported-header"
              className="card-header focus:outline-none mt-5"
              tabIndex={-1}
            >
              Oops! Something went wrong.
            </h2>
          </FtlMsg>
          <FtlMsg id="pair-unsupported-desktop-firefox-fallback-message-v2">
            <p className="mt-3 text-sm">Please close this tab and try again.</p>
          </FtlMsg>
        </>
      )}
    </AppLayout>
  );
};

export default PairUnsupported;
