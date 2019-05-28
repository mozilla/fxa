import React from 'react';

import './AlertBar.scss';
import Portal from './Portal';

type AlertBarProps = {
  children: any,
  className?: string,
};

export const AlertBar = ({
  children,
  className = 'alert',
}: AlertBarProps) => {
  return (
    <Portal id="top-bar">
      <div className={className}>{children}</div>
    </Portal>
  );
};

export default AlertBar;