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

    expect(toggleButton).toHaveAttribute('title', 'bento-menu-title');
    expect(toggleButton).toHaveAttribute('aria-controls', dropDownId);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(dropDown).not.toBeInTheDocument;

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(dropDown).toBeInTheDocument;

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
