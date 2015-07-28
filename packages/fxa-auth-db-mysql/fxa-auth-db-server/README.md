Firefox Accounts DB Server
==========================

[![Build Status](https://travis-ci.org/mozilla/fxa-auth-db-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-auth-db-server)

## Usage

If you would like to run an FxA Auth DB Server, then you probably want to look at the
[FxA Auth DB MySql](http://github.com/mozilla/fxa-auth-db-mysql/) repo (for production usage) or the
[FxA Auth DB Mem](http://github.com/mozilla/fxa-auth-db-mem/) repo (for testing purposes). Each of these repos
implement a storage backend and will install this repo when you run `npm install` since they each import the server
from here.

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
[database/storage API](https://github.com/mozilla/fxa-auth-db-server/blob/master/docs/DB_API.md), this document will be
useful.

## License

MPL 2.0
