/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import { useEscKeydownEffect, useChangeFocusEffect } from '../../lib/hooks';
import classNames from 'classnames';
import Portal from 'fxa-react/components/Portal';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';

type ModalProps = {
  className?: string;
  onDismiss: () => void;
  onConfirm?: () => void;
  children: ReactNode;
  hasButtons?: boolean;
  headerId: string;
  descId: string;
  confirmText?: string;
  confirmBtnClassName?: string;
  'data-testid'?: string;
};

export const Modal = ({
  className = '',
  onDismiss,
  onConfirm,
  children,
  hasButtons = true,
  headerId,
  descId,
  confirmText = 'Confirm',
  confirmBtnClassName = 'cta-primary',
  'data-testid': testid = 'modal',
}: ModalProps) => {
  const modalInsideRef = useClickOutsideEffect<HTMLDivElement>(onDismiss);
  const tabFenceRef = useChangeFocusEffect();
  useEscKeydownEffect(onDismiss);

  return (
    <Portal id="modal" {...{ headerId, descId }}>
      <div
        data-testid={testid}
        className="flex flex-col justify-center fixed inset-0 z-50 w-full px-2 h-full bg-black bg-opacity-75"
      >
        <div
          data-testid="modal-content-container"
          className={classNames(
            'max-w-md bg-white mx-auto rounded-xl',
            className
          )}
          ref={modalInsideRef}
        >
          <div
            tabIndex={0}
            ref={tabFenceRef}
            data-testid="modal-tab-fence"
            className="outline-none"
          />
          <div className="flex justify-end pr-2 pt-2">
            <button
              data-testid="modal-dismiss"
              onClick={onDismiss}
              title="Close modal"
            >
              <CloseIcon className="w-2 h-2 m-3" role="img" />
            </button>
          </div>

          <div className="px-4 tablet:px-10 pb-10">
            <div>{children}</div>
            {hasButtons && (
              <div className="flex justify-center mx-auto mt-6 max-w-64">
                <button
                  className="cta-neutral mx-2 flex-1"
                  data-testid="modal-cancel"
                  onClick={onDismiss}
                >
                  Cancel
                </button>

                {onConfirm && (
                  <button
                    className={classNames('mx-2 flex-1', confirmBtnClassName)}
                    data-testid="modal-confirm"
                    onClick={onConfirm}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
