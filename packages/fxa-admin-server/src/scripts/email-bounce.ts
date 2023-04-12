import { knex } from 'knex';
import { Model } from 'objection';
import yargs from 'yargs';

import Config from '../config';
import { Account, Email, EmailBounce } from 'fxa-shared/db/models/auth';
import {
  AccountIsh,
  BounceIsh,
  randomAccount,
  randomEmail,
  randomEmailBounce,
} from 'fxa-shared/test/db/models/auth/helpers';

const config = Config.getProperties();

const argv = yargs
  .options({
    count: { type: 'number', default: 1 },
    email: { type: 'string' },
    withDiagnosticCode: { type: 'boolean' },
  })
  .parseSync();

async function addBounceToDB() {
  const instance = knex({ client: 'mysql', connection: config.database.fxa });
  Model.knex(instance);
  const count = argv.count;

  let bounce: BounceIsh;
  let account: AccountIsh;

  for (let i = 0; i < count; i++) {
    if (argv.email) {
      bounce = randomEmailBounce(
        argv.email as string,
        argv.withDiagnosticCode as boolean
      );
    } else {
      account = randomAccount();
      bounce = randomEmailBounce(account.email);
      const email = randomEmail(account);
      account.emails = [email as Email];

      await Account.query().insertGraph({ ...account });
    }

    await EmailBounce.query().insertGraph(bounce);
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

  await instance.destroy();
}

addBounceToDB();
