import React, { useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../.storybook/components/MockApp';
import LoremIpsum from '../../.storybook/components/LoremIpsum';
import { useBooleanState } from '../lib/hooks';
import { SignInLayout } from './AppLayout';
import { DialogMessage } from './DialogMessage';

storiesOf('components/DialogMessage', module)
  .add('basic', () => (
    <MockPage>
      <DialogToggle>
        {({ dialogShown, hideDialog }) =>
          dialogShown && (
            <DialogMessage onDismiss={hideDialog}>
              <h4>This is a basic dialog</h4>
              <p>Content goes in here.</p>
            </DialogMessage>
          )
        }
      </DialogToggle>
    </MockPage>
  ))
  .add('error', () => (
    <MockPage>
      <DialogToggle>
        {({ dialogShown, hideDialog }) =>
          dialogShown && (
            <DialogMessage className="dialog-error" onDismiss={hideDialog}>
              <h4>This is an error dialog</h4>
              <p>Content goes in here.</p>
            </DialogMessage>
          )
        }
      </DialogToggle>
    </MockPage>
  ))
  .add('without onDismiss', () => (
    <MockPage>
      <DialogMessage>
        <h4>This is a basic dialog</h4>
        <p>Content goes in here.</p>
      </DialogMessage>
    </MockPage>
  ));

type MockPageProps = {
  children: React.ReactNode;
};

const MockPage = ({ children }: MockPageProps) => {
  return (
    <MockApp>
      <SignInLayout>
        <h2>This is some sample content</h2>
        <p>App content goes here, underneath the dialog.</p>
        <LoremIpsum />
        {children}
      </SignInLayout>
    </MockApp>
  );
};

type DialogToggleChildrenProps = {
  dialogShown: boolean;
  hideDialog: Function;
  showDialog: Function;
};
type DialogToggleProps = {
  children: (props: DialogToggleChildrenProps) => React.ReactNode | null;
};
const DialogToggle = ({ children }: DialogToggleProps) => {
  const [dialogShown, showDialog, hideDialog] = useBooleanState(true);
  const onClick = useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault();
      showDialog();
    },
    [showDialog]
  );
  return (
    <div className="dialog-toggle">
      <button onClick={onClick}>Show dialog</button>
      {children({ dialogShown, showDialog, hideDialog })}
    </div>
  );
};
