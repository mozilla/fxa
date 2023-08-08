/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { validateSync, ValidationError } from 'class-validator';
import { ModelDataStore } from './model-data-store';

/**
 * Type guard for validating model
 * @param model
 * @returns
 */
export function isModelDataProvider(model: any): model is ModelDataProvider {
  if (model instanceof ModelDataProvider) {
    return true;
  }
  return false;
}

export class ModelDataProvider {
  private isDirty = true;

  constructor(protected readonly modelData: ModelDataStore) {
    if (modelData == null) {
      throw new Error('dataAccessor must be provided!');
    }
  }

  /**
   * Gets the data collection that holds the state of the model.
   * @param key Key data is held under
   * @param value Value for key
   * @param validate Whether or not to validate. Optional and defaults to true.
   * @returns underlying data
   */
  setModelData(key: string, value: unknown, validate = true) {
    if (this.modelData == null) {
      throw new Error(
        'Invalid bind! Has the data store for the model been initialized?'
      );
    }
    const currentValue = this.modelData.get(key);
    if (currentValue !== value) {
      this.modelData.set(key, value);
      this.isDirty = true;
      if (validate) {
        this.validate();
      }
    }
  }

  /**
   * Fetches data from underlying data store
   * @param key The key to look up
   * @param validate Whether or not to validate. Optional and defaults to true.
   * @returns
   */
  getModelData(key: string, validate = true) {
    if (this.modelData == null) {
      throw new Error(
        'Invalid bind! Has the data store for the model been initialized?'
      );
    }
    if (validate) {
      this.validate();
    }
    return this.modelData.get(key);
  }

  /**
   * Indicates the data store is in a synchronized state. Many data stores don't have
   * to worry about synchronization because they have a single source of truth. See the
   * datastore's implementation to determine if synchronization is necessary.
   * @returns
   */
  async synchronized() {
    return await this.modelData.synchronized();
  }

  /**
   * Checks the state of the model data is valid. Throws an error if not valid.
   * @param key A specific property name to validate.
   * @returns
   */
  validate(property?: string) {
    if (!this.isDirty) {
      return;
    }
    this.isDirty = false;

    let errors = validateSync(this);

    // If a key was provided only consider errors for that property.
    if (property) {
      errors = errors.filter((x) => x.property === property);
    }

    if (errors.length > 0) {
      throw new ModelValidationErrors(errors);
    }
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
        err.errors.forEach((x) => {
          console.warn(x.toString());
        });
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
  tryValidate(): {
    isValid: boolean;
    error?: ValidationError | ModelValidationErrors;
  } {
    let error: ValidationError | ModelValidationErrors | undefined;
    let isValid = true;
    try {
      this.validate();
    } catch (err) {
      console.warn(err);
      isValid = false;
      if (
        err instanceof ValidationError ||
        err instanceof ModelValidationErrors
      ) {
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

export class ModelValidationErrors extends Error {
  constructor(public readonly errors: ValidationError[]) {
    super(
      'Model Validation Errors Encountered! Fields:' +
        errors.map((x) => x.toString()).join(',')
    );
  }
}
