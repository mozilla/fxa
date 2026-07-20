/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import Stripe from 'stripe';

import { StripeHelper } from '../../lib/payments/stripe';
import { StripeCustomerEmailSyncer, SyncOptions } from './sync-stripe-customer-emails';

const VALID_UID = 'a'.repeat(32);
const STRIPE_CUSTOMER_ID = 'cus_abc123';
const FXA_EMAIL = 'fxa@mozilla.com';
const STRIPE_EMAIL = 'stripe@mozilla.com';

function makeCustomer(overrides: Partial<Stripe.Customer> = {}): Stripe.Customer {
  return {
    id: STRIPE_CUSTOMER_ID,
    email: STRIPE_EMAIL,
    description: VALID_UID,
    metadata: { userid: VALID_UID },
    ...overrides,
  } as Stripe.Customer;
}

function setupStripeListMock(customers: Stripe.Customer[]) {
  return {
    customers: {
      list: jest.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          for (const c of customers) yield c;
        },
      }),
      update: jest.fn().mockResolvedValue({}),
    },
  };
}

function setupSyncer(
  stripeMock: any,
  databaseMock: any,
  optionsOverrides: Partial<SyncOptions> = {}
) {
  const stripeHelper = { stripe: stripeMock } as unknown as StripeHelper;
  const log = { info: jest.fn() };
  const options: SyncOptions = {
    dryRun: true,
    limit: Infinity,
    rateLimit: 70,
    outputFile: '/tmp/sync-stripe-customer-emails-test-output.csv',
    ...optionsOverrides,
  };
  return {
    syncer: new StripeCustomerEmailSyncer(
      stripeHelper,
      databaseMock,
      log,
      options
    ),
    log,
  };
}

