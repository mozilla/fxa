/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import classNames from 'classnames';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { URLSearchParams } from 'url';

import { SubPlatPaymentMethodType } from '@fxa/payments/customer';
import {
  Banner,
  BannerVariant,
  formatPlanInterval,
  getCardIcon,
  ManageParams,
  SubscriptionContent,
} from '@fxa/payments/ui';
import {
  getExperimentsAction,
  getSubManPageContentAction,
} from '@fxa/payments/ui/actions';
import { getApp } from '@fxa/payments/ui/server';
import alertIcon from '@fxa/shared/assets/images/alert-yellow.svg';
import arrowDownIcon from '@fxa/shared/assets/images/arrow-down.svg';
import iapAppleLogo from '@fxa/shared/assets/images/apple-logo.svg';
import iapGoogleLogo from '@fxa/shared/assets/images/google-logo.svg';
import newWindowIcon from '@fxa/shared/assets/images/new-window.svg';
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

  const experiments = await getExperimentsAction({
    fxaUid: userId,
    language: locale,
  });

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
    hasPaymentMethodError,
  } = defaultPaymentMethod || {};
  const expirationDate =
    expMonth && expYear
      ? l10n.getLocalizedMonthYearString(expMonth, expYear, locale)
      : undefined;
  return (
    <div
      className="w-full tablet:px-8 desktop:max-w-[1024px]"
      aria-labelledby="subscription-management"
    >
      {experiments?.Features['welcome-feature']?.enabled && (
        <Banner variant={BannerVariant.Success}>
          <div className="leading-6 text-base">
            <p className="font-bold">Welcome</p>

            <p className="font-normal">
              Welcome to the new and redesigned Subscription Management Page!
            </p>
          </div>
        </Banner>
      )}
      {hasPaymentMethodError && (
        <Banner variant={hasPaymentMethodError.bannerType}>
          <div className="leading-6 text-base">
            <p className="font-bold">
              {l10n.getString(
                hasPaymentMethodError.bannerTitleFtl,
                hasPaymentMethodError.bannerTitle
              )}
            </p>

            <p className="font-normal">
              {l10n.getString(
                hasPaymentMethodError.bannerMessageFtl,
                hasPaymentMethodError.bannerMessage
              )}
            </p>

            <LinkExternal
              className="font-normal text-blue-500 hover:text-blue-600 cursor-pointer underline"
              href={
                hasPaymentMethodError.paymentMethodType ===
                SubPlatPaymentMethodType.PayPal
                  ? `${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/paypal`
                  : `${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/stripe`
              }
            >
              {l10n.getString(
                hasPaymentMethodError.bannerLinkLabelFtl,
                hasPaymentMethodError.bannerLinkLabel
              )}
            </LinkExternal>
          </div>
        </Banner>
      )}

      {isStripeCustomer &&
        !defaultPaymentMethod &&
        subscriptions.length > 0 && (
          <Banner variant={BannerVariant.Warning}>
            <div className="leading-6 text-base">
              <p className="font-bold">
                {l10n.getString(
                  'subscription-management-page-banner-warning-title-no-payment-method',
                  'No payment method added'
                )}
              </p>
              <p className="font-normal">
                {l10n.getString(
                  'subscription-management-page-warning-message-no-payment-method',
                  'Please add a payment method to avoid interruption to your subscriptions.'
                )}
              </p>
              <LinkExternal
                className="font-normal text-blue-500 hover:text-blue-600 cursor-pointer underline"
                href={`${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/stripe`}
              >
                {l10n.getString(
                  'subscription-management-page-banner-warning-link-no-payment-method',
                  'Add a payment method'
                )}
              </LinkExternal>
            </div>
          </Banner>
        )}
      <h1
        id="subscription-management"
        className="font-bold leading-6 mt-8 px-4 text-xl tablet:px-6"
      >
        {l10n.getString(
          'subscription-management-subscriptions-heading',
          'Subscriptions'
        )}
      </h1>

      {(subscriptions.length > 0 ||
        appleIapSubscriptions.length > 0 ||
        googleIapSubscriptions.length > 0) && (
        <nav
          className="px-4 tablet:hidden"
          aria-labelledby="mobile-quick-links-menu"
        >
          <h2 id="mobile-quick-links-menu" className="font-bold my-6">
            {l10n.getString(
              'subscription-management-jump-to-heading',
              'Jump to'
            )}
          </h2>
          <ul className="flex flex-col gap-6">
            <li>
              <Link
                className="flex items-center justify-between text-blue-500 hover:text-blue-600 cursor-pointer underline"
                href="#payment-details"
              >
                {l10n.getString(
                  'subscription-management-nav-payment-details',
                  'Payment details'
                )}
                <Image
                  src={arrowDownIcon}
                  alt=""
                  width={12}
                  height={12}
                  aria-hidden="true"
                />
              </Link>
            </li>
            {(subscriptions.length > 0 ||
              appleIapSubscriptions.length > 0 ||
              googleIapSubscriptions.length > 0) && (
              <li>
                <Link
                  className="flex items-center justify-between text-blue-500 hover:text-blue-600 cursor-pointer underline"
                  href="#active-subscriptions"
                >
                  {l10n.getString(
                    'subscription-management-nav-active-subscriptions',
                    'Active subscriptions'
                  )}
                  <Image
                    src={arrowDownIcon}
                    alt=""
                    width={12}
                    height={12}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}

      <section
        id="payment-details"
        className="scroll-mt-16"
        aria-labelledby="payment-details-heading"
      >
        <h2
          id="payment-details-heading"
          className="font-bold px-4 pt-8 pb-4 text-lg tablet:px-6"
        >
          {l10n.getString(
            'subscription-management-payment-details-heading',
            'Payment details'
          )}
        </h2>
        <div className="w-full py-6 text-grey-600 bg-white rounded-xl border border-grey-200 opacity-100 shadow-[0_0_16px_0_rgba(0,0,0,0.08)] tablet:px-6 tablet:py-8">
          <div className="px-4 tablet:px-0">
            <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center">
              <h3 className="tablet:min-w-[160px]">
                {l10n.getString('subscription-management-email-label', 'Email')}
              </h3>
              <p className="font-bold">{session?.user?.email}</p>
            </div>

            {accountCreditBalance.balance > 0 &&
              accountCreditBalance.currency !== null && (
                <>
                  <div
                    className="border-none h-px bg-grey-100 my-5 tablet:my-8"
                    role="separator"
                    aria-hidden="true"
                  ></div>

                  <div className="flex flex-col gap-2 items-start tablet:flex-row tablet:items-start">
                    <h3 className="tablet:min-w-[160px]">
                      {l10n.getString(
                        'subscription-management-credit-balance-label',
                        'Credit balance'
                      )}
                    </h3>
                    <div className="leading-6">
                      <p className="font-bold">
                        {l10n.getLocalizedCurrencyString(
                          accountCreditBalance.balance,
                          accountCreditBalance.currency,
                          locale
                        )}
                      </p>
                      <p className="text-sm">
                        {l10n.getString(
                          'subscription-management-credit-balance-message',
                          'Credit will automatically be applied to future invoices'
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}

            {isStripeCustomer &&
              (defaultPaymentMethod || subscriptions.length > 0) && (
                <>
                  <div
                    className="border-none h-px bg-grey-100 my-5 tablet:my-8"
                    role="separator"
                    aria-hidden="true"
                  ></div>
                  <div
                    className={classNames(
                      `w-full flex flex-col gap-2 tablet:flex-row ${defaultPaymentMethod?.type === SubPlatPaymentMethodType.Card || hasPaymentMethodError ? 'tablet:items-start' : 'tablet:items-center'}`
                    )}
                  >
                    <h3 className="tablet:min-w-[160px]">
                      {l10n.getString(
                        'subscription-management-payment-method-label',
                        'Payment method'
                      )}
                    </h3>

                    {!defaultPaymentMethod && (
                      <div className="w-full flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
                        <p>
                          {l10n.getString(
                            'subscription-management-page-warning-message-no-payment-method',
                            'Please add a payment method to avoid interruption to your subscriptions.'
                          )}
                        </p>
                        <LinkExternal
                          className="bg-blue-500 border border-blue-600 box-border font-bold font-header inline-block rounded text-center text-white w-full py-2 px-5 hover:bg-blue-700 tablet:w-auto"
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
                        </LinkExternal>
                      </div>
                    )}

                    {type && (
                      <div
                        className={classNames(
                          'w-full flex justify-between gap-3',
                          {
                            'flex-row':
                              !(
                                defaultPaymentMethod?.type ===
                                SubPlatPaymentMethodType.Card
                              ) && !hasPaymentMethodError,
                            'flex-row items-center': !hasPaymentMethodError,
                            'flex-col items-start tablet:flex-row':
                              hasPaymentMethodError,
                            'flex-col leading-6 items-start tablet:flex-row tablet:justify-between':
                              defaultPaymentMethod?.type ===
                              SubPlatPaymentMethodType.Card,
                          }
                        )}
                      >
                        <div
                          className={classNames('flex flex-col', {
                            'w-full':
                              defaultPaymentMethod?.type ===
                              SubPlatPaymentMethodType.Card,
                          })}
                        >
                          {defaultPaymentMethod?.type ===
                            SubPlatPaymentMethodType.Card && brand ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={getCardIcon(brand, l10n).img}
                                  alt={getCardIcon(brand, l10n).altText}
                                  className="w-10 h-auto object-cover"
                                />
                                {last4 && (
                                  <span className="font-bold">
                                    {l10n.getString(
                                      'subscription-management-card-ending-in',
                                      { last4 },
                                      `Card ending in ${last4}`
                                    )}
                                  </span>
                                )}
                              </div>
                              {expirationDate && (
                                <p className="pt-1 tablet:pb-0 text-sm">
                                  {l10n.getString(
                                    'subscription-management-card-expires-date',
                                    { expirationDate },
                                    `Expires ${expirationDate}`
                                  )}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Image
                              src={getCardIcon(type, l10n).img}
                              alt={getCardIcon(type, l10n).altText}
                              width={getCardIcon(type, l10n).width}
                              height={getCardIcon(type, l10n).height}
                            />
                          )}
                          {hasPaymentMethodError && (
                            <p className="leading-6 pt-3 text-red-700">
                              {l10n.getString(
                                hasPaymentMethodError.messageFtl,
                                {
                                  paymentMethodType:
                                    hasPaymentMethodError.paymentMethodType,
                                },
                                hasPaymentMethodError.message
                              )}
                            </p>
                          )}
                        </div>

                        <div
                          className={classNames('', {
                            'w-auto': !(
                              defaultPaymentMethod?.type ===
                              SubPlatPaymentMethodType.Card
                            ),
                            'w-full tablet:w-auto':
                              defaultPaymentMethod?.type ===
                              SubPlatPaymentMethodType.Card,
                            'flex tablet:justify-end w-full tablet:w-auto':
                              hasPaymentMethodError,
                          })}
                        >
                          <LinkExternal
                            className={classNames(
                              'border box-border font-bold font-header rounded text-center py-2 px-5',
                              {
                                'bg-grey-10 border-grey-200 w-auto':
                                  !(
                                    defaultPaymentMethod?.type ===
                                    SubPlatPaymentMethodType.Card
                                  ) && !hasPaymentMethodError,
                                'bg-grey-10 border-grey-200 hover:bg-grey-50 inline-block justify-between w-full tablet:w-auto':
                                  !hasPaymentMethodError,
                                'bg-blue-500 border-blue-600 hover:bg-blue-700 text-white w-full':
                                  hasPaymentMethodError,
                              }
                            )}
                            href={
                              type === SubPlatPaymentMethodType.PayPal
                                ? hasPaymentMethodError
                                  ? `${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/paypal`
                                  : `${config.csp.paypalApi}/myaccount/autopay/connect/${billingAgreementId}`
                                : `${config.paymentsNextHostedUrl}/${locale}/subscriptions/payments/stripe`
                            }
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
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
          </div>
        </div>
      </section>

      <section
        id="active-subscriptions"
        className="scroll-mt-16"
        aria-labelledby="active-subscriptions-list-heading"
      >
        <h2
          id="active-subscriptions-list-heading"
          className="font-bold px-4 pt-8 pb-4 text-lg tablet:px-6"
        >
          {l10n.getString(
            'subscription-management-active-subscriptions-heading',
            'Active subscriptions'
          )}
        </h2>
        {subscriptions.length === 0 &&
          googleIapSubscriptions.length === 0 &&
          appleIapSubscriptions.length === 0 && (
            <div className="w-full py-6 text-grey-600 bg-white rounded-xl border border-grey-200 opacity-100 shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
              <div
                className="flex flex-col gap-1 rounded-lg py-6 text-center"
                role="status"
                aria-live="polite"
              >
                <p className="font-bold leading-7 text-lg">
                  {l10n.getString(
                    'subscription-management-you-have-no-active-subscriptions',
                    'You have no active subscriptions'
                  )}
                </p>
                <p>
                  {l10n.getString(
                    'subscription-management-new-subs-will-appear-here',
                    'New subscriptions will appear here.'
                  )}
                </p>
              </div>
            </div>
          )}
        {(subscriptions.length > 0 ||
          appleIapSubscriptions.length > 0 ||
          googleIapSubscriptions.length > 0) && (
          <>
            <ul
              aria-label={l10n.getString(
                'subscription-management-your-active-subscriptions-aria',
                'Your active subscriptions'
              )}
            >
              {subscriptions.map((sub, index: number) => {
                return (
                  <li
                    key={`${sub.productName}-${index}`}
                    aria-labelledby={`${sub.productName}-information`}
                    className="leading-6 pb-4"
                  >
                    <div className="w-full py-6 text-grey-600 bg-white rounded-xl border border-grey-200 opacity-100 shadow-[0_0_16px_0_rgba(0,0,0,0.08)] tablet:px-6 tablet:py-8">
                      <div className="flex flex-col px-4 tablet:px-0 tablet:flex-row tablet:items-start">
                        <div className="tablet:min-w-[160px]">
                          <Image
                            src={sub.webIcon}
                            alt={sub.productName}
                            height={64}
                            width={64}
                          />
                        </div>
                        <div className="flex flex-col gap-4 w-full">
                          <div className="flex items-start justify-between mt-4 tablet:mt-0">
                            <div>
                              <h3
                                id={`${sub.productName}-information`}
                                className="font-bold text-lg"
                              >
                                {sub.productName}
                              </h3>
                              <p className="text-grey-500">
                                {sub.interval &&
                                  formatPlanInterval(sub.interval)}
                              </p>
                            </div>
                            <LinkExternal
                              href={sub.supportUrl}
                              className="text-blue-500 hover:text-blue-600 cursor-pointer overflow-hidden text-ellipsis underline whitespace-nowrap"
                              aria-label={l10n.getString(
                                'subscription-management-button-support-aria',
                                { productName: sub.productName },
                                `Get help for ${sub.productName}`
                              )}
                              data-testid={`link-external-support-${sub.productName}`}
                            >
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
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {appleIapSubscriptions.length > 0 && (
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
                      className="leading-6 pb-4"
                    >
                      <div className="w-full py-6 text-grey-600 bg-white rounded-xl border border-grey-200 opacity-100 shadow-[0_0_16px_0_rgba(0,0,0,0.08)] tablet:px-6 tablet:py-8">
                        <div className="flex flex-col px-4 tablet:px-0 tablet:flex-row tablet:items-start">
                          <div className="tablet:min-w-[160px]">
                            <Image
                              src={purchase.webIcon}
                              alt={purchase.productName}
                              height={64}
                              width={64}
                            />
                          </div>
                          <div className="flex flex-col gap-4 w-full">
                            <div className="flex items-start justify-between mt-4 tablet:mt-0">
                              <h3
                                id={`${purchase.productName}-heading`}
                                className="font-bold text-lg"
                              >
                                {purchase.productName}
                              </h3>
                              <LinkExternal
                                href={purchase.supportUrl}
                                className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis underline whitespace-nowrap"
                                aria-label={l10n.getString(
                                  'subscription-management-button-support-aria',
                                  { productName: purchase.productName },
                                  `Get help for ${purchase.productName}`
                                )}
                                data-testid={`link-external-support-${purchase.productName}`}
                              >
                                <span>
                                  {l10n.getString(
                                    'subscription-management-button-support',
                                    'Get help'
                                  )}
                                </span>
                              </LinkExternal>
                            </div>
                            <div className="bg-grey-10 leading-6 p-4 rounded-lg">
                              <div className="flex items-center -my-2 -mx-3">
                                <Image
                                  src={iapAppleLogo}
                                  alt=""
                                  width={46}
                                  height={46}
                                  aria-hidden="true"
                                />
                                <p>
                                  {l10n.getString(
                                    'subscription-management-apple-in-app-purchase-2',
                                    'Apple in-app purchase'
                                  )}
                                </p>
                              </div>
                              {nextBillDate && (
                                <>
                                  <div
                                    className="border-none h-px bg-grey-100 my-2"
                                    role="separator"
                                    aria-hidden="true"
                                  ></div>
                                  <div className="flex items-center gap-1">
                                    <Image
                                      src={alertIcon}
                                      alt=""
                                      width={20}
                                      height={20}
                                      aria-hidden="true"
                                    />
                                    <p className="text-sm text-yellow-800">
                                      {l10n.getString(
                                        'subscription-management-iap-sub-expires-on-expiry-date',
                                        {
                                          date: nextBillDate,
                                        },
                                        `Expires on ${nextBillDate}`
                                      )}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex justify-end w-full tablet:w-auto">
                              <LinkExternal
                                className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis underline whitespace-nowrap"
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
                                    'subscription-management-button-manage-subscription-1',
                                    'Manage subscription'
                                  )}
                                </span>
                                <Image
                                  src={newWindowIcon}
                                  alt=""
                                  width={16}
                                  height={16}
                                  aria-hidden="true"
                                />
                              </LinkExternal>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
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
                      className="leading-6 pb-4"
                    >
                      <div className="w-full py-6 text-grey-600 bg-white rounded-xl border border-grey-200 opacity-100 shadow-[0_0_16px_0_rgba(0,0,0,0.08)] tablet:px-6 tablet:py-8">
                        <div className="flex flex-col px-4 tablet:px-0 tablet:flex-row tablet:items-start">
                          <div className="tablet:min-w-[160px]">
                            <Image
                              src={purchase.webIcon}
                              alt={purchase.productName}
                              height={64}
                              width={64}
                            />
                          </div>
                          <div className="flex flex-col gap-4 w-full">
                            <div className="flex items-start justify-between mt-4 tablet:mt-0">
                              <h3
                                id={`${purchase.productName}-heading`}
                                className="font-bold text-lg"
                              >
                                {purchase.productName}
                              </h3>
                              <LinkExternal
                                href={purchase.supportUrl}
                                className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis underline whitespace-nowrap"
                                aria-label={l10n.getString(
                                  'subscription-management-button-support-aria',
                                  { productName: purchase.productName },
                                  `Get help for ${purchase.productName}`
                                )}
                                data-testid={`link-external-support-${purchase.productName}`}
                              >
                                <span>
                                  {l10n.getString(
                                    'subscription-management-button-support',
                                    'Get help'
                                  )}
                                </span>
                              </LinkExternal>
                            </div>
                            <div className="bg-grey-10 leading-6 p-4 rounded-lg">
                              <div className="flex items-center -my-2 -mx-3">
                                <Image
                                  src={iapGoogleLogo}
                                  alt=""
                                  width={46}
                                  height={46}
                                  aria-hidden="true"
                                />
                                <p>
                                  {l10n.getString(
                                    'subscription-management-google-in-app-purchase-2',
                                    'Google in-app purchase'
                                  )}
                                </p>
                              </div>
                              {!!purchase.expiryTimeMillis && (
                                <>
                                  <div
                                    className="border-none h-px bg-grey-100 my-2"
                                    role="separator"
                                    aria-hidden="true"
                                  ></div>

                                  {purchase.autoRenewing ? (
                                    <p className="text-grey-500 text-sm">
                                      {l10n.getFragmentWithSource(
                                        'subscription-management-iap-sub-next-bill-1',
                                        {
                                          vars: { date: nextBillDate },
                                        },
                                        <p>Next bill &bull; {nextBillDate}</p>
                                      )}
                                    </p>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <Image
                                        src={alertIcon}
                                        alt=""
                                        width={20}
                                        height={20}
                                        aria-hidden="true"
                                      />
                                      <p className="text-sm text-yellow-800">
                                        {l10n.getString(
                                          'subscription-management-iap-sub-expires-on-expiry-date',
                                          {
                                            date: nextBillDate,
                                          },
                                          `Expires on ${nextBillDate}`
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex justify-end w-full tablet:w-auto">
                              <LinkExternal
                                className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis underline whitespace-nowrap"
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
                                    'subscription-management-button-manage-subscription-1',
                                    'Manage subscription'
                                  )}
                                </span>
                                <Image
                                  src={newWindowIcon}
                                  alt=""
                                  width={16}
                                  height={16}
                                  aria-hidden="true"
                                />
                              </LinkExternal>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
