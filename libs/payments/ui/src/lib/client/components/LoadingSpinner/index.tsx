/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import Image from 'next/image';
import spinnerImage from '@fxa/shared/assets/images/spinner.svg';

/**
 * Next.js implementation of a loading spinner for use within client components
 */
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="mx-auto my-16 relative" data-testid="loading-spinner">
      <Localized id="payments-client-loading-spinner">
        <Image
          src={spinnerImage}
          alt="Loading…"
          aria-label="Loading…"
          className={`animate-spin ${className}`}
        />
      </Localized>
    </div>
  );
}
