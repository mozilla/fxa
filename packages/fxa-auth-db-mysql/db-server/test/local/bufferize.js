/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');

describe('bufferize', () => {
  it('bufferize module', () => {
    var bufferize = require('../../lib/bufferize');
    assert.isObject(bufferize);
    assert.lengthOf(Object.keys(bufferize), 4);
    assert.isFunction(bufferize.unbuffer);
    assert.isFunction(bufferize.bufferize);
    assert.isFunction(bufferize.bufferizeRequest);
    assert.isFunction(bufferize.hexToUtf8);

    var result = bufferize.unbuffer({
      foo: Buffer.from('42', 'hex'),
      bar: '42',
    });
    assert.isObject(result);
    assert.lengthOf(Object.keys(result), 2);
    assert.equal(result.foo, '42', 'bufferize.unbuffer unbuffered correctly');
    assert.equal(result.foo, '42', 'bufferize.unbuffer preserved string');

    result = bufferize.bufferize({
      foo: '00',
      bar: 'ffff',
    });

    assert.isObject(result);
    assert.lengthOf(Object.keys(result), 2);
    assert(
      Buffer.isBuffer(result.foo),
      'bufferize.bufferize returned buffer for 00'
    );
    assert.lengthOf(result.foo, 1);
    assert.equal(
      result.foo[0],
      0x00,
      'bufferize.bufferize returned correct data for 00'
    );
    assert(
      Buffer.isBuffer(result.bar),
      'bufferize.bufferize returned buffer for ffff'
    );
    assert.lengthOf(result.bar, 2);
    assert.equal(
      result.bar[0],
      0xff,
      'bufferize.bufferize returned correct first byte for ffff'
    );
    assert.equal(
      result.bar[1],
      0xff,
      'bufferize.bufferize returned correct second byte for ffff'
    );

    result = bufferize.bufferize(
      {
        foo: '00',
        bar: 'ffff',
        wibble: '00',
      },
      new Set(['foo', 'bar'])
    );

    assert.isObject(result);
    assert.lengthOf(Object.keys(result), 3);
    assert(
      Buffer.isBuffer(result.foo),
      'bufferize.bufferize returned buffer for 00'
    );
    assert.lengthOf(result.foo, 1);
    assert.equal(
      result.foo[0],
      0x00,
      'bufferize.bufferize returned correct data for 00'
    );
    assert(
      Buffer.isBuffer(result.bar),
      'bufferize.bufferize returned buffer for ffff'
    );
    assert.lengthOf(result.bar, 2);
    assert.equal(
      result.bar[0],
      0xff,
      'bufferize.bufferize returned correct first byte for ffff'
    );
    assert.equal(
      result.bar[1],
      0xff,
      'bufferize.bufferize returned correct second byte for ffff'
    );
    assert.equal(
      result.wibble,
      '00',
      'bufferize.bufferize ignored property not in match list'
    );

    result = bufferize.bufferize(
      {
        foo: '00',
        bar: null,
        baz: undefined,
      },
      new Set(['foo', 'bar', 'baz'])
    );

    assert.isObject(result);
    assert.lengthOf(Object.keys(result), 3);
    assert(
      Buffer.isBuffer(result.foo),
      'bufferize.bufferize returned buffer for 00'
    );
    assert.lengthOf(result.foo, 1);
    assert.equal(
      result.foo[0],
      0x00,
      'bufferize.bufferize returned correct data for 00'
    );
    assert.isNull(result.bar);
    assert.isUndefined(result.baz);

    var request = {
      body: {
        no: 'badf00d',
        nope: 'f00d',
        yes: 'f00d',
      },
      params: {
        y: 'deadbeef',
        n: 'deadbeef',
      },
    };
    var next = sinon.spy();
    var keys = new Set(['yes', 'y']);
    bufferize.bufferizeRequest(keys, request, {}, next);

    assert.lengthOf(Object.keys(request), 2);

    assert.lengthOf(Object.keys(request.body), 3);
    assert.equal(
      request.body.no,
      'badf00d',
      'bufferize.bufferizeRequest preserved body string badf00d'
    );
    assert.equal(
      request.body.nope,
      'f00d',
      'bufferize.bufferizeRequest ignored body property not in matchlist'
    );
    assert(
      Buffer.isBuffer(request.body.yes),
      'bufferize.bufferizeRequest returned buffer for body f00d'
    );
    assert.lengthOf(request.body.yes, 2);
    assert.equal(
      request.body.yes[0],
      0xf0,
      'bufferize.bufferizeRequest returned correct first byte for body f00d'
    );
    assert.equal(
      request.body.yes[1],
      0x0d,
      'bufferize.bufferizeRequest returned correct second byte for body f00d'
    );

    assert.lengthOf(Object.keys(request.params), 2);
    assert(
      Buffer.isBuffer(request.params.y),
      'bufferize.bufferizeRequest returned buffer for params deadbeef'
    );
    assert.lengthOf(request.params.y, 4);
    assert.equal(
      request.params.y[0],
      0xde,
      'bufferize.bufferizeRequest returned correct first byte for params deadbeef'
    );
    assert.equal(
      request.params.y[1],
      0xad,
      'bufferize.bufferizeRequest returned correct second byte for params deadbeef'
    );
    assert.equal(
      request.params.y[2],
      0xbe,
      'bufferize.bufferizeRequest returned correct third byte for params deadbeef'
    );
    assert.equal(
      request.params.y[3],
      0xef,
      'bufferize.bufferizeRequest returned correct fourth byte for params deadbeef'
    );
    assert.equal(
      request.params.n,
      'deadbeef',
      'bufferize.bufferizeRequest ignored params not in matchlist'
    );
    assert(next.calledOnce, 'bufferize.bufferizeRequest called next');
    assert.lengthOf(next.getCall(0).args, 0);

    request = {
      body: {
        buf: 'invalid',
      },
    };
    next = sinon.spy();
    bufferize.bufferizeRequest(null, request, {}, next);

    assert.lengthOf(Object.keys(request), 1);
    assert.lengthOf(Object.keys(request.body), 1);
    assert.equal(
      request.body.buf,
      'invalid',
      'bufferize.bufferizeRequest did not overwrite invalid field in body'
    );
    assert(next.calledOnce, 'bufferize.bufferizeRequest called next');
    assert.lengthOf(next.getCall(0).args, 1);
    assert.equal(
      next.getCall(0).args[0].statusCode,
      400,
      'bufferize.bufferizeRequest called next with a 400 error'
    );
  });
});
