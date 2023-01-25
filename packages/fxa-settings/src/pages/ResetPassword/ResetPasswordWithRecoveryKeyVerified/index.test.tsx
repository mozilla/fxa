/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRouter } from '../../../models/mocks';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import ResetPasswordWithRecoveryKeyVerified from '.';
import { logViewEvent } from '../../../lib/metrics';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

describe('ResetPasswordWithRecoveryKeyVerified', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });
  it('renders default content as expected', () => {
    renderWithRouter(<ResetPasswordWithRecoveryKeyVerified />);
    testAllL10n(screen, bundle);

    const newAccountRecoveryKeyButton = screen.getByText(
      'Generate a new account recovery key'
    );
    const continueToAccountLink = screen.getByText('Continue to my account');
    // Calling `getByText` will fail if these elements aren't in the document,
    // but we test anyway to make the intention of the test explicit
    expect(newAccountRecoveryKeyButton).toBeInTheDocument();
    expect(continueToAccountLink).toBeInTheDocument();
  });

  it('emits the expected metrics when a user generates new recovery keys', async () => {
    renderWithRouter(<ResetPasswordWithRecoveryKeyVerified />);
    const newAccountRecoveryKeyButton = screen.getByText(
      'Generate a new account recovery key'
    );
    fireEvent.click(newAccountRecoveryKeyButton);
    expect(logViewEvent).toHaveBeenCalledWith(
      'reset-password-with-recovery-key-verified',
      'reset-password-with-recovery-key-verified.generate-new-key',
      {
        entrypoint_variation: 'react',
      }
    );
  });

  it('emits the expected metrics when a user continues to their account', async () => {
    renderWithRouter(<ResetPasswordWithRecoveryKeyVerified />);
    const continueToAccountLink = screen.getByText('Continue to my account');
    fireEvent.click(continueToAccountLink);
    expect(logViewEvent).toHaveBeenCalledWith(
      'reset-password-with-recovery-key-verified',
      'reset-password-with-recovery-key-verified.continue-to-account',
      {
        entrypoint_variation: 'react',
      }
    );
  });
});
