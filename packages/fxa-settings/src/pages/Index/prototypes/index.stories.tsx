/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { SplitHero, Conversational, MethodChooser } from '.';

export default {
  title: 'Pages/Index/Prototypes',
  parameters: { layout: 'fullscreen' },
  decorators: [withLocalization],
} as Meta;

export const A_SplitHero = () => <SplitHero />;
export const B_Conversational = () => <Conversational />;
export const C_MethodChooser = () => <MethodChooser initialEmailOpen />;
