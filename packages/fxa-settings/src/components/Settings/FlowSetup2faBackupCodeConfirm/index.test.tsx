/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FlowSetup2faBackupCodeConfirm } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';
import { GleanClickEventType2FA } from '../../../lib/types';

const renderFlowSetup2faBackupCodeConfirm = (error?: string) => {
  const onBackButtonClick = jest.fn();
  const verifyCode = jest.fn();
  const setErrorMessage = jest.fn();
  return {
    onBackButtonClick,
    verifyCode,
    setErrorMessage,
    ...renderWithLocalizationProvider(
      <FlowSetup2faBackupCodeConfirm
        currentStep={3}
        numberOfSteps={3}
        localizedFlowTitle="Two-step authentication"
        showProgressBar
        errorMessage={error || ''}
        {...{ onBackButtonClick, setErrorMessage, verifyCode }}
      />
    ),
  };
};

describe('FlowSetup2faBackupCodeDownload', () => {
  it('renders correctly', () => {
    renderFlowSetup2faBackupCodeConfirm();
    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: 'Enter 10-character code' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Finish' })).toBeVisible();
  });

  it('shows error correctly and clears error on input', async () => {
    const errorMsg = 'Invalid recovery code';
    const { setErrorMessage } = renderFlowSetup2faBackupCodeConfirm(errorMsg);
    expect(screen.getByText(errorMsg)).toBeVisible();
    await userEvent.type(
      screen.getByRole('textbox', { name: /Enter 10-character code/ }),
      '12345'
    );
    expect(setErrorMessage).toHaveBeenCalledWith('');
  });

  it('sets up Glean metrics correctly', () => {
    const gleanSpy = jest.spyOn(
      GleanMetrics.accountPref,
      'twoStepAuthEnterCodeView'
    );
    renderFlowSetup2faBackupCodeConfirm();
    expect(gleanSpy).toBeCalled();

    const finishButton = screen.getByRole('button', { name: 'Finish' });

    expect(finishButton).toHaveAttribute(
      'data-glean-id',
      'two_step_auth_enter_code_submit'
    );
    expect(finishButton).toHaveAttribute(
      'data-glean-type',
      GleanClickEventType2FA.setup
    );
  });

  it('calls onBackButtonClick when the back button is clicked', async () => {
    const { onBackButtonClick } = renderFlowSetup2faBackupCodeConfirm();
    const cancelButton = screen.getByRole('button', { name: 'Back' });
    await userEvent.click(cancelButton);
    expect(onBackButtonClick).toHaveBeenCalled();
  });

  it('calls onRecoveryCodeSubmit when the input code is of valid format and the finish button is clicked', async () => {
    const { verifyCode } = renderFlowSetup2faBackupCodeConfirm();
    const finishButton = screen.getByRole('button', { name: 'Finish' });
    const recoveryCodeInput = screen.getByRole('textbox', {
      name: 'Enter 10-character code',
    });
    expect(finishButton).toBeDisabled();
    await userEvent.type(recoveryCodeInput, '12345');
    expect(finishButton).toBeDisabled();
    await userEvent.type(recoveryCodeInput, 'abcde');
    // After entering 10 characters, the button should now be enabled
    expect(finishButton).toBeEnabled();
    await userEvent.click(finishButton);
    expect(verifyCode).toHaveBeenCalledWith('12345abcde');
  });
});
