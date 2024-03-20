/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import { useEscKeydownEffect, useChangeFocusEffect } from '../../../lib/hooks';
import classNames from 'classnames';
import Portal from 'fxa-react/components/Portal';
import { ReactComponent as CloseIcon } from '../../../../../../libs/shared/assets/src/images/close.svg';
import { Link, useLocation } from '@reach/router';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';

type ModalProps = {
  className?: string;
  onDismiss: () => void;
  onConfirm?: () => void;
  children: ReactNode;
  hasButtons?: boolean;
  hasCancelButton?: boolean;
  headerId: string;
  descId: string;
  route?: string;
  confirmText?: string;
  confirmBtnClassName?: string;
  'data-testid'?: string;
  isLoading?: boolean;
};

export const Modal = ({
  className = '',
  onDismiss,
  onConfirm,
  children,
  hasButtons = true,
  hasCancelButton = true,
  headerId,
  descId,
  route,
  confirmText,
  confirmBtnClassName = 'cta-primary cta-base-p',
  'data-testid': testid = 'modal',
  isLoading = false,
}: ModalProps) => {
  const modalInsideRef = useClickOutsideEffect<HTMLDivElement>(onDismiss);
  const tabFenceRef = useChangeFocusEffect();
  const location = useLocation();
  const ftlMsgResolver = useFtlMsgResolver();
  useEscKeydownEffect(onDismiss);

  const localizedDefaultConfirmText = ftlMsgResolver.getMsg(
    'modal-default-confirm-button',
    'Confirm'
  );

  return (
    <Portal id="modal">
      <div
        data-testid={testid}
        className="flex flex-col justify-center fixed inset-0 z-50 w-full px-2 h-full bg-black/75"
      >
        <div
          data-testid="modal-content-container"
          className={classNames(
            'max-w-md bg-white mx-auto rounded-xl border border-transparent',
            className
          )}
          ref={modalInsideRef}
        >
          <div
            tabIndex={0}
            ref={tabFenceRef}
            data-testid="modal-tab-fence"
            className="outline-none"
          >
            <div className="flex justify-end pe-2 py-2">
              <button
                data-testid="modal-dismiss"
                onClick={(event) => onDismiss()}
                title={ftlMsgResolver.getMsg('modal-close-title', 'Close')}
              >
                <CloseIcon className="w-4 h-4 m-3 fill-current" />
              </button>
            </div>

            <div
              aria-describedby={descId}
              aria-labelledby={headerId}
              className="px-6 tablet:px-10 pb-10"
              data-testid="modal-information"
              role="dialog"
            >
              {children}

              {hasButtons && (
                <div className="flex justify-center mx-auto mt-6 max-w-64">
                  {hasCancelButton && (
                    <FtlMsg id="modal-cancel-button">
                      <button
                        className="cta-neutral mx-2 flex-1 cta-base-p"
                        data-testid="modal-cancel"
                        onClick={(event) => onDismiss()}
                      >
                        Cancel
                      </button>
                    </FtlMsg>
                  )}

                  {route && (
                    <Link
                      className={classNames('mx-2 flex-1', confirmBtnClassName)}
                      data-testid="modal-confirm"
                      to={`${route}${location.search}`}
                    >
                      {confirmText || localizedDefaultConfirmText}
                    </Link>
                  )}

                  {onConfirm && (
                    <button
                      className={classNames('mx-2 flex-1', confirmBtnClassName)}
                      data-testid="modal-confirm"
                      onClick={(event) => {
                        onConfirm();
                      }}
                      disabled={isLoading}
                    >
                      {confirmText || localizedDefaultConfirmText}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
