/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Footer from '.';

describe('Footer', () => {
  it('renders as expected', () => {
    render(<Footer />);

    const linkMozilla = screen.getByTestId('link-mozilla');

    expect(linkMozilla).toHaveAttribute(
      'href',
      'https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral'
    );
    expect(linkMozilla.firstElementChild).toHaveAttribute('role', 'img');
    expect(linkMozilla.firstElementChild).toHaveAttribute(
      'aria-label',
      'Mozilla logo'
    );
    expect(screen.getByTestId('link-privacy')).toHaveAttribute(
      'href',
      'https://www.mozilla.org/en-US/privacy/websites/'
    );
    expect(screen.getByTestId('link-terms')).toHaveAttribute(
      'href',
      'https://www.mozilla.org/en-US/about/legal/terms/services/'
    );
  });
});
