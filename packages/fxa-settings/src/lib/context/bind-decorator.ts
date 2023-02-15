/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import "reflect-metadata"
import {
  ContextValidationError,
  ContextValidationErrors,
} from './model-validation';
import { ModelContextProvider } from './interfaces/model-context-provider';

/**
 * Turns a field name into a context key. This can be one of three states.
 *  - When a string is provided, it will act like an internal key name. For example, if `redirect_url`
 *    is provided, and `redirectUrl` is the current field name, then try look up 'redirect_url' in
 *    the context.
 *  - When a function is provided, the use this function to generate a new key name based on the fieldName.
 *    For example, if 'Redirect' is the current field name, and (s) => s.toLowerCase() is provided, then
 *    `redirect` will be the key to look up in the context.
 *    the context.
 *  - When undefined is provided, then use the current field name. For example if `redirectUrl` is the current field
 *    then lookup `redirectUrl` in the context.
 */
export type ContextKeyTransform = string | ((s: string) => string) | undefined;

/**
 * Functions for transforming class property names to context keys.
 */
export const ContextKeyTransforms = {
  snakeCase: (k: string) =>
    k
      .split(/\.?(?=[A-Z])/)
      .join('_')
      .toLowerCase(),
  lower: (k: string) => k.toLowerCase(),
};

/**
 * Resolves a key for a context.
 */
const getContextKey = (
  keyTransform: ContextKeyTransform,
  defaultValue: string
) => {
  if (typeof keyTransform === 'function') {
    return keyTransform(defaultValue);
  }
  if (typeof keyTransform === 'string') {
    return keyTransform;
  }
  return defaultValue;
};

/**
 * The symbol for the @bind decorator.
 */
export const bindMetadataKey = Symbol('bind');

/**
 * For a given object that is bound to a context, rerun all the
 * validation checks on values in that context that bind to fields
 * in the target object.
 * @param target A target object to run validation on.
 */
export function validateContext(target: ModelContextProvider) {
  for (const key of Object.keys(Object.getPrototypeOf(target))) {
    // Resolves the @bind decorator
    const bind = Reflect.getMetadata(bindMetadataKey, target, key);

    // If the @bind decorator was present, run its validation checks
    if (bind?.validate && bind?.contextKey) {
      bind.validate(
        bind.contextKey,
        target.getModelContext().get(bind.contextKey)
      );
    }
  }
}

/**
 * Looks up a list of property names that have bindings on an object
 * @param target
 */
export function getBoundKeys(target: ModelContextProvider) {
  const result = new Array<string>();
  for (const key of Object.keys(Object.getPrototypeOf(target))) {
    // Resolves the @bind decorator
    const bind = Reflect.getMetadata(bindMetadataKey, target, key);
    if (bind?.memberName && typeof bind?.memberName === 'string') {
      result.push(bind.memberName);
    }
  }
  return result;
}

/**
 * Represents a validation check
 **/
export type ContextValidationCheck = <T>(key: string, value: T) => void;

/**
 * A type script decorator for binding to an underlying context.
 * @param checks A list of sequential check to validate the state of the context value.
 * @param contextKey A key that binds the current field to a contextual value.
 * @returns A value of type T
 * @example
 *
 *  class User {
 *    @bind([ContextValidation.isString], 'first_name')
 *    firstName
 *  }
 *
 */
export const bind = <T>(
  checks: ContextValidationCheck[],
  contextKey?: ContextKeyTransform
) => {
  // The actual decorator implementation. Note we have to use 'any' as a
  // return type here because that's the type expected by the TS decorator
  // definition.
  return function (model: any, memberName: string): any {
    if (model == null) {
      throw new Error('Invalid bind! Model must be provided!');
    }

    if (typeof model.getModelContext !== 'function') {
      throw new Error('Invalid bind! Model must implement ContextProvider.');
    }

    /** Validates the state of the context value. */
    function validate(key: string, value: unknown): T {
      const errors = new Array<ContextValidationError>();
      checks.forEach((check) => {
        try {
          // Throws an error if value is bad.
          value = check(key, value);
        } catch (err) {
          if (err instanceof ContextValidationError) {
            errors.push(err);
          } else {
            throw err;
          }
        }
      });

      if (errors.length > 0) {
        throw new ContextValidationErrors(
          `Errors in current context: \n${errors
            .map((x) => x.toString())
            .join(';')}`,
          errors
        );
      }

      return value as T;
    }

    const metadata = {
      memberName,
      validate,
      contextKey: getContextKey(contextKey, memberName),
    };
    Reflect.defineMetadata(bindMetadataKey, metadata, model, memberName)

    // Hijacks class properties with @bind decorators and turns them into getter/setter that stores
    // their values in the context.
    const property = {
      enumerable: true,
      set: function (value: T) {
        if (_isContextProvider(this)) {
          const context = this.getModelContext();
          if (context != null) {
            const key = getContextKey(contextKey, memberName);
            context.set(key, validate(key, value));
            return;
          }
        }
        throw new Error(
          'Invalid bind! Does the model implement ContextProvider?'
        );
      },
      get: function () {
        if (_isContextProvider(this)) {
          const context = this.getModelContext();
          if (context != null) {
            const key = getContextKey(contextKey, memberName);
            const value = context.get(key);
            return validate(key, value);
          }
        }
        throw new Error(
          'Invalid bind! Does the model implement ContextProvider and has the context been initialized?'
        );
      },
    }
    Object.defineProperty(model, memberName, property)
    return property;
  };
};

// Type guard for ContextProvider
export function _isContextProvider(val: any): val is ModelContextProvider {
  if ('getModelContext' in val) {
    return true;
  }
  return false;
}
