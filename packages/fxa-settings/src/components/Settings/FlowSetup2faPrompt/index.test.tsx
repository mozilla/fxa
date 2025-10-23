/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { FlowSetup2faPrompt, FlowSetup2faPromptProps } from '.';
import { GleanClickEventType2FA } from '../../../lib/types';

const renderFlowSetup2faPrompt = (
  props: Partial<FlowSetup2faPromptProps> = {}
) => {
  const onContinue = jest.fn();
  const onBackButtonClick = jest.fn();
  const defaultProps = {
    localizedPageTitle: 'Two-step authentication',
    serviceName: '123Done',
    onContinue,
    onBackButtonClick,
    ...props,
  };

  return {
    ...renderWithLocalizationProvider(<FlowSetup2faPrompt {...defaultProps} />),
    onContinue,
    onBackButtonClick,
  };
};

describe('FlowSetup2faPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', () => {
    renderFlowSetup2faPrompt();

    expect(screen.getByText('Two-step authentication')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    expect(
      screen.getByText('Set up two-step authentication')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '123Done requires you to set up two-step authentication to keep your account safe.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/You can use any of/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
  });

  it('renders the error banner message when provided', () => {
    const localizedErrorMessage =
      'An error occurred while setting up two-step authentication.';
    renderFlowSetup2faPrompt({ localizedErrorMessage });

    expect(screen.getByText(localizedErrorMessage)).toBeInTheDocument();
  });

  it('renders the authentication apps link with correct attributes', () => {
    renderFlowSetup2faPrompt();

    const authAppsLink = screen.getByRole('link', {
      name: /these authenticator apps/,
    });
    expect(authAppsLink).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication'
    );
    expect(authAppsLink).toHaveAttribute(
      'data-glean-id',
      'two_step_auth_inline_prompt_app_link'
    );
    expect(authAppsLink).toHaveAttribute(
      'data-glean-type',
      GleanClickEventType2FA.inline
    );
  });

  it('calls onContinue when continue button is clicked', async () => {
    const { onContinue } = renderFlowSetup2faPrompt();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('calls onBackButtonClick when back button is clicked', async () => {
    const { onBackButtonClick } = renderFlowSetup2faPrompt({
      hideBackButton: false,
    });

    const backButton = screen.getByRole('button', { name: 'Back' });
    await userEvent.click(backButton);

    expect(onBackButtonClick).toHaveBeenCalledTimes(1);
  });
});
