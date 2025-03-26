/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import errorIcon from '@fxa/shared/assets/images/error.svg';
import { Localized } from '@fluent/react';
import { BaseButton, ButtonVariant } from '@fxa/payments/ui';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <section
      className="flex flex-col items-center text-center max-w-lg mx-auto mt-6 p-16 tablet:my-10 gap-16 bg-white shadow tablet:rounded-xl border border-transparent"
      aria-label="Payment error"
    >
      <Localized id="page-not-found-title">
        <h1 className="text-xl font-bold">Page not found</h1>
      </Localized>
      <Image src={errorIcon} alt="" />
      <p className="flex flex-col gap-6 items-center text-grey-400 max-w-md text-sm">
        <Localized id="page-not-found-description">
          The page you requested was not found. We’ve been notified and will fix
          any links that may be broken.
        </Localized>
        <BaseButton
          variant={ButtonVariant.Primary}
          className="text-base"
          onClick={() => router.back()}
        >
          Go Back
        </BaseButton>
      </p>
    </section>
  );
}
