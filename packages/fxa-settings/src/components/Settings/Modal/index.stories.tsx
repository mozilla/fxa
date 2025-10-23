/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import React, { useCallback } from 'react';
import { Modal } from '.';

// ModalToggle only included for Storybook functionality
type ModalToggleChildrenProps = {
  modalRevealed: boolean;
  hideModal: () => void;
  showModal: () => void;
};
type ModalToggleProps = {
  children: (props: ModalToggleChildrenProps) => React.ReactNode | null;
};
const ModalToggle = ({ children }: ModalToggleProps) => {
  const [modalRevealed, showModal, hideModal] = useBooleanState(true);
  const onClick = useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault();
      showModal();
    },
    [showModal]
  );
  return (
    <div className="flex flex-col max-w-64 mx-auto">
      <button className="cta-base-p cta-neutral" {...{ onClick }}>
        Show modal
      </button>
      {children({ modalRevealed, showModal, hideModal })}
    </div>
  );
};

export default {
  title: 'Components/Settings/Modal',
  component: Modal,
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

export const Default = () => (
  <ModalToggle>
    {({ modalRevealed, hideModal }) =>
      modalRevealed && (
        <Modal
          headerId="some-id"
          descId="some-description"
          onDismiss={hideModal}
        >
          <h2>Header goes here.</h2>
          <p>This is a basic modal with a cancel button.</p>
        </Modal>
      )
    }
  </ModalToggle>
);

export const WithConfirmButton = () => (
  <ModalToggle>
    {({ modalRevealed, hideModal }) =>
      modalRevealed && (
        <Modal
          headerId="some-id"
          descId="some-description"
          onConfirm={hideModal as () => void}
          onDismiss={hideModal}
        >
          <h2>Header goes here.</h2>
          <p>This is a modal with cancel and confirm buttons.</p>
        </Modal>
      )
    }
  </ModalToggle>
);

export const WithConfirmAndNoCancelButton = () => (
  <ModalToggle>
    {({ modalRevealed, hideModal }) =>
      modalRevealed && (
        <Modal
          headerId="some-id"
          descId="some-description"
          onConfirm={hideModal as () => void}
          onDismiss={hideModal}
          hasCancelButton={false}
        >
          <h2>Header goes here.</h2>
          <p>This is a modal with a confirm button, but no cancel button.</p>
        </Modal>
      )
    }
  </ModalToggle>
);
