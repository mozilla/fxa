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
import { LocalizerRsc } from '@fxa/shared/l10n/server';

export function getCardIcon(cardBrand: string, l10n: LocalizerRsc) {
  switch (cardBrand) {
    case 'amex':
      return {
        img: Amex,
        altText: l10n.getString('amex-logo-alt-text', 'American Express logo'),
      };
    case 'diners':
      return {
        img: Diners,
        altText: l10n.getString('diners-logo-alt-text', 'Diners logo'),
      };
    case 'discover':
      return {
        img: Discover,
        altText: l10n.getString('discover-logo-alt-text', 'Discover logo'),
      };
    case 'jcb':
      return {
        img: Jcb,
        altText: l10n.getString('jcb-logo-alt-text', 'JCB logo'),
      };
    case 'mastercard':
      return {
        img: Mastercard,
        altText: l10n.getString('mastercard-logo-alt-text', 'Mastercard logo'),
      };
    case 'paypal':
      return {
        img: Paypal,
        altText: l10n.getString('paypal-logo-alt-text', 'PayPal logo'),
      };
    case 'unionpay':
      return {
        img: UnionPay,
        altText: l10n.getString('unionpay-logo-alt-text', 'Union Pay logo'),
      };
    case 'visa':
      return {
        img: Visa,
        altText: l10n.getString('visa-logo-alt-text', 'Visa logo'),
      };
    default:
      return {
        img: Unbranded,
        altText: l10n.getString('unbranded-logo-alt-text', 'Unbranded logo'),
      };
  }
}
