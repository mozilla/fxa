/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ContentSkip from '.';

describe('ContentSkip', () => {
  it('links to #main with expected text', () => {
    render(<ContentSkip />);

    expect(screen.getByTestId('content-skip')).toHaveTextContent(
      'Skip to content'
    );
    expect(screen.getByTestId('content-skip')).toHaveAttribute('href', '#main');
  });
});
