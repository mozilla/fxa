/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ReportSignin, { viewName } from '.';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

const submitReport = jest.fn();

describe('ReportSignin', () => {
  it('renders Ready component as expected', () => {
    renderWithLocalizationProvider(<ReportSignin {...{ submitReport }} />);

    expect(
      screen.getByRole('heading', { name: 'Report unauthorized sign-in?' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Report activity' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Why is this happening/ })
    ).toBeInTheDocument();
  });

  it('emits the expected metrics on render', () => {
    renderWithLocalizationProvider(<ReportSignin {...{ submitReport }} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
