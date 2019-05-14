import React from 'react';
import ReactDOM from 'react-dom';

import './AlertBar.scss';

type AlertBarProps = {
  children: any,
  className?: string,
};

export const AlertBar = ({
  children,
  className = 'alert',
}: AlertBarProps) => {
  const parent = document.getElementById('top-bar');
  if (!parent) {
    // Should not happen, but type checking is happier.
    return null;
  }
  return ReactDOM.createPortal(
    <div className={className}>{children}</div>,
    parent
  );
};

export default AlertBar;