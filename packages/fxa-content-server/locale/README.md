# l10n

This directory contains translated strings for all supported locales. Strings are extracted using a gettext compatible extractor, generating `PO` template files.

## Adding new strings

If you add a new string to the app or server, you'll need to wrap it in a `gettext` call so it can be extracted. In a mustache template, that will look like `{{#t}}My new string{{/t}}` and in a JavaScript it will look like `t("My new string")` (`t` is an alias for `gettext`).

After you've added new strings to source, you'll need to extract them and update the `.pot` files, using grunt:

    grunt extract-l10n

## Updating the l10n repo

After extracting new strings, you'll have to update the l10n repo so that localizers can begin translation.

First, check out the l10n repo from github:

  git clone https://github.com/mozilla/fxa-content-server-l10n.git

Then copy the .pot files to that repo:

  cp -r locale/templates/ ../fxa-content-server-l10n/locale/templates/

Then run `merge_po.sh` from within fxa-content-server-l10n:

  ./scripts/merge_po.sh locale

Commit the merged .po files to master and enjoy.

## Updating translations

Translators will update the `.po` files in the l10n repo, which are downloaded as a bower dependency. To convert the new translations into JSON for the app to use, run:

    grunt l10n-create-json

The JSON is not included under version control– they're regenerated on each deployment.
