/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { useEffect } from 'react';

export function useEscKeydownEffect(onEscKeydown: (...args: any[]) => any) {
  useEffect(() => {
    const handler = ({ key }: KeyboardEvent) => {
      if (key === 'Escape') {
        onEscKeydown();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onEscKeydown]);
}
