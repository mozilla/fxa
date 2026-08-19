/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as LoadingSpinnerModule from 'fxa-react/components/LoadingSpinner';
import * as ConfirmSignupCodeModule from './index';
import * as ModelsModule from '../../../models';
import * as HooksModule from '../../../lib/oauth/hooks';
import * as OAuthFlowRecoveryModule from '../../../lib/hooks/useOAuthFlowRecovery';
import * as CacheModule from '../../../lib/cache';
import * as SentryModule from 'fxa-shared/sentry/browser';
import * as ReactUtils from 'fxa-react/lib/utils';

import {
  act,
  render as rtlRender,
  screen,
  waitFor,
} from '@testing-library/react';
import { StoredAccountData } from '../../../lib/storage-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import SignupConfirmCodeContainer, {
  POLL_INTERVAL,
  POLL_TIMEOUT,
} from './container';
import { Integration } from '../../../models';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';
import GleanMetrics from '../../../lib/glean';
import { MemoryRouter } from 'react-router';

import {
  MOCK_EMAIL,
  MOCK_FLOW_ID,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
} from '../../mocks';

// Setup mocks

// Models cannot be mocked using jest.spyOn...
jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
    useSensitiveDataClient: jest.fn(),
  };
});

const mockNavigate = jest.fn();
let mockLocationStateValue: any = {};

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: mockLocationStateValue,
    key: 'default',
  }),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    signupConfirmation: {
      view: jest.fn(),
      submit: jest.fn(),
      error: jest.fn(),
    },
  },
}));

// Global instances
let integration: Integration;
let currentProps: any | undefined;
const mockSensitiveDataClient = createMockSensitiveDataClient();

// Mock auth client with emailBounceStatus method
const mockAuthClient = {
  emailBounceStatus: jest.fn(),
};

function mockLocation(
  originIsSignup: boolean = true,
  withAccountInfo: boolean = true
) {
  mockLocationStateValue = {
    uid: withAccountInfo ? MOCK_UID : undefined,
    email: withAccountInfo ? MOCK_EMAIL : undefined,
    sessionToken: withAccountInfo ? MOCK_SESSION_TOKEN : undefined,
    origin: originIsSignup ? 'signup' : null,
    selectedNewsletterSlugs: 'slugs',
  };
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

function mockModelsModule() {
  mockAuthClient.emailBounceStatus.mockResolvedValue({ hasHardBounce: false });
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
  (ModelsModule.useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  mockSensitiveDataClient.getDataType = jest.fn().mockReturnValue({
    keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    unwrapBKey: MOCK_UNWRAP_BKEY,
  });
}

// Apply default mocks
function applyMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  integration = {
    type: ModelsModule.IntegrationType.OAuthWeb,
    requiresKeys: () => false,
    wantsKeys: () => false,
    getCmsInfo: () => undefined,
  } as Integration;
  jest
    .spyOn(ConfirmSignupCodeModule, 'default')
    .mockImplementation((props: any) => {
      currentProps = props;
      return <div>confirm signup code mock</div>;
    });
  jest.spyOn(LoadingSpinnerModule, 'default').mockImplementation(() => {
    return <div>loading spinner mock</div>;
  });

  mockModelsModule();
  jest
    .spyOn(HooksModule, 'useFinishOAuthFlowHandler')
    .mockImplementation(() => {
      return {
        finishOAuthFlowHandler: jest
          .fn()
          .mockImplementation(
            (accountUid, sessionToken, keyFetchToken, unwrapKB) => {
              return {
                redirect: 'http://localhost:8080/123done',
                code: 'oac123',
                state: 'oacs123',
              };
            }
          ),
        oAuthDataError: null,
      };
    });
  mockLocation();
  mockReactUtilsModule();
  jest.spyOn(SentryModule.default, 'captureException');
  jest.spyOn(OAuthFlowRecoveryModule, 'useOAuthFlowRecovery').mockReturnValue({
    isRecovering: false,
    recoveryFailed: false,
    attemptOAuthFlowRecovery: jest.fn().mockResolvedValue({ success: false }),
  });
}

function containerTree() {
  return (
    <MemoryRouter>
      <SignupConfirmCodeContainer
        {...{
          integration,
        }}
        flowQueryParams={{ flowId: MOCK_FLOW_ID }}
      />
    </MemoryRouter>
  );
}

async function render() {
  renderWithLocalizationProvider(containerTree());
}

// Same provider renderWithLocalizationProvider sets up, as a wrapper, so a
// rerender keeps it in place.
function LocalizationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppLocalizationProvider
      messages={{ en: ['testo: lol'] }}
      reportError={() => {}}
    >
      {children}
    </AppLocalizationProvider>
  );
}

