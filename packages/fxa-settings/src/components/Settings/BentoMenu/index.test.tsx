/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import BentoMenu from '.';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import GleanMetrics from '../../../lib/glean';
import userEvent from '@testing-library/user-event';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      bentoView: jest.fn(),
      bentoFirefoxDesktop: jest.fn(),
      bentoFirefoxMobile: jest.fn(),
      bentoMonitor: jest.fn(),
      bentoPocket: jest.fn(),
      bentoRelay: jest.fn(),
      bentoVpn: jest.fn(),
    },
  },
}));

describe('BentoMenu', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const dropDownId = 'drop-down-bento-menu';

  it('renders and toggles as expected with default values', () => {
    renderWithLocalizationProvider(<BentoMenu />);

    const toggleButton = screen.getByTestId('drop-down-bento-menu-toggle');

    expect(toggleButton).toHaveAttribute('title', 'Mozilla products');
    expect(toggleButton).toHaveAttribute('aria-label', 'Mozilla products');
    expect(toggleButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    testAllL10n(screen, bundle);

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  it('renders the expected product links', () => {
    renderWithLocalizationProvider(<BentoMenu />);

    fireEvent.click(screen.getByTestId('drop-down-bento-menu-toggle'));
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Firefox Browser for Desktop/ })
    ).toHaveAttribute(
      'href',
      'https://www.mozilla.org/firefox/new/?utm_source=moz-account&utm_medium=mozilla-websites&utm_term=bento&utm_content=fx-desktop&utm_campaign=permanent'
    );
    expect(
      screen.getByRole('link', { name: /Firefox Browser for Mobile/ })
    ).toHaveAttribute(
      'href',
      'https://www.mozilla.org/firefox/mobile/?utm_source=moz-account&utm_medium=mozilla-websites&utm_term=bento&utm_content=fx-mobile&utm_campaign=permanent'
    );
    expect(
      screen.getByRole('link', { name: /Mozilla Monitor/ })
    ).toHaveAttribute(
      'href',
      'https://monitor.mozilla.org/?utm_source=moz-account&utm_medium=mozilla-websites&utm_term=bento&utm_content=monitor&utm_campaign=permanent'
    );
    expect(screen.getByRole('link', { name: /Pocket/ })).toHaveAttribute(
      'href',
      'https://app.adjust.com/hr2n0yz?redirect_macos=https%3A%2F%2Fgetpocket.com%2Fpocket-and-firefox&redirect_windows=https%3A%2F%2Fgetpocket.com%2Fpocket-and-firefox&engagement_type=fallback_click&fallback=https%3A%2F%2Fgetpocket.com%2Ffirefox_learnmore%3Fsrc%3Dff_bento&fallback_lp=https%3A%2F%2Fapps.apple.com%2Fapp%2Fpocket-save-read-grow%2Fid309601447'
    );
    expect(screen.getByRole('link', { name: /Firefox Relay/ })).toHaveAttribute(
      'href',
      'https://relay.firefox.com/?utm_source=moz-account&utm_medium=mozilla-websites&utm_term=bento&utm_content=relay&utm_campaign=permanent'
    );
    expect(screen.getByRole('link', { name: /Mozilla VPN/ })).toHaveAttribute(
      'href',
      'https://vpn.mozilla.org/?utm_source=moz-account&utm_medium=mozilla-websites&utm_term=bento&utm_content=vpn&utm_campaign=permanent'
    );
  });

  it('closes on esc keypress', () => {
    renderWithLocalizationProvider(<BentoMenu />);

    fireEvent.click(screen.getByTestId('drop-down-bento-menu-toggle'));
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  it('closes on click outside', () => {
    const { container } = renderWithLocalizationProvider(
      <div className="w-full flex justify-end">
        <div className="flex pr-10 pt-4">
          <BentoMenu />
        </div>
      </div>
    );

    fireEvent.click(screen.getByTestId('drop-down-bento-menu-toggle'));
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    fireEvent.click(container);
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  describe('metrics', () => {
    it('logs metrics event for Bento view', async () => {
      renderWithLocalizationProvider(<BentoMenu />);

      userEvent.click(screen.getByRole('button', { name: /Mozilla products/ }));
      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /Firefox Browser for Desktop/ })
        ).toBeVisible();
        expect(GleanMetrics.accountPref.bentoView).toBeCalledTimes(1);
      });
    });

    it('logs metrics event for Firefox Desktop link click', async () => {
      renderWithLocalizationProvider(<BentoMenu />);

      userEvent.click(screen.getByRole('button', { name: /Mozilla products/ }));
      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /Firefox Browser for Desktop/ })
        ).toBeVisible();
      });
      userEvent.click(
        screen.getByRole('link', { name: /Firefox Browser for Desktop/ })
      );
      await waitFor(() => {
        expect(GleanMetrics.accountPref.bentoFirefoxDesktop).toBeCalledTimes(1);
      });
    });

    it('logs metrics event for Firefox Mobile link click', async () => {
      renderWithLocalizationProvider(<BentoMenu />);

      userEvent.click(screen.getByRole('button', { name: /Mozilla products/ }));
      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /Firefox Browser for Mobile/ })
        ).toBeVisible();
      });
      userEvent.click(
        screen.getByRole('link', { name: /Firefox Browser for Mobile/ })
      );
      await waitFor(() => {
        expect(GleanMetrics.accountPref.bentoFirefoxMobile).toBeCalledTimes(1);
      });
    });

    it('logs metrics event for Monitor link click', async () => {
      renderWithLocalizationProvider(<BentoMenu />);

      userEvent.click(screen.getByRole('button', { name: /Mozilla products/ }));
      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /Mozilla Monitor/ })
        ).toBeVisible();
      });
      userEvent.click(screen.getByRole('link', { name: /Mozilla Monitor/ }));
      await waitFor(() => {
        expect(GleanMetrics.accountPref.bentoMonitor).toBeCalledTimes(1);
      });
    });

    it('logs metrics event for Pocket link click', async () => {
      renderWithLocalizationProvider(<BentoMenu />);

      userEvent.click(screen.getByRole('button', { name: /Mozilla products/ }));
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Pocket/ })).toBeVisible();
      });
      userEvent.click(screen.getByRole('link', { name: /Pocket/ }));
      await waitFor(() => {
        expect(GleanMetrics.accountPref.bentoPocket).toBeCalledTimes(1);
      });
    });

    it('logs metrics event for Firefox Relay link click', async () => {
      renderWithLocalizationProvider(<BentoMenu />);

      userEvent.click(screen.getByRole('button', { name: /Mozilla products/ }));
      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /Firefox Relay/ })
        ).toBeVisible();
      });
      userEvent.click(screen.getByRole('link', { name: /Firefox Relay/ }));
      await waitFor(() => {
        expect(GleanMetrics.accountPref.bentoRelay).toBeCalledTimes(1);
      });
    });

    it('logs metrics event for Mozilla VPN link click', async () => {
      renderWithLocalizationProvider(<BentoMenu />);

      userEvent.click(screen.getByRole('button', { name: /Mozilla products/ }));
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Mozilla VPN/ })).toBeVisible();
      });
      userEvent.click(screen.getByRole('link', { name: /Mozilla VPN/ }));
      await waitFor(() => {
        expect(GleanMetrics.accountPref.bentoVpn).toBeCalledTimes(1);
      });
    });
  });
});
