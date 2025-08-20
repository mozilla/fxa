/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Link from 'next/link';
import Image from 'next/image';

import leftArrowIcon from '@fxa/shared/assets/images/chevron-left.svg';
import rightArrowIcon from '@fxa/shared/assets/images/chevron-right.svg';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useLocalization } from '@fluent/react';

interface Breadcrumb {
  label: string;
  href: string;
}

export function Breadcrumbs(args: {
  contentServerUrl: string;
  paymentsNextUrl: string;
}) {
  const path = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const { l10n } = useLocalization();

  const ACCOUNT_SETTINGS = {
    label: l10n.getString(
      'subscription-management-breadcrumb-account-home',
      {},
      'Account Home'
    ),
    href: `${args.contentServerUrl}/settings`,
  };
  const SUBSCRIPTION_MANAGEMENT = {
    label: l10n.getString(
      'subscription-management-breadcrumb-subscriptions',
      {},
      'Subscriptions'
    ),
    href: `${args.paymentsNextUrl}/subscriptions/manage`,
  };
  const STRIPE_PAYMENT_METHODS = {
    label: l10n.getString(
      'subscription-management-breadcrumb-payment',
      {},
      'Payment Methods'
    ),
    href: `${args.paymentsNextUrl}/subscriptions/payments/stripe`,
  };

  let breadcrumbs: Breadcrumb[] = [];
  switch (path) {
    case `/${params.locale}/subscriptions/manage`:
      breadcrumbs = [ACCOUNT_SETTINGS, SUBSCRIPTION_MANAGEMENT];
      break;
    case `/${params.locale}/subscriptions/payments/stripe`:
      breadcrumbs = [
        ACCOUNT_SETTINGS,
        SUBSCRIPTION_MANAGEMENT,
        STRIPE_PAYMENT_METHODS,
      ];
      break;
  }

  return (
    <nav
      className="flex items-center h-11 tablet:h-[76px] p-4 tablet:p-6 border-b tablet:border-b-0 border-grey-100"
      aria-label="Breadcrumb"
    >
      <ol className="tablet:hidden">
        {breadcrumbs.map(({ label, href }, i) => {
          const isPrev = i === breadcrumbs.length - 2;
          if (!isPrev) return null;

          const url = new URL(href);
          url.search = searchParams.toString();
          href = url.href;

          return (
            <li key={`breadcrumb-nav-${i}`}>
              <Link
                href={href}
                className="inline-flex items-center text-blue-600 gap-3 hover:underline"
                aria-label={l10n.getString(
                  'subscription-management-breadcrumb-back-aria',
                  {
                    page: label
                  },
                  `Go back to ${label}`
                )}
              >
                <Image
                  src={leftArrowIcon}
                  alt=""
                  aria-hidden="true"
                  className="w-6 h-6"
                />
                <span className="pb-0.5">{label}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <ol className="hidden tablet:flex">
        {breadcrumbs.map(({ label, href }, i) => {
          const isLast = i === breadcrumbs.length - 1;

          const url = new URL(href);
          url.search = searchParams.toString();
          href = url.href;

          return (
            <li className="flex items-center" key={`breadcrumb-nav-${i}`}>
              {i >= 1 && (
                <div className="px-3">
                  <Image
                    src={rightArrowIcon}
                    alt=""
                    aria-hidden="true"
                    className="w-6 h-6"
                  />
                </div>
              )}
              {isLast ? (
                <span aria-current="page" className="pb-0.5">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-blue-600 hover:underline pb-0.5"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
