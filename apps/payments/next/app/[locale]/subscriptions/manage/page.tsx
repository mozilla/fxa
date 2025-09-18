/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { URLSearchParams } from 'url';

import {
  AlertBar,
  formatPlanInterval,
  getCardIcon,
  ManageParams,
  SubscriptionContent,
} from '@fxa/payments/ui';
import { getSubManPageContentAction } from '@fxa/payments/ui/actions';
import { getApp } from '@fxa/payments/ui/server';
import helpIcon from '@fxa/shared/assets/images/help2.svg';
import { LinkExternal } from '@fxa/shared/react';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

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

  const userId = session.user.id;

  const {
    accountCreditBalance,
    defaultPaymentMethod,
    isStripeCustomer,
    subscriptions,
    appleIapSubscriptions,
    googleIapSubscriptions,
  } = await getSubManPageContentAction(session.user?.id);
  const {
    billingAgreementId,
    brand,
    expMonth,
    expYear,
    last4,
    type,
    walletType,
  } = defaultPaymentMethod || {};
  const isPaypalBillingAgreementError =
    type === 'external_paypal' && brand === 'paypal' && !billingAgreementId;
  const expirationDate =
    expMonth && expYear
      ? l10n.getLocalizedMonthYearString(expMonth, expYear, locale)
      : undefined;

  const CSS_LINK_SHARED =
    "flex items-center justify-center h-10 rounded-md p-4 z-10 cursor-pointer aria-disabled:relative aria-disabled:after:absolute aria-disabled:after:content-[''] aria-disabled:after:top-0 aria-disabled:after:left-0 aria-disabled:after:w-full aria-disabled:after:h-full aria-disabled:after:bg-white aria-disabled:after:opacity-50 aria-disabled:after:z-30 aria-disabled:border-none font-semibold";
  const CSS_PRIMARY_LINK = `${CSS_LINK_SHARED} bg-blue-500 hover:bg-blue-700 text-white`;
  const CSS_SECONDARY_LINK = `${CSS_LINK_SHARED} bg-grey-100 hover:bg-grey-200 text-black`;
  const CSS_ERROR_LINK = `${CSS_LINK_SHARED} bg-red-500 hover:bg-red-600 text-white`;

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
      {isPaypalBillingAgreementError && (
        <AlertBar>
          <span className={'font-semibold'}>
            {l10n.getString(
              'subscription-management-page-paypal-error-banner',
              'Invalid payment information; there is an error with your account.'
            )}

            <LinkExternal
              className={'underline hover:text-grey-100 pl-1'}
              href={`${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/paypal`}
            >
              {l10n.getString(
                'subscription-management-page-paypal-error-banner-link',
                'Manage'
              )}
            </LinkExternal>
          </span>
        </AlertBar>
      )}
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

      {isStripeCustomer && (
        <>
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

            {type === 'card' && walletType && (
              <div className="flex items-center justify-between">
                <div className="leading-5 text-sm">
                  <div className="flex items-center gap-3 py-2">
                    <Image
                      src={
                        getCardIcon(
                          walletType === 'apple_pay'
                            ? 'apple_pay'
                            : 'google_pay',
                          l10n
                        ).img
                      }
                      alt={
                        walletType === 'apple_pay'
                          ? l10n.getString(
                            'apple-pay-logo-alt-text',
                            'Apple Pay logo'
                          )
                          : l10n.getString(
                            'google-pay-logo-alt-text',
                            'Google Pay logo'
                          )
                      }
                      width={40}
                      height={24}
                    />
                    {brand && (
                      <Image
                        src={getCardIcon(brand, l10n).img}
                        alt={getCardIcon(brand, l10n).altText}
                        width={40}
                        height={24}
                      />
                    )}
                    {last4 && (
                      <div>
                        {l10n.getString(
                          'subscription-management-card-ending-in',
                          { last4 },
                          `Card ending in ${last4}`
                        )}
                      </div>
                    )}
                  </div>
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

            {type === 'card' && brand && !walletType && (
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

            {type === 'link' && (
              <div className="flex items-center justify-between">
                <div className="leading-5 text-sm">
                  <Image
                    src={getCardIcon('link', l10n).img}
                    alt={l10n.getString('link-logo-alt-text', 'Link logo')}
                    width={70}
                    height={24}
                  />
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

                {isPaypalBillingAgreementError ? (
                  <LinkExternal
                    className={CSS_ERROR_LINK}
                    href={`${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/paypal`}
                    aria-label={l10n.getString(
                      'subscription-management-button-manage-payment-method-aria',
                      'Manage payment method'
                    )}
                  >
                    <span>
                      {l10n.getString(
                        'subscription-management-button-manage-payment-method',
                        'Manage'
                      )}
                    </span>
                  </LinkExternal>
                ) : (
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
                )}
              </div>
            )}
          </section>

          <hr className="border-b border-grey-50 my-6" aria-hidden="true" />
        </>
      )}

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
              {subscriptions.map((sub, index: number) => {
                return (
                  <li
                    key={`${sub.productName}-${index}`}
                    aria-labelledby={`${sub.productName}-information`}
                    className="leading-5"
                  >
                    <div className="flex justify-between">
                      <h3
                        id={`${sub.productName}-information`}
                        className="font-semibold"
                      >
                        {sub.interval
                          ? l10n.getString(
                            getSubscriptionIntervalFtlId(sub.interval),
                            { productName: sub.productName },
                            `${sub.productName} (${formatPlanInterval(sub.interval)})`
                          )
                          : sub.productName}
                      </h3>
                      <LinkExternal
                        href={sub.supportUrl}
                        className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
                        aria-label={l10n.getString(
                          'subscription-management-button-support-aria',
                          { productName: sub.productName },
                          `Get help for ${sub.productName}`
                        )}
                        data-testid={`link-external-support-${sub.productName}`}
                      >
                        <Image
                          src={helpIcon}
                          alt=""
                          width={16}
                          height={16}
                          role="presentation"
                          aria-hidden="true"
                        />
                        <span>
                          {l10n.getString(
                            'subscription-management-button-support',
                            'Get help'
                          )}
                        </span>
                      </LinkExternal>
                    </div>
                    <SubscriptionContent
                      userId={userId}
                      subscription={sub}
                      locale={locale}
                      supportUrl={sub.supportUrl}
                    />
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
              {appleIapSubscriptions.map((purchase, index: number) => {
                let nextBillDate: string | undefined;
                if (purchase.expiresDate) {
                  const dateExpired = new Date(purchase.expiresDate);
                  nextBillDate = l10n.getLocalizedDateString(
                    Math.floor(dateExpired.getTime() / 1000),
                    false,
                    locale
                  );
                }
                return (
                  <li
                    key={`${purchase.storeId}-${index}`}
                    aria-labelledby={`${purchase.productName}-heading`}
                  >
                    <div className="flex justify-between">
                      <h3
                        id={`${purchase.productName}-heading`}
                        className="font-semibold pb-2"
                      >
                        {purchase.productName}
                      </h3>
                      <LinkExternal
                        href={purchase.supportUrl}
                        className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
                        aria-label={l10n.getString(
                          'subscription-management-button-support-aria',
                          { productName: purchase.productName },
                          `Get help for ${purchase.productName}`
                        )}
                        data-testid={`link-external-support-${purchase.productName}`}
                      >
                        <Image
                          src={helpIcon}
                          alt=""
                          width={16}
                          height={16}
                          role="presentation"
                          aria-hidden="true"
                        />
                        <span>
                          {l10n.getString(
                            'subscription-management-button-support',
                            'Get help'
                          )}
                        </span>
                      </LinkExternal>
                    </div>
                    <div className="flex items-center justify-between my-4">
                      <div className="leading-5 text-sm">
                        <p>
                          {l10n.getString(
                            'subscription-management-apple-in-app-purchase-1',
                            'Apple: in-app purchase'
                          )}
                        </p>
                        {nextBillDate && (
                          <p>
                            {l10n.getFragmentWithSource(
                              'subscription-management-iap-sub-will-expire-on',
                              {
                                vars: {
                                  date: nextBillDate,
                                },
                                elems: {
                                  strong: <strong />
                                },
                              },
                              <>
                                Your subscription will expire on <strong>${nextBillDate}</strong>
                              </>

                            )}
                          </p>
                        )}
                      </div>
                      <div>
                        <LinkExternal
                          className={CSS_SECONDARY_LINK}
                          href={`https://apps.apple.com/account/subscriptions`}
                          aria-label={l10n.getString(
                            'subscription-management-button-manage-subscription-aria',
                            {
                              productName: purchase.productName,
                            },
                            `Manage subscription for ${purchase.productName}`
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
            {googleIapSubscriptions.map((purchase, index: number) => {
              const nextBillDate = l10n.getLocalizedDateString(
                purchase.expiryTimeMillis / 1000,
                false,
                locale
              );
              return (
                <li
                  key={`${purchase.storeId}-${index}`}
                  aria-labelledby={`${purchase.productName}-heading`}
                >
                  <div className="flex justify-between">
                    <h3
                      id={`${purchase.productName}-heading`}
                      className="font-semibold pb-2"
                    >
                      {purchase.productName}
                    </h3>
                    <LinkExternal
                      href={purchase.supportUrl}
                      className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
                      aria-label={l10n.getString(
                        'subscription-management-button-support-aria',
                        { productName: purchase.productName },
                        `Get help for ${purchase.productName}`
                      )}
                      data-testid={`link-external-support-${purchase.productName}`}
                    >
                      <Image
                        src={helpIcon}
                        alt=""
                        width={16}
                        height={16}
                        role="presentation"
                        aria-hidden="true"
                      />
                      <span>
                        {l10n.getString(
                          'subscription-management-button-support',
                          'Get help'
                        )}
                      </span>
                    </LinkExternal>
                  </div>
                  <div className="flex items-center justify-between my-4">
                    <div className="leading-5 text-sm">
                      <p>
                        {l10n.getString(
                          'subscription-management-google-in-app-purchase-1',
                          'Google: in-app purchase'
                        )}
                      </p>
                      <p>
                        {!!purchase.expiryTimeMillis &&
                          (purchase.autoRenewing
                            ? l10n.getFragmentWithSource(
                              'subscription-management-iap-sub-next-bill-is-due',
                              {
                                vars: {
                                  date: nextBillDate,
                                },
                                elems: {
                                  strong: <strong />
                                },
                              },
                              <>
                                Next bill is due <strong>{nextBillDate}</strong>
                              </>
                            )
                            : l10n.getFragmentWithSource(
                              'subscription-management-iap-sub-will-expire-on',
                              {
                                vars: {
                                  date: nextBillDate,
                                },
                                elems: {
                                  strong: <strong />
                                },
                              },
                              <>
                                Your subscription will expire on <strong>{nextBillDate}</strong>
                              </>
                            ))}
                      </p>
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
                            productName: purchase.productName,
                          },
                          `Manage subscription for ${purchase.productName}`
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
