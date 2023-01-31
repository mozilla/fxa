/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import SigninTotpCode from '.';
import { MOCK_SERVICE } from './mocks';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

describe('Sign in with TOTP code page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    render(<SigninTotpCode />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter security code to continue to account settings'
    );
    screen.getByLabelText('Enter 6-digit code');

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('link', { name: 'Use a different account' });
    screen.getByRole('link', { name: 'Trouble entering code?' });
  });

  it('shows the relying party in the header when a service name is provided', () => {
    render(<SigninTotpCode serviceName={MOCK_SERVICE} />);
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      `Enter security code to continue to ${MOCK_SERVICE}`
    );
  });

  it('emits a metrics event on render', () => {
    render(<SigninTotpCode />);
    expect(usePageViewEvent).toHaveBeenCalledWith(`signin-totp-code`, {
      entrypoint_variation: 'react',
    });
  });
});
