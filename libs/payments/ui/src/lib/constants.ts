/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Nextjs could not find BannerVariant when it was placed in Banner component
// https://github.com/vercel/next.js/issues/58776
export enum BannerVariant {
  Error = 'error',
  Info = 'info',
  Success = 'success',
}

export const OFFERING_LINKS = {
  desktop: 'https://www.mozilla.org/firefox/new/',
  mobile: 'https://www.mozilla.org/firefox/mobile/',
  monitor: 'https://monitor.mozilla.org/',
  relay: 'https://relay.firefox.com/',
  vpn: 'https://vpn.mozilla.org/'
};
