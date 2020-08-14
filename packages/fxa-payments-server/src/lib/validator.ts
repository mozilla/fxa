import { useReducer, useMemo } from 'react';

export const useValidatorState = (
  params?: UseValidatorStateParams
): Validator => {
  const { initialState = defaultState, middleware = undefined } = params || {};

  let reducer = middleware
    ? (state: State, action: Action) => middleware(state, action, mainReducer)
    : mainReducer;

  const [state, dispatch] = useReducer(reducer, initialState);

  return useMemo(() => new Validator(state, dispatch), [state, dispatch]);
};

type UseValidatorStateParams = {
  initialState?: State;
  middleware?: MiddlewareReducer;
};

export type MiddlewareReducer = (
  state: State,
  action: Action,
  next: ActionReducer
) => State;

export class Validator {
  state: State;
  dispatch: React.Dispatch<Action>;

  constructor(state: State, dispatch: React.Dispatch<Action>) {
    this.state = state;
    this.dispatch = dispatch;
  }

  getValues(): { [name: string]: any } {
    return Object.entries(this.state.fields).reduce(
      (acc, [name, field]) => ({ ...acc, [name]: field.value }),
      {}
    );
  }

  allValid() {
    return Object.values(this.state.fields)
      .filter((field) => field.required)
      .every((field) => field.valid === true);
  }

  registerField({
    name,
    initialValue = null,
    fieldType,
    required,
  }: {
    name: string;
    initialValue?: any;
    fieldType: FieldType;
    required: boolean;
  }) {
    this.dispatch({
      type: 'registerField',
      name,
      initialValue,
      fieldType,
      required,
    });
  }

  updateField({
    name,
    value,
    valid,
    error = null,
  }: {
    name: string;
    value: any;
    valid?: boolean | null | undefined;
    error?: any;
  }) {
    return this.dispatch({ type: 'updateField', name, value, valid, error });
  }

  getFieldState(fieldName: string) {
    return this.state.fields[fieldName];
  }

  getFieldProp(fieldName: string, propName: FieldStateKeys, defVal?: any) {
    return fieldName in this.state.fields &&
      propName in this.state.fields[fieldName] &&
      this.state.fields[fieldName][propName] !== null
      ? this.state.fields[fieldName][propName]
      : defVal;
  }

  getValue(name: string, defVal?: any) {
    return this.getFieldProp(name, 'value', defVal);
  }

  isInvalid(name: string) {
    return this.getFieldProp(name, 'valid') === false;
  }

  getError(name: string) {
    return this.getFieldProp(name, 'error');
  }

  getGlobalError() {
    return this.state.error;
  }

  setGlobalError(error: any) {
    this.dispatch({ type: 'setGlobalError', error });
  }

  resetGlobalError() {
    this.dispatch({ type: 'resetGlobalError' });
  }
}

export type State = {
  error: any;
  fields: { [name: string]: FieldState };
};

export type FieldType = 'input' | 'stripe';
type FieldStateKeys = 'fieldType' | 'value' | 'required' | 'valid' | 'error';
type FieldState = {
  fieldType: FieldType;
  value?: any;
  required: boolean;
  valid: boolean | undefined | null;
  error: string | null;
};

export const defaultState: State = {
  error: null,
  fields: {},
};

export type Action =
  | {
      type: 'registerField';
      name: string;
      fieldType: FieldType;
      required: boolean;
      initialValue: any;
    }
  | {
      type: 'updateField';
      name: string;
      value: any;
      valid: boolean | null | undefined;
      error: any;
    }
  | { type: 'setGlobalError'; error: any }
  | { type: 'resetGlobalError' };

export type ActionReducer = (state: State, action: Action) => State;

export const mainReducer: ActionReducer = (state, action) => {
  switch (action.type) {
    case 'registerField': {
      const { name, fieldType, required, initialValue } = action;
      return setFieldState(state, name, (field) => ({
        value: initialValue,
        valid: null,
        error: null,
        ...field,
        fieldType,
        required,
      }));
    }
    case 'updateField': {
      const { name, value, valid, error } = action;
      return setFieldState(state, name, (field) => ({
        ...field,
        value,
        valid,
        error,
      }));
    }
    case 'setGlobalError': {
      const { error } = action;
      return { ...state, error };
    }
    case 'resetGlobalError': {
      return { ...state, error: null };
    }
  }
  return state;
};

export const setFieldState = (
  state: State,
  name: string,
  fn: (field: FieldState) => FieldState
) => ({
  ...state,
  fields: {
    ...state.fields,
    [name]: fn(state.fields[name]),
  },
});

export default useValidatorState;
