/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { RouteComponentProps, Link, navigate } from '@reach/router';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { ENTRYPOINTS, REACT_ENTRYPOINT } from '../../constants';
import { HeartsVerifiedImage } from '../../components/images';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner from '../../components/Banner';
import { useFtlMsgResolver } from '../../models';

export type ConnectAnotherDeviceProps = {
  email: string;
  forceView?: boolean;
  entrypoint: ENTRYPOINTS; // in Backbone, this came in through the queryparam 'entrypoint' and would be validated in the component, defaulting to FXA Menu entrypoint
  isSignedIn: boolean; // check if `isSignedInAccount` (on "account"), or get `isVerificationSameBrowser` on the broker
  showSuccessMessage?: boolean; // check if you have a truthy value for "showSuccessMessage" either on the model, or in a search param by the same name. This is so that if you hit this url, you don't automatically be an inaccurate status message
  isSignUp: boolean; // we get this by getting the verification reason (or "type") off of the model
  isSignIn: boolean; // we get this by getting the verification reason (or "type") off of the model
  canSignIn: boolean; //we check if the user is 1. not signed in, and 2. on a UA that supports sync auth (i.e., Firefox Desktop where version > 40, or Firefox android where version > 43)
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
export const viewName = 'connect-another-device';
const ConnectAnotherDevice = ({
  email,
  forceView = false,
  entrypoint,
  isSignedIn,
  showSuccessMessage = false,
  isSignUp,
  isSignIn,
  canSignIn,
  device = Devices.FIREFOX_MENU,
}: ConnectAnotherDeviceProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const ftlMsgResolver = useFtlMsgResolver();

  // TODO: Add metrics about how specifically the user is being nudged to connect another device
  const getEscapedSignInUrl = () => {
    // TODO:
    // recreate the escaped signin url.
    // basically this means pulling a bunch of params off of the relier
    // you can see this in the `sync-auth-mixin.js`, and in `connect_another_device.js`
    return '/signin';
  };

  const isEligibleForPairing = () => {
    // TODO:
    // Check eligiblity using the following steps:
    // get context from `relier.get('context')`
    // originally we got the entrypoint from the relier, but here we have it as a prop
    // get the action from the relier as well
    // if:
    //    the user is signed into the default account,
    //    AND the context === FX_DESKTO_V3_CONTEXT
    //    AND (
    //       EITHER the entrypoint === FIREFOX_TOOLBAR_ENTRYPOINT)
    //       OR (the action !== email, and the entrypoint is firefox preferences || firefox synced tabs || firefox tabs sidebar || firefox menu || firefox fx view )
    // then set `isEligible` instead of using this hardcoded value
    const isEligible = false;
    if (isEligible) {
      return true;
    }
    return false;
  };
  useEffect(() => {
    if (!forceView && isEligibleForPairing()) {
      // To avoid redirection loops the forceView property might be set
      navigate('/pair');
    }
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
