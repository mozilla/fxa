/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import SigninTotpCode, { viewName } from '.';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';

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
    renderWithLocalizationProvider(
      <SigninTotpCode email={MOCK_ACCOUNT.primaryEmail.email} />
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
        email={MOCK_ACCOUNT.primaryEmail.email}
        serviceName={MozServices.MozillaVPN}
      />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter authentication code to continue to Mozilla VPN'
    );
  });

  it('emits a metrics event on render', () => {
    renderWithLocalizationProvider(
      <SigninTotpCode email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
