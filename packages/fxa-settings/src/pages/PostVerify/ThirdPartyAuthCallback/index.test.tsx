/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ModelsModule from '../../../models';
import * as utils from 'fxa-react/lib/utils';
import * as CacheModule from '../../../lib/cache';

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ThirdPartyAuthCallback from '.';
import { AppContext } from '../../../models';
import { createAppContext, mockAppContext } from '../../../models/mocks';
import { useAccount } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { handleNavigation } from '../../Signin/utils';
import { QueryParams } from '../../../index';
import { MOCK_EMAIL, MOCK_SESSION_TOKEN } from '../../mocks';
import { GenericData } from '../../../lib/model-data';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useClientInfoState: jest.fn(),
  useProductInfoState: jest.fn(),
  useAccount: jest.fn(),
  useAuthClient: () => {
    return {
      checkTotpTokenExists: jest.fn().mockResolvedValue({ verified: true }),
    };
  },
}));

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: () => {
    return {
      search: '?',
    };
  },
}));

function mockCurrentAccount(
  storedAccount = {
    uid: '123',
    sessionToken: MOCK_SESSION_TOKEN,
    email: MOCK_EMAIL,
  }
) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(storedAccount);
}

jest.mock('../../../lib/oauth/hooks', () => {
  return {
    __esModule: true,
    useFinishOAuthFlowHandler: jest.fn(),
  };
});

jest.mock('../../Signin/utils', () => {
  return {
    __esModule: true,
    handleNavigation: jest.fn(),
  };
});

function mockThirdPartyAuthCallbackIntegration({
  error,
}: { error?: string } = {}) {
  return new ModelsModule.ThirdPartyAuthCallbackIntegration(
    new GenericData({
      code: 'code',
      provider: 'google',
      error,
      state: encodeURIComponent(
        'https://accounts.firefox.com/?flowId=aaaa&flowBeginTime=1734112296000&utm_campaign=testo'
      ),
    })
  );
}

function mockWebIntegration({ redirectTo }: { redirectTo?: string } = {}) {
  return new ModelsModule.WebIntegration(
    new GenericData({
      redirect_to: redirectTo,
    })
  );
}

function renderWith(
  props: {
    flowQueryParams?: QueryParams;
    integration: ModelsModule.Integration;
  } = {
    flowQueryParams: {
      flowId: 'bbbb',
      flowBeginTime: 1734112296874,
    },
    integration: mockThirdPartyAuthCallbackIntegration(),
  }
) {
  return renderWithLocalizationProvider(
    <AppContext.Provider value={{ ...mockAppContext(), ...createAppContext() }}>
      <ThirdPartyAuthCallback {...props} />;
    </AppContext.Provider>
  );
}

describe('ThirdPartyAuthCallback component', () => {
  let hardNavigateSpy: jest.SpyInstance;
  let mockHandleNavigation: jest.Mock;
  beforeEach(() => {
    hardNavigateSpy = jest
      .spyOn(utils, 'hardNavigate')
      .mockImplementation(() => {});

    (useFinishOAuthFlowHandler as jest.Mock).mockImplementation(() => ({
      finishOAuthFlowHandler: jest.fn(),
      oAuthDataError: null,
    }));
    mockHandleNavigation = jest.fn().mockResolvedValue({ error: null });
    (handleNavigation as jest.Mock).mockReturnValue(mockHandleNavigation);
    mockCurrentAccount();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders as expected', async () => {
    renderWith();
    screen.getByTestId('loading-spinner');
  });

  it('verifies third-party auth response and navigates', async () => {
    const mockVerifyAccountThirdParty = jest.fn().mockResolvedValue({
      uid: 'uid',
      sessionToken: 'sessionToken',
      providerUid: 'providerUid',
      email: 'email@example.com',
    });
    const mockAccount = {
      verifyAccountThirdParty: mockVerifyAccountThirdParty,
    };
    (useAccount as jest.Mock).mockReturnValue(mockAccount);

    const mockFinishOAuthFlowHandler = jest.fn();
    (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
      finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
    });

    renderWith({
      flowQueryParams: {
        flowId: 'bbbb',
        flowBeginTime: 1734112296874,
      },
      integration: mockThirdPartyAuthCallbackIntegration(),
    });

    await waitFor(() => {
      expect(mockVerifyAccountThirdParty).toHaveBeenCalledWith(
        'code',
        'google',
        undefined,
        {
          utmCampaign: 'testo',
          flowId: 'aaaa',
          flowBeginTime: 1734112296000,
        }
      );
    });

    expect(hardNavigateSpy).toBeCalledWith(
      '/post_verify/third_party_auth/callback?flowId=aaaa&flowBeginTime=1734112296000&utm_campaign=testo'
    );
  });

  it('redirects to signin on third party auth error', async () => {
    const mockAccount = {};
    (useAccount as jest.Mock).mockReturnValue(mockAccount);

    const integration = mockThirdPartyAuthCallbackIntegration({
      error: 'access_denied',
    });

    const mockFinishOAuthFlowHandler = jest.fn();
    (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
      finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
    });

    renderWith({ integration });

    expect(hardNavigateSpy).toBeCalledWith(
      '/?flowId=aaaa&flowBeginTime=1734112296000&utm_campaign=testo'
    );
  });
  it('redirects to web redirect', async () => {
    const redirectTo = 'http://localhost/?surprisinglyValid';
    const mockFinishOAuthFlowHandler = jest.fn();

    (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
      finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
    });

    const integration = mockWebIntegration({ redirectTo });

    renderWith({ integration });

    await waitFor(() => {
      expect(handleNavigation).toBeCalledWith({
        email: 'johndope@example.com',
        finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
        handleFxaLogin: false,
        handleFxaOAuthLogin: false,
        integration: integration,
        isSignInWithThirdPartyAuth: true,
        queryParams: '?',
        redirectTo: redirectTo,
        signinData: {
          sessionToken: MOCK_SESSION_TOKEN,
          uid: '123',
          verificationMethod: 'totp-2fa',
          verificationReason: 'login',
          verified: false,
        },
      });
    });
  });
});
