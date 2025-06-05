/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import errorIcon from '@fxa/shared/assets/images/error.svg';
import mozillaIcon from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { BaseButton, ButtonVariant } from '@fxa/payments/ui';
import { config } from '../../../../config';
import { getApp } from '@fxa/payments/ui/server';

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const cookieStore = cookies();
  const redirectUrl =
    cookieStore.get('__Secure-authjs.callback-url')?.value ||
    cookieStore.get('authjs.callback-url')?.value;
  const supportUrl = config.supportUrl
  const l10n = getApp().getL10n();
  getApp().getEmitterService().emit('auth', { type: 'error', errorMessage: searchParams?.error });

  return (
    <>
      <header
        className="bg-white fixed flex justify-between items-center shadow h-16 left-0 top-0 mx-auto my-0 px-4 py-0 w-full z-40 tablet:h-20"
        role="banner"
      >
        <div className="flex items-center">
          <Image
            src={mozillaIcon}
            alt="Mozilla logo"
            className="object-contain"
            width={140}
          />
        </div>
      </header>
      <section
        className="flex flex-col items-center text-center max-w-lg mx-auto mt-6 p-16 tablet:my-10 gap-16 bg-white shadow tablet:rounded-xl border border-transparent"
        aria-labelledby='unable-to-signin-heading'
      >
        <h1 id="unable-to-signin-heading" className="text-xl font-bold">
          {l10n.getString('auth-error-page-title', 'We Couldn’t Sign You In')}
        </h1>
        <Image src={errorIcon} alt="" />
        <p className="flex flex-col gap-6 items-center text-grey-400 max-w-md text-sm">
          <span>
            {l10n.getFragmentWithSource('checkout-error-boundary-basic-error-message',
              {
                elems: {
                  contactSupportLink: (
                    <Link href={supportUrl} className="underline hover:text-grey-400">
                      contact support.
                    </Link>
                  )
                }
              }
              ,
              <>
                Something went wrong. Please try again or{' '}
                <Link href={supportUrl} className="underline hover:text-grey-400">
                  contact support.
                </Link>
              </>
            )}
          </span>
          {redirectUrl &&
            <Link href={redirectUrl}>
              <BaseButton
                variant={ButtonVariant.Primary}
                className="text-base"
              >
                Try again
              </BaseButton>
            </Link>
          }
        </p>
      </section>
    </>
  );
}

