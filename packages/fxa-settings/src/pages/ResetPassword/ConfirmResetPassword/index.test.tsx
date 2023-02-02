/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ConfirmResetPassword, { viewName } from '.';
import { usePageViewEvent } from '../../../lib/metrics';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { MOCK_EMAIL } from './mocks';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('ConfirmResetPassword', () => {
  // TODO enable l10n testing
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders ConfirmResetPassword component as expected', () => {
    render(<ConfirmResetPassword email={MOCK_EMAIL} />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Reset email sent');

    // TODO expect image

    const confirmPwResetInstructions = screen.getByText(
      `Click the link emailed to ${MOCK_EMAIL} within the next hour to create a new password.`
    );
    expect(confirmPwResetInstructions).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      })
    ).toBeInTheDocument();

    // when 'canSignIn: false' or not passed as prop, the optional LinkRememberPassword component should not be rendered
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('emits the expected metrics on render', async () => {
    render(<ConfirmResetPassword email={MOCK_EMAIL} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('renders a "Remember your password?" link if "canSignIn: true"', () => {
    render(<ConfirmResetPassword email={MOCK_EMAIL} canSignIn={true} />);
    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });
});
