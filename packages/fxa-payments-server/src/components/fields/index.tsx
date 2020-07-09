import React, {
  useContext,
  useCallback,
  useRef,
  useEffect,
  DetailedHTMLProps,
  FormHTMLAttributes,
} from 'react';
import { withLocalization } from '@fluent/react';
import { ReactStripeElements } from 'react-stripe-elements';
import classNames from 'classnames';
import { Validator, FieldType } from '../../lib/validator';
import Tooltip from '../Tooltip';

export type FormContextValue = { validator: Validator };
export const FormContext = React.createContext<FormContextValue | null>(null);

type FormProps = {
  children: React.ReactNode;
  validator: Validator;
} & DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;

export const Form = (props: FormProps) => {
  const { children, validator, ...formProps } = props;
  return (
    <form {...formProps}>
      <FormContext.Provider value={{ validator }}>
        {children}
      </FormContext.Provider>
    </form>
  );
};

type FieldGroupProps = { children: React.ReactNode };

export const FieldGroup = ({ children }: FieldGroupProps) => (
  <div className="input-row-group">{children}</div>
);

type FieldProps = {
  name: string;
  initialValue?: any;
  tooltip?: boolean;
  required?: boolean;
  label?: string | React.ReactNode;
  className?: string;
  maxLength?: number;
  minLength?: number;
  autoFocus?: boolean;
  options?: object;
};

type FieldHOCProps = {
  fieldType: FieldType;
  tooltipParentRef?: React.MutableRefObject<any>;
  children: React.ReactNode;
} & FieldProps;

