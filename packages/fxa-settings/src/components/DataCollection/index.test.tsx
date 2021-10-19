/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataCollection } from '.';

describe('DataCollection', () => {
  it('renders as expected', () => {
    const { container } = render(<DataCollection />);

    expect(container).toHaveTextContent('Data Collection and Use');
    expect(container).toHaveTextContent('Analytics and Improvements');
    expect(container).toHaveTextContent(
      'Allow Firefox Accounts to send technical and interaction data to Mozilla.'
    );
    expect(
      screen.getByTestId('link-external-telemetry-opt-out')
    ).toHaveAttribute(
      'href',
      'https://www.mozilla.org/en-US/privacy/firefox/#firefox-accounts'
    );
  });

  // TODO: submission tests with mutations, FXA-4106
});
