/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { bind, KeyTransforms as T, getBoundKeys } from './bind-decorator';
import { GenericData } from './data-stores';
import { ModelDataProvider } from './model-data-provider';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Example model for testing bind decorators
 */
class TestModel extends ModelDataProvider {
  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  testField: string | undefined;

  @IsOptional()
  @IsNumber()
  @bind(T.snakeCase)
  testFieldNumber: number | undefined;

  @IsOptional()
  @IsBoolean()
  @bind(T.snakeCase)
  testFieldBoolean: boolean | undefined;

  @IsOptional()
  @IsObject()
  @bind(T.snakeCase)
  testFieldObject: { foo: string; bar?: string } | undefined;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @bind(T.snakeCase)
  testValidatedField: string | undefined;
}

describe('bind-decorator', function () {
  const defaultState = {
    test_field: '1',
    test_field_number: `2`,
    test_field_boolean: `true`,
    test_field_object: JSON.stringify({ foo: 'bar' }),
    test_validated_field: `1`,
  };

  it('creates with empty state', () => {
    const data = new GenericData({});
    const model1 = new TestModel(data);
    expect(model1.testField).toBeUndefined();
  });

  it('creates with state', () => {
    const data = new GenericData(defaultState);
    const model1 = new TestModel(data);
    expect(model1.testField).toEqual('1');
    expect(model1.testFieldBoolean).toEqual(true);
    expect(model1.testFieldNumber).toEqual(2);
    expect(model1.testFieldObject).toEqual({ foo: 'bar' });
  });

  it('initializes with valid state', () => {
    const data = new GenericData(defaultState);
    const model1 = new TestModel(data);
    expect(model1.testValidatedField).toEqual('1');
  });

  it('maintains state', () => {
    const data = new GenericData(defaultState);
    const model1 = new TestModel(data);
    expect(model1.testField).toEqual('1');
    expect(model1.testFieldBoolean).toEqual(true);
    expect(model1.testFieldNumber).toEqual(2);
    expect(model1.testFieldObject).toEqual({ foo: 'bar' });

    model1.testField = '2';
    model1.testValidatedField = '3';
    model1.testFieldBoolean = false;
    model1.testFieldNumber = 3;
    model1.testFieldObject = { foo: 'baz' };

    expect(model1.testField).toEqual('2');
    expect(model1.testValidatedField).toEqual('3');
    expect(model1.testFieldBoolean).toEqual(false);
    expect(model1.testFieldNumber).toEqual(3);
    expect(model1.testFieldObject).toEqual({ foo: 'baz' });
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
      test_validated_field: ``,
    });
    const model1 = new TestModel(data);
    expect(() => {
      model1.validate();
    }).toThrow();
  });

  it('throws on access of a invalid state', () => {
    const data = new GenericData({
      test_validated_field: ``,
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

      model1.validate();
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

  it('gets bound keys', () => {
    const data = new GenericData({});
    const model1 = new TestModel(data);

    expect(getBoundKeys(model1)).toEqual([
      'testField',
      'testFieldNumber',
      'testFieldBoolean',
      'testFieldObject',
      'testValidatedField',
    ]);
  });

  it('gets data directly', () => {
    const data = new GenericData({ test_field: 'foo' });
    const model1 = new TestModel(data);
    expect(model1.getModelData('test_field')).toEqual('foo');
  });

  it('sets data directly', () => {
    const data = new GenericData({ test_field: 'foo' });
    const model1 = new TestModel(data);

    model1.setModelData('test_field', 'bar');
    expect(model1.getModelData('test_field')).toEqual('bar');
  });

  it('returns undefined for unset data marked as optional', () => {
    const data = new GenericData({});
    const model1 = new TestModel(data);
    expect(model1.getModelData('test_field') === undefined).toBeTruthy();
    expect(model1.getModelData('test_field') !== null).toBeTruthy();
  });

  it('will not get invalid data directly', () => {
    const data = new GenericData({ test_validated_field: '' });
    const model1 = new TestModel(data);
    expect(() => model1.getModelData('testValidatedField', true)).toThrow();
  });

  it('sets invalid when validate is specified as false', () => {
    const data = new GenericData({ test_field: 'foo' });
    const model1 = new TestModel(data);
    expect(() => model1.setModelData('test_field', '0', false)).not.toThrow();
  });

  it('gets invalid when validate is specified as false', () => {
    const data = new GenericData({ test_field: '0' });
    const model1 = new TestModel(data);
    expect(() => model1.getModelData('test_field', false)).not.toThrow();
  });
});
