/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Tooltip from '.';

const tooltipText = 'This is a tooltip';

describe('tooltip component', () => {
  it('renders as expected with children', () => {
    renderWithLocalizationProvider(<Tooltip message={tooltipText} />);
    expect(screen.getByTestId('tooltip')).toHaveTextContent(tooltipText);
  });

  it('can be passed classNames', () => {
    renderWithLocalizationProvider(
      <Tooltip className="my-custom-class" message={tooltipText} />
    );
    expect(screen.getByTestId('tooltip')).toHaveClass('my-custom-class');
  });
});
