/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ButtonIcon, { ButtonIconTrash, ButtonIconReload } from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Components/Settings/ButtonIcon',
  component: ButtonIcon,
  subcomponents: { ButtonIconTrash, ButtonIconReload },
  decorators: [
    withLocalization,
    (Story) => (
      <div className="p-10 max-w-lg">
        <Story />
      </div>
    ),
  ],
} as Meta;

const onClick = () => alert('You clicked the button!');

export const TrashButton = () => <ButtonIconTrash title="Remove email" />;

export const ButtonDisabled = () => (
  <ButtonIconTrash title="Remove email" disabled />
);

export const ButtonWithClickAction = () => (
  <ButtonIconTrash {...{ onClick }} title="Remove email" />
);

export const ReloadButton = () => <ButtonIconReload title="Reload email" />;
