/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';
import 'reflect-metadata';

import { assert } from 'chai';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';

import { Proc } from '../../../../db/models/auth/base-auth';
import {
  BOUNCE_SUB_TYPES,
  BOUNCE_TYPES,
  EmailBounce,
} from '../../../../db/models/auth/email-bounce';
import { MysqlErrors } from '../../../../db/mysql';
import { defaultOpts, testDatabaseSetup } from '../../../../test/db/helpers';
import { randomGuid } from '../../../../test/db/models/auth/helpers';

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

describe('#integration - EmailBounce', () => {
  let knex;

  before(async function () {
    this.timeout(20000);
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: true,
      oauth: false,
      profile: false,
    });
    await knex.raw(
      fs.readFileSync(path.join(__dirname, 'sp_emailBounces.sql'), 'utf8')
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  after(async () => {
    await knex?.destroy();
  });

  async function roundTrip(overrides) {
    const email = `${randomGuid()}@example.com`;
    await EmailBounce.create(
      bounce({ email, templateName: 'verify', ...overrides })
    );
    const rows = await EmailBounce.findByEmail(email);
    assert.lengthOf(rows, 1);
    return rows[0];
  }

  it('stores and reads back a Permanent General bounce', async () => {
    const row = await roundTrip({});
    assert.strictEqual(row.emailType, 'verify');
    assert.strictEqual(row.bounceType, BOUNCE_TYPES.Permanent);
    assert.strictEqual(row.bounceSubType, BOUNCE_SUB_TYPES.General);
    assert.strictEqual(row.diagnosticCode, DIAGNOSTIC_CODE);
  });

  for (const bounceType of Object.keys(BOUNCE_TYPES)) {
    it(`stores bounceType ${bounceType}`, async () => {
      const row = await roundTrip({ bounceType });
      assert.strictEqual(row.bounceType, BOUNCE_TYPES[bounceType]);
    });
  }

  for (const bounceSubType of Object.keys(BOUNCE_SUB_TYPES)) {
    it(`stores bounceSubType ${bounceSubType}`, async () => {
      const row = await roundTrip({ bounceSubType });
      assert.strictEqual(row.bounceSubType, BOUNCE_SUB_TYPES[bounceSubType]);
    });
  }

  it('stores an empty diagnosticCode when it is missing', async () => {
    const row = await roundTrip({ diagnosticCode: undefined });
    assert.strictEqual(row.diagnosticCode, '');
  });

  it('stores a 300 character diagnosticCode truncated to 255', async () => {
    const row = await roundTrip({ diagnosticCode: 'x'.repeat(300) });
    assert.strictEqual(row.diagnosticCode, 'x'.repeat(255));
  });

  // fetchEmailBounces_4 inner joins emailTypes, so it hides a NULL emailTypeId.
  it('stores a NULL emailTypeId that findByEmail hides when templateName is missing', async () => {
    const email = `${randomGuid()}@example.com`;
    await EmailBounce.create(bounce({ email, templateName: undefined }));
    const stored = await EmailBounce.query().where({ email });
    assert.lengthOf(stored, 1);
    assert.isNull(stored[0].emailTypeId);
    assert.deepEqual(await EmailBounce.findByEmail(email), []);
  });

  it('resolves when SQS delivers the same bounce twice', async () => {
    sinon.stub(Date, 'now').returns(NOW);
    const email = `${randomGuid()}@example.com`;
    await EmailBounce.create(bounce({ email, templateName: 'verify' }));
    await EmailBounce.create(bounce({ email, templateName: 'verify' }));
    assert.lengthOf(await EmailBounce.findByEmail(email), 1);
  });
});
