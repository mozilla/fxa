/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ReportSignin, { viewName } from '.';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: { login: { reportSigninView: jest.fn() } },
}));

const submitReport = jest.fn();

describe('ReportSignin', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
    expect(GleanMetrics.login.reportSigninView).toHaveBeenCalledTimes(1);
  });
});
