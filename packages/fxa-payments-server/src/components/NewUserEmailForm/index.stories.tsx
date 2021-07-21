import React from 'react';
import { storiesOf } from '@storybook/react';
import { NewUserEmailForm } from './index';

storiesOf('components/NewUserEmailForm', module).add('default', () => (
  <div style={{ display: 'flex' }}>
    <NewUserEmailForm getString={(id: string) => id} />
  </div>
));
