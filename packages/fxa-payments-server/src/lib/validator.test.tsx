import React, { useState, useCallback, useContext } from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import 'jest-dom/extend-expect';
import { useValidatorState, Validator } from './validator';

afterEach(cleanup);

it('supports registering a field', () => {
  const { state } = runAgainstValidator(
    v => v.registerField({ name: 'foo', fieldType: 'input', required: true }),
    v => v.registerField({ name: 'bar', fieldType: 'input', required: false, initialValue: 'baz' }),
  );
  expect(state.fields).toEqual({
    foo: {
      fieldType: 'input',
      required: true,
      value: null,
      valid: null,
      error: null
    },
    bar: {
      fieldType: 'input',
      required: false,
      value: 'baz',
      valid: null,
      error: null
    },
  });
});

it('supports updating a field', () => {
  const { results } = runAgainstValidator(
    v => v.registerField({ name: 'foo', fieldType: 'input', required: true }),
    v => v.updateField({ name: 'foo', value: 'bar', valid: false, error: 'meep' }),
    v => v.getFieldState('foo'),
  );
  expect(results.pop()).toEqual({
    fieldType: 'input',
    required: true,
    value: 'bar',
    valid: false,
    error: 'meep'
  });
});

it('supports checking if fields are valid', () => {
  const { results } = runAgainstValidator(
    v => v.registerField({ name: 'foo', fieldType: 'input', required: true }),
    v => v.registerField({ name: 'baz', fieldType: 'input', required: true }),
    v => v.updateField({ name: 'foo', value: 'bar', valid: true }),
    v => v.updateField({ name: 'baz', value: 'quux', valid: false, error: 'meep' }),
    v => v.isInvalid('baz'),
    v => v.getError('baz'),
    v => v.allValid(),
    v => v.updateField({ name: 'baz', value: 'xyzzy', valid: true }),
    v => v.allValid(),
  );
  expect(results).toEqual([
    undefined,
    undefined,
    undefined,
    undefined,
    true,
    'meep',
    false,
    undefined,
    true
  ]);
});

it('supports getting field values', () => {
  const { results } = runAgainstValidator(
    v => v.registerField({ name: 'foo', fieldType: 'input', required: true }),
    v => v.registerField({ name: 'baz', fieldType: 'input', required: true }),
    v => v.registerField({ name: 'hello', fieldType: 'input', required: true }),
    v => v.registerField({ name: 'nothere', fieldType: 'input', required: true }),
    v => v.updateField({ name: 'foo', value: 'bar', valid: true }),
    v => v.updateField({ name: 'baz', value: 'xyzzy', valid: true }),
    v => v.updateField({ name: 'hello', value: 'world', valid: true }),
    v => v.getValue('foo'),
    v => v.getValue('baz'),
    v => v.getValue('hello'),
    v => v.getValue('nothere'),
    v => v.getValue('nothere', 'honk'),
    v => v.getValues(),
  );
  expect(results).toEqual([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'bar',
    'xyzzy',
    'world',
    undefined,
    'honk',
    {
      foo: 'bar',
      baz: 'xyzzy',
      hello: 'world',
      nothere: null,
    }
  ]);
});

it('supports set, get, reset of a global error', () => {
  const { results } = runAgainstValidator(
    v => v.getGlobalError(),
    v => v.setGlobalError('everything is bad'),
    v => v.getGlobalError(),
    v => v.resetGlobalError(),
    v => v.getGlobalError(),
  );
  expect(results).toEqual([
    null,
    undefined,
    'everything is bad',
    undefined,
    null,
  ]);
});

// runAgainstValidator is kind of a funky hack, but this seems like the least
// painful way to exercise a useReducer() hook somewhat realistically.
const runAgainstValidator = (...fns: Array<(validator: Validator) => any>) => {
  const { queryAllByTestId, getByTestId } = render(
    <TestContainer>
      {fns.map((fn, idx) => <TestFn key={idx} execute={fn} /> )}
    </TestContainer>
  );
  queryAllByTestId('execute').forEach(fireEvent.click);
  const results = queryAllByTestId('result').map(parseEl);
  const state = parseEl(getByTestId('validatorState'));
  return { results, state };
};

const parseEl = ({ textContent }: HTMLElement) =>
  typeof textContent !== 'string' || textContent === ''
    ? undefined
    : JSON.parse(textContent);

type TestContextValue = { validator: Validator };
const TestContext = React.createContext<TestContextValue | null>(null);

const TestContainer = ({ children }: { children: React.ReactNode }) => {
  const validator = useValidatorState();
  return (
    <TestContext.Provider value={{ validator }}>
      {children}
      <pre data-testid="validatorState">{JSON.stringify(validator.state)}</pre>
    </TestContext.Provider>
  );
};

const TestFn = ({ execute }: { execute: (validator: Validator) => any }) => {
  const { validator } = useContext(TestContext) as TestContextValue;
  const [ result, setResult ] = useState('');
  const onClick = useCallback(
    () => setResult(JSON.stringify(execute(validator))),
    [ setResult, execute, validator ]
  );
  return (
    <div>
      <button data-testid="execute" onClick={onClick}>Execute</button>
      <pre data-testid="result">{result}</pre>
    </div>
  )
};