/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import MockApp from '../../../.storybook/components/MockApp';
import LoremIpsum from '../../../.storybook/components/LoremIpsum';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { SignInLayout } from '../AppLayout';
import { DialogMessage } from './index';

export default { title: 'components/DialogMessage' };

export const basic = () => (
  <MockPage>
    <DialogToggle>
      {({ dialogShown, hideDialog }) =>
        dialogShown && (
          <DialogMessage
            onDismiss={hideDialog}
            headerId="basic-header"
            descId="basic-description"
          >
            <h4 id="basic-header">This is a basic dialog</h4>
            <p id="basic-description">Content goes in here.</p>
          </DialogMessage>
        )
      }
    </DialogToggle>
  </MockPage>
);

export const error = () => (
  <MockPage>
    <DialogToggle>
      {({ dialogShown, hideDialog }) =>
        dialogShown && (
          <DialogMessage
            className="dialog-error"
            onDismiss={hideDialog}
            headerId="error-header"
            descId="error-description"
          >
            <h4 id="error-header">This is an error dialog</h4>
            <p id="error-description">Content goes in here.</p>
          </DialogMessage>
        )
      }
    </DialogToggle>
  </MockPage>
);

export const withoutOnDismiss = () => (
  <MockPage>
    <DialogMessage
      headerId="basic-no-dismiss-header"
      descId="basic-no-dismiss-description"
    >
      <h4 id="basic-no-dismiss-header">This is a basic dialog</h4>
      <p id="basic-no-dismiss-description">Content goes in here.</p>
    </DialogMessage>
  </MockPage>
);

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
