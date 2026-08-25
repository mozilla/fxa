/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as InlineTotpSetupModule from '.';
import { mockWindowLocation } from 'fxa-react/lib/test-utils/mockWindowLocation';

import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MozServices } from '../../lib/types';
import { IntegrationType, OAuthIntegration } from '../../models';
import InlineTotpSetupContainer from './container';
import {
  MOCK_QUERY_PARAMS,
  MOCK_SIGNIN_LOCATION_STATE,
  MOCK_SIGNIN_LOCATION_STATE_PASSKEY,
} from './mocks';
import { screen, waitFor } from '@testing-library/react';
import { AuthUiError } from '../../lib/auth-errors/auth-errors';
import { MOCK_FLOW_ID } from '../Signin/mocks';

const mockLocationHook = jest.fn();
const mockNavigateHook = jest.fn();
jest.mock('react-router', () => {
  return {
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook(),
  };
});

const mockSessionHook = jest.fn();
const mockSendVerificationCode = jest.fn();
const mockCheckTotpTokenExists = jest.fn();

// The container only calls checkTotpTokenExists directly; the enrolment's
// JWT-guarded calls live in InlineTotpEnrolment (InlineTotpSetup is mocked out).
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSession: () => mockSessionHook(),
    useAuthClient: () => ({
      checkTotpTokenExists: mockCheckTotpTokenExists,
    }),
  };
});

function setMocks() {
  const search = '?' + new URLSearchParams(MOCK_QUERY_PARAMS);

  mockWindowLocation({
    pathname: '/inline_totp_setup',
    search,
  });

  mockLocationHook.mockReturnValue({
    pathname: '/inline_totp_setup',
    search,
    state: MOCK_SIGNIN_LOCATION_STATE,
  });
  mockSendVerificationCode.mockReset();
  mockCheckTotpTokenExists.mockReset();
  mockSessionHook.mockReturnValue({
    isSessionVerified: async () => true,
    sendVerificationCode: mockSendVerificationCode,
  });
  // Default: TOTP doesn't exist, so enrolment should proceed
  mockCheckTotpTokenExists.mockResolvedValue({ exists: false, verified: false });
  jest.spyOn(InlineTotpSetupModule, 'default');
  (InlineTotpSetupModule.default as jest.Mock).mockReset();
  mockNavigateHook.mockReset();
}

const defaultProps = {
  isSignedIn: true,
  integration: {
    type: IntegrationType.OAuthWeb,
    returnOnError: () => true,
    getRedirectWithErrorUrl: (error: AuthUiError) =>
      `https://localhost:8080/?error=${error.errno}`,
  } as OAuthIntegration,
  serviceName: MozServices.Default,
};
function render(props = {}) {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <InlineTotpSetupContainer
        {...{
          ...defaultProps,
          ...props,
          flowQueryParams: { flowId: MOCK_FLOW_ID },
        }}
      />
    </MemoryRouter>
  );
}

describe('InlineTotpSetupContainer', () => {
  beforeEach(() => {
    setMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('redirects away', () => {
    it('redirects when user is not signed in', async () => {
      render({ isSignedIn: false });
      const location = mockLocationHook();
      await waitFor(() =>
        expect(mockNavigateHook).toHaveBeenCalledWith(`/${location.search}`, {
          state: undefined,
        })
      );
    });

    it('redirects when there is no signin state', async () => {
      mockLocationHook.mockImplementation(() => {
        return {
          pathname: '/inline_totp_setup',
          search: '?' + new URLSearchParams(MOCK_QUERY_PARAMS),
        };
      });
      const location = mockLocationHook();
      render();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(`/${location.search}`, {
          state: undefined,
        });
      });
    });

    it('redirects when the session is not verified', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => false,
      }));
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_token_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('sends verification code when session is not verified', async () => {
      mockSendVerificationCode.mockResolvedValue(undefined);
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => false,
        sendVerificationCode: mockSendVerificationCode,
      }));
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockSendVerificationCode).toHaveBeenCalled();
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_token_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('redirects when totp is active on the account (even if the session is verified)', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => true,
      }));
      mockCheckTotpTokenExists.mockResolvedValue({
        exists: true,
        verified: true,
      });
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_totp_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('redirects when totp is active on the account and the session is not verified', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => false,
      }));
      mockCheckTotpTokenExists.mockResolvedValue({
        exists: true,
        verified: true,
      });
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_totp_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('does not render enrolment while TOTP status is loading', async () => {
      // Simulate loading by not resolving the promise
      mockCheckTotpTokenExists.mockImplementation(() => new Promise(() => {}));

      render();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(InlineTotpSetupModule.default).not.toHaveBeenCalled();
    });

    it('does not render enrolment when TOTP is already verified', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => true,
      }));
      mockCheckTotpTokenExists.mockResolvedValue({
        exists: true,
        verified: true,
      });

      render();

      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalled();
      });
      expect(InlineTotpSetupModule.default).not.toHaveBeenCalled();
    });
  });

  describe('renders', () => {
    it('displays loading spinner when loading', async () => {
      // Simulate loading by not resolving the promise
      mockCheckTotpTokenExists.mockImplementation(() => new Promise(() => {}));

      render();
      screen.getByLabelText('Loading…');
      expect(InlineTotpSetupModule.default).not.toHaveBeenCalled();
    });

    it('invokes InlineTotpSetup at the intro step with the correct props', async () => {
      render();
      await waitFor(() => {
        expect(InlineTotpSetupModule.default).toHaveBeenCalled();
        const args = (InlineTotpSetupModule.default as jest.Mock).mock
          .calls[0][0];
        expect(args.currentStep).toBe(0);
        expect(typeof args.onContinue).toBe('function');
        expect(args.serviceName).toBe(MozServices.Default);
        expect(args.enrolment).toBeTruthy();
      });
    });

    it('passes signedInWithPasskey when the ceremony used a passkey', async () => {
      mockLocationHook.mockReturnValue({
        pathname: '/inline_totp_setup',
        search: '?' + new URLSearchParams(MOCK_QUERY_PARAMS),
        state: MOCK_SIGNIN_LOCATION_STATE_PASSKEY,
      });

      render();

      await waitFor(() => {
        expect(InlineTotpSetupModule.default).toHaveBeenCalled();
      });
      const args = (InlineTotpSetupModule.default as jest.Mock).mock.calls[0][0];
      expect(args.signedInWithPasskey).toBe(true);
    });

    it('passes signedInWithPasskey as false for a normal sign-in', async () => {
      render();

      await waitFor(() => {
        expect(InlineTotpSetupModule.default).toHaveBeenCalled();
      });
      const args = (InlineTotpSetupModule.default as jest.Mock).mock.calls[0][0];
      expect(args.signedInWithPasskey).toBe(false);
    });
  });
});
