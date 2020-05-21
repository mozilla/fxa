/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { useClickOutsideEffect } from '@fxa-react/lib/hooks';
import classNames from 'classnames';
import Portal from '@fxa-react/components/Portal';
import { ReactComponent as CloseIcon } from '@fxa-react/images/close.svg';

type ModalProps = {
  className?: string;
  onDismiss?: Function;
  onConfirm?: () => void;
  children: ReactNode;
  'data-testid'?: string;
};

/* istanbul ignore next - not worth testing this function */
const noop = () => {};

const Modal = ({
  className = '',
  onDismiss,
  onConfirm,
  children,
  'data-testid': testid = 'modal',
}: ModalProps) => {
  const modalInsideRef = useClickOutsideEffect<HTMLDivElement>(
    // HACK: can't use the hook conditionally, so let's supply a dummy
    // function when onDismiss is missing
    onDismiss || noop
  );
  return (
    <Portal id="modal">
      <div data-testid={testid}>
        {onDismiss && (
          <button
            data-testid="modal-dismiss"
            className="dismiss"
            aria-label="Close modal"
            onClick={onDismiss as () => void}
          >
            <CloseIcon role="img" aria-label="close" />
          </button>
        )}

        <div
          data-testid="modal-content-container"
          className={classNames('modal-content-container', className)}
          ref={modalInsideRef}
        >
          <div className="modal-content">{children}</div>

          {onDismiss && (
            <button
              data-testid="modal-cancel"
              onClick={onDismiss as () => void}
            >
              Cancel
            </button>
          )}

          {onConfirm && (
            <button data-testid="modal-confirm" onClick={onConfirm}>
              Confirm
            </button>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
