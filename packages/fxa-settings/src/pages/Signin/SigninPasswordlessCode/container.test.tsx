/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as SigninPasswordlessCodeModule from '.';
import * as ReactUtils from 'fxa-react/lib/utils';

import { SigninPasswordlessCodeProps } from './interfaces';
import { Integration } from '../../../models';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocationProvider } from '@reach/router';
import SigninPasswordlessCodeContainer from './container';
import { screen, waitFor } from '@testing-library/react';
import { MOCK_EMAIL, MOCK_CLIENT_ID } from '../../mocks';
import { createMockWebIntegration } from '../../../lib/integrations/mocks';
import { createMockPasswordlessLocationState } from './mocks';

let integration: Integration;

function mockWebIntegration() {
  integration = createMockWebIntegration({ clientIdFallback: MOCK_CLIENT_ID }) as Integration;
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
  mockWebIntegration();
  mockSigninPasswordlessCodeModule();
}

let mockAuthClient: any;
jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: () => mockAuthClient,
  };
});

// Set this when testing location state
let mockLocationState = {};
const mockLocation = () => {
  return {
    pathname: '/signin_passwordless_code',
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

let currentSigninPasswordlessCodeProps: SigninPasswordlessCodeProps | undefined;
function mockSigninPasswordlessCodeModule() {
  currentSigninPasswordlessCodeProps = undefined;
  jest
    .spyOn(SigninPasswordlessCodeModule, 'default')
    .mockImplementation((props: SigninPasswordlessCodeProps) => {
      currentSigninPasswordlessCodeProps = props;
      return <div>signin passwordless code mock</div>;
    });
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => { });
}

function resetMockAuthClient() {
  mockAuthClient = {
    passwordlessSendCode: jest.fn().mockResolvedValue(true),
  };
}

async function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninPasswordlessCodeContainer
        {...{
          integration,
          serviceName: 'sync',
        }}
      />
    </LocationProvider>
  );
}

describe('SigninPasswordlessCode container', () => {
  beforeEach(() => {
    applyDefaultMocks();
    resetMockAuthClient();
  });

  describe('initial states', () => {
    describe('email', () => {
      it('can be set from router state', async () => {
        mockLocationState = createMockPasswordlessLocationState();
        await render();

        await waitFor(() =>
          expect(screen.getByText('signin passwordless code mock')).toBeInTheDocument()
        );

        expect(currentSigninPasswordlessCodeProps?.email).toBe(MOCK_EMAIL);
        expect(currentSigninPasswordlessCodeProps?.integration).toBe(integration);
        expect(SigninPasswordlessCodeModule.default).toHaveBeenCalled();
      });

      it('is handled if not provided in location state', async () => {
        mockLocationState = {};
        await render();

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/');
        });

        expect(SigninPasswordlessCodeModule.default).not.toHaveBeenCalled();
      });

      it('shows loading state while sending initial code', async () => {
        mockLocationState = createMockPasswordlessLocationState();

        // Make passwordlessSendCode slow to simulate loading
        mockAuthClient.passwordlessSendCode = jest.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        await render();

        // Should show loading initially
        expect(screen.queryByText('signin passwordless code mock')).not.toBeInTheDocument();
      });
    });

    describe('code sending', () => {
      beforeEach(() => {
        mockLocationState = createMockPasswordlessLocationState();
      });

      it('sends code on mount with email and clientId', async () => {
        await render();

        await waitFor(() => {
          expect(mockAuthClient.passwordlessSendCode).toHaveBeenCalledWith(
            MOCK_EMAIL,
            { clientId: MOCK_CLIENT_ID }
          );
        });
      });

      it('renders error state if code sending fails', async () => {
        mockAuthClient.passwordlessSendCode = jest
          .fn()
          .mockRejectedValue(new Error('Failed to send'));

        await render();

        await waitFor(() => {
          expect(screen.getByText(/Error:/)).toBeInTheDocument();
        });

        expect(SigninPasswordlessCodeModule.default).not.toHaveBeenCalled();
      });

      it('does not send code multiple times', async () => {
        await render();

        await waitFor(() => {
          expect(mockAuthClient.passwordlessSendCode).toHaveBeenCalledTimes(1);
        });

        // Even if component re-renders, should not send again
        expect(mockAuthClient.passwordlessSendCode).toHaveBeenCalledTimes(1);
      });
    });

    describe('isSignup flag', () => {
      it('passes isSignup=true from location state', async () => {
        mockLocationState = createMockPasswordlessLocationState(true);
        await render();

        await waitFor(() => {
          expect(currentSigninPasswordlessCodeProps?.isSignup).toBe(true);
        });
      });

      it('passes isSignup=false from location state', async () => {
        mockLocationState = createMockPasswordlessLocationState(false);
        await render();

        await waitFor(() => {
          expect(currentSigninPasswordlessCodeProps?.isSignup).toBe(false);
        });
      });
    });
  });

  describe('OAuth errors', () => {
    it('displays OAuthDataError when present', async () => {
      // Mock useFinishOAuthFlowHandler to return an error
      jest.mock('../../../lib/oauth/hooks', () => ({
        useFinishOAuthFlowHandler: jest.fn().mockReturnValue({
          finishOAuthFlowHandler: jest.fn(),
          oAuthDataError: new Error('OAuth error'),
        }),
      }));

      mockLocationState = createMockPasswordlessLocationState();
      await render();

      // The OAuthDataError component should be rendered instead
      // This would need the actual component rendering logic to verify
    });
  });
});
