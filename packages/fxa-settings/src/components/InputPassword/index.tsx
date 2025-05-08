/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback, ChangeEvent } from 'react';
import InputText, { InputTextProps } from '../InputText';
import { ReactComponent as OpenEye } from './eye-open.svg';
import { ReactComponent as ClosedEye } from './eye-closed.svg';
import { useFtlMsgResolver } from '../../models';

export type InputPasswordProps = Omit<InputTextProps, 'type'> & {
  inputRefDOM?: React.RefObject<HTMLInputElement>;
};

export const InputPassword = ({
  defaultValue,
  disabled,
  label,
  placeholder,
  className,
  onChange,
  onFocusCb,
  onBlurCb,
  inputRef,
  inputRefDOM,
  hasErrors,
  errorText,
  name,
  prefixDataTestId = '',
  tooltipPosition,
  anchorPosition,
}: InputPasswordProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  const [visible, setVisible] = useState<boolean>(false);
  const [srOnlyVisibilityAnnouncement, setSROnlyVisibilityAnnouncement] =
    useState<string>('');

  const localizedPasswordNowVisible = ftlMsgResolver.getMsg(
    'input-password-sr-only-now-visible',
    'Your password is now visible on screen.'
  );
  const localizedPasswordNowHidden = ftlMsgResolver.getMsg(
    'input-password-sr-only-now-hidden',
    'Your password is now hidden.'
  );

  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

  const changeVisibilityStatus = useCallback(() => {
    setSROnlyVisibilityAnnouncement(
      visible ? localizedPasswordNowHidden : localizedPasswordNowVisible
    );
    setVisible(!visible);
  }, [localizedPasswordNowHidden, localizedPasswordNowVisible, visible]);

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange && onChange(event);
    },
    [onChange]
  );

  return (
    <div className="relative">
      <InputText
        type={visible ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        aria-describedby=""
        isPasswordInput={true}
        {...{
          inputRefDOM,
          defaultValue,
          disabled,
          label,
          placeholder,
          onChange: onInputChange,
          onFocusCb,
          onBlurCb,
          className,
          inputRef,
          hasErrors,
          errorText,
          name,
          prefixDataTestId,
          tooltipPosition,
          anchorPosition,
        }}
      ></InputText>
      <button
        type="button"
        data-testid={formatDataTestId('visibility-toggle')}
        className="absolute end-0 inset-y-0 my-auto mx-2 px-2 text-grey-500 box-content"
        onClick={changeVisibilityStatus}
        title={
          visible
            ? ftlMsgResolver.getMsg('input-password-hide', 'Hide password')
            : ftlMsgResolver.getMsg('input-password-show', 'Show password')
        }
        aria-label={
          visible
            ? ftlMsgResolver.getMsg(
                'input-password-hide-aria-2',
                'Your password is currently visible on screen.'
              )
            : ftlMsgResolver.getMsg(
                'input-password-show-aria-2',
                'Your password is currently hidden.'
              )
        }
        aria-pressed={visible ? 'true' : 'false'}
      >
        {visible ? (
          <ClosedEye
            width="24"
            height="24"
            className="stroke-current"
            aria-hidden="true"
          />
        ) : (
          <OpenEye
            width="24"
            height="18"
            className="stroke-current"
            aria-hidden="true"
          />
        )}
      </button>
      {srOnlyVisibilityAnnouncement && (
        <span id="visibility-status" className="sr-only" aria-live="polite">
          {srOnlyVisibilityAnnouncement}
        </span>
      )}
    </div>
  );
};

export default InputPassword;
