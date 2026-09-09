## FxA React - Strings shared between multiple FxA products for application error dialog

app-something-went-wrong-heading = Coś się nie powiodło
app-something-went-wrong-message = Zostaliśmy poinformowani o tym problemie. Odśwież stronę i spróbuj ponownie.
# $errorId (String) - Unique identifier for the error report, used to look it up in our monitoring system
app-error-id = Identyfikator błędu: { $errorId }
# Expandable toggle that reveals technical details about the error
app-error-details-summary = Informacje o błędzie
# Specific handling for issues when bad or missing query parameters are detected
app-query-parameter-err-heading = Błędne żądanie: nieprawidłowe parametry zapytania

## FxA React - Strings shared between multiple FxA products for application footer

app-footer-mozilla-logo-label = Logo { -brand-mozilla(case: "gen") }
app-footer-privacy-notice = Zasady ochrony prywatności
app-footer-terms-of-service = Regulamin usługi

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
link-sr-new-window = Otwiera w nowym oknie

## FxA React - Strings shared between multiple FxA products for loading spinner

# Aria label for spinner image indicating data is loading
app-loading-spinner-aria-label-loading = Wczytywanie…

## FxA React - Strings shared between multiple FxA products for logo lockup

app-logo-alt-3 =
    .alt = Logo „m” { -brand-mozilla(case: "gen") }
