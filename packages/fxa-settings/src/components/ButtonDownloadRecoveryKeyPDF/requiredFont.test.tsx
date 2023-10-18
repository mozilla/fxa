/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getRequiredFont } from './requiredFont';

describe('getRequiredFont', () => {
  it('returns the default font when the languages is unknown or not recognized', async () => {
    const requiredFont = getRequiredFont('unknown');
    expect(requiredFont.family).toEqual('Noto Sans');
    expect(requiredFont.direction).toEqual('ltr');
  });

  it('returns the expected font data when the language is Chinese (mainland)', async () => {
    const requiredFont = getRequiredFont('zh-cn');
    expect(requiredFont.family).toEqual('Noto Sans SC');
    expect(requiredFont.direction).toEqual('ltr');
  });

  it('returns the expected font data when the language is Chinese (Taiwan)', async () => {
    const requiredFont = getRequiredFont('zh-tw');
    expect(requiredFont.family).toEqual('Noto Sans TC');
    expect(requiredFont.direction).toEqual('ltr');
  });

  it('returns the expected font data when the language is Georgian', async () => {
    const requiredFont = getRequiredFont('zh-tw');
    expect(requiredFont.family).toEqual('Noto Sans TC');
    expect(requiredFont.direction).toEqual('ltr');
  });

  it('returns the expected font data when the language is Hebrew', async () => {
    let requiredFont = getRequiredFont('he');
    expect(requiredFont.family).toEqual('Noto Sans Hebrew');
    expect(requiredFont.direction).toEqual('rtl');
  });

  it('returns the expected font data when the language is Japanese', async () => {
    let requiredFont = getRequiredFont('ja');
    expect(requiredFont.family).toEqual('Noto Sans JP');
    expect(requiredFont.direction).toEqual('ltr');

    // can match if lowercase or uppercase
    requiredFont = getRequiredFont('ja-jp');
    expect(requiredFont.family).toEqual('Noto Sans JP');

    requiredFont = getRequiredFont('ja-JP');
    expect(requiredFont.family).toEqual('Noto Sans JP');
  });

  it('returns the expected font data when the language is Korean', async () => {
    const requiredFont = getRequiredFont('ko');
    expect(requiredFont.family).toEqual('Noto Sans KR');
    expect(requiredFont.direction).toEqual('ltr');
  });

  // Punjabi (India) uses Gurmukhi script and is written left-to-right
  // Punjabi (Pakistan) - pa-PK - is currently unsupported and uses Shahmukhi script and is written right-to-left
  it('returns the expected font data when the language is Punjabi', async () => {
    const requiredFont = getRequiredFont('pa');
    expect(requiredFont.family).toEqual('Noto Serif Gurmukhi');
    expect(requiredFont.direction).toEqual('ltr');
  });

  it('returns the expected font data when the language is Thai', async () => {
    const requiredFont = getRequiredFont('th');
    expect(requiredFont.family).toEqual('Noto Sans Thai');
    expect(requiredFont.direction).toEqual('ltr');
  });
});
