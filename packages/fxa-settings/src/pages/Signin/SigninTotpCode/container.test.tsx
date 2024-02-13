/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mocked Module Imports
import * as SigninTotpCodeModule from './index';
import * as UseValidateModule from '../../../lib/hooks/useValidate';
import * as CacheModule from '../../../lib/cache';
import * as UtilsModule from 'fxa-react/lib/utils';
import * as ReachRouterModule from '@reach/router';
import * as LoadingSpinnerModule from 'fxa-react/components/LoadingSpinner';
import * as ApolloModule from '@apollo/client';

// Regular imports
import { screen } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import { SigninTotpCodeContainer } from './container';
import { MozServices } from '../../../lib/types';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import VerificationMethods from '../../../constants/verification-methods';
import VerificationReasons from '../../../constants/verification-reasons';
import { SigninTotpCodeProps } from './index';
import { ApolloClient } from '@apollo/client';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

let currentPageProps: SigninTotpCodeProps | undefined;
function mockSigninTotpModule() {
  currentPageProps = undefined;
  jest
    .spyOn(SigninTotpCodeModule, 'SigninTotpCode')
    .mockImplementation((props) => {
      currentPageProps = props;
      return <div>signin totp code mock</div>;
    });
}

function mockLoadingSpinnerModule() {
  jest.spyOn(LoadingSpinnerModule, 'LoadingSpinner').mockImplementation(() => {
    return <div>loading spinner mock</div>;
  });
}

function mockUseValidateModule(opts: any = {}) {
  jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
    queryParamModel: {
      redirectTo: '',
      verificationReason: 'login',
      service: 'sync',
      ...opts,
    },
    validationError: undefined,
  });
}

function mockCache(opts: any = {}, isEmpty = false) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(
    isEmpty
      ? undefined
      : {
          sessionToken: '123',
          ...(opts || {}),
        }
  );
}

let mockHardNavigate = jest.fn();
function mockUtils() {
  mockHardNavigate.mockReset();
  jest.spyOn(UtilsModule, 'hardNavigate').mockImplementation(mockHardNavigate);
}

let mockNavigate = jest.fn();
function mockReachRouter(opts?: { verificationMethod?: string }) {
  mockNavigate.mockReset();
  jest.spyOn(ReachRouterModule, 'useNavigate').mockReturnValue(mockNavigate);
  jest.spyOn(ReachRouterModule, 'useLocation').mockImplementation(() => {
    return {
      ...global.window.location,
      state: {
        verificationMethod:
          opts?.verificationMethod || VerificationMethods.TOTP_2FA,
        verificationReason: VerificationReasons.SIGN_IN,
      },
    };
  });
}

let mockVerifyTotpMutation: jest.Mock;
function mockVerifyTotp(success: boolean = true, errorOut: boolean = false) {
  mockVerifyTotpMutation = jest.fn();
  mockVerifyTotpMutation.mockImplementation(async () => {
    if (errorOut) {
      throw new Error();
    }
    return {
      data: {
        verifyTotp: {
          success,
        },
      },
    };
  });

  jest.spyOn(ApolloModule, 'useMutation').mockReturnValue([
    async (...args: any[]) => {
      return mockVerifyTotpMutation(...args);
    },
    {
      loading: false,
      called: true,
      client: {} as ApolloClient<any>,
      reset: () => {},
    },
  ]);
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockSigninTotpModule();
  mockLoadingSpinnerModule();
  mockUseValidateModule();
  mockCache();
  mockReachRouter();
  mockUtils();
  mockVerifyTotp();
}

describe('signin container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  /** Renders the container with a fake page component */
  async function render(waitForPageToRender = true) {
    renderWithLocalizationProvider(
      <LocationProvider>
        <SigninTotpCodeContainer
          {...{
            serviceName: MozServices.Default,
          }}
        />
      </LocationProvider>
    );

    if (waitForPageToRender) {
      await screen.findByText('signin totp code mock');
    }
  }

  it('validates code and goes to settings', async () => {
    await render();
    expect(SigninTotpCodeModule.SigninTotpCode).toBeCalled();
    const result = await currentPageProps?.submitTotpCode('123456');
    currentPageProps?.handleNavigation();

    expect(result?.status).toBeTruthy();
    expect(mockHardNavigate).toBeCalledTimes(0);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith('/settings');
  });

  it('validates code and goes to redirectTo location', async () => {
    mockUseValidateModule({
      redirectTo: 'http://foo.com',
    });

    await render();
    expect(SigninTotpCodeModule.SigninTotpCode).toBeCalled();
    const result = await currentPageProps?.submitTotpCode('123456');
    currentPageProps?.handleNavigation();

    expect(result?.status).toBeTruthy();
    expect(mockHardNavigate).toBeCalledTimes(1);
    expect(mockHardNavigate).toBeCalledWith('http://foo.com');
    expect(mockNavigate).toBeCalledTimes(0);
  });

  it('shows invalid code error', async () => {
    mockVerifyTotp(false);

    await render();
    expect(SigninTotpCodeModule.SigninTotpCode).toBeCalled();

    const result = await currentPageProps?.submitTotpCode('123456');
    expect(result?.status).toBeFalsy();
  });

  it('handles general error', async () => {
    mockVerifyTotp(true, true);
    await render();

    expect(SigninTotpCodeModule.SigninTotpCode).toBeCalled();

    const result = await currentPageProps?.submitTotpCode('123456');
    expect(result?.status).toBeFalsy();
    expect(result?.error).toEqual(AuthUiErrors.UNEXPECTED_ERROR);
  });

  it('redirects if there is no storedLocalAccount', async () => {
    mockCache({}, true);
    await render(false);
    expect(mockNavigate).toBeCalledWith('/signin');
  });

  it('redirects if there is sessionToken', async () => {
    mockCache({ sessionToken: '' });
    await render(false);
    expect(mockNavigate).toBeCalledWith('/signin');
  });

  it('redirects if verification method is not totp', async () => {
    mockReachRouter({ verificationMethod: 'foo' });
    await render(false);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith('/signin');
  });
});
