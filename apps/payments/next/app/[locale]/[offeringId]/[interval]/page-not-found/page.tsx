/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getApp } from '@fxa/payments/ui/server';
import { PageNotFound } from '@fxa/payments/ui';
import { headers } from 'next/headers';

/**
 * This page only exists for Route Handlers, i.e. `/landing`, to redirect
 * to in cases where a not found error should be shown to the client.
 *
 * This page should not be confused with the Next.js not-found.tsx file
 */
export default async function NotFoundPage() {
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage);

  return (
    <PageNotFound
      header={l10n.getString('page-not-found-title', 'Page not found')}
      description={l10n.getString(
        'page-not-found-description',
        'The page you requested was not found. We’ve been notified and will fix any links that may be broken.'
      )}
      button={l10n.getString('page-not-found-back-button', 'Go back')}
    />
  )
}
