var test = require('tap').test
var cp = require('child_process')
var crypto = require('crypto')
var config = require('../../config').root()
var Client = require('../../client')

process.env.DEV_VERIFIED = 'true'
var server = null

function fail() { throw new Error() }

function main() {

	test(
		'/certificate/sign inputs',
		function (t) {
			var email = crypto.randomBytes(10).toString('hex') + '@example.com'
			var password = '123456'
			var client = null
			Client.create('http://127.0.0.1:9000', email, password)
				.then(
					function (c) {
						client = c
						// string as publicKey
						return client.sign("tada", 1000)
					}
				)
				.then(
					fail,
					function (err) {
						t.equal(err.code, 400, 'string as publicKey')
						// empty object as publicKey
						return client.sign({}, 1000)
					}
				)
				.then(
					fail,
					function (err) {
						t.equal(err.code, 400, 'empty object as publicKey')
						// invalid publicKey argument
						return client.sign({ algorithm: 'RS', n: 'x', e: 'y', invalid: true }, 1000)
					}
				)
				.then(
					fail,
					function (err) {
						t.equal(err.code, 400, 'invalid publicKey argument')
						// undefined duration
						return client.sign({ algorithm: 'RS', n: 'x', e: 'y' }, undefined)
					}
				)
				.then(
					fail,
					function (err) {
						t.equal(err.code, 400, 'undefined duration')
						// missing publicKey arguments (e)
						return client.sign({ algorithm: 'RS', n: 'x' }, 1000)
					}
				)
				.then(
					fail,
					function (err) {
						t.equal(err.code, 400, 'missing publicKey arguments (e)')
						// invalid algorithm
						return client.sign({ algorithm: 'NSA' }, 1000)
					}
				)
				.then(
					fail,
					function (err) {
						t.equal(err.code, 400, 'invalid algorithm')
					}
				)
				.done(
					function () {
						t.end()
					},
					function (err) {
						t.fail('sign should fail')
						t.end()
					}
				)
		}
	)

 test(
    'teardown',
    function (t) {
      if (server) server.kill('SIGINT')
      t.end()
    }
  )
}

function startServer() {
  var server = cp.spawn(
    'node',
    ['../../bin/key_server.js'],
    {
      cwd: __dirname
    }
  )

  server.stdout.on('data', process.stdout.write.bind(process.stdout))
  server.stderr.on('data', process.stderr.write.bind(process.stderr))
  return server
}

function waitLoop() {
  Client.Api.heartbeat(config.public_url)
    .done(
      main,
      function (err) {
        if (err.errno !== 'ECONNREFUSED') {
            console.log("ERROR: unexpected result from " + config.public_url);
            console.log(err);
            return err;
        }
        if (!server) {
          server = startServer()
        }
        console.log('waiting...')
        setTimeout(waitLoop, 100)
      }
    )
}

waitLoop()
