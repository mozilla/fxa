/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, within } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import {
  MOCK_CMS_INFO,
  MOCK_RECOVERY_KEY_WITH_SPACES,
} from '../../pages/mocks';
import GleanMetrics from '../../lib/glean';

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: { recoveryKey: { downloadView: jest.fn() } },
}));

describe('RecoveryKeySetupDownload', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

    screen.getByRole('button', { name: 'Download and continue' });

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

  describe('Glean events', () => {
    it('records the download view once with the flow', () => {
      renderWithLocalizationProvider(<Subject flow="inline" />);
      expect(GleanMetrics.recoveryKey.downloadView).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.recoveryKey.downloadView).toHaveBeenCalledWith({
        event: { flow: 'inline' },
      });
      expect(
        screen.getByRole('button', { name: 'Continue without downloading' })
      ).toHaveAttribute('data-glean-id', 'recovery_key_download_skip');
    });
  });
});
