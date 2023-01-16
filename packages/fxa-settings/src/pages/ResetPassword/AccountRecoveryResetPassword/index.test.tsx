/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import AccountRecoveryResetPassword from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('PageAccountRecoveryResetPassword', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected with valid link', () => {
    render(<AccountRecoveryResetPassword linkStatus="valid" />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Create new password');
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Current password')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Reset password' })
    ).toBeInTheDocument();
    // when 'canGoBack: false' or not passed as prop, the optional RememberPassword link component should not be rendered
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows a different message when given a damaged link', () => {
    render(<AccountRecoveryResetPassword linkStatus="damaged" />);
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(`Reset password link damaged`);
  });

  it('shows a different message for an expired link, with a button for getting a new link', () => {
    render(<AccountRecoveryResetPassword linkStatus="expired" />);
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(`Reset password link expired`);
    expect(
      screen.getByRole('button', { name: 'Receive new link' })
    ).toBeInTheDocument();
  });

  it('renders a "Remember your password?" link if "canGoBack: true"', () => {
    render(
      <AccountRecoveryResetPassword canGoBack={true} linkStatus="valid" />
    );
    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });

  it('emits a metrics event on render', () => {
    render(<AccountRecoveryResetPassword linkStatus="valid" />);
    expect(usePageViewEvent).toHaveBeenCalledWith(
      `account-recovery-reset-password`,
      {
        entrypoint_variation: 'react',
      }
    );
  });
});
