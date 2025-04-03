/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsString, MinLength } from 'class-validator';
import { bind, KeyTransforms } from './bind-decorator';
import { GenericData } from './data-stores';
import {
  ModelDataProvider,
  ModelValidationErrors,
} from './model-data-provider';

describe('model-data-provider', function () {
  let modelDataProvider: ModelDataProvider;

  beforeEach(() => {
    modelDataProvider = new ModelDataProvider(new GenericData({}));
  });

  it('validates', () => {
    expect(() => modelDataProvider.validate()).not.toThrow();
  });

  it('isValid', () => {
    expect(modelDataProvider.isValid()).toBe(true);
  });

  it('tries to validate', () => {
    expect(modelDataProvider.tryValidate()).toEqual({
      isValid: true,
      error: undefined,
    });
  });

  it('can format errors', () => {
    // Create test class to demonstrate validation error
    class FooTest extends ModelDataProvider {
      @IsString()
      @MinLength(1)
      @bind(KeyTransforms.snakeCase)
      fooBar!: string;
    }
    const foo = new FooTest(new GenericData({}));

    // Validate the instance
    let validationErrors: ModelValidationErrors | undefined;
    try {
      foo.validate();
    } catch (error) {
      validationErrors = error;
    }

    // Create formatted error list
    const errorList = validationErrors?.toUserFriendlyErrorList();

    expect(validationErrors).toBeDefined();
    expect(validationErrors).toBeInstanceOf(ModelValidationErrors);
    expect(errorList).toBeDefined();
    expect(errorList).toHaveLength(1);
    expect(errorList?.[0].message).toContain(
      'foo_bar has failed the following constraints'
    );
    expect(errorList?.[0].constraints[0]).toContain(
      'foo_bar must be longer than or equal to 1 characters'
    );
    expect(errorList?.[0].constraints[1]).toContain('foo_bar must be a string');
  });
});
