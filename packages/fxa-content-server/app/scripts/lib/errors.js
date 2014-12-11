/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'lib/strings'
], function (_, Strings) {
  return {
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

      // could not find an error with a message, return the original.
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
      var message = this.toMessage(type);
      if (! message) {
        message = this.toMessage('UNEXPECTED_ERROR');
      }

      var err = new Error(message);

      err.message = message;
      err.errno = this.toErrno(type);
      err.namespace = this.NAMESPACE;
      err.errorModule = this;

      if (context) {
        err.context = context;
      }

      return err;
    },

    /**
     * Check if an error is of the given type
     */
    is: function (error, type) {
      var code = this.toErrno(type);
      return error.errno === code;
    },

    normalizeXHRError: function (xhr) {
      if (! xhr || xhr.status === 0) {
        return this.toError('SERVICE_UNAVAILABLE');
      }

      var errObj = xhr.responseJSON;

      if (! errObj) {
        return this.toError('UNEXPECTED_ERROR');
      }

      return this.toError(errObj.errno);
    }
  };
});

