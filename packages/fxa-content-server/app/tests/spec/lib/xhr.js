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

      it('$.ajax does not stringify json if processData is false', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'ajax', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');
        var data = { foo: 'bar' };

        return xhr.ajax({
          url: '/fake_endpoint',
          method: 'POST',
          dataType: 'json',
          data: data,
          processData: false
        })
        .then(function (resp) {
          assert.equal(resp, 'mocked_response');
          assert.isTrue($.ajax.calledWith({
            url: '/fake_endpoint',
            method: 'POST',
            dataType: 'json',
            data: data,
            processData: false,
            contentType: 'application/json',
            accepts: { json: 'application/json' }
          }));
        });
      });
    });

    describe('get', function () {
      it('calls $.get, sets the default dataType to `json`', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'ajax', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.get('/fake_endpoint')
          .then(function (resp) {
            assert.equal(resp, 'mocked_response');

            assert.isTrue($.ajax.calledWith({
              url: '/fake_endpoint',
              method: 'GET',
              dataType: 'json',
              data: undefined,
              success: undefined,
              contentType: 'application/json',
              accepts: { json: 'application/json' }
            }));
          });
      });

      it('calls $.get with no changes if dataType is set', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'ajax', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.get('/fake_endpoint', { key: 'value' }, null, 'text')
          .then(function (resp) {
            assert.equal(resp, 'mocked_response');
            assert.isTrue($.ajax.calledWith({
              url: '/fake_endpoint',
              method: 'GET',
              data: { key: 'value' },
              success: null,
              dataType: 'text'
            }));
          });
      });
    });

    describe('post', function () {
      it('calls $.post, sets the default dataType to `json`', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'ajax', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.post('/fake_endpoint', { foo: 'bar' })
          .then(function (resp) {
            assert.equal(resp, 'mocked_response');
            assert.isTrue($.ajax.calledWith({
              url: '/fake_endpoint',
              method: 'POST',
              dataType: 'json',
              data: JSON.stringify({ foo: 'bar' }),
              success: undefined,
              contentType: 'application/json',
              accepts: { json: 'application/json' }
            }));
          });
      });

      it('calls $.post with no changes if dataType is set', function () {
        var deferred = $.Deferred();

        sinon.stub($, 'ajax', function () {
          return deferred.promise();
        });

        deferred.resolve('mocked_response');

        return xhr.post('/fake_endpoint', { key: 'value' }, null, 'text')
          .then(function (resp) {
            assert.equal(resp, 'mocked_response');
            assert.isTrue($.ajax.calledWith({
              url: '/fake_endpoint',
              method: 'POST',
              data: { key: 'value' },
              success: null,
              dataType: 'text'
            }));
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


