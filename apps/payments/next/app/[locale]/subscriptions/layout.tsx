/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';

import { Breadcrumbs, Header } from '@fxa/payments/ui';
import { getApp } from '@fxa/payments/ui/server';
import defaultAvatarIcon from '@fxa/shared/assets/images/avatar-default.svg';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function SubscriptionsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const session = await auth();

  return (
    <>
      <Header
        auth={{
          user: session?.user,
        }}
        redirectPath={`${config.contentServerUrl}/settings`}
      />
      <Breadcrumbs
        contentServerUrl={config.contentServerUrl}
        paymentsNextUrl={config.paymentsNextHostedUrl}
      />

      <div className="flex justify-center">
        <div className="w-full py-6 text-grey-600 tablet:bg-white tablet:w-[640px] tablet:rounded-2xl tablet:shadow-sm tablet:shadow-grey-300 tablet:border-t-0 tablet:clip-shadow">
          <section
            aria-labelledby="profile-heading"
            className="flex items-center gap-4 px-4 tablet:px-8"
          >
            <Image
              unoptimized={true}
              src={session?.user?.image ?? defaultAvatarIcon}
              alt={l10n.getString(
                'subscription-management-account-profile-picture',
                'Account profile picture'
              )}
              width="48"
              height="48"
              className="w-12 h-12 tablet:w-16 tablet:h-16"
            />
            <h1
              id="profile-heading"
              className="overflow-hidden font-semibold text-ellipsis text-start text-nowrap tablet:text-xl"
            >
              <div>{session?.user?.name || session?.user?.email}</div>
              {session?.user?.name && (
                <div className="font-normal text-base text-grey-400 mb-0">
                  {session?.user?.email}
                </div>
              )}
            </h1>
          </section>
          <hr className="border-b border-grey-50 my-6" aria-hidden="true" />
          {children}
        </div>
      </div>
    </>
  );
}
