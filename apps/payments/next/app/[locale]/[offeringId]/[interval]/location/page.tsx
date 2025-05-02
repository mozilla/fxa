/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';

import { LocationStatus } from '@fxa/payments/eligibility';
import {
  Banner,
  BannerVariant,
  BaseParams,
  IsolatedSelectTaxLocation,
  buildRedirectUrl,
} from '@fxa/payments/ui';
import { fetchCMSData, validateLocationAction } from '@fxa/payments/ui/actions';
import { getApp, TermsAndPrivacy } from '@fxa/payments/ui/server';
import locationIcon from '@fxa/shared/assets/images/confirm-pairing.svg';
import type { PageContentOfferingTransformed } from '@fxa/shared/cms';
import { config } from 'apps/payments/next/config';
import { auth } from 'apps/payments/next/auth';
import { TaxChangeAllowedStatus } from '@fxa/payments/cart';

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
  const emitterService = getApp().getEmitterService();
  const session = await auth();
  const providedCountryCode = searchParams['countryCode'];
  const providedPostalCode = searchParams['postalCode'];
  const taxAddress =
    providedCountryCode && providedPostalCode
      ? {
          countryCode: providedCountryCode,
          postalCode: providedPostalCode,
        }
      : undefined;

  const fxaUid = session?.user?.id;

  let cms: PageContentOfferingTransformed | undefined;
  let locationStatus: LocationStatus | TaxChangeAllowedStatus | undefined;
  let customerCurrency: string | undefined;
  try {
    const [cmsData, validateLocationResults] = await Promise.all([
      fetchCMSData(params.offeringId, acceptLanguage, params.locale),
      validateLocationAction(params.offeringId, taxAddress, fxaUid),
    ]);
    cms = cmsData;
    locationStatus = validateLocationResults.status;
    customerCurrency = validateLocationResults.currentCurrency;

    emitterService.emit('locationView', locationStatus);
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

  const pElement = (
    <p className="font-normal mt-1 leading-6 text-sm">
      to continue to checkout for {purchaseDetails.productName}
    </p>
  );

  const headerElement = (
    <>Select your country and enter your postal code {pElement}</>
  );

  return (
    <section
      className="w-full max-w-[576px] bg-white rounded-lg shadow-sm shadow-grey-300 border-t-0 mb-6 pt-4 px-4 pb-14 text-grey-600 tablet:clip-shadow desktop:px-12 desktop:pb-12"
      aria-label="Determine currency and tax location"
    >
      <h1 className="font-bold text-grey-600 text-xl mt-10">
        {l10n.getFragmentWithSource(
          'location-header',
          {
            vars: {
              productName: purchaseDetails.productName,
            },
            elems: {
              p: pElement,
            },
          },
          headerElement
        )}
      </h1>
      {locationStatus === LocationStatus.SanctionedLocation ? (
        <Banner variant={BannerVariant.Error} showCloseButton={true}>
          {l10n.getString(
            'next-location-unsupported',
            'Your current location is not supported according to our Terms of Service.'
          )}
        </Banner>
      ) : locationStatus === LocationStatus.ProductNotAvailable ||
        locationStatus === TaxChangeAllowedStatus.CurrencyNotFound ? (
        <Banner variant={BannerVariant.Error} showCloseButton={true}>
          {l10n.getString(
            'select-tax-location-product-not-available',
            { productName: purchaseDetails.productName },
            `${purchaseDetails.productName} is not available in this location.`
          )}
        </Banner>
      ) : locationStatus === TaxChangeAllowedStatus.CurrencyChange ? (
        <Banner variant={BannerVariant.Error} showCloseButton={true}>
          {l10n.getString(
            'location-banner-currency-change',
            'Currency change not supported. To continue, select a country that matches your current billing currency.'
          )}
        </Banner>
      ) : (
        <Banner variant={BannerVariant.Info} showCloseButton={true}>
          {l10n.getString(
            'location-banner-info',
            'We weren’t able to detect your location automatically'
          )}
        </Banner>
      )}
      <div className="flex flex-col items-center">
        <Image src={locationIcon} alt="" className="py-6" />
        <IsolatedSelectTaxLocation
          cmsCountries={cms.countries}
          locale={params.locale.substring(0, 2)}
          productName={purchaseDetails.productName}
          showNewTaxRateInfoMessage={false}
          unsupportedLocations={
            config.location.subscriptionsUnsupportedLocations
          }
          currentCurrency={customerCurrency}
          saveAction={async (countryCode: string, postalCode: string) => {
            'use server';

            if (fxaUid) {
              // call server Action here to validate if tax location change is allowed
              const result = await validateLocationAction(
                params.offeringId,
                { countryCode, postalCode },
                fxaUid
              );

              if (!result.isValid) {
                return {
                  ok: false,
                  error: result.status,
                };
              }
            }

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
        <p className="pt-5 text-center">
          {l10n.getString(
            'location-required-disclaimer',
            `We only use this information to calculate taxes and currency.`
          )}
        </p>
      </div>
      <TermsAndPrivacy
        l10n={l10n}
        {...purchaseDetails}
        {...(cms.commonContent.localizations.at(0) || cms.commonContent)}
        contentServerUrl={config.contentServerUrl}
        showFXALinks={true}
      />
    </section>
  );
}
