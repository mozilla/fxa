/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BentoMenu from '.';

describe('BentoMenu', () => {
  const dropDownId = 'drop-down-bento-menu';

  it('renders and toggles as expected with default values', () => {
    render(<BentoMenu />);

    const toggleButton = screen.getByTestId('drop-down-bento-menu-toggle');

    expect(toggleButton).toHaveAttribute('title', 'Firefox Bento Menu');
    expect(toggleButton).toHaveAttribute('aria-label', 'Firefox Bento Menu');
    expect(toggleButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  it('closes on esc keypress', () => {
    render(<BentoMenu />);

    fireEvent.click(screen.getByTestId('drop-down-bento-menu-toggle'));
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  it('closes on click outside', () => {
    const { container } = render(
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
