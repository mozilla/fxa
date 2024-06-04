/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import Subject from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

describe('TotpInputGroup component', () => {
  it('renders as expected for 6 digit code', () => {
    renderWithLocalizationProvider(<Subject codeLength={6} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('renders as expected for 8 digit code', () => {
    renderWithLocalizationProvider(<Subject codeLength={8} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(8);
  });

  describe('keyboard navigation', () => {
    it('can navigate between inputs with arrow keys', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject codeLength={6} />);
      const inputs = screen.getAllByRole('textbox');

      await waitFor(() =>
        user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }))
      );

      await waitFor(() => {
        user.keyboard('[ArrowRight]');
      });
      expect(inputs[1]).toHaveFocus();

      await waitFor(() => {
        user.keyboard('[ArrowLeft]');
      });
      expect(inputs[0]).toHaveFocus();
    });

    it('can backspace between inputs', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject codeLength={6} />);

      await waitFor(() =>
        user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }))
      );

      // type in each input
      for (let i = 1; i <= 6; i++) {
        await waitFor(() =>
          user.type(
            screen.getByRole('textbox', { name: `Digit ${i} of 6` }),
            i.toString()
          )
        );
      }

      // all inputs have values
      for (let i = 1; i <= 6; i++) {
        expect(
          screen.getByRole('textbox', { name: `Digit ${i} of 6` })
        ).toHaveValue(i.toString());
      }

      // focus is on last edited input
      expect(
        screen.getByRole('textbox', { name: 'Digit 6 of 6' })
      ).toHaveFocus();

      await waitFor(() => {
        user.keyboard('[Backspace]');
      });

      // last input is cleared
      expect(screen.getByRole('textbox', { name: 'Digit 6 of 6' })).toHaveValue(
        ''
      );

      // and focus shifts to previous input
      expect(
        screen.getByRole('textbox', { name: 'Digit 5 of 6' })
      ).toHaveFocus();
    });

    it('can forward delete inputs', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject codeLength={6} />);

      await waitFor(() =>
        user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }))
      );

      // type in each input
      for (let i = 1; i <= 6; i++) {
        await waitFor(() =>
          user.type(
            screen.getByRole('textbox', { name: `Digit ${i} of 6` }),
            i.toString()
          )
        );
      }

      // all inputs have values
      for (let i = 1; i <= 6; i++) {
        expect(
          screen.getByRole('textbox', { name: `Digit ${i} of 6` })
        ).toHaveValue(i.toString());
      }

      await waitFor(() => {
        user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }));
      });

      await waitFor(() => {
        user.keyboard('[Delete]');
      });

      // current input is cleared
      expect(screen.getByRole('textbox', { name: 'Digit 1 of 6' })).toHaveValue(
        ''
      );

      // and focus shifts to next input
      expect(
        screen.getByRole('textbox', { name: 'Digit 2 of 6' })
      ).toHaveFocus();
    });
  });

  describe('paste into inputs', () => {
    it('distributes clipboard content to inputs', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject codeLength={6} />);

      await waitFor(() =>
        user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }))
      );

      // inputs initially have no value
      for (let i = 1; i <= 6; i++) {
        expect(
          screen.getByRole('textbox', { name: `Digit ${i} of 6` })
        ).toHaveValue('');
      }

      await waitFor(() =>
        user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }))
      );

      await waitFor(() => {
        user.paste('123456');
      });

      // clipboard values are distributed between inputs
      for (let i = 1; i <= 6; i++) {
        expect(
          screen.getByRole('textbox', { name: `Digit ${i} of 6` })
        ).toHaveValue(i.toString());
      }
    });

    it('skips non-numeric characters in clipboard', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject codeLength={6} />);

      await waitFor(() =>
        user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }))
      );

      // inputs initially have no value
      for (let i = 1; i <= 6; i++) {
        expect(
          screen.getByRole('textbox', { name: `Digit ${i} of 6` })
        ).toHaveValue('');
      }

      await waitFor(() =>
        user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }))
      );

      await waitFor(() => {
        user.paste('1b2$3 4B5.6?');
      });

      // clipboard values are distributed between inputs
      for (let i = 1; i <= 6; i++) {
        expect(
          screen.getByRole('textbox', { name: `Digit ${i} of 6` })
        ).toHaveValue(i.toString());
      }
    });
  });
});
