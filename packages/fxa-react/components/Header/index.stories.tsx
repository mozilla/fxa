import React from 'react';
import { storiesOf } from '@storybook/react';
import { Header } from './index';
import { LogoLockup } from '../LogoLockup';
import { withLocalization } from '../../lib/storybooks';

storiesOf('Components/Header', module)
  .add('basic', () =>
    withLocalization(() => (
      <Header left={<div>left content</div>} right={<div>right content</div>} />
    ))
  )
  .add('with LogoLockup', () =>
    withLocalization(() => (
      <Header
        left={<LogoLockup>Some title</LogoLockup>}
        right={<div>right content</div>}
      />
    ))
  );
