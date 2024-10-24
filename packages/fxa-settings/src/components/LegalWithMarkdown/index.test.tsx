/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { fetchLegalMd } from '../../lib/file-utils-legal';
import { navigate } from '@reach/router';

jest.mock('../../lib/file-utils-legal');
jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));
jest.mock('@reach/router', () => ({
  navigate: jest.fn(),
}));

// There's not a good way to use react-markdown in tests until we use jest ESM. Using the jest
// config recommended in this issue is fragile and causes other tests to fail. We could
// alternatively use react-markdown @ 6.0.3. and rehype-raw @5.1.0, but these packages are already
// a couple years old at the time of writing and requires at least one other workaround.
// https://github.com/remarkjs/react-markdown/issues/635
// https://jestjs.io/docs/ecmascript-modules
jest.mock('react-markdown', () => {});
jest.mock('rehype-raw', () => {});

describe('LegalWithMarkdown', () => {
  beforeEach(() => {
    (fetchLegalMd as jest.Mock).mockReturnValue({
      terms: '## Some markdown',
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can go back', async () => {
    renderWithLocalizationProvider(<Subject />);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(-1);
    });
  });

  it('displays a loading state', () => {
    renderWithLocalizationProvider(<Subject />);
    screen.getByTestId('loading-spinner');
  });

  describe('with error returned from fetchLegalMd', () => {
    beforeEach(() => {
      (fetchLegalMd as jest.Mock).mockReturnValue({
        error: 'boop',
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('displays an error state', async () => {
      renderWithLocalizationProvider(<Subject />);
      await screen.findByText('Something went wrong. Please try again later.');
    });
  });
});
