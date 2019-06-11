import { useReducer, useMemo } from 'react';

export const useValidatorState = (): Validator => {
  // TODO: Accept a reducer parameter to wrap actionReducer and enable overall form-level validation?
  const [ state, dispatch ] = useReducer(mainReducer, initialState);
  return useMemo(
    () => new Validator(state, dispatch),
    [ state, dispatch ]
  );
};

export class Validator {
  state: State;
  dispatch: React.Dispatch<Action>;

  constructor(state: State, dispatch: React.Dispatch<Action>) {
    this.state = state;
    this.dispatch = dispatch;
  }

  getValues(): { [name: string]: any } {
    return Object
      .entries(this.state.fields)
      .reduce((acc, [ name, field ]) => ({ ...acc, [ name ]: field.value }), {});
  }

  allValid() {
    return Object
      .values(this.state.fields)
      .filter(field => field.required)
      .every(field => field.valid === true);
  }

  registerField(
    { name, initialValue = null, fieldType, required }:
    { name: string, initialValue?: any, fieldType: FieldType, required: boolean}
  ) {
    this.dispatch({ type: 'registerField', name, initialValue, fieldType, required });
  }

  updateField(
    { name, value, valid, error = null }:
    { name: string, value: any, valid?: boolean, error?: any}
  ) {
    if (typeof valid === 'undefined') {
      valid = !! error;
    }
    return this.dispatch({ type: 'updateField', name, value, valid, error });
  }

  getFieldState(fieldName: string) {
    return this.state.fields[fieldName];
  }

  getFieldProp(
    fieldName: string,
    propName: FieldStateKeys,
    defVal?: any
  ) {
    return (
      fieldName in this.state.fields &&
      propName in this.state.fields[fieldName] &&
      this.state.fields[fieldName][propName] !== null
    )
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

type State = {
  error: any,
  fields: { [name: string]: FieldState },
};

export type FieldType = 'input' | 'stripe';
type FieldStateKeys = 'fieldType' | 'value' | 'required' | 'valid' | 'error';
type FieldState = {
  fieldType: FieldType,
  value: any,
  required: boolean,
  valid: boolean | null,
  error: string | null,
};

const initialState: State = {
  error: null,
  fields: {},
};

type Action =
  | { type: 'registerField', name: string, fieldType: FieldType, required: boolean, initialValue?: any }
  | { type: 'updateField', name: string, value: any, valid: boolean, error: any }
  | { type: 'setGlobalError', error: any }
  | { type: 'resetGlobalError' };

type ActionReducer = (state: State, action: Action) => State;

const mainReducer: ActionReducer = (state, action) => {
  switch (action.type) {
    case 'registerField': {
      const { name, fieldType, required, initialValue = null } = action;
      return setFieldState(state, name, () =>
        ({ fieldType, required, value: initialValue, valid: null, error: null }));
    }
    case 'updateField': {
      const { name, value, valid, error } = action;
      return setFieldState(state, name, field =>
        ({ ...field, value, valid, error }));
    }
    case 'setGlobalError': {
      const { error } = action;
      return ({ ...state, error });
    }
    case 'resetGlobalError': {
      return ({ ...state, error: null });
    }
  }
  return state;
};

const setFieldState = (
  state: State,
  name: string,
  fn: (field: FieldState) => FieldState
) => ({
  ...state,
  fields: {
    ...state.fields,
    [ name ]: fn(state.fields[name])
  }
});