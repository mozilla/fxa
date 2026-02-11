/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Legal, { viewName } from '.';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { usePageViewEvent } from '../../lib/metrics';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { REACT_ENTRYPOINT } from '../../constants';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('Legal', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Legal />);
    testAllL10n(screen, bundle);

    screen.getByRole('heading', {
      name: 'Legal',
    });

    expect(
      screen.getByRole('link', { name: 'Terms of Service' })
    ).toHaveAttribute('href', '/legal/terms');
    expect(
      screen.getByRole('link', { name: 'Privacy Notice' })
    ).toHaveAttribute('href', '/legal/privacy');

    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
