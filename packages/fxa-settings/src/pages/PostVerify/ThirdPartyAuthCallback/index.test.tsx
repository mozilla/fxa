/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ThirdPartyAuthCallback from '.';
import { AppContext, Integration } from '../../../models';
import { createAppContext, mockAppContext } from '../../../models/mocks';
import { useAccount, useIntegration } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { handleNavigation } from '../../Signin/utils';
import { isThirdPartyAuthCallbackIntegration } from '../../../models/integrations/third-party-auth-callback-integration';
import { QueryParams } from '../../../index';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useClientInfoState: jest.fn(),
  useProductInfoState: jest.fn(),
  useIntegration: jest.fn(),
  useAccount: jest.fn(),
}));

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: () => {
    return {
      search: '?',
    };
  },
}));

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

jest.mock(
  '../../../models/integrations/third-party-auth-callback-integration',
  () => {
    return {
      __esModule: true,
      isThirdPartyAuthCallbackIntegration: jest.fn(),
    };
  }
);

function renderWith(props?: {
  flowQueryParams?: QueryParams;
  integration?: Integration;
}) {
  return renderWithLocalizationProvider(
    <AppContext.Provider value={{ ...mockAppContext(), ...createAppContext() }}>
      <ThirdPartyAuthCallback {...props} />;
    </AppContext.Provider>
  );
}

describe('ThirdPartyAuthCallback component', () => {
  beforeEach(() => {
    (useFinishOAuthFlowHandler as jest.Mock).mockImplementation(() => ({
      finishOAuthFlowHandler: jest.fn(),
      oAuthDataError: null,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders as expected', async () => {
    renderWith({});
    screen.getByText(
      'Please wait, you are being redirected to the authorized application.'
    );
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

    const mockIntegration = {
      thirdPartyAuthParams: () => ({ code: 'code', provider: 'provider' }),
      getFxAParams: () => 'param=value',
    };
    (useIntegration as jest.Mock).mockReturnValue(mockIntegration);

    (
      isThirdPartyAuthCallbackIntegration as unknown as jest.Mock
    ).mockReturnValue(true);

    const mockFinishOAuthFlowHandler = jest.fn();
    (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
      finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
    });

    const mockHandleNavigation = jest.fn().mockResolvedValue({ error: null });
    (handleNavigation as jest.Mock).mockReturnValue(mockHandleNavigation);

    renderWith({
      flowQueryParams: {},
    });

    await waitFor(() => {
      expect(mockVerifyAccountThirdParty).toHaveBeenCalledWith(
        'code',
        'provider',
        undefined,
        expect.any(Object)
      );
    });
  });
});
