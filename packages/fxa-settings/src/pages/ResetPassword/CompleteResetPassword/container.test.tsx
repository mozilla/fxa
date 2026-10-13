/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import CompleteResetPasswordContainer from './container';
import { mockOAuthNativeSigninIntegration } from '../../Signin/SigninTotpCode/mocks';
import { Integration } from '../../../models';
import {
  MOCK_AUTH_PW_V2,
  MOCK_CLIENT_SALT,
  MOCK_EMAIL,
  MOCK_KB,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_RESET_TOKEN,
  MOCK_UID,
  MOCK_WRAP_KB,
  MOCK_WRAP_KB_V2,
} from '../../mocks';
import { SETTINGS_PATH } from '../../../constants';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';
import firefox from '../../../lib/channels/firefox';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { KeyStretchExperiment } from '../../../models/experiments';
import { getCredentialsV2, getKeysV2 } from 'fxa-auth-client/lib/crypto';

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

const mockAlertBar = {
  success: jest.fn(),
};

const mockAuthClient = {
  passwordForgotVerifyCode: jest.fn(),
  accountResetAuthPW: jest.fn(),
  resetPasswordWithRecoveryKey: jest.fn(),
  accountEmails: jest.fn(),
  sessionReauth: jest.fn(),
  accountKeys: jest.fn(),
  createRecoveryKey: jest.fn(),
};

jest.mock('fxa-auth-client/browser', () => ({
  ...jest.requireActual('fxa-auth-client/browser'),
  generateRecoveryKey: jest.fn().mockResolvedValue({
    recoveryKey: new Uint8Array(16),
    recoveryKeyId: 'newRecoveryKeyId',
    recoveryData: 'newRecoveryData',
  }),
}));

jest.mock('fxa-auth-client/lib/crypto', () => ({
  ...jest.requireActual('fxa-auth-client/lib/crypto'),
  getCredentialsV2: jest.fn(),
  getKeysV2: jest.fn(),
}));

const mockSensitiveDataClient = createMockSensitiveDataClient();

jest.mock('../../../lib/account-storage', () => ({
  ...jest.requireActual('../../../lib/account-storage'),
  updateBasicAccountData: jest.fn(),
}));
const { updateBasicAccountData: mockUpdateBasicAccountData } = jest.requireMock(
  '../../../lib/account-storage'
);

jest.mock('../../../lib/oauth/hooks', () => ({
  useFinishOAuthFlowHandler: jest.fn(),
}));

jest.mock('../../../models', () => ({
  __esModule: true,
  ...jest.requireActual('../../../models'),
  useAlertBar: () => mockAlertBar,
  useAuthClient: () => mockAuthClient,
  useSensitiveDataClient: () => mockSensitiveDataClient,
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

const RESET_WITHOUT_KEY_STATE = {
  email: MOCK_EMAIL,
  uid: MOCK_UID,
  token: 'tok',
  code: '1234567890',
};
let mockLocationState: Record<string, unknown> = RESET_WITHOUT_KEY_STATE;

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useLocation: () => ({
      state: mockLocationState,
      pathname: '/complete_reset_password',
      search: '',
      hash: '',
    }),
  };
});

const MOCK_RESET_RESPONSE = {
  uid: MOCK_UID,
  sessionToken: 'sessionToken123',
  sessionVerified: true,
  keyFetchToken: 'keyFetchToken123',
  unwrapBKey: 'unwrapBKey123',
  authAt: 1_700_000_000,
};

function renderComponent() {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <CompleteResetPasswordContainer
        integration={mockOAuthNativeSigninIntegration(false) as Integration}
      />
    </MemoryRouter>
  );
}

async function submitNewPassword() {
  const user = userEvent.setup();
  await user.type(
    await screen.findByLabelText('New password'),
    'newPassword123!'
  );
  await user.type(screen.getByLabelText('Confirm password'), 'newPassword123!');
  await user.click(screen.getByRole('button', { name: 'Create new password' }));
}

