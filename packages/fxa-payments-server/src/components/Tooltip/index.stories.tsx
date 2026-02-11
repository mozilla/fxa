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

const storyWithOneField = (dismissable: boolean, storyName?: string) => {
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

  if (storyName) story.storyName = storyName;
  return story;
};

const storyWithMultipleFields = (
  attributes: {
    showBelow?: boolean;
    clientHeight?: number;
    fieldText?: string;
  }[],
  storyName?: string
) => {
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

  if (storyName) story.storyName = storyName;
  return story;
};

// one field
export const Default = storyWithOneField(false, 'default');
export const Dismissible = storyWithOneField(true, 'dismissible');

// multiple fields
export const ShowBelow = storyWithMultipleFields(
  [
    {
      showBelow: false,
      clientHeight: undefined,
      fieldText: 'showBelow = false',
    },
    {
      showBelow: true,
      clientHeight: undefined,
      fieldText: 'showBelow default',
    },
    {
      showBelow: true,
      clientHeight: undefined,
      fieldText: 'showBelow = true',
    },
  ],
  'showBelow'
);

export const clientHeight = storyWithMultipleFields(
  [
    {
      showBelow: true,
      clientHeight: 300,
      fieldText: 'clientHeight = 300',
    },
    {
      showBelow: false,
      clientHeight: 300,
      fieldText: 'clientHeight = 300, showBelow = false',
    },
    {
      showBelow: true,
      clientHeight: 1000,
      fieldText: 'clientHeight = 1000',
    },
  ],
  'clientHeight'
);
