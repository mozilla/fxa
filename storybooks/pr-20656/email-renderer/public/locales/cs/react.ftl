## FxA React - Strings shared between multiple FxA products for application error dialog

app-something-went-wrong-heading = Něco se pokazilo
app-something-went-wrong-message = O tomto problému jsme byli informováni. Obnovte stránku a zkuste to znovu.
# $errorId (String) - Unique identifier for the error report, used to look it up in our monitoring system
app-error-id = ID chyby: { $errorId }
# Expandable toggle that reveals technical details about the error
app-error-details-summary = Podrobnosti o chybě
# Specific handling for issues when bad or missing query parameters are detected
app-query-parameter-err-heading = Špatný požadavek: neplatné parametry v dotazu

## FxA React - Strings shared between multiple FxA products for application footer

app-footer-mozilla-logo-label = logo { -brand-mozilla(case: "gen") }
app-footer-privacy-notice = Zásady ochrany osobních údajů
app-footer-terms-of-service = Podmínky služby

## FxA React - Strings shared between multiple FxA products for application page title

# This string is used as the default title for pages, displayed in the browser tab.
app-default-title-2 = { -product-mozilla-accounts }
# This string is used as the title of the page, displayed in the browser tab.
# Variables:
#   $title (String) - the name of the current page
#                      (for example: "Two-step authentication")
app-page-title-2 = { $title } | { -product-mozilla-accounts }

## FxA React - Strings shared between multiple FxA products for external link

# Message for screen readers, to announce that external link will open in new window
link-sr-new-window = Otevře se v novém okně

## FxA React - Strings shared between multiple FxA products for loading spinner

# Aria label for spinner image indicating data is loading
app-loading-spinner-aria-label-loading = Načítání…

## FxA React - Strings shared between multiple FxA products for logo lockup

app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m
