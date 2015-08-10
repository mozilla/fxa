Firefox Accounts DB Server
==========================

For context, see the
[`fxa-auth-db-mysql` repo](http://github.com/mozilla/fxa-auth-db-mysql),
which contains a MySQL backend
(for production)
and a memory-store backend
(for testing).

This package
is actually a sub-directory
of that repository.

## Usage

```js
// Require the dbServer. This includes dbServer.createServer() and the dbServer.errors object.
var dbServer = require('fxa-auth-db-server')

// require the database engine
var Store = require('./db.js')

// create a DB instance and pass a logger and the dbServer.errors object
var db = new Store(console, dbServer.errors)

// create the server and pass it the storage instance
var server = dbServer.createServer(db)

server.listen(8080, 'localhost', function() {
  console.log('Server is listening')
})

// this will be called at the end of each failed request
server.on('error', function (err) {
  console.error('Error when starting the server:', err)
})

// this will be called at the end of each successful request
server.on(
  'success',
  function (data) {
    console.log('+ %s %s took %dms', data.method, data.url, data.t)
  }
)

// this will be called at the end of each failed request
server.on(
  'failure',
  function (data) {
    console.warn('- %s %s failed with %d', data.method, data.url, data.err.code)
  }
)

// this will be called every 15s
server.on(
  'mem',
  function (stats) {
    console.log('Memory stats:', stats)
  }
)
```

## DB API

If you would like to implement a
[database/storage API](https://github.com/mozilla/fxa-auth-db-mysql/blob/master/docs/API.md), this document will be
useful.

## Server API

If you want to know more
about the endpoints
implemented by this server,
read the
[server API documentation](docs/API.md).

## License

MPL 2.0
