/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormChoice from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, within } from '@testing-library/react';
import SigninRecoveryMethod from '.';

function render() {
  renderWithLocalizationProvider(<SigninRecoveryMethod />);
}

describe('FormChoice', () => {
  it('renders as expected', () => {
    render();

    expect(
      screen.getByRole('heading', { name: 'Sign in', level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Choose a recovery method',
        level: 2,
      })
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('group').querySelector('legend') as HTMLLegendElement
      ).getByText('Choose a recovery method')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Let’s make sure it’s you using your recovery methods.')
    );
    expect(screen.getByLabelText(/Recovery phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/4 of 5 available/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Authentication codes/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Your number ending with 3019/i)
    ).toBeInTheDocument();
  });
});
