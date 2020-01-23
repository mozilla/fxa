import React, { ReactNode } from 'react';
import { Localized } from 'fluent-react';
import classNames from 'classnames';
import { useClickOutsideEffect } from '../../lib/hooks';

import Portal from '../Portal';

import './index.scss';
import CloseIcon from '../CloseIcon';

type DialogMessageProps = {
  className?: string;
  onDismiss?: Function;
  children: ReactNode;
  'data-testid'?: string;
};

/* istanbul ignore next - not worth testing this function */
const noop = () => {};

export const DialogMessage = ({
  className = '',
  onDismiss,
  children,
  'data-testid': testid = 'dialog-message-container',
}: DialogMessageProps) => {
  const dialogInsideRef = useClickOutsideEffect<HTMLDivElement>(
    // HACK: can't use the hook conditionally, so let's supply a dummy
    // function when onDismiss is missing
    onDismiss || noop
  );
  return (
    <Portal id="dialogs">
      <div data-testid={testid} className={classNames('blocker', 'current')}>
        <div
          data-testid="dialog-message-content"
          className={classNames('modal', className)}
          ref={dialogInsideRef}
        >
          {onDismiss && (
            <Localized id="close-aria">
              <button
                data-testid="dialog-dismiss"
                className="dismiss"
                aria-label="Close modal"
                onClick={onDismiss as () => void}
              >
                <CloseIcon />
              </button>
            </Localized>
          )}
          <div className="message">{children}</div>
        </div>
      </div>
    </Portal>
  );
};

export default DialogMessage;