describe('StripeCustomerEmailSyncer', () => {
  let writeMock: jest.Mock;
  let endMock: jest.Mock;
  let createWriteStreamSpy: jest.SpyInstance;
  let writtenRows: string[];

  beforeEach(() => {
    writtenRows = [];
    writeMock = jest.fn((line: string) => {
      writtenRows.push(line);
      return true;
    });
    endMock = jest.fn((cb?: () => void) => {
      if (cb) cb();
    });
    createWriteStreamSpy = jest
      .spyOn(fs, 'createWriteStream')
      .mockReturnValue({
        write: writeMock,
        end: endMock,
        on: jest.fn(),
      } as unknown as fs.WriteStream);
  });

  afterEach(() => {
    createWriteStreamSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('records skip-no-uid for customers with neither metadata.userid nor description', async () => {
    const customer = makeCustomer({ metadata: {}, description: null });
    const stripe = setupStripeListMock([customer]);
    const database = { account: jest.fn() };
    const { syncer } = setupSyncer(stripe, database);

    await syncer.run();

    expect(database.account).not.toHaveBeenCalled();
    expect(writtenRows.some((row) => row.includes('skip-no-uid'))).toBe(true);
  });

  it('falls back to customer.description when metadata.userid is missing', async () => {
    const customer = makeCustomer({
      metadata: {},
      description: VALID_UID,
      email: FXA_EMAIL,
    });
    const stripe = setupStripeListMock([customer]);
    const database = {
      account: jest
        .fn()
        .mockResolvedValue({ primaryEmail: { email: FXA_EMAIL } }),
    };
    const { syncer } = setupSyncer(stripe, database);

    await syncer.run();

    expect(database.account).toHaveBeenCalledWith(VALID_UID);
    expect(writtenRows.some((row) => row.includes(',ok,'))).toBe(true);
  });

  it('records skip-invalid-uid when uid does not match expected format', async () => {
    const customer = makeCustomer({
      metadata: { userid: 'not-a-hex-uid' },
      description: 'not-a-hex-uid',
    });
    const stripe = setupStripeListMock([customer]);
    const database = { account: jest.fn() };
    const { syncer } = setupSyncer(stripe, database);

    await syncer.run();

    expect(database.account).not.toHaveBeenCalled();
    expect(writtenRows.some((row) => row.includes('skip-invalid-uid'))).toBe(
      true
    );
  });

  it('records skip-account-not-found when db.account throws Unknown account', async () => {
    const customer = makeCustomer();
    const stripe = setupStripeListMock([customer]);
    const database = {
      account: jest.fn().mockRejectedValue(new Error('Unknown account')),
    };
    const { syncer } = setupSyncer(stripe, database);

    await syncer.run();

    expect(stripe.customers.update).not.toHaveBeenCalled();
    expect(
      writtenRows.some((row) => row.includes('skip-account-not-found'))
    ).toBe(true);
  });

  it('records error when db.account throws an unexpected error', async () => {
    const customer = makeCustomer();
    const stripe = setupStripeListMock([customer]);
    const database = {
      account: jest.fn().mockRejectedValue(new Error('database unreachable')),
    };
    const { syncer } = setupSyncer(stripe, database);

    await syncer.run();

    expect(stripe.customers.update).not.toHaveBeenCalled();
    expect(
      writtenRows.some(
        (row) => row.includes(',error,') && row.includes('database unreachable')
      )
    ).toBe(true);
  });

  it('records error when account has no primaryEmail', async () => {
    const customer = makeCustomer();
    const stripe = setupStripeListMock([customer]);
    const database = {
      account: jest.fn().mockResolvedValue({ primaryEmail: undefined }),
    };
    const { syncer } = setupSyncer(stripe, database);

    await syncer.run();

    expect(stripe.customers.update).not.toHaveBeenCalled();
    expect(
      writtenRows.some(
        (row) => row.includes(',error,') && row.includes('no primaryEmail')
      )
    ).toBe(true);
  });

  it('records ok when emails already match', async () => {
    const customer = makeCustomer({ email: FXA_EMAIL });
    const stripe = setupStripeListMock([customer]);
    const database = {
      account: jest
        .fn()
        .mockResolvedValue({ primaryEmail: { email: FXA_EMAIL } }),
    };
    const { syncer } = setupSyncer(stripe, database);

    await syncer.run();

    expect(stripe.customers.update).not.toHaveBeenCalled();
    expect(writtenRows.some((row) => row.includes(',ok,'))).toBe(true);
  });

  it('records would-update in dry-run when emails differ', async () => {
    const customer = makeCustomer({ email: STRIPE_EMAIL });
    const stripe = setupStripeListMock([customer]);
    const database = {
      account: jest
        .fn()
        .mockResolvedValue({ primaryEmail: { email: FXA_EMAIL } }),
    };
    const { syncer } = setupSyncer(stripe, database, { dryRun: true });

    await syncer.run();

    expect(stripe.customers.update).not.toHaveBeenCalled();
    expect(writtenRows.some((row) => row.includes('would-update'))).toBe(true);
  });

  it('updates Stripe customer and records updated when not in dry-run and emails differ', async () => {
    const customer = makeCustomer({ email: STRIPE_EMAIL });
    const stripe = setupStripeListMock([customer]);
    const database = {
      account: jest
        .fn()
        .mockResolvedValue({ primaryEmail: { email: FXA_EMAIL } }),
    };
    const { syncer } = setupSyncer(stripe, database, { dryRun: false });

    await syncer.run();

    expect(stripe.customers.update).toHaveBeenCalledWith(STRIPE_CUSTOMER_ID, {
      email: FXA_EMAIL,
    });
    expect(writtenRows.some((row) => row.includes(',updated,'))).toBe(true);
  });

  it('records error when Stripe update throws and continues processing', async () => {
    const customer1 = makeCustomer({ id: 'cus_one', email: STRIPE_EMAIL });
    const customer2 = makeCustomer({ id: 'cus_two', email: STRIPE_EMAIL });
    const stripe = setupStripeListMock([customer1, customer2]);
    stripe.customers.update
      .mockRejectedValueOnce(new Error('stripe rate limited'))
      .mockResolvedValueOnce({});
    const database = {
      account: jest
        .fn()
        .mockResolvedValue({ primaryEmail: { email: FXA_EMAIL } }),
    };
    const { syncer } = setupSyncer(stripe, database, { dryRun: false });

    await syncer.run();

    expect(stripe.customers.update).toHaveBeenCalledTimes(2);
    expect(
      writtenRows.some(
        (row) =>
          row.includes('cus_one') &&
          row.includes(',error,') &&
          row.includes('stripe rate limited')
      )
    ).toBe(true);
    expect(
      writtenRows.some(
        (row) => row.includes('cus_two') && row.includes(',updated,')
      )
    ).toBe(true);
  });

  it('writes a CSV header row', async () => {
    const stripe = setupStripeListMock([]);
    const { syncer } = setupSyncer(stripe, { account: jest.fn() });

    await syncer.run();

    expect(writtenRows[0]).toBe(
      'stripe_customer_id,uid,stripe_email,fxa_primary_email,action,error\n'
    );
  });

  it('respects the limit option and stops processing when reached', async () => {
    const customers = [
      makeCustomer({ id: 'cus_1' }),
      makeCustomer({ id: 'cus_2' }),
      makeCustomer({ id: 'cus_3' }),
    ];
    const stripe = setupStripeListMock(customers);
    const database = {
      account: jest
        .fn()
        .mockResolvedValue({ primaryEmail: { email: FXA_EMAIL } }),
    };
    const { syncer } = setupSyncer(stripe, database, { limit: 2 });

    await syncer.run();

    // 1 header row + 2 data rows = 3 lines
    expect(writtenRows.length).toBe(3);
  });

  it('rejects when the output stream emits an error', async () => {
    let capturedErrorListener: ((err: Error) => void) | undefined;
    createWriteStreamSpy.mockReturnValue({
      write: writeMock,
      end: endMock,
      on: jest.fn((event: string, listener: any) => {
        if (event === 'error') capturedErrorListener = listener;
      }),
    } as unknown as fs.WriteStream);

    const customer = makeCustomer();
    const stripe = setupStripeListMock([customer]);
    const database = {
      account: jest
        .fn()
        .mockResolvedValue({ primaryEmail: { email: FXA_EMAIL } }),
    };
    const log = { info: jest.fn(), error: jest.fn() };
    const stripeHelper = { stripe } as any;
    const syncer = new StripeCustomerEmailSyncer(stripeHelper, database, log, {
      dryRun: true,
      limit: Infinity,
      rateLimit: 70,
      outputFile: '/tmp/sync-stripe-customer-emails-test-output.csv',
    });

    capturedErrorListener?.(new Error('disk full'));

    await expect(syncer.run()).rejects.toThrow('disk full');
    expect(log.error).toHaveBeenCalledWith(
      'sync-stripe-customer-emails.stream-error',
      expect.objectContaining({ error: 'disk full' })
    );
  });

  it('passes starting_after to Stripe list when provided', async () => {
    const stripe = setupStripeListMock([]);
    const { syncer } = setupSyncer(
      stripe,
      { account: jest.fn() },
      { startingAfter: 'cus_resume_token' }
    );

    await syncer.run();

    expect(stripe.customers.list).toHaveBeenCalledWith({
      starting_after: 'cus_resume_token',
    });
  });
});
