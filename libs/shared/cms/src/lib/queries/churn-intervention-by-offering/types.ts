/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Enum_Churnintervention_Churntype,
  Enum_Churnintervention_Interval,
} from '../../../__generated__/graphql';

export interface ChurnInterventionByOfferingChurnInterventionsResult {
  churnInterventionId: string;
  churnType: Enum_Churnintervention_Churntype;
  redemptionLimit: number;
  stripeCouponId: string;
  interval: Enum_Churnintervention_Interval;
  discountAmount: number;
  ctaMessage: string;
  modalHeading: string;
  modalMessage: string;
  productPageUrl: string;
  termsHeading: string;
  termsDetails: string;
}

export interface ChurnInterventionByOfferingOfferingResult {
  defaultPurchase: {
    purchaseDetails: {
      webIcon: string;
      localizations: { webIcon: string }[];
    };
  };
  commonContent: {
    supportUrl: string;
  };
  churnInterventions: ChurnInterventionByOfferingChurnInterventionsResult[];
}

export interface ChurnInterventionByOfferingRawResult {
  offerings: ChurnInterventionByOfferingOfferingResult[];
}

export interface ChurnInterventionByOfferingResult {
  webIcon: string;
  churnInterventionId: string;
  churnType: Enum_Churnintervention_Churntype;
  redemptionLimit: number;
  stripeCouponId: string;
  interval: Enum_Churnintervention_Interval;
  discountAmount: number;
  ctaMessage: string;
  modalHeading: string;
  modalMessage: string[];
  productPageUrl: string;
  termsHeading: string;
  termsDetails: string[];
  supportUrl: string;
}
