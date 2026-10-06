/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MemoryRouter } from 'react-router';
import { screen, waitFor } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import * as ModelsModule from '../../../models';
import * as CacheModule from '../../../lib/cache';
import * as StorageUtils from '../../../lib/storage-utils';
import * as ForcePasswordChangeModule from '.';
import * as SigninUtils from '../../Signin/utils';
import ForcePasswordChangeContainer from './container';
import { ForcePasswordChangeProps } from './interfaces';
import firefox from '../../../lib/channels/firefox';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
} from '../../mocks';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../../../lib/oauth/hooks.tsx', () => ({
  __esModule: true,
  useFinishOAuthFlowHandler: jest.fn(),
}));

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks', () => ({
  ...jest.requireActual('../../../lib/hooks'),
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

const NEW_SESSION_TOKEN = 'newSessionToken';
const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
const mockIntegration = {
  wantsKeys: () => true,
  isFirefoxMobileClient: () => false,
} as unknown as ModelsModule.Integration;

let pageProps: ForcePasswordChangeProps | undefined;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  pageProps = undefined;

  mockAuthClient.accountEmails = jest
    .fn()
    .mockResolvedValue({ primary: MOCK_EMAIL, original: MOCK_EMAIL });
  mockAuthClient.passwordChange = jest.fn().mockResolvedValue({
    uid: MOCK_UID,
    sessionToken: NEW_SESSION_TOKEN,
    verified: true,
    keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    unwrapBKey: MOCK_UNWRAP_BKEY,
  });
  (ModelsModule.useAuthClient as jest.Mock).mockReturnValue(mockAuthClient);
  (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
    finishOAuthFlowHandler: jest.fn(),
    oAuthDataError: null,
  });
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue({
    uid: MOCK_UID,
    email: MOCK_EMAIL,
    sessionToken: MOCK_SESSION_TOKEN,
  });
  jest.spyOn(StorageUtils, 'storeAccountData').mockImplementation(() => {});
  jest.spyOn(firefox, 'passwordChanged').mockImplementation(() => {});
  jest
    .spyOn(SigninUtils, 'handleNavigation')
    .mockResolvedValue({ error: undefined });
  jest
    .spyOn(ForcePasswordChangeModule, 'default')
    .mockImplementation((props) => {
      pageProps = props;
      return <div>force password change mock</div>;
    });
});

function render() {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <ForcePasswordChangeContainer
        integration={mockIntegration}
        useFxAStatusResult={mockUseFxAStatus()}
      />
    </MemoryRouter>
  );
}

describe('ForcePasswordChange container', () => {
  it('redirects to email-first when there is no signed-in account', async () => {
    jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(undefined);
    render();

    await waitFor(() =>
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/', {
        replace: true,
      })
    );
    expect(
      screen.queryByText('force password change mock')
    ).not.toBeInTheDocument();
  });

  it('changes the password, stores the new session, and navigates', async () => {
    render();
    expect(pageProps?.email).toBe(MOCK_EMAIL);

    const result = await pageProps!.changePasswordHandler('old', 'new');

    expect(result).toEqual({ error: null });
    expect(mockAuthClient.passwordChange).toHaveBeenCalledWith(
      { primary: MOCK_EMAIL, original: MOCK_EMAIL },
      'old',
      'new',
      MOCK_SESSION_TOKEN,
      { keys: true }
    );
    expect(StorageUtils.storeAccountData).toHaveBeenCalledWith({
      uid: MOCK_UID,
      email: MOCK_EMAIL,
      sessionToken: NEW_SESSION_TOKEN,
      verified: true,
      sessionVerified: true,
      hasPassword: true,
    });
    expect(firefox.passwordChanged).toHaveBeenCalledWith(
      MOCK_EMAIL,
      MOCK_UID,
      NEW_SESSION_TOKEN,
      true,
      MOCK_KEY_FETCH_TOKEN,
      MOCK_UNWRAP_BKEY
    );
    expect(SigninUtils.handleNavigation).toHaveBeenCalledWith(
      expect.objectContaining({
        email: MOCK_EMAIL,
        signinData: {
          uid: MOCK_UID,
          sessionToken: NEW_SESSION_TOKEN,
          emailVerified: true,
          sessionVerified: true,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        },
        unwrapBKey: MOCK_UNWRAP_BKEY,
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
      })
    );
  });

  it('renders the OAuth data error instead of the page', () => {
    (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
      finishOAuthFlowHandler: jest.fn(),
      oAuthDataError: AuthUiErrors.UNEXPECTED_ERROR,
    });
    render();

    expect(
      screen.getByRole('heading', { name: 'Bad Request' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('force password change mock')
    ).not.toBeInTheDocument();
  });

  it('returns a known auth error, such as an incorrect old password', async () => {
    (mockAuthClient.passwordChange as jest.Mock).mockRejectedValue(
      AuthUiErrors.INCORRECT_PASSWORD
    );
    render();

    const result = await pageProps!.changePasswordHandler('old', 'new');

    expect(result.error).toEqual(AuthUiErrors.INCORRECT_PASSWORD);
    expect(StorageUtils.storeAccountData).not.toHaveBeenCalled();
    expect(SigninUtils.handleNavigation).not.toHaveBeenCalled();
  });

  it('returns an unexpected error for unknown failures', async () => {
    (mockAuthClient.passwordChange as jest.Mock).mockRejectedValue(
      new Error('boom')
    );
    render();

    const result = await pageProps!.changePasswordHandler('old', 'new');

    expect(result.error).toEqual(AuthUiErrors.UNEXPECTED_ERROR);
  });
});
