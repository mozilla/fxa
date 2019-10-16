/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

module.exports = (app, logger) => {
  const cors = require('./cors');
  const {
    celebrate,
    isCelebrate: isValidationError,
    errors: validationErrorHandlerFactory,
  } = require('celebrate');
  const validationErrorHandler = validationErrorHandlerFactory();

  return {
    /**
     * Add a route using `routeDefinition`.
     *
     * @param {Object} routeDefinition
     *  @param {String} routeDefinition.method one of `GET`, `POST`, etc.
     *  @param {String|RegExp} routeDefinition.path define the path for the route
     *  @param {Function} routeDefinition.process handler, passes (req, res, next) as arguments
     *  @param {Object} [routeDefinition.cors] enables CORS
     *   Follows [cors](https://github.com/expressjs/cors) conventions.
     *  @param {Function} [routeDefinition.preProcess] Use to do any pre-processing before validation,
     *   such as converting from text to JSON. Passes (req, res, next) as arguments
     *  @param {Object} [routeDefinition.validate] declare JOI validation.
     *   Follows [celebrate](https://www.npmjs.com/package/celebrate) conventions.
     */
    addRoute(routeDefinition) {
      if (!isValidRouteDefinition(routeDefinition)) {
        logger.error('route definition invalid: ', routeDefinition);
        throw new Error('Invalid route definition');
      }

      const routeHandlers = [];

      // Enable CORS using https://github.com/expressjs/cors
      // If defined, `cors` can be truthy or an object.
      // Objects are passed to the middleware directly.
      // Other truthy values use the default configuration.
      if (routeDefinition.cors) {
        const corsConfig =
          typeof routeDefinition.cors === 'object'
            ? routeDefinition.cors
            : undefined;
        // Enable the pre-flight OPTIONS request
        const corsHandler = cors(corsConfig);
        app.options(routeDefinition.path, corsHandler);
        routeHandlers.push(corsHandler);
      }

      if (routeDefinition.preProcess) {
        routeHandlers.push(routeDefinition.preProcess);
      }

      if (routeDefinition.validate) {
        routeHandlers.push(
          celebrate(routeDefinition.validate, {
            // silently drop any unknown fields within objects on the ground.
            stripUnknown: { arrays: false, objects: true },
          })
        );
      }

      routeHandlers.push(routeDefinition.process);
      app[routeDefinition.method](routeDefinition.path, ...routeHandlers);
    },

    validationErrorHandler(err, req, res, next) {
      if (err && isValidationError(err)) {
        logger.error('validation.failed', {
          err,
          method: req.method,
          path: req.url,
        });
        validationErrorHandler(err, req, res, next);
      } else {
        // not a validation error, send to the next error handler
        next(err);
      }
    },
  };

  function isValidRouteDefinition(route) {
    return !!route.method && route.path && route.process;
  }
};
