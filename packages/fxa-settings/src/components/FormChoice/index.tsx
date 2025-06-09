/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { useForm } from 'react-hook-form';

export type FormChoiceOption = {
  id: string;
  value: FormChoiceData['choice'];
  image: ReactElement;
  localizedChoiceBadge?: string;
  localizedChoiceTitle: string;
  localizedChoiceInfo: string;
};

export type FormChoiceProps = {
  legendEl: ReactElement;
  imagePosition?: 'start' | 'end';
  contentAlignVertical?: 'top' | 'center';
  formChoices: FormChoiceOption[];
  onSubmit: (data: FormChoiceData) => void;
  isSubmitting: boolean;
};

export const CHOICES = {
  phone: 'phone',
  code: 'code',
} as const;

export type Choice = (typeof CHOICES)[keyof typeof CHOICES];

export type FormChoiceData = {
  choice: Choice;
};

const FormChoice = ({
  legendEl,
  imagePosition = 'start',
  contentAlignVertical = 'center',
  formChoices,
  onSubmit,
  isSubmitting,
}: FormChoiceProps) => {
  const { register, handleSubmit, watch } = useForm<FormChoiceData>();
  const selectedOption = watch('choice');
  const startAlignImage = imagePosition === 'start';

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        {legendEl}

        {/* When we no longer use these classes in content-server, we should use
         components instead of class abstractions where possible */}
        {formChoices.map((choice) => (
          <div className="input-radio-wrapper" key={choice.id}>
            <input
              className="input-radio"
              type="radio"
              id={choice.id}
              name="choice"
              value={choice.value}
              ref={register({ required: true })}
            />
            <label
              className={classNames(
                'input-radio-label w-full',
                contentAlignVertical === 'center' && 'items-center'
              )}
              htmlFor={choice.id}
            >
              {startAlignImage && <div>{choice.image}</div>}
              <div className={startAlignImage ? 'ps-6' : 'pe-6'}>
                <strong className="block mb-1 text-base">
                  {choice.localizedChoiceTitle}
                </strong>
                {choice.localizedChoiceBadge && (
                  <span className="h-6 px-2 py-1 mb-1 flex w-fit bg-blue-50 rounded items-center text-sm text-blue-900 font-semibold">
                    {choice.localizedChoiceBadge}
                  </span>
                )}
                <span className="text-sm">{choice.localizedChoiceInfo}</span>
              </div>
              {!startAlignImage && <div>{choice.image}</div>}
            </label>
          </div>
        ))}
      </fieldset>

      <div className="flex mt-6">
        <button
          className="cta-primary cta-xl"
          type="submit"
          disabled={!selectedOption || isSubmitting}
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default FormChoice;
