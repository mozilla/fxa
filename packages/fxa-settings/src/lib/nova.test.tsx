/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Temporary while the Nova theme ships behind novaDesignSystem; removed with the flag.

import React from 'react';
import { render, screen } from '@testing-library/react';
import { isNovaTheme, withNova } from './nova';

const Legacy = () => <span>legacy</span>;
const Nova = () => <span>nova</span>;
const Swapped = withNova(Legacy, Nova);

describe('withNova', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('renders the legacy component without the Nova theme', () => {
    render(<Swapped />);
    expect(isNovaTheme()).toBe(false);
    expect(screen.getByText('legacy')).toBeInTheDocument();
  });

  it('renders the Nova component under data-theme="nova"', () => {
    document.documentElement.dataset.theme = 'nova';
    render(<Swapped />);
    expect(isNovaTheme()).toBe(true);
    expect(screen.getByText('nova')).toBeInTheDocument();
  });
});
