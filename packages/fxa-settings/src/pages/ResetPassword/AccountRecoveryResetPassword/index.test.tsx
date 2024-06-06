/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import AccountRecoveryResetPassword, { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  logErrorEvent,
  logViewEvent,
  usePageViewEvent,
} from '../../../lib/metrics';
import { IntegrationType } from '../../../models';
import {
  createAppContext,
  createHistoryWithQuery,
  mockAppContext,
  renderWithRouter,
} from '../../../models/mocks';
import firefox from '../../../lib/channels/firefox';
import {
  MOCK_LOCATION_STATE,
  MOCK_RESET_DATA,
  MOCK_SEARCH_PARAMS,
  MOCK_VERIFICATION_INFO,
  createMockAccountRecoveryResetPasswordOAuthIntegration,
  createMockSyncDesktopV3Integration,
  mockAccount,
} from './mocks';
import { AccountRecoveryResetPasswordBaseIntegration } from './interfaces';

import GleanMetrics from '../../../lib/glean';
jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      recoveryKeyCreatePasswordView: jest.fn(),
      recoveryKeyCreatePasswordSubmit: jest.fn(),
    },
  },
}));

const mockUseNavigateWithoutRerender = jest.fn();

jest.mock('../../../lib/hooks/useNavigateWithoutRerender', () => ({
  __esModule: true,
  default: () => mockUseNavigateWithoutRerender,
}));

// TODO: better mocking here. LinkValidator sends `params` into page components and
// we mock those params sent to page components... we want to do these validation
// checks in the container component instead.
let mockVerificationInfo = MOCK_VERIFICATION_INFO;

jest.mock('../../../models/verification', () => ({
  ...jest.requireActual('../../../models/verification'),
  CreateVerificationInfo: jest.fn(() => mockVerificationInfo),
}));

let mockSearchParams = MOCK_SEARCH_PARAMS;
let mockLocationState = MOCK_LOCATION_STATE;

const mockLocation = () => {
  return {
    pathname: '/account_recovery_reset_password',
    search: '?' + new URLSearchParams(mockSearchParams),
    state: mockLocationState,
  };
};
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation(),
  };
});

jest.mock('../../../lib/metrics', () => {
  return {
    usePageViewEvent: jest.fn(),
    logViewEvent: jest.fn(),
    logErrorEvent: jest.fn(),
    setUserPreference: jest.fn(),
  };
});

const mockGetData = jest.fn().mockReturnValue({
  kB: 'someKb',
});
jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useSensitiveDataClient: () => {
      return {
        getData: mockGetData,
        setData: jest.fn(),
      };
    },
  };
});

const route = '/reset_password';
const render = (ui = <Subject />, account = mockAccount()) => {
  const history = createHistoryWithQuery(route);
  return renderWithRouter(
    ui,
    {
      route,
      history,
    },
    mockAppContext({
      ...createAppContext(),
      account,
    })
  );
};

const Subject = ({ integration = createMockSyncDesktopV3Integration() }) => (
  <AccountRecoveryResetPassword {...{ integration }} />
);

