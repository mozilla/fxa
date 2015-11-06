/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Able = require('lib/able');
  var chai = require('chai');
  var Experiment = require('lib/experiments/base');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var sinon = require('sinon');
  var Storage = require('lib/storage');
  var User = require('models/user');
  var WindowMock = require('../../../mocks/window');

  var able;
  var assert = chai.assert;
  var experiment;
  var expOptions;
  var metrics;
  var notifier;
  var storage;
  var user;
  var UUID = 'a mock uuid';
  var windowMock;

  describe('lib/experiments/base', function () {
    beforeEach(function () {
      able = new Able();
      sinon.stub(able, 'choose', function () {
        return 'treatment';
      });
      metrics = new Metrics();
      notifier = new Notifier();
      storage = new Storage();
      user = new User({
        uniqueUserId: UUID
      });
      windowMock = new WindowMock();

      experiment = new Experiment();
      expOptions = {
        able: able,
        metrics: metrics,
        notifier: notifier,
        storage: storage,
        user: user,
        window: windowMock
      };
      experiment.initialize('baseExperiment', expOptions);
    });

    describe('initialize', function () {
      it('requires options', function () {
        var experiment = new Experiment();
        experiment.initialize();
        assert.isFalse(experiment._initialized);
      });

      it('requires able to choose a group type', function () {
        able.choose.restore();
        sinon.stub(able, 'choose', function () {
          return undefined;
        });
        experiment.initialize('baseExperiment', expOptions);
        assert.isFalse(experiment._initialized);
        assert.equal(experiment._name, 'baseExperiment');
        assert.isNull(experiment._groupType);
      });

      it('initializes treatment', function () {
        assert.isTrue(experiment._initialized);
        assert.equal(experiment._groupType, 'treatment');
        assert.equal(experiment._loggingNamespace, 'experiment.treatment.baseExperiment.');
        assert.equal(experiment._storageNamespace, 'experiment.baseExperiment');
      });


      it('initializes control', function () {
        able.choose.restore();
        sinon.stub(able, 'choose', function () {
          return 'control';
        });
        experiment.initialize('baseExperiment', expOptions);

        assert.isTrue(experiment._initialized);
        assert.equal(experiment._groupType, 'control');
        assert.equal(experiment._loggingNamespace, 'experiment.control.baseExperiment.');
        assert.equal(experiment._storageNamespace, 'experiment.baseExperiment');
      });
    });

    describe('isInGroup', function () {
      it('returns if part treatment', function () {
        assert.isTrue(experiment.isInGroup('treatment'));
        assert.isFalse(experiment.isInGroup('control'));
        assert.isFalse(experiment.isInGroup('randomGroup'));
      });

      it('returns if part control', function () {
        able.choose.restore();
        sinon.stub(able, 'choose', function () {
          return 'control';
        });
        experiment.initialize('baseExperiment', expOptions);
        assert.isTrue(experiment.isInGroup('control'));
        assert.isFalse(experiment.isInGroup('treatment'));
        assert.isFalse(experiment.isInGroup('randomGroup'));
      });

      it('returns if able is undefined', function () {
        able.choose.restore();
        sinon.stub(able, 'choose', function () {
          return undefined;
        });
        experiment.initialize('baseExperiment', expOptions);
        assert.isFalse(experiment.isInGroup('control'));
        assert.isFalse(experiment.isInGroup('treatment'));
        assert.isFalse(experiment.isInGroup('randomGroup'));
      });
    });

    describe('saveState', function () {
      it('saves state', function () {
        experiment.saveState('clicked');
        assert.isTrue(JSON.parse(storage.get(experiment._storageNamespace)).clicked);
      });

      it('requires state', function () {
        assert.isFalse(experiment.saveState());
      });
    });

    describe('hasState', function () {
      it('returns if part treatment', function () {
        storage.set(experiment._storageNamespace, JSON.stringify({
          clicked: true
        }));
        assert.isTrue(experiment.hasState('clicked'));
      });

      it('returns null if no state', function () {
        assert.isNull(experiment.hasState());
        assert.isFalse(experiment.hasState('randomState'));
      });
    });

    describe('delegateNotifications', function () {
      it('stops if no notifications', function () {
        experiment.notifications = null;
        assert.isFalse(experiment.delegateNotifications());
      });

      it('sets notifications', function (done) {
        sinon.spy(experiment, 'delegateNotifications');
        sinon.spy(experiment, 'saveState');
        experiment.notifications = {
          'one': Experiment.createSaveStateDelegate('thing'),
          'two': 'createSaveStateDelegate',
          'three': function () {
            assert.ok(true, 'stringMethod called');
            done();
          }
        };
        assert.isFalse(experiment.delegateNotifications.called);
        experiment.initialize('baseExperiment', expOptions);
        assert.isTrue(experiment.delegateNotifications.called, 'delegate called');

        assert.isTrue(experiment.saveState.calledOnce, 'enrolled');
        notifier.trigger('one');
        assert.isTrue(experiment.saveState.calledTwice, 'notification');

        notifier.trigger('two');
        notifier.trigger('three');
      });
    });
  });
});
