/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { formatSecret } from '../../../lib/utilities';
import { MOCK_2FA_SECRET_KEY_RAW } from '../../../pages/mocks';

import { FlowSetup2faApp } from '.';
import { TwoStepSetupMethod } from './types';

import { GleanClickEventType2FA } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      twoStepAuthQrView: jest.fn(),
      twoStepAuthManualCodeView: jest.fn(),
    },
  },
}));

const defaultTotpInfo = {
  qrCodeUrl: 'https://example.com/qr.png',
  secret: MOCK_2FA_SECRET_KEY_RAW,
};

const renderFlowSetup2fa = (
  opt?: Partial<React.ComponentProps<typeof FlowSetup2faApp>>
) => {
  const verifyCode = opt?.verifyCode || jest.fn().mockResolvedValue(undefined);

  return {
    verifyCode,
    ...renderWithLocalizationProvider(
      <FlowSetup2faApp
        localizedFlowTitle="Two-step authentication"
        currentStep={1}
        numberOfSteps={3}
        totpInfo={defaultTotpInfo}
        verifyCode={verifyCode as any}
        {...opt}
      />
    ),
  };
};

describe('FlowSetup2faApp', () => {
  it('renders the QR-code setup step by default', () => {
    renderFlowSetup2fa();

    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByTestId('2fa-qr-code')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /can’t scan qr code/i })
    ).toBeInTheDocument();
  });

  it('switches to the manual code step when the toggle is clicked', async () => {
    renderFlowSetup2fa();

    await userEvent.click(
      screen.getByRole('button', { name: /can’t scan qr code/i })
    );

    expect(
      screen.getByText(/enter this code in your preferred authenticator app/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId(/datablock/)).toHaveTextContent(
      formatSecret(MOCK_2FA_SECRET_KEY_RAW)
    );
    expect(
      screen.getByRole('button', { name: /scan qr code instead/i })
    ).toBeInTheDocument();
  });

  it('calls the provided verifyCode handler on successful submission', async () => {
    const verifyCode = jest.fn().mockResolvedValue(undefined);
    renderFlowSetup2fa({ verifyCode });

    await userEvent.type(screen.getByRole('textbox'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(verifyCode).toHaveBeenCalledWith('123456');
    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    );
  });

  it('shows an error banner when verifyCode rejects', async () => {
    const verifyCode = jest.fn().mockRejectedValue(new Error('invalid_totp'));
    renderFlowSetup2fa({ verifyCode });

    await userEvent.type(screen.getByRole('textbox'), '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Unexpected error')
    );
  });

  it('respects the initialSetupType prop (manual-code first)', () => {
    renderFlowSetup2fa({ initialSetupMethod: TwoStepSetupMethod.ManualCode });

    expect(
      screen.getByText(/enter this code in your preferred authenticator app/i)
    ).toBeInTheDocument();
  });

  it('can hide the progress bar when showProgressBar=false', () => {
    renderFlowSetup2fa({ showProgressBar: false });

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  describe('glean metrics', () => {
    const qrViewSpy = GleanMetrics.accountPref.twoStepAuthQrView as jest.Mock<
      any,
      any
    >;
    const manualViewSpy = GleanMetrics.accountPref
      .twoStepAuthManualCodeView as jest.Mock<any, any>;

    beforeEach(() => {
      qrViewSpy.mockClear();
      manualViewSpy.mockClear();
    });

    it('fires twoStepAuthQrView when the QR step is first shown', async () => {
      renderFlowSetup2fa(); // default is QR first

      await waitFor(() => {
        expect(qrViewSpy).toHaveBeenCalledTimes(1);
        expect(qrViewSpy).toHaveBeenCalledWith({
          event: { reason: GleanClickEventType2FA.setup },
        });
      });
      expect(manualViewSpy).not.toHaveBeenCalled();
    });

    it('fires twoStepAuthManualCodeView when the manual-code step is first shown', async () => {
      renderFlowSetup2fa({ initialSetupMethod: TwoStepSetupMethod.ManualCode });

      await waitFor(() => {
        expect(manualViewSpy).toHaveBeenCalledTimes(1);
        expect(manualViewSpy).toHaveBeenCalledWith({
          event: { reason: GleanClickEventType2FA.setup },
        });
      });
      expect(qrViewSpy).not.toHaveBeenCalled();
    });

    it('exposes correct data-glean attributes in the QR step', () => {
      renderFlowSetup2fa();

      const cantScanBtn = screen.getByRole('button', {
        name: /can’t scan qr code/i,
      });
      expect(cantScanBtn).toHaveAttribute(
        'data-glean-id',
        'two-step-auth-use-code-instead-button'
      );
      expect(cantScanBtn).toHaveAttribute(
        'data-glean-type',
        GleanClickEventType2FA.setup.toString()
      );

      const submitBtn = screen.getByRole('button', { name: 'Continue' });
      expect(submitBtn).toHaveAttribute(
        'data-glean-id',
        'two_step_auth_qr_submit'
      );
      expect(submitBtn).toHaveAttribute(
        'data-glean-type',
        GleanClickEventType2FA.setup.toString()
      );
    });

    it('updates all data-glean attributes after switching to manual-code', async () => {
      renderFlowSetup2fa(); // QR step first

      await userEvent.click(
        screen.getByRole('button', { name: /can’t scan qr code/i })
      );

      const switchBackBtn = screen.getByRole('button', {
        name: /scan qr code instead/i,
      });
      expect(switchBackBtn).toHaveAttribute(
        'data-glean-id',
        'two-step-auth-scan-qr-instead-button'
      );

      const submitBtn = screen.getByRole('button', { name: 'Continue' });
      expect(submitBtn).toHaveAttribute(
        'data-glean-id',
        'two_step_auth_manual_code_submit'
      );
    });
  });
});
