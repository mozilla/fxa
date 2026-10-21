/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ServerError from '.';

describe('ServerError', () => {
  it('renders the error copy and a Home link', () => {
    renderWithLocalizationProvider(<ServerError />);
    expect(
      screen.getByRole('heading', { name: '500 Error' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Oh dear, something went wrong there. We’ve been notified and will get working on a fix.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
