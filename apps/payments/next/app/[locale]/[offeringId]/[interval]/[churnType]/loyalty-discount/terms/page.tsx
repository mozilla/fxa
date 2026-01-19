/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChurnParams } from '@fxa/payments/ui/server';
import { LinkExternal } from '@fxa/shared/react';
import { getApp } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { URLSearchParams } from 'url';
import { SubplatInterval } from '@fxa/payments/customer';
import { notFound } from 'next/navigation';
import { config } from 'apps/payments/next/config';

export default async function ChurnTerms({
  params,
  searchParams,
}: {
  params: ChurnParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
  if (!config.churnInterventionConfig.enabled) {
    notFound();
  }

  const { locale, interval, churnType, offeringId } = params;
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);

  const urlSearchParams = new URLSearchParams(searchParams);
  const searchParamsString = urlSearchParams.toString()
    ? `?${urlSearchParams.toString()}`
    : '';

  const churnIntervention = await getApp()
    .getActionsService()
    .getCMSChurnIntervention({
      interval: interval as SubplatInterval,
      churnType: churnType,
      stripeProductId: undefined,
      offeringApiIdentifier: offeringId,
      acceptLanguage: acceptLanguage || undefined,
      selectedLanguage: locale,
    });

  const content = churnIntervention.churnInterventions.at(0);

  if (
    !content ||
    !content.termsHeading ||
    !Array.isArray(content.termsDetails) ||
    content.termsDetails.length === 0
  ) {
    notFound();
  }

  return (
    <section
      className="flex tablet:items-center justify-center min-h-[calc(100vh_-_4rem)] tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="loyalty-discount-terms"
    >
      <div className="max-w-xl min-w-[480px] flex flex-col p-6 pt-10 tablet:bg-white tablet:border tablet:border-grey-200 tablet:opacity-100 tablet:p-8 tablet:rounded-xl tablet:shadow-[0_0px_10px_rgba(0,0,0,0.08)]">
        <h1
          id="loyalty-discount-terms"
          className="font-semibold text-xl leading-8"
        >
          {l10n.getString(
            'loyalty-discount-terms-heading',
            'Terms and restrictions'
          )}
        </h1>
        <h2 className="font-semibold text-xl leading-8">
          {`${content.termsHeading}`}
        </h2>
        <div className="mt-3 mx-6 mb-6 tablet:mx-10">
          <ul className="font-light leading-6 list-disc marker:text-sm marker:leading-normal">
            {content.termsDetails.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
        <div className="flex">
          <LinkExternal
            className="border box-border font-header rounded text-center py-2 px-5 border-grey-200 w-auto bg-grey-10 font-semibold hover:bg-grey-50 text-grey-700"
            href={`${content.supportUrl}${searchParamsString}`}
            aria-label={l10n.getString(
              'loyalty-discount-terms-contact-support-product-aria',
              {
                productName: content.productName,
              },
              `Contact support for ${content.productName}`
            )}
          >
            {l10n.getString(
              'loyalty-discount-terms-support',
              'Contact Support'
            )}
          </LinkExternal>
        </div>
      </div>
    </section>
  );
}
