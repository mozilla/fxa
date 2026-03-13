/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import {
  RouteComponentProps,
  Link,
  navigate,
  useLocation,
} from '@reach/router';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { ENTRYPOINTS, REACT_ENTRYPOINT } from '../../constants';
import { HeartsVerifiedImage } from '../../components/images';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner from '../../components/Banner';
import { useFtlMsgResolver } from '../../models';
import { Constants } from '../../lib/constants';
import { getBasicAccountData } from '../../lib/account-storage';
import GleanMetrics from '../../lib/glean';

export type ConnectAnotherDeviceProps = {
  email?: string;
  forceView?: boolean;
  entrypoint?: ENTRYPOINTS;
  isSignedIn?: boolean;
  showSuccessMessage?: boolean;
  isSignUp?: boolean;
  isSignIn?: boolean;
  canSignIn?: boolean;
  device?: Devices;
};

export enum Devices {
  FIREFOX_MENU = 'Firefox Menu',
  FIREFOX_ANDROID = 'Firefox Android',
  FIREFOX_DESKTOP = 'Firefox Desktop',
  FIREFOX_IOS = 'Firefox iOS',
  OTHER_ANDROID = 'Other Android',
  OTHER_IOS = 'Other iOS',
  OTHER = 'Other',
}
// Validate entrypoint against known values, defaulting to FIREFOX_MENU_ENTRYPOINT.
const VALID_ENTRYPOINTS = new Set(Object.values(ENTRYPOINTS));
function getValidEntrypoint(raw: string | null): ENTRYPOINTS {
  if (raw && VALID_ENTRYPOINTS.has(raw as ENTRYPOINTS)) {
    return raw as ENTRYPOINTS;
  }
  return ENTRYPOINTS.FIREFOX_MENU_ENTRYPOINT;
}

// Detect device type from user agent.
function detectDevice(): Devices {
  const ua = navigator.userAgent;
  const isFirefox = /Firefox/i.test(ua) && !/FxiOS/i.test(ua);
  const isFxiOS = /FxiOS/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIos = /iPhone|iPad|iPod/i.test(ua) || isFxiOS;

  if (isFirefox && isAndroid) return Devices.FIREFOX_ANDROID;
  if (isFxiOS) return Devices.FIREFOX_IOS;
  if (isFirefox && !isAndroid) return Devices.FIREFOX_DESKTOP;
  if (isIos) return Devices.OTHER_IOS;
  if (isAndroid) return Devices.OTHER_ANDROID;
  return Devices.OTHER;
}

// Check if the browser supports Sync auth via WebChannels
// (Firefox Desktop >= 40 or Firefox Android >= 43).
function isSyncAuthSupported(): boolean {
  const ua = navigator.userAgent;
  const versionMatch = ua.match(/Firefox\/(\d+)/i);
  if (!versionMatch) return false;
  const version = parseInt(versionMatch[1], 10);
  const isAndroid = /Android/i.test(ua);
  const isDesktop = !isAndroid && !/FxiOS/i.test(ua);
  return (isDesktop && version >= 40) || (isAndroid && version >= 43);
}

// Check if the current UA is a mobile browser.
function isMobile(): boolean {
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|FxiOS/i.test(ua);
}

