/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as LoadingSpinnerModule from 'fxa-react/components/LoadingSpinner';
import * as ConfirmSignupCodeModule from './index';
import * as ModelsModule from '../../../models';
import * as HooksModule from '../../../lib/oauth/hooks';
import * as CacheModule from '../../../lib/cache';
import * as ApolloModule from '@apollo/client';
import * as ReachRouterModule from '@reach/router';
import * as SentryModule from 'fxa-shared/sentry/browser';
import * as ReactUtils from 'fxa-react/lib/utils';

import { screen, waitFor } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import { StoredAccountData } from '../../../lib/storage-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SignupConfirmCodeContainer from './container';
import { Integration } from '../../../models';
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
  };
});

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

// Global instances
let integration: Integration;
let mockAuthClient = new AuthClient('localhost:9000', { keyStretchVersion: 1 });
let currentProps: any | undefined;
let mockEmailBounceStatusQuery = jest.fn();

function mockLocation(
  originIsSignup: boolean = true,
  withIntegrationProps: boolean = true,
  withAccountInfo: boolean = true
) {
  jest.spyOn(ReachRouterModule, 'useLocation').mockImplementation(() => {
    return {
      state: {
        uid: withAccountInfo ? MOCK_UID : undefined,
        email: withAccountInfo ? MOCK_EMAIL : undefined,
        sessionToken: withAccountInfo ? MOCK_SESSION_TOKEN : undefined,
        origin: originIsSignup ? 'signup' : null,
        selectedNewsletterSlugs: 'slugs',
        keyFetchToken: withIntegrationProps ? MOCK_KEY_FETCH_TOKEN : null,
        unwrapBKey: withIntegrationProps ? MOCK_UNWRAP_BKEY : null,
      },
    } as ReturnType<typeof ReachRouterModule.useLocation>;
  });
}

function mockEmailBounceQuery() {
  mockEmailBounceStatusQuery.mockImplementation(() => {
    return {
      data: {
        emailBounceStatus: {
          hasHardBounce: false,
        },
      },
    };
  });

  jest
    .spyOn(ApolloModule, 'useQuery')
    .mockReturnValue(mockEmailBounceStatusQuery());
}

// Apply default mocks
function applyMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  integration = {
    type: ModelsModule.IntegrationType.OAuthWeb,
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

  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
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
  jest.spyOn(SentryModule.default, 'captureException');
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});

  mockEmailBounceQuery();
}

async function render() {
  renderWithLocalizationProvider(
    <SignupConfirmCodeContainer
      {...{
        integration,
      }}
      flowQueryParams={{ flowId: MOCK_FLOW_ID }}
    />
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
      mockLocation(true, true, false);
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

  describe('email bounce query', () => {
    beforeEach(() => {
      mockEmailBounceStatusQuery.mockImplementation(() => {
        return {
          data: {
            emailBounceStatus: {
              hasHardBounce: true,
            },
          },
        };
      });
      jest
        .spyOn(ApolloModule, 'useQuery')
        .mockReturnValue(mockEmailBounceStatusQuery());
    });

    it('redirects to email-first signup if there is a bounce on signup', async () => {
      render();

      await waitFor(() =>
        expect(screen.getByText('confirm signup code mock')).toBeInTheDocument()
      );
      expect(mockEmailBounceStatusQuery).toBeCalled();
      expect(ReactUtils.hardNavigate).toBeCalledWith(
        `/?bouncedEmail=${encodeURIComponent(MOCK_EMAIL)}`
      );
    });

    it('redirects to signin_bounced if there is a bounce that is not on signup', async () => {
      mockLocation(false);
      render();

      await waitFor(() =>
        expect(screen.getByText('confirm signup code mock')).toBeInTheDocument()
      );
      expect(mockEmailBounceStatusQuery).toBeCalled();
      expect(ReactUtils.hardNavigate).toBeCalledWith(
        `/signin_bounced?bouncedEmail=${encodeURIComponent(MOCK_EMAIL)}`
      );
    });
  });

  describe('renders-spinner', () => {
    it('has no account in location state or local storage', async () => {
      mockLocation(false, false, false);
      jest.spyOn(CacheModule, 'currentAccount').mockImplementationOnce(() => {
        return {} as StoredAccountData;
      });

      render();
      await waitFor(() =>
        expect(screen.getByText('loading spinner mock')).toBeInTheDocument()
      );
      expect(ReactUtils.hardNavigate).toBeCalledWith(
        expect.stringMatching('/')
      );
    });

    it('has missing integration', async () => {
      // Testing type safety violation
      integration = undefined as any as Integration;
      render();
      await waitFor(() =>
        expect(screen.getByText('loading spinner mock')).toBeInTheDocument()
      );
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
            oAuthDataError: { message: 'BOOM', errno: 1 },
          };
        });
      render();
      await waitFor(() =>
        expect(screen.getByText('Bad Request')).toBeInTheDocument()
      );
      expect(screen.getByText('Unexpected error')).toBeInTheDocument();
    });
  });
});
