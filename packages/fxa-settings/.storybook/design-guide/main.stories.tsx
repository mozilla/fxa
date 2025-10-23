/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { storiesOf } from '@storybook/react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../fxa-react/configs/tailwind';
import Breakpoints from './pages/Breakpoints';
import Colors from './pages/Colors';
import Introduction from './pages/Introduction';
import Spacing from './pages/Spacing';
import Typography from './pages/Typography';

const fullConfig = resolveConfig(tailwindConfig);

// these have an emoji in front so they appear at the top of the alphabetical sort
storiesOf('✩Design Guide/Introduction', module).add('Introduction', () => (
  <Introduction />
));

storiesOf('✩Design Guide/Colors', module).add('Colors', () => (
  <Colors config={fullConfig} />
));

storiesOf('✩Design Guide/Typography', module).add('Typography', () => (
  <Typography config={fullConfig} />
));

storiesOf('✩Design Guide/Spacing', module).add('Spacing', () => (
  <Spacing config={fullConfig} />
));

storiesOf('✩Design Guide/Breakpoints', module).add('Breakpoints', () => (
  <Breakpoints config={fullConfig} />
));