describe('CompleteResetPasswordContainer', () => {
  let fxaLoginSignedInUserSpy: jest.SpyInstance;

  beforeEach(() => {
    mockNavigateWithQuery.mockImplementation(() => {});
    fxaLoginSignedInUserSpy = jest.spyOn(firefox, 'fxaLoginSignedInUser');

    mockLocationState = RESET_WITHOUT_KEY_STATE;
    mockSensitiveDataClient.DecryptedRecoveryKeyData = undefined;
    mockAuthClient.passwordForgotVerifyCode.mockResolvedValue({
      accountResetToken: MOCK_RESET_TOKEN,
    });
    mockAuthClient.accountResetAuthPW.mockResolvedValue(MOCK_RESET_RESPONSE);
    mockAuthClient.resetPasswordWithRecoveryKey.mockResolvedValue(
      MOCK_RESET_RESPONSE
    );
    mockAuthClient.accountEmails.mockResolvedValue({
      primary: MOCK_EMAIL,
      original: MOCK_EMAIL,
    });
    mockAuthClient.sessionReauth.mockResolvedValue({
      keyFetchToken: 'reauthKeyFetchToken',
      unwrapBKey: 'reauthUnwrapBKey',
    });
    mockAuthClient.accountKeys.mockResolvedValue({ kA: 'kA', kB: MOCK_KB });
    mockAuthClient.createRecoveryKey.mockResolvedValue({});

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
    renderComponent();

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
      expect(mockAuthClient.accountResetAuthPW).toHaveBeenCalled();
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

  it('verifies the code and resets the password with new credentials', async () => {
    renderComponent();
    await submitNewPassword();

    await waitFor(() => {
      expect(mockAuthClient.accountResetAuthPW).toHaveBeenCalledWith(
        expect.stringMatching(/^[0-9a-f]{64}$/),
        MOCK_RESET_TOKEN,
        {},
        { sessionToken: true, keys: true }
      );
    });
    expect(mockAuthClient.passwordForgotVerifyCode).toHaveBeenCalledWith(
      '1234567890',
      'tok',
      { accountResetWithRecoveryKey: false, includeRecoveryKeyPrompt: false }
    );
  });

  describe('with key stretching v2', () => {
    let isV2Spy: jest.SpyInstance;

    beforeEach(() => {
      isV2Spy = jest
        .spyOn(KeyStretchExperiment.prototype, 'isV2')
        .mockReturnValue(true);
      (getCredentialsV2 as jest.Mock).mockResolvedValue({
        clientSalt: MOCK_CLIENT_SALT,
        authPW: MOCK_AUTH_PW_V2,
      });
      (getKeysV2 as jest.Mock).mockResolvedValue({
        wrapKb: MOCK_WRAP_KB,
        wrapKbVersion2: MOCK_WRAP_KB_V2,
      });
    });

    afterEach(() => {
      isV2Spy.mockRestore();
    });

    it('resets the password with the v2 credentials', async () => {
      renderComponent();
      await submitNewPassword();

      await waitFor(() => {
        expect(mockAuthClient.accountResetAuthPW).toHaveBeenCalledWith(
          expect.stringMatching(/^[0-9a-f]{64}$/),
          MOCK_RESET_TOKEN,
          {
            wrapKb: MOCK_WRAP_KB,
            authPWVersion2: MOCK_AUTH_PW_V2,
            wrapKbVersion2: MOCK_WRAP_KB_V2,
            clientSalt: MOCK_CLIENT_SALT,
          },
          { sessionToken: true, keys: true }
        );
      });
    });
  });

  // getHandledError wraps the error in { error }, so the banner falls back to the generic message.
  it('shows the generic error banner when the code verification fails', async () => {
    mockAuthClient.passwordForgotVerifyCode.mockRejectedValue(
      AuthUiErrors.INVALID_VERIFICATION_CODE
    );
    renderComponent();
    await submitNewPassword();

    expect(
      await screen.findByText(AuthUiErrors.UNEXPECTED_ERROR.message)
    ).toBeInTheDocument();
    expect(mockAuthClient.accountResetAuthPW).not.toHaveBeenCalled();
  });

  describe('with a confirmed recovery key', () => {
    beforeEach(() => {
      mockLocationState = {
        accountResetToken: MOCK_RESET_TOKEN,
        email: MOCK_EMAIL,
        recoveryKeyId: 'oldRecoveryKeyId',
        uid: MOCK_UID,
      };
      mockSensitiveDataClient.DecryptedRecoveryKeyData = { kB: MOCK_KB };
    });

    async function renderAndSubmit() {
      renderComponent();
      await submitNewPassword();
      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/reset_password_with_recovery_key_verified',
          { state: { email: MOCK_EMAIL } }
        );
      });
    }

    it('resets the password with the recovery key', async () => {
      await renderAndSubmit();

      expect(mockAuthClient.resetPasswordWithRecoveryKey).toHaveBeenCalledWith(
        MOCK_RESET_TOKEN,
        { primary: MOCK_EMAIL, original: MOCK_EMAIL },
        'newPassword123!',
        'oldRecoveryKeyId',
        { kB: MOCK_KB },
        { sessionToken: true, keys: true, isFirefoxMobileClient: false }
      );
    });

    it('caches the sessionVerified value from the reset response', async () => {
      await renderAndSubmit();

      expect(mockUpdateBasicAccountData).toHaveBeenCalledWith({
        sessionVerified: true,
      });
    });

    it('caches an unverified session from the reset response', async () => {
      mockAuthClient.resetPasswordWithRecoveryKey.mockResolvedValue({
        ...MOCK_RESET_RESPONSE,
        sessionVerified: false,
      });
      renderComponent();
      await submitNewPassword();

      await waitFor(() => {
        expect(mockUpdateBasicAccountData).toHaveBeenCalledWith({
          sessionVerified: false,
        });
      });
    });

    it('creates a new recovery key with the new session', async () => {
      await renderAndSubmit();

      expect(mockAuthClient.sessionReauth).toHaveBeenCalledWith(
        'sessionToken123',
        { primary: MOCK_EMAIL, original: MOCK_EMAIL },
        'newPassword123!',
        { keys: true, reason: 'recovery_key' }
      );
      expect(mockAuthClient.accountKeys).toHaveBeenCalledWith(
        'reauthKeyFetchToken',
        'reauthUnwrapBKey'
      );
      expect(mockAuthClient.createRecoveryKey).toHaveBeenCalledWith(
        'sessionToken123',
        'newRecoveryKeyId',
        'newRecoveryData',
        true,
        false
      );
      expect(mockSensitiveDataClient.NewRecoveryKeyData).toEqual({
        recoveryKey: new Uint8Array(16),
      });
    });
  });
});
