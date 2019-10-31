/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A helper class for safely making calls to a backend service over HTTP.
 *
 * The `createBackendServiceAPI` function lets you declaratively specify the routes to be
 * called on a remote HTTP service, in a style similar to Hapi's own route configuration
 * options. It produces an object with friendly async methods that, when called, will take
 * care of the following important implementation details for you:
 *
 *   - using a connection pool with sensible configuration
 *   - guarding against unexpected data in input parameters
 *   - guarding against unexpected data in responses
 *   - throwing appropriate errors on service failure
 *   - logging appropriate diagnostics
 *   - (optionally) collecting performance metrics with StatsD
 *
 * Declare the API of the service like this:
 *
 *   const MyExampleService = createBackendServiceAPI(log, config, "name", {
 *
 *     getFoo: {
 *       method: 'GET',
 *       path: '/v1/foo/:name',
 *       validate: {
 *         params: {
 *           name: Joi.string().length(20)
 *         },
 *         response: {
 *           name: Joi.string().length(20),
 *           barCount: Joi.integer()
 *         }
 *       }
 *     }
 *
 *     setFoo: {
 *       method: 'POST',
 *       path: '/v1/foo/:name',
 *       validate: {
 *         params: {
 *           name: Joi.string().length(20)
 *         },
 *         payload: {
 *           numBars: Joi.integer()
 *         }
 *         response: {
 *           name: Joi.string().length(20),
 *           barCount: Joi.integer()
 *         }
 *       }
 *     }
 *
 *   },
 *
 *   statsd);
 *
 * And then call it like this:
 *
 *   const example = new MyExampleService("https://example.com/")
 *
 *   let foo = await example.getFoo("test")
 *   assert.equal(foo.name, "test")
 *   assert.equal(foo.barCount, 0)
 *
 *   foo = await.example.setFoo("test", { numBars: 12 })
 *   assert.equal(foo.barCount, 12)
 *
 */

'use strict';

const Joi = require('joi');

const P = require('./promise');
const Pool = require('./pool');
const error = require('./error');

module.exports = function createBackendServiceAPI(
  log,
  config,
  serviceName,
  methods,
  statsd
) {
  const SafeUrl = require('./safe-url')(log);

  function Service(url, options = {}) {
    this._headers = options.headers;
    this._pool = new Pool(url, options);
  }

  Service.prototype.close = function close() {
    return this._pool.close();
  };

  for (const methodName in methods) {
    Service.prototype[methodName] = makeServiceMethod(
      methodName,
      methods[methodName]
    );
  }

  return Service;

  // Each declared service method gets turned into an async function
  // that validates its inputs, makes the HTTP request using the
  // connection pool, and validates the response.

  function makeServiceMethod(methodName, opts) {
    const path = new SafeUrl(opts.path);

    const validation = opts.validate || {};
    const paramsSchema = Joi.compile(validation.params || Joi.object());
    const querySchema = Joi.compile(validation.query || Joi.object());
    const payloadSchema = Joi.compile(validation.payload || Joi.object());
    const responseSchema = Joi.compile(validation.response || Joi.any());
    const headerSchema = Joi.compile(validation.headers || Joi.object());

    let expectedNumArgs = path.params().length;
    if (validation.query) {
      expectedNumArgs += 1;
    }
    if (validation.payload) {
      expectedNumArgs += 1;
    }
    if (validation.headers) {
      expectedNumArgs += 1;
    }

    const fullMethodName = `${serviceName}.${methodName}`;

    // A thin wrapper around Joi.validate(), that logs the error and then
    // wraps it in a generic "internal validation error" that can be returned
    // to the client.

    function validate(location, value, schema, options) {
      return new P((resolve, reject) => {
        Joi.validate(value, schema, options, (err, value) => {
          if (!err) {
            return resolve(value);
          }
          log.error(fullMethodName, {
            error: `${location} schema validation failed`,
            message: err.message,
            value,
          });
          reject(
            error.internalValidationError(
              fullMethodName,
              { location, value },
              err
            )
          );
        });
      });
    }

    // A helper to make the request and return the response, or an error.
    // This assumes you've done all the hard work of formulating params, body, etc.

    async function sendRequest(
      pool,
      method,
      path,
      params,
      query,
      payload,
      headers
    ) {
      log.trace(fullMethodName, { params, query, payload });
      try {
        return await pool.request(
          method,
          path,
          params,
          query,
          payload,
          headers
        );
      } catch (err) {
        // Re-throw 400-level errors, but wrap 500-level or generic errors
        // into a "backend service failure" to propagate to the client.
        if (err.errno || (err.statusCode && err.statusCode < 500)) {
          throw err;
        } else {
          log.error(`${fullMethodName}.1`, { params, query, payload, err });
          throw error.backendServiceFailure(
            serviceName,
            methodName,
            {
              method,
              path,
            },
            err
          );
        }
      }
    }

    // The actual method implementation.

    async function theServiceMethod(...args) {
      // Interpret function arguments according to the declared schema.
      if (args.length !== expectedNumArgs) {
        throw new Error(
          `${fullMethodName} must be called with ${expectedNumArgs} arguments (${args.length} given)`
        );
      }
      let i = 0;
      // The leading positional arguments correspond to individual path params,
      // in the order they appear in the path template.
      let params = {};
      for (const param of path.params()) {
        params[param] = args[i++];
      }
      params = await validate('params', params, paramsSchema);
      // Next are query params as a dict, if any.
      const query = validation.query
        ? await validate('query', args[i++], querySchema)
        : {};
      // Next is request payload as a dict, if any.
      const payload = validation.payload
        ? await validate('request', args[i++], payloadSchema)
        : opts.method === 'GET'
        ? null
        : {};

      const headers = validation.headers
        ? await validate('headers', args[i++], headerSchema)
        : {};

      const startTime = Date.now();

      // Unexpected extra fields in the service response should not be a fatal error,
      // but we also don't want them polluting our code. So, stripUnknown=true.
      const response = await sendRequest(
        this._pool,
        opts.method,
        path,
        params,
        query,
        payload,
        { ...this._headers, ...headers }
      );

      // The statsD dependency is optional
      if (statsd) {
        statsd.timing(`${serviceName}.${methodName}`, Date.now() - startTime);
      }

      return await validate('response', response, responseSchema, {
        stripUnknown: true,
      });
    }

    // Expose the options for introspection by calling code if necessary.
    theServiceMethod.opts = opts;
    return theServiceMethod;
  }
};
