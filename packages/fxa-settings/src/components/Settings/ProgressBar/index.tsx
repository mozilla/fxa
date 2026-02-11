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
  // don't allow a current step value that exceeds the total number of steps
  const safeCurrentStep = Math.min(currentStep, numberOfSteps);

  return (
    <progress
      aria-label={localizedProgressBarAriaLabel}
      aria-valuemin={1}
      aria-valuemax={numberOfSteps}
      aria-valuetext={currentStep.toString()}
      value={safeCurrentStep}
      max={numberOfSteps}
      className="h-2 w-full bg-grey-100 rounded flex ltr:flex-row rtl:flex-row-reverse mb-4"
    />
  );
};

export default ProgressBar;
