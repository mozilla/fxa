/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FlowSetup2faBackupCodeDownLoad } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Account, AppContext } from '../../../models';
import GleanMetrics from '../../../lib/glean';
import { mockAppContext } from '../../../models/mocks';

const totp = {
  qrCodeUrl: 'qr:url',
  secret: 'JFXE6ULUGM4U4WDHOFVFIRDPKZITATSK',
  recoveryCodes: ['3594s0tbsq', '0zrg82sdzm', 'wx88yxenfc'],
};

const acct = {
  primaryEmail: {
    email: 'ibicking@mozilla.com',
  },
} as unknown as Account;

const renderFlowSetup2faBackupCodeDownload = () => {
  const onBackButtonClick = jest.fn();
  const onContinue = jest.fn();
  return {
    onBackButtonClick,
    onContinue,
    ...renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account: acct })}>
        <FlowSetup2faBackupCodeDownLoad
          currentStep={1}
          numberOfSteps={3}
          localizedFlowTitle="Two-step authentication"
          totpInfo={totp}
          showProgressBar
          {...{ onBackButtonClick, onContinue }}
        />
      </AppContext.Provider>
    ),
  };
};

describe('FlowSetup2faBackupCodeDownload', () => {
  beforeAll(() => {
    window.URL.createObjectURL = jest.fn();
  });
  it('renders correctly', async () => {
    const gleanSpy = jest.spyOn(
      GleanMetrics.accountPref,
      'twoStepAuthCodesView'
    );
    await renderFlowSetup2faBackupCodeDownload();
    expect(screen.getByRole('progressbar')).toBeVisible();
    screen
      .getByTestId('datablock')
      .querySelectorAll('li')
      .forEach((li, i) => expect(li).toHaveTextContent(totp.recoveryCodes[i]));
    expect(screen.getByTestId('databutton-download')).toHaveAttribute(
      'download',
      expect.stringContaining('Backup authentication codes')
    );
    expect(gleanSpy).toBeCalled();
  });

  it('calls on when the Cancel button is clicked', async () => {
    const { onBackButtonClick } = renderFlowSetup2faBackupCodeDownload();
    const cancelButton = screen.getByRole('button', { name: 'Back' });
    await userEvent.click(cancelButton);
    expect(onBackButtonClick).toHaveBeenCalled();
  });

  it('calls onContinue when the Continue button is clicked', async () => {
    const { onContinue } = renderFlowSetup2faBackupCodeDownload();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    expect(onContinue).toHaveBeenCalled();
  });
});
