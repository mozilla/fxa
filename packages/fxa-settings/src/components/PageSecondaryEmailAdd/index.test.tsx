/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { PageSecondaryEmailAdd } from '.';
import { Account, AppContext } from '../../models';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import * as Metrics from '../../lib/metrics';

window.console.error = jest.fn();

const account = {
  createSecondaryEmail: jest.fn().mockResolvedValue(true),
} as unknown as Account;

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

describe('PageSecondaryEmailAdd', () => {
  describe('no secondary email set', () => {
    it('renders as expected', () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <PageSecondaryEmailAdd />
        </AppContext.Provider>
      );

      expect(screen.getByTestId('secondary-email-input').textContent).toContain(
        'Enter email address'
      );
      expect(screen.getByTestId('cancel-button').textContent).toContain(
        'Cancel'
      );
      expect(screen.getByTestId('save-button').textContent).toContain('Save');
    });

    it('Enables "save" button once valid email is input', () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <PageSecondaryEmailAdd />
        </AppContext.Provider>
      );

      expect(screen.getByTestId('save-button')).toHaveAttribute('disabled');

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'fake@example.com' } });

      expect(screen.getByTestId('save-button')).not.toHaveAttribute('disabled');
    });

    it('Do not Enable "save" button if invalid email is input', () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <PageSecondaryEmailAdd />
        </AppContext.Provider>
      );

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'fake@' } });

      expect(screen.getByTestId('save-button')).toHaveAttribute('disabled');
    });
  });

  describe('createSecondaryEmailCode', () => {
    it('displays an error message in the tooltip', async () => {
      const error: any = new Error('Email Address already added');
      error.errno = AuthUiErrors.EMAIL_PRIMARY_EXISTS.errno;
      const account = {
        createSecondaryEmail: jest.fn().mockRejectedValue(error),
      } as unknown as Account;
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <PageSecondaryEmailAdd />
        </AppContext.Provider>
      );
      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'johndope2@example.com' } });

      await act(async () => {
        fireEvent.click(screen.getByTestId('save-button'));
      });

      expect(screen.queryByTestId('tooltip')).toBeInTheDocument();

      expect(
        screen.queryByText(AuthUiErrors.EMAIL_PRIMARY_EXISTS.message)
      ).toBeInTheDocument();
    });
  });

  describe('metrics', () => {
    let logViewEventSpy: jest.SpyInstance;
    let usePageViewEventSpy: jest.SpyInstance;

    beforeAll(() => {
      logViewEventSpy = jest
        .spyOn(Metrics, 'logViewEvent')
        .mockImplementation();
      usePageViewEventSpy = jest
        .spyOn(Metrics, 'usePageViewEvent')
        .mockImplementation();
    });

    afterEach(() => {
      logViewEventSpy.mockReset();
      usePageViewEventSpy.mockReset();
    });

    afterAll(() => {
      logViewEventSpy.mockRestore();
      usePageViewEventSpy.mockReset();
    });

    const createSecondaryEmail = async () => {
      const account = {
        createSecondaryEmail: jest.fn().mockResolvedValue(true),
      } as unknown as Account;

      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account,
          })}
        >
          <PageSecondaryEmailAdd />
        </AppContext.Provider>
      );

      const emailField = await screen.findByLabelText('Enter email address');
      fireEvent.input(emailField, {
        target: { value: 'johndope2@example.com' },
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await waitFor(() => expect(saveButton).toBeEnabled());
      fireEvent.click(saveButton);
    };

    it('emits page view and submit metrics events', async () => {
      await createSecondaryEmail();
      expect(logViewEventSpy).toHaveBeenCalledWith('settings.emails', 'submit');
      expect(usePageViewEventSpy).toHaveBeenCalledWith('settings.emails');
    });
  });
});
