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

  let bounce: BounceIsh;
  let account: AccountIsh;

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
  await knex.destroy();

  // tslint:disable-next-line: no-console
  console.log(`=> Created email bounce for ${bounce.email}`);
}

addBounceToDB();
