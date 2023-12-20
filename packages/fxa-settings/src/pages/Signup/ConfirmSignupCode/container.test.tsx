/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as LoadingSpinnerModule from 'fxa-react/components/LoadingSpinner';
import * as ConfirmSignupCodeModule from './index';
import * as ModelsModule from '../../../models';
import * as HooksModule from '../../../lib/oauth/hooks';
import * as CacheModule from '../../../lib/cache';
import * as ReachRouterModule from '@reach/router';
import * as SentryModule from 'fxa-shared/sentry/browser';
import * as ReactUtils from 'fxa-react/lib/utils';

import { screen } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import { StoredAccountData } from '../../../lib/storage-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SignupConfirmCodeContainer from './container';
import { Integration, IntegrationType } from '../../../models';

// Setup mocks

// Models cannot be mocked using jest.spyOn...
jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
  };
});

// Global instances
let integration: Integration;
let mockAuthClient = new AuthClient('localhost:9000');
let currentProps: any | undefined;

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
  jest.spyOn(LoadingSpinnerModule, 'LoadingSpinner').mockImplementation(() => {
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
  jest.spyOn(URLSearchParams.prototype, 'delete');
  jest.spyOn(CacheModule, 'currentAccount').mockImplementation(() => {
    return {
      email: 'foo@mozilla.com',
      sessionToken: 'st123',
      uid: 'uid123',
    } as StoredAccountData;
  });
  jest.spyOn(ReachRouterModule, 'useLocation').mockImplementation(() => {
    return {
      state: {
        selectedNewsletterSlugs: 'slugs',
        keyFetchToken: 'kft123',
        unwrapBKey: 'bk123',
      },
    } as ReturnType<typeof ReachRouterModule.useLocation>;
  });
  jest.spyOn(SentryModule.default, 'captureException');
  jest
    .spyOn(ReactUtils, 'hardNavigateToContentServer')
    .mockImplementation(() => {});
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

      expect(currentProps?.email).toEqual('foo@mozilla.com');
      expect(currentProps?.uid).toEqual('uid123');
      expect(currentProps?.sessionToken).toEqual('st123');
      expect(currentProps?.integration).toBeDefined();
      expect(currentProps?.finishOAuthFlowHandler).toBeDefined();
      expect(currentProps?.newsletterSlugs).toEqual('slugs');
      expect(currentProps?.keyFetchToken).toEqual('kft123');
      expect(currentProps?.unwrapBKey).toEqual('bk123');
    });
  });

  describe('renders-spinner', () => {
    it('has no account', async () => {
      jest.spyOn(CacheModule, 'currentAccount').mockImplementation(() => {
        return {} as StoredAccountData;
      });
      await render('loading spinner mock');
      expect(URLSearchParams.prototype.delete).toBeCalledWith('email');
      expect(URLSearchParams.prototype.delete).toBeCalledWith(
        'emailFromContent'
      );
      expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith(
        expect.stringMatching(/^\/\?*./)
      );
    });

    it('has no keyFetchToken or unwrapBKey and is an oauth integration', async () => {
      integration.type = IntegrationType.OAuth;
      jest.spyOn(ReachRouterModule, 'useLocation').mockImplementation(() => {
        return {
          state: {
            selectedNewsletterSlugs: 'slugs',
          },
        } as ReturnType<typeof ReachRouterModule.useLocation>;
      });
      await render('loading spinner mock');
      expect(SentryModule.default.captureException).toBeCalled();
      expect(URLSearchParams.prototype.delete).toBeCalledWith(
        'emailFromContent'
      );
      expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith(
        expect.stringMatching(/^\/signin\?*./)
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
