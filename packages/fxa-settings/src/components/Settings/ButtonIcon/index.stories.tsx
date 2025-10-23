/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StoryFn } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ButtonIcon, { ButtonIconReload, ButtonIconTrash } from '.';

const meta = {
  title: 'Components/Settings/ButtonIcon',
  component: ButtonIcon,
  subcomponents: { ButtonIconTrash, ButtonIconReload },
  decorators: [
    withLocalization,
    (Story: StoryFn) => (
      <div className="p-10 max-w-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const onClick = () => alert('You clicked the button!');

export const TrashButton = () => <ButtonIconTrash title="Remove email" />;

export const ButtonDisabled = () => (
  <ButtonIconTrash title="Remove email" disabled />
);

export const ButtonWithClickAction = () => (
  <ButtonIconTrash {...{ onClick }} title="Remove email" />
);

export const ReloadButton = () => <ButtonIconReload title="Reload email" />;
