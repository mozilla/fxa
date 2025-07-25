/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react';
import { URLSearchParams } from 'url';

import {
  formatPlanInterval,
  getCardIcon,
  ManageParams,
  SubscriptionContent,
} from '@fxa/payments/ui';
import { getSubManPageContentAction } from '@fxa/payments/ui/actions';
import { getApp } from '@fxa/payments/ui/server';
import { LinkExternal } from '@fxa/shared/react';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';
import Link from 'next/link';

export default async function Manage({
  params,
  searchParams,
}: {
  params: ManageParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const session = await auth();
  if (!session?.user?.id) {
    const redirectToUrl = new URL(
      `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
    );
    redirectToUrl.search = new URLSearchParams(searchParams).toString();
    redirect(redirectToUrl.href);
  }

  const { accountCreditBalance, defaultPaymentMethod, subscriptions } =
    await getSubManPageContentAction(session.user?.id);
  const { billingAgreementId, brand, expMonth, expYear, last4, type } =
    defaultPaymentMethod || {};
  const expirationDate =
    expMonth && expYear
      ? l10n.getLocalizedMonthYearString(expMonth, expYear, locale)
      : undefined;

  //temporary until subs are returned from action
  const appleIapSubscriptions: any = [];
  const googleIapSubscriptions: any = [];

  const CSS_PRIMARY_LINK =
    "flex items-center justify-center h-10 rounded-md p-4 z-10 cursor-pointer aria-disabled:relative aria-disabled:after:absolute aria-disabled:after:content-[''] aria-disabled:after:top-0 aria-disabled:after:left-0 aria-disabled:after:w-full aria-disabled:after:h-full aria-disabled:after:bg-white aria-disabled:after:opacity-50 aria-disabled:after:z-30 aria-disabled:border-none bg-blue-500 font-semibold hover:bg-blue-700 text-white";
  const CSS_SECONDARY_LINK =
    "flex items-center justify-center h-10 rounded-md p-4 z-10 cursor-pointer aria-disabled:relative aria-disabled:after:absolute aria-disabled:after:content-[''] aria-disabled:after:top-0 aria-disabled:after:left-0 aria-disabled:after:w-full aria-disabled:after:h-full aria-disabled:after:bg-white aria-disabled:after:opacity-50 aria-disabled:after:z-30 aria-disabled:border-none bg-grey-100 font-semibold hover:bg-grey-200 text-black";

  const getSubscriptionIntervalFtlId = (interval: string) => {
    switch (interval) {
      case 'daily':
        return 'subscription-management-page-subscription-interval-daily';
      case 'weekly':
        return 'subscription-management-page-subscription-interval-weekly';
      case 'monthly':
      default:
        return 'subscription-management-page-subscription-interval-monthly';
      case 'halfyearly':
        return 'subscription-management-page-subscription-interval-halfyearly';
      case 'yearly':
        return 'subscription-management-page-subscription-interval-yearly';
    }
  };
  return (
    <>
      {accountCreditBalance.balance > 0 &&
        accountCreditBalance.currency !== null && (
          <>
            <section
              className="px-4 tablet:px-8"
              aria-labelledby="account-credit-balance-heading"
            >
              <div className="flex items-center gap-2 mb-4">
                <h2
                  id="account-credit-balance-heading"
                  className="font-semibold"
                >
                  {l10n.getString(
                    'subscription-management-account-credit-balance-heading',
                    'Account credit balance'
                  )}
                </h2>
                <span>
                  {l10n.getLocalizedCurrencyString(
                    accountCreditBalance.balance,
                    accountCreditBalance.currency,
                    locale
                  )}
                </span>
              </div>
              <div className="text-sm">
                {l10n.getString(
                  'subscription-management-account-credit-balance-message',
                  'Credit will be automatically applied towards future invoices'
                )}
              </div>
            </section>

            <hr className="border-b border-grey-50 my-6" aria-hidden="true" />
          </>
        )}

      <section
        className="px-4 tablet:px-8"
        aria-labelledby="payment-information-heading"
      >
        <div className="flex items-center justify-between">
          <h2
            id="payment-information-heading"
            className={`font-semibold ${defaultPaymentMethod ? 'mb-4' : 'mb-0'}`}
          >
            {l10n.getString(
              'subscription-management-payment-information-heading',
              'Payment Information'
            )}
          </h2>
          {!defaultPaymentMethod && (
            <Link
              className={CSS_PRIMARY_LINK}
              href={`${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/stripe`}
              aria-label={l10n.getString(
                'subscription-management-button-add-payment-method-aria',
                'Add payment method'
              )}
            >
              <span>
                {l10n.getString(
                  'subscription-management-button-add-payment-method',
                  'Add'
                )}
              </span>
            </Link>
          )}
        </div>

        {type === 'card' && brand && (
          <div className="flex items-center justify-between">
            <div className="leading-5 text-sm">
              <Image
                className="py-2"
                src={getCardIcon(brand, l10n).img}
                alt={getCardIcon(brand, l10n).altText}
                width={40}
                height={24}
              />
              {last4 && (
                <div className="pt-2">
                  {l10n.getString(
                    'subscription-management-card-ending-in',
                    { last4 },
                    `Card ending in ${last4}`
                  )}
                </div>
              )}
              {expirationDate && (
                <div>
                  {l10n.getString(
                    'subscription-management-card-expires-date',
                    { expirationDate },
                    `Expires ${expirationDate}`
                  )}
                </div>
              )}
            </div>
            <Link
              className={CSS_SECONDARY_LINK}
              href={`${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/stripe`}
              aria-label={l10n.getString(
                'subscription-management-button-change-payment-method-aria',
                'Change payment method'
              )}
            >
              {l10n.getString(
                'subscription-management-button-change-payment-method',
                'Change'
              )}
            </Link>
          </div>
        )}

        {type === 'external_paypal' && brand && (
          <div className="flex items-center justify-between">
            <div className="leading-5 text-sm">
              <Image
                className="py-2"
                src={getCardIcon('paypal', l10n).img}
                alt={l10n.getString('paypal-logo-alt-text', 'PayPal logo')}
                width={91}
                height={24}
              />
            </div>

            <LinkExternal
              className={CSS_SECONDARY_LINK}
              href={`${config.csp.paypalApi}/myaccount/autopay/connect/${billingAgreementId}`}
              aria-label={l10n.getString(
                'subscription-management-button-change-payment-method-aria',
                'Change payment method'
              )}
            >
              <span>
                {l10n.getString(
                  'subscription-management-button-change-payment-method',
                  'Change'
                )}
              </span>
            </LinkExternal>
          </div>
        )}
      </section>

      <hr className="border-b border-grey-50 my-6" aria-hidden="true" />

      <section
        className="px-4 tablet:px-8"
        aria-labelledby="subscriptions-list-heading"
      >
        <h2 id="subscriptions-list-heading" className="font-semibold mb-4">
          {l10n.getString(
            'subscription-management-subscriptions-heading',
            'Subscriptions'
          )}
        </h2>

        {subscriptions.length === 0 &&
          googleIapSubscriptions.length === 0 &&
          appleIapSubscriptions.length === 0 && (
            <div
              className="bg-grey-10 font-semibold rounded-lg py-6 text-center text-sm"
              role="status"
              aria-live="polite"
            >
              {l10n.getString(
                'subscription-management-no-subscriptions',
                'You don’t have any subscriptions yet'
              )}
            </div>
          )}

        {subscriptions.length > 0 && (
          <>
            <ul
              aria-label={l10n.getString(
                'subscription-management-your-subscriptions-aria',
                'Your subscriptions'
              )}
            >
              {subscriptions.map((sub: any, index: number) => {
                return (
                  <li
                    key={`${sub.id}-${index}`}
                    aria-labelledby={`${sub.id}-information`}
                    className="leading-5"
                  >
                    <h3 id={`${sub.id}-information`} className="font-semibold">
                      {sub.interval
                        ? l10n.getString(
                            getSubscriptionIntervalFtlId(sub.interval),
                            { productName: sub.productName },
                            `${sub.productName} (${formatPlanInterval(sub.interval)})`
                          )
                        : sub.productName}
                    </h3>
                    <SubscriptionContent subscription={sub} locale={locale} />
                    {index !== subscriptions.length - 1 && (
                      <hr
                        className="border-b border-grey-50 my-6"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            {(appleIapSubscriptions.length > 0 ||
              googleIapSubscriptions.length > 0) && (
              <hr className="border-b border-grey-50 my-6" aria-hidden="true" />
            )}
          </>
        )}

        {appleIapSubscriptions.length > 0 && (
          <>
            <ul
              aria-label={l10n.getString(
                'subscription-management-your-apple-iap-subscriptions-aria',
                'Your Apple In-App Subscriptions'
              )}
            >
              {appleIapSubscriptions.map((purchase: any, index: number) => {
                return (
                  <li
                    key={`${purchase.price_id}-${index}`}
                    aria-labelledby={`${purchase.product_name}-heading`}
                  >
                    <div className="flex items-center justify-between my-4">
                      <div className="leading-5 text-sm">
                        <h3
                          id={`${purchase.product_name}-heading`}
                          className="font-semibold pb-2"
                        >
                          {purchase.product_name}
                        </h3>
                        <div>
                          {l10n.getString(
                            'subscription-management-apple-in-app-purchase',
                            'Apple: In-App purchase'
                          )}
                        </div>
                        {/* <div>
                        {l10n.getString(
                          'subscription-management-iap-sub-expires-on',
                          {
                            date: nextBillDateL10n,
                          },
                          `Expires on ${nextBillDate}`
                        )}
                      </div> */}
                      </div>
                      <div>
                        <LinkExternal
                          className={CSS_SECONDARY_LINK}
                          href={`https://apps.apple.com/account/subscriptions`}
                          aria-label={l10n.getString(
                            'subscription-management-button-manage-subscription-aria',
                            {
                              productName: purchase.product_name,
                            },
                            `Manage subscription for ${purchase.packageName}`
                          )}
                        >
                          <span>
                            {l10n.getString(
                              'subscription-management-button-manage-subscription',
                              'Manage'
                            )}
                          </span>
                        </LinkExternal>
                      </div>
                    </div>
                    {index !== appleIapSubscriptions.length - 1 && (
                      <hr
                        className="border-b border-grey-50 my-6"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            {googleIapSubscriptions.length > 0 && (
              <hr className="border-b border-grey-50 my-6" aria-hidden="true" />
            )}
          </>
        )}

        {googleIapSubscriptions.length > 0 && (
          <ul
            aria-label={l10n.getString(
              'subscription-management-your-google-iap-subscriptions-aria',
              'Your Google In-App Subscriptions'
            )}
          >
            {googleIapSubscriptions.map((purchase: any, index: number) => {
              const nextBillDate = l10n.getLocalizedDateString(
                purchase.expiryTimeMillis / 1000,
                true
              );
              const nextBillDateL10n = l10n.getLocalizedDate(
                purchase.expiryTimeMillis / 1000,
                true
              );
              return (
                <li
                  key={`${purchase.price_id}-${index}`}
                  aria-labelledby={`${purchase.product_name}-heading`}
                >
                  <div className="flex items-center justify-between my-4">
                    <div className="leading-5 text-sm">
                      <h3
                        id={`${purchase.product_name}-heading`}
                        className="font-semibold pb-2"
                      >
                        {purchase.product_name}
                      </h3>
                      <div>
                        {l10n.getString(
                          'subscription-management-google-in-app-purchase',
                          'Google: In-App purchase'
                        )}
                      </div>
                      <div>
                        {!!purchase.expiryTimeMillis &&
                          (purchase.autoRenewing
                            ? l10n.getString(
                                'subscription-management-iap-sub-next-bill',
                                {
                                  date: nextBillDateL10n,
                                },
                                `Next billed on ${nextBillDate}`
                              )
                            : l10n.getString(
                                'subscription-management-iap-sub-expires-on',
                                {
                                  date: nextBillDateL10n,
                                },
                                `Expires on ${nextBillDate}`
                              ))}
                      </div>
                    </div>
                    <div>
                      <LinkExternal
                        className={CSS_SECONDARY_LINK}
                        href={`https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(
                          purchase.sku
                        )}&package=${encodeURIComponent(purchase.packageName)}`}
                        aria-label={l10n.getString(
                          'subscription-management-button-manage-subscription-aria',
                          {
                            productName: purchase.product_name,
                          },
                          `Manage subscription for ${purchase.packageName}`
                        )}
                      >
                        <span>
                          {l10n.getString(
                            'subscription-management-button-manage-subscription',
                            'Manage'
                          )}
                        </span>
                      </LinkExternal>
                    </div>
                  </div>
                  {index !== googleIapSubscriptions.length - 1 && (
                    <hr
                      className="border-b border-grey-50 my-6"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
