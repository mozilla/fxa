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

import { screen } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import { StoredAccountData } from '../../../lib/storage-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SignupConfirmCodeContainer from './container';
import { Integration } from '../../../models';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
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
let mockAuthClient = new AuthClient('localhost:9000');
let currentProps: any | undefined;
let mockEmailBounceStatusQuery = jest.fn();

function mockLocation(
  originIsSignup: boolean = true,
  withIntegrationProps: boolean = true
) {
  jest.spyOn(ReachRouterModule, 'useLocation').mockImplementation(() => {
    return {
      state: {
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

// Setup default mocks
function applyMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  integration = {
    type: ModelsModule.IntegrationType.OAuth,
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
  jest.spyOn(CacheModule, 'currentAccount').mockImplementation(() => {
    return {
      email: MOCK_EMAIL,
      sessionToken: MOCK_SESSION_TOKEN,
    } as StoredAccountData;
  });
  mockLocation();
  jest.spyOn(SentryModule.default, 'captureException');
  jest
    .spyOn(ReactUtils, 'hardNavigateToContentServer')
    .mockImplementation(() => {});

  mockEmailBounceQuery();
}

async function render(text?: string) {
  renderWithLocalizationProvider(
    <SignupConfirmCodeContainer
      {...{
        integration,
      }}
    />
  );
  await screen.findByText(text || 'confirm signup code mock');
}

describe('confirm-singup-container', () => {
  beforeEach(() => {
    applyMocks();
  });

  describe('renders-default-state', () => {
    it('renders as expected', async () => {
      await render();

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
      await render();
      expect(mockEmailBounceStatusQuery).toBeCalled();
      expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith(
        '/?bouncedEmail=johndope%40example.com'
      );
    });

    it('redirects to signin_bounced if there is a bounce that is not on signup', async () => {
      mockLocation(false);
      await render();
      expect(mockEmailBounceStatusQuery).toBeCalled();
      expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith(
        '/signin_bounced?bouncedEmail=johndope%40example.com'
      );
    });
  });

  describe('renders-spinner', () => {
    it('has no account', async () => {
      jest.spyOn(CacheModule, 'currentAccount').mockImplementation(() => {
        return {} as StoredAccountData;
      });
      await render('loading spinner mock');
      expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith(
        expect.stringMatching('/')
      );
    });

    it('has no keyFetchToken or unwrapBKey and is an oauth integration', async () => {
      mockLocation(true, false);
      await render('loading spinner mock');
      expect(SentryModule.default.captureException).toBeCalled();
      expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith(
        expect.stringMatching('/')
      );
    });

    it('has missing integration', async () => {
      // Testing type safety violation
      integration = undefined as any as Integration;
      await render('loading spinner mock');
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
            oAuthDataError: new Error('BOOM'),
          };
        });
      await render('Unexpected error');
    });
  });
});