export const viewName = 'connect-another-device';
const ConnectAnotherDevice = ({
  email: emailProp,
  forceView: forceViewProp,
  entrypoint: entrypointProp,
  isSignedIn: isSignedInProp,
  showSuccessMessage: showSuccessMessageProp,
  isSignUp: isSignUpProp,
  isSignIn: isSignInProp,
  canSignIn: canSignInProp,
  device: deviceProp,
}: ConnectAnotherDeviceProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locationState = (location.state || {}) as Record<string, unknown>;

  // Derive values from hooks/params when props aren't provided
  const accountData = getBasicAccountData();

  const email = emailProp ?? accountData?.email ?? '';
  const isSignedIn = isSignedInProp ?? !!accountData?.sessionToken;
  const entrypoint =
    entrypointProp ?? getValidEntrypoint(searchParams.get('entrypoint'));
  const forceView =
    forceViewProp ?? (locationState.forceView === true ? true : false);
  const showSuccessMessage =
    showSuccessMessageProp ??
    !!(
      locationState.showSuccessMessage || searchParams.get('showSuccessMessage')
    );
  const isSignUp = isSignUpProp ?? locationState.type === 'sign_up';
  const isSignIn = isSignInProp ?? locationState.type === 'sign_in';
  const canSignIn = canSignInProp ?? (!isSignedIn && isSyncAuthSupported());
  const device = deviceProp ?? detectDevice();

  // Construct the sign-in URL matching Backbone's _getEscapedSignInUrl + SyncAuthMixin.
  const getEscapedSignInUrl = () => {
    const params = new URLSearchParams({
      context: Constants.FX_DESKTOP_V3_CONTEXT,
      entrypoint: 'fxa:connect_another_device',
      service: Constants.SYNC_SERVICE,
      action: 'email',
    });
    if (email) {
      params.set('email', email);
    }
    // Forward UTM params from the current URL (matches Backbone relier UTM forwarding).
    // The utm_source is hard-coded to 'email' to reflect that users reach CAD from
    // a verification email (see content-server #6258).
    params.set('utm_source', Constants.UTM_SOURCE_EMAIL);
    for (const key of [
      'utm_campaign',
      'utm_content',
      'utm_medium',
      'utm_term',
    ]) {
      const val = searchParams.get(key);
      if (val) {
        params.set(key, val);
      }
    }
    return `/?${params}`;
  };

  const isEligibleForPairing = () => {
    const context = searchParams.get('context') || '';
    const isNotActionEmail = searchParams.get('action') !== 'email';

    return (
      isSignedIn &&
      (context === Constants.FX_DESKTOP_V3_CONTEXT ||
        context === Constants.OAUTH_WEBCHANNEL_CONTEXT) &&
      (entrypoint === ENTRYPOINTS.FIREFOX_TOOLBAR_ENTRYPOINT ||
        (isNotActionEmail &&
          (
            [
              ENTRYPOINTS.FIREFOX_PREFERENCES_ENTRYPOINT,
              ENTRYPOINTS.FIREFOX_SYNCED_TABS_ENTRYPOINT,
              ENTRYPOINTS.FIREFOX_TABS_SIDEBAR_ENTRYPOINT,
              ENTRYPOINTS.FIREFOX_MENU_ENTRYPOINT,
              ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT,
            ] as string[]
          ).includes(entrypoint)))
    );
  };

  useEffect(() => {
    // Matches Backbone's beforeRender sequence.
    if (forceView) {
      GleanMetrics.cad.view();
      return;
    }

    if (isEligibleForPairing()) {
      navigate('/pair');
      return;
    }

    // Some RPs specify redirect_to + redirect_immediately=true.
    // Route through /settings which validates the redirect URL.
    if (searchParams.get('redirect_immediately') === 'true') {
      navigate('/settings');
      return;
    }

    // Signed-in desktop users should go directly to /pair.
    if (isSignedIn && !isMobile()) {
      navigate('/pair');
      return;
    }

    // Log view metric only when the user actually stays on this page.
    GleanMetrics.cad.view();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceView]);

  return (
    <div>
      {showSuccessMessage && (
        <>
          {isSignedIn && (
            <Banner
              type="success"
              content={{
                localizedHeading: ftlMsgResolver.getMsg(
                  'connect-another-device-signed-in-header',
                  'You’re signed into Firefox'
                ),
              }}
            />
          )}
          {!isSignedIn && (
            <>
              {isSignUp && (
                <Banner
                  type="success"
                  content={{
                    localizedHeading: ftlMsgResolver.getMsg(
                      'connect-another-device-email-confirmed-banner',
                      'Email confirmed'
                    ),
                  }}
                />
              )}
              {isSignIn && (
                <Banner
                  type="success"
                  content={{
                    localizedHeading: ftlMsgResolver.getMsg(
                      'connect-another-device-signin-confirmed-banner',
                      'Sign-in confirmed'
                    ),
                  }}
                />
              )}
            </>
          )}
        </>
      )}
      <section>
        <HeartsVerifiedImage />
        {canSignIn && (
          <>
            <FtlMsg id="connect-another-device-signin-to-complete-message">
              <p className="mb-5 text-sm">
                Sign in to this Firefox to complete set-up
              </p>
            </FtlMsg>
            <div className="flex">
              <FtlMsg id="connect-another-device-signin-link">
                <Link className="cta-primary cta-xl" to={getEscapedSignInUrl()}>
                  Sign in
                </Link>
              </FtlMsg>
            </div>
          </>
        )}
        {!canSignIn && (
          <>
            {device === Devices.FIREFOX_ANDROID && (
              /* User verified in Fx for Android - they are using an old Fennec
              or are already signed in. Ignore old browsers, assume already signed in.
              Encourage installation on another device.
              */
              <>
                {isSignIn ? (
                  <FtlMsg id="connect-another-device-still-adding-devices-message">
                    <p className="text-sm">
                      Still adding devices? Sign in to Firefox on another device
                      to complete set-up
                    </p>
                  </FtlMsg>
                ) : (
                  <FtlMsg id="connect-another-device-signin-another-device-to-complete-message">
                    <p className="text-sm">
                      Sign in to Firefox on another device to complete set-up
                    </p>
                  </FtlMsg>
                )}
              </>
            )}
            {device === Devices.FIREFOX_DESKTOP && isSignedIn && (
              <>
                <div className="flex items-center justify-center mt-4 mb-5">
                  <FtlMsg id="connect-another-device-get-data-on-another-device-message">
                    <p className="font-normal text-sm px-16">
                      Want to get your tabs, bookmarks, and passwords on another
                      device?
                    </p>
                  </FtlMsg>
                </div>
                <div className="flex">
                  <FtlMsg id="connect-another-device-cad-link">
                    <Link
                      to={`/pair?entrypoint=${entrypoint}`}
                      className="cta-primary cta-xl"
                      onClick={() => {
                        GleanMetrics.cad.submit();
                      }}
                    >
                      Connect another device
                    </Link>
                  </FtlMsg>
                </div>
                <div className="mt-5">
                  <FtlMsg id="connect-another-device-not-now-link">
                    <Link
                      className="link-blue"
                      to="/settings"
                      onClick={() => {
                        logViewEvent(viewName, 'cad.notnow.engage');
                        GleanMetrics.cad.startbrowsingSubmit();
                      }}
                    >
                      Not now
                    </Link>
                  </FtlMsg>
                </div>
              </>
            )}
            {device === Devices.FIREFOX_IOS && (
              /* user verifies in Fx for iOS, assume they are not signed in */
              <FtlMsg id="connect-another-device-still-adding-devices-message">
                <p className="text-sm">
                  Still adding devices? Sign in to Firefox on another device to
                  complete set-up
                </p>
              </FtlMsg>
            )}
            {device === Devices.OTHER_ANDROID && (
              /*Another android browser, encourage Fx for Android installation */
              <FtlMsg id="connect-another-device-android-complete-setup-message">
                <p className="text-sm">
                  Sign in to Firefox for Android to complete set-up
                </p>
              </FtlMsg>
            )}
            {device === Devices.OTHER_IOS && (
              /*Safari or Chrome for iOS, encourage installation of Fx */
              <FtlMsg id="connect-another-device-ios-complete-setup-message">
                <p className="text-sm">
                  Sign in to Firefox for iOS to complete set-up
                </p>
              </FtlMsg>
            )}
            {device === Devices.OTHER &&
              /* probably some desktop browser */
              (isSignIn ? (
                <FtlMsg id="connect-another-device-still-adding-devices-message">
                  <p className="text-sm">
                    Still adding devices? Sign in to Firefox on another device
                    to complete set-up
                  </p>
                </FtlMsg>
              ) : (
                <FtlMsg id="connect-another-device-signin-to-complete-message">
                  <p className="text-sm">
                    Sign in to Firefox on another device to complete set-up
                  </p>
                </FtlMsg>
              ))}
            {device === Devices.FIREFOX_DESKTOP && (
              // TODO: The marketing area will have to be a separate component due to the complexity of the logic.
              // This may not be being used anymore. If product confirms that we aren't using this, I'll follow up with a ticket to remove this.
              <div className="marketing-area"></div>
            )}
            {/* TODO: The Child View appeared to not be in use and therefore has been omitted. I'm following up to confirm. */}
          </>
        )}
      </section>
    </div>
  );
};

export default ConnectAnotherDevice;
