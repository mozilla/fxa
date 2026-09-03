/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Constants } from '../../../../lib/constants';
import { HANDOFF_ATTEMPT_KEY_PREFIX } from '../../../../lib/pairing/handoff';
import * as utilities from '../../../../lib/utilities';
import { Devices } from '../../../../lib/utilities';
import { buildPairUrl } from '../../../../lib/pairing/pair-url';
import { DownloadFirefoxContainer } from './container';
import { MOCK_CHANNEL } from './mocks';

// The container derives the target from the live origin, and the anti-loop
// token is keyed on that exact string — so the key has to be built the same
// way here rather than from a fixed-origin fixture.
const LOCAL_TARGET = buildPairUrl(MOCK_CHANNEL);

let mockLocationState: unknown = null;
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    pathname: '/pair/supplicant/download_firefox',
    search: '',
    hash: '',
    state: mockLocationState,
  }),
}));

jest.mock('../../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

const mockDownloadFirefoxView = jest.fn();
jest.mock('../../../../lib/glean', () => ({
  __esModule: true,
  default: {
    cadFireFox: {
      downloadFirefoxView: (...args: unknown[]) =>
        mockDownloadFirefoxView(...args),
    },
  },
}));

const getCtaHref = () =>
  screen
    .getByRole('link', { name: /Continue in Firefox|Opening Firefox/ })
    .getAttribute('href');

describe('Pair2/Supplicant/DownloadFirefox container', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
    window.sessionStorage.clear();
    // The container owns the real navigation sink and the Android plan hands
    // off on mount, so `assign` has to be stubbed — jsdom cannot navigate.
    // `origin` is preserved because the anti-loop token is keyed on a target
    // built from it.
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, assign: jest.fn() },
    });
    jest
      .spyOn(utilities, 'detectDevice')
      .mockReturnValue(Devices.OTHER_ANDROID);
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', originalLocation);
    jest.restoreAllMocks();
  });

  it('records the page view', () => {
    renderWithLocalizationProvider(<DownloadFirefoxContainer />);

    expect(mockDownloadFirefoxView).toHaveBeenCalledTimes(1);
  });

  describe('with a valid pairing channel in router state', () => {
    beforeEach(() => {
      mockLocationState = { ...MOCK_CHANNEL };
    });

    it('hands the CTA a deep link carrying the channel', () => {
      renderWithLocalizationProvider(<DownloadFirefoxContainer />);

      const href = getCtaHref();
      expect(href).toContain('channel_id=chan-1');
      expect(href).toContain('channel_key=key-1');
    });

    // The container must rebuild the plan against live storage rather than
    // trust a stale autoAttempt, or Back from the Play Store re-fires the
    // intent and bounces the user straight out again.
    it('reads autoAttempt from live storage rather than router state', () => {
      window.sessionStorage.setItem(
        `${HANDOFF_ATTEMPT_KEY_PREFIX}${LOCAL_TARGET}`,
        '1'
      );

      renderWithLocalizationProvider(<DownloadFirefoxContainer />);

      // Token already spent, so the CTA sits at rest instead of showing the
      // in-flight label an auto-attempt would have produced.
      expect(
        screen.getByRole('link', { name: 'Continue in Firefox' })
      ).toBeInTheDocument();
    });

    it('falls back to the download link on a device with no Firefox app', () => {
      jest
        .spyOn(utilities, 'detectDevice')
        .mockReturnValue(Devices.FIREFOX_DESKTOP);

      renderWithLocalizationProvider(<DownloadFirefoxContainer />);

      expect(getCtaHref()).toBe(Constants.FIREFOX_MOBILE_DOWNLOAD_URL);
    });
  });

  // Stripping the hash on navigation means a load can legitimately arrive with
  // no channel — a pasted link, a new tab, a history entry that lost its
  // state. That is a download page, not an error.
  describe('with no usable pairing channel', () => {
    it.each([
      ['no state', null],
      ['a non-object state', 'channel'],
      ['a v1 channel', { channelId: 'a', channelKey: 'b', version: '1' }],
      ['half a channel', { channelId: 'a', version: '2' }],
      [
        'a channel key that is not base64url',
        { channelId: 'a', channelKey: 'not;base64url', version: '2' },
      ],
    ])('falls back to the download link given %s', (_label, state) => {
      mockLocationState = state;

      renderWithLocalizationProvider(<DownloadFirefoxContainer />);

      expect(getCtaHref()).toBe(Constants.FIREFOX_MOBILE_DOWNLOAD_URL);
    });
  });
});
