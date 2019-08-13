import React, { useCallback, useContext } from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  mainReducer,
  useValidatorState,
  Validator,
  MiddlewareReducer as ValidatorMiddlewareReducer,
  State as ValidatorState,
  defaultState as validatorDefaultState,
  Action as ValidatorAction,
} from './validator';

afterEach(cleanup);

describe('mainReducer', () => {
  it('returns the original state when given an unknown action', () => {
    const state = validatorDefaultState;
    const action = { type: 'bogus' };
    const newState = mainReducer(state, action as ValidatorAction);
    expect(newState).toEqual(state);
  })
});

describe('useValidatorState', () => {
  it('does not throw error when missing initial state or middleware', () => {
    const Subject = () => {
      const validator = useValidatorState();
      return (
        <div>{JSON.stringify(validator.state)}</div>
      )
    };
    render(<Subject />);
  });
});

describe('Validator', () => {
  it('supports registering a field', () => {
    const { state } = runAgainstValidator(
      v => v.registerField({ name: 'foo', fieldType: 'input', required: true }),
      v =>
        v.registerField({
          name: 'bar',
          fieldType: 'input',
          required: false,
          initialValue: 'baz',
        })
    );
    expect(state.fields).toEqual({
      foo: {
        fieldType: 'input',
        required: true,
        value: null,
        valid: null,
        error: null,
      },
      bar: {
        fieldType: 'input',
        required: false,
        value: 'baz',
        valid: null,
        error: null,
      },
    });
  });

  it('supports updating a field', () => {
    const { results } = runAgainstValidator(
      v => v.registerField({ name: 'foo', fieldType: 'input', required: true }),
      v =>
        v.updateField({ name: 'foo', value: 'bar', valid: false, error: 'meep' }),
      v => v.getFieldState('foo')
    );
    expect(results.pop()).toEqual({
      fieldType: 'input',
      required: true,
      value: 'bar',
      valid: false,
      error: 'meep',
    });
  });

  it('supports checking if fields are valid', () => {
    const { results } = runAgainstValidator(
      v => v.registerField({ name: 'foo', fieldType: 'input', required: true }),
      v => v.registerField({ name: 'baz', fieldType: 'input', required: true }),
      v => v.updateField({ name: 'foo', value: 'bar', valid: true }),
      v =>
        v.updateField({
          name: 'baz',
          value: 'quux',
          valid: false,
          error: 'meep',
        }),
      v => v.isInvalid('baz'),
      v => v.getError('baz'),
      v => v.allValid(),
      v => v.updateField({ name: 'baz', value: 'xyzzy', valid: true }),
      v => v.allValid()
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
      true,
    ]);
  });

  it('supports getting field values', () => {
    const { results } = runAgainstValidator(
      v => v.registerField({ name: 'foo', fieldType: 'input', required: true }),
      v => v.registerField({ name: 'baz', fieldType: 'input', required: true }),
      v => v.registerField({ name: 'hello', fieldType: 'input', required: true }),
      v =>
        v.registerField({ name: 'nothere', fieldType: 'input', required: true }),
      v => v.updateField({ name: 'foo', value: 'bar', valid: true }),
      v => v.updateField({ name: 'baz', value: 'xyzzy', valid: true }),
      v => v.updateField({ name: 'hello', value: 'world', valid: true }),
      v => v.getValue('foo'),
      v => v.getValue('baz'),
      v => v.getValue('hello'),
      v => v.getValue('nothere'),
      v => v.getValue('nothere', 'honk'),
      v => v.getValues()
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
      },
    ]);
  });

  it('supports set, get, reset of a global error', () => {
    const { results } = runAgainstValidator(
      v => v.getGlobalError(),
      v => v.setGlobalError('everything is bad'),
      v => v.getGlobalError(),
      v => v.resetGlobalError(),
      v => v.getGlobalError()
    );
    expect(results).toEqual([
      null,
      undefined,
      'everything is bad',
      undefined,
      null,
    ]);
  });
});

const runAgainstValidator = (...fns: Array<(validator: Validator) => any>) => {
  const results: Array<any> = [];
  let lastState: ValidatorState = validatorDefaultState;

  const middleware: ValidatorMiddlewareReducer = (state, action, next) => {
    const nextState = next(state, action);
    lastState = nextState;
    return nextState;
  };

  const { queryAllByTestId } = render(
    <TestContainer {...{ middleware, results, fns }} />
  );

  queryAllByTestId('execute').forEach(fireEvent.click);
  return { results, state: lastState };
};

type TestContextValue = {
  validator: Validator;
  results: Array<any>;
};
const TestContext = React.createContext<TestContextValue | null>(null);

const TestContainer = ({
  fns,
  middleware,
  initialState = validatorDefaultState,
  results,
}: {
  fns: Array<(validator: Validator) => any>;
  middleware?: ValidatorMiddlewareReducer;
  initialState?: ValidatorState;
  results: Array<any>;
}) => {
  const validator = useValidatorState({ middleware, initialState });
  return (
    <TestContext.Provider value={{ validator, results }}>
      {fns.map((fn, idx) => (
        <TestFn key={idx} execute={fn} />
      ))}
    </TestContext.Provider>
  );
};

const TestFn = ({ execute }: { execute: (validator: Validator) => any }) => {
  const { validator, results } = useContext(TestContext) as TestContextValue;
  const onClick = useCallback(() => results.push(execute(validator)), [
    results,
    execute,
    validator,
  ]);
  return (
    <button data-testid="execute" onClick={onClick}>
      Execute
    </button>
  );
};
