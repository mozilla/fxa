import React from 'react';
import { storiesOf } from '@storybook/react';
import { Header } from './index';
import { LogoLockup } from '../LogoLockup';

storiesOf('Components|Header', module)
  .add('basic', () => (
    <Header left={<div>left content</div>} right={<div>right content</div>} />
  ))
  .add('with LogoLockup', () => (
    <Header
      left={<LogoLockup>Some title</LogoLockup>}
      right={<div>right content</div>}
    />
  ));
