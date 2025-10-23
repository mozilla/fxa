/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import InputCheckboxBlue from './index';

export default {
  title: 'Components/InputCheckboxBlue',
  component: InputCheckboxBlue,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => (
  <div className="flex flex-col p-10 max-w-lg">
    <InputCheckboxBlue />
    <InputCheckboxBlue label="Howdy I'm a label" />
    <InputCheckboxBlue label="Hey hey, I'm checked baby" defaultChecked />
    <InputCheckboxBlue
      label="Label that is extremely long because you never know what some languages are going to produce with the sentence you give them"
      defaultChecked
    />
    <InputCheckboxBlue label="Can't check this du nu nu nun" disabled />
    <InputCheckboxBlue
      label="Checked and disabled? Cool flex."
      defaultChecked
      disabled
    />
  </div>
);
