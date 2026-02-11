/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Transform and validate data. Uses the [VAT
 * library](https://github.com/shane-tomlinson/vat) to
 * do the heavy lifting.
 *
 * If a required field is missing from the data, a
 * `MISSING_ERROR` error is generated, with the error's
 * `param` field set to the missing field's name.
 *
 * If a field does not pass validation, an
 * `INVALID_PARAMETER` error is generated, with the error's
 * `param` field set to the invalid field's name.
 */

import Vat from './vat';

export default {
  /**
   * Transform and validate `data` using `schema`.
   *
   * @param {Object} data - data to validate
   * @param {Object} schema - schema that can be passed to the validator
   * @param {Object} Errors - Errors module used to create errors
   * @returns {Object} validation/transformation results
   */
  transformUsingSchema(data, schema, Errors) {
    var result = Vat.validate(data, schema);
    var error = result.error;
    if (error instanceof ReferenceError) {
      throw Errors.toMissingParameterError(error.key);
    } else if (error instanceof TypeError) {
      throw Errors.toInvalidParameterError(error.key);
    }

    return result.value;
  },
};
