import React, { useState, useCallback, useContext, useRef } from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  FieldGroup,
  Form,
  FormContext,
  FormContextValue,
  Field,
  Input,
  StripeElement,
  SubmitButton,
  Checkbox,
  defaultInputValidator,
} from './index';
import {
  useValidatorState,
  Validator,
  State as ValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';

afterEach(cleanup);

describe('Form', () => {
  it('renders a form that provides children with a validator', () => {
    const validatorStateRef = mkValidatorStateRef();
    const { container } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <Field fieldType="input" name="foo" label="This is a label">
          <p>Hi mom</p>
        </Field>
      </TestForm>
    );
    expect(container.querySelector('form')).not.toBeNull();
    expect(validatorStateRef.current).toEqual({
      error: null,
      fields: {
        foo: {
          error: null,
          fieldType: 'input',
          required: false,
          valid: null,
          value: null,
        },
      },
    });
  });
});

describe('FieldGroup', () => {
  it('wraps children in className="input-row-group"', () => {
    const { container } = render(
      <FieldGroup>
        <div>Hi mom</div>
      </FieldGroup>
    );
    const groupEl = container.querySelector('.input-row-group');
    expect(groupEl).not.toBeNull();
  });
});

describe('Field', () => {
  it('renders a label when available', () => {
    const { container } = render(
      <TestForm>
        <Field fieldType="input" name="foo" label="This is a label">
          <p>Hi mom</p>
        </Field>
      </TestForm>
    );
    const label = container.querySelector('label .label-text');
    expect(label).not.toBeNull();
    if (label) {
      expect(label.textContent).toEqual('This is a label');
    }
  });

  it('renders a tooltip for errors', () => {
    const Subject = () => {
      const tooltipParentRef = useRef<HTMLDivElement>(null);
      return (
        <TestForm>
          <Field
            fieldType="input"
            name="foo"
            label="This is a label"
            tooltip={true}
            tooltipParentRef={tooltipParentRef}
          >
            <p ref={tooltipParentRef}>Hi mom</p>
          </Field>
          <TestValidatorFn
            fn={validator => {
              validator.updateField({
                name: 'foo',
                value: 'bar',
                valid: false,
                error: 'This is an error',
              });
            }}
          />
        </TestForm>
      );
    };
    const { container, queryAllByTestId } = render(<Subject />);
    queryAllByTestId('execute').forEach(fireEvent.click);
    const tooltip = container.querySelector('aside.tooltip');
    expect(tooltip).not.toBeNull();
  });

  it('omits a tooltip if tooltip=false', () => {
    const Subject = () => {
      return (
        <TestForm>
          <Field
            fieldType="input"
            name="foo"
            label="This is a label"
            tooltip={false}
          >
            <p>Hi mom</p>
          </Field>
          <TestValidatorFn
            fn={validator => {
              validator.updateField({
                name: 'foo',
                value: 'bar',
                valid: false,
                error: 'This is an error',
              });
            }}
          />
        </TestForm>
      );
    };
    const { container, queryAllByTestId } = render(<Subject />);
    queryAllByTestId('execute').forEach(fireEvent.click);
    const tooltip = container.querySelector('aside.tooltip');
    expect(tooltip).toBeNull();
  });

  it('registers a field with validator state', () => {
    const validatorStateRef = mkValidatorStateRef();
    render(
      <TestForm validatorStateRef={validatorStateRef}>
        <Field fieldType="input" name="foo">
          <p>Hi mom</p>
        </Field>
      </TestForm>
    );
    expect(validatorStateRef.current.fields.foo).toEqual({
      fieldType: 'input',
      required: false,
      value: null,
      valid: null,
      error: null,
    });
  });
});

describe('defaultInputValidator', () => {
  it('returns correct string when not provided `getString` prop', () => {
    const focused = false;
    const props = {name: 'my-field', required: true};

    expect(defaultInputValidator(
      '',
      focused,
      props,
      (id: any) => id,
    ).error).toEqual('default-input-error');

    expect(defaultInputValidator(
      '',
      focused,
      props,
    ).error).toEqual('This field is required');
  });
});

