/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var test = require('tap').test
var sinon = require('sinon')

test(
  'bufferize module',
  function (t) {
    t.plan(38)

    var bufferize = require('../../lib/bufferize')
    t.type(bufferize, 'object', 'bufferize exports object')
    t.equal(Object.keys(bufferize).length, 3, 'bufferize exports three functions')
    t.type(bufferize.unbuffer, 'function', 'bufferize exports unbuffer function')
    t.type(bufferize.bufferize, 'function', 'bufferize exports bufferize function')
    t.type(bufferize.bufferizeRequest, 'function', 'bufferize exports bufferizeRequest function')

    var result = bufferize.unbuffer({
      foo: new Buffer('42', 'hex'),
      bar: '42'
    })
    t.type(result, 'object', 'bufferize.unbuffer returned object')
    t.equal(Object.keys(result).length, 2, 'bufferize.unbuffer returned correct number of properties')
    t.equal(result.foo, '42', 'bufferize.unbuffer unbuffered correctly')
    t.equal(result.foo, '42', 'bufferize.unbuffer preserved string')

    result = bufferize.bufferize({
      foo: '00',
      bar: 'ffff',
      baz: '000',
      qux: 'fg',
      wibble: '00'
    }, [ 'wibble' ])

    t.type(result, 'object', 'bufferize.bufferize returned object')
    t.equal(Object.keys(result).length, 5, 'bufferize.bufferize returned correct number of properties')
    t.ok(Buffer.isBuffer(result.foo), 'bufferize.bufferize returned buffer for 00')
    t.equal(result.foo.length, 1, 'bufferize.bufferize returned correct length for 00')
    t.equal(result.foo[0], 0x00, 'bufferize.bufferize returned correct data for 00')
    t.ok(Buffer.isBuffer(result.bar), 'bufferize.bufferize returned buffer for ffff')
    t.equal(result.bar.length, 2, 'bufferize.bufferize returned correct length for ffff')
    t.equal(result.bar[0], 0xff, 'bufferize.bufferize returned correct first byte for ffff')
    t.equal(result.bar[1], 0xff, 'bufferize.bufferize returned correct second byte for ffff')
    t.equal(result.baz, '000', 'bufferize.bufferize preserved string 000')
    t.equal(result.qux, 'fg', 'bufferize.bufferize preserved string fg')
    t.equal(result.wibble, '00', 'bufferize.bufferize ignored nominated property')

    var request = {
      body: {
        no: 'badf00d',
        nope: 'f00d',
        yes: 'f00d'
      },
      params: {
        y: 'deadbeef',
        n: 'deadbeef'
      }
    }
    var next = sinon.spy()
    bufferize.bufferizeRequest([ 'nope', 'n' ], request, {}, next)

    t.equal(Object.keys(request).length, 2, 'bufferize.bufferizeRequest did not mess with request')

    t.equal(Object.keys(request.body).length, 3, 'bufferize.bufferizeRequest did not mess with request.body')
    t.equal(request.body.no, 'badf00d', 'bufferize.bufferizeRequest preserved body string badf00d')
    t.equal(request.body.nope, 'f00d', 'bufferize.bufferizeRequest ignored nominated body property')
    t.ok(Buffer.isBuffer(request.body.yes), 'bufferize.bufferizeRequest returned buffer for body f00d')
    t.equal(request.body.yes.length, 2, 'bufferize.bufferizeRequest returned correct length for body f00d')
    t.equal(request.body.yes[0], 0xf0, 'bufferize.bufferizeRequest returned correct first byte for body f00d')
    t.equal(request.body.yes[1], 0x0d, 'bufferize.bufferizeRequest returned correct second byte for body f00d')

    t.equal(Object.keys(request.params).length, 2, 'bufferize.bufferizeRequest did not mess with request.params')
    t.ok(Buffer.isBuffer(request.params.y), 'bufferize.bufferizeRequest returned buffer for params deadbeef')
    t.equal(request.params.y.length, 4, 'bufferize.bufferizeRequest returned correct length for params deadbeef')
    t.equal(request.params.y[0], 0xde, 'bufferize.bufferizeRequest returned correct first byte for params deadbeef')
    t.equal(request.params.y[1], 0xad, 'bufferize.bufferizeRequest returned correct second byte for params deadbeef')
    t.equal(request.params.y[2], 0xbe, 'bufferize.bufferizeRequest returned correct third byte for params deadbeef')
    t.equal(request.params.y[3], 0xef, 'bufferize.bufferizeRequest returned correct fourth byte for params deadbeef')
    t.equal(request.params.n, 'deadbeef', 'bufferize.bufferizeRequest ignored nominated params property')
    t.ok(next.calledOnce, 'bufferize.bufferizeRequest called next')

    t.end()
  }
)
