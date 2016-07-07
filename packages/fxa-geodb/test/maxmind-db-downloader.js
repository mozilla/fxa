/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
//suppress stdout when running unit tests
process.env.NODE_ENV = 'test';

var chai = require('chai');
var fs = require('fs');
var MaxmindDbDownloader = require('../scripts/maxmind-db-downloader');
var path = require('path');

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
    targetDirPath = '';
    remainingDownloads = null;
  });

  describe('createTargetDir', function () {
    it('creates the specified directory', function () {
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      assert.equal(targetDirPath, path.join(__dirname, '..', 'test-db'), 'Directory path is correct');
      assert.isTrue(fs.statSync(targetDirPath).isDirectory(), 'Directory was created');
      // cleanup, remove the created directory
      fs.rmdir(targetDirPath);
    });
  });

  describe('setupDownloadList', function () {
    it('sets up the download list from sources.json', function () {
      targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      remainingDownloads = maxmindDbDownloader.setupDownloadList('sources.json', targetDirPath);
      assert.isArray(remainingDownloads, 'Array returned');
      assert.lengthOf(remainingDownloads, 1, 'Array has one entry');
    });
  });

  describe('setUpAutoUpdate', function () {
    it('', function () {

    });
  });

  describe('createTargetDir', function () {
    it('', function () {

    });
  });

  describe('startDownload', function () {
    it('', function () {

    });
  });

});
