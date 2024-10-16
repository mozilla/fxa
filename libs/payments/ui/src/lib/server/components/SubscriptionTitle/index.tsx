/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import checkLogo from '@fxa/shared/assets/images/check.svg';
import { CartState } from '@fxa/shared/db/mysql/account';
import { LocalizerRsc } from '@fxa/shared/l10n/server';
import circledConfirm from '@fxa/shared/assets/images/circled-confirm-clouds.svg';

const getComponentTitle = (cartState: CartState) => {
  switch (cartState) {
    case CartState.FAIL:
      return {
        title: 'Error confirming subscription…',
        titleFtl: 'next-subscription-error-title',
      };
    case CartState.PROCESSING:
      return {
        title: 'Confirming subscription…',
        titleFtl: 'next-subscription-processing-title',
      };
    case CartState.START:
      return {
        title: 'Set up your subscription',
        titleFtl: 'next-subscription-create-title',
      };
    case CartState.SUCCESS:
      return {
        title: 'Subscription confirmation',
        titleFtl: 'next-subscription-success-title',
      };
    default:
      console.error('SubscriptionTitle - cartState does not match', cartState);
      return {
        title: 'Set up your subscription',
        titleFtl: 'next-subscription-create-title',
      };
  }
};

const subheaders = [CartState.PROCESSING, CartState.START, CartState.SUCCESS];

interface SubscriptionTitleProps {
  cartState: CartState;
  l10n: LocalizerRsc;
}

export async function SubscriptionTitle({
  l10n,
  cartState,
}: SubscriptionTitleProps) {
  const componentTitle = getComponentTitle(cartState);
  const displaySubtitle = subheaders.includes(cartState);

  return (
    <header
      className="bg-white shadow-sm shadow-grey-300 text-center my-0 pt-5 px-4 pb-px tablet:mx-0"
      aria-label={l10n.getString(componentTitle.titleFtl, componentTitle.title)}
    >
      {cartState === CartState.SUCCESS && (
        <div className="flex items-center justify-center padding pb-6">
          <Image src={circledConfirm} alt="" className="w-30 h-30" />
        </div>
      )}
      <h1 className="font-semibold leading-8 mb-1 text-grey-600 text-xl">
        {l10n.getString(componentTitle.titleFtl, componentTitle.title)}
      </h1>

      {displaySubtitle && (
        <div className="flex items-center justify-center gap-2 text-green-900">
          <Image src={checkLogo} alt="" />
          <span className="font-semibold text-sm">
            {l10n.getString(
              'next-sub-guarantee',
              '30-day money-back guarantee'
            )}
          </span>
        </div>
      )}
    </header>
  );
}
