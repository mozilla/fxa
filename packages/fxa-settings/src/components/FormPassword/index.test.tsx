/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { typeByTestIdFn } from '../../lib/test-utils';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

export const inputNewPassword = typeByTestIdFn('new-password-input-field');
export const inputVerifyPassword = typeByTestIdFn(
  'verify-password-input-field'
);
export const inputCurrentPassword = typeByTestIdFn(
  'current-password-input-field'
);

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('with current password field', () => {
  it('renders current password field as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    screen.getByLabelText('Enter current password');
  });

  it('shows validation feedback', async () => {
    renderWithLocalizationProvider(<Subject />);
    await inputNewPassword('password');
    expect(screen.getByTestId('change-password-common')).toContainElement(
      screen.getByTestId('icon-invalid')
    );
  });

  it('disables save until the form is valid', async () => {
    renderWithLocalizationProvider(<Subject />);
    expect(screen.getByTestId('save-password-button')).toBeDisabled();
    await inputCurrentPassword('quuz');
    expect(screen.getByTestId('save-password-button')).toBeDisabled();
    await inputNewPassword('testotesto');
    expect(screen.getByTestId('save-password-button')).toBeDisabled();
    await inputVerifyPassword('testotesto');
    expect(screen.getByTestId('save-password-button')).toBeEnabled();
    await inputNewPassword('testotest0');
    expect(screen.getByTestId('save-password-button')).toBeDisabled();
  });
});

describe('without current password field', () => {
  it('does not render current password field', () => {
    renderWithLocalizationProvider(<Subject includeCurrentPw={false} />);
    const currentPw = screen.queryByLabelText('Enter current password');
    expect(currentPw).not.toBeInTheDocument();
  });

  it('shows validation feedback', async () => {
    renderWithLocalizationProvider(<Subject includeCurrentPw={false} />);
    await inputNewPassword('password');
    expect(screen.getByTestId('change-password-common')).toContainElement(
      screen.getByTestId('icon-invalid')
    );
  });

  it('disables save until the form is valid', async () => {
    renderWithLocalizationProvider(<Subject includeCurrentPw={false} />);
    expect(screen.getByTestId('save-password-button')).toBeDisabled();
    await inputNewPassword('testotesto');
    expect(screen.getByTestId('save-password-button')).toBeDisabled();
    await inputVerifyPassword('testotesto');
    expect(screen.getByTestId('save-password-button')).toBeEnabled();
    await inputNewPassword('testotest0');
    expect(screen.getByTestId('save-password-button')).toBeDisabled();
  });
});
