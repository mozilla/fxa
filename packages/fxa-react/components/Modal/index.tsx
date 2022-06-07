/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { useClickOutsideEffect, useEscKeydownEffect, useChangeFocusEffect } from 'fxa-react/lib/hooks';
import classNames from 'classnames';
import Portal from 'fxa-react/components/Portal';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';
import { Link, useLocation } from '@reach/router';
import { Localized, useLocalization } from '@fluent/react';

type ModalProps = {
  children: ReactNode;
  className?: string;
  confirmBtnClassName?: string;
  confirmText?: string;
  descId?: string;
  hasButtons?: boolean;
  hasCancelButton?: boolean;
  headerId?: string;
  route?: string;
  onConfirm?: () => void;
  onDismiss?: () => void;
  'data-testid'?: string;
};

/* istanbul ignore next - not worth testing this function */
const noop = () => {};

export const Modal = ({
  children,
  className,
  confirmBtnClassName = 'cta-primary',
  confirmText = 'Confirm',
  descId,
  hasButtons,
  hasCancelButton,
  headerId,
  route,
  onDismiss,
  onConfirm,
  'data-testid': testid = 'modal',
}: ModalProps) => {
  const modalInsideRef = useClickOutsideEffect<HTMLDivElement>(onDismiss || noop);
  const tabFenceRef = useChangeFocusEffect();
  let location;
  if (route) {
    location = useLocation();
  }
  useEscKeydownEffect(onDismiss || noop);

  return (
    <Portal id="modal" {...{ headerId, descId }}>
      <div
        data-testid={testid}
        className="flex flex-col justify-center fixed inset-0 z-50 w-full px-2 h-full bg-black bg-opacity-75"
      >
        <div
          data-testid="modal-content-container"
          className={classNames(
            'max-w-md bg-white mx-auto rounded-xl mobileLandscape:max-w-sm mobileLandscape:w-full',
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

          {onDismiss &&
            <Localized id="close-aria">
              <div className="flex justify-end pr-2 pt-2">
                <button
                  aria-label="Close modal"
                  data-testid="modal-dismiss"
                  onClick={() => onDismiss()}
                >
                  <CloseIcon
                    aria-hidden="true"
                    className="w-4 h-4 m-3"
                    focusable="false"
                    role="img"
                  />
                </button>
              </div>
            </Localized>
          }

          <div className="px-6 tablet:px-10 pb-10">
            <div className="text-center">{children}</div>
            {hasButtons && (
              <div className="flex justify-center mx-auto mt-6 max-w-64">
                {hasCancelButton && onDismiss && (
                  <Localized id="modal-cancel-button">
                    <button
                      className="cta-neutral mx-2 flex-1"
                      data-testid="modal-cancel"
                      onClick={() => onDismiss()}
                    >
                      Cancel
                    </button>
                  </Localized>
                )}

                {route && location && (
                  <Link
                    className={classNames('mx-2 flex-1', confirmBtnClassName)}
                    data-testid="modal-confirm"
                    to={`${route}${location.search}`}
                  >
                    {confirmText}
                  </Link>
                )}

                {onConfirm && (
                  <button
                    className={classNames('mx-2 flex-1', confirmBtnClassName)}
                    data-testid="modal-confirm"
                    onClick={() => onConfirm()}
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
