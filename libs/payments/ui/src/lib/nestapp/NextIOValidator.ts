/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { plainToInstance } from 'class-transformer';
import { Validator } from 'class-validator';

/**
 * Will capture timing for this method and send them to StatsD. Requires the target class to have statsd exposed as a public property.
 * Timings will appear as ClassName_methodName in StatsD.
 */
export function NextIOValidator<
  I extends { new (...args: any[]): any } | undefined,
  O extends { new (...args: any[]): any } | undefined,
  Args extends object | void,
  Result extends object | void,
  Target extends object
>(inputClass: I, outputClass: O) {
  type Func = (args: Args) => Promise<Result>;

  return function (
    _target: Target,
    key: string,
    descriptor: TypedPropertyDescriptor<Func>
  ) {
    const originalDef = descriptor.value as NonNullable<Func>;

    descriptor.value = async function (input: Args): Promise<Result> {
      if (inputClass) {
        const val = plainToInstance<NonNullable<I>, Args>(inputClass, input);
        await new Validator().validateOrReject(val);
      } else if (input) {
        throw new Error(
          'Input class must be provided if the method is passed a value.'
        );
      }

      const originalReturnValue = await originalDef.apply(this, [input]);

      if (outputClass) {
        const output = plainToInstance<NonNullable<O>, Result>(
          outputClass,
          originalReturnValue
        );
        await new Validator().validateOrReject(output);
      } else if (originalReturnValue) {
        throw new Error(
          'Output class must be provided if the method returns a value.'
        );
      }

      return originalReturnValue;
    };
    return descriptor;
  };
}
