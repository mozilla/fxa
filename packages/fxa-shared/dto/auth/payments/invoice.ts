/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import joi from 'typesafe-joi';

export interface InvoiceLineItem {
  amount: number;
  currency: string;
  id: string;
  name: string;
}

export interface InvoiceTax {
  amount: number;
  inclusive: boolean;
  name: string;
  percentage: number;
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
  total: number;
  tax?: InvoiceTax;
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
  total: joi.number().required(),
  tax: joi.object({
    amount: joi.number().required(),
    inclusive: joi.boolean().required(),
    name: joi.string().required(),
    percentage: joi.number().required(),
  }),
  discount: joi.object({
    amount: joi.number().required(),
    amount_off: joi.number().required().allow(null),
    percent_off: joi.number().required().allow(null),
  }),
});

export type firstInvoicePreviewSchema = joi.Literal<
  typeof firstInvoicePreviewSchema
>;

/**
 * Defines an interface for the subsequent invoice preview response
 * from the auth-server.
 */
export interface SubsequentInvoicePreview {
  subscriptionId: string;
  period_start: number;
  total: number;
}

export const subsequentInvoicePreviewsSchema = joi
  .array()
  .items(
    joi.object({
      subscriptionId: joi.string().required(),
      period_start: joi.number().required(),
      total: joi.number().required(),
    })
  )
  .required();

export type subsequentInvoicePreviewsSchema = joi.Literal<
  typeof subsequentInvoicePreviewsSchema
>;
