/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import BentoMenu from '.';

describe('BentoMenu', () => {
  it('renders and toggles as expected with default values', () => {
    render(<BentoMenu />);

    const toggleButton = screen.getByTestId('drop-down-bento-menu-toggle');
    const dropDownId = 'drop-down-bento-menu';
    const dropDown = screen.queryByTestId(dropDownId);

    expect(toggleButton).toHaveAttribute('title', 'Firefox Bento Menu');
    expect(toggleButton).toHaveAttribute('aria-controls', dropDownId);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(dropDown).not.toBeInTheDocument;

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(dropDown).toBeInTheDocument;

    expect(screen.getByTestId('monitor-link')).toHaveAttribute(
      'href',
      'https://monitor.firefox.com'
    );
    expect(screen.getByTestId('pocket-link')).toHaveAttribute(
      'href',
      'https://app.adjust.com/hr2n0yz?engagement_type=fallback_click&fallback=https%3A%2F%2Fgetpocket.com%2Ffirefox_learnmore%3Fsrc%3Dff_bento&fallback_lp=https%3A%2F%2Fapps.apple.com%2Fapp%2Fpocket-save-read-grow%2Fid309601447'
    );
    expect(screen.getByTestId('desktop-link')).toHaveAttribute(
      'href',
      'https://www.mozilla.org/firefox/new/?utm_source=${referringSiteURL}&utm_medium=referral&utm_campaign=bento&utm_content=desktop'
    );

    expect(screen.getByTestId('mobile-link')).toHaveAttribute(
      'href',
      'http://mozilla.org/firefox/mobile?utm_source=${referringSiteURL}&utm_medium=referral&utm_campaign=bento&utm_content=desktop'
    );
    expect(screen.getByTestId('lockwise-link')).toHaveAttribute(
      'href',
      'https://bhqf.adj.st/?adjust_t=6tteyjo&adj_deeplink=lockwise%3A%2F%2F&adj_fallback=https%3A%2F%2Fwww.mozilla.org%2Fen-US%2Ffirefox%2Flockwise'
    );
    expect(screen.getByTestId('mozilla-link')).toHaveAttribute(
      'href',
      'https://www.mozilla.org/'
    );

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(dropDown).not.toBeInTheDocument;
  });

  it('closes on esc keypress', () => {
    render(<BentoMenu />);
    const dropDown = screen.queryByTestId('drop-down-bento-menu');

    fireEvent.click(screen.getByTestId('drop-down-bento-menu-toggle'));
    expect(dropDown).toBeInTheDocument;
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(dropDown).not.toBeInTheDocument;
  });

  it('closes on click outside', () => {
    const { container } = render(
      <div className="w-full flex justify-end">
        <div className="flex pr-10 pt-4">
          <BentoMenu />
        </div>
      </div>
    );
    const dropDown = screen.queryByTestId('drop-down-bento-menu');

    fireEvent.click(screen.getByTestId('drop-down-bento-menu-toggle'));
    expect(dropDown).toBeInTheDocument;
    fireEvent.click(container);
    expect(dropDown).not.toBeInTheDocument;
  });
});
