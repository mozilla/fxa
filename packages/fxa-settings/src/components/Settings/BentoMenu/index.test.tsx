/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import BentoMenu from '.';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';

describe('BentoMenu', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
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
});
