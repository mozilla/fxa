/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import type { AccountDatabase } from './setup';
import { testAccountDatabaseTeardown } from './tests';

const mockExecute = jest.fn();

// Replaces the sql tag so the helper runs without MySQL. sql.table becomes the
// identity, so a schema name arrives as a plain string.
jest.mock('kysely', () => {
  const actual = jest.requireActual('kysely');
  const sql = Object.assign(
    (strings: TemplateStringsArray, ...values: unknown[]) => ({
      execute: () => mockExecute(strings.join('?'), values),
    }),
    actual.sql,
    { table: (name: string) => name }
  );
  return { ...actual, sql };
});

describe('testAccountDatabaseTeardown', () => {
  const REAL_SCHEMA = 'fxa';
  const TEST_SCHEMA = 'testAccount-2e0b1c4a';

  let destroy: jest.MockedFunction<AccountDatabase['destroy']>;
  let db: AccountDatabase;

  function mockCurrentSchema(name: string | null) {
    mockExecute.mockResolvedValueOnce({ rows: [{ name }] });
  }

  function dropCalls() {
    return mockExecute.mock.calls.filter(([query]) =>
      query.startsWith('DROP DATABASE')
    );
  }

  beforeEach(() => {
    mockExecute.mockReset();
    destroy = jest.fn();
    db = { destroy } as unknown as AccountDatabase;
  });

  it('does nothing when the setup never returned a database', async () => {
    await testAccountDatabaseTeardown(undefined);

    expect(mockExecute).not.toHaveBeenCalled();
  });

  // The prefix must be anchored, and a pool opened with no database reports a
  // null schema.
  it.each([
    { label: 'lacks the test prefix', name: REAL_SCHEMA },
    { label: 'only contains the test prefix', name: `fxa_${TEST_SCHEMA}` },
    { label: 'is null', name: null },
  ])('does not drop a schema whose name $label', async ({ name }) => {
    mockCurrentSchema(name);

    await testAccountDatabaseTeardown(db);

    expect(dropCalls()).toEqual([]);
  });

  it('closes the pool when it leaves a schema in place', async () => {
    mockCurrentSchema(REAL_SCHEMA);

    await testAccountDatabaseTeardown(db);

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('drops a schema whose name carries the test prefix', async () => {
    mockCurrentSchema(TEST_SCHEMA);

    await testAccountDatabaseTeardown(db);

    expect(dropCalls()).toEqual([['DROP DATABASE IF EXISTS ?', [TEST_SCHEMA]]]);
  });

  it('closes the pool after it drops a schema', async () => {
    mockCurrentSchema(TEST_SCHEMA);

    await testAccountDatabaseTeardown(db);

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('closes the pool when the drop fails', async () => {
    mockCurrentSchema(TEST_SCHEMA);
    mockExecute.mockRejectedValueOnce(new Error('ER_DBACCESS_DENIED_ERROR'));

    await expect(testAccountDatabaseTeardown(db)).rejects.toThrow(
      'ER_DBACCESS_DENIED_ERROR'
    );
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
