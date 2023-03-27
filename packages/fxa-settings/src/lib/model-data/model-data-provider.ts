/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { validateData } from './bind-decorator';
import { ModelValidationErrors } from './model-validation';
import { ModelDataStore } from './model-data-store';

export class ModelDataProvider {
  constructor(protected readonly modelData: ModelDataStore) {
    if (modelData == null) {
      throw new Error('dataAccessor must be provided!');
    }
  }

  /**
   * Gets the data collection that holds the state of the model.
   * @returns
   */
  getModelData() {
    return this.modelData;
  }

  /**
   * Checks the state of the model data is valid. Throws an error if not valid.
   * @returns
   */
  validate(): void {
    return validateData(this);
  }

  /**
   * Checks the state of the model data is valid. Returns true if valid, false otherwise.
   * @returns
   */
  isValid() {
    try {
      this.validate();
      return true;
    } catch (err) {
      if (err instanceof ModelValidationErrors) {
        console.warn(err.errors.map((x) => `${x.key}-${x.value}-${x.message}`));
        return false;
      }
      throw err;
    }
  }

  /**
   * Attempts to validate the model. Returns a flag, isValid that indicates if the model
   * passes validation. If the model is not valid, the ValidationError is also returned.
   * @returns
   */
  tryValidate(): { isValid: boolean; error?: ModelValidationErrors } {
    let error: ModelValidationErrors | undefined;
    let isValid = true;
    try {
      this.validate();
    } catch (err) {
      console.warn(err);
      isValid = false;
      if (err instanceof ModelValidationErrors) {
        error = err;
      } else {
        throw err;
      }
    }

    return {
      isValid,
      error,
    };
  }
}
