/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
//suppress stdout when running unit tests
process.env.NODE_ENV = 'test';

var async = require('async');
var chai = require('chai');
var fs = require('fs');
var MaxmindDbDownloader = require('../scripts/maxmind-db-downloader');
var path = require('path');
var sinon = require('sinon');

var assert = chai.assert;

describe('maxmind-db-downloader', function () {
  'use strict';
  var maxmindDbDownloader;
  var targetDirPath;
  var remainingDownloads;

  beforeEach(function () {
    maxmindDbDownloader = new MaxmindDbDownloader();
  });

  afterEach(function () {
    remainingDownloads = null;
    // cleanup, remove the created directory
    if (targetDirPath !== '' && fs.statSync(targetDirPath).isDirectory()) {
      fs.rmdir(targetDirPath);
    }
    targetDirPath = '';
  });

  describe('createTargetDir', function () {
    it('creates the specified directory', function () {
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      assert.equal(targetDirPath, path.join(__dirname, '..', 'test-db'), 'Directory path is correct');
      assert.isTrue(fs.statSync(targetDirPath).isDirectory(), 'Directory was created');
    });
  });

  describe('setupDownloadList', function () {
    it('sets up the download list from sources.json', function () {
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      remainingDownloads = maxmindDbDownloader.setupDownloadList('sources.json', targetDirPath);
      assert.isArray(remainingDownloads, 'Array returned');
      assert.lengthOf(remainingDownloads, 1, 'Array has one entry');
      assert.isFunction(remainingDownloads[0], 'Download function was queued');
    });
  });

  describe('setupAutoUpdate', function () {
    it('', function () {

    });
  });

  describe('startDownload', function () {
    it('calls async with the proper data', function () {
      sinon.stub(async, 'parallel', function () {});
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      remainingDownloads = maxmindDbDownloader.setupDownloadList('sources.json', targetDirPath);
      maxmindDbDownloader.startDownload(remainingDownloads);
      assert.isTrue(async.parallel.called, 'Async was called');
      assert.isTrue(async.parallel.calledWith(remainingDownloads), 'Async was called with the array');
    });
  });

});
