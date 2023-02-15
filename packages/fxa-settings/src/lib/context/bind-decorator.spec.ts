/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { bind, ContextKeyTransforms, getBoundKeys, validateContext } from './bind-decorator';
import { ContextValidation } from './model-validation';
import { GenericContext } from './implementations';
import { ModelContext } from './interfaces/model-context';
import { ModelContextProvider } from './interfaces/model-context-provider';

/**
 * Example model for testing context binding
 */
class TestModel implements ModelContextProvider {
  @bind([], ContextKeyTransforms.snakeCase)
  testField: string | undefined;

  @bind([ContextValidation.isNonEmptyString], ContextKeyTransforms.snakeCase)
  testValidatedField: string | undefined;

  constructor(protected readonly context: ModelContext) {}

  getModelContext() {
    return this.context;
  }
  validate(): void {
    return validateContext(this);
  }
}

describe('bind-decorator', function () {
  //let sandbox:SinonSandbox;

  it('creates with empty state', () => {
    const context = new GenericContext({});
    const model1 = new TestModel(context);
    expect(model1.testField).toBeUndefined();
  });

  it('creates with state', () => {
    const context = new GenericContext({ test_field: '1' });
    const model1 = new TestModel(context);
    expect(model1.testField).toEqual('1');
  });

  it('initializes with valid state', () => {
    const context = new GenericContext({ test_validated_field: '1' });
    const model1 = new TestModel(context);
    expect(model1.testValidatedField).toEqual('1');
  });

  it('maintains state', () => {
    const context = new GenericContext({ test_field: '1' });
    const model1 = new TestModel(context);
    expect(model1.testField).toEqual('1');

    model1.testField = '2';

    expect(model1.testField).toEqual('2');
    expect(context.get('test_field')).toEqual('2');
  });

  it('reflects context change', () => {
    const context = new GenericContext({});
    const model1 = new TestModel(context);
    expect(model1.testField).toBeUndefined();
    context.set('test_field', '2');
    expect(model1.testField).toEqual('2');
  });

  it('throws on validation of invalid state', () => {
    const context = new GenericContext({
      test_validated_field: { foo: 'bar' },
    });
    const model1 = new TestModel(context);
    expect(() => {
      model1.validate();
    }).toThrow();
  });

  it('throws on access of a invalid state', () => {
    const context = new GenericContext({
      test_validated_field: { foo: 'bar' },
    });
    const model1 = new TestModel(context);
    expect(() => {
      model1.testValidatedField?.toString();
    }).toThrow();
  });

  it('throws on write of a invalid state', () => {
    const context = new GenericContext({});
    const model1 = new TestModel(context);
    expect(() => {
      model1.testValidatedField = '';
    }).toThrow();
  });

  it('transforms key to snake case', () => {
    expect(ContextKeyTransforms.snakeCase('SomeTest')).toEqual('some_test');
    expect(ContextKeyTransforms.snakeCase('ATest')).toEqual('a_test');
    expect(ContextKeyTransforms.snakeCase('Test')).toEqual('test');
    expect(ContextKeyTransforms.snakeCase('Test123')).toEqual('test123');
    expect(ContextKeyTransforms.snakeCase('test')).toEqual('test');
    expect(ContextKeyTransforms.snakeCase('')).toEqual('');
  });

  it('validates', () => {
    const context = new GenericContext({});
    const model1 = new TestModel(context);

    expect(() => {
      validateContext(model1);
    }).toThrow();
  })

  it('gets bound keys', () => {
    const context = new GenericContext({});
    const model1 = new TestModel(context);

    expect(getBoundKeys(model1)).toEqual(['testField', 'testValidatedField'])
  })
});
