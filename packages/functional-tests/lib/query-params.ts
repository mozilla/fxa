/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file contains query params that don't reflect states that can be reached from 123done.
import uaStrings from './ua-strings';
import { FF_OAUTH_CLIENT_ID } from './channels';
import {
  SYNC_SESSION_TOKEN_SCOPE,
  OLDSYNC_SCOPE,
  VPN_SCOPE,
  PROFILE_SCOPE,
} from './scopes';

export const oauthWebchannelV1 = new URLSearchParams({
  context: 'oauth_webchannel_v1',
});

// Minimum needed to complete OAuth flow
export const syncMobileOAuthQueryParams = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: '1b1a3e44c54fbb58', // Firefox for iOS
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  scope: SYNC_SESSION_TOKEN_SCOPE,
  state: 'fakestate',
  automatedBrowser: 'true',
});

export const syncDesktopOAuthQueryParams = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: FF_OAUTH_CLIENT_ID, // Firefox Desktop
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  scope: SYNC_SESSION_TOKEN_SCOPE,
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'sync',
});

export const relayDesktopOAuthQueryParams = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: FF_OAUTH_CLIENT_ID, // Firefox Desktop
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  scope: SYNC_SESSION_TOKEN_SCOPE,
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'relay',
});

export const smartWindowDesktopOAuthQueryParams = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: FF_OAUTH_CLIENT_ID, // Firefox Desktop
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  scope: OLDSYNC_SCOPE,
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'smartwindow',
});

export const syncMobileOAuthFenixQueryParams = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: 'a2270f727f45f648', // Fenix (Android)
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  scope: SYNC_SESSION_TOKEN_SCOPE,
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'sync',
});

// Firefox-native VPN sign-in omits scope= and passes service=vpn; the
// auth-server resolves the full scope set (apps/vpn + profile) server-side
// per ADR 0049. No keys_jwk, so apps/oldsync is NOT appended (VPN must not
// pull in Sync). Mirrors vpnDesktopOAuthQueryParamsNoScope below.
export const vpnMobileOAuthQueryParamsNoScope = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: 'a2270f727f45f648', // Fenix (Android)
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'vpn',
});

// When Sync is not decoupled on Android, signing up for VPN on Android means
// signing up for Sync as well; all scopes are included in the request
export const vpnSyncMobileOAuthFenixQueryParams = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: 'a2270f727f45f648', // Fenix (Android)
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  scope: `${PROFILE_SCOPE} ${OLDSYNC_SCOPE} ${VPN_SCOPE}`,
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'vpn',
  entrypoint: 'protection_panel',
});

export const syncDesktopOAuthQueryParamsNoScope = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: FF_OAUTH_CLIENT_ID, // Firefox Desktop
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'sync',
});

export const vpnDesktopOAuthQueryParamsNoScope = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: FF_OAUTH_CLIENT_ID, // Firefox Desktop (allowed for service=vpn)
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'vpn',
});

export const smartWindowDesktopOAuthQueryParamsNoScope = new URLSearchParams({
  ...Object.fromEntries(oauthWebchannelV1.entries()),
  client_id: FF_OAUTH_CLIENT_ID, // Firefox Desktop
  code_challenge_method: 'S256',
  code_challenge: '2oc_C4v1qHeefWAGu5LI5oDG1oX4FV_Itc148D8_oQI',
  keys_jwk:
    'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6ImdUejVIWFJfa2pxSFRtMG43ZjhxcDMybVZFaHZ1cGo1dXNUV1h5TWZsb1kiLCJ5IjoiVER5TlhkalhibHZld1pWLVc5MXNDZU9fRWd0NU9WYXhpblBzOEFTQ3owZyJ9',
  state: 'fakestate',
  automatedBrowser: 'true',
  service: 'smartwindow',
});

export const syncDesktopV3QueryParams = new URLSearchParams({
  context: 'fx_desktop_v3',
  service: 'sync',
  action: 'email',
  automatedBrowser: 'true',
  forceUA: uaStrings['desktop_firefox_71'],
});
