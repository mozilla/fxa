/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import InputText from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/InputText',
  component: InputText,
  decorators: [
    withLocalization,
    (Story: StoryObj) => (
      <div className="flex flex-col gap-4 p-10 max-w-lg">
        <Story />
      </div>
    ),
  ],
} as Meta;

export const TypeText = () => (
  <>
    <InputText
      label="Default label (with error tooltip)"
      placeholder="Here’s a suggestion"
      errorText="This is some error text"
    />
    <InputText
      label="Label with value"
      placeholder="Here’s a suggestion"
      defaultValue="This is the value"
    />
    <InputText label="This one’s disabled" disabled />
    <InputText
      label="This one’s disabled"
      defaultValue="But it has a value"
      disabled
    />
    <InputText
      label="Label that is extremely long because you never know what some languages are going to produce with the sentence you give them"
      placeholder="Hope it works!"
      defaultValue="wow"
    />
  </>
);

export const TypeEmail = () => (
  <>
    <InputText
      type="email"
      label="Enter your email, please"
      placeholder="cutie@pie.com"
    />
  </>
);
export const TypeNumber = () => (
  <>
    <InputText
      type="number"
      label="How many stars in the universe?"
      placeholder="Just one, it’s you"
    />
  </>
);

export const TypePassword = () => (
  <>
    <InputText
      type="password"
      label="Super secret password"
      placeholder="Make sure it’s a good one"
    />
    <p className="text-sm">
      Note: please use the <code>&lt;InputPassword /&gt;</code> component
      instead.
    </p>
  </>
);

export const TypeTel = () => (
  <>
    <InputText
      type="tel"
      label="Enter your phone number"
      defaultValue="250 746 4399"
    />
  </>
);

export const TypeUrl = () => (
  <>
    <InputText type="url" label="Link to your alt account" />
  </>
);
