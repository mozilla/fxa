/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReactUtils from 'fxa-react/lib/utils';

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';
import { MozServices } from '../../../lib/types';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { mockOAuthNativeSigninIntegration, Subject } from './mocks';
import { MOCK_OAUTH_FLOW_HANDLER_RESPONSE } from '../../mocks';
import {
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeSyncIntegration,
} from '../mocks';
import { SigninIntegration } from '../interfaces';
import {
  FinishOAuthFlowHandler,
  tryAgainError,
} from '../../../lib/oauth/hooks';
import firefox from '../../../lib/channels/firefox';
import * as utils from 'fxa-react/lib/utils';
import { navigate } from '@reach/router';
import { OAUTH_ERRORS } from '../../../lib/oauth';
import userEvent from '@testing-library/user-event';
import * as SigninUtils from '../utils';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    totpForm: {
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
  },
}));

const mockLocation = () => {
  return {
    pathname: '/signin_totp_cpde',
  };
};

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
  useLocation: () => mockLocation(),
}));

const serviceRelayText =
  'Firefox will try sending you back to use an email mask after you sign in.';

describe('Sign in with TOTP code page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    (GleanMetrics.totpForm.view as jest.Mock).mockClear();
    (GleanMetrics.totpForm.submit as jest.Mock).mockClear();
    (GleanMetrics.totpForm.success as jest.Mock).mockClear();
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);

    const headingEl = screen.getByRole('heading', { level: 2 });
    expect(headingEl).toHaveTextContent('Enter two-step authentication code');
    screen.getByLabelText('Enter 6-digit code');

    // submit button is disabled by default until code entered in input
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    screen.getByRole('link', { name: 'Use a different account' });
    screen.getByRole('link', { name: 'Trouble entering code?' });
    expect(screen.queryByText(serviceRelayText)).not.toBeInTheDocument();
  });

  it('enables submit button when code entered', async () => {
    renderWithLocalizationProvider(<Subject />);

    const inputEl = screen.getByLabelText('Enter 6-digit code');
    await waitFor(() => userEvent.type(inputEl, '123456'));
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  it('renders expected service=relay text', () => {
    renderWithLocalizationProvider(
      <Subject integration={mockOAuthNativeSigninIntegration(false)} />
    );
    screen.getByText(serviceRelayText);
  });

  it('shows the relying party in the header when a service name is provided', () => {
    renderWithLocalizationProvider(
      <Subject
        {...{
          serviceName: MozServices.MozillaVPN,
        }}
      />
    );
    const headingEl = screen.getByRole('heading', { level: 2 });
    expect(headingEl).toHaveTextContent('Enter two-step authentication code');
  });

  it('emits a metrics event on render', () => {
    renderWithLocalizationProvider(<Subject />);
    expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
    expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(0);
    expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(0);
  });

  describe('submit totp code', () => {
    async function renderAndSubmitTotpCode(
      response: {
        error?: AuthUiError;
      },
      finishOAuthFlowHandler?: FinishOAuthFlowHandler,
      integration?: SigninIntegration
    ) {
      const submitTotpCode = jest.fn().mockImplementation(async () => {
        return response;
      });
      renderWithLocalizationProvider(
        <Subject
          {...{
            finishOAuthFlowHandler,
            integration,
            submitTotpCode,
          }}
        />
      );

      fireEvent.input(screen.getByLabelText('Enter 6-digit code'), {
        target: { value: '123456' },
      });
      screen.getByRole('button', { name: 'Confirm' }).click();
      await waitFor(() =>
        expect(submitTotpCode).toHaveBeenCalledWith('123456')
      );

      return { submitTotpCode };
    }

    it('submitsTotpCode and navigates', async () => {
      await renderAndSubmitTotpCode({});

      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith('/settings', { replace: false });
    });

    describe('fxaLogin webchannel message', () => {
      let fxaLoginSpy: jest.SpyInstance;
      let hardNavigateSpy: jest.SpyInstance;
      beforeEach(() => {
        fxaLoginSpy = jest.spyOn(firefox, 'fxaLogin');
        hardNavigateSpy = jest
          .spyOn(utils, 'hardNavigate')
          .mockImplementation(() => {});
      });
      it('is sent if Sync integration and navigates to pair', async () => {
        const integration = createMockSigninOAuthNativeSyncIntegration();
        await waitFor(() =>
          renderAndSubmitTotpCode({}, undefined, integration)
        );
        expect(fxaLoginSpy).toHaveBeenCalled();
        expect(hardNavigateSpy).toHaveBeenCalledWith(
          '/pair?showSuccessMessage=true',
          undefined,
          undefined,
          true
        );
      });
      it('is not sent otherwise', async () => {
        await renderAndSubmitTotpCode({});
        expect(fxaLoginSpy).not.toHaveBeenCalled();
        expect(hardNavigateSpy).not.toHaveBeenCalled();
      });
    });

    it('shows error on invalid code', async () => {
      await renderAndSubmitTotpCode({
        error: AuthUiErrors.INVALID_TOTP_CODE,
      });

      screen.getByText('Invalid two-step authentication code');
      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(0);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('shows general error on unexpected error', async () => {
      await renderAndSubmitTotpCode({
        error: AuthUiErrors.UNEXPECTED_ERROR,
      });

      screen.getByText('Unexpected error');
      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(0);
      expect(navigate).not.toHaveBeenCalled();
    });

    describe('with OAuth integration', () => {
      const integration = createMockSigninOAuthIntegration();
      it('navigates to relying party on success', async () => {
        const finishOAuthFlowHandler = jest
          .fn()
          .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
        const hardNavigate = jest
          .spyOn(ReactUtils, 'hardNavigate')
          .mockImplementationOnce(() => {});

        await waitFor(() =>
          renderAndSubmitTotpCode({}, finishOAuthFlowHandler, integration)
        );

        expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(1);
        await waitFor(() =>
          expect(hardNavigate).toHaveBeenCalledWith(
            'someUri',
            undefined,
            undefined,
            true
          )
        );
      });

      it('shows an error banner for an OAuth error', async () => {
        const finishOAuthFlowHandler = jest
          .fn()
          .mockReturnValueOnce(tryAgainError());
        await waitFor(() =>
          renderAndSubmitTotpCode({}, finishOAuthFlowHandler, integration)
        );
        await waitFor(() => {
          screen.getByText(OAUTH_ERRORS.TRY_AGAIN.message);
        });
      });

      it('does not navigate if integration isFirefoxMobileClient', async () => {
        const handleNavigationSpy = jest.spyOn(SigninUtils, 'handleNavigation');
        const integration = createMockSigninOAuthNativeSyncIntegration({
          isMobile: true,
        });
        renderAndSubmitTotpCode({}, undefined, integration);
        await waitFor(() => {
          expect(handleNavigationSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              performNavigation: false,
            })
          );
        });
      });
    });
  });
});
