/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';
import { useForm } from 'react-hook-form';

export type FormChoiceOption = {
  id: string;
  value: FormChoiceData['choice'];
  image: ReactElement;
  localizedChoiceTitle: string;
  localizedChoiceInfo: string;
};

export type FormChoiceProps = {
  legendEl: ReactElement;
  alignImage?: 'start' | 'end';
  formChoices: FormChoiceOption[];
  onSubmit: (data: FormChoiceData) => void;
  isSubmitting: boolean;
};

export const CHOICES = {
  phone: 'phone',
  code: 'code',
} as const;

export type FormChoiceData = {
  choice: (typeof CHOICES)[keyof typeof CHOICES];
};

const FormChoice = ({
  legendEl,
  alignImage = 'start',
  formChoices,
  onSubmit,
  isSubmitting,
}: FormChoiceProps) => {
  const { register, handleSubmit, watch } = useForm<FormChoiceData>();
  const selectedOption = watch('choice');
  const startAlignImage = alignImage === 'start';

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
              className="input-radio-label w-full items-center"
              htmlFor={choice.id}
            >
              {startAlignImage && <div>{choice.image}</div>}
              <div className={startAlignImage ? 'ps-6' : 'pe-6'}>
                <strong className="block mb-1 text-base">
                  {choice.localizedChoiceTitle}
                </strong>
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
