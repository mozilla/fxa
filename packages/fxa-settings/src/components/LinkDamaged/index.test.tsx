/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LinkDamaged from '.';

describe('LinkDamaged', () => {
  it('renders the component as expected for a damaged Reset Password link', () => {
    render(<LinkDamaged linkType="reset-password" />);

    screen.getByRole('heading', {
      name: 'Reset password link damaged',
    });
    screen.getByText(
      'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
    );
  });

  it('renders the component as expected for a damaged signin link', () => {
    render(<LinkDamaged linkType="signin" />);

    screen.getByRole('heading', {
      name: 'Confirmation link damaged',
    });
    screen.getByText(
      'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
    );
  });
});
