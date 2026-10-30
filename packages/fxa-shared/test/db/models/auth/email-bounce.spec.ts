/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';
import sinon from 'sinon';

import { Proc } from '../../../../db/models/auth/base-auth';
import { EmailBounce } from '../../../../db/models/auth/email-bounce';
import { MysqlErrors } from '../../../../db/mysql';

const NOW = 1700000000000;
const DIAGNOSTIC_CODE = 'smtp; 550 5.1.1 user unknown';

function bounce(overrides) {
  return {
    email: 'test@example.com',
    templateName: 'verifyEmail',
    bounceType: 'Permanent',
    bounceSubType: 'General',
    diagnosticCode: DIAGNOSTIC_CODE,
    ...overrides,
  };
}

describe('EmailBounce.create', () => {
  let callProcedure;

  beforeEach(() => {
    sinon.useFakeTimers(NOW);
    callProcedure = sinon
      .stub(EmailBounce, 'callProcedure')
      .resolves({ status: {}, rows: [] });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('calls the CreateEmailBounce procedure with the mapped arguments', async () => {
    await EmailBounce.create(bounce({}));
    sinon.assert.calledOnceWithExactly(
      callProcedure,
      Proc.CreateEmailBounce,
      'test@example.com',
      'verifyEmail',
      1,
      2,
      NOW,
      DIAGNOSTIC_CODE
    );
  });

  // Literal ids, because rows already in emailBounces store these numbers.
  for (const [bounceType, id] of Object.entries({
    Permanent: 1,
    Transient: 2,
    Complaint: 3,
    Undetermined: 4,
  })) {
    it(`maps bounceType ${bounceType} to id ${id}`, async () => {
      await EmailBounce.create(bounce({ bounceType }));
      assert.strictEqual(callProcedure.firstCall.args[3], id);
    });
  }

  for (const [bounceSubType, id] of Object.entries({
    Undetermined: 1,
    General: 2,
    NoEmail: 3,
    Suppressed: 4,
    MailboxFull: 5,
    MessageTooLarge: 6,
    ContentRejected: 7,
    AttachmentRejected: 8,
    abuse: 9,
    'auth-failure': 10,
    fraud: 11,
    'not-spam': 12,
    other: 13,
    virus: 14,
    OnAccountSuppressionList: 15,
  })) {
    it(`maps bounceSubType ${bounceSubType} to id ${id}`, async () => {
      await EmailBounce.create(bounce({ bounceSubType }));
      assert.strictEqual(callProcedure.firstCall.args[4], id);
    });
  }

  for (const [name, value] of [
    ['an unknown', 'SomethingNew'],
    ['a missing', undefined],
  ]) {
    it(`maps ${name} bounceType to __fxa__unmapped (0)`, async () => {
      await EmailBounce.create(bounce({ bounceType: value }));
      assert.strictEqual(callProcedure.firstCall.args[3], 0);
    });

    it(`maps ${name} bounceSubType to __fxa__unmapped (0)`, async () => {
      await EmailBounce.create(bounce({ bounceSubType: value }));
      assert.strictEqual(callProcedure.firstCall.args[4], 0);
    });
  }

  for (const [name, value] of [
    ['missing', undefined],
    ['null', null],
    ['empty', ''],
  ]) {
    it(`passes an empty diagnosticCode when it is ${name}`, async () => {
      await EmailBounce.create(bounce({ diagnosticCode: value }));
      assert.strictEqual(callProcedure.firstCall.args[6], '');
    });
  }

  it('truncates a diagnosticCode longer than 255 characters', async () => {
    const longCode = 'x'.repeat(300);
    await EmailBounce.create(bounce({ diagnosticCode: longCode }));
    assert.strictEqual(callProcedure.firstCall.args[6], 'x'.repeat(255));
  });

  it('passes "unknown" when templateName is missing', async () => {
    await EmailBounce.create(bounce({ templateName: undefined }));
    assert.strictEqual(callProcedure.firstCall.args[2], 'unknown');
  });

  it('resolves on a duplicate delivery (ER_DUP_ENTRY)', async () => {
    callProcedure.rejects({ errno: MysqlErrors.ER_DUP_ENTRY });
    assert.isUndefined(await EmailBounce.create(bounce({})));
  });

  it('rethrows other database errors converted with a 500 status', async () => {
    callProcedure.rejects({ errno: MysqlErrors.ER_LOCK_DEADLOCK });
    const err = await EmailBounce.create(bounce({})).then(
      () => assert.fail('expected a rejection'),
      (e) => e
    );
    assert.strictEqual(err.errno, MysqlErrors.ER_LOCK_DEADLOCK);
    assert.strictEqual(err.statusCode, 500);
  });
});
