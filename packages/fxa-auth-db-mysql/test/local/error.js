require('ass')
var test = require('../ptaptest')

test(
  'bufferize module',
  function (t) {
    t.plan(22);
    var error = require('../../error')
    t.type(error, 'function', 'error module returns a function')

    var duplicate = error.duplicate()
    t.type(duplicate, 'object', 'duplicate returns an object')
    t.ok(duplicate instanceof error, 'is an instance of error')
    t.equals(duplicate.code, 409)
    t.equals(duplicate.errno, 101)
    t.equals(duplicate.message, 'Record already exists')
    t.equals(duplicate.error, 'Conflict')
    t.equals(duplicate.toString(), 'Error: Record already exists')

    var notFound = error.notFound()
    t.type(notFound, 'object', 'notFound returns an object')
    t.ok(notFound instanceof error, 'is an instance of error')
    t.equals(notFound.code, 404)
    t.equals(notFound.errno, 116)
    t.equals(notFound.message, 'Not Found')
    t.equals(notFound.error, 'Not Found')
    t.equals(notFound.toString(), 'Error: Not Found')

    var err = new Error('Something broke.')
    err.code = 'ER_QUERY_INTERRUPTED'
    err.errno = 1317
    var wrap = error.wrap(err)
    t.type(wrap, 'object', 'wrap returns an object')
    t.ok(wrap instanceof error, 'is an instance of error')
    t.equals(wrap.code, 500)
    t.equals(wrap.errno, 1317)
    t.equals(wrap.message, 'ER_QUERY_INTERRUPTED')
    t.equals(wrap.error, 'Internal Server Error')
    t.equals(wrap.toString(), 'Error: ER_QUERY_INTERRUPTED')

    t.end()
  }
)
