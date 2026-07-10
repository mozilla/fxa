/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocalizedDateString } from '@fxa/shared/l10n';

interface AlreadyCancelingProps {
  currentPeriodEnd: number;
  locale: string;
  productName: string;
  webIcon: string;
}

export function AlreadyCanceling({
  currentPeriodEnd,
  locale,
  productName,
  webIcon,
}: AlreadyCancelingProps) {
  const currentPeriodEndLongFallback = getLocalizedDateString(
    currentPeriodEnd,
    false,
    locale
  );
  return (
    <div className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Image src={webIcon} alt={productName} height={64} width={64} />
        <div>
          <Localized id="already-canceling-title">
            <h1
              id="error-already-canceling-heading"
              className="font-bold leading-7 text-center text-xl"
            >
              Your subscription is set to end
            </h1>
          </Localized>
          <div className="leading-6">
            <Localized
              id="already-canceling-message"
              vars={{
                productName,
                date: currentPeriodEndLongFallback,
              }}
            >
              <p className="my-2">
                You’ll continue to have access to {productName} until
                {currentPeriodEndLongFallback}.`
              </p>
            </Localized>
            <Localized id="already-canceling-turn-back-on">
              <p className="my-2">
                You can turn your subscription back on anytime before it ends.
              </p>
            </Localized>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Link
            href={`/${locale}/subscriptions/landing`}
            className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-blue-500 border-blue-600 hover:bg-blue-700 text-white"
          >
            <Localized id="already-canceling-button-back-to-subscriptions">
              <span>Back to subscriptions</span>
            </Localized>
          </Link>
        </div>
      </div>
    </div>
  );
}
