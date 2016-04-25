/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Strings = require('lib/strings');

  module.exports = {
    /**
     * Find an error in this.ERRORS. Searches by string, number,
     * or if searchFor contains errno, the errno.
     */
    find: function (searchFor) {
      var found;
      if (typeof searchFor.errno === 'number') {
        found = this.find(searchFor.errno);
      } else if (typeof searchFor === 'number') {
        found = _.find(this.ERRORS, function (value) {
          return value.errno === searchFor;
        });
      } else if (typeof searchFor === 'string') {
        found = this.ERRORS[searchFor];
      }

      return found;
    },

    /**
     * Convert an error, a numeric code or string type to a message
     */
    toMessage: function (err) {
      if (! err) {
        // No error, assume no response from the backend and
        // the service is unavailable.
        return this.toMessage('SERVICE_UNAVAILABLE');
      } else if (err.forceMessage) {
        return err.forceMessage;
      } else if (err.message) {
        return err.message;
      }

      // try to convert error to something with an error message
      var messageSource = this.find(err);
      if (messageSource && messageSource.message) {
        return messageSource.message;
      }

      // the original is not a string, default to unexpected error
      if (typeof err !== 'string') {
        return this.toMessage('UNEXPECTED_ERROR');
      }

      // The original was already a string, just return it.
      return err;
    },

    /**
     * Convert an error, a numeric code or string type to
     * a translated message. If a translator is passed in,
     * the message will be translated.
     */
    toInterpolatedMessage: function (err, translator) {
      var msg = this.toMessage(err);
      var interpolationContext = this.toInterpolationContext(err);
      if (translator) {
        return translator.get(msg, interpolationContext);
      }

      return Strings.interpolate(msg, interpolationContext);
    },

    /**
     * Fetch the string interpolation context out of the server error.
     */
    toInterpolationContext: function (/*err*/) {
      return {};
    },

    /**
     * Convert an error or a text type to a numeric code
     */
    toErrno: function (err) {
      var errnoSource = this.find(err);
      // try to find an error with an errno.
      if (errnoSource && errnoSource.errno) {
        return errnoSource.errno;
      }

      // could not find an error with an errno, return the original.
      return err;
    },

    /**
     * Synthesize an error of the given type
     *
     * @param {String || Number || Object} type
     * @param {String} [context]
     */
    toError: function (type, context) {
      var errno = this.toErrno(type);
      var message = this.toMessage(errno);

      var err = new Error(message);

      if (typeof type === 'object') {
        // copy over any fields from the original object,
        // some fields may be overridden. This allows
        // AuthServer fields like `code` or `retryAfter`
        // to be propagated out without any additional work.
        //
        // `errno, `message`, `namespace`, `errorModule` and
        // `context` are set below.
        _.extendOwn(err, type);
      }

      err.errno = errno;
      err.message = message;
      err.namespace = this.NAMESPACE;
      err.errorModule = this;

      if (context) {
        err.context = context;
      }

      return err;
    },

    /**
     * Create an INVALID_PARAMETER error. The returned
     * error will contain a `param` key with the parameter
     * name
     *
     * @param {String} paramName
     * @returns {Error}
     */
    toInvalidParameterError: function (paramName) {
      var err = this.toError('INVALID_PARAMETER');
      err.param = paramName;
      return err;
    },

    /**
     * Create a MISSING_PARAMETER error. The returned
     * error will contain a `param` key with the parameter
     * name
     *
     * @param {String} paramName
     * @returns {Error}
     */
    toMissingParameterError: function (paramName) {
      var err = this.toError('MISSING_PARAMETER');
      err.param = paramName;
      return err;
    },

    /**
     * Create an INVALID_RESUME_TOKEN_PROPERTY error.
     * The returned error will have `property` set to
     * the property name.
     *
     * @property {String} propertyName
     * @returns {Error}
     */
    toInvalidResumeTokenPropertyError: function (propertyName) {
      var err = this.toError('INVALID_RESUME_TOKEN_PROPERTY');
      err.property = propertyName;
      return err;
    },

    /**
     * Create a MISSING_RESUME_TOKEN_PROPERTY error.
     * The returned error will have `property` set to
     * the property name.
     *
     * @property {String} propertyName
     * @returns {Error}
     */
    toMissingResumeTokenPropertyError: function (propertyName) {
      var err = this.toError('MISSING_RESUME_TOKEN_PROPERTY');
      err.property = propertyName;
      return err;
    },

    /**
     * Check if an error is of the given type
     */
    is: function (error, type) {
      var code = this.toErrno(type);
      return error.errno === code;
    },

    /**
     * Check if an error was created by this module.
     *
     * @param {object} error - error to check
     * @returns {boolean} - true if from this module, false otw.
     */
    created: function (error) {
      return error.namespace === this.NAMESPACE;
    },

    normalizeXHRError: function (xhr) {
      var err;

      if (! xhr || xhr.status === 0) {
        err = this.toError('SERVICE_UNAVAILABLE');
      } else {
        var serverError = xhr.responseJSON || 'UNEXPECTED_ERROR';
        err = this.toError(serverError);
      }

      // copy over the HTTP status if not already part of the error.
      if (! ('status' in err)) {
        var status = (xhr && xhr.status) || 0;
        err.status = status;
      }

      return err;
    }
  };
});

