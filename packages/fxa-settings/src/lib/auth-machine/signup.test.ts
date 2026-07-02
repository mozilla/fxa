/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { routeSignupCategory, SignupCategoryFacts } from './signup';

const noMatch: SignupCategoryFacts = {
  isSyncDesktopV3: false,
  isOAuth: false,
  wantsTwoStepAuthentication: false,
  isWeb: false,
  hasRedirectTo: false,
};

describe('routeSignupCategory', () => {
  it('returns sync-desktop-v3 when isSyncDesktopV3 is true', () => {
    expect(routeSignupCategory({ ...noMatch, isSyncDesktopV3: true })).toBe(
      'sync-desktop-v3'
    );
  });

  it('sync-desktop-v3 wins over oauth when both are true', () => {
    expect(
      routeSignupCategory({
        ...noMatch,
        isSyncDesktopV3: true,
        isOAuth: true,
        wantsTwoStepAuthentication: true,
      })
    ).toBe('sync-desktop-v3');
  });

  it('returns oauth-totp-setup when isOAuth is true and wantsTwoStepAuthentication is true', () => {
    expect(
      routeSignupCategory({
        ...noMatch,
        isOAuth: true,
        wantsTwoStepAuthentication: true,
      })
    ).toBe('oauth-totp-setup');
  });

  it('returns oauth-resolve when isOAuth is true and wantsTwoStepAuthentication is false', () => {
    expect(routeSignupCategory({ ...noMatch, isOAuth: true })).toBe(
      'oauth-resolve'
    );
  });

  it('returns web-redirect when isWeb is true and hasRedirectTo is true', () => {
    expect(
      routeSignupCategory({ ...noMatch, isWeb: true, hasRedirectTo: true })
    ).toBe('web-redirect');
  });

  it('returns web-settings when isWeb is true and hasRedirectTo is false', () => {
    expect(routeSignupCategory({ ...noMatch, isWeb: true })).toBe(
      'web-settings'
    );
  });

  it('returns none when no integration type flag is true', () => {
    expect(routeSignupCategory(noMatch)).toBe('none');
  });

  it('oauth wins over web when both isOAuth and isWeb are true', () => {
    expect(
      routeSignupCategory({
        ...noMatch,
        isOAuth: true,
        isWeb: true,
        hasRedirectTo: true,
      })
    ).toBe('oauth-resolve');
  });
});
