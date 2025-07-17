/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Link from 'next/link';
import type { Breadcrumb } from '@fxa/payments/ui';

export function Breadcrumbs(args: { links: Breadcrumb[] }) {
  return (
    <div className="w-full flex flex-row p-3">
      {args.links.map(({ url, title }, i) => {
        if (i > 0) {
          return (
            <>
              <div className="px-3">&gt;</div>
              <Link className="text-blue-500 hover:text-blue-400" href={url}>
                {title}
              </Link>
            </>
          );
        } else {
          return (
            <Link className="text-blue-500 hover:text-blue-400" href={url}>
              {title}
            </Link>
          );
        }
      })}
    </div>
  );
}
