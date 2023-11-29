/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import SigninRecoveryCode, { viewName } from '.';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    loginBackupCode: {
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
    isDone: jest.fn(),
  },
}));

describe('PageSigninRecoveryCode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    renderWithLocalizationProvider(
      <SigninRecoveryCode email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter backup authentication code to continue to account settings'
    );
    screen.getByRole('img', { name: 'Document that contains hidden text.' });
    screen.getByText(
      'Please enter a backup authentication code that was provided to you during two step authentication setup.'
    );
    screen.getByRole('textbox', {
      name: 'Enter 10-digit backup authentication code',
    });

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('link', { name: 'Back' });
    screen.getByRole('link', {
      name: /Are you locked out?/,
    });
  });

  it('shows the relying party in the header when a service name is provided', () => {
    renderWithLocalizationProvider(
      <SigninRecoveryCode
        email={MOCK_ACCOUNT.primaryEmail.email}
        serviceName={MozServices.MozillaVPN}
      />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter backup authentication code to continue to Mozilla VPN'
    );
  });

  it('emits a metrics event on render', () => {
    renderWithLocalizationProvider(
      <SigninRecoveryCode email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    expect(GleanMetrics.loginBackupCode.view).toBeCalledTimes(1);
  });

  // TODO at the time of the Glean metrics implementation the page is mostly a
  // scaffold, without the code submission implementation.  That is why a
  // "submission" will always result in a success event.
  it('emits metrics events on submit', async () => {
    renderWithLocalizationProvider(
      <SigninRecoveryCode email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    fireEvent.input(
      screen.getByLabelText('Enter 10-digit backup authentication code'),
      {
        target: { value: 'fffx999000' },
      }
    );
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(GleanMetrics.loginBackupCode.submit).toBeCalledTimes(1);
      expect(GleanMetrics.loginBackupCode.success).toBeCalledTimes(1);
      expect(GleanMetrics.isDone).toBeCalledTimes(1);
    });
  });
});
