/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MOCK_RECOVERY_KEY,
  MOCK_RECOVERY_KEY_INVALID,
  MOCK_RECOVERY_KEY_WITH_SPACES,
} from '../../mocks';
import GleanMetrics from '../../../lib/glean';

const mockVerifyRecoveryKey = jest.fn((_recoveryKey: string) =>
  Promise.resolve()
);

jest.mock('../../../lib/glean', () => ({
  passwordReset: {
    recoveryKeyView: jest.fn(),
    recoveryKeySubmit: jest.fn(),
  },
}));

describe('AccountRecoveryConfirmKey', () => {
  beforeEach(() => {
    (GleanMetrics.passwordReset.recoveryKeyView as jest.Mock).mockReset();
    (GleanMetrics.passwordReset.recoveryKeySubmit as jest.Mock).mockReset();
    mockVerifyRecoveryKey.mockClear();
  });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    const headings = await screen.findAllByRole('heading');
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent('Reset your password');
    expect(headings[1]).toHaveTextContent('Enter your account recovery key');

    screen.getByText(
      'This key recovers your encrypted browsing data, such as passwords and bookmarks, from Firefox servers.'
    );
    screen.getByLabelText('Enter your 32-character account recovery key');
    screen.getByRole('button', { name: 'Continue' });
    screen.getByRole('link', {
      name: 'Can’t find your account recovery key?',
    });
  });

  it('renders with a recovery key hint', async () => {
    renderWithLocalizationProvider(
      <Subject recoveryKeyHint="This is a hint" />
    );

    expect(screen.getByText('This is a hint')).toBeVisible();
  });

  describe('submit', () => {
    describe('success', () => {
      it('with valid recovery key', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        await waitFor(() =>
          user.type(screen.getByRole('textbox'), MOCK_RECOVERY_KEY)
        );

        const submitButton = screen.getByRole('button');
        expect(submitButton).toBeEnabled();
        await waitFor(() => user.click(submitButton));

        expect(mockVerifyRecoveryKey).toHaveBeenCalled();
        expect(
          GleanMetrics.passwordReset.recoveryKeySubmit
        ).toHaveBeenCalledTimes(1);
      });

      it('with spaces in valid recovery key', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        const submitButton = screen.getByRole('button');

        const input = screen.getByRole('textbox');

        await waitFor(() => user.type(input, MOCK_RECOVERY_KEY_WITH_SPACES));
        expect(submitButton).toBeEnabled();
        await waitFor(() => user.click(submitButton));

        expect(mockVerifyRecoveryKey).toHaveBeenCalledTimes(1);
        expect(mockVerifyRecoveryKey).toHaveBeenCalledWith(MOCK_RECOVERY_KEY);
      });
    });

    describe('errors', () => {
      it('with an empty input', async () => {
        renderWithLocalizationProvider(<Subject />);
        const submitButton = screen.getByRole('button');
        expect(submitButton).toBeDisabled();
      });

      it('with less than 32 characters', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        const submitButton = screen.getByRole('button');
        const input = screen.getByRole('textbox');

        await waitFor(() => user.type(input, MOCK_RECOVERY_KEY.slice(0, -1)));
        expect(submitButton).toBeDisabled();
      });

      it('with more than 32 characters extra characters are truncated', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        const submitButton = screen.getByRole('button');
        expect(submitButton).toBeDisabled();

        const input = screen.getByRole('textbox');

        await waitFor(() => user.type(input, `${MOCK_RECOVERY_KEY}abc`));
        expect(input).toHaveValue(MOCK_RECOVERY_KEY);
        expect(submitButton).toBeEnabled();
      });

      it('with invalid Crockford base32', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject verifyRecoveryKey={mockVerifyRecoveryKey} />
        );
        const submitButton = screen.getByRole('button');

        const input = screen.getByRole('textbox');
        // contains a character that is not valid in Crockford base32
        // but length is correct
        await waitFor(() => user.type(input, MOCK_RECOVERY_KEY_INVALID));
        expect(submitButton).toBeEnabled();
        await waitFor(() => user.click(submitButton));

        await screen.findByText('Invalid account recovery key');
        expect(mockVerifyRecoveryKey).not.toHaveBeenCalled();
      });
    });
  });
});
