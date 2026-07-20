/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import {
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';

export interface CartMutationContextValues {
  isPending: boolean;
  registerPending: (id: string, pending: boolean) => void;
}

export const CartMutationContext = createContext<CartMutationContextValues>({
  isPending: false,
  registerPending: () => undefined,
});

export function CartMutationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  const registerPending = useCallback((id: string, pending: boolean) => {
    setPendingIds((prev) => {
      const isCurrentlyPending = prev.has(id);
      if (pending === isCurrentlyPending) return prev;
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isPending: pendingIds.size > 0,
      registerPending
    }),
    [pendingIds, registerPending]
  );

  return (
    <CartMutationContext.Provider value={value}>
      {children}
    </CartMutationContext.Provider>
  );
}
