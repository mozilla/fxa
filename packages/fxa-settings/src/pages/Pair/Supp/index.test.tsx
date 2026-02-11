/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Supp from '.';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { MOCK_ERROR } from './mocks';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('Pair/Supp page', () => {
  it('renders the default loading state as expected', () => {
    renderWithLocalizationProvider(<Supp />);

    screen.queryByTestId('loading-spinner');
  });

  it('renders as expected when an error is received', () => {
    renderWithLocalizationProvider(<Supp error={MOCK_ERROR} />);

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    screen.getByText('You shall not pass');
  });

  it('emits the expected metrics event on render', () => {
    renderWithLocalizationProvider(<Supp />);

    expect(usePageViewEvent).toHaveBeenCalledWith(
      'pair.supp',
      REACT_ENTRYPOINT
    );
  });
});
