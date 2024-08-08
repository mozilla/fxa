/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import spinnerImage from '@fxa/shared/assets/images/spinner.svg';
import { LocalizerRsc } from '@fxa/shared/l10n/server';
import Image from 'next/image';

type LoadingSpinnerProps = {
  l10n: LocalizerRsc;
};

/**
 * Next.js implementation of a loading spinner
 */
export function LoadingSpinner({ l10n }: LoadingSpinnerProps) {
  const ariaLabel = l10n.getString(
    'payments-loading-spinner-aria-label',
    null,
    'Loading…'
  );

  return (
    <div
      id="loading-spinner"
      className="mx-auto my-16 relative"
      data-testid="loading-spinner"
    >
      <Image
        src={spinnerImage}
        alt={ariaLabel}
        aria-label={ariaLabel}
        className="animate-spin h-9 w-9"
      />
    </div>
  );
}
