/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file contains query params that don't reflect states that can be reached from 123done.
import uaStrings from './ua-strings';

export const oauthWebchannelV1 = new URLSearchParams({
  context: 'oauth_webchannel_v1',
});

// Minimum needed to complete OAuth flow
export const syncMobileOAuthQueryParams = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: '1b1a3e44c54fbb58', // Firefox for iOS
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  // eslint-disable-next-line camelcase
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  scope:
    'https://identity.mozilla.com/apps/oldsync https://identity.mozilla.com/tokens/session',
  state: 'fakestate',
  automatedBrowser: 'true',
});

export const syncDesktopV3QueryParams = new URLSearchParams({
  context: 'fx_desktop_v3',
  service: 'sync',
  action: 'email',
  automatedBrowser: 'true',
  forceUA: uaStrings['desktop_firefox_71'],
});
