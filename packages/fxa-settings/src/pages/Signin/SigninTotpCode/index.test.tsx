/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import GleanMetrics from '../../../lib/glean';
import SigninTotpCode, { viewName } from '.';
import { MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';

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

describe('Sign in with TOTP code page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  beforeEach(() => {
    (GleanMetrics.totpForm.view as jest.Mock).mockClear();
    (GleanMetrics.totpForm.submit as jest.Mock).mockClear();
    (GleanMetrics.totpForm.success as jest.Mock).mockClear();
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(
      <SigninTotpCode
        {...{
          handleNavigation: () => {},
          submitTotpCode: async () => ({
            status: true,
          }),
          serviceName: MozServices.Default,
        }}
      />
    );
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
      <SigninTotpCode
        {...{
          handleNavigation: () => {},
          submitTotpCode: async () => ({ status: true }),
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
    renderWithLocalizationProvider(
      <SigninTotpCode
        {...{
          handleNavigation: () => {},
          submitTotpCode: async () => ({ status: true }),
          serviceName: MozServices.FirefoxSync,
        }}
      />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
    expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(0);
    expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(0);
  });

  describe('submit totp code', () => {
    async function renderAndSubmitTotpCode(response: {
      status: boolean;
      error?: AuthUiError;
    }) {
      const handleNavigation = jest.fn();
      const submitTotpCode = jest.fn().mockImplementation(async () => {
        return response;
      });
      renderWithLocalizationProvider(
        <SigninTotpCode
          {...{
            handleNavigation,
            submitTotpCode,
            serviceName: MozServices.FirefoxSync,
          }}
        />
      );

      fireEvent.input(screen.getByLabelText('Enter 6-digit code'), {
        target: { value: '123456' },
      });
      screen.getByRole('button', { name: 'Confirm' }).click();
      await new Promise((resolve) => setTimeout(resolve, 10));

      return { submitTotpCode, handleNavigation };
    }

    it('submitsTotpCode and navigates', async () => {
      const { submitTotpCode, handleNavigation } =
        await renderAndSubmitTotpCode({ status: true });

      expect(submitTotpCode).toBeCalledWith('123456');
      expect(handleNavigation).toBeCalledTimes(1);
      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(1);
    });

    it('shows error on invalid code', async () => {
      const { submitTotpCode, handleNavigation } =
        await renderAndSubmitTotpCode({ status: false });

      expect(submitTotpCode).toBeCalledWith('123456');
      expect(handleNavigation).toBeCalledTimes(0);
      screen.getByText('Invalid two-step authentication code');
      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(0);
    });

    it('shows general error on unexpected error', async () => {
      const { submitTotpCode, handleNavigation } =
        await renderAndSubmitTotpCode({
          status: false,
          error: AuthUiErrors.UNEXPECTED_ERROR,
        });

      expect(submitTotpCode).toBeCalledWith('123456');
      expect(handleNavigation).toBeCalledTimes(0);
      screen.getByText('Unexpected error');
      expect(GleanMetrics.totpForm.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.totpForm.success).toHaveBeenCalledTimes(0);
    });
  });
});
