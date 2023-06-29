import React from 'react';
import { storiesOf } from '@storybook/react';
import LinkExternal from './index';
import { withLocalization } from '../../lib/storybooks';

storiesOf('Components/LinkExternal', module).add('basic', () =>
  withLocalization(() => (
    <LinkExternal href="https://mozilla.org">
      Keep the internet open and accessible to all.
    </LinkExternal>
  ))
);
