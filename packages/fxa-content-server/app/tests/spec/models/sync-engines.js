/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import SyncEngines from 'models/sync-engines';
import sinon from 'sinon';
import UserAgent from 'lib/user-agent';
import WindowMock from '../../mocks/window';

const DEFAULT_SYNC_ENGINE_IDS = [
  'tabs',
  'bookmarks',
  'addons',
  'passwords',
  'history',
  'prefs',
];

const FIREFOX_55_USER_AGENT_STRING =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';
const FIREFOX_56_USER_AGENT_STRING =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:56.0) Gecko/20100101 Firefox/56.0';

describe('models/sync-engines', () => {
  let sandbox;
  let syncEngines;
  let windowMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    windowMock = new WindowMock();

    // Use Fx Desktop 55 for testing.
    sandbox.spy(SyncEngines.prototype, 'getSupportedEngineIds');
    windowMock.navigator.userAgent = FIREFOX_55_USER_AGENT_STRING;
    syncEngines = new SyncEngines(null, {
      window: windowMock,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is created with the default list of sync engines', () => {
    assert.ok(syncEngines);
    assert.equal(syncEngines.length, 6);
    assert.isTrue(syncEngines.getSupportedEngineIds.calledOnce);
  });

  describe('getSupportedEngineIds', () => {
    it('returns the expected list', () => {
      assert.sameMembers(
        syncEngines.getSupportedEngineIds(),
        DEFAULT_SYNC_ENGINE_IDS
      );
    });
  });

  describe('isEngineSupportedByUA', () => {
    let fx55UserAgent;
    let fx56UserAgent;

    before(() => {
      fx55UserAgent = new UserAgent(FIREFOX_55_USER_AGENT_STRING);
      fx56UserAgent = new UserAgent(FIREFOX_56_USER_AGENT_STRING);
    });

    DEFAULT_SYNC_ENGINE_IDS.forEach(engineId => {
      it(`always returns \`true\` for ${engineId}`, () => {
        assert.isTrue(
          syncEngines.isEngineSupportedByUA(engineId, fx55UserAgent)
        );
        assert.isTrue(
          syncEngines.isEngineSupportedByUA(engineId, fx56UserAgent)
        );
      });
    });

    it('always returns `false` for `creditcards`', () => {
      assert.isFalse(
        syncEngines.isEngineSupportedByUA('creditcards', fx55UserAgent)
      );
      assert.isFalse(
        syncEngines.isEngineSupportedByUA('creditcards', fx56UserAgent)
      );
    });

    it('always returns `false` for `addresses', () => {
      assert.isFalse(
        syncEngines.isEngineSupportedByUA('addresses', fx55UserAgent)
      );
      assert.isFalse(
        syncEngines.isEngineSupportedByUA('addresses', fx56UserAgent)
      );
    });
  });

  describe('addById', () => {
    it('adds a sync engine to the collection, if not already added', () => {
      assert.equal(syncEngines.length, 6);
      // tabs is already added and can't be re-added.
      syncEngines.addById('tabs');
      assert.equal(syncEngines.length, 6);

      syncEngines.addById('creditcards');
      assert.equal(syncEngines.length, 7);
      assert.equal(syncEngines.get('creditcards').id, 'creditcards');
    });
  });
});
