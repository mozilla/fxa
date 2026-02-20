/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import SigninPasskeyFallback from '.';

describe('SigninPasskeyFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', () => {
    const { container } = renderWithRouter(<SigninPasskeyFallback />);
    expect(container).toMatchSnapshot();
  });

  it('clears password error text on input change', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SigninPasskeyFallback />);
    const passwordInput = screen.getByLabelText('Password');

    await user.type(passwordInput, 'newpassword');

    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
  });
});
