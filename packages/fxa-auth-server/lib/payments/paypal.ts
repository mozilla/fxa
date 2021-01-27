/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

import {
  CreateBillingAgreementOptions,
  DoReferenceTransactionOptions,
  IpnMessage,
  NVPDoReferenceTransactionResponse,
  PayPalClient,
} from './paypal-client';

type PaypalHelperOptions = {
  log: Logger;
};

export class PayPalHelper {
  private log: Logger;
  private client: PayPalClient;
  private metrics: StatsD;

  constructor(options: PaypalHelperOptions) {
    this.log = options.log;
    this.client = Container.get(PayPalClient);
    this.metrics = Container.get(StatsD);
  }

  /**
   * Get a token authorizing transaction to move to the next stage.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   *
   */
  public async getCheckoutToken(): Promise<string> {
    const response = await this.client.setExpressCheckout();
    return response.TOKEN;
  }

  /**
   * Create billing agreement using the ExpressCheckout token.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   *
   */
  public async createBillingAgreement(
    options: CreateBillingAgreementOptions
  ): Promise<string> {
    const response = await this.client.createBillingAgreement(options);
    return response.BILLINGAGREEMENTID;
  }

  /**
   * Charge customer based on an existing Billing Agreement.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   * If the call is successful, all PayPal response data is returned.
   *
   */
  public async chargeCustomer(
    options: DoReferenceTransactionOptions
  ): Promise<NVPDoReferenceTransactionResponse> {
    return await this.client.doReferenceTransaction(options);
  }

  /**
   * Verify whether an IPN message is valid.
   *
   * @param message
   */
  public async verifyIpnMessage(message: string): Promise<boolean> {
    return (await this.client.ipnVerify(message)) === 'VERIFIED';
  }

  /**
   * Extract an IPN message from a payload.
   *

   * @param payload
   */
  public extractIpnMessage(payload: string): IpnMessage {
    return this.client.nvpToObject(payload) as IpnMessage;
  }
}
