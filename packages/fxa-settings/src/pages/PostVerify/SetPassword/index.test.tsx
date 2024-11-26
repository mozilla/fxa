/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import { screen, waitFor } from '@testing-library/react';
import { MOCK_EMAIL } from '../../mocks';

describe('SetPassword page', () => {
  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    screen.getByRole('heading', { name: 'Create password' });
    screen.getByText(MOCK_EMAIL);
    screen.getByText(
      'Your sync data is encrypted with your password to protect your privacy.'
    );
    await waitFor(() => {
      screen.getByText('Choose what to sync');
    });
  });
});
