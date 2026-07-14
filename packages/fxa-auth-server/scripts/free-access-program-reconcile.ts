/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';
import { Logger } from '@nestjs/common';
import { StatsD } from 'hot-shots';

import { AccountManager } from '@fxa/shared/account/account';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import {
  FreeAccessProgramConfigurationManager,
  StrapiClient,
  StrapiClientConfig,
} from '@fxa/shared/cms';
import {
  FREE_ACCESS_NOTIFIER,
  FreeAccessProgramJournalManager,
  FreeAccessProgramJournalManagerConfig,
  FreeAccessProgramService,
} from '@fxa/free-access-program';
import { ProfileClient } from '@fxa/profile/client';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { FreeAccessInProcessNotifier } from '../lib/payments/free-access-in-process-notifier';
import { AuthFirestore } from '../lib/types';

async function main() {
  const { log, database, config } = await setupProcessingTaskObjects(
    'free-access-program-reconcile'
  );

  if (!database) {
    throw new Error('DB.connect did not yield a database handle');
  }

  if (!config.subscriptions?.enabled) {
    log.warn('free-access-program-reconcile.skipped', {
      reason: 'subscriptions-disabled',
    });
    return 0;
  }
  if (!config.subscriptions.freeAccessProgram?.enabled) {
    log.warn('free-access-program-reconcile.skipped', {
      reason: 'free-access-program-disabled',
    });
    return 0;
  }
  const strapiClientConfig = config.cms?.strapiClient;
  if (
    !strapiClientConfig?.graphqlApiUri ||
    !strapiClientConfig?.apiKey ||
    !strapiClientConfig?.firestoreCacheCollectionName
  ) {
    log.warn('free-access-program-reconcile.skipped', {
      reason: 'cms-disabled',
    });
    return 0;
  }

  const firestore = Container.get(AuthFirestore);
  const strapiClient = Container.has(StrapiClient)
    ? Container.get(StrapiClient)
    : new StrapiClient(strapiClientConfig, firestore, log as any);
  Container.set(StrapiClient, strapiClient);
  Container.set(
    StrapiClientConfig,
    strapiClientConfig as unknown as StrapiClientConfig
  );
  Container.set(FirestoreService as unknown as string, firestore);
  Container.set(Logger, log as unknown as Logger);

  const configurationManager = new FreeAccessProgramConfigurationManager(
    strapiClientConfig as unknown as StrapiClientConfig,
    strapiClient,
    firestore,
    log as unknown as Logger
  );
  Container.set(FreeAccessProgramConfigurationManager, configurationManager);

  const journalManagerConfig = Object.assign(
    new FreeAccessProgramJournalManagerConfig(),
    {
      collectionName:
        config.subscriptions.freeAccessProgramJournal.collectionName,
    }
  );
  Container.set(FreeAccessProgramJournalManagerConfig, journalManagerConfig);

  const statsd = Container.get(StatsD);
  Container.set(StatsDService as unknown as string, statsd);
  const notifier = new FreeAccessInProcessNotifier(
    database,
    Container.get(ProfileClient),
    log
  );
  Container.set(FREE_ACCESS_NOTIFIER, notifier);
  const journalManager = new FreeAccessProgramJournalManager(
    journalManagerConfig,
    firestore
  );
  Container.set(FreeAccessProgramJournalManager, journalManager);
  const accountDatabase = await setupAccountDatabase(config.database.mysql.auth);
  const accountManager = new AccountManager(accountDatabase);
  Container.set(AccountManager, accountManager);

  const service = new FreeAccessProgramService(
    configurationManager,
    accountManager,
    statsd,
    log as any,
    journalManager,
    notifier
  );
  Container.set(FreeAccessProgramService, service);

  const result = await service.reconcile();
  log.info('free-access-program-reconcile.complete', result);
  return 0;
}

main()
  .then((exitCode) => process.exit(exitCode))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('free-access-program-reconcile.fatal', err);
    process.exit(1);
  });
