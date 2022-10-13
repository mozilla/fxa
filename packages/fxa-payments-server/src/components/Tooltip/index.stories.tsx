import React, { useRef, useState, useCallback } from 'react';
import MockApp from '../../../.storybook/components/MockApp';
import ScreenInfo from '../../lib/screen-info';
import { SignInLayout } from '../AppLayout';
import { Tooltip } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'components/Tooltip',
  component: Tooltip,
} as Meta;

type FieldProps = {
  children: string | React.ReactNode;
  message?: string | React.ReactNode;
  showTooltip?: boolean;
  dismissible?: boolean;
  onDismiss?: (ev: React.MouseEvent) => void;
  onFocus?: (ev: React.FocusEvent) => void;
  showBelow?: boolean;
  clientHeight?: number;
  extraClassNames?: string;
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
        <input
          ref={parentRef}
          onFocus={onFocus}
          name="name"
          type="text"
          className="name tooltip-below invalid"
          defaultValue=""
          required
          autoFocus
          aria-invalid="true"
        />
        {showTooltip && (
          <Tooltip
            {...{
              parentRef,
              showBelow,
              dismissible,
              onDismiss,
              extraClassNames,
              screenInfo,
            }}
          >
            {message}
          </Tooltip>
        )}
      </label>
    </div>
  );
};

const FieldWithDismissible = (props: FieldProps) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const onFocus = useCallback(() => setShowTooltip(true), [setShowTooltip]);
  const onDismiss = useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault();
      setShowTooltip(false);
    },
    [setShowTooltip]
  );
  return <Field {...{ ...props, showTooltip, onFocus, onDismiss }} />;
};

type MockPageProps = {
  children: React.ReactNode;
};

const MockPage = ({ children }: MockPageProps) => {
  return (
    <MockApp>
      <SignInLayout>
        <form className="payment">{children}</form>
      </SignInLayout>
    </MockApp>
  );
};

const storyWithOneField = (dismissable: boolean) => {
  const story = () => (
    <MockPage>
      {dismissable ? (
        <FieldWithDismissible
          message={
            <>
              Did you mean <a href="https://mozilla.org">mozilla.org</a>?
            </>
          }
          extraClassNames="tooltip-error tooltip-suggest"
          dismissible
        >
          dismissible = true
        </FieldWithDismissible>
      ) : (
        <Field>default</Field>
      )}
    </MockPage>
  );

  return story;
};

const storyWithMultipleFields = ({
  attributes = [{ showBelow: true }],
}: {
  attributes: {
    showBelow?: boolean;
    clientHeight?: number;
    fieldText?: string;
  }[];
}) => {
  const story = () => (
    <MockPage>
      {attributes.map((attribute) => (
        <Field
          clientHeight={attribute.clientHeight}
          showBelow={attribute.showBelow}
        >
          {attribute.fieldText}
        </Field>
      ))}
    </MockPage>
  );

  return story;
};

// one field
export const Default = storyWithOneField(false);
export const Dismissible = storyWithOneField(true);

// multiple fields
export const ShowBelow = storyWithMultipleFields({
  attributes: [
    {
      showBelow: false,
      fieldText: 'showBelow = false',
    },
    {
      fieldText: 'showBelow default',
    },
    {
      showBelow: true,
      fieldText: 'showBelow = true',
    },
  ],
});

export const clientHeight = storyWithMultipleFields({
  attributes: [
    {
      clientHeight: 300,
      fieldText: 'clientHeight = 300',
    },
    {
      showBelow: false,
      clientHeight: 300,
      fieldText: 'clientHeight = 300, showBelow = false',
    },
    {
      clientHeight: 1000,
      fieldText: 'clientHeight = 1000',
    },
  ],
});
