/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'jquery',
  'underscore',
  'lib/xhr'
],
function (chai, sinon, $, _, xhr, undefined) {
  var assert = chai.assert;

  afterEach(function () {
    var possiblyOverridden = ['ajax', 'get', 'post', 'getJSON'];
    _.each(possiblyOverridden, function (funcNameToRestore) {
      if ($[funcNameToRestore].restore) {
        $[funcNameToRestore].restore();
      }
    });
  });

  describe('lib/xhr', function () {
    describe('ajax', function () {
      it('calls $.ajax', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'ajax', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.ajax({
          url: '/fake_endpoint'
        })
        .then(function (resp) {
          assert.equal(resp, 'mocked_response');
          assert.isTrue($.ajax.calledWith({ url: '/fake_endpoint' }));
        });
      });
    });

    describe('get', function () {
      it('calls $.get, sets the default dataType to `json`', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'get', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.get('/fake_endpoint')
          .then(function (resp) {
            assert.equal(resp, 'mocked_response');
            assert.isTrue(
                $.get.calledWith('/fake_endpoint', undefined, undefined, 'json'));
          });
      });

      it('calls $.get with no changes if dataType is set', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'get', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.get('/fake_endpoint', { key: 'value' }, null, 'text')
          .then(function (resp) {
            assert.equal(resp, 'mocked_response');
            assert.isTrue(
                $.get.calledWith('/fake_endpoint', { key: 'value' }, null, 'text'));
          });
      });
    });

    describe('post', function () {
      it('calls $.post, sets the default dataType to `json`', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'post', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.post('/fake_endpoint')
          .then(function (resp) {
            assert.equal(resp, 'mocked_response');
            assert.isTrue(
                $.post.calledWith('/fake_endpoint', undefined, undefined, 'json'));
          });
      });

      it('calls $.post with no changes if dataType is set', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'post', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.post('/fake_endpoint', { key: 'value' }, null, 'text')
          .then(function (resp) {
            assert.equal(resp, 'mocked_response');
            assert.isTrue(
                $.post.calledWith('/fake_endpoint', { key: 'value' }, null, 'text'));
          });
      });
    });

    describe('getJSON', function () {
      it('calls $.getJSON', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'getJSON', function () {
          return deferred.promise();
        });

        deferred.resolve({ key: 'value' });

        return xhr.getJSON('/fake_endpoint')
          .then(function (resp) {
            assert.deepEqual(resp, { key: 'value' });
            assert.isTrue($.getJSON.calledWith('/fake_endpoint'));
          });
      });
    });
  });
});


