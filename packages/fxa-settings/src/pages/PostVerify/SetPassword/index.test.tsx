/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import { screen } from '@testing-library/react';
import { MOCK_EMAIL } from '../../mocks';

describe('SetPassword page', () => {
  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen.getByRole('heading', { name: 'Create password to sync' })
    ).toBeInTheDocument();
    expect(screen.getByText(MOCK_EMAIL)).toBeInTheDocument();
    expect(
      screen.getByText(
        'This encrypts your data. It needs to be different from your Google or Apple account password.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Start syncing')).toBeInTheDocument();
  });
});
