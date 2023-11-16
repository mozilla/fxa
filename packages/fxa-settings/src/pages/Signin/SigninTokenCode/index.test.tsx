/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import GleanMetrics from '../../../lib/glean';
import SigninTokenCode, { viewName } from '.';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    loginConfirmation: {
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
    isDone: jest.fn(),
  },
}));

describe('PageSigninTokenCode', () => {
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
      <SigninTokenCode email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter confirmation code for your Mozilla account'
    );
    screen.getByLabelText('Enter 6-digit code');

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('button', { name: 'Email new code.' });
  });

  it('emits a metrics event on render', () => {
    renderWithLocalizationProvider(
      <SigninTokenCode email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    expect(GleanMetrics.loginConfirmation.view).toBeCalledTimes(1);
  });

  // TODO at the time of the Glean metrics implementation the page is mostly a
  // scaffold, without the code submission implementation.  That is why a
  // "submission" will always result in a success event.
  it('emits metrics events on submit', async () => {
    renderWithLocalizationProvider(
      <SigninTokenCode email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    fireEvent.input(screen.getByLabelText('Enter 6-digit code'), {
      target: { value: '999000' },
    });
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(GleanMetrics.loginConfirmation.submit).toBeCalledTimes(1);
      expect(GleanMetrics.loginConfirmation.success).toBeCalledTimes(1);
    });
  });
});
