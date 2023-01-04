/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import joi from 'joi';

export interface InvoiceLineItem {
  amount: number;
  currency: string;
  id: string;
  name: string;
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
});

type line_item = {
  amount: number;
  currency: string;
  id: string;
  name: string;
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
};

/**
 * Defines an interface for the subsequent invoice preview response
 * from the auth-server.
 */
export interface SubsequentInvoicePreview {
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
