/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Cocktail from 'lib/cocktail';
import sinon from 'sinon';
import Mixin from 'views/mixins/cwts-on-signup-password';
import { Model, View } from 'backbone';

const SignupPasswordView = View.extend({});

Cocktail.mixin(SignupPasswordView, Mixin);

describe('views/mixins/cwts-on-signup-password', () => {
  let account;
  let context;
  let view;

  beforeEach(() => {
    account = new Model({
      email: 'foomail',
    });
    context = new Model();
    sinon.stub(context, 'set');
    view = new SignupPasswordView({});
    view.getAccount = () => account;
    view.relier = new Model({
      service: 'sync',
    });
    view.notifier = {
      trigger: sinon.spy(),
    };
    view.logViewEvent = sinon.spy();
  });

  describe('setInitialContext', () => {
    it('sets context', () => {
      sinon.stub(view, '_getOfferedEngines').callsFake(() => ['foo', 'bar']);

      view.setInitialContext(context);

      assert.isTrue(
        context.set.calledOnceWith({
          engines: ['foo', 'bar'],
        })
      );
    });
  });

  describe('beforeSubmit', () => {
    beforeEach(() => {
      sinon.stub(view, '_trackDeclinedEngineIds');
    });

    it('updates account, tracks declined engines, notifies', () => {
      sinon
        .stub(view, '_getOfferedEngineIds')
        .callsFake(() => ['foo', 'bar', 'baz']);
      sinon.stub(view, '_getDeclinedEngineIds').callsFake(() => ['foo', 'baz']);
      sinon.stub(view, 'enableSync');

      view.beforeSubmit();

      assert.deepEqual(account.get('declinedSyncEngines'), ['foo', 'baz']);
      assert.deepEqual(account.get('offeredSyncEngines'), [
        'foo',
        'bar',
        'baz',
      ]);
      assert.isTrue(
        view._trackDeclinedEngineIds.calledOnceWith(['foo', 'baz'])
      );
      assert.isTrue(
        view.notifier.trigger.calledOnceWith('set-sync-engines', ['bar'])
      );

      assert.isTrue(view.enableSync.calledOnce);
    });

    it('deselects all engines, notify that sync is disabled', () => {
      sinon.stub(view, '_getOfferedEngineIds').returns(['foo', 'bar', 'baz']);
      sinon.stub(view, '_getDeclinedEngineIds').returns(['foo', 'bar', 'baz']);
      sinon.stub(view, 'disableSync');

      view.beforeSubmit();

      assert.deepEqual(account.get('declinedSyncEngines'), [
        'foo',
        'bar',
        'baz',
      ]);
      assert.deepEqual(account.get('offeredSyncEngines'), [
        'foo',
        'bar',
        'baz',
      ]);
      assert.isTrue(
        view._trackDeclinedEngineIds.calledOnceWith(['foo', 'bar', 'baz'])
      );
      assert.isTrue(
        view.notifier.trigger.calledOnceWith('set-sync-engines', [])
      );

      assert.isTrue(view.disableSync.calledOnce);
    });
  });
});
