## Why these fonts?

These fonts are used to generate recovery key PDFs client-side with @react-pdf in fxa-settings.

## Why Noto?

Noto is a collection of fonts with multiple weights and widths in sans, serif, mono, and other styles. This family of fonts supports more than 1,000 languages and over 150 writing systems.

Read more: https://fonts.google.com/noto
These fonts are licensed under the [Open Font License](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL).

For most of the locales supported by Firefox accounts (see `supportedLanguages.json`), we can default to the standard Noto Sans, with a few exceptions that require specific fonts:

- Chinese: Noto Sans SC
- Georgian: Noto Sans Georgian
- Hebrew: Noto Sans Hebrew
- Japanese: Noto Sans JP
- Korean: Noto Sans KR
- Punjabi: Noto Sans Gurmukhi
- Thai: Noto Sans Thai

## Adding new fonts/locales for PDF localization

New fonts (e.g., for additional languages or font weights/styles) must be registered for use by react-pdf.

1. Add required font files to `assets/fonts`
2. Verify if new type declarations need to be added for typescript to recognize the font files as valid import modules. Currently, `*.ttf` and `*.otf` are included - if the fonts have another extension, add it to the `fonts.d.ts`.
3. Import the font(s) in `ButtonDownloadRecoveryPDF/index.tsx`
4. Add a new case to the switch in `ButtonDownloadRecoveryPDF/GetRequiredFont.tsx` for the new locale (see exisiting examples in the file and consult react-pdf docs: https://react-pdf.org/fonts#register).
