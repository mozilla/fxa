/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getBannerState } from './bannerState';

describe('getBannerState', () => {
  it('returns firefox-pair on desktop Firefox signed into the browser', () => {
    expect(
      getBannerState({
        isFirefox: true,
        isMobile: false,
        isSignedIntoBrowser: true,
      })
    ).toBe('firefox-pair');
  });

  it('returns hidden on desktop Firefox not signed into the browser', () => {
    expect(
      getBannerState({
        isFirefox: true,
        isMobile: false,
        isSignedIntoBrowser: false,
      })
    ).toBe('hidden');
  });

  it('returns hidden on Firefox mobile signed into the browser (already has the app)', () => {
    expect(
      getBannerState({
        isFirefox: true,
        isMobile: true,
        isSignedIntoBrowser: true,
      })
    ).toBe('hidden');
  });

  it('returns hidden on Firefox mobile not signed into the browser', () => {
    expect(
      getBannerState({
        isFirefox: true,
        isMobile: true,
        isSignedIntoBrowser: false,
      })
    ).toBe('hidden');
  });

  it('returns switch-desktop on desktop non-Firefox regardless of sign-in', () => {
    expect(
      getBannerState({
        isFirefox: false,
        isMobile: false,
        isSignedIntoBrowser: false,
      })
    ).toBe('switch-desktop');
  });

  it('returns switch-mobile on mobile non-Firefox regardless of sign-in', () => {
    expect(
      getBannerState({
        isFirefox: false,
        isMobile: true,
        isSignedIntoBrowser: false,
      })
    ).toBe('switch-mobile');
  });
});
