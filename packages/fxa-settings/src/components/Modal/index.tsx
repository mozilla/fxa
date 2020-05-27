/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode, useEffect, useRef } from 'react';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import classNames from 'classnames';
import Portal from 'fxa-react/components/Portal';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';

type ModalProps = {
  className?: string;
  onDismiss: Function;
  onConfirm?: () => void;
  children: ReactNode;
  headerId: string;
  descId: string;
  'data-testid'?: string;
};

const Modal = ({
  className = '',
  onDismiss,
  onConfirm,
  children,
  headerId,
  descId,
  'data-testid': testid = 'modal',
}: ModalProps) => {
  const modalInsideRef = useClickOutsideEffect<HTMLDivElement>(onDismiss);

  // direct tab focus to the modal when opened for screenreaders
  const tabFenceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (tabFenceRef.current) {
      tabFenceRef.current.focus();
    }
  }, []);

  // close on esc keydown
  useEffect(() => {
    const handler = ({ key }: KeyboardEvent) => {
      if (key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onDismiss]);

  return (
    <Portal id="modal" {...{ headerId, descId }}>
      <div data-testid={testid}>
        <div tabIndex={0} ref={tabFenceRef} data-testid="tab-fence"></div>
        <div
          data-testid="modal-content-container"
          className={classNames('modal-content-container', className)}
          ref={modalInsideRef}
        >
          <button
            data-testid="modal-dismiss"
            className="dismiss"
            aria-label="Close modal"
            onClick={onDismiss as () => void}
          >
            <CloseIcon role="img" aria-label="close" />
          </button>
          <div className="modal-content">{children}</div>

          <button data-testid="modal-cancel" onClick={onDismiss as () => void}>
            Cancel
          </button>

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