describe('confirm-signup-container', () => {
  beforeEach(() => {
    applyMocks();
  });

  describe('renders-default-state', () => {
    it('renders as expected with account info in location state', async () => {
      render();

      await waitFor(() =>
        expect(screen.getByText('confirm signup code mock')).toBeInTheDocument()
      );
      expect(currentProps?.email).toEqual(MOCK_EMAIL);
      expect(currentProps?.sessionToken).toEqual(MOCK_SESSION_TOKEN);
      expect(currentProps?.integration).toBeDefined();
      expect(currentProps?.finishOAuthFlowHandler).toBeDefined();
      expect(currentProps?.newsletterSlugs).toEqual('slugs');
      expect(currentProps?.keyFetchToken).toEqual(MOCK_KEY_FETCH_TOKEN);
      expect(currentProps?.unwrapBKey).toEqual(MOCK_UNWRAP_BKEY);
    });

    it('renders as expected with account info in local storage', async () => {
      mockLocation(true, false);
      jest.spyOn(CacheModule, 'currentAccount').mockImplementationOnce(() => {
        return {
          uid: MOCK_UID,
          email: MOCK_EMAIL,
          sessionToken: MOCK_SESSION_TOKEN,
        } as StoredAccountData;
      });
      render();

      await waitFor(() =>
        expect(screen.getByText('confirm signup code mock')).toBeInTheDocument()
      );
      expect(currentProps?.email).toEqual(MOCK_EMAIL);
      expect(currentProps?.sessionToken).toEqual(MOCK_SESSION_TOKEN);
      expect(currentProps?.integration).toBeDefined();
      expect(currentProps?.finishOAuthFlowHandler).toBeDefined();
      expect(currentProps?.newsletterSlugs).toEqual('slugs');
      expect(currentProps?.keyFetchToken).toEqual(MOCK_KEY_FETCH_TOKEN);
      expect(currentProps?.unwrapBKey).toEqual(MOCK_UNWRAP_BKEY);
    });
  });

  describe('email bounce status', () => {
    beforeEach(() => {
      mockAuthClient.emailBounceStatus.mockResolvedValue({
        hasHardBounce: true,
      });
    });

    it('redirects to email-first signup if there is a bounce on signup', async () => {
      render();

      await waitFor(() =>
        expect(screen.getByText('confirm signup code mock')).toBeInTheDocument()
      );
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledWith(MOCK_EMAIL);
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/', {
          state: { hasBounced: true, prefillEmail: MOCK_EMAIL },
        })
      );
    });

    it('redirects to signin_bounced if there is a bounce that is not on signup', async () => {
      mockLocation(false);
      render();

      await waitFor(() =>
        expect(screen.getByText('confirm signup code mock')).toBeInTheDocument()
      );
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledWith(MOCK_EMAIL);
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/signin_bounced')
      );
    });
  });

  describe('email bounce polling', () => {
    // 120 calls: the initial check, plus one per 5 second tick, until the 10
    // minute deadline. Pinned rather than derived from the constants.
    const EXPECTED_POLL_COUNT = 120;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthClient.emailBounceStatus.mockResolvedValue({
        hasHardBounce: false,
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    // Fake timers do not settle promises, so each advance runs inside act() to
    // let the pending emailBounceStatus calls resolve. Pass 0 to only settle.
    async function advanceTimers(ms: number) {
      await act(async () => {
        jest.advanceTimersByTime(ms);
      });
    }

    it('stops polling once the timeout has elapsed', async () => {
      render();
      await advanceTimers(POLL_TIMEOUT);
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledTimes(
        EXPECTED_POLL_COUNT
      );

      await advanceTimers(POLL_TIMEOUT);
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledTimes(
        EXPECTED_POLL_COUNT
      );
    });

    it('stops polling on elapsed time rather than on a tick count', async () => {
      render();
      await advanceTimers(0);

      // A backgrounded tab throttles the interval, so the clock passes the
      // deadline after far fewer than 120 ticks.
      jest.setSystemTime(Date.now() + POLL_TIMEOUT);
      await advanceTimers(POLL_INTERVAL * 2);
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledTimes(1);
    });

    it.each([
      { code: 429, errno: 114 },
      { code: 500, errno: 999 },
    ])('stops polling when the request fails with a $code', async (error) => {
      mockAuthClient.emailBounceStatus.mockRejectedValue(error);
      render();
      await advanceTimers(0);

      await advanceTimers(POLL_INTERVAL * 3);
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledTimes(1);
    });

    it('keeps polling when the request fails without a status code', async () => {
      mockAuthClient.emailBounceStatus.mockRejectedValue(
        new Error('Network error')
      );
      render();
      await advanceTimers(0);

      await advanceTimers(POLL_INTERVAL * 3);
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledTimes(4);
    });

    it('keeps polling after a stale check from an earlier effect run fails', async () => {
      let failStaleCheck!: (error: unknown) => void;
      mockAuthClient.emailBounceStatus.mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          failStaleCheck = reject;
        })
      );
      // rerender re-applies the wrapper, so the provider stays put and the
      // effect re-runs on the same component instance instead of remounting.
      const { rerender } = rtlRender(containerTree(), {
        wrapper: LocalizationWrapper,
      });
      await advanceTimers(0);
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledTimes(1);

      // A new auth client re-runs the effect, so the check still in flight
      // belongs to the run that just ended.
      const nextAuthClient = {
        emailBounceStatus: jest
          .fn()
          .mockResolvedValue({ hasHardBounce: false }),
      };
      (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
        () => nextAuthClient
      );
      await act(async () => {
        rerender(containerTree());
      });

      // The stale check fails with a 4xx, which stops the run that owns it.
      await act(async () => {
        failStaleCheck({ code: 429, errno: 114 });
      });

      await advanceTimers(POLL_INTERVAL * 2);
      expect(nextAuthClient.emailBounceStatus).toHaveBeenCalledTimes(3);
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledTimes(1);
    });

    it('stops polling once a hard bounce is found', async () => {
      mockAuthClient.emailBounceStatus.mockResolvedValue({
        hasHardBounce: true,
      });
      render();
      await advanceTimers(0);

      await advanceTimers(POLL_INTERVAL * 3);
      expect(mockAuthClient.emailBounceStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('renders-spinner', () => {
    it('has no account in location state or local storage', async () => {
      mockLocation(false, false);
      jest.spyOn(CacheModule, 'currentAccount').mockImplementationOnce(() => {
        return {} as StoredAccountData;
      });

      render();
      await waitFor(() =>
        expect(screen.getByText('loading spinner mock')).toBeInTheDocument()
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('handles oAuthDataError', () => {
    it('displays error', async () => {
      jest
        .spyOn(HooksModule, 'useFinishOAuthFlowHandler')
        .mockImplementation(() => {
          return {
            finishOAuthFlowHandler: jest
              .fn()
              .mockImplementation(
                (accountUid, sessionToken, keyFetchToken, unwrapKB) => {
                  return {
                    redirect: 'http://localhost:8080/123done',
                    code: 'oac123',
                    state: 'oacs123',
                  };
                }
              ),
            oAuthDataError: {
              message:
                'Something went wrong. Please close this tab and try again.',
              errno: 1,
              version: 1,
            },
          };
        });
      render();
      await waitFor(() =>
        expect(screen.getByText('Bad Request')).toBeInTheDocument()
      );
      expect(screen.getByText('Unexpected error')).toBeInTheDocument();
      expect(GleanMetrics.signupConfirmation.error).toHaveBeenCalledWith({
        event: { reason: '1' },
      });
    });
  });
  describe('useOAuthKeysCheck', () => {
    it('renders error component when value is undefined for non-OAuthNative', () => {
      integration = {
        type: ModelsModule.IntegrationType.OAuthWeb,
        requiresKeys: () => true,
        wantsKeys: () => true,
        getCmsInfo: () => undefined,
      } as Integration;
      mockSensitiveDataClient.getDataType = jest.fn().mockReturnValue({
        keyFetchToken: undefined,
        unwrapBKey: undefined,
      });
      render();
      expect(mockNavigate).toHaveBeenCalledWith('/signin', {
        state: { localizedErrorMessage: 'Code expired. Please sign in again.' },
      });
    });
  });

  describe('useOAuthFlowRecovery', () => {
    it('navigates to signin with error when recovery fails for OAuthNative', async () => {
      integration = {
        type: ModelsModule.IntegrationType.OAuthNative,
        requiresKeys: () => true,
        wantsKeys: () => true,
        getCmsInfo: () => undefined,
      } as Integration;
      mockSensitiveDataClient.getDataType = jest.fn().mockReturnValue({
        keyFetchToken: undefined,
        unwrapBKey: undefined,
      });
      jest
        .spyOn(OAuthFlowRecoveryModule, 'useOAuthFlowRecovery')
        .mockReturnValue({
          isRecovering: false,
          recoveryFailed: true,
          attemptOAuthFlowRecovery: jest
            .fn()
            .mockResolvedValue({ success: false }),
        });

      render();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signin', {
          state: {
            localizedErrorMessage:
              'Something went wrong. Please sign in again.',
          },
        });
      });
    });
  });
});
