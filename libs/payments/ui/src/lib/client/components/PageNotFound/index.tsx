/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import errorIcon from '@fxa/shared/assets/images/error.svg';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { BaseButton, ButtonVariant } from '../BaseButton';
import { useEffect, useState } from 'react';
import { serverLogAction } from '../../../actions';

export enum PaymentsPage {
  Subscriptions = 'subscriptions',
}

interface PageNotFoundProps {
  header: string;
  description: string;
  button: string;
  paymentsPage?: string;
}

/**
 * Localized strings are passed into this component so that it can be used
 * without being wrapped by the LocalizationProvider.
 */
export function PageNotFound({
  header,
  description,
  button,
  paymentsPage,
}: PageNotFoundProps) {
  const params = useParams();
  const locale =
    typeof params?.locale === 'string' ? (params.locale as string) : 'en'; // fallback so it never crashes
  const router = useRouter();
  const pathname = usePathname();
  const [logOnce, setLogOnce] = useState(false);

  useEffect(() => {
    // Log the view event only once
    // If this is added to the Start page, it will log everytime the page is reloaded/revalidated,
    // which includes when a PromoCode is applied
    if (!logOnce) {
      setLogOnce(true);
      serverLogAction('pageNotFound', { pathname });
    }
  }, []);

  const handleClick = () => {
    if (paymentsPage === PaymentsPage.Subscriptions) {
      router.push(`/${locale}/subscriptions/landing`);
    } else {
      router.back();
    }
  };

  return (
    <section
      className="flex flex-col items-center text-center max-w-lg mx-auto mt-6 p-16 tablet:my-10 gap-16 bg-white shadow tablet:rounded-xl border border-transparent"
      aria-labelledby="page-not-found-heading"
    >
      <h1 id="page-not-found-heading" className="text-xl font-bold">
        {header}
      </h1>
      <Image src={errorIcon} alt="" aria-hidden="true" />
      <div className="flex flex-col gap-6 items-center leading-6 text-grey-400 max-w-md text-sm">
        {description}
        <BaseButton
          variant={ButtonVariant.Primary}
          className="h-12 text-base"
          onClick={handleClick}
          aria-label={button}
        >
          {button}
        </BaseButton>
      </div>
    </section>
  );
}
