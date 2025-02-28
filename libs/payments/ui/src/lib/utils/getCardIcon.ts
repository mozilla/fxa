/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Amex from '@fxa/shared/assets/images/payment-methods/amex.svg';
import Diners from '@fxa/shared/assets/images/payment-methods/diners.svg';
import Discover from '@fxa/shared/assets/images/payment-methods/discover.svg';
import Jcb from '@fxa/shared/assets/images/payment-methods/jcb.svg';
import Mastercard from '@fxa/shared/assets/images/payment-methods/mastercard.svg';
import Paypal from '@fxa/shared/assets/images/payment-methods/paypal.svg';
import Unbranded from '@fxa/shared/assets/images/payment-methods/unbranded.svg';
import UnionPay from '@fxa/shared/assets/images/payment-methods/unionpay.svg';
import Visa from '@fxa/shared/assets/images/payment-methods/visa.svg';

export function getCardIcon(cardBrand: string) {
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