describe('AccountRecoveryResetPassword page', () => {
  let account = mockAccount();
  beforeEach(() => {
    mockLocationState = { ...MOCK_LOCATION_STATE };
    mockSearchParams = { ...MOCK_SEARCH_PARAMS };
    mockVerificationInfo = { ...MOCK_VERIFICATION_INFO };
    account = mockAccount();
  });

  async function clickResetPassword() {
    const button = await screen.findByRole('button', {
      name: 'Reset password',
    });
    await act(async () => {
      button.click();
    });
  }

  async function clickReceiveNewLink() {
    const button = await screen.findByRole('button', {
      name: 'Receive new link',
    });

    await act(async () => {
      button.click();
    });
  }

  async function enterPassword(password: string, password2?: string) {
    const newPassword = await screen.findByLabelText('New password');
    const newPassword2 = await screen.findByLabelText('Re-enter password');
    fireEvent.change(newPassword, { target: { value: password } });
    fireEvent.change(newPassword2, {
      target: { value: password2 || password },
    });
  }

  describe('damaged link', () => {
    describe('required location state recovery key info', () => {
      it('requires kB', async () => {
        mockGetData.mockReturnValue(undefined);
        render();
        await screen.findByRole('heading', {
          name: 'Reset password link damaged',
        });
        mockGetData.mockReturnValue({ kB: 'someKb' });
      });

      it('requires recoveryKeyId', async () => {
        mockLocationState.recoveryKeyId = '';
        render();
        await screen.findByRole('heading', {
          name: 'Reset password link damaged',
        });
      });

      it('requires accountResetToken', async () => {
        mockLocationState.accountResetToken = '';
        render();

        await screen.findByRole('heading', {
          name: 'Reset password link damaged',
        });
      });
    });

    it('shows damaged link message with bad param state', async () => {
      // By setting an invalid email state, we trigger a damaged link state.
      mockVerificationInfo.email = '';
      render(
        <Subject
          integration={createMockAccountRecoveryResetPasswordOAuthIntegration()}
        />
      );

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
    });
  });

  describe('valid link', () => {
    beforeEach(() => {
      render();
    });

    it('has valid l10n', () => {
      // TODO
      // testAllL10n(screen, bundle);
    });

    it('renders with valid link', async () => {
      const heading = await screen.findByRole('heading', {
        name: 'Create new password',
      });
      expect(screen.getByLabelText('New password')).toBeVisible();
      expect(screen.getByLabelText('Re-enter password')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Reset password' })
      ).toBeVisible();
      expect(screen.getByText('Remember your password?')).toBeVisible();
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();

      expect(heading).toBeDefined();
    });

    it('emits event', () => {
      expect(usePageViewEvent).toHaveBeenCalled();
      expect(usePageViewEvent).toHaveBeenCalledWith(
        'account-recovery-reset-password',
        REACT_ENTRYPOINT
      );
      expect(
        GleanMetrics.passwordReset.recoveryKeyCreatePasswordView
      ).toHaveBeenCalled();
    });

    it('displays password requirements when the new password field is in focus', async () => {
      const newPasswordField = await screen.findByTestId(
        'new-password-input-field'
      );
      expect(
        screen.queryByText('Password requirements')
      ).not.toBeInTheDocument();

      fireEvent.focus(newPasswordField);
      await waitFor(() => {
        expect(screen.getByText('Password requirements')).toBeVisible();
      });
    });
  });

  describe('successful reset', () => {
    beforeEach(async () => {
      account.resetPasswordWithRecoveryKey = jest
        .fn()
        .mockResolvedValue(MOCK_RESET_DATA);
      account.hasTotpAuthClient = jest.fn().mockResolvedValue(false);

      render(<Subject />, account);
      await enterPassword('foo12356789!');
      await clickResetPassword();
    });

    it('emits a metric on successful reset', async () => {
      expect(logViewEvent).toHaveBeenCalledWith(
        viewName,
        'verification.success'
      );
      expect(
        GleanMetrics.passwordReset.recoveryKeyCreatePasswordSubmit
      ).toHaveBeenCalled();
    });

    it('calls account API methods', () => {
      // Check that resetPasswordWithRecoveryKey was the first function called
      // because it retrieves the session token required by other calls
      expect(
        (account.resetPasswordWithRecoveryKey as jest.Mock).mock.calls[0]
      ).toBeTruthy();
    });

    it('sets integration state', () => {
      expect(logViewEvent).toHaveBeenCalledWith(
        viewName,
        'verification.success'
      );
    });
  });

  describe('successful reset, Sync integrations set data and call fxaLoginSignedInUser', () => {
    let fxaLoginSignedInUserSpy: jest.SpyInstance;
    beforeEach(async () => {
      account.resetPasswordWithRecoveryKey = jest
        .fn()
        .mockResolvedValue(MOCK_RESET_DATA);
      account.hasTotpAuthClient = jest.fn().mockResolvedValue(false);
      fxaLoginSignedInUserSpy = jest.spyOn(firefox, 'fxaLoginSignedInUser');
    });

    const testSyncIntegration = async (
      integration: AccountRecoveryResetPasswordBaseIntegration
    ) => {
      render(<Subject {...{ integration }} />, account);
      await enterPassword('foo12356789!');
      await clickResetPassword();
    };

    it('Desktop v3', async () => {
      const integration = createMockSyncDesktopV3Integration();
      await testSyncIntegration(integration);
      expect(integration.data.resetPasswordConfirm).toBeTruthy();
      expect(fxaLoginSignedInUserSpy).toHaveBeenCalled();
    });

    it('OAuth Sync', async () => {
      const integration =
        createMockAccountRecoveryResetPasswordOAuthIntegration(undefined, true);
      await testSyncIntegration(integration);
      expect(integration.data.resetPasswordConfirm).toBeTruthy();
      expect(fxaLoginSignedInUserSpy).toHaveBeenCalled();
    });
  });

  it('navigates as expected without totp', async () => {
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/reset_password_with_recovery_key_verified`
      );
    });
  });

  describe('expired link', () => {
    beforeEach(async () => {
      // A link is deemed expired if the server returns an invalid token error.
      account.resetPasswordWithRecoveryKey = jest
        .fn()
        .mockRejectedValue(AuthUiErrors['INVALID_TOKEN']);
      account.resetPassword = jest.fn();

      render(<Subject />, account);
      await enterPassword('foo12356789!');
      await clickResetPassword();
    });

    it('logs error event', async () => {
      expect(logErrorEvent).toBeCalled();
      expect(true).toBeTruthy();
    });

    it('renders LinkExpired component', async () => {
      await clickReceiveNewLink();
      await screen.findByRole('heading', {
        name: 'Reset password link expired',
      });
    });
  });
});
