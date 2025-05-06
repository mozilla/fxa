/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import joi from 'joi';

export interface InvoiceLineItem {
  amount: number;
  currency: string;
  id: string;
  name: string;
  period: {
    end: number;
    start: number;
  };
}

export interface InvoiceTax {
  amount: number;
  inclusive: boolean;
  display_name?: string;
}

export interface InvoiceDiscount {
  amount: number;
  amount_off: number | null;
  percent_off: number | null;
}

/**
 * Defines an interface for the invoice preview response from the
 * auth-server.
 */
export interface FirstInvoicePreview {
  line_items: InvoiceLineItem[];
  subtotal: number;
  subtotal_excluding_tax: number | null;
  total: number;
  total_excluding_tax: number | null;
  tax?: InvoiceTax[];
  discount?: InvoiceDiscount;
  one_time_charge?: number;
  prorated_amount?: number;
}

export const firstInvoicePreviewSchema = joi.object({
  line_items: joi
    .array()
    .items(
      joi
        .object({
          amount: joi.number().required(),
          currency: joi.string().required(),
          id: joi.string().required(),
          name: joi.string().required(),
          period: joi
            .object({
              end: joi.number().required(),
              start: joi.number().required(),
            })
            .required(),
        })
        .required()
    )
    .required(),
  subtotal: joi.number().required(),
  subtotal_excluding_tax: joi.number().required().allow(null),
  total: joi.number().required(),
  total_excluding_tax: joi.number().required().allow(null),
  tax: joi.array().items({
    amount: joi.number().required(),
    inclusive: joi.boolean().required(),
    display_name: joi.string().optional(),
  }),
  discount: joi.object({
    amount: joi.number().required(),
    amount_off: joi.number().required().allow(null),
    percent_off: joi.number().required().allow(null),
  }),
  one_time_charge: joi.number().optional(),
  prorated_amount: joi.number().optional(),
});

type line_item = {
  amount: number;
  currency: string;
  id: string;
  name: string;
  period: {
    end: number;
    start: number;
  };
};

export type firstInvoicePreviewSchema = {
  line_items: Array<line_item>;
  subtotal: number;
  subtotal_excluding_tax: number | null;
  total: number;
  total_excluding_tax: number | null;
  tax?: {
    amount: number;
    inclusive: boolean;
    display_name?: string;
  }[];
  discount?: {
    amount: number;
    amount_off: number | null;
    percent_off: number | null;
  };
  one_time_charge?: number;
  prorated_amount?: number;
};

/**
 * Defines an interface for the subsequent invoice preview response
 * from the auth-server.
 */
export interface SubsequentInvoicePreview {
  currency: string;
  subscriptionId: string;
  period_start: number;
  subtotal: number;
  subtotal_excluding_tax: number | null;
  total: number;
  total_excluding_tax: number | null;
  tax?: InvoiceTax[];
}

export const subsequentInvoicePreviewsSchema = joi.array().items(
  joi.object({
    currency: joi.string().required(),
    subscriptionId: joi.string().required(),
    period_start: joi.number().required(),
    subtotal: joi.number().required(),
    subtotal_excluding_tax: joi.number().required().allow(null),
    total: joi.number().required(),
    total_excluding_tax: joi.number().required().allow(null),
    tax: joi.array().items({
      amount: joi.number().required(),
      inclusive: joi.boolean().required(),
      display_name: joi.string().optional(),
    }),
  })
);

export type subsequentInvoicePreview = {
  currency: string;
  subscriptionId: string;
  period_start: number;
  subtotal: number;
  subtotal_excluding_tax: number | null;
  total: number;
  total_excluding_tax: number | null;
  tax?: {
    amount: number;
    inclusive: boolean;
    display_name?: string;
  }[];
};

export type subsequentInvoicePreviewsSchema = Array<subsequentInvoicePreview>;

export interface LatestInvoiceItems
  extends Omit<
    FirstInvoicePreview,
    'subtotal_excluding_tax' | 'total_excluding_tax'
  > {
  subtotal_excluding_tax?: number | null;
  total_excluding_tax?: number | null;
}

export const latestInvoiceItemsSchema = firstInvoicePreviewSchema.fork(
  ['subtotal_excluding_tax', 'total_excluding_tax'],
  (schema) => schema.optional().allow(null)
);

export type latestInvoiceItemsSchema = firstInvoicePreviewSchema & {
  subtotal_excluding_tax?: number | null;
  total_excluding_tax?: number | null;
};
