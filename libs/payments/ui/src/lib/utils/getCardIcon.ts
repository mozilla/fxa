/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Amex from '@fxa/shared/assets/images/payment-methods/amex.svg';
import ApplePay from '@fxa/shared/assets/images/payment-methods/apple-pay.svg';
import Diners from '@fxa/shared/assets/images/payment-methods/diners.svg';
import Discover from '@fxa/shared/assets/images/payment-methods/discover.svg';
import GooglePay from '@fxa/shared/assets/images/payment-methods/google-pay.svg';
import Jcb from '@fxa/shared/assets/images/payment-methods/jcb.svg';
import Link from '@fxa/shared/assets/images/payment-methods/link.svg';
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
        width: 32,
        height: 20,
      };
    case 'apple_pay':
      return {
        img: ApplePay,
        altText: l10n.getString('apple-pay-logo-alt-text', 'Apple Pay logo'),
        width: 45,
        height: 24,
      };
    case 'diners':
      return {
        img: Diners,
        altText: l10n.getString('diners-logo-alt-text', 'Diners logo'),
        width: 32,
        height: 20,
      };
    case 'discover':
      return {
        img: Discover,
        altText: l10n.getString('discover-logo-alt-text', 'Discover logo'),
        width: 32,
        height: 20,
      };
    case 'google_pay':
      return {
        img: GooglePay,
        altText: l10n.getString('google-pay-logo-alt-text', 'Google Pay logo'),
        width: 45,
        height: 24,
      };
    case 'jcb':
      return {
        img: Jcb,
        altText: l10n.getString('jcb-logo-alt-text', 'JCB logo'),
        width: 32,
        height: 20,
      };
    case 'link':
      return {
        img: Link,
        altText: l10n.getString('link-logo-alt-text', 'Link logo'),
        width: 72,
        height: 24,
      };
    case 'mastercard':
      return {
        img: Mastercard,
        altText: l10n.getString('mastercard-logo-alt-text', 'Mastercard logo'),
        width: 32,
        height: 20,
      };
    case 'external_paypal':
    case 'paypal':
      return {
        img: Paypal,
        altText: l10n.getString('paypal-logo-alt-text', 'PayPal logo'),
        width: 91,
        height: 24,
      };
    case 'unionpay':
      return {
        img: UnionPay,
        altText: l10n.getString('unionpay-logo-alt-text', 'Union Pay logo'),
        width: 32,
        height: 20,
      };
    case 'visa':
      return {
        img: Visa,
        altText: l10n.getString('visa-logo-alt-text', 'Visa logo'),
        width: 32,
        height: 20,
      };
    default:
      return {
        img: Unbranded,
        altText: l10n.getString('unbranded-logo-alt-text', 'Unbranded logo'),
        width: 32,
        height: 20,
      };
  }
}
