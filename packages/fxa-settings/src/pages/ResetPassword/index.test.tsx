/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../lib/metrics';
import ResetPassword from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { MozServices } from '../../lib/types';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('PageResetPassword', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected when no props are provided', () => {
    render(<ResetPassword />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Reset password to continue to account settings'
    );
    expect(screen.getByTestId('warning-message-container')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Begin Reset' })
    ).toBeInTheDocument();
    // when forceEmail is NOT provided as a prop, the optional read-only email should not be rendered
    const forcedEmailEl = screen.queryByTestId('reset-password-force-email');
    expect(forcedEmailEl).not.toBeInTheDocument();
    // when 'canGoBack: false' or not passed as prop, the optional LinkRememberPassword component should not be rendered
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a custom service name in the header when it is provided', () => {
    render(<ResetPassword serviceName={MozServices.MozillaVPN} />);
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      `Reset password to continue to Mozilla VPN`
    );
  });

  it('renders a read-only email but no text input when forceAuth is true', () => {
    render(
      <ResetPassword
        prefillEmail={MOCK_ACCOUNT.primaryEmail.email}
        forceAuth={true}
      />
    );
    expect(
      screen.getByTestId('reset-password-force-email')
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('renders a "Remember your password?" link if "canGoBack: true"', () => {
    render(<ResetPassword canGoBack={true} />);

    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });

  it('emits a metrics event on render', () => {
    render(<ResetPassword />);
    expect(usePageViewEvent).toHaveBeenCalledWith(`reset-password`, {
      entrypoint_variation: 'react',
    });
  });
});
