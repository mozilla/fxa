/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LightbulbIcon } from '../Icons';
import BoxButton from '.';

export default {
  title: 'Components/BoxButton',
  component: BoxButton,
  decorators: [withLocalization],
  parameters: {
    docs: {
      description: {
        component:
          'Full-width box-style button with leading icon, label, and trailing icon. Hover, active, and focus states are CSS-driven — interact with the rendered button to see them. Use the locale toggle in Storybook chrome to verify RTL.',
      },
    },
  },
} as Meta;

const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="card mx-auto max-w-md">{children}</div>
);

export const Default = () => (
  <Container>
    <BoxButton
      leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
      onClick={action('clicked')}
    >
      Open settings
    </BoxButton>
  </Container>
);

export const WithoutIcon = () => (
  <Container>
    <BoxButton onClick={action('clicked')}>Continue</BoxButton>
  </Container>
);

export const WithCustomTrailingIcon = () => (
  <Container>
    <BoxButton
      leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
      trailingIcon={<span aria-hidden>+</span>}
      onClick={action('clicked')}
    >
      Add new item
    </BoxButton>
  </Container>
);

export const Disabled = () => (
  <Container>
    <BoxButton
      leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
      disabled
      onClick={action('clicked')}
    >
      Currently unavailable
    </BoxButton>
  </Container>
);

export const Loading = () => (
  <Container>
    <BoxButton
      leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
      isLoading
      onClick={action('clicked')}
    >
      Saving changes…
    </BoxButton>
  </Container>
);

export const LongLabel = () => (
  <Container>
    <BoxButton
      leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
      onClick={action('clicked')}
    >
      A long label that wraps to multiple lines and grows the button height
      while keeping the icon and chevron centred
    </BoxButton>
  </Container>
);

export const ExtraLongWord = () => (
  <Container>
    <BoxButton
      leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
      onClick={action('clicked')}
    >
      Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft
    </BoxButton>
  </Container>
);

export const Stacked = () => (
  <Container>
    <div className="flex flex-col gap-2.5">
      <BoxButton
        leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
        onClick={action('first-clicked')}
      >
        First option
      </BoxButton>
      <BoxButton
        leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
        onClick={action('second-clicked')}
      >
        Second option
      </BoxButton>
      <BoxButton
        leadingIcon={<LightbulbIcon className="w-5 h-5" ariaHidden />}
        onClick={action('third-clicked')}
      >
        Third option
      </BoxButton>
    </div>
  </Container>
);
