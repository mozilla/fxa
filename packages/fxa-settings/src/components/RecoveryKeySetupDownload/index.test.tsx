/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor, within } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  MOCK_CMS_INFO,
  MOCK_RECOVERY_KEY_WITH_SPACES,
} from '../../pages/mocks';
import { Subject } from './mocks';

describe('RecoveryKeySetupDownload', () => {
  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    screen.getByText(MOCK_RECOVERY_KEY_WITH_SPACES);
    screen.getByRole('button', { name: 'Copy' });

    screen.getByRole('heading', {
      level: 3,
      name: 'Places to store your key:',
    });
    const list = screen.getByRole('list', {
      name: 'Places to store your key:',
    });
    const listItems = within(list).getAllByRole('listitem');
    expect(listItems.length).toBe(4);

    await waitFor(
      () => {
        const b = screen.getByRole('button', { name: 'Download and continue' });
        expect(b).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    screen.getByRole('button', {
      name: 'Continue without downloading',
    });
  });

  // the rendered component is kind of large to review in snapshot,
  // so we have a separate test that targets just the thing that
  // cms is passed through to, the `Download and continue` button.
  it('renders button with CMS passthrough', () => {
    renderWithLocalizationProvider(<Subject cmsInfo={MOCK_CMS_INFO} />);
    const cmsButton = screen.getByRole('button', {
      name: 'Download and continue',
    });
    expect(cmsButton).toMatchSnapshot();
  });
});
