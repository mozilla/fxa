import React from 'react';
import { storiesOf } from '@storybook/react';
import tailwindConfig from '../../../fxa-react/configs/tailwind';
import resolveConfig from 'tailwindcss/resolveConfig';
import Introduction from './pages/Introduction';
import Colors from './pages/Colors';
import Typography from './pages/Typography';
import Spacing from './pages/Spacing';
import Breakpoints from './pages/Breakpoints';

const fullConfig = resolveConfig(tailwindConfig);

storiesOf('Design Guide|Settings', module).add('Introduction', () => (
  <Introduction />
));

storiesOf('Design Guide|Settings', module).add('Colors', () => (
  <Colors config={fullConfig} />
));

storiesOf('Design Guide|Settings', module).add('Typography', () => (
  <Typography config={fullConfig} />
));

storiesOf('Design Guide|Settings', module).add('Spacing', () => (
  <Spacing config={fullConfig} />
));

storiesOf('Design Guide|Settings', module).add('Breakpoints', () => (
  <Breakpoints config={fullConfig} />
));
