## FxA React - Strings shared between multiple FxA products for application error dialog

app-something-went-wrong-heading = Hi ha hagut un problema
app-something-went-wrong-message = Se'ns ha notificat el problema. Actualitzeu la pàgina per tornar-ho a provar.
# $errorId (String) - Unique identifier for the error report, used to look it up in our monitoring system
app-error-id = ID d'error: { $errorId }
# Expandable toggle that reveals technical details about the error
app-error-details-summary = Detalls de l'error
# Specific handling for issues when bad or missing query parameters are detected
app-query-parameter-err-heading = Sol·licitud incorrecta: Paràmetres de consulta no vàlids

## FxA React - Strings shared between multiple FxA products for application footer

app-footer-mozilla-logo-label = Logotip del { -brand-mozilla }
app-footer-privacy-notice = Avís de privadesa del lloc web
app-footer-terms-of-service = Condicions del servei

## FxA React - Strings shared between multiple FxA products for application page title

# This string is used as the default title for pages, displayed in the browser tab.
app-default-title-2 = { -product-mozilla-accounts(capitalization: "uppercase") }
# This string is used as the title of the page, displayed in the browser tab.
# Variables:
#   $title (String) - the name of the current page
#                      (for example: "Two-step authentication")
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "uppercase") }

## FxA React - Strings shared between multiple FxA products for external link

# Message for screen readers, to announce that external link will open in new window
link-sr-new-window = S'obre en una finestra nova

## FxA React - Strings shared between multiple FxA products for loading spinner

# Aria label for spinner image indicating data is loading
app-loading-spinner-aria-label-loading = S'està carregant…

## FxA React - Strings shared between multiple FxA products for logo lockup

app-logo-alt-3 =
    .alt = Logotip m de { -brand-mozilla }
