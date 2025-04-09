/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ModelDataProvider, isModelDataProvider } from './model-data-provider';
import 'reflect-metadata';

/**
 * This DataType type is list of types that a values held in the data store can be coerced into.
 *
 * Models hold data in their data store as strings. When it's time to access a model property, we use reflection
 * to the property's data type, and then convert the stored string to this type accordingly.
 *
 * For example if a model that looks like:
 *
 * class A {
 *   @bind()
 *   public number x;
 *
 *   @bind()
 *   public Foo y;
 * }
 *
 * Internally the value for x will be held as a string, e.g. '7.5'. When the value is retrieved, it will be
 * converted to a number, e.g. 7.5.
 *
 * Similarly the y property would be held a json object, eg '{ bar: 1 }', and then converted to Foo of
 * type object when it is accessed, e.g. { bar: 1 }
 *
 */
export type DataType = 'string' | 'boolean' | 'number' | 'object';

/**
 * Turns a field name into a lookup key. This can be one of three states.
 *  - When a string is provided, it will act like an internal key name. For example, if `redirect_url`
 *    is provided, and `redirectUrl` is the current field name, then try look up 'redirect_url' in
 *    the data store.
 *  - When a function is provided, the use this function to generate a new key name based on the fieldName.
 *    For example, if 'Redirect' is the current field name, and (s) => s.toLowerCase() is provided, then
 *    `redirect` will be the key to look up in the the data store.
 *  - When undefined is provided, then use the current field name. For example if `redirectUrl` is the current field
 *    then lookup `redirectUrl` in the the data store.
 */
export type KeyTransform = string | ((s: string) => string) | undefined;

/**
 * Functions for transforming class property names to lookup keys.
 */
export const KeyTransforms = {
  snakeCase: (k: string) =>
    k
      .split(/\.?(?=[A-Z])/)
      .join('_')
      .toLowerCase(),
  lower: (k: string) => k.toLowerCase(),
};

/**
 * Resolves a key that is used to look up data in the model's data store.
 */
const getKey = (keyTransform: KeyTransform, defaultValue: string) => {
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
 * Looks up a list of property names that have bindings on an object
 * @param target
 */
export function getBoundKeys(target: ModelDataProvider) {
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
export type ValidationCheck = <T>(key: string, value: T) => void;

/**
 * A type script decorator for binding to an underlying data store.
 * @param dataKey A key in the underlying data store. Used to bind the field to a key value pair in the data store.
 * @returns A value of type T
 * @example
 *
 *  class User {
 *    @bind('first_name')
 *    firstName
 *  }
 *
 */
export const bind = <T>(dataKey?: KeyTransform) => {
  // The actual decorator implementation. Note we have to use 'any' as a
  // return type here because that's the type expected by the TS decorator
  // definition.
  return function (model: any | ModelDataProvider, memberName: string): any {
    if (model == null) {
      throw new Error('Invalid bind! Model must be provided!');
    }

    if (!(model instanceof ModelDataProvider)) {
      throw new Error('Invalid bind! Model inherit from ModelDataProvider!');
    }

    const metadata = {
      memberName,
      key: getKey(dataKey, memberName),
    };
    Reflect.defineMetadata(bindMetadataKey, metadata, model, memberName);

    // Hijacks class properties with @bind decorators and turns them into getter/setter that stores
    // their values in the underlying data store.
    const property = {
      enumerable: true,
      set: function (value: T) {
        if (!isModelDataProvider(this)) {
          throw new InvalidModelInstance();
        }
        const key = getKey(dataKey, memberName);
        const type = getType(this, memberName);
        this.setModelData(key, writeRawValue(value, type));
      },
      get: function () {
        if (!isModelDataProvider(this)) {
          throw new InvalidModelInstance();
        }
        const key = getKey(dataKey, memberName);
        const value = this.getModelData(key, true);
        const type = getType(this, memberName);
        return coerceValue(value, type, key);
      },
    };
    Object.defineProperty(model, memberName, property);
    return property;
  };
};

/**
 * Error for situations where the model data provider object that backs the @bind is invalid.
 */
export class InvalidModelInstance extends Error {
  constructor() {
    super(
      'Invalid bind! Does the model is not an an instance of ModelDataProvider. Check that the model inherits from ModelDataProvider.'
    );
  }
}
function writeRawValue(value: any, dataType: DataType | undefined) {
  if (dataType !== undefined && typeof value !== dataType) {
    throw new Error(
      `Data type mismatch! Type safety violated! Cannot assign ${typeof value} to ${dataType}.`
    );
  }
  if (dataType === 'object') {
    return JSON.stringify(value);
  }
  return value.toString();
}

/**
 * Takes a string value and tries to convert it to the specified data type.
 * @param value - raw string value
 * @param dataType - expected type
 * @returns - a value of the specified type
 */
function coerceValue(
  value: string | undefined,
  dataType: DataType | undefined,
  key: string | undefined
): string | boolean | number | any | null {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    if (dataType === 'string') {
      return value;
    }

    if (dataType === 'number') {
      return parseFloat(value);
    }

    if (dataType === 'boolean') {
      const lower = value.toLowerCase().trim();
      if (lower !== 'true' && lower !== 'false') {
        throw new DataCoercionError(value, dataType, key);
      }
      return value === 'true';
    }

    // Value is a string with unknown data type or data type of object
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(`Cannot JSON parse value! ${value}`);
      throw e;
    }
  }

  throw new DataCoercionError(value, dataType, key);
}

/**
 * Uses reflection to determine the expected type of a class property
 * @param target - instance
 * @param memberName - property / member name
 * @returns The expected data type of the property
 */
function getType(target: any, memberName: string): DataType {
  const designType = Reflect.getMetadata(
    'design:type',
    target,
    memberName
  )?.toString();

  // The reflect meta data package realizes these fields as functions with returns types. This mapping let us extract the underlying type.
  if (
    designType === 'boolean' ||
    designType?.startsWith('function Boolean()')
  ) {
    return 'boolean';
  }
  if (designType === 'number' || designType?.startsWith('function Number()')) {
    return 'number';
  }
  if (designType === 'string' || designType?.startsWith('function String()')) {
    return 'string';
  }
  if (designType === 'object' || designType?.startsWith('function Object()')) {
    return 'object';
  }

  // No design type is available, fallback to string
  return 'string';
}

export class DataCoercionError extends Error {
  constructor(
    value: string | undefined,
    dataType: DataType | undefined,
    property: string | undefined
  ) {
    super(
      `Data type mismatch! Type safety violated! Cannot coerce ${typeof value} (${value}) to ${dataType}.\n- property ${property} has failed`
    );
  }
}
