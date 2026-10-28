## FxA React - Strings shared between multiple FxA products for application error dialog

app-something-went-wrong-heading = Une erreur s’est produite
app-something-went-wrong-message = Nous avons été informés du problème. Actualisez la page pour réessayer.
# $errorId (String) - Unique identifier for the error report, used to look it up in our monitoring system
app-error-id = Identifiant de l’erreur : { $errorId }
# Expandable toggle that reveals technical details about the error
app-error-details-summary = Détails de l’erreur
# Specific handling for issues when bad or missing query parameters are detected
app-query-parameter-err-heading = Requête incorrecte : paramètres de requête invalides

## FxA React - Strings shared between multiple FxA products for application footer

app-footer-mozilla-logo-label = Logo { -brand-mozilla }
app-footer-privacy-notice = Politique de confidentialité des sites web
app-footer-terms-of-service = Conditions d’utilisation

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
link-sr-new-window = S’ouvre dans une nouvelle fenêtre

## FxA React - Strings shared between multiple FxA products for loading spinner

# Aria label for spinner image indicating data is loading
app-loading-spinner-aria-label-loading = Chargement…

## FxA React - Strings shared between multiple FxA products for logo lockup

app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m
