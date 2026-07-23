/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NotifierService } from '@fxa/shared/notifier';
import { AccountController } from './account.controller';
import { DatabaseService } from '../../database/database.service';
import {
  EventLoggingService,
  EventNames,
} from '../../event-logging/event-logging.service';
import { uuidTransformer } from '../../database/transformers';

// AccountController imports SentryTraced from @sentry/nestjs, whose module init
// does not run under Jest; stub the decorator to a no-op.
jest.mock('@sentry/nestjs', () => ({ SentryTraced: () => () => undefined }));

/**
 * Minimal chainable, thenable stand-in for a Knex query builder. Resolves to
 * `count` when awaited, and records the delete/where/andWhere calls.
 */
function mockKnexBuilder(count: number) {
  const builder: any = {
    delete: jest.fn(() => builder),
    where: jest.fn(() => builder),
    andWhere: jest.fn(() => builder),
    then: (resolve: (value: number) => unknown) =>
      Promise.resolve(count).then(resolve),
  };
  return builder;
}

describe('AccountController', () => {
  const MOCK_UID = 'f9416ce3703e4916a4cd6b1e665a3f1a';
  const MOCK_CREDENTIAL_ID = 'AQIDBAUGBwgJCg';

  let controller: AccountController;
  let builder: ReturnType<typeof mockKnexBuilder>;
  let knexMock: jest.Mock;
  let eventLogging: { onEvent: jest.Mock };
  let notifier: { send: jest.Mock };

  function buildController(deleteCount: number) {
    builder = mockKnexBuilder(deleteCount);
    knexMock = jest.fn().mockReturnValue(builder);
    const db = { knex: knexMock } as unknown as DatabaseService;

    controller = new AccountController(
      undefined as any, // log
      db,
      undefined as any, // cartManager
      undefined as any, // subscriptionsService
      undefined as any, // configService
      eventLogging as unknown as EventLoggingService,
      undefined as any, // basketService
      notifier as unknown as NotifierService,
      undefined as any, // emailService
      undefined as any, // firestore
      undefined as any, // cloudTask
      undefined as any, // profileClient
      undefined as any // mds
    );
  }

  beforeEach(() => {
    eventLogging = { onEvent: jest.fn() };
    notifier = { send: jest.fn().mockResolvedValue(undefined) };
    buildController(2);
  });

  describe('removePasskeys', () => {
    it('deletes from the passkeys table scoped to the given uid', async () => {
      await controller.removePasskeys(MOCK_UID);
      expect(knexMock).toHaveBeenCalledWith('passkeys');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.where).toHaveBeenCalledWith(
        'uid',
        uuidTransformer.to(MOCK_UID)
      );
    });

    it('returns true when passkeys were removed', async () => {
      const result = await controller.removePasskeys(MOCK_UID);
      expect(result).toBe(true);
    });

    it('logs a remove-passkeys event', async () => {
      await controller.removePasskeys(MOCK_UID);
      expect(eventLogging.onEvent).toHaveBeenCalledWith(
        EventNames.RemovePasskeys
      );
    });

    it('emits a profileDataChange notification when passkeys were removed', async () => {
      await controller.removePasskeys(MOCK_UID);
      expect(notifier.send).toHaveBeenCalledWith({
        event: 'profileDataChange',
        data: { ts: expect.any(Number), uid: MOCK_UID },
      });
    });

    it('returns false when the account has no passkeys', async () => {
      buildController(0);
      const result = await controller.removePasskeys(MOCK_UID);
      expect(result).toBe(false);
    });

    it('does not notify when the account has no passkeys', async () => {
      buildController(0);
      await controller.removePasskeys(MOCK_UID);
      expect(notifier.send).not.toHaveBeenCalled();
    });
  });

  describe('removePasskey', () => {
    it('deletes a single passkey scoped to uid and credentialId', async () => {
      await controller.removePasskey(MOCK_UID, MOCK_CREDENTIAL_ID);
      expect(knexMock).toHaveBeenCalledWith('passkeys');
      expect(builder.where).toHaveBeenCalledWith(
        'uid',
        uuidTransformer.to(MOCK_UID)
      );
      expect(builder.andWhere).toHaveBeenCalledWith(
        'credentialId',
        Buffer.from(MOCK_CREDENTIAL_ID, 'base64url')
      );
    });

    it('returns true when the passkey was removed', async () => {
      buildController(1);
      const result = await controller.removePasskey(
        MOCK_UID,
        MOCK_CREDENTIAL_ID
      );
      expect(result).toBe(true);
    });

    it('notifies when the passkey was removed', async () => {
      buildController(1);
      await controller.removePasskey(MOCK_UID, MOCK_CREDENTIAL_ID);
      expect(notifier.send).toHaveBeenCalledWith({
        event: 'profileDataChange',
        data: { ts: expect.any(Number), uid: MOCK_UID },
      });
    });

    it('returns false and skips notification when no matching passkey exists', async () => {
      buildController(0);
      const result = await controller.removePasskey(
        MOCK_UID,
        MOCK_CREDENTIAL_ID
      );
      expect(result).toBe(false);
      expect(notifier.send).not.toHaveBeenCalled();
    });
  });
});
