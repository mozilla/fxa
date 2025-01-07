/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormChoice, { FormChoiceProps } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { commonFormChoiceProps } from './mocks';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function render({
  alignImage = 'start',
}: Pick<FormChoiceProps, 'alignImage'> = {}) {
  renderWithLocalizationProvider(
    <FormChoice {...commonFormChoiceProps} {...{ alignImage }} />
  );
}

describe('FormChoice', () => {
  it('renders as expected', () => {
    render();

    expect(
      within(
        screen.getByRole('group').querySelector('legend') as HTMLLegendElement
      ).getByText('I am (form) legend')
    ).toBeInTheDocument();

    // Number of inputs matches the number of form choices
    const inputs = screen.getAllByRole('radio');
    expect(inputs).toHaveLength(commonFormChoiceProps.formChoices.length);

    commonFormChoiceProps.formChoices.forEach((choice, index) => {
      const input = inputs[index];
      const label = document.querySelector(`label[for="${choice.id}"]`);

      // Verify labels, htmlFor, and input ID
      expect(input.id).toBe(choice.id);
      expect(label).toBeInTheDocument();
      expect(label?.tagName).toBe('LABEL');
      expect(label?.getAttribute('for')).toBe(choice.id);

      // Titles/descriptions
      const titleElement = screen.getByText(choice.localizedChoiceTitle);
      expect(titleElement.tagName).toBe('STRONG');
      expect(screen.getByText(choice.localizedChoiceInfo)).toBeInTheDocument();
    });

    // Check if the image is on the left when alignImage is 'start'
    const firstLabel = screen.getAllByRole('radio')[0].closest('label');
    const firstImage = firstLabel?.querySelector('svg');
    const firstTextContainer = firstLabel?.querySelector('div:nth-child(2)');

    expect(firstImage?.nextElementSibling).toBe(firstTextContainer);
  });

  it('renders as expected when `alignImage` is `end`', () => {
    render({ alignImage: 'end' });
    const firstLabel = screen.getAllByRole('radio')[0].closest('label');
    const firstImage = firstLabel?.querySelector('svg');
    const firstTextContainer = firstLabel?.querySelector('div:nth-child(1)');

    expect(firstTextContainer?.nextElementSibling).toBe(firstImage);
  });

  it('disables the submit button until user selects an option', async () => {
    render();
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /continue/i });
    expect(submitButton).toBeDisabled();
    const firstRadio = screen.getByLabelText(
      commonFormChoiceProps.formChoices[0].localizedChoiceTitle,
      { exact: false }
    );
    await act(async () => {
      await user.click(firstRadio);
    });

    expect(submitButton).toBeEnabled();
  });
});
