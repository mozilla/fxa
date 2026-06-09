/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

const mocks = require('../../../test/mocks');
const { EmailCapabilityHandler } = require('./email-capability');
const { CapabilityService } = require('../../payments/capability');
const { AppError: error } = require('@fxa/accounts/errors');

describe('EmailCapabilityHandler', () => {
  let log: any;
  let db: any;
  let mockCapabilityService: any;
  let handler: any;

  beforeEach(() => {
    log = mocks.mockLog();
    db = {
      accountRecord: jest.fn(),
    };
    mockCapabilityService = {
      processEmailListChange: jest.fn().mockResolvedValue(undefined),
    };
    Container.set(CapabilityService, mockCapabilityService);
    handler = new EmailCapabilityHandler(log, db);
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  const buildRequest = (payload: any) => ({
    payload,
    auth: { credentials: { scope: [] } },
  });

  it('applies each change with at least one added/removed capability', async () => {
    db.accountRecord
      .mockResolvedValueOnce({ uid: 'uid-a' })
      .mockResolvedValueOnce({ uid: 'uid-b' });

    const result = await handler.postEmailCapabilityChanged(
      buildRequest({
        eventCreatedAt: 1_700_000_000,
        changes: [
          { email: 'a@example.com', added: ['capA'] },
          { email: 'b@example.com', removed: ['capB'] },
        ],
      })
    );

    expect(mockCapabilityService.processEmailListChange).toHaveBeenCalledTimes(
      2
    );
    expect(mockCapabilityService.processEmailListChange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        uid: 'uid-a',
        added: ['capA'],
        removed: [],
        eventCreatedAt: 1_700_000_000,
      })
    );
    expect(mockCapabilityService.processEmailListChange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        uid: 'uid-b',
        added: [],
        removed: ['capB'],
      })
    );
    expect(result).toEqual({ applied: 2, unknownAccount: 0 });
  });

  it('skips changes with no added or removed capabilities', async () => {
    const result = await handler.postEmailCapabilityChanged(
      buildRequest({
        changes: [{ email: 'a@example.com' }],
      })
    );

    expect(db.accountRecord).not.toHaveBeenCalled();
    expect(mockCapabilityService.processEmailListChange).not.toHaveBeenCalled();
    expect(result).toEqual({ applied: 0, unknownAccount: 0 });
  });

  it('treats unknown accounts as a no-op and counts them', async () => {
    db.accountRecord.mockRejectedValueOnce(
      error.unknownAccount('missing@example.com')
    );

    const result = await handler.postEmailCapabilityChanged(
      buildRequest({
        changes: [
          { email: 'missing@example.com', added: ['capA'] },
        ],
      })
    );

    expect(mockCapabilityService.processEmailListChange).not.toHaveBeenCalled();
    expect(result).toEqual({ applied: 0, unknownAccount: 1 });
  });

  it('rethrows non-unknownAccount errors from the DB', async () => {
    const dbError = new Error('boom');
    db.accountRecord.mockRejectedValueOnce(dbError);

    await expect(
      handler.postEmailCapabilityChanged(
        buildRequest({
          changes: [{ email: 'a@example.com', added: ['capA'] }],
        })
      )
    ).rejects.toBe(dbError);
  });

  it('processes a mixed batch (known, unknown, both)', async () => {
    db.accountRecord
      .mockResolvedValueOnce({ uid: 'uid-a' })
      .mockRejectedValueOnce(error.unknownAccount('miss@example.com'))
      .mockResolvedValueOnce({ uid: 'uid-c' });

    const result = await handler.postEmailCapabilityChanged(
      buildRequest({
        changes: [
          { email: 'a@example.com', added: ['capA'] },
          { email: 'miss@example.com', added: ['capX'] },
          { email: 'c@example.com', added: ['capC'], removed: ['capY'] },
        ],
      })
    );

    expect(mockCapabilityService.processEmailListChange).toHaveBeenCalledTimes(
      2
    );
    expect(result).toEqual({ applied: 2, unknownAccount: 1 });
  });
});
