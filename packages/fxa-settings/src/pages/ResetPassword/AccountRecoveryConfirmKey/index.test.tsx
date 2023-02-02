/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import AccountRecoveryConfirmKey, { viewName } from '.';
import { MOCK_SERVICE_NAME } from './mocks';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

describe('PageAccountRecoveryConfirmKey', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected when the link is valid', () => {
    render(<AccountRecoveryConfirmKey linkStatus="valid" />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Reset password with account recovery key to continue to account settings'
    );
    screen.getByText(
      'Please enter the one time use account recovery key you stored in a safe place to regain access to your Firefox Account.'
    );
    screen.getByTestId('warning-message-container');
    screen.getByLabelText('Enter account recovery key');
    screen.getByRole('button', { name: 'Confirm account recovery key' });
    const noRecoveryCodeLink = screen.queryByRole('link');
    expect(noRecoveryCodeLink).toHaveTextContent(
      `Don't have an account recovery key?`
    );
  });

  it('renders a custom service name in the header when it is provided', () => {
    render(
      <AccountRecoveryConfirmKey
        linkStatus="valid"
        serviceName={MOCK_SERVICE_NAME}
      />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      `Reset password with account recovery key to continue to ${MOCK_SERVICE_NAME}`
    );
  });

  it('renders the component as expected when provided with an expired link', () => {
    render(<AccountRecoveryConfirmKey linkStatus="expired" />);

    screen.getByRole('heading', {
      name: 'Reset password link expired',
    });
    screen.getByText('The link you clicked to reset your password is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });

  it('emits a metrics event on render', () => {
    render(<AccountRecoveryConfirmKey linkStatus="valid" />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
