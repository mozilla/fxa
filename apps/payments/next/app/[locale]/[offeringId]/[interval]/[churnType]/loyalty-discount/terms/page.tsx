/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChurnParams } from '@fxa/payments/ui/server';
import { LinkExternal } from '@fxa/shared/react';
import { getApp } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { URLSearchParams } from 'url';
import { SubplatInterval } from '@fxa/payments/customer';
import { BaseButton, ButtonVariant } from '@fxa/payments/ui';

export default async function ChurnTerms({
  params,
  searchParams,
}: {
  params: ChurnParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
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

  return (
    <div className="flex flex-col tablet:bg-white p-8 tablet:rounded-lg tablet:shadow-lg">
      <h1 className="font-bold text-lg my-1">
        {l10n.getString(
          'loyalty-discount-terms-heading',
          'Terms and Restrictions'
        )}
      </h1>
      <h1 className="font-bold text-lg my-1">
        {`${churnIntervention.churnInterventions[0].termsHeading}`}
      </h1>
      <ul className="list-disc ml-5 my-2 marker:text-xs text-sm font-light [&_li]:leading-5">
        {churnIntervention.churnInterventions[0].termsDetails.map(
          (term, index) => (
            <li key={index}>{term}</li>
          )
        )}
      </ul>
      <div className="flex justify-start">
        <LinkExternal
          href={`${churnIntervention.churnInterventions[0].supportUrl}${searchParamsString}`}
          aria-label={l10n.getString(
            'loyalty-discount-terms-support-aria',
            'Contact Support'
          )}
        >
          <BaseButton
            variant={ButtonVariant.SubscriptionManagementSecondary}
            className="w-40 mt-4"
          >
            <span>
              {l10n.getString(
                'loyalty-discount-terms-support',
                'Contact Support'
              )}
            </span>
          </BaseButton>
        </LinkExternal>
      </div>
    </div>
  );
}
