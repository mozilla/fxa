/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

describe('InlineRecoveryKeySetupCreate', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);

    screen.getByText('You’re signed in to Firefox', { exact: false });
    screen.getByRole('heading', {
      name: 'Secure your account',
    });
    screen.getByLabelText('account recovery key', {
      selector: 'svg',
      exact: false,
    });
    screen.getByRole('heading', {
      name: 'Got a minute to protect your data?',
    });
    screen.getByText(
      'Create an account recovery key so you can restore your sync browsing data if you ever forget your password.'
    );
    screen.getByRole('button', {
      name: 'Create account recovery key',
    });
    screen.getByRole('button', {
      name: 'Do it later',
    });
  });
});
