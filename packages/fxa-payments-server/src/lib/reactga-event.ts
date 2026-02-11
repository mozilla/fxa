/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ReactGA from 'react-ga4';
import { Plan } from 'fxa-shared/subscriptions/types';

export enum GAEvent {
  AddPaymentInfo = 'add_payment_info',
  Purchase = 'purchase',
  PurchaseSubmit = 'purchase_submit',
  SignUp = 'sign_up',
}

export enum GAPaymentType {
  CreditCard = 'Credit Card',
  PayPal = 'PayPal',
  NotChosen = 'Not chosen',
  Undefined = 'Not chosen',
}

export enum GAPurchaseType {
  New = 'new purchase',
  Upgrade = 'upgrade',
}

type ReactGALogProps = {
  eventName: (typeof GAEvent)[keyof typeof GAEvent];
  paymentType?: (typeof GAPaymentType)[keyof typeof GAPaymentType];
  plan?: Plan;
  purchaseType?: (typeof GAPurchaseType)[keyof typeof GAPurchaseType];
  discount?: number | undefined;
};

type ItemsProps = {
  item_id: string;
  item_name: string | undefined;
  item_brand?: string;
  item_variant?: string;
  price?: number | null | undefined;
  discount?: number;
};

type PlanOptionsProps = {
  currency: string;
  value: number | null;
  payment_type?: (typeof GAPaymentType)[keyof typeof GAPaymentType];
  items: ItemsProps[];
  purchase_type?: (typeof GAPurchaseType)[keyof typeof GAPurchaseType];
};

export const ReactGALog = {
  logEvent: ({
    eventName,
    paymentType,
    plan,
    purchaseType,
    discount,
  }: ReactGALogProps) => {
    if (plan) {
      const {
        amount,
        currency: currencyCode,
        interval,
        plan_id: planId,
        plan_name: planName,
        product_name: productName,
      } = plan;

      // Currently, only currencies with decimals are supported in Subscription Platform.
      // If currencies without subunits (e.g., cents) are included at a later time, this
      // will need to be updated.
      const planPrice: number = (amount || 0) / 100;

      let planOptions: PlanOptionsProps = {
        currency: currencyCode,
        value: planPrice,
        payment_type: paymentType,
        items: [
          {
            item_id: planId,
            item_name: planName,
            item_brand: productName,
            item_variant: interval,
            price: planPrice,
            discount,
          },
        ],
        purchase_type: purchaseType,
      };
      return ReactGA.event(eventName, planOptions);
    } else {
      return ReactGA.event(eventName);
    }
  },
};
