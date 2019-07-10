/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AttachedClient from 'models/attached-client';
import sinon from 'sinon';

describe('models/attached-client', () => {
  let client;

  describe('when given details for a device', () => {
    beforeEach(() => {
      client = new AttachedClient({
        deviceId: 'device1',
        sessionTokenId: 'session1',
        name: 'my cool device',
      });
    });

    it('synthesizes an appropriate id', () => {
      assert.equal(client.get('id'), '-device1--session1');
    });

    it('sets appropriate client type', () => {
      assert.equal(client.get('clientType'), 'device');
      assert.ok(client.get('isDevice'));
      assert.notOk(client.get('isWebSession'));
      assert.notOk(client.get('isOaAuthApp'));
    });
  });

  describe('when given details for an oauth app with no refresh token', () => {
    beforeEach(() => {
      client = new AttachedClient({
        clientId: 'client1',
      });
    });

    it('synthesizes an appropriate id', () => {
      assert.equal(client.get('id'), 'client1---');
    });

    it('sets appropriate client type', () => {
      assert.equal(client.get('clientType'), 'oAuthApp');
      assert.notOk(client.get('isDevice'));
      assert.notOk(client.get('isWebSession'));
      assert.ok(client.get('isOAuthApp'));
    });
  });

  describe('when given details for an oauth app with refresh token', () => {
    beforeEach(() => {
      client = new AttachedClient({
        clientId: 'client1',
        refreshTokenId: 'refresh1',
      });
    });

    it('synthesizes an appropriate id', () => {
      assert.equal(client.get('id'), 'client1--refresh1-');
    });

    it('sets appropriate client type', () => {
      assert.equal(client.get('clientType'), 'oAuthApp');
      assert.notOk(client.get('isDevice'));
      assert.notOk(client.get('isWebSession'));
      assert.ok(client.get('isOAuthApp'));
    });
  });

  describe('when given details for a web session', () => {
    beforeEach(() => {
      client = new AttachedClient({
        sessionTokenId: 'session1',
        os: 'Windows 10',
      });
    });

    it('synthesizes an appropriate id', () => {
      assert.equal(client.get('id'), '---session1');
    });

    it('sets generic OS name', () => {
      assert.equal(client.get('genericOS'), 'Windows');
    });

    it('sets appropriate client type', () => {
      assert.equal(client.get('clientType'), 'webSession');
      assert.notOk(client.get('isDevice'));
      assert.ok(client.get('isWebSession'));
      assert.notOk(client.get('isOaAuthApp'));
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      client = new AttachedClient();
      sinon.spy(client, 'trigger');
      client.destroy();
    });

    it('triggers a `destroy` message', () => {
      assert.isTrue(client.trigger.calledWith('destroy'));
    });
  });
});
