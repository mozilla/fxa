import React, { ReactNode } from 'react';
import { useVoidCallback, useClickOutsideEffect } from '../lib/hooks';

import './DialogMessage.scss';

import Portal from './Portal';

type DialogMessageProps = {
  className?: string,
  onDismiss: Function,
  children: ReactNode,
};

const DialogMessage = ({
  className = '',
  onDismiss,
  children,
}: DialogMessageProps) => {
  const onClickDismiss = useVoidCallback(onDismiss);
  const dialogInsideRef = useClickOutsideEffect<HTMLDivElement>(onClickDismiss);
  return (
    <Portal id="dialogs">
      <div className={`dialog ${className}`} ref={dialogInsideRef}>
        <button className="dismiss" onClick={onClickDismiss}>&#x274C;</button>
        <div className="message">{children}</div>
      </div>
    </Portal>
  );
};

export default DialogMessage;