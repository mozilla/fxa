/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { FlowContainer } from '.';
import { ProgressBar } from '../ProgressBar';
import { LocationProvider } from '@reach/router';
import { MOCK_CONTENT, MOCK_SUBTITLE, MOCK_TITLE } from './mocks';

export default {
  title: 'Components/Settings/FlowContainer',
  component: FlowContainer,
  decorators: [
    withLocalization,
    (Story: StoryObj) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

export const Default = () => (
  <FlowContainer title={MOCK_TITLE} subtitle={MOCK_SUBTITLE}>
    {MOCK_CONTENT}
  </FlowContainer>
);

export const WizardExample = () => {
  const [currentStep, setCurrentStep] = useState(1);
  return (
    <>
      {currentStep === 1 && (
        <FlowContainer
          title="Example wizard flow"
          localizedBackButtonTitle="Previous page title"
          onBackButtonClick={() => {
            window.history.back();
          }}
        >
          <ProgressBar currentStep={1} numberOfSteps={3} />
          <h2 className="font-bold text-xl mb-2">This is your first step.</h2>
          <p>You should click the button below to proceed to the next step.</p>
          <button
            className="cta-primary cta-base-p w-full"
            type="button"
            onClick={() => {
              setCurrentStep(currentStep + 1);
            }}
          >
            Next view
          </button>
        </FlowContainer>
      )}
      {currentStep === 2 && (
        <FlowContainer
          title="Example wizard flow"
          localizedBackButtonTitle="Previous page title"
          onBackButtonClick={() => {
            setCurrentStep(currentStep - 1);
          }}
        >
          <ProgressBar currentStep={2} numberOfSteps={3} />
          <h2 className="font-bold text-xl mb-2">This is the second step.</h2>
          <p>Click the button to proceed to the final step.</p>
          <button
            className="cta-primary cta-base-p m-2 flex-1"
            type="button"
            onClick={() => {
              setCurrentStep(currentStep + 1);
            }}
          >
            Next view
          </button>
        </FlowContainer>
      )}
      {
        // Example wizard flow generated
        currentStep === 3 && (
          <FlowContainer
            title="Example wizard flow"
            localizedBackButtonTitle="Previous page title"
            onBackButtonClick={() => {
              setCurrentStep(currentStep - 1);
            }}
          >
            <ProgressBar currentStep={3} numberOfSteps={3} />
            <h2 className="font-bold text-xl mb-2">This is the end! </h2>
            <p>
              Take an arbitrary action by clicking the button, or navigate back
              to a prior step.
            </p>
            <button
              className="cta-primary cta-base-p m-2 flex-1"
              type="button"
              onClick={() => {
                alert('You did it!');
              }}
            >
              Finish flow
            </button>
          </FlowContainer>
        )
      }
    </>
  );
};
