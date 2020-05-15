import { argv } from 'yargs';
import { EmailBounces } from '../src/lib/db/models/email-bounces';
import { Account } from '../src/lib/db/models/account';
import Config from '../src/config';
import { setupDatabase } from '../src/lib/db';

import {
  randomAccount,
  randomEmail,
  randomEmailBounce,
  AccountIsh,
  BounceIsh
} from '../src/test/lib/db/models/helpers';

const config = Config.getProperties();

async function addBounceToDB() {
  const knex = setupDatabase(config.database);
  const count = argv.count || 1;

  let bounce: BounceIsh;
  let account: AccountIsh;

  for (let i = 0; i < count; i++) {
    if (argv.email) {
      bounce = randomEmailBounce(argv.email as string);
    } else {
      account = randomAccount();
      bounce = randomEmailBounce(account.email);
      const email = randomEmail(account);
      account.emails = [email];

      await Account.query().insertGraph({ ...account });
    }

    await EmailBounces.query().insertGraph(bounce);
  }

  await knex.destroy();

  console.log(
    `=> Created ${count} email ${count === 1 ? 'bounce' : 'bounces'} for ${bounce.email}`
  );
}

addBounceToDB();
