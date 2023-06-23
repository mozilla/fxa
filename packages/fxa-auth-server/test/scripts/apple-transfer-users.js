/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const cp = require('child_process');
const util = require('util');
const path = require('path');
const TestServer = require('../test_server');

const execAsync = util.promisify(cp.exec);
const config = require('../../config').config.getProperties();
const fs = require('fs');

const mocks = require(`${ROOT_DIR}/test/mocks`);
const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const log = mocks.mockLog();
const Token = require('../../lib/tokens')(log, config);
const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
);

const DB = require('../../lib/db')(config, log, Token, UnblockCode);

const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    ...process.env,
    PATH: process.env.PATH || '',
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};
const axios = require('axios');
const { ApplePocketFxAMigration, AppleUser } = require('../../scripts/transfer-users/apple');

describe('#integration - scripts/apple-transfer-users:', async function () {
  this.timeout(30000);
  let server, db, sandbox;
  before(async () => {
    server = await TestServer.start(config);
    db = await DB.connect(config);
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    sandbox.restore();
  });

  after(async () => {
    await TestServer.stop(server);
    await db.close();
  });

  it('fails if no input file', async () => {
    try {
      await execAsync(
        'node -r esbuild-register scripts/apple-transfer-users',
        execOptions
      );
      assert.fail('script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });
});

describe('ApplePocketFxAMigration', function() {
  let sandbox, migration;
  beforeEach(function() {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'readFileSync').returns(`transferSub,uid,email\n1,1,test1@example.com\n2,,test2@example.com\n3,3,test3@example.com\n4,,test4@example.com,"test5@example.com:test6@example.com"`);
    sandbox.stub(axios, 'post').resolves({ data: { access_token: 'valid_access_token' } });
    sandbox.stub(path, 'resolve').returns('valid.csv');
    sandbox.stub(DB, 'connect').resolves({});
    sandbox.stub(fs, 'createWriteStream').returns({
      write: sandbox.stub(),
      end: sandbox.stub(),
      on: sandbox.stub()
    });

    migration = new ApplePocketFxAMigration('valid.csv', config, DB, 'output.csv', ',');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should load users correctly from a CSV file', async function() {
    await migration.load();

    assert.equal(migration.users.length, 4);
    
    function assertUser(user, user1) {
      assert.equal(user.email, user1.email);
      assert.equal(user.uid, user1.uid);
      assert.equal(user.transferSub, user1.transferSub);
      assert.deepEqual(user.alternateEmails, user1.alternateEmails);
    }
    
    assertUser(migration.users[0], {
      email: 'test1@example.com',
      uid: '1',
      transferSub: '1',
      alternateEmails: [],
    });

    assertUser(migration.users[1], {
      email: 'test2@example.com',
      uid: "",
      transferSub: '2',
      alternateEmails: [],
    });

    assertUser(migration.users[2], {
      email: 'test3@example.com',
      uid: '3',
      transferSub: '3',
      alternateEmails: [],
    });

    assertUser(migration.users[3], {
      email: 'test4@example.com',
      uid: '',
      transferSub: '4',
      alternateEmails: ['test5@example.com', 'test6@example.com'],
    });
  });

  it('should generate access token correctly', async function() {
    const token = await migration.generateAccessToken();
    assert.calledOnce(axios.post);
    assert.equal(token,'valid_access_token');
  });

  it('should call transferUser on each user correctly when transferUsers is called', async function() {
    await migration.load();
    migration.users.forEach(user => {
      sandbox.stub(user, 'transferUser').resolves(true);
    });

    await migration.transferUsers();

    migration.users.forEach(user => {
      assert.calledOnce(user.transferUser);
    });
  });

  it('should close db connection correctly when close is called', async function() {
    migration.db = { close: sandbox.stub().resolves() };
    await migration.close();
    assert.calledOnce(migration.db.close);
  });
  
  it('should mock requests correctly', async function() {
    migration = new ApplePocketFxAMigration('valid.csv', config, DB, 'output.csv', ',', true);
    await migration.generateAccessToken();
    assert.notCalled(axios.post);
  })
});

describe('AppleUser', function() {
  let sandbox, dbStub, user, writeStreamStub, log;
  beforeEach(function() {
    sandbox = sinon.createSandbox();
    dbStub = {
      account: sandbox.stub(),
      deleteLinkedAccount: sandbox.stub().resolves(),
      createLinkedAccount: sandbox.stub().resolves(),
      createAccount: sandbox.stub().resolves(),
      accountRecord: sandbox.stub().resolves(),
    };
    writeStreamStub = {
      write: sandbox.stub()
    };
    log = {
      notifyAttachedServices: sandbox.stub().resolves()
    }
    user = new AppleUser('pocket@example.com', 'transferSub', 'uid', ['altEmail@example.com'], dbStub, writeStreamStub, config, false, log);
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should exchange identifiers correctly and update user', async function() {
    const stub = sandbox.stub(axios, 'post').resolves({ data: { sub: 'sub', email: 'email@example.com', is_private_email: true } });
    const data = await user.exchangeIdentifiers('accessToken');

    assert.calledOnce(stub);
    assert.deepEqual(data, { sub: 'sub', email: 'email@example.com', is_private_email: true });
    assert.deepEqual(user.appleUserInfo, { sub: 'sub', email: 'email@example.com', is_private_email: true });
  });

  it('should link user from FxA uid', async function() {
    const accountRecord = { uid: 'uid', email: 'email@example.com' };
    dbStub.account.resolves(accountRecord);
    user.appleUserInfo = {
      sub: 'sub',
      email: 'email@email.com',
      is_private_email: false
    };
    await user.createUpdateFxAUser();

    assert.calledOnceWithExactly(dbStub.account, user.uid);
    assert.calledOnceWithExactly(dbStub.deleteLinkedAccount, 'uid', 'apple');
    assert.calledOnceWithExactly(dbStub.createLinkedAccount, 'uid', 'sub', 'apple');
    assert.isTrue(user.success);
    assert.equal(user.accountRecord,accountRecord);
  });

  it('should link user from Pocket email that has FxA account', async function() {
    dbStub.account.rejects({ 
      errno: 102,
    });

    const accountRecord = { uid: 'uid1', email: 'pocket@example.com' };
    dbStub.accountRecord.resolves(accountRecord);
    
    user.uid = ''; // user does not have an account in FxA

    user.appleUserInfo = {
      sub: 'sub',
      email: 'apple@example.com',
      is_private_email: false
    };

    await user.createUpdateFxAUser();

    assert.calledOnceWithExactly(dbStub.accountRecord, 'pocket@example.com');
    assert.calledOnceWithExactly(dbStub.deleteLinkedAccount, 'uid1', 'apple');
    assert.calledOnceWithExactly(dbStub.createLinkedAccount, 'uid1', 'sub', 'apple');
    assert.isTrue(user.success);
    assert.equal(user.accountRecord,accountRecord);
  });

  it('should create user from Apple email without FxA account', async function() {
    dbStub.account.rejects({
      errno: 102,
    });
    dbStub.accountRecord.rejects({
      errno: 102,
    });
    user.uid = ''; // user does not have an account in FxA
    
    const accountRecord = {
      email: 'apple@example.com',
      uid: 'uid2'
    }
    dbStub.createAccount.resolves(accountRecord);

    user.appleUserInfo = {
      sub: 'sub',
      email: 'apple@example.com',
      is_private_email: false
    };

    await user.createUpdateFxAUser();

    assert.calledOnceWithMatch(dbStub.createAccount, { 
      email: 'apple@example.com' 
    });
    
    assert.calledOnceWithExactly(dbStub.deleteLinkedAccount, 'uid2', 'apple');
    assert.calledOnceWithExactly(dbStub.createLinkedAccount, 'uid2', 'sub', 'apple');
    assert.isTrue(user.success);
    assert.equal(user.accountRecord, accountRecord);
  });
  
  it('should transfer user correctly', async function() {
    sandbox.stub(user, 'exchangeIdentifiers').resolves();
    sandbox.stub(user, 'createUpdateFxAUser').resolves();
    sandbox.stub(user, 'saveResult').resolves();
    await user.transferUser('accessToken');

    sinon.assert.calledOnce(user.exchangeIdentifiers);
    sinon.assert.calledOnce(user.createUpdateFxAUser);
    sinon.assert.calledOnce(user.saveResult);
  });

  it('should save results correctly', async () => {
    const accountRecord = { uid: 'uid', email: 'fxa@example.com' };
    dbStub.account.resolves(accountRecord);
    user.appleUserInfo = {
      sub: 'transferSub',
      email: 'apple@example.com',
      is_private_email: false
    };
    user.err = undefined;    
    await user.createUpdateFxAUser();
    
    user.saveResult();
    const expectedOutput = 'transferSub,uid,fxa@example.com,apple@example.com,true,\n';
    assert.calledWith(user.writeStream.write, expectedOutput);
    
    assert.calledOnceWithExactly(user.log.notifyAttachedServices, 'appleUserMigration', {},
      {
        uid: 'uid',
        appleEmail:'apple@example.com',
        fxaEmail:'fxa@example.com',
        transferSub: 'transferSub',
        success: true,
        err: '',
      })
  });
});