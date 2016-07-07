/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const chai = require('chai');
var fs = require('fs');
const maxmindDbDownloader = require('../scripts/maxmind-db-downloader');

const assert = chai.assert;

describe('maxmind-db-downloader', function () {
  'use strict';

  describe('createTargetDir', function () {
    it('creates the specified directory', function () {
      console.log(maxmindDbDownloader);
      maxmindDbDownloader.createTargetDir('test-db');
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