describe('Input', () => {
  it('considers an optional field without onValidate as always valid', () => {
    const validatorStateRef = mkValidatorStateRef();
    const { getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <Input
          data-testid="input-1"
          type="text"
          name="input-1"
          initialValue="bar"
        />
      </TestForm>
    );

    fireEvent.change(getByTestId('input-1'), { target: { value: '' } });
    fireEvent.blur(getByTestId('input-1'));
    expect(validatorStateRef.current.fields['input-1'].valid).toEqual(true);
  });

  it('enforces non-empty content in required fields', () => {
    const validatorStateRef = mkValidatorStateRef();
    const { getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <Input
          data-testid="input-1"
          type="text"
          name="input-1"
          required
          initialValue="bar"
        />
        <Input data-testid="input-2" type="text" name="input-2" required />
      </TestForm>
    );

    fireEvent.change(getByTestId('input-1'), { target: { value: '' } });
    fireEvent.blur(getByTestId('input-1'));
    fireEvent.blur(getByTestId('input-2'));

    expect(validatorStateRef.current).toEqual({
      error: null,
      fields: {
        'input-1': {
          fieldType: 'input',
          required: true,
          value: '',
          valid: false,
          error: 'default-input-error',
        },
        'input-2': {
          fieldType: 'input',
          required: true,
          value: '',
          valid: false,
          error: 'default-input-error',
        },
      },
    });
  });

  it('accepts a function to validate on both change and blur', () => {
    const validate = jest.fn((value: string, focused: boolean) => {
      return {
        value: `bar ${value}`,
        valid: false,
        error: focused ? null : 'bad thing',
      };
    });

    const validatorStateRef = mkValidatorStateRef();
    const { getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <Input
          data-testid="testInput"
          type="text"
          name="foo"
          onValidate={validate}
        />
      </TestForm>
    );

    fireEvent.change(getByTestId('testInput'), { target: { value: 'xyzzy' } });

    expect(validate.mock.calls.length).toBe(1);
    expect(validate.mock.calls[0][0]).toBe('xyzzy');
    expect(validate.mock.calls[0][1]).toBe(true);

    expect(validatorStateRef.current).toEqual({
      error: null,
      fields: {
        foo: {
          fieldType: 'input',
          required: false,
          // validate function can alter value
          value: 'bar xyzzy',
          // validate function can set valid state
          valid: false,
          // validate function can set error message separately from valid state
          error: null,
        },
      },
    });

    fireEvent.blur(getByTestId('testInput'));

    expect(validate.mock.calls.length).toBe(2);
    expect(validate.mock.calls[1][0]).toBe('bar xyzzy');
    expect(validate.mock.calls[1][1]).toBe(false);

    expect(validatorStateRef.current).toEqual({
      error: null,
      fields: {
        foo: {
          fieldType: 'input',
          required: false,
          // validate function can alter value, which happens twice since we validated twice
          value: 'bar bar xyzzy',
          valid: false,
          error: 'bad thing',
        },
      },
    });
  });

  it('adds an "invalid" class name when invalid', () => {
    const validate = (value: string) => ({
      value: 'bar',
      valid: false,
      error: 'bad thing',
    });
    const { container, getByTestId } = render(
      <TestForm>
        <Input
          data-testid="testInput"
          type="text"
          name="foo"
          onValidate={validate}
        />
      </TestForm>
    );
    fireEvent.change(getByTestId('testInput'), { target: { value: 'xyzzy' } });
    fireEvent.blur(getByTestId('testInput'), { target: { value: 'xyzzy' } });
    expect(container.querySelector('input.invalid')).not.toBeNull();
  });
});

