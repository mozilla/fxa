import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import 'jest-dom/extend-expect';

import { useClickOutsideEffect, useCheckboxState, useBooleanState } from './hooks';

afterEach(cleanup);

describe('useBooleanStateResult', () => {
  const Subject = ({ initialState = false } : { initialState?: boolean }) => {
    const [ state, setTrue, setFalse ] = useBooleanState(initialState);
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
    const { getByTestId, getByText } = render(<Subject initialState={true} />);
    expect(getByTestId('result')).toHaveTextContent('true');
  });
});

describe('useCheckboxStateResult', () => {
  const Subject = ({ initialState = false } : { initialState?: boolean }) => {
    const [ state, onChange ] = useCheckboxState(initialState);
    return (
      <div>
        <div data-testid="result">{state ? 'true' : 'false'}</div>
        <input type="checkbox" onChange={onChange} data-testid="checkbox" />
      </div>
    );
  };

  it('updates state with checkbox state as expected', () => {
    const { getByTestId } = render(<Subject />);
    expect(getByTestId('result')).toHaveTextContent('false');
    fireEvent.click(getByTestId('checkbox'));
    expect(getByTestId('result')).toHaveTextContent('true');
    fireEvent.click(getByTestId('checkbox'));
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
        <div data-testid="inside" ref={dialogInsideRef}>Inside</div>
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
