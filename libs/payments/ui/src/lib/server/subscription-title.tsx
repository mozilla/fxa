/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import { CartState } from '@fxa/shared/db/mysql/account';
import { LocalizerRsc } from '@fxa/shared/l10n/server';
import checkLogo from '../../images/check.svg';

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
    <header className="page-title-container">
      <h1 className="page-header">
        {l10n.getString(componentTitle.titleFtl, componentTitle.title)}
      </h1>

      {displaySubtitle && (
        <div className="page-subheader">
          <Image src={checkLogo} alt="" />
          <span className="page-subheader-text">
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
