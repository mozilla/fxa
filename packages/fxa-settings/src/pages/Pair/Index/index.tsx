/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { Link } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { usePageViewEvent } from '../../../lib/metrics';
import { useFtlMsgResolver } from '../../../models';
import CardHeader from '../../../components/CardHeader';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { ENTRYPOINTS, REACT_ENTRYPOINT } from '../../../../src/constants';
import { HeartsVerifiedImage } from '../../../components/images';
import GleanMetrics from '../../../lib/glean';
import Banner from '../../../components/Banner';
import { getBasicAccountData } from '../../../lib/account-storage';
import { Constants } from '../../../lib/constants';

type PairProps = {
  error?: string;
  entryPoint?: ENTRYPOINTS;
  onSubmit?: Function; // navigates to `about:preferences` whatever the given broker does that.
};
export const viewName = 'pair';

const Pair = ({
  error,
  entryPoint,
  onSubmit,
}: PairProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedQRCodeLabel = ftlMsgResolver.getMsg(
    'pair-qr-code-aria-label',
    'QR code'
  );
  const navigateWithQuery = useNavigateWithQuery();
  // TODO: Recreate the QR code logic which previously existed in the content-server.
  // Probably after that we can remove the fallback styles for the QR code div.

  const accountData = getBasicAccountData();

  // Check if we are using Firefox Desktop (pairing is only supported there).
  // Matches Backbone's `uap.isFirefoxDesktop()` check.
  const isSupported = () => {
    const ua = navigator.userAgent;
    return /Firefox/i.test(ua) && !/FxiOS/i.test(ua) && !/Android/i.test(ua);
  };

  // Check if the user has no signed-in account (equivalent to Backbone's `account.isDefault()`).
  // A "default" account in Backbone means no real user is signed in.
  const isDefaultAccount = () => !accountData;

  // Check if the account exists but is not verified or is missing a session token.
  const accountIsNotVerifiedOrHasNoSessionToken = () =>
    !!accountData && (!accountData.verified || !accountData.sessionToken);

  useEffect(() => {
    // Matches Backbone's beforeRender sequence. Only the first matching
    // redirect should fire, so we return after each to prevent cascading.
    if (!isSupported()) {
      navigateWithQuery('/pair/unsupported');
      return;
    }
    if (isDefaultAccount()) {
      // We are not logged into Sync — offer to connect.
      // The forceView flag prevents a redirect loop between /pair and CAD.
      navigateWithQuery('/connect_another_device', {
        state: { forceView: true },
      });
      return;
    }
    if (accountIsNotVerifiedOrHasNoSessionToken()) {
      // Build a proper Sync-context signin URL matching Backbone's
      // getEscapedSyncUrl('signin', 'fxa:pair').
      const params = new URLSearchParams({
        context: Constants.FX_DESKTOP_V3_CONTEXT,
        entrypoint: 'fxa:pair',
        service: Constants.SYNC_SERVICE,
      });
      navigateWithQuery(`/signin?${params}`);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateWithQuery]);

  const showQRCode =
    entryPoint === ENTRYPOINTS.FIREFOX_MENU_ENTRYPOINT ||
    entryPoint === ENTRYPOINTS.FIREFOX_PREFERENCES_ENTRYPOINT ||
    entryPoint === ENTRYPOINTS.FIREFOX_SYNCED_TABS_ENTRYPOINT ||
    entryPoint === ENTRYPOINTS.FIREFOX_TABS_SIDEBAR_ENTRYPOINT ||
    entryPoint === ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT ||
    entryPoint === ENTRYPOINTS.FIREFOX_TOOLBAR_ENTRYPOINT;

  return (
    <>
      {showQRCode ? (
        <CardHeader
          headingTextFtlId="pair-cad-header"
          headingText="Connect Firefox on another device"
        />
      ) : (
        <CardHeader
          headingTextFtlId="pair-sync-header"
          headingText="Sync Firefox on your phone or tablet"
        />
      )}

      <section>
        {error && <Banner type="error" content={{ localizedHeading: error }} />}
        {showQRCode ? (
          <>
            <div className="mt-9 mb-5">
              <FtlMsg id="pair-already-have-firefox-paragraph">
                <p className="text-sm">
                  Already have Firefox on a phone or tablet?
                </p>
              </FtlMsg>
            </div>
            <div className="flex">
              <FtlMsg id="pair-sync-your-device-button">
                <button
                  className="cta-primary cta-xl"
                  type="button"
                  onClick={() => {
                    onSubmit?.();
                  }}
                >
                  Sync your device
                </button>
              </FtlMsg>
            </div>
            <FtlMsg id="pair-or-download-subheader">
              <h2 className="text-lg font-bold mt-10">Or download</h2>
            </FtlMsg>
            <FtlMsg
              id="pair-scan-to-download-message"
              elems={{
                linkExternal: (
                  <LinkExternal
                    href="https://www.mozilla.org/firefox/mobile/get-app/"
                    className="link-blue"
                  >
                    download link.
                  </LinkExternal>
                ),
              }}
            >
              <p className="my-5 px-16 text-sm">
                Scan to download Firefox for mobile, or send yourself a{' '}
                <LinkExternal
                  href="https://www.mozilla.org/firefox/mobile/get-app/"
                  className="link-blue"
                >
                  download link.
                </LinkExternal>
              </p>
            </FtlMsg>
            <div
              className="mx-auto w-48 h-48"
              role="img"
              aria-label={localizedQRCodeLabel}
            ></div>
            <p className="mt-5 text-sm">
              <FtlMsg id="pair-not-now-button">
                <Link
                  className="link-blue"
                  to="/settings"
                  onClick={() => {
                    GleanMetrics.cadFireFox.notnowSubmit();
                  }}
                >
                  Not now
                </Link>
              </FtlMsg>
            </p>
          </>
        ) : (
          <>
            <HeartsVerifiedImage />
            <FtlMsg id="pair-take-your-message">
              <p className="mt-5 mb-5 px-16 text-sm">
                Take your tabs, bookmarks, and passwords anywhere you use
                Firefox.
              </p>
            </FtlMsg>
            <div className="flex">
              <FtlMsg id="pair-get-started-button">
                <button
                  className="cta-primary cta-xl"
                  onClick={() => onSubmit?.()}
                  type="button"
                >
                  Get started
                </button>
              </FtlMsg>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default Pair;
