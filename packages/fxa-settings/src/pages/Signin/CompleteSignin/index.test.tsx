/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import CompleteSignin from '.';

async function render(errorMessage?: string) {
  renderWithLocalizationProvider(
    <LocationProvider>
      <CompleteSignin {...{ errorMessage }} />
    </LocationProvider>
  );
}

describe('CompleteSignin', () => {
  it('renders as expected with no props', async () => {
    render();

    expect(screen.getByText('Validating sign-in…')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Loading…' })).toBeInTheDocument();
  });

  it('renders as expected with an errorMessage prop', async () => {
    render('Something broke');
    screen.getByRole('heading', { name: 'Confirmation error' });
  });
});
