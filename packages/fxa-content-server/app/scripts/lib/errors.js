/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import Strings from './strings';

export default {
  /**
   * Find an error in this.ERRORS. Searches by string, number,
   * or if searchFor contains errno, the errno.
   *
   * @param {Error|Number|String} searchFor
   * @returns {Object}
   */
  find(searchFor) {
    if (searchFor === undefined || searchFor === null) {
      return;
    }

    var found;
    if (typeof searchFor.errno === 'number') {
      found = this.find(searchFor.errno);
    } else if (typeof searchFor === 'number') {
      found = _.find(this.ERRORS, function(value) {
        return value.errno === searchFor;
      });
    } else if (typeof searchFor === 'string') {
      found = this.ERRORS[searchFor];
    }

    return found;
  },

  /**
   * Convert an error, a numeric code or string type to a message
   *
   * @param {Error} err
   * @returns {String|Error}
   */
  toMessage(err) {
    if (!err) {
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
   *
   * @param {Error} err
   * @param {Object} translator
   * @returns {String}
   */
  toInterpolatedMessage(err, translator) {
    var msg = this.toMessage(err);
    var interpolationContext = this.toInterpolationContext(err);
    if (translator) {
      return translator.get(msg, interpolationContext);
    }

    return Strings.interpolate(msg, interpolationContext);
  },

  /**
   * Fetch the string interpolation context out of the server error.
   *
   * @returns {Object}
   */
  toInterpolationContext(/*err*/) {
    return {};
  },

  /**
   * Convert an error or a text type to a numeric code
   *
   * @param {Error} err
   * @returns {Number|Error}
   */
  toErrno(err) {
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
   * @param {String|Number|Object} type
   * @param {String} [context]
   * @returns {Error}
   */
  toError(type, context) {
    const errno = this.toErrno(type);
    const message = this.toMessage(errno);
    const err = _.isString(message) ? new Error(message) : message;

    // copy over any fields from the error entry.
    // errno, message, etc, are be overridden below.
    const entry = this.find(errno);
    // copy over any fields from the error entry,
    // some fields may be overridden. This allows
    // custom fields like response_error_code
    // to be propagated out without any additional work.
    if (_.isObject(entry)) {
      _.extendOwn(err, entry);
    }

    if (_.isObject(type)) {
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
  toInvalidParameterError(paramName) {
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
  toMissingParameterError(paramName) {
    var err = this.toError('MISSING_PARAMETER');
    err.param = paramName;
    return err;
  },

  /**
   * Create an INVALID_RESUME_TOKEN_PROPERTY error.
   * The returned error will have `property` set to
   * the property name.
   *
   * @param {String} propertyName
   * @returns {Error}
   */
  toInvalidResumeTokenPropertyError(propertyName) {
    var err = this.toError('INVALID_RESUME_TOKEN_PROPERTY');
    err.property = propertyName;
    return err;
  },

  /**
   * Create a MISSING_RESUME_TOKEN_PROPERTY error.
   * The returned error will have `property` set to
   * the property name.
   *
   * @param {String} propertyName
   * @returns {Error}
   */
  toMissingResumeTokenPropertyError(propertyName) {
    var err = this.toError('MISSING_RESUME_TOKEN_PROPERTY');
    err.property = propertyName;
    return err;
  },

  /**
   * Create an INVALID_DATA_ATTRIBUTE error.
   * The returned error will have `property` set to
   * the property name.
   *
   * @param {String} propertyName
   * @returns {Error}
   */
  toInvalidDataAttributeError(propertyName) {
    var err = this.toError('INVALID_DATA_ATTRIBUTE');
    err.property = propertyName;
    return err;
  },

  /**
   * Create a MISSING_DATA_ATTRIBUTE error.
   * The returned error will have `property` set to
   * the property name.
   *
   * @param {String} propertyName
   * @returns {Error}
   */
  toMissingDataAttributeError(propertyName) {
    var err = this.toError('MISSING_DATA_ATTRIBUTE');
    err.property = propertyName;
    return err;
  },

  /**
   * Check if an error is of the given type
   *
   * @param {Error} error
   * @param {String} type
   * @returns {Boolean}
   */
  is(error, type) {
    var code = this.toErrno(type);
    return error.errno === code;
  },

  /**
   * Check if an error was created by this module.
   *
   * @param {Object} error - error to check
   * @returns {Boolean} - true if from this module, false otw.
   */
  created(error) {
    return error.namespace === this.NAMESPACE;
  },

  normalizeXHRError(xhr) {
    var err;

    if (!xhr || xhr.status === 0) {
      err = this.toError('SERVICE_UNAVAILABLE');
    } else if (xhr.responseJSON) {
      err = this.toError(xhr.responseJSON);
    } else if (xhr.status === 503) {
      err = this.toError('SERVICE_UNAVAILABLE');
    } else if (xhr.status === 429) {
      err = this.toError('THROTTLED');
    } else {
      err = this.toError('UNEXPECTED_ERROR');
    }

    // copy over the HTTP status if not already part of the error.
    if (!('status' in err)) {
      var status = (xhr && xhr.status) || 0;
      err.status = status;
    }

    return err;
  },
};