export const Field = ({
  tooltipParentRef,
  fieldType,
  name,
  initialValue = null,
  tooltip = true,
  required = false,
  autoFocus = false,
  label,
  className = 'input-row',
  children,
}: FieldHOCProps) => {
  const { validator } = useContext(FormContext) as FormContextValue;

  // Disabling lint rule because registering a field changes the validator
  // instance, so including validator in list of deps causes an infinite loop
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(
    () => validator.registerField({ name, initialValue, required, fieldType }),
    [name, required, fieldType]
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  const focusElement =
    autoFocus && tooltipParentRef && tooltipParentRef.current;
  useEffect(() => {
    if (focusElement && focusElement.focus) {
      // TODO: figure out how to get rid of this setTimeout because it's
      // a race condition - but, something seems to steal focus otherwise
      setTimeout(() => {
        focusElement.focus();
      }, 200);
    }
  }, [focusElement]);

  return (
    <div className={className} data-field-name={name}>
      <label>
        {label && <span className="label-text">{label}</span>}
        {tooltip && tooltipParentRef && validator.getError(name) && (
          <Tooltip parentRef={tooltipParentRef}>
            {validator.getError(name)}
          </Tooltip>
        )}
        {children}
      </label>
    </div>
  );
};

export type OnValidateFunction = (
  value: any,
  focused: boolean,
  props: FieldProps,
  getString?: Function
) => { value: any; valid: boolean | undefined; error: any };

type InputProps = {
  onValidate?: OnValidateFunction;
  getString?: Function;
} & FieldProps &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;

export const defaultInputValidator: OnValidateFunction = (
  value,
  focused,
  props,
  getString
) => {
  if (props.required && value !== null && !value) {
    const errorMsg = getString
      ? getString('default-input-error')
      : 'This field is required';
    return {
      value,
      valid: false,
      error: focused ? null : errorMsg,
    };
  }
  return { value, valid: true, error: null };
};

const UnwrappedInput = (props: InputProps) => {
  const {
    name,
    label,
    initialValue,
    onValidate = defaultInputValidator,
    tooltip,
    autoFocus,
    required = false,
    className,
    getString,
    ...childProps
  } = props;

  const { validator } = useContext(FormContext) as FormContextValue;

  const onChange = useCallback(
    (ev) => {
      const { value } = ev.target;
      validator.updateField({
        name,
        ...onValidate(value, true, props, getString),
      });
    },
    [name, props, validator, onValidate, getString]
  );

  const onBlur = useCallback(
    (ev) => {
      const { value } = ev.target;
      validator.updateField({
        name,
        ...onValidate(value, false, props, getString),
      });
    },
    [name, props, validator, onValidate, getString]
  );

  const tooltipParentRef = useRef<HTMLInputElement>(null);

  return (
    <Field
      {...{
        fieldType: 'input',
        tooltipParentRef,
        name,
        initialValue,
        tooltip,
        required,
        label,
        className,
        autoFocus,
      }}
    >
      <input
        {...{
          ...childProps,
          ref: tooltipParentRef,
          name,
          required,
          className: classNames({ invalid: validator.isInvalid(name) }),
          value: validator.getValue(name, ''),
          onBlur,
          onChange,
        }}
      />
    </Field>
  );
};

export const Input = withLocalization(UnwrappedInput);

type StripeElementProps = { onValidate?: OnValidateFunction } & FieldProps & {
    component: any;
    getString: Function | undefined;
  } & ReactStripeElements.ElementProps;

export const defaultStripeElementValidator: OnValidateFunction = (
  value,
  focused,
  props,
  getString
) => {
  if (!value || value.empty) {
    if (props.required) {
      return {
        value,
        valid: false,
        error: focused
          ? null
          : getString
          ? getString('input-error-is-required', { label: props.label })
          : props.label + ' is required',
      };
    }
  } else if (value.error && value.error.message) {
    let error = value.error.message;
    // Issue #1718 - remove periods from error messages from Stripe
    // for consistency with our own errors
    if (error.endsWith('.')) {
      error = error.slice(0, -1);
    }
    return { value, valid: false, error: !focused ? error : '' };
  }
  return {
    value,
    valid: value && value.complete ? true : undefined,
    error: null,
  };
};

export const StripeElement = (props: StripeElementProps) => {
  const {
    component: StripeElementComponent,
    name,
    tooltip,
    onValidate = defaultStripeElementValidator,
    required = false,
    label,
    className,
    autoFocus,
    getString,
    options = {},
    ...childProps
  } = props;
  const { validator } = useContext(FormContext) as FormContextValue;
  const elementValue = useRef<stripe.elements.ElementChangeResponse>();
  const onChange = useCallback(
    (value: stripe.elements.ElementChangeResponse) => {
      elementValue.current = value;
      validator.updateField({
        name,
        ...onValidate(value, true, props, getString),
      });
    },
    [name, props, validator, onValidate, elementValue]
  );

  const onBlur = useCallback(
    (ev) => {
      const value = elementValue.current;
      validator.updateField({
        name,
        ...onValidate(value, false, props, getString),
      });
    },
    [name, props, validator, onValidate, elementValue]
  );

  const tooltipParentRef = useRef<any>(null);
  return (
    <Field
      {...{
        fieldType: 'stripe',
        tooltipParentRef,
        name,
        tooltip,
        required,
        label,
        className,
        autoFocus,
      }}
    >
      <div className="tooltip-parent" ref={tooltipParentRef}>
        <StripeElementComponent
          {...{
            ...childProps,
            options,
            onChange,
            onBlur,
          }}
        />
      </div>
    </Field>
  );
};

type CheckboxProps = { onValidate?: OnValidateFunction } & FieldProps &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;

export const defaultCheckboxValidator: OnValidateFunction = (
  value,
  focused,
  props
) => {
  return { value, valid: !(props.required && !value), error: null };
};

export const Checkbox = (props: CheckboxProps) => {
  const {
    children,
    name,
    label,
    onValidate = defaultCheckboxValidator,
    required = false,
    className = 'input-row input-row--checkbox',
    ...childProps
  } = props;

  const { validator } = useContext(FormContext) as FormContextValue;

  const onChange = useCallback(
    (ev) => {
      const value = ev.target.checked;
      validator.updateField({
        name,
        ...onValidate(value, true, props),
      });
    },
    [name, props, validator, onValidate]
  );

  return (
    <Field
      {...{ fieldType: 'input', name, className, required, tooltip: false }}
    >
      <input
        {...{
          ...childProps,
          type: 'checkbox',
          name,
          onChange,
        }}
      />
      <span className="label-text checkbox">{children ? children : label}</span>
    </Field>
  );
};

type SubmitButtonProps = { children: React.ReactNode } & FieldProps &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;

export const SubmitButton = (props: SubmitButtonProps) => {
  const {
    name,
    label,
    children,
    className,
    disabled = false,
    ...childProps
  } = props;
  const { validator } = useContext(FormContext) as FormContextValue;
  const buttonProps = {
    className,
    name,
    disabled: disabled || !validator.allValid(),
  };
  return (
    <button {...{ ...childProps, ...buttonProps, type: 'submit' }}>
      {children}
    </button>
  );
};
