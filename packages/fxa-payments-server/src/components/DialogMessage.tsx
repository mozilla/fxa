import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { useClickOutsideEffect } from '../lib/hooks';

import Portal from './Portal';

import './DialogMessage.scss';

type DialogMessageProps = {
  className?: string,
  onDismiss: Function,
  children: ReactNode,
};

export const DialogMessage = ({
  className = '',
  onDismiss,
  children,
}: DialogMessageProps) => {
  const dialogInsideRef = useClickOutsideEffect<HTMLDivElement>(onDismiss);
  return (
    <Portal id="dialogs">
      <div className={classNames('blocker', 'current')}>
        <div className={classNames('modal', className)} ref={dialogInsideRef}>
          <button className="dismiss" onClick={onDismiss as () => void}>&#x2715;</button>
          <div className="message">{children}</div>
        </div>
      </div>
    </Portal>
  );
};

export default DialogMessage;
