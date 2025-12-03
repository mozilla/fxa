/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import * as Form from '@radix-ui/react-form';
import { Localized } from '@fluent/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ButtonVariant, SubmitButton } from '@fxa/payments/ui';
import { cancelSubscriptionAtPeriodEndAction } from '@fxa/payments/ui/actions';
import spinner from '@fxa/shared/assets/images/spinner.svg';
import { getLocalizedDateString } from '@fxa/shared/l10n';
import { LinkExternal } from '@fxa/shared/react';

interface CancelSubscriptionProps {
  userId: string;
  subscriptionId: string;
  locale: string;
  pageContent: {
    active: boolean;
    cancelAtPeriodEnd: boolean;
    productName: string;
    currentPeriodEnd: number;
    supportUrl: string;
    webIcon: string;
  };
}

export function CancelSubscription({
  userId,
  subscriptionId,
  locale,
  pageContent,
}: CancelSubscriptionProps) {
  const {
    active,
    cancelAtPeriodEnd,
    currentPeriodEnd,
    productName,
    supportUrl,
    webIcon,
  } = pageContent;
  const router = useRouter();
  const [checkedState, setCheckedState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCancelActionError, setShowCancelActionError] = useState(false);

  async function cancelSubscriptionAtPeriodEnd() {
    if (loading) {
      return;
    }

    setLoading(true);
    const result = await cancelSubscriptionAtPeriodEndAction(
      userId,
      subscriptionId
    );
    if (result.ok) {
      setCheckedState(false);
      setShowCancelActionError(false);
    } else {
      setShowCancelActionError(true);
    }
    setLoading(false);
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (loading) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    setLoading(true);
    setCheckedState(false);
    router.push(`/${locale}/subscriptions/landing`);
  };

  const currentPeriodEndLongFallback = getLocalizedDateString(
    currentPeriodEnd,
    false,
    locale
  );

  return (
    <section
      className="flex items-center justify-center min-h-[calc(100vh_-_4rem)] tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="cancel-subscription-heading"
    >
      {cancelAtPeriodEnd && active ? (
        <Form.Root className="max-w-[480px] p-10 text-grey-600 bg-white rounded-xl border border-grey-200 shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <Localized id="subscription-cancellation-dialog-title">
              <h1
                id="cancel-subscription-heading"
                className="font-bold leading-7 text-center text-lg"
              >
                We’re sorry to see you go
              </h1>
            </Localized>
          </div>

          <div className="leading-6 my-2 text-center">
            <Localized
              id="subscription-cancellation-dialog-msg"
              vars={{
                name: productName,
                date: currentPeriodEndLongFallback,
              }}
            >
              <p>
                Your {productName} subscription has been cancelled. You will
                still have access to {productName} until{' '}
                {currentPeriodEndLongFallback}.
              </p>
            </Localized>
            <Localized
              id="subscription-cancellation-dialog-aside"
              vars={{ url: supportUrl }}
              elems={{
                LinkExternal: (
                  <LinkExternal
                    href={supportUrl}
                    className="text-blue-500 underline"
                  >
                    Mozilla Support
                  </LinkExternal>
                ),
              }}
            >
              <p className="my-2">
                Have questions? Visit{' '}
                <LinkExternal
                  href={supportUrl}
                  className="text-blue-500 underline"
                >
                  Mozilla Support
                </LinkExternal>
                .
              </p>
            </Localized>
          </div>
          <Link
            className="border box-border font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
            onClick={handleClick}
            href={`/${locale}/subscriptions/landing`}
          >
            {loading ? (
              <Image
                src={spinner}
                alt=""
                className="absolute animate-spin h-8 w-8"
              />
            ) : (
              <Localized id="button-back-to-subscriptions">
                <span>Back to subscriptions</span>
              </Localized>
            )}
          </Link>
        </Form.Root>
      ) : (
        <Form.Root
          action={cancelSubscriptionAtPeriodEnd}
          className="max-w-[480px] p-10 text-grey-600 bg-white rounded-xl border border-grey-200 shadow-[0_0_16px_0_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <Localized id="cancel-subscription-heading" vars={{ productName }}>
              <h1
                id="cancel-subscription-heading"
                className="font-bold leading-7 text-center text-lg"
              >
                Cancel {productName} subscription
              </h1>
            </Localized>
          </div>
          <Form.Field name="cancelAccess">
            <Localized
              id="subscription-content-no-longer-use-message"
              vars={{
                productName,
                currentPeriodEnd: currentPeriodEndLongFallback,
              }}
            >
              <p className="leading-6 py-3" id="cancel-subscription-desc">
                You will no longer be able to use {productName} after{' '}
                {currentPeriodEndLongFallback}, the last day of your billing
                cycle.
              </p>
            </Localized>
            <Form.Label asChild className="cursor-pointer my-3">
              <label htmlFor="cancelAccess" className="flex items-start gap-4">
                <Form.Control asChild>
                  <input
                    id="cancelAccess"
                    name="cancelAccess"
                    type="checkbox"
                    className="ml-1 mt-1 grow-0 shrink-0 basis-4 scale-150 cursor-pointer"
                    onChange={(e) => setCheckedState(e.target.checked)}
                    required
                    disabled={loading}
                  />
                </Form.Control>
                <Localized
                  id="subscription-content-cancel-access-message"
                  vars={{
                    productName,
                    currentPeriodEnd: currentPeriodEndLongFallback,
                  }}
                >
                  <span className="leading-6">
                    Cancel my access and my saved information within{' '}
                    {productName} on {currentPeriodEndLongFallback}
                  </span>
                </Localized>
              </label>
            </Form.Label>
            {showCancelActionError && (
              <Form.Message asChild>
                <Localized id="subscription-content-cancel-action-error">
                  <p className="mt-1 text-alert-red font-normal" role="alert">
                    An unexpected error occurred. Please try again.
                  </p>
                </Localized>
              </Form.Message>
            )}
          </Form.Field>
          <div className="w-full flex flex-col gap-3 items-center pt-3">
            <Form.Submit asChild>
              <SubmitButton
                className="font-bold h-14 w-full"
                variant={ButtonVariant.SubscriptionManagementError}
                disabled={!checkedState || loading}
                aria-label={`Cancel your subscription to ${productName}`}
              >
                <Localized
                  id="cancel-subscription-button-cancel-subscription"
                  vars={{ productName }}
                  attrs={{ 'aria-label': true }}
                >
                  <span>Cancel subscription</span>
                </Localized>
              </SubmitButton>
            </Form.Submit>
            <Link
              className="border box-border font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
              onClick={handleClick}
              href={`/${locale}/subscriptions/landing`}
              aria-label={`Stay subscribed to ${productName}`}
            >
              {loading ? (
                <Image
                  src={spinner}
                  alt=""
                  className="absolute animate-spin h-8 w-8"
                />
              ) : (
                <Localized
                  id="cancel-subscription-button-stay-subscribed"
                  vars={{ productName }}
                  attrs={{ 'aria-label': true }}
                >
                  <span>Stay subscribed</span>
                </Localized>
              )}
            </Link>
          </div>
        </Form.Root>
      )}
    </section>
  );
}