describe('StripeElement', () => {
  type MockStripeElementProps = {
    id?: string;
    className?: string;
    onChange: Function;
    onBlur: Function;
    onFocus: Function;
    onReady: Function;
  };

  const buildMockStripeElement = (value: any) =>
    class extends React.Component<MockStripeElementProps> {
      constructor(props: MockStripeElementProps) {
        super(props);
      }
      handleClick = (ev: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        ev.preventDefault();
        this.props.onChange(value);
      };
      handleBlur = (ev: React.FocusEvent<HTMLInputElement>) => {
        ev.preventDefault();
        this.props.onBlur();
      };
      render() {
        return (
          <input
            type="text"
            data-testid="mockStripe"
            onClick={this.handleClick}
            onBlur={this.handleBlur}
          />
        );
      }
    };

  it('does nothing if field value is null', () => {
    const MockStripeElement = buildMockStripeElement(null);
    const validatorStateRef = mkValidatorStateRef();
    const { getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <StripeElement name="input-1" component={MockStripeElement} />
      </TestForm>
    );
    fireEvent.click(getByTestId('mockStripe'));
    expect(validatorStateRef.current.fields['input-1'].valid).toEqual(
      undefined
    );
  });

  it('does nothing if value is not yet complete', () => {
    const MockStripeElement = buildMockStripeElement({
      complete: false,
      error: null,
    });
    const validatorStateRef = mkValidatorStateRef();
    const { getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <StripeElement name="input-1" component={MockStripeElement} />
      </TestForm>
    );
    fireEvent.click(getByTestId('mockStripe'));
    expect(validatorStateRef.current.fields['input-1'].valid).toEqual(
      undefined
    );
  });

  it('handles error result from contained stripe element', () => {
    const MockStripeElement = buildMockStripeElement({
      error: { message: 'game over man' },
    });
    const validatorStateRef = mkValidatorStateRef();
    const { container, getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <StripeElement name="input-1" component={MockStripeElement} />
      </TestForm>
    );

    fireEvent.click(getByTestId('mockStripe'));
    expect(container.querySelector('aside.tooltip')).toBeNull();

    fireEvent.blur(getByTestId('mockStripe'));

    const tooltipEl = container.querySelector('aside.tooltip');
    expect(tooltipEl).not.toBeNull();
    expect((tooltipEl as Element).textContent).toContain('game over man');

    expect(validatorStateRef.current).toEqual({
      error: null,
      fields: {
        'input-1': {
          fieldType: 'stripe',
          required: false,
          value: {
            error: {
              message: 'game over man',
            },
          },
          valid: false,
          error: 'game over man',
        },
      },
    });
  });

  it('runs validation for empty value if focused and blurred', () => {
    const MockStripeElement = buildMockStripeElement(undefined);
    const validatorStateRef = mkValidatorStateRef();
    const { container, getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <StripeElement
          data-testid="input-1"
          label="Frobnitz"
          name="input-1"
          required={true}
          component={MockStripeElement}
        />
      </TestForm>
    );

    fireEvent.click(getByTestId('mockStripe'));
    expect(container.querySelector('aside.tooltip')).toBeNull();

    fireEvent.blur(getByTestId('mockStripe'));

    const tooltipEl = container.querySelector('aside.tooltip');
    expect(tooltipEl).not.toBeNull();
    expect((tooltipEl as Element).textContent).toContain(
      'Frobnitz is required'
    );
  });

  it('supports a custom onValidate function', () => {
    const MockStripeElement = buildMockStripeElement({
      value: 'foo',
      error: 'not this',
      complete: true,
    });
    const validatorStateRef = mkValidatorStateRef();
    const expectedError = 'My hovercraft is full of eels';
    const onValidate = jest.fn(value => ({
      value,
      valid: false,
      error: expectedError,
    }));
    const { container, getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <StripeElement
          data-testid="input-1"
          name="input-1"
          component={MockStripeElement}
          onValidate={onValidate}
        />
      </TestForm>
    );
    fireEvent.click(getByTestId('mockStripe'));
    expect(onValidate).toBeCalled();

    const tooltipEl = container.querySelector('aside.tooltip');
    expect(tooltipEl).not.toBeNull();
    expect((tooltipEl as Element).textContent).toContain(expectedError);
  });

  it('trims off trailing periods from error messages (issue #1718)', () => {
    const MockStripeElement = buildMockStripeElement({
      error: { message: 'period.' },
    });
    const validatorStateRef = mkValidatorStateRef();
    const { container, getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <StripeElement name="input-1" component={MockStripeElement} />
      </TestForm>
    );

    fireEvent.click(getByTestId('mockStripe'));
    fireEvent.blur(getByTestId('mockStripe'));

    const tooltipEl = container.querySelector('aside.tooltip');
    expect(tooltipEl).not.toBeNull();
    expect((tooltipEl as Element).textContent).toContain('period');
  });

  it('handles complete result from contained stripe element', () => {
    const MockStripeElement = buildMockStripeElement({ complete: true });
    const validatorStateRef = mkValidatorStateRef();
    const { container, getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <StripeElement name="input-1" component={MockStripeElement} />
      </TestForm>
    );

    fireEvent.click(getByTestId('mockStripe'));

    const tooltipEl = container.querySelector('aside.tooltip');
    expect(tooltipEl).toBeNull();

    expect(validatorStateRef.current).toEqual({
      error: null,
      fields: {
        'input-1': {
          fieldType: 'stripe',
          required: false,
          value: { complete: true },
          valid: true,
          error: null,
        },
      },
    });
  });
});

