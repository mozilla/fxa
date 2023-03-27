/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  KeyTransforms as T,
  getBoundKeys,
  validateData,
} from './bind-decorator';
import { ModelValidation as V } from './model-validation';
import { GenericData } from './data-stores';
import { ModelDataProvider } from './model-data-provider';

/**
 * Example model for testing bind decorators
 */
class TestModel extends ModelDataProvider {
  @bind([], T.snakeCase)
  testField: string | undefined;

  @bind([V.isNonEmptyString], T.snakeCase)
  testValidatedField: string | undefined;
}

describe('bind-decorator', function () {
  it('creates with empty state', () => {
    const data = new GenericData({});
    const model1 = new TestModel(data);
    expect(model1.testField).toBeUndefined();
  });

  it('creates with state', () => {
    const data = new GenericData({ test_field: '1' });
    const model1 = new TestModel(data);
    expect(model1.testField).toEqual('1');
  });

  it('initializes with valid state', () => {
    const data = new GenericData({ test_validated_field: '1' });
    const model1 = new TestModel(data);
    expect(model1.testValidatedField).toEqual('1');
  });

  it('maintains state', () => {
    const data = new GenericData({ test_field: '1' });
    const model1 = new TestModel(data);
    expect(model1.testField).toEqual('1');

    model1.testField = '2';

    expect(model1.testField).toEqual('2');
    expect(data.get('test_field')).toEqual('2');
  });

  it('reflects data change', () => {
    const data = new GenericData({});
    const model1 = new TestModel(data);
    expect(model1.testField).toBeUndefined();
    data.set('test_field', '2');
    expect(model1.testField).toEqual('2');
  });

  it('throws on validation of invalid state', () => {
    const data = new GenericData({
      test_validated_field: { foo: 'bar' },
    });
    const model1 = new TestModel(data);
    expect(() => {
      model1.validate();
    }).toThrow();
  });

  it('throws on access of a invalid state', () => {
    const data = new GenericData({
      test_validated_field: { foo: 'bar' },
    });
    const model1 = new TestModel(data);
    expect(() => {
      model1.testValidatedField?.toString();
    }).toThrow();
  });

  it('throws on write of a invalid state', () => {
    const data = new GenericData({});
    const model1 = new TestModel(data);
    expect(() => {
      model1.testValidatedField = '';
    }).toThrow();
  });

  it('transforms key to snake case', () => {
    expect(T.snakeCase('SomeTest')).toEqual('some_test');
    expect(T.snakeCase('ATest')).toEqual('a_test');
    expect(T.snakeCase('Test')).toEqual('test');
    expect(T.snakeCase('Test123')).toEqual('test123');
    expect(T.snakeCase('test')).toEqual('test');
    expect(T.snakeCase('')).toEqual('');
  });

  it('validates', () => {
    const data = new GenericData({});
    const model1 = new TestModel(data);

    expect(() => {
      validateData(model1);
    }).toThrow();
  });

  it('gets bound keys', () => {
    const data = new GenericData({});
    const model1 = new TestModel(data);

    expect(getBoundKeys(model1)).toEqual(['testField', 'testValidatedField']);
  });
});
