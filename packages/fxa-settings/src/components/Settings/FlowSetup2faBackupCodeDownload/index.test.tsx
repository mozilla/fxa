/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FlowSetup2faBackupCodeDownload } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';
import { GleanClickEventType2FA } from '../../../lib/types';

const recoveryCodes = ['3594s0tbsq', '0zrg82sdzm', 'wx88yxenfc'];

const renderFlowSetup2faBackupCodeDownload = () => {
  const onBackButtonClick = jest.fn();
  const onContinue = jest.fn();
  return {
    onBackButtonClick,
    onContinue,
    ...renderWithLocalizationProvider(
      <FlowSetup2faBackupCodeDownload
        currentStep={1}
        numberOfSteps={3}
        localizedFlowTitle="Two-step authentication"
        email="ibicking@mozilla.com"
        showProgressBar
        {...{ recoveryCodes, onBackButtonClick, onContinue }}
      />
    ),
  };
};

describe('FlowSetup2faBackupCodeDownload', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    // set UA to a desktop browser as the default for the tests
    // using a hack to work around userAgent being read-only
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:139.0) Gecko/20100101 Firefox/139.0',
      configurable: true,
    });
  });
  it('renders correctly', () => {
    renderFlowSetup2faBackupCodeDownload();
    expect(screen.getByRole('progressbar')).toBeVisible();
    screen
      .getByTestId('datablock')
      .querySelectorAll('li')
      .forEach((li, i) => expect(li).toHaveTextContent(recoveryCodes[i]));
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'download',
      'ibicking@mozilla.com Backup authentication codes.txt'
    );
  });

  it('sets up Glean metrics correctly', () => {
    const gleanSpy = jest.spyOn(
      GleanMetrics.accountPref,
      'twoStepAuthCodesView'
    );
    renderFlowSetup2faBackupCodeDownload();
    expect(gleanSpy).toBeCalled();

    const downloadButton = screen.getByRole('link', { name: 'Download' });
    const copyButton = screen.getByRole('button', { name: 'Copy' });
    const printButton = screen.getByRole('button', { name: 'Print' });

    expect(downloadButton).toHaveAttribute(
      'data-glean-id',
      'two_step_auth_codes_download'
    );
    expect(copyButton).toHaveAttribute(
      'data-glean-id',
      'two_step_auth_codes_copy'
    );
    expect(printButton).toHaveAttribute(
      'data-glean-id',
      'two_step_auth_codes_print'
    );
    for (const button of [downloadButton, copyButton, printButton]) {
      expect(button).toHaveAttribute(
        'data-glean-type',
        GleanClickEventType2FA.setup
      );
    }
  });

  it('does not display the download button or the print button on mobile', () => {
    // Set the user agent to a mobile browser for this test case
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Android 15; Mobile; rv:139.0) Gecko/139.0 Firefox/139.0',
      configurable: true,
    });
    renderFlowSetup2faBackupCodeDownload();
    expect(
      screen.queryByRole('link', { name: 'Download' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Print' })
    ).not.toBeInTheDocument();
  });

  it('calls onBackButtonClick when the back button is clicked', async () => {
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
