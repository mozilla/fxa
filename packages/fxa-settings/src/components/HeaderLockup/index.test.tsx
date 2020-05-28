/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import HeaderLockup from '.';

afterEach(cleanup);

// TO DO: functional test for `data-testid="header-menu"` to be visible in
// mobile & tablet but hidden at desktop

describe('HeaderLockup', () => {
  it('renders as expected', () => {
    const { getByTestId } = render(<HeaderLockup />);

    expect(getByTestId('header-sumo-link')).toHaveAttribute(
      'href',
      'https://support.mozilla.org'
    );
    expect(getByTestId('header-help')).toBeInTheDocument();
    expect(getByTestId('header-bento')).toBeInTheDocument();
    expect(getByTestId('header-avatar-default')).toBeInTheDocument();

    expect(getByTestId('header-menu')).toBeInTheDocument();
    expect(getByTestId('back-to-top')).toHaveAttribute('title', 'Back to top');
  });
});
