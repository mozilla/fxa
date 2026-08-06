/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isPairingSupported } from '../../lib/utilities';

export type BannerState =
  | 'firefox-pair'
  | 'switch-desktop'
  | 'switch-mobile'
  | 'hidden';

// `isMobile` must be user-agent based, not viewport based: a narrow desktop
// Firefox window is not a mobile device and must still show the banner.
// `isSignedIntoBrowser` is whether the user is signed into the Firefox browser
// (any service), and only gates the Firefox variant; non-Firefox users have no
// Firefox sign-in to detect.
export function getBannerState({
  isFirefox,
  isMobile,
  isSignedIntoBrowser,
}: {
  isFirefox: boolean;
  isMobile: boolean;
  isSignedIntoBrowser: boolean;
}): BannerState {
  if (isPairingSupported({ isFirefox, isMobile }) && isSignedIntoBrowser) {
    return 'firefox-pair';
  }
  // Firefox mobile already has the app. Desktop without a browser session gets
  // no banner, though the Connected Services button still shows there: it only
  // needs `isPairingSupported`, since /pair can obtain the session itself.
  if (isFirefox) {
    return 'hidden';
  }
  return isMobile ? 'switch-mobile' : 'switch-desktop';
}
