import React from 'react';
import { storiesOf } from '@storybook/react';
import { NewUserEmailForm } from './index';

storiesOf('components/NewUserEmailForm', module)
  .add('default', () => (
    <div style={{ display: 'flex' }}>
      <NewUserEmailForm
        getString={(id: string) => id}
        checkAccountExists={() => Promise.resolve({ exists: false })}
      />
    </div>
  ))
  .add('existing account', () => (
    <div style={{ display: 'flex' }}>
      <NewUserEmailForm
        getString={(id: string) => id}
        checkAccountExists={() => Promise.resolve({ exists: true })}
      />
    </div>
  ));
