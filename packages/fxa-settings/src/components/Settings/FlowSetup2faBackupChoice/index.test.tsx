/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FlowSetup2faBackupChoice } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';
import { GleanClickEventType2FA } from '../../../lib/types';
import { CHOICES } from '../../FormChoice';

const renderFlowSetup2faBackupChoice = () => {
  const onBackButtonClick = jest.fn();
  const onSubmitCb = jest.fn();
  return {
    onBackButtonClick,
    onSubmitCb,
    ...renderWithLocalizationProvider(
      <FlowSetup2faBackupChoice
        currentStep={2}
        numberOfSteps={3}
        localizedFlowTitle="Two-step authentication"
        onBackButtonClick={onBackButtonClick}
        showProgressBar
        onSubmitCb={onSubmitCb}
      />
    ),
  };
};

describe('FlowSetup2faBackupCodeDownload', () => {
  it('renders correctly', () => {
    renderFlowSetup2faBackupChoice();
    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(
      screen.getByRole('radio', {
        name: /Recovery phone/,
      })
    ).toBeVisible();
    expect(
      screen.getByRole('radio', {
        name: /Backup authentication codes/,
      })
    ).toBeVisible();
  });

  it('sets up Glean metrics correctly', async () => {
    const gleanViewSpy = jest.spyOn(
      GleanMetrics.accountPref,
      'twoStepAuthBackupChoiceView'
    );
    const gleanSubmitSpy = jest.spyOn(
      GleanMetrics.accountPref,
      'twoStepAuthBackupChoiceSubmit'
    );
    renderFlowSetup2faBackupChoice();
    expect(gleanViewSpy).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: /Learn about/ })).toHaveAttribute(
      'data-glean-id',
      'two_step_auth_backup_choice_learn_more_link'
    );
    expect(screen.getByRole('link', { name: /Learn about/ })).toHaveAttribute(
      'data-glean-type',
      GleanClickEventType2FA.setup
    );
    await userEvent.click(
      screen.getByRole('radio', { name: /Backup authentication codes/ })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(gleanSubmitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: {
          reason: GleanClickEventType2FA.setup,
          choice: CHOICES.code,
        },
      })
    );
  });

  it('calls onBackButtonClick when the back button is clicked', async () => {
    const { onBackButtonClick } = renderFlowSetup2faBackupChoice();
    const backButton = screen.getByRole('button', { name: 'Back' });
    await userEvent.click(backButton);
    expect(onBackButtonClick).toHaveBeenCalled();
  });

  it('calls onSubmitCb when the Continue button is clicked', async () => {
    const { onSubmitCb } = renderFlowSetup2faBackupChoice();
    await userEvent.click(
      screen.getByRole('radio', { name: /Backup authentication codes/ })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onSubmitCb).toHaveBeenCalledWith('code');
  });
});
