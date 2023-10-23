/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { determineDirection } from './determine-direction';

describe('l10n/determineDirection:', () => {
  it('defaults to ltr for undefined locale', () => {
    const s: any = undefined;
    expect(determineDirection(s)).toEqual('ltr');
  });

  it('defaults to ltr for non-sense langauge', () => {
    expect(determineDirection('wibble')).toEqual('ltr');
  });

  it('resolves to ltr for a selection of ltr languages', () => {
    expect(determineDirection('fr')).toEqual('ltr');
    expect(determineDirection('de')).toEqual('ltr');
    expect(determineDirection('zh')).toEqual('ltr');
  });

  // arabic is not currently supported, and strings will be displayed in English
  // direction must be LTR for English even if requested locale is arabic
  it('resolves to ltr for unspported ltr language', () => {
    expect(determineDirection('ar')).toEqual('ltr');
  });

  it('resolves to rtl for hebrew', () => {
    expect(determineDirection('he')).toEqual('rtl');
  });

  it('it ignores case and resovles to rtl for hebrew', () => {
    expect(determineDirection('he-il')).toEqual('rtl');
    expect(determineDirection('he-IL')).toEqual('rtl');
  });
});
