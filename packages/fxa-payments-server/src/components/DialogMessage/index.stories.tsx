/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { Meta } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import LoremIpsum from '../../../.storybook/components/LoremIpsum';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { SignInLayout } from '../AppLayout';
import { DialogMessage } from './index';

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

export default {
  title: 'components/DialogMessage',
  component: DialogMessage,
} as Meta;

const storyWithProps = ({
  headerId = 'basic-header',
  descId = 'basic-description',
  header = 'This is a basic dialog',
  description = 'Content goes in here.',
  closeDialog = true,
  className,
}: {
  headerId?: string;
  descId?: string;
  header?: string;
  description?: string;
  closeDialog?: boolean;
  className?: string;
}) => {
  const story = () => (
    <MockPage>
      {closeDialog ? (
        <DialogToggle>
          {({ dialogShown, hideDialog }) =>
            dialogShown && (
              <DialogMessage
                headerId={headerId}
                descId={descId}
                onDismiss={hideDialog}
                className={className}
              >
                <h4 id="basic-header">{header}</h4>
                <p id="basic-description">{description}</p>
              </DialogMessage>
            )
          }
        </DialogToggle>
      ) : (
        <DialogMessage
          headerId="basic-no-dismiss-header"
          descId="basic-no-dismiss-description"
        >
          <h4 id="basic-no-dismiss-header">{header}</h4>
          <p id="basic-no-dismiss-description">{description}</p>
        </DialogMessage>
      )}
    </MockPage>
  );
  return story;
};

export const Default = storyWithProps({});

export const Error = storyWithProps({
  className: 'dialog-error',
  headerId: 'error-header',
  descId: 'error-description',
  header: 'This is an error dialog',
});

export const WithoutDismiss = storyWithProps({ closeDialog: false });
