import React, { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  id: string;
  children: React.ReactNode;
};

const TOP_LEVEL_NONMODAL_DIVS_SELECTOR = 'body > div:not(#modal)';

const setA11yOnAdjacentElementsAndBody = (els: NodeListOf<HTMLElement>) => {
  document.body.classList.add('overflow-hidden');
  els.forEach((el) => {
    el.setAttribute('aria-hidden', 'true');
    el.classList.add('pointer-events-none');
  });
};

const resetA11yOnAdjacentElementsAndBody = (els: NodeListOf<HTMLElement>) => {
  document.body.classList.remove('overflow-hidden');
  els.forEach((el) => {
    el.removeAttribute('aria-hidden');
    el.classList.remove('pointer-events-none');
  });
};

const Portal = ({ id, children }: PortalProps): React.ReactPortal | null => {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('class', 'portal');
    el.setAttribute('id', id);
    document.body.appendChild(el);

    if (id === 'modal') {
      setA11yOnAdjacentElementsAndBody(
        document.querySelectorAll(TOP_LEVEL_NONMODAL_DIVS_SELECTOR)
      );
    }

    if (id === 'top-bar') {
      el.setAttribute(
        'class',
        'portal fixed top-0 inset-x-0 p-0 z-[9999] tablet:px-16'
      );
    }
  }

  useEffect(() => {
    return () => {
      let el = document.getElementById(id);
      if (el && el.children.length === 0) {
        // Reset any non-portal properties here
        if (id === 'modal') {
          // When unloaded, we do not remove the portal element in order to allow
          // a series of portal dependent components to be rendered.
          resetA11yOnAdjacentElementsAndBody(
            document.querySelectorAll(TOP_LEVEL_NONMODAL_DIVS_SELECTOR)
          );
        } else {
          el.remove();
        }
      }
    };
  }, [id]);

  return createPortal(children, el);
};

export default memo(Portal);
