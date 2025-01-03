/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import Amex from '@fxa/shared/assets/images/payment-methods/amex.svg';
import Diners from '@fxa/shared/assets/images/payment-methods/diners.svg';
import Discover from '@fxa/shared/assets/images/payment-methods/discover.svg';
import Jcb from '@fxa/shared/assets/images/payment-methods/jcb.svg';
import Mastercard from '@fxa/shared/assets/images/payment-methods/mastercard.svg';
import Paypal from '@fxa/shared/assets/images/payment-methods/paypal.svg';
import Unbranded from '@fxa/shared/assets/images/payment-methods/unbranded.svg';
import UnionPay from '@fxa/shared/assets/images/payment-methods/unionpay.svg';
import Visa from '@fxa/shared/assets/images/payment-methods/visa.svg';
import { LocalizerRsc } from '../../../../../../../shared/l10n/src/server';

function getCardIcon(cardBrand: string) {
  switch (cardBrand) {
    case 'amex':
      return Amex;
    case 'diners':
      return Diners;
    case 'discover':
      return Discover;
    case 'jcb':
      return Jcb;
    case 'mastercard':
      return Mastercard;
    case 'paypal':
      return Paypal;
    case 'unionpay':
      return UnionPay;
    case 'visa':
      return Visa;
    default:
      return Unbranded;
  }
}

type PaymentInfoProps = {
  l10n: LocalizerRsc;
  paymentInfo: {
    type: string | null;
    brand?: string | null;
    last4?: string | null;
  };
};

export const PaymentInfo = (props: PaymentInfoProps) => {
  const { l10n, paymentInfo } = props;
  const { brand, last4, type } = paymentInfo;
  return (
    <>
      {type === 'external_paypal' ? (
        <Image src={getCardIcon('paypal')} alt="paypal" />
      ) : (
        <span className="flex items-center gap-2">
          {brand && <Image src={getCardIcon(brand)} alt={brand} />}
          {l10n.getString(
            'next-payment-confirmation-cc-card-ending-in',
            {
              last4: last4 ?? '',
            },
            `Card ending in ${last4}`
          )}
        </span>
      )}
    </>
  );
};

export default PaymentInfo;
