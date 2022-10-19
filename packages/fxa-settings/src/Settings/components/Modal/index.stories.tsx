/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { Modal } from '.';
import { LocationProvider } from '@reach/router';

storiesOf('Components/Modal', module)
  .add('basic', () => (
    <LocationProvider>
      <ModalToggle>
        {({ modalRevealed, hideModal }) =>
          modalRevealed && (
            <Modal
              headerId="some-id"
              descId="some-description"
              onDismiss={hideModal}
            >
              <h2 id="some-id">Header goes here.</h2>
              <p id="some-description">
                This is a basic modal with a cancel button.
              </p>
            </Modal>
          )
        }
      </ModalToggle>
    </LocationProvider>
  ))
  .add('with confirm button', () => (
    <LocationProvider>
      <ModalToggle>
        {({ modalRevealed, hideModal }) =>
          modalRevealed && (
            <Modal
              headerId="some-id"
              descId="some-description"
              onConfirm={hideModal as () => void}
              onDismiss={hideModal}
            >
              <h2 id="some-id">Header goes here.</h2>
              <p id="some-description">
                This is a modal with cancel and confirm buttons.
              </p>
            </Modal>
          )
        }
      </ModalToggle>
    </LocationProvider>
  ))
  .add('with confirm and no cancel button', () => (
    <LocationProvider>
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
              <h2 id="some-id">Header goes here.</h2>
              <p id="some-description">
                This is a modal with a confirm button, but no cancel button.
              </p>
            </Modal>
          )
        }
      </ModalToggle>
    </LocationProvider>
  ));

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
    <div>
      <button {...{ onClick }}>Show modal</button>
      {children({ modalRevealed, showModal, hideModal })}
    </div>
  );
};
