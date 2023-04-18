/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '.';

describe('ProgressBar', () => {
  it('is accessible to the user', async () => {
    const currentStep = 1;
    const numberOfSteps = 4;
    render(<ProgressBar {...{ currentStep, numberOfSteps }} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute(
      'aria-valuemin',
      currentStep.toString()
    );
    expect(progressBar).toHaveAttribute(
      'aria-valuemax',
      numberOfSteps.toString()
    );
    expect(progressBar).toHaveAttribute(
      'aria-valuetext',
      currentStep.toString()
    );
  });
});
