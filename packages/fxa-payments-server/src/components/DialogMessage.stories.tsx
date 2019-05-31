import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { DialogMessage } from './DialogMessage';

storiesOf('components/DialogMessage', module)
  .add('error', () => (
    <DialogMessage className="error" onDismiss={action('dismiss')}>
      This is a dialog message
    </DialogMessage>
  ));
