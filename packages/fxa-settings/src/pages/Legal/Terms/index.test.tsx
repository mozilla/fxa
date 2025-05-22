/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LegalTerms, { viewName } from '.';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { REACT_ENTRYPOINT } from '../../../constants';
import { fetchLegalMd } from '../../../lib/file-utils-legal';

jest.mock('../../../lib/file-utils-legal');
jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

// There's not a good way to use react-markdown in tests until we use jest ESM. Using the jest
// config recommended in this issue is fragile and causes other tests to fail. We could
// alternatively use react-markdown @ 6.0.3. and rehype-raw @5.1.0, but these packages are already
// a couple years old at the time of writing and requires at least one other workaround.
// https://github.com/remarkjs/react-markdown/issues/635
// https://jestjs.io/docs/ecmascript-modules
jest.mock('react-markdown', () => {});
jest.mock('rehype-raw', () => {});

describe('Legal/Terms', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  beforeEach(() => {
    (fetchLegalMd as jest.Mock).mockImplementation(() => ({}));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<LegalTerms />);
    await waitFor(() => {
      testAllL10n(screen, bundle);
      // renders if `markdown` is undefined
      screen.getByRole('heading', {
        name: 'Terms of Service',
      });
    });
  });

  it('emits metrics events as expected', () => {
    renderWithLocalizationProvider(<LegalTerms />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'back',
      REACT_ENTRYPOINT
    );
  });
});
