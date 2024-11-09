/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import InputPassword from '.';
import { SubjectWithPairedInputs } from './mocks';

export default {
  title: 'Components/InputPassword',
  component: InputPassword,
  decorators: [
    withLocalization,
    (Story: StoryObj) => (
      <div className="flex flex-col gap-4 p-10 max-w-lg">
        <Story />
      </div>
    ),
  ],
} as Meta;

export const Default = () => (
  <>
    <InputPassword label="You think you know how to password? Enter it here." />
    <InputPassword
      label="With a (bad password) placeholder"
      placeholder="password1234"
    />
    <InputPassword label="This is disabled - you can’t type here" disabled />
    <p className="text-sm italic mt-10">
      <strong>Tip:</strong> Type in the password field to see/use the visibility
      toggle
    </p>
  </>
);

export const WithErrorTooltip = () => (
  <>
    <InputPassword
      label="Looks like you don’t know how to password"
      hasErrors
      errorText="Default: centered on top"
    />
    <InputPassword
      label="Still no good"
      hasErrors
      errorText="Anchored at the start, check me out in RTL"
      anchorPosition="start"
    />
    <InputPassword
      label="You might need some practice."
      hasErrors
      errorText="On the bottom"
      tooltipPosition="bottom"
    />
    <p className="text-sm italic mt-10">
      <strong>Tip:</strong> Type in the password field to see/use the visibility
      toggle.
    </p>
  </>
);

export const WithVisibilityPaired = () => <SubjectWithPairedInputs />;
