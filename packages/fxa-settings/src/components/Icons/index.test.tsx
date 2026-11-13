/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Temporary while the Nova theme ships behind novaDesignSystem; removed with the flag.

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { CheckmarkGreenIcon } from '.';

// The jest SVG stub renders the file name, which identifies the asset.
describe('Icons under the Nova theme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('renders the legacy icon by default', () => {
    renderWithLocalizationProvider(
      <CheckmarkGreenIcon mode="check" className="mt-1" />
    );
    const icon = screen.getByRole('img');
    expect(icon).toHaveTextContent('icon_checkmark_green.min.svg');
    expect(icon).toHaveClass('mt-1');
    expect(icon).not.toHaveClass('nova:text-icon-success');
  });

  it('renders the acorn icon with its status color under Nova', () => {
    document.documentElement.dataset.theme = 'nova';
    renderWithLocalizationProvider(
      <CheckmarkGreenIcon mode="check" className="mt-1" />
    );
    const icon = screen.getByRole('img');
    expect(icon).toHaveTextContent('checkmark.min.svg');
    expect(icon).toHaveClass('mt-1', 'nova:text-icon-success');
  });
});
