/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { PageSecondaryEmailVerify } from '.';
import { WindowLocation } from '@reach/router';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import { SettingsContext } from '../../../models/contexts/SettingsContext';

const mockLocation = {
  state: { email: 'johndope@example.com' },
} as unknown as WindowLocation;

const account = {
  verifySecondaryEmail: jest.fn().mockResolvedValue(true),
} as unknown as Account;

window.console.error = jest.fn();

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

describe('PageSecondaryEmailVerify', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageSecondaryEmailVerify location={mockLocation} />
      </AppContext.Provider>
    );

    expect(
      screen.getByTestId('secondary-email-verify-form')
    ).toBeInTheDocument();
  });

  it('renders error messages', async () => {
    const error: any = new Error();
    error.errno = AuthUiErrors.INVALID_VERIFICATION_CODE.errno;
    const account = {
      verifySecondaryEmail: jest.fn().mockRejectedValue(error),
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageSecondaryEmailVerify location={mockLocation} />
      </AppContext.Provider>
    );

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '666666' },
      });
    });

    await act(async () =>
      screen.getByTestId('secondary-email-verify-submit').click()
    );

    expect(screen.getByTestId('tooltip').textContent).toContain(
      AuthUiErrors.INVALID_VERIFICATION_CODE.message
    );
  });

  it('navigates to settings and shows a message on success', async () => {
    const alertBarInfo = {
      success: jest.fn(),
    } as any;
    const settingsContext = mockSettingsContext({ alertBarInfo });
    const { history } = renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={settingsContext}>
          <PageSecondaryEmailVerify location={mockLocation} />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '123456' },
      });
    });

    await act(async () =>
      screen.getByTestId('secondary-email-verify-submit').click()
    );

    expect(history.location.pathname).toEqual('/settings#secondary-email');
    expect(alertBarInfo.success).toHaveBeenCalledTimes(1);
    expect(alertBarInfo.success).toHaveBeenCalledWith(
      'johndope@example.com successfully added'
    );
  });
});
