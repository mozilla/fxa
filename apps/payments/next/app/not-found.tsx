/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getApp } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import Image from 'next/image';
import errorIcon from '@fxa/shared/assets/images/error.svg';
import { captureMessage } from '@sentry/nextjs';

export default function NotFoundPage() {
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage);

  captureMessage('Page not found', 'warning');

  return (
    <section
      className="flex flex-col items-center text-center max-w-lg mx-auto mt-6 p-16 tablet:my-10 gap-16 bg-white shadow tablet:rounded-xl border border-transparent"
      aria-label="Payment error"
    >
      <h1 className="text-xl font-bold">
        {l10n.getString('page-not-found-title', 'Page not found')}
      </h1>
      <Image src={errorIcon} alt="" />
      <p className="text-grey-400 max-w-md text-sm">
        {l10n.getString(
          'page-not-found-description',
          'The page you requested was not found. We’ve been notified and will fix any links that may be broken.'
        )}
      </p>
    </section>
  );
}
