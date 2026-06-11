/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { createMockIntegration, Subject } from './mocks';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MOCK_EMAIL } from '../../mocks';
import { RelierCmsInfo } from '../../../models';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    postVerifySetPassword: {
      view: jest.fn(),
      engage: jest.fn(),
      submit: jest.fn(),
      submitFrontendError: jest.fn(),
      success: jest.fn(),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SetPassword page', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen.getByRole('heading', { name: 'Create password to sync' })
    ).toBeInTheDocument();
    expect(screen.getByText(MOCK_EMAIL)).toBeInTheDocument();
    expect(
      screen.getByText(
        'This encrypts your data. It needs to be different from your Google or Apple account password.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Start syncing')).toBeInTheDocument();
  });

  it('renders CMS overrides when PostVerifySetPasswordPage is set', () => {
    const cmsInfo = {
      shared: { buttonColor: '#333' },
      PostVerifySetPasswordPage: {
        headline: 'Set a sync password',
        description: 'Your password encrypts your synced data.',
        primaryButtonText: 'Sync now',
      },
    } as unknown as RelierCmsInfo;

    renderWithLocalizationProvider(
      <Subject integration={createMockIntegration(cmsInfo)} />
    );

    expect(
      screen.getByRole('heading', { name: 'Set a sync password' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Your password encrypts your synced data.')
    ).toBeInTheDocument();
    expect(screen.getByText('Sync now')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Create password to sync' })
    ).not.toBeInTheDocument();
  });

  describe('Glean events', () => {
    // First row asserts the default-arg behaviour (no prop passed); the
    // others assert explicit pass-through for each non-default value.
    it.each([
      ['third_party_auth', undefined],
      ['otp', 'otp' as const],
      ['passkey', 'passkey' as const],
    ])(
      'fires postVerifySetPassword.view with reason=%s',
      (expectedReason, propValue) => {
        renderWithLocalizationProvider(
          <Subject passwordCreationReason={propValue} />
        );
        expect(GleanMetrics.postVerifySetPassword.view).toHaveBeenCalledWith({
          event: { reason: expectedReason },
        });
      }
    );

    it('uses the container-supplied gleanReason for the funnel events', () => {
      renderWithLocalizationProvider(
        <Subject
          passwordCreationReason="passkey"
          gleanReason="signin_passkey"
        />
      );
      expect(GleanMetrics.postVerifySetPassword.view).toHaveBeenCalledWith({
        event: { reason: 'signin_passkey' },
      });
    });

    it('fires postVerifySetPassword.engage on first keystroke', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(
        <Subject passwordCreationReason="passkey" />
      );
      await user.type(screen.getByLabelText('Password'), 'a');
      await waitFor(() => {
        expect(GleanMetrics.postVerifySetPassword.engage).toHaveBeenCalledWith({
          event: { reason: 'passkey' },
        });
      });
    });

    it('fires postVerifySetPassword.submitFrontendError when createPasswordHandler rejects', async () => {
      const user = userEvent.setup();
      const createPasswordHandler = jest.fn().mockResolvedValue({
        error: { errno: 999, message: 'boom' },
      });
      renderWithLocalizationProvider(
        <Subject
          passwordCreationReason="passkey"
          createPasswordHandler={createPasswordHandler}
        />
      );
      await user.type(screen.getByLabelText('Password'), 'hunter2-hunter2');
      await user.type(
        screen.getByLabelText('Repeat password'),
        'hunter2-hunter2'
      );
      await user.click(screen.getByRole('button', { name: 'Start syncing' }));
      await waitFor(() => {
        expect(
          GleanMetrics.postVerifySetPassword.submitFrontendError
        ).toHaveBeenCalledWith({ event: { reason: 'passkey' } });
      });
    });
  });
});
