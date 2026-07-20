/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AttachedClient } from './attached-clients.model';
import { EmailBounce } from './email-bounces.model';
import { Email } from './emails.model';
import { RecoveryKeys } from './recovery-keys.model';
import { SecurityEvents } from './security-events.model';
import { Totp } from './totp.model';
import { LinkedAccount } from './linked-account.model';
import { AccountEvent } from './account-events.model';
import { MozSubscription } from './moz-subscription.model';
import { Cart } from './cart.model';
import { BackupCodes } from './backup-code.model';
import { RecoveryPhone } from './recovery-phone.model';

export class Account {
  public uid!: string;

  public email!: string;

  public emailVerified!: boolean;

  public clientSalt?: string;

  public createdAt!: number;

  public disabledAt?: number;

  public locale?: string;

  public lockedAt?: number;

  public verifierSetAt?: number;

  public emails!: Email[];

  public emailBounces!: EmailBounce[];

  public totp!: Totp[];

  public recoveryKeys!: RecoveryKeys[];

  public securityEvents!: SecurityEvents[];

  public attachedClients!: AttachedClient[];

  public subscriptions!: MozSubscription[];

  public linkedAccounts!: LinkedAccount[];

  public accountEvents!: AccountEvent[];

  public carts!: Cart[];

  public backupCodes!: BackupCodes[];

  public recoveryPhone!: RecoveryPhone[];
}
