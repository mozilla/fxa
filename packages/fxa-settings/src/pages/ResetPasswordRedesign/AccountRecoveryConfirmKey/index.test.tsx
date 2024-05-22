/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import { screen, waitFor } from '@testing-library/react';
import { MozServices } from '../../../lib/types';
import userEvent from '@testing-library/user-event';
import { MOCK_RECOVERY_KEY } from '../../mocks';
import GleanMetrics from '../../../lib/glean';

const mockVerifyRecoveryKey = jest.fn((_recoveryKey: string) =>
  Promise.resolve()
);

jest.mock('../../../lib/glean', () => ({
  resetPassword: {
    recoveryKeyView: jest.fn(),
    recoveryKeySubmit: jest.fn(),
  },
}));

describe('AccountRecoveryConfirmKey', () => {
  beforeEach(() => {
    (GleanMetrics.resetPassword.recoveryKeyView as jest.Mock).mockReset();
    (GleanMetrics.resetPassword.recoveryKeySubmit as jest.Mock).mockReset();
    mockVerifyRecoveryKey.mockClear();
  });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    await screen.findByRole('heading', {
      level: 1,
      name: 'Reset password with account recovery key to continue to account settings',
    });

    screen.getByText(
      'Please enter the one time use account recovery key you stored in a safe place to regain access to your Mozilla account.'
    );
    screen.getByTestId('warning-message-container');
    screen.getByLabelText('Enter account recovery key');
    screen.getByRole('button', { name: 'Confirm account recovery key' });
    screen.getByRole('link', {
      name: 'Don’t have an account recovery key?',
    });
  });

  describe('serviceName', () => {
    it('renders the default', async () => {
      renderWithLocalizationProvider(<Subject />);
      await screen.findByText(`to continue to ${MozServices.Default}`);
    });

    it('renders non-default', async () => {
      renderWithLocalizationProvider(
        <Subject serviceName={MozServices.FirefoxSync} />
      );
      await screen.findByText(`to continue to Firefox Sync`);
    });
  });

  describe('submit', () => {
    describe('success', () => {
      it('with valid recovery key', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        // adding text in the field enables the submit button
        await waitFor(() =>
          user.type(
            screen.getByLabelText('Enter account recovery key'),
            MOCK_RECOVERY_KEY
          )
        );

        const submitButton = screen.getByRole('button', {
          name: 'Confirm account recovery key',
        });
        expect(submitButton).toBeEnabled();
        await waitFor(() => user.click(submitButton));

        expect(mockVerifyRecoveryKey).toHaveBeenCalled();
        expect(
          GleanMetrics.resetPassword.recoveryKeySubmit
        ).toHaveBeenCalledTimes(1);
      });

      it('with spaces in valid recovery key', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        const submitButton = screen.getByRole('button', {
          name: 'Confirm account recovery key',
        });

        const input = screen.getByLabelText('Enter account recovery key');

        const recoveryKeyWithSpaces = MOCK_RECOVERY_KEY.replace(
          /(.{4})/g,
          '$1 '
        );
        expect(recoveryKeyWithSpaces).toHaveLength(40);

        // adding text in the field enables the submit button
        await waitFor(() => user.type(input, recoveryKeyWithSpaces));
        expect(submitButton).toBeEnabled();
        await waitFor(() => user.click(submitButton));

        expect(mockVerifyRecoveryKey).toHaveBeenCalledTimes(1);
        expect(mockVerifyRecoveryKey).toHaveBeenCalledWith(MOCK_RECOVERY_KEY);
      });
    });

    describe('errors', () => {
      it('with an empty input', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(<Subject />);
        const submitButton = screen.getByRole('button', {
          name: 'Confirm account recovery key',
        });
        expect(submitButton).toBeDisabled();

        const input = screen.getByLabelText('Enter account recovery key');

        // adding text in the field enables the submit button
        await waitFor(() => user.type(input, 'a'));
        expect(submitButton).not.toBeDisabled();
      });

      it('with less than 32 characters', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        const submitButton = screen.getByRole('button', {
          name: 'Confirm account recovery key',
        });
        const input = screen.getByLabelText('Enter account recovery key');

        // adding text in the field enables the submit button
        await waitFor(() => user.type(input, MOCK_RECOVERY_KEY.slice(0, -1)));
        expect(submitButton).toBeEnabled();

        await waitFor(() => user.click(submitButton));

        expect(mockVerifyRecoveryKey).not.toHaveBeenCalled();
        await screen.findByText('Invalid account recovery key');
      });

      it('with more than 32 characters', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        const submitButton = screen.getByRole('button', {
          name: 'Confirm account recovery key',
        });
        expect(submitButton).toBeDisabled();

        const input = screen.getByLabelText('Enter account recovery key');

        // adding text in the field enables the submit button
        await waitFor(() => user.type(input, `${MOCK_RECOVERY_KEY}abc`));
        expect(submitButton).toBeEnabled();
        await waitFor(() => user.click(submitButton));

        await screen.findByText('Invalid account recovery key');
        expect(mockVerifyRecoveryKey).not.toHaveBeenCalled();
      });

      it('with invalid Crockford base32', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        const submitButton = screen.getByRole('button', {
          name: 'Confirm account recovery key',
        });

        const input = screen.getByLabelText('Enter account recovery key');
        await waitFor(() => user.type(input, `${MOCK_RECOVERY_KEY}L`.slice(1)));
        expect(submitButton).toBeEnabled();
        await waitFor(() => user.click(submitButton));

        await screen.findByText('Invalid account recovery key');
        expect(mockVerifyRecoveryKey).not.toHaveBeenCalled();
      });
    });
  });
});
