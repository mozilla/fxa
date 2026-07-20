/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import { redirect } from 'next/navigation';
import errorIcon from '@fxa/shared/assets/images/error.svg';
import {
  BaseButton,
  ButtonVariant,
  type BaseParams,
  buildRedirectUrl,
} from '@fxa/payments/ui';
import { getApp } from '@fxa/payments/ui/server';
import { auth, signOut } from 'apps/payments/next/auth';

export default async function ErrorPage({
  params,
  searchParams,
}: {
  params: Promise<BaseParams>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { locale, offeringId, interval } = await params;
  const resolvedSearchParams = await searchParams;

  const newPageSearchParams = { ...resolvedSearchParams };
  delete newPageSearchParams.reason;
  const newPageUrl = buildRedirectUrl(
    offeringId,
    interval,
    'new',
    'checkout',
    {
      locale,
      searchParams: newPageSearchParams,
    }
  );

  const session = await auth();
  if (!session?.user?.id) {
    redirect(newPageUrl);
  }

  const reason = Array.isArray(resolvedSearchParams.reason)
    ? resolvedSearchParams.reason[0]
    : resolvedSearchParams.reason;
  if (!reason) {
    redirect(newPageUrl);
  }

  const l10n = getApp().getL10n();

  async function signOutAndRedirect() {
    'use server';
    await signOut({ redirect: false });
    redirect(newPageUrl);
  }

  const getErrorContent = (reason: string) => {
    switch (reason) {
      case 'account-not-found':
      default:
        return {
          heading: l10n.getString(
            'error-page-account-not-found-heading',
            'Account not found'
          ),
          message: l10n.getString(
            'error-page-account-not-found-message',
            'The account associated with your session does not exist. Please use a different account or create a new one to subscribe.'
          ),
          buttonLabel: l10n.getString(
            'error-page-account-not-found-continue-button',
            'Continue'
          ),
        };
    }
  };

  const { heading, message, buttonLabel } = getErrorContent(reason);

  return (
    <section
      className="flex flex-col items-center text-center max-w-lg mx-auto mt-6 p-16 tablet:my-10 gap-16 bg-white shadow tablet:rounded-xl border border-transparent"
      aria-labelledby="error-page-heading"
    >
      <h1 id="error-page-heading" className="text-xl font-bold">
        {heading}
      </h1>
      <Image src={errorIcon} alt="" aria-hidden="true" />
      <div className="flex flex-col gap-6 items-center leading-6 text-grey-400 max-w-md text-sm">
        {message}
        <form action={signOutAndRedirect}>
          <BaseButton
            type="submit"
            variant={ButtonVariant.Primary}
            className="h-12 text-base"
            aria-label={buttonLabel}
          >
            {buttonLabel}
          </BaseButton>
        </form>
      </div>
    </section>
  );
}
