/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import CompleteResetPasswordContainer from './container';
import { mockOAuthNativeSigninIntegration } from '../../Signin/SigninTotpCode/mocks';
import { Integration } from '../../../models';
import {
  MOCK_EMAIL,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_UID,
} from '../../mocks';
import { SETTINGS_PATH } from '../../../constants';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationProvider } from '@reach/router';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import firefox from '../../../lib/channels/firefox';

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

const mockAlertBar = {
  success: jest.fn(),
};

const mockAccount = {
  completeResetPassword: jest.fn(),
};

const mockAuthClient = {};

const mockSensitiveDataClient = {
  getDataType: jest.fn(),
  setDataType: jest.fn(),
};

jest.mock('../../../lib/oauth/hooks', () => ({
  useFinishOAuthFlowHandler: jest.fn(),
}));

jest.mock('../../../models', () => ({
  __esModule: true,
  ...jest.requireActual('../../../models'),
  useAlertBar: () => mockAlertBar,
  useAccount: () => mockAccount,
  useAuthClient: () => mockAuthClient,
  useSensitiveDataClient: () => mockSensitiveDataClient,
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

jest.mock('@reach/router', () => {
  const actual = jest.requireActual('@reach/router');
  return {
    ...actual,
    useLocation: () => ({
      state: {
        email: MOCK_EMAIL,
        uid: MOCK_UID,
        token: 'tok',
        code: '1234567890',
      },
      pathname: '/complete_reset_password',
      search: '',
      hash: '',
    }),
  };
});

describe('CompleteResetPasswordContainer', () => {
  let fxaLoginSignedInUserSpy: jest.SpyInstance;

  beforeEach(() => {
    mockNavigateWithQuery.mockImplementation(() => {});
    fxaLoginSignedInUserSpy = jest.spyOn(firefox, 'fxaLoginSignedInUser');

    mockAccount.completeResetPassword.mockResolvedValue({
      uid: MOCK_UID,
      sessionToken: 'sessionToken123',
      sessionVerified: true,
      keyFetchToken: 'keyFetchToken123',
      unwrapBKey: 'unwrapBKey123',
      authAt: Date.now(),
    });

    (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
      finishOAuthFlowHandler: jest
        .fn()
        .mockResolvedValue(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
      oAuthDataError: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    fxaLoginSignedInUserSpy.mockRestore();
  });

  it('sends webchannel message and navigates to settings for relay integration', async () => {
    renderWithLocalizationProvider(
      <LocationProvider>
        <CompleteResetPasswordContainer
          integration={mockOAuthNativeSigninIntegration(false) as Integration}
        />
      </LocationProvider>
    );

    expect(await screen.findByLabelText('New password')).toBeInTheDocument();

    const user = userEvent.setup();
    const newPasswordInput = screen.getByLabelText('New password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');

    await user.type(newPasswordInput, 'newPassword123!');
    await user.type(confirmPasswordInput, 'newPassword123!');

    const submitButton = screen.getByRole('button', {
      name: 'Create new password',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAccount.completeResetPassword).toHaveBeenCalled();
    });

    expect(fxaLoginSignedInUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        services: { relay: {} },
      })
    );

    await waitFor(() => {
      expect(mockNavigateWithQuery).toHaveBeenCalledWith(SETTINGS_PATH, {
        replace: true,
      });
    });

    expect(mockAlertBar.success).toHaveBeenCalledWith(
      'Your password has been reset'
    );
  });
});
