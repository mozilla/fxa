/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BaseParams,
  IsolatedSelectTaxLocation,
  buildRedirectUrl,
} from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';
import { fetchCMSData } from '@fxa/payments/ui/actions';
import { getApp, TermsAndPrivacy } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import type { PageContentOfferingTransformed } from '@fxa/shared/cms';

export const dynamic = 'force-dynamic';

export default async function Location({
  params,
  searchParams,
}: {
  params: BaseParams;
  searchParams: Record<string, string>;
}) {
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, params.locale);

  Sentry.captureMessage('Could not locate user by their ip');

  let cms: PageContentOfferingTransformed | undefined;
  try {
    cms = await fetchCMSData(params.offeringId, acceptLanguage, params.locale);
  } catch (error) {
    if (error.name === 'FetchCmsInvalidOfferingError') {
      notFound();
    } else {
      throw error;
    }
  }

  const purchaseDetails =
    cms.defaultPurchase.purchaseDetails.localizations.at(0) ||
    cms.defaultPurchase.purchaseDetails;

  return (
    <div className="bg-white rounded-b-lg shadow-sm shadow-grey-300 border-t-0 mb-6 pt-4 px-4 pb-14 rounded-t-lg text-grey-600 tablet:clip-shadow tablet:rounded-t-none desktop:px-12 desktop:pb-12">
      <h2 className="font-semibold text-grey-600 text-lg mt-10">
        {l10n.getString(
          'location-required-header',
          `Please select your country and enter your postal code.`
        )}
      </h2>
      <div className="pt-2">
        {l10n.getString(
          'location-required-subheader',
          `We weren’t able to detect your location automatically.`
        )}
      </div>
      <IsolatedSelectTaxLocation
        cmsCountries={cms.countries}
        locale={params.locale.substring(0, 2)}
        productName={purchaseDetails.productName}
        unsupportedLocations={config.subscriptionsUnsupportedLocations}
        saveAction={async (countryCode: string, postalCode: string) => {
          'use server';

          searchParams['countryCode'] = countryCode;
          searchParams['postalCode'] = postalCode;
          const redirectUrl = new URL(
            buildRedirectUrl(
              params.offeringId,
              params.interval,
              'new',
              'checkout',
              {
                locale: params.locale,
                baseUrl: config.paymentsNextHostedUrl,
                searchParams,
              }
            )
          );

          redirect(redirectUrl.href);
        }}
      />
      <div className="pt-5 text-center">
        {l10n.getString(
          'location-required-disclaimer',
          `We only use this information to calculate taxes and currency.`
        )}
      </div>
      <TermsAndPrivacy
        l10n={l10n}
        {...purchaseDetails}
        {...(cms.commonContent.localizations.at(0) || cms.commonContent)}
        contentServerUrl={config.contentServerUrl}
        showFXALinks={true}
      />
    </div>
  );
}
