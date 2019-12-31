import React, { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';

import './index.scss';

type PortalProps = {
  id: string;
  children: React.ReactNode;
};

const Portal = ({ id, children }: PortalProps): React.ReactPortal | null => {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('class', 'portal');
    el.setAttribute('id', id);
    document.body.appendChild(el);
  }

  useEffect(() => {
    // Last child out of the portal gets to remove the parent from the DOM.
    return () => {
      let el = document.getElementById(id);
      if (el && el.children.length === 1) {
        el.remove();
      }
    };
  }, [id]);

  return createPortal(children, el);
};

export default memo(Portal);
