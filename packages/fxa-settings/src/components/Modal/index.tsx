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

export const Modal = ({
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
      <div
        data-testid={testid}
        className="flex flex-col justify-center fixed inset-0 w-full px-2 h-full bg-black bg-opacity-75"
      >
        <div
          data-testid="modal-content-container"
          className={classNames(
            'max-w-lg bg-white mx-auto rounded-xl',
            className
          )}
          ref={modalInsideRef}
        >
          <div
            tabIndex={0}
            ref={tabFenceRef}
            data-testid="tab-fence"
            className="w-px"
          ></div>
          <div className="flex justify-end pr-2 pt-2">
            <button
              data-testid="modal-dismiss"
              onClick={onDismiss as () => void}
            >
              <CloseIcon
                className="w-2 h-2 m-3"
                role="img"
                aria-label="Close modal"
              />
            </button>
          </div>

          <div className="px-4 tablet:px-12 pb-10">
            <div>{children}</div>

            <div className="flex mt-6">
              <button
                className="cta-neutral-lg transition-standard flex-1"
                data-testid="modal-cancel"
                onClick={onDismiss as () => void}
              >
                Cancel
              </button>

              {onConfirm && (
                <button
                  className="cta-primary transition-standard flex-1"
                  data-testid="modal-confirm"
                  onClick={onConfirm}
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
