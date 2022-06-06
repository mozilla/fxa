/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { Modal } from '.';
import { LocationProvider } from '@reach/router';

storiesOf('Components/Modal', module)
  .add('basic with onDismiss', () => (
    <LocationProvider>
      <ModalToggle>
        {({ modalRevealed, hideModal }) =>
          modalRevealed && (
            <Modal onDismiss={hideModal}>
              <h4>This is a basic dialog</h4>
              <p>Content goes in here.</p>
            </Modal>
          )
        }
      </ModalToggle>
    </LocationProvider>
  ))
  .add('error with onDismiss', () => (
    <LocationProvider>
      <ModalToggle>
        {({ modalRevealed, hideModal }) =>
          modalRevealed && (
            <Modal className="dialog-error" onDismiss={hideModal}>
              <h4>This is an error dialog</h4>
              <p>Content goes in here.</p>
            </Modal>
          )
        }
      </ModalToggle>
    </LocationProvider>
  ))
  .add('with cancel button only', () => (
    <LocationProvider>
      <ModalToggle>
        {({ modalRevealed, hideModal }) =>
          modalRevealed && (
            <Modal
              headerId="some-id"
              descId="some-description"
              onDismiss={hideModal}
              hasButtons
              hasCancelButton
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
  .add('with confirm button only', () => (
    <LocationProvider>
      <ModalToggle>
        {({ modalRevealed, hideModal }) =>
          modalRevealed && (
            <Modal
              headerId="some-id"
              descId="some-description"
              onConfirm={hideModal as () => void}
              onDismiss={hideModal}
              hasButtons
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
  ))
  .add('with cancel and confirm buttons', () => (
    <LocationProvider>
      <ModalToggle>
        {({ modalRevealed, hideModal }) =>
          modalRevealed && (
            <Modal
              headerId="some-id"
              descId="some-description"
              onConfirm={hideModal as () => void}
              onDismiss={hideModal}
              hasButtons
              hasCancelButton
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
