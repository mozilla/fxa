/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback } from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {
  useClickOutsideEffect,
  useBooleanState,
  useAwait,
  PromiseState,
  PromiseStateResolved,
} from './hooks';

describe('useBooleanStateResult', () => {
  const Subject = ({ initialState = false }: { initialState?: boolean }) => {
    const [state, setTrue, setFalse] = useBooleanState(initialState);
    return (
      <div>
        <div data-testid="result">{state ? 'true' : 'false'}</div>
        <button onClick={setTrue}>setTrue</button>
        <button onClick={setFalse}>setFalse</button>
      </div>
    );
  };

  it('updates state with callbacks as expected', () => {
    const { getByTestId, getByText } = render(<Subject />);
    expect(getByTestId('result')).toHaveTextContent('false');
    fireEvent.click(getByText('setTrue'));
    expect(getByTestId('result')).toHaveTextContent('true');
    fireEvent.click(getByText('setFalse'));
    expect(getByTestId('result')).toHaveTextContent('false');
  });

  it('accepts an initial value', () => {
    const { getByTestId } = render(<Subject initialState={true} />);
    expect(getByTestId('result')).toHaveTextContent('true');
  });
});

describe('useClickOutsideEffect', () => {
  type SubjectProps = {
    onDismiss: Function;
  };

  const Subject = ({ onDismiss }: SubjectProps) => {
    const dialogInsideRef = useClickOutsideEffect<HTMLDivElement>(onDismiss);
    return (
      <div>
        <div data-testid="outside">Outside</div>
        <div data-testid="inside" ref={dialogInsideRef}>
          Inside
        </div>
      </div>
    );
  };

  it('triggers onDismiss on a click outside', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(<Subject onDismiss={onDismiss} />);
    const outside = getByTestId('outside');
    fireEvent.click(outside);
    expect(onDismiss).toBeCalled();
  });

  it('does not trigger onDismiss on a click inside', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(<Subject onDismiss={onDismiss} />);
    const inside = getByTestId('inside');
    fireEvent.click(inside);
    expect(onDismiss).not.toBeCalled();
  });
});

