/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Devices } from '../utilities';
import {
  getFirefoxMajorVersion,
  getPairingPlatform,
  isPairingV2Enabled,
  isPairingV2RolledOut,
} from './v2-gate';

const FIREFOX_DESKTOP_147 =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) ' +
  'Gecko/20100101 Firefox/147.0';
const FIREFOX_ANDROID_147 =
  'Mozilla/5.0 (Android 14; Mobile; rv:147.0) Gecko/147.0 Firefox/147.0';
const FIREFOX_IOS_147 =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/147.0 Mobile/15E148 ' +
  'Safari/605.1.15';
const CHROME_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

describe('getPairingPlatform', () => {
  it.each([
    [Devices.FIREFOX_DESKTOP, 'desktop'],
    [Devices.FIREFOX_ANDROID, 'android'],
    [Devices.FIREFOX_IOS, 'ios'],
  ])('maps %s to %s', (device, platform) => {
    expect(getPairingPlatform(device)).toBe(platform);
  });

  it.each([Devices.OTHER_ANDROID, Devices.OTHER_IOS, Devices.OTHER])(
    'has no platform for %s',
    (device) => {
      expect(getPairingPlatform(device)).toBeUndefined();
    }
  );
});

describe('getFirefoxMajorVersion', () => {
  it('reads the Firefox token on desktop', () => {
    expect(getFirefoxMajorVersion(FIREFOX_DESKTOP_147, 'desktop')).toBe(147);
  });

  it('reads the Firefox token on Android', () => {
    expect(getFirefoxMajorVersion(FIREFOX_ANDROID_147, 'android')).toBe(147);
  });

  it('reads the FxiOS token on iOS', () => {
    expect(getFirefoxMajorVersion(FIREFOX_IOS_147, 'ios')).toBe(147);
  });

  it('only accepts the FxiOS token for iOS', () => {
    expect(getFirefoxMajorVersion(FIREFOX_DESKTOP_147, 'ios')).toBeUndefined();
  });

  it('only accepts the Firefox token off iOS', () => {
    expect(getFirefoxMajorVersion(FIREFOX_IOS_147, 'desktop')).toBeUndefined();
  });

  it('is undefined for a browser that is not Firefox', () => {
    expect(getFirefoxMajorVersion(CHROME_DESKTOP, 'desktop')).toBeUndefined();
  });
});

describe('isPairingV2RolledOut', () => {
  it('is true once the platform has a minimum, zero included', () => {
    expect(
      isPairingV2RolledOut({ version: 2, v2MinVersion: { ios: 0 } }, 'ios')
    ).toBe(true);
    expect(
      isPairingV2RolledOut({ version: 2, v2MinVersion: { ios: 148 } }, 'ios')
    ).toBe(true);
  });

  it('is false for a platform without a minimum', () => {
    expect(isPairingV2RolledOut({ version: 2 }, 'ios')).toBe(false);
    expect(
      isPairingV2RolledOut(
        { version: 2, v2MinVersion: { android: 0, desktop: 0 } },
        'ios'
      )
    ).toBe(false);
  });

  it('is false while the deployment is on pairing version 1', () => {
    expect(
      isPairingV2RolledOut({ version: 1, v2MinVersion: { ios: 0 } }, 'ios')
    ).toBe(false);
  });

  it('treats a minimum that is not a finite number as unset', () => {
    expect(
      isPairingV2RolledOut(
        { version: 2, v2MinVersion: { ios: null as unknown as number } },
        'ios'
      )
    ).toBe(false);
  });
});

describe('isPairingV2Enabled', () => {
  const desktop = (
    pairing: Parameters<typeof isPairingV2Enabled>[0]['pairing'],
    browserPairingVersion?: number,
    userAgent = FIREFOX_DESKTOP_147
  ) =>
    isPairingV2Enabled({
      pairing,
      device: Devices.FIREFOX_DESKTOP,
      userAgent,
      browserPairingVersion,
    });

  it('is off while the deployment is on pairing version 1', () => {
    expect(desktop({ version: 1, v2MinVersion: { desktop: 100 } }, 2)).toBe(
      false
    );
  });

  describe('with a minimum for the platform', () => {
    const pairing = { version: 2, v2MinVersion: { desktop: 147 } };

    it('is on at the minimum when the browser reports v2', () => {
      expect(desktop(pairing, 2)).toBe(true);
    });

    it('is off at the minimum when the browser reports v1 or nothing yet', () => {
      expect(desktop(pairing, 1)).toBe(false);
      expect(desktop(pairing, undefined)).toBe(false);
    });

    it('is on above the minimum', () => {
      expect(
        desktop(pairing, 2, FIREFOX_DESKTOP_147.replace(/147/g, '148'))
      ).toBe(true);
    });

    it('is off below the minimum, even when the browser reports v2', () => {
      expect(
        desktop(pairing, 2, FIREFOX_DESKTOP_147.replace(/147/g, '146'))
      ).toBe(false);
    });

    it('is off when the user agent carries no version to compare', () => {
      expect(desktop(pairing, 2, CHROME_DESKTOP)).toBe(false);
    });

    it('reads the minimum for the browser platform only', () => {
      expect(
        isPairingV2Enabled({
          pairing: { version: 2, v2MinVersion: { ios: 147, android: 147 } },
          device: Devices.FIREFOX_IOS,
          userAgent: FIREFOX_IOS_147,
          browserPairingVersion: 2,
        })
      ).toBe(true);
      expect(
        isPairingV2Enabled({
          pairing: { version: 2, v2MinVersion: { ios: 148, android: 147 } },
          device: Devices.FIREFOX_ANDROID,
          userAgent: FIREFOX_ANDROID_147,
          browserPairingVersion: 2,
        })
      ).toBe(true);
    });

    it('lets zero admit every version of the platform that reports v2', () => {
      expect(desktop({ version: 2, v2MinVersion: { desktop: 0 } }, 2)).toBe(
        true
      );
      expect(desktop({ version: 2, v2MinVersion: { desktop: 0 } }, 1)).toBe(
        false
      );
    });
  });

  describe('without a minimum for the platform', () => {
    it('goes on the version the browser reports', () => {
      expect(desktop({ version: 2 }, 2)).toBe(true);
      expect(desktop({ version: 2 }, 1)).toBe(false);
      expect(desktop({ version: 2 }, undefined)).toBe(false);
    });

    it('ignores minimums set for other platforms', () => {
      const pairing = { version: 2, v2MinVersion: { ios: 0, android: 0 } };
      expect(desktop(pairing, 1)).toBe(false);
      expect(desktop(pairing, 2)).toBe(true);
    });

    it('treats a minimum that is not a finite number as unset', () => {
      expect(desktop({ version: 2, v2MinVersion: { desktop: NaN } }, 2)).toBe(
        true
      );
      expect(
        desktop(
          {
            version: 2,
            v2MinVersion: { desktop: null as unknown as number },
          },
          1
        )
      ).toBe(false);
    });

    it('goes on the browser report for a browser that is not Firefox, whatever is configured', () => {
      const pairing = {
        version: 2,
        v2MinVersion: { ios: 0, android: 0, desktop: 0 },
      };
      expect(
        isPairingV2Enabled({
          pairing,
          device: Devices.OTHER_IOS,
          userAgent: CHROME_DESKTOP,
          browserPairingVersion: 1,
        })
      ).toBe(false);
      expect(
        isPairingV2Enabled({
          pairing,
          device: Devices.OTHER_IOS,
          userAgent: CHROME_DESKTOP,
          browserPairingVersion: 2,
        })
      ).toBe(true);
    });
  });
});
