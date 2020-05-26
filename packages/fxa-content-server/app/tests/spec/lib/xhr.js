/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import _ from 'underscore';
import { assert } from 'chai';
import sinon from 'sinon';
import Xhr from 'lib/xhr';

let xhr;

beforeEach(() => {
  xhr = Object.create(Xhr);
});

afterEach(() => {
  const possiblyOverridden = ['ajax', 'get', 'post', 'getJSON'];
  _.each(possiblyOverridden, function (funcNameToRestore) {
    if ($[funcNameToRestore].restore) {
      $[funcNameToRestore].restore();
    }
  });
});

describe('lib/xhr', () => {
  describe('ajax', () => {
    it('calls $.ajax', () => {
      const deferred = $.Deferred();

      sinon.stub($, 'ajax').callsFake(() => {
        return deferred.promise();
      });

      deferred.resolve('mocked_response');

      return xhr
        .ajax({
          url: '/fake_endpoint',
        })
        .then(function (resp) {
          assert.equal(resp, 'mocked_response');
          assert.isTrue($.ajax.calledWith({ url: '/fake_endpoint' }));
        });
    });

    it('$.ajax does not stringify json if processData is false', () => {
      const deferred = $.Deferred();

      sinon.stub($, 'ajax').callsFake(() => {
        return deferred.promise();
      });

      deferred.resolve('mocked_response');
      const data = { foo: 'bar' };

      return xhr
        .ajax({
          data: data,
          dataType: 'json',
          method: 'POST',
          processData: false,
          url: '/fake_endpoint',
        })
        .then(function (resp) {
          assert.equal(resp, 'mocked_response');
          assert.isTrue(
            $.ajax.calledWith({
              accepts: { json: 'application/json' },
              contentType: 'application/json',
              data: data,
              dataType: 'json',
              method: 'POST',
              processData: false,
              url: '/fake_endpoint',
            })
          );
        });
    });

    it('correctly handles errors', () => {
      const data = { foo: 'bar' };
      const errResponse = {
        responseJSON: {
          ok: false,
        },
        status: 400,
      };

      const deferred = $.Deferred();
      sinon.stub($, 'ajax').callsFake(() => {
        return deferred.promise();
      });
      deferred.reject(errResponse);

      return xhr
        .ajax({
          data: data,
          dataType: 'json',
          method: 'POST',
          processData: false,
          url: '/error_endpoint',
        })
        .catch((jqXHR) => {
          // a .fail that throws followed by a .then(null, errback)
          // does not correctly propagate the error unless the
          // jQuery promise is converted to an internal promise
          assert.strictEqual(jqXHR, errResponse);
          throw jqXHR;
        })
        .then(null, (jqXHR) => {
          assert.strictEqual(jqXHR, errResponse);
        });
    });
  });

  describe('oauthAjax', () => {
    it('calls xhr.ajax with the appropriate options set', () => {
      sinon.stub(xhr, 'ajax').callsFake(() => {
        return Promise.resolve();
      });

      return xhr
        .oauthAjax({
          accessToken: 'token',
          data: { key: 'value' },
          headers: { ETag: 'why not?' },
          type: 'get',
          url: '/endpoint',
        })
        .then(() => {
          const ajaxOptions = xhr.ajax.args[0][0];

          assert.equal(ajaxOptions.url, '/endpoint');
          assert.equal(ajaxOptions.type, 'get');
          assert.equal(ajaxOptions.headers.Authorization, 'Bearer token');
          assert.equal(ajaxOptions.headers.Accept, 'application/json');
          assert.equal(ajaxOptions.headers.ETag, 'why not?');
          assert.equal(ajaxOptions.data.key, 'value');
        });
    });

    it('handles contentType: application/x-www-form-urlencoded', () => {
      sinon.stub(xhr, 'ajax').callsFake(() => Promise.resolve());

      return xhr
        .oauthAjax({
          accessToken: 'token',
          contentType: 'application/x-www-form-urlencoded',
          data: { key: 'value' },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
          type: 'post',
          url: '/endpoint',
        })
        .then(() => {
          assert.isTrue(
            xhr.ajax.calledOnceWith({
              contentType: 'application/x-www-form-urlencoded',
              data: { key: 'value' },
              dataType: 'json',
              headers: {
                Accept: 'application/json',
                Authorization: 'Bearer token',
                'X-Requested-With': 'XMLHttpRequest',
              },
              timeout: undefined,
              type: 'post',
              url: '/endpoint',
            })
          );
        });
    });

    it('handles Blob data', () => {
      if (typeof window.Blob !== 'undefined') {
        sinon.stub(xhr, 'ajax').callsFake(() => {
          return Promise.resolve();
        });

        return xhr
          .oauthAjax({
            accessToken: 'token',
            data: new Blob(),
            type: 'get',
            url: '/endpoint',
          })
          .then(() => {
            const ajaxOptions = xhr.ajax.args[0][0];
            assert.equal(ajaxOptions.processData, false);
          });
      }
    });
  });

  describe('get', () => {
    it('calls $.get, sets the default dataType to `json`', () => {
      const deferred = $.Deferred();

      sinon.stub($, 'ajax').callsFake(() => {
        return deferred.promise();
      });

      deferred.resolve('mocked_response');

      return xhr.get('/fake_endpoint').then(function (resp) {
        assert.equal(resp, 'mocked_response');

        assert.isTrue(
          $.ajax.calledWith({
            accepts: { json: 'application/json' },
            contentType: 'application/json',
            data: undefined,
            dataType: 'json',
            method: 'GET',
            success: undefined,
            url: '/fake_endpoint',
          })
        );
      });
    });

    it('calls $.get with no changes if dataType is set', () => {
      const deferred = $.Deferred();

      sinon.stub($, 'ajax').callsFake(() => {
        return deferred.promise();
      });

      deferred.resolve('mocked_response');

      return xhr
        .get('/fake_endpoint', { key: 'value' }, null, 'text')
        .then(function (resp) {
          assert.equal(resp, 'mocked_response');
          assert.isTrue(
            $.ajax.calledWith({
              data: { key: 'value' },
              dataType: 'text',
              method: 'GET',
              success: null,
              url: '/fake_endpoint',
            })
          );
        });
    });
  });

  describe('post', () => {
    it('calls $.post, sets the default dataType to `json`', () => {
      const deferred = $.Deferred();

      sinon.stub($, 'ajax').callsFake(() => {
        return deferred.promise();
      });

      deferred.resolve('mocked_response');

      return xhr.post('/fake_endpoint', { foo: 'bar' }).then(function (resp) {
        assert.equal(resp, 'mocked_response');
        assert.isTrue(
          $.ajax.calledWith({
            accepts: { json: 'application/json' },
            contentType: 'application/json',
            data: JSON.stringify({ foo: 'bar' }),
            dataType: 'json',
            method: 'POST',
            success: undefined,
            url: '/fake_endpoint',
          })
        );
      });
    });

    it('calls $.post with no changes if dataType is set', () => {
      const deferred = $.Deferred();

      sinon.stub($, 'ajax').callsFake(() => {
        return deferred.promise();
      });

      deferred.resolve('mocked_response');

      return xhr
        .post('/fake_endpoint', { key: 'value' }, null, 'text')
        .then(function (resp) {
          assert.equal(resp, 'mocked_response');
          assert.isTrue(
            $.ajax.calledWith({
              data: { key: 'value' },
              dataType: 'text',
              method: 'POST',
              success: null,
              url: '/fake_endpoint',
            })
          );
        });
    });
  });

  describe('getJSON', () => {
    it('calls $.getJSON', () => {
      const deferred = $.Deferred();

      sinon.stub($, 'getJSON').callsFake(() => {
        return deferred.promise();
      });

      deferred.resolve({ key: 'value' });

      return xhr.getJSON('/fake_endpoint').then(function (resp) {
        assert.deepEqual(resp, { key: 'value' });
        assert.isTrue($.getJSON.calledWith('/fake_endpoint'));
      });
    });

    it('correctly handles errors', () => {
      const errResponse = {
        responseJSON: {
          ok: false,
        },
        status: 400,
      };

      const deferred = $.Deferred();
      sinon.stub($, 'getJSON').callsFake(() => {
        return deferred.promise();
      });
      deferred.reject(errResponse);

      return (
        xhr
          .getJSON('/error_endpoint')
          // a .fail that throws followed by a .then(null, errback)
          // does not correctly propagate the error unless the
          // jQuery promise is converted to an internal promise
          .catch((jqXHR) => {
            assert.strictEqual(jqXHR, errResponse);
            throw jqXHR;
          })
          .then(null, (jqXHR) => {
            assert.strictEqual(jqXHR, errResponse);
          })
      );
    });
  });
});
