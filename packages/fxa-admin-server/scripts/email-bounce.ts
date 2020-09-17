import Knex from 'knex';
import { Model } from 'objection';
import yargs from 'yargs';

import Config from '../src/config';
import { Account, EmailBounces } from '../src/database/model';
import {
  AccountIsh,
  BounceIsh,
  randomAccount,
  randomEmail,
  randomEmailBounce,
} from '../src/database/model/helpers';

const config = Config.getProperties();

const argv = yargs.options({
  count: { type: 'number', default: 1 },
  email: { type: 'string' },
}).argv;

async function addBounceToDB() {
  const knex = Knex({ client: 'mysql', connection: config.database });
  Model.knex(knex);
  const count = argv.count;

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
    if (!argv.email) {
      console.log(`=> Created 1 email bounce for ${bounce.email}`);
    }
  }

  if (argv.email) {
    console.log(
      `=> Created ${count} email ${count === 1 ? 'bounce' : 'bounces'} for ${
        argv.email
      }`
    );
  }

  await knex.destroy();
}

addBounceToDB();
