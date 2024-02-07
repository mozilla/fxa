/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { parseDryRun } from './lib/args';
import { FieldPath, Firestore } from '@google-cloud/firestore';
import { AppConfig, AuthFirestore, AuthLogger } from '../lib/types';
import Container from 'typedi';
import {
  AccountDeleteManager,
  ReasonForDeletionOptions,
} from '../lib/account-delete';
import { ConfigType } from '../config';
import oauthDb from '../lib/oauth/db';
import { StatsD } from 'hot-shots';
import pushboxApi from '../lib/pushbox';
import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { uuidTransformer } from 'packages/fxa-shared/db/transformers';
import * as pckg from '../package.json';

class CleanupFirestoreHelper {
  private firestore: Firestore;
  private log: AuthLogger;
  private config: ConfigType;
  private accountDeleteManager: AccountDeleteManager;
  private accountManager: AccountManager;

  constructor(private batchSize: number, private dryRun: boolean) {
    this.firestore = Container.get<Firestore>(AuthFirestore);
    this.log = Container.get(AuthLogger);
    this.config = Container.get(AppConfig);
    this.accountDeleteManager = Container.get(AccountDeleteManager);
    this.accountManager = Container.get(AccountManager);
  }

  /**
   * Get customers from Firestore paginated by batchSize
   * @returns A list of customers from firestore
   */
  private async *getFirestoreCustomersUids() {
    this.log.debug(
      'CleanupFirestoreHelper.getFirestoreCustomersUids.start',
      {}
    );
    const customerCollection = `${this.config.authFirestore.prefix}stripe-customers`;
    let customerSnap = await this.firestore
      .collectionGroup(customerCollection)
      .orderBy(FieldPath.documentId())
      .limit(this.batchSize)
      .get();
    while (!customerSnap.empty) {
      yield customerSnap.docs.map((doc) => doc.id);
      customerSnap = await this.firestore
        .collectionGroup(customerCollection)
        .orderBy(FieldPath.documentId())
        .startAfter(customerSnap.docs.at(-1))
        .limit(this.batchSize)
        .get();
    }
  }

  /**
   * Determines which uids should be deleted
   * @param uids Expects an array of account uids
   * @returns A list of uids to be deleted
   */
  private async filterUidsForDeletion(uids: string[]) {
    this.log.debug('CleanupFirestoreHelper.getUidsForDelete.start', {
      nrOfUids: uids.length,
    });

    // Get all accounts for uids
    const accounts = await this.accountManager.getAccounts(uids);
    const accountUids = accounts.map((account) =>
      uuidTransformer.from(account.uid)
    );
    // Filter uids where account does not exist
    // Uids where account doesn't exist, should be deleted
    const uidsForDelete = uids.filter(
      (uid) => !accountUids.find((accountId) => accountId === uid)
    );

    return uidsForDelete;
  }

  /**
   * Create Cloud Task to delete account
   * @param uids Expects an array of account uids
   */
  private async enqueueUidsToCloudTasks(uids: string[]) {
    this.log.debug('CleanupFirestoreHelper.callPartialDelete.start', {
      uidsForDelete: uids.length,
    });
    if (this.dryRun) {
      this.log.debug('CleanupFirestoreHelper.callPartialDelete.skipped', {
        dryRun: this.dryRun,
        uidNumbers: uids.length,
      });

      return;
    }

    await Promise.all(
      uids.map((uid) =>
        this.accountDeleteManager.enqueue({
          uid,
          reason: ReasonForDeletionOptions.Cleanup,
        })
      )
    );
  }

  async cleanup() {
    this.log.debug('CleanupFirestoreHelper.cleanup.start', {
      batchSize: this.batchSize,
      dryRun: this.dryRun,
    });
    let batchCounter = 0;
    for await (const uids of this.getFirestoreCustomersUids()) {
      this.log.info('CleanupFirestoreHelper.cleanup', {
        msg: `Batch ${batchCounter * this.batchSize} - ${
          (batchCounter + 1) * this.batchSize - 1
        }`,
      });

      const uidsForDelete = await this.filterUidsForDeletion(uids);
      await this.enqueueUidsToCloudTasks(uidsForDelete);

      batchCounter += 1;
    }
  }
}

export async function init() {
  program
    .version(pckg.version)
    .option(
      '-b, --batch-size [number]',
      'Number of customers to query from firestore at a time.  Defaults to 100.',
      100
    )
    .option(
      '--dry-run [true|false]',
      'Print what the script would do instead of performing the action. Defaults to true.',
      true
    )
    .parse(process.argv);

  const options = program.opts();
  const batchSize = parseInt(options.batchSize);
  const isDryRun = parseDryRun(options.dryRun);

  const { database: fxaDb } = await setupProcessingTaskObjects(
    'cleanup-delete-partial-firestore'
  );

  const config = Container.get(AppConfig);
  const statsd = Container.get(StatsD);
  const log = Container.get(AuthLogger);
  const pushbox = pushboxApi(log, config, statsd);

  const accountDeleteManager = new AccountDeleteManager({
    fxaDb,
    oauthDb,
    config,
    push: {} as any,
    pushbox,
    statsd,
  });

  Container.set(AccountDeleteManager, accountDeleteManager);

  const accountDb = await setupAccountDatabase(config.database.mysql.auth);
  const accountManager = new AccountManager(accountDb);
  Container.set(AccountManager, accountManager);

  const cleanupFirestoreHelper = new CleanupFirestoreHelper(
    batchSize,
    isDryRun
  );

  await cleanupFirestoreHelper.cleanup();

  return 0;
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
