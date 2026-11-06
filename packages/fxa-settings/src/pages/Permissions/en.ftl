## Permissions page
## Users see this page during sign-in or sign-up when a relying party is not a
## trusted Mozilla application, or when it asks for consent explicitly.
## The page informs the user which profile information the relying party can
## read. It does not offer a choice.

# Variable $serviceName is the name of the relying party, e.g. "321Done"
permissions-heading = { $serviceName } wants access to:
permissions-label-email = Email address
permissions-label-display-name = Display name
permissions-label-avatar = Account picture
permissions-continue-button = Continue
permissions-cancel-button = Cancel

# Browser tab title for the page where the user reviews the profile information an app or service is asking to access.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
permissions-page-title = Review permissions
