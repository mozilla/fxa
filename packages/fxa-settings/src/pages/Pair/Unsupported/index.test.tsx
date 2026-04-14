/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { MOCK_ERROR } from './mock';
import PairUnsupported, { viewName } from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    cadRedirectDesktop: {
      view: jest.fn(),
      defaultView: jest.fn(),
      download: jest.fn(),
    },
    cadRedirectMobile: { view: jest.fn() },
    cadMobilePairUseApp: { view: jest.fn() },
  },
}));

/**
 * Spoof the user agent and URL hash for one test. Returns a cleanup function
 * so tests can restore the defaults after asserting.
 *
 * JSDOM's default navigator.userAgent is a desktop non-Firefox string, so
 * the "default" PairUnsupported test (no spoof) hits the desktop non-Firefox
 * branch. Every other branch needs an explicit UA override.
 */
function spoofUserAgent(ua: string, hash = '') {
  const originalUa = Object.getOwnPropertyDescriptor(
    window.navigator,
    'userAgent'
  );
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    get: () => ua,
  });
  const originalHash = window.location.hash;
  window.history.replaceState(null, '', window.location.pathname + hash);
  return () => {
    if (originalUa) {
      Object.defineProperty(window.navigator, 'userAgent', originalUa);
    }
    window.history.replaceState(
      null,
      '',
      window.location.pathname + originalHash
    );
  };
}

const UA_FIREFOX_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0';
const UA_FIREFOX_ANDROID =
  'Mozilla/5.0 (Android 13; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0';
const UA_CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
const UA_SAFARI_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

describe('PairUnsupported', () => {
  describe('desktop non-Firefox (default UA)', () => {
    it('renders the "Oops! not using Firefox" heading and Download CTA', () => {
      renderWithLocalizationProvider(<PairUnsupported />);

      const headingEl = screen.getByRole('heading', { level: 2 });
      expect(headingEl).toHaveTextContent(
        'Oops! It looks like you’re not using Firefox.'
      );
      expect(
        screen.getByText(
          'Switch to Firefox and open this page to connect another device.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Download Firefox/i })
      ).toHaveAttribute(
        'href',
        expect.stringMatching(/mozilla\.org\/firefox\/new/)
      );
    });

    it('renders errors as expected', () => {
      renderWithLocalizationProvider(<PairUnsupported error={MOCK_ERROR} />);
      expect(screen.getByText(MOCK_ERROR)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Oops! It looks like you’re not using Firefox.'
      );
    });

    it('emits expected page view metric on render', () => {
      renderWithLocalizationProvider(<PairUnsupported />);
      expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    });
  });

  describe('mobile Firefox without system camera URL', () => {
    it('shows "Connecting your mobile device" instructions + Learn more link, no orange banner', () => {
      const restore = spoofUserAgent(UA_FIREFOX_ANDROID);
      try {
        renderWithLocalizationProvider(<PairUnsupported />);

        expect(
          screen.getByRole('heading', {
            level: 1,
            name: 'Connecting your mobile device with your Mozilla account',
          })
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Open Firefox on your computer, visit/)
        ).toBeInTheDocument();
        expect(screen.getByText('firefox.com/pair')).toBeInTheDocument();
        expect(
          screen.getByRole('link', { name: /Learn more/i })
        ).toHaveAttribute(
          'href',
          'https://support.mozilla.org/kb/how-do-i-set-sync-my-computer'
        );

        // No orange "Oops! not using Firefox" banner when user IS on Firefox.
        expect(
          screen.queryByText(/Oops! It looks like you’re not using/)
        ).not.toBeInTheDocument();
      } finally {
        restore();
      }
    });
  });

  describe('mobile non-Firefox without system camera URL', () => {
    it('shows the orange "Oops!" banner with Download link AND the Connecting instructions', () => {
      const restore = spoofUserAgent(UA_CHROME_ANDROID);
      try {
        renderWithLocalizationProvider(<PairUnsupported />);

        // Orange banner: the "Oops!" copy + Download link
        expect(
          screen.getByText(/Oops! It looks like you’re not using Firefox\./)
        ).toBeInTheDocument();
        const downloadLink = screen.getByRole('link', {
          name: /Download Firefox now/i,
        });
        expect(downloadLink).toHaveAttribute(
          'href',
          'https://play.google.com/store/apps/details?id=org.mozilla.firefox'
        );

        // Instructional content shown below the banner.
        expect(
          screen.getByRole('heading', {
            level: 1,
            name: 'Connecting your mobile device with your Mozilla account',
          })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('link', { name: /Learn more/i })
        ).toBeInTheDocument();
      } finally {
        restore();
      }
    });

    it('uses the iOS App Store download link on iOS Safari', () => {
      const restore = spoofUserAgent(UA_SAFARI_IOS);
      try {
        renderWithLocalizationProvider(<PairUnsupported />);
        const downloadLink = screen.getByRole('link', {
          name: /Download Firefox now/i,
        });
        expect(downloadLink).toHaveAttribute(
          'href',
          'https://apps.apple.com/app/firefox-private-safe-browser/id989804926'
        );
      } finally {
        restore();
      }
    });
  });

  describe('mobile with system camera URL', () => {
    it('shows "Pair using an app" heading and camera warning', () => {
      const restore = spoofUserAgent(
        UA_CHROME_ANDROID,
        '#channel_id=abc&channel_key=def'
      );
      try {
        renderWithLocalizationProvider(<PairUnsupported />);

        expect(
          screen.getByRole('heading', { name: 'Pair using an app' })
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Did you use the system camera\?/)
        ).toBeInTheDocument();
        // Instructional content should NOT render for the system-camera branch.
        expect(
          screen.queryByText(
            'Connecting your mobile device with your Mozilla account'
          )
        ).not.toBeInTheDocument();
      } finally {
        restore();
      }
    });
  });

  describe('desktop Firefox fallback', () => {
    it('shows "Oops! Something went wrong" and "Please close this tab" copy', () => {
      const restore = spoofUserAgent(UA_FIREFOX_DESKTOP);
      try {
        renderWithLocalizationProvider(<PairUnsupported />);

        expect(
          screen.getByRole('heading', { name: 'Oops! Something went wrong.' })
        ).toBeInTheDocument();
        expect(
          screen.getByText('Please close this tab and try again.')
        ).toBeInTheDocument();
        // The system-camera and mobile-instructions copy must NOT appear.
        expect(
          screen.queryByText(/Did you use the system camera/)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/Connecting your mobile device/)
        ).not.toBeInTheDocument();
      } finally {
        restore();
      }
    });
  });
});
