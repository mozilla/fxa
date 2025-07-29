/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Link from 'next/link';
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
    <nav className="p-4 tablet:p-6" aria-label="Breadcrumb">
      <ol className="flex items-center">
        {breadcrumbs.map(({ label, href }, i) => {
          const isLast = i === breadcrumbs.length - 1;

          const url = new URL(href);
          url.search = searchParams.toString();
          href = url.href;

          return (
            <li className="flex items-center" key={`breadcrumb-nav-${i}`}>
              {i >= 1 && <div className="px-3">&gt;</div>}
              {isLast ? (
                <span className="font-semibold" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="font-semibold text-blue-600 hover:underline"
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
