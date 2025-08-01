/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum SupportedPages {
  START = 'start',
  PROCESSING = 'processing',
  NEEDS_INPUT = 'needs_input',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface BaseParams {
  locale: string;
  interval: string;
  offeringId: string;
}

export interface CheckoutParams extends BaseParams {
  cartId: string;
}

export type Page =
  | 'landing'
  | 'new'
  | 'start'
  | 'success'
  | 'error'
  | 'location'
  | 'page-not-found'
  | 'processing'
  | 'needs_input';

export type PageType = 'checkout' | 'upgrade';

export interface ManageParams {
  locale: string;
}
