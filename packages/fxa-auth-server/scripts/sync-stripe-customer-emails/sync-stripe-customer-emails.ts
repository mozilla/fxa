/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';
import Stripe from 'stripe';
import PQueue from 'p-queue';

import { StripeHelper } from '../../lib/payments/stripe';

const UID_REGEX = /^[0-9a-f]{32}$/;
const PROGRESS_LOG_INTERVAL = 500;

export type SyncAction =
  | 'ok'
  | 'would-update'
  | 'updated'
  | 'skip-no-uid'
  | 'skip-invalid-uid'
  | 'skip-account-not-found'
  | 'error';

export interface SyncOptions {
  dryRun: boolean;
  limit: number;
  startingAfter?: string;
  rateLimit: number;
  outputFile: string;
}

interface ResultRow {
  stripeCustomerId: string;
  uid: string;
  stripeEmail: string;
  fxaPrimaryEmail: string;
  action: SyncAction;
  error: string;
}

function isAccountNotFoundError(err: any): boolean {
  return err?.message === 'Unknown account';
}

function csvEscape(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export class StripeCustomerEmailSyncer {
  private stripe: Stripe;
  private stripeQueue: PQueue;
  private outputStream: fs.WriteStream;
  private streamError: Error | null = null;

  constructor(
    private stripeHelper: StripeHelper,
    private database: any,
    private log: any,
    private options: SyncOptions
  ) {
    this.stripe = stripeHelper.stripe;
    this.stripeQueue = new PQueue({
      intervalCap: options.rateLimit,
      interval: 1000,
    });
    this.outputStream = fs.createWriteStream(options.outputFile);
    this.outputStream.on('error', (err: Error) => {
      this.log.error('sync-stripe-customer-emails.stream-error', {
        error: err.message,
        outputFile: options.outputFile,
      });
      this.streamError = err;
    });
    this.outputStream.write(
      'stripe_customer_id,uid,stripe_email,fxa_primary_email,action,error\n'
    );
  }

  async run(): Promise<void> {
    const counts: Record<SyncAction, number> = {
      ok: 0,
      'would-update': 0,
      updated: 0,
      'skip-no-uid': 0,
      'skip-invalid-uid': 0,
      'skip-account-not-found': 0,
      error: 0,
    };
    let processed = 0;

    const listParams: Stripe.CustomerListParams = {};
    if (this.options.startingAfter) {
      listParams.starting_after = this.options.startingAfter;
    }

    try {
      for await (const customer of this.stripe.customers.list(listParams)) {
        if (this.streamError) {
          throw this.streamError;
        }

        if (processed >= this.options.limit) {
          this.log.info('sync-stripe-customer-emails.limit-reached', {
            stripeCustomerId: customer.id,
            processed,
          });
          break;
        }

        let row: ResultRow;
        try {
          row = await this.processCustomer(customer);
        } catch (err: any) {
          row = {
            stripeCustomerId: customer.id,
            uid: '',
            stripeEmail: customer.email ?? '',
            fxaPrimaryEmail: '',
            action: 'error',
            error: err?.message ?? String(err),
          };
        }

        this.writeRow(row);
        counts[row.action]++;
        processed++;

        if (processed % PROGRESS_LOG_INTERVAL === 0) {
          this.log.info('sync-stripe-customer-emails.progress', {
            processed,
            ...counts,
            dryRun: this.options.dryRun,
          });
        }
      }
    } finally {
      await new Promise<void>((resolve) => this.outputStream.end(resolve));
      this.log.info('sync-stripe-customer-emails.complete', {
        processed,
        ...counts,
        dryRun: this.options.dryRun,
      });
    }
  }

  private async processCustomer(
    customer: Stripe.Customer
  ): Promise<ResultRow> {
    const stripeEmail = customer.email ?? '';
    const uidCandidate =
      (customer.metadata && customer.metadata.userid) ||
      customer.description ||
      '';

    if (!uidCandidate) {
      return {
        stripeCustomerId: customer.id,
        uid: '',
        stripeEmail,
        fxaPrimaryEmail: '',
        action: 'skip-no-uid',
        error: 'no uid in metadata.userid or description',
      };
    }

    if (!UID_REGEX.test(uidCandidate)) {
      return {
        stripeCustomerId: customer.id,
        uid: uidCandidate,
        stripeEmail,
        fxaPrimaryEmail: '',
        action: 'skip-invalid-uid',
        error: `uid does not match expected format: ${uidCandidate}`,
      };
    }

    let account: any;
    try {
      account = await this.database.account(uidCandidate);
    } catch (err: any) {
      if (isAccountNotFoundError(err)) {
        return {
          stripeCustomerId: customer.id,
          uid: uidCandidate,
          stripeEmail,
          fxaPrimaryEmail: '',
          action: 'skip-account-not-found',
          error: '',
        };
      }
      return {
        stripeCustomerId: customer.id,
        uid: uidCandidate,
        stripeEmail,
        fxaPrimaryEmail: '',
        action: 'error',
        error: err?.message ?? String(err),
      };
    }

    const fxaPrimaryEmail = account?.primaryEmail?.email ?? '';

    if (!fxaPrimaryEmail) {
      return {
        stripeCustomerId: customer.id,
        uid: uidCandidate,
        stripeEmail,
        fxaPrimaryEmail: '',
        action: 'error',
        error: 'fxa account has no primaryEmail',
      };
    }

    if (stripeEmail === fxaPrimaryEmail) {
      return {
        stripeCustomerId: customer.id,
        uid: uidCandidate,
        stripeEmail,
        fxaPrimaryEmail,
        action: 'ok',
        error: '',
      };
    }

    if (this.options.dryRun) {
      return {
        stripeCustomerId: customer.id,
        uid: uidCandidate,
        stripeEmail,
        fxaPrimaryEmail,
        action: 'would-update',
        error: '',
      };
    }

    try {
      await this.stripeQueue.add(() =>
        this.stripe.customers.update(customer.id, { email: fxaPrimaryEmail })
      );
      return {
        stripeCustomerId: customer.id,
        uid: uidCandidate,
        stripeEmail,
        fxaPrimaryEmail,
        action: 'updated',
        error: '',
      };
    } catch (err: any) {
      return {
        stripeCustomerId: customer.id,
        uid: uidCandidate,
        stripeEmail,
        fxaPrimaryEmail,
        action: 'error',
        error: err?.message ?? String(err),
      };
    }
  }

  private writeRow(row: ResultRow): void {
    this.outputStream.write(
      [
        csvEscape(row.stripeCustomerId),
        csvEscape(row.uid),
        csvEscape(row.stripeEmail),
        csvEscape(row.fxaPrimaryEmail),
        csvEscape(row.action),
        csvEscape(row.error),
      ].join(',') + '\n'
    );
  }
}
