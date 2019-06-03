import React, { ReactNode } from 'react';
import { useClickOutsideEffect } from '../lib/hooks';

import './DialogMessage.scss';

import Portal from './Portal';

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
      <div className={`dialog ${className}`} ref={dialogInsideRef}>
        <button className="dismiss" onClick={onDismiss as () => void}>&#x274C;</button>
        <div className="message">{children}</div>
      </div>
    </Portal>
  );
};

export default DialogMessage;