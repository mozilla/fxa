import { PlanInterval } from 'fxa-shared/subscriptions/types';

type PlanStyles = {
  webIconBackground: string;
};

export type Plan = {
  id: string;
  productName: string;
  planName: string;
  active: boolean;
  styles?: PlanStyles;
  description?: string[];
  subtitle?: string;
  upgradeCTA?: string;

  successActionButtonUrl: string;
  successActionButtonLabel: string;
  webIconUrl: string;
  tosUrl: string;
  tosDownloadUrl: string;
  privacyNoticeUrl: string;
  privacyNoticeDownloadUrl: string;
  cancellationSurveyUrl?: string;

  amount: number;
  currency: string;
  interval: PlanInterval;
  interval_count: number;
  details: string[];
};

export type Coupon = {
  promotionCode: string;
  type: string;
  durationInMonths: number;
  discountAmount: number;
};

export type InvoiceTax = {
  amount: number;
  inclusive: boolean;
  displayName: string;
}[];

export type InvoiceDiscount = {
  amount: number;
  amountOff: number;
  percentOff: number | null;
}[];

export type InvoicePreview = {
  total: number;
  totalExcludingTax?: number;
  subtotal: number;
  subtotalExcludingTax?: number;
  currency: string;
  tax?: InvoiceTax;
  discount?: InvoiceDiscount;
};

export type Profile = {
  amrValues: Array<string>;
  avatar: string;
  avatarDefault: boolean;
  metricsEnabled: boolean;
  displayName: string | null;
  email: string;
  locale: string;
  twoFactorAuthentication: boolean;
  uid: string;
};

export type AdditonalCouponInfo = {
  couponDurationDate: number;
  message: string;
};

export enum PaymentMethodHeaderType {
  NoPrefix,
  SecondStep,
}
