/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import spinnerImage from '@fxa/shared/assets/images/spinner.svg';
import Image from 'next/image';

/**
 * Next.js implementation of a loading spinner for use within client components
 */
export function LoadingSpinner() {
  return (
    <div className="mx-auto my-16 relative" data-testid="loading-spinner">
      <Localized id="payments-client-loading-spinner">
        <Image
          src={spinnerImage}
          alt={'Loading…'}
          aria-label={'Loading…'}
          className="animate-spin h-9 w-9"
        />
      </Localized>
    </div>
  );
}
