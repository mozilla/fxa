/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var chai = require('chai');
var fs = require('fs');
var MaxmindDbDownloader = require('../scripts/maxmind-db-downloader');

var assert = chai.assert;

describe('maxmind-db-downloader', function () {
  'use strict';
  var maxmindDbDownloader;

  beforeEach(function () {
    maxmindDbDownloader = new MaxmindDbDownloader();
  });

  describe('createTargetDir', function () {
    it('creates the specified directory', function () {
      var targetDirPath = maxmindDbDownloader.createTargetDir('test-db');
      assert.isTrue(fs.statSync(targetDirPath).isDirectory(), 'Directory was created');
      // cleanup, remove the created directory
      fs.rmdir(targetDirPath);
    });
  });

  describe('setUpDownloadList', function () {
    it('', function () {

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
