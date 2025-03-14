/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Use this component to update the browser URL to the correct route. Chained NextJS redirects are not working as expected.
export function UpdateBrowserUrl({ route }: { route: string }) {
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (pathName !== route) {
      router.replace(route);
    }
  }, []);
  return null;
}
