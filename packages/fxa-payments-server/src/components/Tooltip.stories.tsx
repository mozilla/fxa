import React, { useRef, useState, useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../.storybook/components/MockApp';
import ScreenInfo from '../lib/screen-info';
import { SignInLayout } from './AppLayout';
import { Tooltip } from './Tooltip';

function init() {
  storiesOf('components/Tooltip', module)
    .add('default', () =>
      <MockPage>
        <Field>default</Field>
      </MockPage>
    )
    .add('dismissible', () =>
      <MockPage>
        <FieldWithDismissible
          message={<>Did you mean <a href="https://mozilla.org">mozilla.org</a>?</>}
          extraClassNames="tooltip-error tooltip-suggest"
          dismissible
        >dismissible = true</FieldWithDismissible>
      </MockPage>
    )
    .add('showBelow', () =>
      <MockPage>
        <Field showBelow={false}>showBelow = false</Field>
        <Field showBelow>showBelow default</Field>
        <Field showBelow={true}>showBelow = true</Field>
      </MockPage>
    )
    .add('clientHeight', () =>
      <MockPage>
        <Field clientHeight={300}>clientHeight = 300</Field>
        <Field showBelow={false} clientHeight={300}>clientHeight = 300, showBelow = false</Field>
        <Field clientHeight={1000}>clientHeight = 1000</Field>
      </MockPage>
    );
}

type FieldProps = {
  children: string | React.ReactNode,
  message?: string | React.ReactNode,
  showTooltip?: boolean,
  dismissible?: boolean,
  onDismiss?: (ev: React.MouseEvent) => void,
  onFocus?: (ev: React.FocusEvent) => void,
  showBelow?: boolean,
  clientHeight?: number,
  extraClassNames?: string,
};

const Field = ({
  children,
  message = 'Valid email required',
  showTooltip = true,
  dismissible = false,
  onDismiss = () => {},
  onFocus = () => {},
  showBelow = undefined,
  clientHeight = undefined,
  extraClassNames = 'tooltip-error',
}: FieldProps) => {
  const screenInfo = new ScreenInfo(window);
  if (typeof clientHeight !== 'undefined') {
    screenInfo.clientHeight = clientHeight;
  }
  const parentRef = useRef(null);
  return (
    <div className="input-row">
      <label>
        <span className="label-text">{children}</span>
        <input ref={parentRef} onFocus={onFocus} name="name" type="text" className="name tooltip-below invalid" defaultValue="" required autoFocus aria-invalid="true" />
        {showTooltip && <Tooltip {...{ parentRef, showBelow, dismissible, onDismiss, extraClassNames, screenInfo }}>{message}</Tooltip>}
      </label>
    </div>
  );
};

const FieldWithDismissible = (props: FieldProps) => {
  const [ showTooltip, setShowTooltip ] = useState(true);
  const onFocus = useCallback(() => setShowTooltip(true), [ setShowTooltip ]);
  const onDismiss = useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault();
      setShowTooltip(false);
    },
    [ setShowTooltip ]
  );
  return <Field {...{ ...props, showTooltip, onFocus, onDismiss }} />;
};

type MockPageProps = {
  children: React.ReactNode,
};

const MockPage = ({ children }: MockPageProps) => {
  return (
    <MockApp>
      <SignInLayout>
        <form className="payment">
          {children}
        </form>
      </SignInLayout>
    </MockApp>
  );
};

init();