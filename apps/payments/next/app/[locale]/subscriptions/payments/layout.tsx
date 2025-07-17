/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import defaultAvatarIcon from '@fxa/shared/assets/images/avatar-default.svg';
import { headers } from 'next/headers';
import { getApp, ManageParams } from '@fxa/payments/ui/server';
import { Breadcrumbs, type Breadcrumb } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';
import { auth } from 'apps/payments/next/auth';

export default async function PaymentManagementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: ManageParams;
}) {
  const { locale } = params;
  const session = await auth();
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const accountManagementUrl = config.contentServerClientConfig.url ?? '';

  const links: Breadcrumb[] = [
    {
      title: l10n.getString('breadcrumbs-account-management', 'Account Home'),
      url: accountManagementUrl,
    },
    {
      title: l10n.getString(
        'breadcrumbs-subscription-management',
        'Subscriptions'
      ),
      url: `${accountManagementUrl}/subscriptions`,
    },
  ];

  return (
    <>
      <Breadcrumbs links={links} />
      <div className="flex w-screen justify-center">
        <div className="basis-[90%] max-w-xl min-w-md bg-white rounded-xl shadow-lg shadow-grey-200 mb-6 text-grey-600">
          {session?.user && (
            <div className="flex pt-6 pl-8 pr-6 pb-2 ">
              <Image
                unoptimized={true}
                src={session.user?.image ?? defaultAvatarIcon}
                alt="Account profile picture"
                width="14"
                height="14"
                className="w-14 rounded-full"
              />
              <div className="flex px-4 flex-col text-center justify-center font-bold text-lg">
                {session.user?.email}
              </div>
            </div>
          )}
          <div className="border-t border-solid border-grey-200"></div>
          <div className="pt-4 px-4 pb-14">{children}</div>
        </div>
      </div>
    </>
  );
}
