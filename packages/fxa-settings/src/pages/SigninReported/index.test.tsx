/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import SigninReported from '.';
import { usePageViewEvent } from '../../lib/metrics';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('SigninReported', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });
  it('renders Ready component as expected', () => {
    render(<SigninReported />);
    const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    testL10n(ftlMsgMock, bundle);

    const reportHeader = screen.getByText('Thank you for your vigilance');
    const reportMessage = screen.getByText(
      'Our team has been notified. Reports like this help us fend off intruders.'
    );
    expect(reportHeader).toBeInTheDocument();
    expect(reportMessage).toBeInTheDocument();
  });

  it('emits the expected metrics on render', () => {
    render(<SigninReported />);
    expect(usePageViewEvent).toHaveBeenCalledWith('signin-reported', {
      entrypoint_variation: 'react',
    });
  });
});
