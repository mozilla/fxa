/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { Account, AppContext } from '../../models';
import { PageRecoveryKeyAdd } from '.';
import * as Metrics from '../../lib/metrics';

jest.mock('base32-encode', () =>
  jest.fn().mockReturnValue('00000000000000000000000000000000')
);

const account = {
  primaryEmail: {
    email: 'johndope@example.com',
  },
  createRecoveryKey: jest.fn().mockResolvedValue(new Uint8Array(20)),
} as unknown as Account;

window.URL.createObjectURL = jest.fn();

describe('PageRecoveryKeyAdd', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageRecoveryKeyAdd />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('recovery-key-input').textContent).toContain(
      'Enter password'
    );
    expect(screen.getByTestId('cancel-button').textContent).toContain('Cancel');
    expect(screen.getByTestId('continue-button').textContent).toContain(
      'Continue'
    );
  });

  it('Enables "continue" button once input is valid', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageRecoveryKeyAdd />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('continue-button')).toBeDisabled();

    await act(async () => {
      const input = screen.getByTestId('input-field');
      await fireEvent.input(input, { target: { value: 'myFavPassword' } });
    });

    expect(screen.getByTestId('continue-button')).toBeEnabled();
  });

  it('Does not Enable "continue" button if validation fails', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageRecoveryKeyAdd />
      </AppContext.Provider>
    );

    await act(async () => {
      const input = screen.getByTestId('input-field');
      await fireEvent.input(input, { target: { value: '2short' } });
    });

    expect(screen.getByTestId('continue-button')).toBeDisabled();
  });

  it('Generates a recovery key on submit', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageRecoveryKeyAdd />
      </AppContext.Provider>
    );

    await act(async () => {
      const input = screen.getByTestId('input-field');
      await fireEvent.input(input, { target: { value: 'myFavPassword' } });
    });

    await act(async () => {
      await fireEvent.click(screen.getByTestId('continue-button'));
    });

    expect(screen.getByTestId('recover-key-confirm')).toBeVisible();
    expect(screen.getByTestId('datablock')).toHaveTextContent(
      '0000 0000 0000 0000 0000 0000 0000 0000'
    );
    expect(screen.getByTestId('databutton-copy')).toBeEnabled();
    expect(screen.getByTestId('close-button')).toBeEnabled();
  });

  describe('metrics', () => {
    let logViewEventSpy: jest.SpyInstance;
    let logPageViewEventSpy: jest.SpyInstance;

    beforeAll(() => {
      logViewEventSpy = jest
        .spyOn(Metrics, 'logViewEvent')
        .mockImplementation();
      logPageViewEventSpy = jest
        .spyOn(Metrics, 'logPageViewEvent')
        .mockImplementation();
    });

    afterEach(() => {
      logViewEventSpy.mockReset();
      logPageViewEventSpy.mockReset();
    });

    afterAll(() => {
      logViewEventSpy.mockRestore();
      logPageViewEventSpy.mockReset();
    });

    const createRecoveryKey = async (process = false) => {
      const account = {
        primaryEmail: {
          email: 'johndope@example.com',
        },
      } as unknown as Account;

      if (process) {
        account.createRecoveryKey = jest
          .fn()
          .mockResolvedValue(new Uint8Array(20));
      }

      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account,
          })}
        >
          <PageRecoveryKeyAdd />
        </AppContext.Provider>
      );

      const passwordField = await screen.findByLabelText('Enter password');
      fireEvent.input(passwordField, { target: { value: 'myFavPassword' } });

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await waitFor(() => expect(continueButton).toBeEnabled());
      fireEvent.click(continueButton);

      // Wait for page to settle
      if (process) {
        await screen.findByText('Your recovery key has been created.', {
          exact: false,
        });
      } else {
        await screen.findByLabelText('Enter password');
      }
    };

    const expectConfirmPasswordEvent = (event: string) => {
      expect(logViewEventSpy).toHaveBeenCalledWith(
        'flow.settings.account-recovery',
        `confirm-password.${event}`
      );
    };

    const expectRecoveryConsumeEvent = (type: string) => {
      expect(logViewEventSpy).toHaveBeenCalledWith(
        'flow.settings.account-recovery',
        `recovery-key.${type}-option`
      );
    };

    it('emits page view, submit and success events', async () => {
      await createRecoveryKey(true);
      expect(logViewEventSpy).toBeCalledTimes(2);
      expectConfirmPasswordEvent('submit');
      expectConfirmPasswordEvent('success');
    });

    it('emits failure event', async () => {
      await createRecoveryKey();
      expect(logViewEventSpy).toBeCalledTimes(2);
      expectConfirmPasswordEvent('fail');
    });

    it('emits events for key-saving actions', async () => {
      window.open = jest.fn().mockReturnValue({
        document: { write: jest.fn(), close: jest.fn() },
        focus: jest.fn(),
        print: jest.fn(),
        close: jest.fn(),
      });

      await createRecoveryKey(true);

      fireEvent.click(screen.getByTestId('databutton-copy'));
      await waitFor(() => expectRecoveryConsumeEvent('copy'));
      fireEvent.click(screen.getByTestId('databutton-print'));
      await waitFor(() => expectRecoveryConsumeEvent('print'));
      fireEvent.click(screen.getByTestId('databutton-download'));
      await waitFor(() => expectRecoveryConsumeEvent('download'));
    });
  });
});
