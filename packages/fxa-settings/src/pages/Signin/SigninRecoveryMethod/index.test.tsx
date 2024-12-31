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

describe('SigninRecoveryMethod', () => {
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
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Recovery phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/4 codes remaining/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Authentication codes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/••••••3019/i)).toBeInTheDocument();
  });
});
