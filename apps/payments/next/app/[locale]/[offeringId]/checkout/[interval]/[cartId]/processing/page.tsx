/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getApp, LoadingSpinner } from '@fxa/payments/ui/server';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import { headers } from 'next/headers';

export default async function ProcessingPage() {
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;
  const l10n = getApp().getL10n(locale);

  return (
    <section
      className="flex flex-col text-center text-sm"
      data-testid="payment-processing"
    >
      <LoadingSpinner l10n={l10n} />
      {l10n.getString(
        'payment-processing-message',
        'Please wait while we process your payment…'
      )}
    </section>
  );
}
