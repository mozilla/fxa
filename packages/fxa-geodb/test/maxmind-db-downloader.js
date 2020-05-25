/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
//suppress stdout when running unit tests
process.env.NODE_ENV = 'test';

var chai = require('chai');
var fs = require('fs');
var MaxmindDbDownloader = require('../lib/maxmind-db-downloader');
var path = require('path');
var Promise = require('bluebird');
var rimraf = require('rimraf');
var sinon = require('sinon');
var assert = chai.assert;

describe('maxmind-db-downloader', function () {
  'use strict';
  var maxmindDbDownloader;
  var targetDirPath;
  var downloadPromiseFunctions;
  var expectedTargetDirPath = path.join(__dirname, '..', 'test-db');

  beforeEach(function () {
    maxmindDbDownloader = new MaxmindDbDownloader();
  });

  afterEach(function () {
    downloadPromiseFunctions = null;
    // cleanup, remove the created directory
    if (fs.statSync(expectedTargetDirPath).isDirectory()) {
      rimraf.sync(expectedTargetDirPath);
    }
    targetDirPath = '';
    maxmindDbDownloader.stop();
  });

  describe('createTargetDir', function () {
    it('creates the specified directory', function () {
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      assert.equal(
        targetDirPath,
        expectedTargetDirPath,
        'Directory path is correct'
      );
      assert.isTrue(
        fs.statSync(targetDirPath).isDirectory(),
        'Directory was created'
      );
    });

    it('does nothing when directory already exists', function () {
      // when mkdirp is called on existing directory, it
      // does nothing, and returns null
      maxmindDbDownloader.createTargetDir('test-db');
      var duplicateTargetDirPath = maxmindDbDownloader.createTargetDir(
        'test-db'
      );
      assert.isNull(duplicateTargetDirPath, 'Nothing was created');
      assert.isTrue(
        fs.statSync(expectedTargetDirPath).isDirectory(),
        'Directory still exists'
      );
    });
  });

  describe('setupDownloadList', function () {
    it('sets up the download list from sources.json', function () {
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      downloadPromiseFunctions = maxmindDbDownloader.setupDownloadList(
        path.join('..', 'sources.json'),
        targetDirPath
      );
      assert.isArray(downloadPromiseFunctions, 'Array returned');
      assert.lengthOf(downloadPromiseFunctions, 1, 'Array has one entry');
      assert.isFunction(
        downloadPromiseFunctions[0],
        'downloadPromiseFunctions was queued with a function'
      );
    });
  });

  describe('downloadAll', function () {
    it('calls Promise.all with a promise array', function () {
      sinon.spy(Promise, 'all');
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      downloadPromiseFunctions = maxmindDbDownloader.setupDownloadList(
        path.join('..', 'sources.json'),
        targetDirPath
      );
      maxmindDbDownloader.downloadAll(downloadPromiseFunctions);
      assert.isTrue(Promise.all.called, 'Promise.all was called');
      assert.isArray(Promise.all.args[0][0], 'Array returned');
    });
  });

  describe('setupAutoUpdate', function () {
    it('auto update calls downloadAll correctly', function (done) {
      // test takes slightly over 5 seconds, set
      // timeout to 6 seconds to ensure that we don't
      // timeout prematurely.
      this.timeout(6000);
      sinon.stub(maxmindDbDownloader, 'downloadAll').callsFake(function () {});
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      downloadPromiseFunctions = maxmindDbDownloader.setupDownloadList(
        path.join('..', 'sources.json'),
        targetDirPath
      );
      // set up auto update for every second of every minute
      // (i.e) 10:00:01, 10:00:02, 10:00:03
      maxmindDbDownloader.setupAutoUpdate(
        '* * * * * *',
        downloadPromiseFunctions
      );
      // now after 5 seconds, downloadAll must have been called
      // at least 4 times (accounting for lag - setTimeout)
      setTimeout(function () {
        assert.isTrue(
          maxmindDbDownloader.downloadAll.called,
          'downloadAll was called'
        );
        assert.isTrue(
          maxmindDbDownloader.downloadAll.calledWith(downloadPromiseFunctions),
          'downloadAll was called with the array'
        );
        assert.isTrue(
          maxmindDbDownloader.downloadAll.callCount >= 4,
          'downloadAll was called at least 4 times'
        );
        done();
      }, 5000);
    });
  });
});