describe('useAwait', () => {
  const Subject = ({
    fn = async () => 'test',
    fnArgs,
    initialState,
    executeImmediately,
    rethrowError,
  }: {
    fn?: (...args: any) => Promise<string>;
    fnArgs?: any;
    initialState?: PromiseState<string, any>;
    executeImmediately?: boolean;
    rethrowError?: boolean;
  }) => {
    const useDefaults = [initialState, executeImmediately, rethrowError].every(
      (item) => typeof item === 'undefined'
    );
    const options = useDefaults
      ? undefined
      : {
          initialState,
          executeImmediately,
          rethrowError,
        };
    const [state, execute, reset] = useAwait(fn, options);
    const [thrownState, setThrownState] = useState('');
    const executeMaybeThrows = useCallback(async () => {
      try {
        await execute(fnArgs);
      } catch (e) {
        setThrownState(e);
      }
    }, [execute]);
    return (
      <div>
        {state.pending && <div data-testid="pending">pending</div>}
        {!state.pending && <div data-testid="not-pending">not-pending</div>}
        <div data-testid="state">{JSON.stringify(state)}</div>
        <div data-testid="thrown">{JSON.stringify(thrownState)}</div>
        <button data-testid="execute" onClick={executeMaybeThrows}></button>
        <button data-testid="reset" onClick={reset}></button>
      </div>
    );
  };

  const parseState = (getByTestId: RenderResult['getByTestId']) =>
    JSON.parse(getByTestId('state').textContent as string);

  it('accepts initial state', async () => {
    const initialState: PromiseStateResolved<string> = {
      result: 'expected',
      pending: false,
      error: undefined,
    };
    const { getByTestId } = render(<Subject {...{ initialState }} />);
    expect(parseState(getByTestId)).toEqual(initialState);
  });

  it('executes immediately when executeImmediately = true', async () => {
    const expected = 'asdasdasd';
    const { findByTestId, getByTestId } = render(
      <Subject {...{ fn: async () => expected, executeImmediately: true }} />
    );
    await findByTestId('pending');
    await findByTestId('not-pending');
    expect(parseState(getByTestId)).toEqual({
      result: expected,
      pending: false,
      error: undefined,
    });
  });

  it('execute passes args to factory function', async () => {
    const arg = 'hi mom';
    const fn = async (arg: string) => `result ${arg}`;
    const { findByTestId, getByTestId } = render(
      <Subject {...{ fn, fnArgs: [arg] }} />
    );
    fireEvent.click(getByTestId('execute'));
    await findByTestId('pending');
    await findByTestId('not-pending');
    expect(parseState(getByTestId)).toEqual({
      result: `result ${arg}`,
      pending: false,
      error: undefined,
    });
  });

  it('updates state for a resolved promise', async () => {
    const expected = 'asdasdasd';
    const fn = async () => expected;
    const { findByTestId, getByTestId } = render(<Subject {...{ fn }} />);
    expect(parseState(getByTestId)).toEqual({
      pending: undefined,
      result: undefined,
      erorr: undefined,
    });
    fireEvent.click(getByTestId('execute'));
    await findByTestId('pending');
    await findByTestId('not-pending');
    expect(parseState(getByTestId)).toEqual({
      result: expected,
      pending: false,
      error: undefined,
    });
  });

  it('updates state for a rejected promise', async () => {
    const expectedError = 'oops!';
    const fn = async () => {
      throw expectedError;
    };
    const { findByTestId, getByTestId, debug } = render(
      <Subject {...{ fn }} />
    );
    expect(parseState(getByTestId)).toEqual({
      pending: undefined,
      result: undefined,
      erorr: undefined,
    });
    fireEvent.click(getByTestId('execute'));
    await findByTestId('pending');
    await findByTestId('not-pending');
    expect(parseState(getByTestId)).toEqual({
      result: undefined,
      pending: false,
      error: expectedError,
    });
    expect(getByTestId('thrown').textContent).not.toEqual(
      JSON.stringify(expectedError)
    );
  });

  it('optionally re-throws error for rejected promise', async () => {
    const expectedError = 'oops!';
    const fn = async () => {
      throw expectedError;
    };
    const { findByTestId, getByTestId, debug } = render(
      <Subject {...{ fn, rethrowError: true }} />
    );
    expect(parseState(getByTestId)).toEqual({
      pending: undefined,
      result: undefined,
      erorr: undefined,
    });
    fireEvent.click(getByTestId('execute'));
    await findByTestId('pending');
    await findByTestId('not-pending');
    expect(parseState(getByTestId)).toEqual({
      result: undefined,
      pending: false,
      error: expectedError,
    });
    expect(getByTestId('thrown').textContent).toEqual(
      JSON.stringify(expectedError)
    );
  });

  it('allows state to be reset', async () => {
    const expected = 'asdasdasd';
    const fn = async () => expected;
    const { findByTestId, getByTestId } = render(<Subject {...{ fn }} />);
    expect(parseState(getByTestId)).toEqual({});
    fireEvent.click(getByTestId('execute'));
    await findByTestId('pending');
    await findByTestId('not-pending');
    expect(parseState(getByTestId)).toEqual({
      result: expected,
      pending: false,
    });
    fireEvent.click(getByTestId('reset'));
    expect(parseState(getByTestId)).toEqual({});
  });

  it('does not re-execute when a promise is already pending', async () => {
    const expectedError = 'oops!';
    let count = 0;
    const fn = async () => `count: ${++count}`;
    const { findByTestId, getByTestId, debug } = render(
      <Subject {...{ fn }} />
    );
    expect(parseState(getByTestId)).toEqual({
      pending: undefined,
      result: undefined,
      erorr: undefined,
    });
    fireEvent.click(getByTestId('execute'));
    fireEvent.click(getByTestId('execute'));
    fireEvent.click(getByTestId('execute'));
    await findByTestId('pending');
    await findByTestId('not-pending');
    expect(parseState(getByTestId)).toEqual({
      result: 'count: 1',
      pending: false,
    });
  });
});
