/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReactUtils from 'fxa-react/lib/utils';

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import GleanMetrics from '../../../lib/glean';
import { MozServices } from '../../../lib/types';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { Subject } from './mocks';
import { MOCK_OAUTH_FLOW_HANDLER_RESPONSE } from '../../mocks';
import {
  createMockSigninOAuthIntegration,
  createMockSigninSyncIntegration,
} from '../mocks';
import { SigninIntegration } from '../interfaces';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import firefox from '../../../lib/channels/firefox';
import * as utils from 'fxa-react/lib/utils';

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
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

describe('Sign in with TOTP code page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    (GleanMetrics.totpForm.view as jest.Mock).mockClear();
    (GleanMetrics.totpForm.submit as jest.Mock).mockClear();
    (GleanMetrics.totpForm.success as jest.Mock).mockClear();
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter authentication code to continue to account settings'
    );
    screen.getByLabelText('Enter 6-digit code');

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('link', { name: 'Use a different account' });
    screen.getByRole('link', { name: 'Trouble entering code?' });
  });

  it('shows the relying party in the header when a service name is provided', () => {
    renderWithLocalizationProvider(
      <Subject
        {...{
          serviceName: MozServices.MozillaVPN,
        }}
      />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter authentication code to continue to Mozilla VPN'
    );
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
        status: boolean;
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
      await waitFor(() => expect(submitTotpCode).toBeCalledWith('123456'));

      return { submitTotpCode };
    }

    it('submitsTotpCode and navigates', async () => {
      await renderAndSubmitTotpCode({
        status: true,
      });

      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    // When CAD is converted to React, just test navigation since CAD will handle fxaLogin
    describe('fxaLogin webchannel message (tempHandleSyncLogin)', () => {
      let fxaLoginSpy: jest.SpyInstance;
      let hardNavigateSpy: jest.SpyInstance;
      beforeEach(() => {
        fxaLoginSpy = jest.spyOn(firefox, 'fxaLogin');
        hardNavigateSpy = jest
          .spyOn(utils, 'hardNavigate')
          .mockImplementation(() => {});
      });
      it('is sent if Sync integration and navigates to CAD', async () => {
        const integration = createMockSigninSyncIntegration();
        await waitFor(() =>
          renderAndSubmitTotpCode(
            {
              status: true,
            },
            undefined,
            integration
          )
        );
        expect(fxaLoginSpy).toHaveBeenCalled();
        expect(hardNavigateSpy).toHaveBeenCalledWith(
          '/connect_another_device?showSuccessMessage=true'
        );
      });
      it('is not sent otherwise', async () => {
        await renderAndSubmitTotpCode({
          status: true,
        });
        expect(fxaLoginSpy).not.toHaveBeenCalled();
        expect(hardNavigateSpy).not.toBeCalled();
      });
    });

    it('shows error on invalid code', async () => {
      await renderAndSubmitTotpCode({
        status: false,
      });

      screen.getByText('Invalid two-step authentication code');
      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('shows general error on unexpected error', async () => {
      await renderAndSubmitTotpCode({
        status: false,
        error: AuthUiErrors.UNEXPECTED_ERROR,
      });

      screen.getByText('Unexpected error');
      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    describe('with OAuth integration', () => {
      it('navigates to relying party on success', async () => {
        const finishOAuthFlowHandler = jest
          .fn()
          .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
        const integration = createMockSigninOAuthIntegration();
        const hardNavigate = jest
          .spyOn(ReactUtils, 'hardNavigate')
          .mockImplementationOnce(() => {});

        await waitFor(() =>
          renderAndSubmitTotpCode(
            {
              status: true,
            },
            finishOAuthFlowHandler,
            integration
          )
        );

        expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(1);
        await waitFor(() =>
          expect(hardNavigate).toHaveBeenCalledWith('someUri')
        );
      });
    });
  });
});
