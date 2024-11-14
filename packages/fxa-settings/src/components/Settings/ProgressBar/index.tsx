/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useFtlMsgResolver } from '../../../models';

export type ProgressBarProps = {
  numberOfSteps: number;
  currentStep: number;
};

export const ProgressBar = ({
  numberOfSteps,
  currentStep,
}: ProgressBarProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedProgressBarAriaLabel = ftlMsgResolver.getMsg(
    'progress-bar-aria-label-v2',
    `Step ${currentStep} of ${numberOfSteps}.`,
    { currentStep, numberOfSteps }
  );
  if (currentStep > numberOfSteps) {
    throw new Error(
      'Current step submitted to the progress bar cannot be a greater number than the total number of steps in a flow. You may have reversed your inputs'
    );
  }

  return (
    <progress
      aria-label={localizedProgressBarAriaLabel}
      aria-valuemin={1}
      aria-valuemax={numberOfSteps}
      aria-valuetext={currentStep.toString()}
      value={currentStep}
      max={numberOfSteps}
      className="h-2 w-full bg-grey-100 rounded flex ltr:flex-row rtl:flex-row-reverse mb-4"
    />
  );
};

export default ProgressBar;