describe('Checkbox', () => {
  it('renders its own label with a label prop when avaiable', () => {
    const { container } = render(
      <TestForm>
        <Checkbox name="foo" label="nice label" />
      </TestForm>
    );
    const label = container.querySelector('span.label-text.checkbox');
    expect(label).not.toBeNull();
    if (label) {
      expect(label.textContent).toContain('nice label');
    }
  });

  it('renders children as a label with markup when available', () => {
    const { container } = render(
      <TestForm>
        <Checkbox name="foo">
          nice <span className="label-inner-span">label</span>
        </Checkbox>
      </TestForm>
    );
    const label = container.querySelector('span.label-text.checkbox');
    const labelInnerSpan = container.querySelector('.label-inner-span');
    expect(label).not.toBeNull();
    if (label) {
      expect(label.textContent).toEqual('nice label');
    }
    expect(labelInnerSpan).not.toBeNull();
    if (labelInnerSpan) {
      expect(labelInnerSpan.textContent).toEqual('label');
    }
  });

  it('accepts an alternate className', () => {
    const { container } = render(
      <TestForm>
        <Checkbox className="fooquux" name="foo" label="nice label" />
      </TestForm>
    );
    expect(container.querySelector('.fooquux')).toBeInTheDocument();
  });

  it('must be checked to be valid when required', () => {
    const validatorStateRef = mkValidatorStateRef();
    const { getByTestId } = render(
      <TestForm validatorStateRef={validatorStateRef}>
        <Checkbox data-testid="checkbox" name="foo" required />
      </TestForm>
    );

    const checkbox = getByTestId('checkbox');

    fireEvent.click(checkbox);
    expect(validatorStateRef.current).toEqual({
      error: null,
      fields: {
        foo: {
          fieldType: 'input',
          required: true,
          value: true,
          valid: true,
          error: null,
        },
      },
    });

    fireEvent.click(checkbox);
    expect(validatorStateRef.current).toEqual({
      error: null,
      fields: {
        foo: {
          fieldType: 'input',
          required: true,
          value: false,
          valid: false,
          error: null,
        },
      },
    });
  });
});

describe('SubmitButton', () => {
  it('is disabled if all required fields are not valid', () => {
    const Subject = () => {
      return (
        <TestForm>
          <SubmitButton data-testid="submit" name="submit">
            Submit
          </SubmitButton>
          <Input name="foo" required />
          <TestValidatorFn
            fn={validator => {
              validator.updateField({
                name: 'foo',
                value: 'bar',
                valid: false,
                error: 'This is an error',
              });
            }}
          />
          <TestValidatorFn
            fn={validator => {
              validator.updateField({ name: 'foo', value: 'baz', valid: true });
            }}
          />
        </TestForm>
      );
    };
    const { queryAllByTestId, getByTestId } = render(<Subject />);
    const validatorFns = queryAllByTestId('execute');

    fireEvent.click(validatorFns[0]);
    expect(getByTestId('submit')).toHaveAttribute('disabled');

    fireEvent.click(validatorFns[1]);
    expect(getByTestId('submit')).not.toHaveAttribute('disabled');
  });
});

const mkValidatorStateRef = () =>
  React.createRef() as React.MutableRefObject<ValidatorState>;

const TestForm = ({
  children,
  validatorStateRef,
}: {
  children: React.ReactNode;
  validatorStateRef?: React.MutableRefObject<ValidatorState>;
}) => {
  const middleware: ValidatorMiddlewareReducer = (state, action, next) => {
    const nextState = next(state, action);
    if (validatorStateRef) {
      validatorStateRef.current = nextState;
    }
    return nextState;
  };
  const validator = useValidatorState({ middleware });
  return <Form validator={validator}>{children}</Form>;
};

const TestValidatorFn = ({ fn }: { fn: (validator: Validator) => any }) => {
  const { validator } = useContext(FormContext) as FormContextValue;
  const [result, setResult] = useState('');
  const onClick = useCallback(
    ev => {
      ev.preventDefault();
      setResult(JSON.stringify(fn(validator)));
    },
    [setResult, fn, validator]
  );
  return (
    <div>
      <button data-testid="execute" onClick={onClick}>
        Execute
      </button>
      <pre data-testid="result">{result}</pre>
    </div>
  );
};
