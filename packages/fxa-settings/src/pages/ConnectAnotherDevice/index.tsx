/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps, Link, useLocation } from '@reach/router';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { ENTRYPOINTS, REACT_ENTRYPOINT } from '../../constants';
import { HeartsVerifiedImage } from '../../components/images';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import Banner from '../../components/Banner';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useFtlMsgResolver } from '../../models';
import { Constants } from '../../lib/constants';
import { getBasicAccountData } from '../../lib/account-storage';
import firefox, { buildSyncOAuthSearch } from '../../lib/channels/firefox';
import GleanMetrics from '../../lib/glean';
import AppLayout from '../../components/AppLayout';

export type ConnectAnotherDeviceProps = {
  email?: string;
  entrypoint?: ENTRYPOINTS;
  isSignedIn?: boolean;
  showSuccessMessage?: boolean;
  isSignUp?: boolean;
  isSignIn?: boolean;
  canSignIn?: boolean;
  device?: Devices;
};

export enum Devices {
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

  if (isFirefox && isAndroid) {
    return Devices.FIREFOX_ANDROID;
  }
  if (isFxiOS) {
    return Devices.FIREFOX_IOS;
  }
  if (isFirefox && !isAndroid) {
    return Devices.FIREFOX_DESKTOP;
  }
  if (isIos) {
    return Devices.OTHER_IOS;
  }
  if (isAndroid) {
    return Devices.OTHER_ANDROID;
  }
  return Devices.OTHER;
}

// Check if the browser supports Sync auth via WebChannels
// (Firefox Desktop >= 40 or Firefox Android >= 43).
function isSyncAuthSupported(): boolean {
  const ua = navigator.userAgent;
  const versionMatch = ua.match(/Firefox\/(\d+)/i);
  if (!versionMatch) {
    return false;
  }
  const version = parseInt(versionMatch[1], 10);
  const isAndroid = /Android/i.test(ua);
  const isDesktop = !isAndroid && !/FxiOS/i.test(ua);
  return (isDesktop && version >= 40) || (isAndroid && version >= 43);
}

const PAIRING_ENTRYPOINTS = new Set([
  ENTRYPOINTS.FIREFOX_PREFERENCES_ENTRYPOINT,
  ENTRYPOINTS.FIREFOX_SYNCED_TABS_ENTRYPOINT,
  ENTRYPOINTS.FIREFOX_TABS_SIDEBAR_ENTRYPOINT,
  ENTRYPOINTS.FIREFOX_MENU_ENTRYPOINT,
  ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT,
]);

export const viewName = 'connect-another-device';
const ConnectAnotherDevice = ({
  email: emailProp,
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
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const locationState = (location.state || {}) as Record<string, unknown>;

  const accountData = getBasicAccountData();
  const email = emailProp ?? accountData?.email ?? '';
  const isSignedIn = isSignedInProp ?? !!accountData?.sessionToken;
  const entrypoint =
    entrypointProp ?? getValidEntrypoint(searchParams.get('entrypoint'));
  const showSuccessMessage =
    showSuccessMessageProp ??
    !!(
      locationState.showSuccessMessage || searchParams.get('showSuccessMessage')
    );
  const isSignUp = isSignUpProp ?? locationState.type === 'sign_up';
  const isSignIn = isSignInProp ?? locationState.type === 'sign_in';
  // Set when the WebChannel sign-in attempt fails so the button stops
  // rendering instead of leaving the user with a silent no-op click.
  const [oauthFlowUnavailable, setOauthFlowUnavailable] = useState(false);
  const canSignIn =
    canSignInProp ??
    (!isSignedIn && isSyncAuthSupported() && !oauthFlowUnavailable);
  const device = deviceProp ?? detectDevice();

  // Callers that pass rendering props (tests, post-verify flows) skip the
  // bootstrap and render directly.
  const propsDriveRender =
    isSignedInProp !== undefined ||
    showSuccessMessageProp !== undefined ||
    canSignInProp !== undefined;
  const [bootstrapping, setBootstrapping] = useState(!propsDriveRender);

  // Ask Firefox for fresh Sync OAuth params and hard-navigate to / so the
  // App re-instantiates with an oauth_webchannel_v1 Sync integration.
  const startSyncOAuthFlow = useCallback(async (): Promise<boolean> => {
    const oauthParams = await firefox
      .fxaOAuthFlowBegin(['profile', Constants.OAUTH_OLDSYNC_SCOPE])
      .catch(() => null);
    if (!oauthParams) return false;
    const params = buildSyncOAuthSearch(oauthParams);
    // Underscore form: the CMS endpoint validator rejects ':' in entrypoint.
    params.set('entrypoint', 'fxa_connect_another_device');
    if (email) params.set('email', email);
    // Users reach CAD from a verification email (content-server #6258).
    params.set('utm_source', Constants.UTM_SOURCE_EMAIL);
    for (const key of [
      'utm_campaign',
      'utm_content',
      'utm_medium',
      'utm_term',
    ]) {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    }
    hardNavigate(`/?${params}`);
    return true;
  }, [email, searchParams]);

  const handleSignIn = useCallback(async () => {
    const ok = await startSyncOAuthFlow();
    if (!ok) setOauthFlowUnavailable(true);
  }, [startSyncOAuthFlow]);

  // Sync context + Firefox-chrome entrypoint required, else every direct
  // visit would bounce to /pair.
  const isEligibleForPairing = useCallback(() => {
    const context = searchParams.get('context') || '';
    const validContext =
      context === Constants.FX_DESKTOP_V3_CONTEXT ||
      context === Constants.OAUTH_WEBCHANNEL_CONTEXT;
    if (!validContext) return false;
    if (entrypoint === ENTRYPOINTS.FIREFOX_TOOLBAR_ENTRYPOINT) return true;
    return (
      searchParams.get('action') !== 'email' &&
      PAIRING_ENTRYPOINTS.has(entrypoint)
    );
  }, [entrypoint, searchParams]);

  useEffect(() => {
    if (propsDriveRender) {
      GleanMetrics.cad.view();
      return;
    }

    // RPs that pass redirect_to + redirect_immediately=true expect /settings
    // to validate the redirect URL and bounce the user back.
    if (
      searchParams.get('redirect_immediately') === 'true' &&
      searchParams.get('redirect_to')
    ) {
      hardNavigate('/settings');
      return;
    }

    let cancelled = false;
    (async () => {
      const signedInUser = await firefox
        .requestSignedInUser(
          Constants.OAUTH_CONTEXT,
          true,
          Constants.SYNC_SERVICE
        )
        .catch(() => undefined);
      if (cancelled) return;
      const browserSignedIn = !!(
        signedInUser?.sessionToken && signedInUser.verified
      );
      if (browserSignedIn && isEligibleForPairing()) {
        hardNavigate('/pair');
        return;
      }
      if (browserSignedIn) {
        setBootstrapping(false);
        GleanMetrics.cad.view();
        return;
      }
      const redirected = await startSyncOAuthFlow();
      if (cancelled || redirected) return;
      // WebChannel didn't reply; reveal the page so the user isn't stuck.
      setBootstrapping(false);
      GleanMetrics.cad.view();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (bootstrapping) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <AppLayout>
      {showSuccessMessage && isSignedIn && (
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
      {showSuccessMessage && !isSignedIn && isSignUp && (
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
      {showSuccessMessage && !isSignedIn && isSignIn && (
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
                <button
                  type="button"
                  className="cta-primary cta-xl"
                  onClick={handleSignIn}
                >
                  Sign in
                </button>
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
          </>
        )}
      </section>
    </AppLayout>
  );
};

export default ConnectAnotherDevice;
