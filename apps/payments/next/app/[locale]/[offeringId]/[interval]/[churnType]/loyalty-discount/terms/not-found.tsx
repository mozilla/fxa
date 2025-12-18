/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { PageNotFound } from '@fxa/payments/ui';
import { getApp } from '@fxa/payments/ui/server';

export enum PaymentsPage {
  Subscriptions = 'subscriptions',
}

export default function NotFound() {
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage);
  return (
    <PageNotFound
      header={l10n.getString('not-found-page-title-terms', 'Page not found')}
      description={l10n.getString(
        'not-found-page-description-terms',
        'The page you’re looking for does not exist.'
      )}
      button={l10n.getString(
        'not-found-page-button-terms-manage-subscriptions',
        'Manage subscriptions'
      )}
      paymentsPage={PaymentsPage.Subscriptions}
    />
  );
}
