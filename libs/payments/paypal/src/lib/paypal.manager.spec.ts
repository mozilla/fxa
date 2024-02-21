import { PayPalManager } from './paypal.manager';
import { Kysely } from 'kysely';
import { DB, testAccountDatabaseSetup } from '@fxa/shared/db/mysql/account';
import { PayPalClient } from './paypal.client';
import { faker } from '@faker-js/faker';

describe('paypalManager', () => {
  let paypalManager: PayPalManager;
  let kyselyDb: Kysely<DB>;

  beforeAll(async () => {
    kyselyDb = await testAccountDatabaseSetup([
      'paypalCustomers',
      'accountCustomers',
    ]);
    paypalManager = new PayPalManager(
      kyselyDb,
      new PayPalClient({
        sandbox: false,
        user: faker.string.uuid(),
        pwd: faker.string.uuid(),
        signature: faker.string.uuid(),
      })
    );
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  it('instantiates class (TODO: remove me)', () => {
    expect(paypalManager).toBeTruthy();
  });
});
