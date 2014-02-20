# l10n

This directory contains translated strings for all supported locales. Strings are extracted using a gettext compatible extractor, generating `PO` template files.

## Adding new strings

If you add a new string to the app or server, you'll need to wrap it in a `gettext` call so it can be extracted. In a mustache template, that will look like `{{#t}}My new string{{/t}}` and in a JavaScript it will look like `t("My new string")` (`t` is an alias for `gettext`).

After you've added new strings to source, you'll need to extract them and update the `.pot` files, using grunt:

    grunt extract-l10n

This will also update the other locales with any new strings.

## Updating translations

Translators will update the `.po` files in this repo directly. To convert the new translations into JSON for the app to use, run:

    grunt po2json

The JSON is not included under version control– they're regenerated on each deployment.
