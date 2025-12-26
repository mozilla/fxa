# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Er is een nieuwe code naar uw e-mailadres verzonden.
resend-link-success-banner-heading = Er is een nieuwe koppeling naar uw e-mailadres verzonden.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Voeg { $accountsEmail } toe aan uw contacten om een probleemloze levering te garanderen.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Banner sluiten
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } wordt op 1 november omgedoopt naar { -product-mozilla-accounts }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = U meldt nog steeds aan met dezelfde gebruikersnaam en hetzelfde wachtwoord, en er zijn geen andere wijzigingen in de producten die u gebruikt.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = We hebben { -product-firefox-accounts } hernoemd naar { -product-mozilla-accounts }. U meldt nog steeds aan met dezelfde gebruikersnaam en hetzelfde wachtwoord, en er zijn geen andere wijzigingen in de producten die u gebruikt.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Meer info
# Alt text for close banner image
brand-close-banner =
    .alt = Banner sluiten
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m-logo

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Terug
button-back-title = Terug

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Downloaden en doorgaan
    .title = Downloaden en doorgaan
recovery-key-pdf-heading = Accountherstelsleutel
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Aangemaakt: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Accountherstelsleutel
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Met deze sleutel kunt u uw versleutelde browsergegevens (inclusief wachtwoorden, bladwijzers en geschiedenis) herstellen als u uw wachtwoord vergeet. Bewaar hem op een plek die u kunt onthouden.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Plaatsen om uw sleutel op te slaan
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Meer info over uw accountherstelsleutel
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Sorry, er is een probleem opgetreden bij het downloaden van uw accountherstelsleutel.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Meer van { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Ontvang ons laatste nieuws en productupdates
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Vroege toegang om nieuwe producten te testen
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Actiewaarschuwingen om het internet terug te eisen

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Gedownload
datablock-copy =
    .message = Gekopieerd
datablock-print =
    .message = Afgedrukt

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Code gekopieerd
       *[other] Codes gekopieerd
    }
datablock-download-success =
    { $count ->
        [one] Code gedownload
       *[other] Codes gedownload
    }
datablock-print-success =
    { $count ->
        [one] Code afgedrukt
       *[other] Codes afgedrukt
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Gekopieerd

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (geschat)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (geschat)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (geschat)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (geschat)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Locatie onbekend
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } op { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-adres: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Wachtwoord
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Herhaal wachtwoord
form-password-with-inline-criteria-signup-submit-button = Account aanmaken
form-password-with-inline-criteria-reset-new-password =
    .label = Nieuw wachtwoord
form-password-with-inline-criteria-confirm-password =
    .label = Bevestig wachtwoord
form-password-with-inline-criteria-reset-submit-button = Nieuw wachtwoord aanmaken
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Wachtwoord
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Herhaal wachtwoord
form-password-with-inline-criteria-set-password-submit-button = Begin met synchroniseren
form-password-with-inline-criteria-match-error = Wachtwoorden komen niet overeen
form-password-with-inline-criteria-sr-too-short-message = Wachtwoord dient ten minste 8 tekens te bevatten.
form-password-with-inline-criteria-sr-not-email-message = Wachtwoord mag niet uw e-mailadres bevatten.
form-password-with-inline-criteria-sr-not-common-message = Wachtwoord mag geen veelgebruikt wachtwoord zijn.
form-password-with-inline-criteria-sr-requirements-met = Het ingevoerde wachtwoord voldoet aan alle wachtwoordvereisten.
form-password-with-inline-criteria-sr-passwords-match = Ingevoerde wachtwoorden komen overeen.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Dit veld is verplicht

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Voer een { $codeLength }-cijferige code in om door te gaan
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Voer een code van { $codeLength } tekens in om door te gaan

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox }-accountherstelsleutel
get-data-trio-title-backup-verification-codes = Reserve-authenticatiecodes
get-data-trio-download-2 =
    .title = Downloaden
    .aria-label = Downloaden
get-data-trio-copy-2 =
    .title = Kopiëren
    .aria-label = Kopiëren
get-data-trio-print-2 =
    .title = Afdrukken
    .aria-label = Afdrukken

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Waarschuwing
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Attentie
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Waarschuwing
authenticator-app-aria-label =
    .aria-label = Authenticator-toepassing
backup-codes-icon-aria-label-v2 =
    .aria-label = Reserve-authenticatiecodes ingeschakeld
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Reserve-authenticatiecodes uitgeschakeld
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Herstel-sms ingeschakeld
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Herstel-sms uitgeschakeld
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Canadese vlag
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Vinkje
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Geslaagd
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Ingeschakeld
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Bericht sluiten
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Code
error-icon-aria-label =
    .aria-label = Fout
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informatie
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Amerikaanse vlag

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Een computer en een mobiele telefoon en op beide een afbeelding van een gebroken hart
hearts-verified-image-aria-label =
    .aria-label = Een computer en een mobiele telefoon en een tablet met op elk een kloppend hart
signin-recovery-code-image-description =
    .aria-label = Document dat verborgen tekst bevat.
signin-totp-code-image-label =
    .aria-label = Een apparaat met een verborgen 6-cijferige code.
confirm-signup-aria-label =
    .aria-label = Een envelop met een koppeling
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Illustratie om een sleutel voor accountherstel weer te geven.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Illustratie om een sleutel voor accountherstel weer te geven.
password-image-aria-label =
    .aria-label = Een illustratie om het invoeren van een wachtwoord weer te geven.
lightbulb-aria-label =
    .aria-label = Illustratie om het maken van een opslaghint weer te geven.
email-code-image-aria-label =
    .aria-label = Illustratie om een e-mailbericht met een code weer te geven.
recovery-phone-image-description =
    .aria-label = Mobiel apparaat dat een code per sms ontvangt.
recovery-phone-code-image-description =
    .aria-label = Code ontvangen op een mobiel apparaat.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobiel apparaat met sms-mogelijkheden
backup-authentication-codes-image-aria-label =
    .aria-label = Apparaatscherm met codes
sync-clouds-image-aria-label =
    .aria-label = Wolken met een synchronisatiepictogram
confetti-falling-image-aria-label =
    .aria-label = Geanimeerde vallende confetti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = U bent aangemeld bij { -brand-firefox }.
inline-recovery-key-setup-create-header = Beveilig uw account
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Hebt u even de tijd om uw gegevens te beschermen?
inline-recovery-key-setup-info = Maak een accountherstelsleutel aan, zodat u uw gesynchroniseerde navigatiegegevens kunt herstellen als u ooit uw wachtwoord vergeet.
inline-recovery-key-setup-start-button = Accountherstelsleutel aanmaken
inline-recovery-key-setup-later-button = Later

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Wachtwoord verbergen
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Wachtwoord tonen
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Uw wachtwoord is momenteel zichtbaar op het scherm.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Uw wachtwoord is momenteel verborgen.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Uw wachtwoord is nu zichtbaar op het scherm.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Uw wachtwoord is nu verborgen.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Land selecteren
input-phone-number-enter-number = Voer telefoonnummer in
input-phone-number-country-united-states = Verenigde Staten
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Terug

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Herinitialisatiekoppeling beschadigd
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Bevestigingskoppeling beschadigd
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Koppeling beschadigd
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = De koppeling waarop u hebt geklikt miste tekens en is mogelijk beschadigd geraakt door uw e-mailclient. Kopieer het adres zorgvuldig en probeer het opnieuw.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Nieuwe koppeling ontvangen

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Wachtwoord onthouden?
# link navigates to the sign in page
remember-password-signin-link = Aanmelden

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Primair e-mailadres al bevestigd
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Aanmelding is al bevestigd
confirmation-link-reused-message = Die bevestigingskoppeling is al gebruikt, en kan maar één keer worden gebruikt.

## Locale Toggle Component

locale-toggle-select-label = Taal selecteren
locale-toggle-browser-default = Browserstandaard
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Ongeldige aanvraag

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = U hebt dit wachtwoord nodig om toegang te verkrijgen tot alle versleutelde gegevens die u bij ons opslaat.
password-info-balloon-reset-risk-info = Een herinitialisatie betekent mogelijk verlies van gegevens, zoals wachtwoorden en bladwijzers.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Kies een sterk wachtwoord dat u niet op andere websites hebt gebruikt. Zorg ervoor dat het aan de beveiligingsvereisten voldoet:
password-strength-short-instruction = Kies een sterk wachtwoord:
password-strength-inline-min-length = Ten minste 8 tekens
password-strength-inline-not-email = Niet uw e-mailadres
password-strength-inline-not-common = Geen veelgebruikt wachtwoord
password-strength-inline-confirmed-must-match = Bevestiging komt overeen met het nieuwe wachtwoord
password-strength-inline-passwords-match = Wachtwoorden komen overeen

## Notification Promo Banner component

account-recovery-notification-cta = Aanmaken
account-recovery-notification-header-value = Verlies uw gegevens niet als u uw wachtwoord vergeet
account-recovery-notification-header-description = Maak een accountherstelsleutel aan, zodat u uw gesynchroniseerde navigatiegegevens kunt herstellen als u ooit uw wachtwoord vergeet.
recovery-phone-promo-cta = Hersteltelefoonnummer toevoegen
recovery-phone-promo-heading = Voeg extra bescherming toe aan uw account met een hersteltelefoonnummer
recovery-phone-promo-description = U kunt zich nu aanmelden met een eenmalig wachtwoord via sms als u uw app voor tweestapsauthenticatie niet kunt gebruiken.
recovery-phone-promo-info-link = Meer info over herstel en simswaprisico
promo-banner-dismiss-button =
    .aria-label = Banner sluiten

## Ready component

ready-complete-set-up-instruction = Voltooi de installatie door uw nieuwe wachtwoord op uw andere { -brand-firefox }-apparaten in te vullen.
manage-your-account-button = Uw account beheren
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = U kunt { $serviceName } nu gebruiken
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = U bent nu klaar om accountinstellingen te gebruiken
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Uw account is gereed!
ready-continue = Doorgaan
sign-in-complete-header = Aanmelding bevestigd
sign-up-complete-header = Account bevestigd
primary-email-verified-header = Primair e-mailadres bevestigd

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Plaatsen om uw sleutel op te slaan:
flow-recovery-key-download-storage-ideas-folder-v2 = Map op beveiligd apparaat
flow-recovery-key-download-storage-ideas-cloud = Vertrouwde cloudopslag
flow-recovery-key-download-storage-ideas-print-v2 = Afgedrukt fysiek exemplaar
flow-recovery-key-download-storage-ideas-pwd-manager = Wachtwoordenbeheerder

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Voeg een hint toe om uw sleutel te vinden
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Deze hint helpt u herinneren waar u uw accountherstelsleutel hebt opgeslagen. We kunnen hem u tonen als u uw wachtwoord opnieuw instelt om uw gegevens te herstellen.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Voer een hint in (optioneel)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Voltooien
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = De hint moet minder dan 255 tekens bevatten.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = De hint mag geen onveilige Unicode-tekens bevatten. Alleen letters, cijfers, leestekens en symbolen zijn toegestaan.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Waarschuwing
password-reset-chevron-expanded = Waarschuwing samenvouwen
password-reset-chevron-collapsed = Waarschuwing uitvouwen
password-reset-data-may-not-be-recovered = Uw browsergegevens worden mogelijk niet hersteld
password-reset-previously-signed-in-device-2 = Hebt u een apparaat waarop u eerder bent aangemeld?
password-reset-data-may-be-saved-locally-2 = Uw browsergegevens zijn mogelijk op dat apparaat opgeslagen. Stel uw wachtwoord opnieuw in en meld u daar aan om uw gegevens te herstellen en te synchroniseren.
password-reset-no-old-device-2 = Hebt u een nieuw apparaat, maar hebt u geen toegang tot een van uw vorige?
password-reset-encrypted-data-cannot-be-recovered-2 = Sorry, maar uw versleutelde browsergegevens op { -brand-firefox }-servers kunnen niet worden hersteld.
password-reset-warning-have-key = Hebt u een accountherstelsleutel?
password-reset-warning-use-key-link = Gebruik deze nu om uw wachtwoord te herinitialiseren en uw gegevens te behouden

## Alert Bar

alert-bar-close-message = Bericht sluiten

## User's avatar

avatar-your-avatar =
    .alt = Uw avatar
avatar-default-avatar =
    .alt = Standaardavatar

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla }-producten
bento-menu-tagline = Meer producten van { -brand-mozilla } die uw privacy beschermen
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } Browser voor desktop
bento-menu-firefox-mobile = { -brand-firefox } Browser voor mobiel
bento-menu-made-by-mozilla = Gemaakt door { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Download { -brand-firefox } op mobiel of tablet
connect-another-find-fx-mobile-2 = Zoek { -brand-firefox } in de { -google-play } en de { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Download { -brand-firefox } op { -google-play }
connect-another-app-store-image-3 =
    .alt = Download { -brand-firefox } in de { -app-store }

## Connected services section

cs-heading = Verbonden services
cs-description = Alles wat u gebruikt en waarbij u bent aangemeld.
cs-cannot-refresh =
    Sorry, er is een probleem opgetreden bij het vernieuwen van de lijst
    met verbonden services.
cs-cannot-disconnect = Client niet gevonden, verbinding kan niet worden verbroken
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Afgemeld bij { $service }
cs-refresh-button =
    .title = Verbonden services vernieuwen
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Ontbrekende of dubbele items?
cs-disconnect-sync-heading = Verbinding met Sync verbreken

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Uw navigatiegegevens blijven op <span>{ $device }</span> bestaan,
    maar er wordt niet meer met uw account gesynchroniseerd.
cs-disconnect-sync-reason-3 = Wat is de belangrijkste reden om <span>{ $device }</span> te ontkoppelen?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Het apparaat is:
cs-disconnect-sync-opt-suspicious = Verdacht
cs-disconnect-sync-opt-lost = Verloren of gestolen
cs-disconnect-sync-opt-old = Oud of vervangen
cs-disconnect-sync-opt-duplicate = Een duplicaat
cs-disconnect-sync-opt-not-say = Zeg ik liever niet

##

cs-disconnect-advice-confirm = Oké, begrepen
cs-disconnect-lost-advice-heading = Verloren of gestolen apparaat ontkoppeld
cs-disconnect-lost-advice-content-3 = Omdat uw apparaat verloren of gestolen is dient u, om uw gegevens veilig te houden, het wachtwoord van uw { -product-mozilla-account } te wijzigen in uw accountinstellingen. U kunt het beste ook informatie bij de producent van uw apparaat opzoeken over het op afstand wissen van uw gegevens.
cs-disconnect-suspicious-advice-heading = Verdacht apparaat ontkoppeld
cs-disconnect-suspicious-advice-content-2 = Als het ontkoppelde apparaat inderdaad verdacht is, dient u, om uw gegevens veilig te houden, het wachtwoord van uw { -product-mozilla-account } te wijzigen in uw accountinstellingen. U kunt het beste ook alle overige wachtwoorden die u in { -brand-firefox } hebt opgeslagen wijzigen door in de adresbalk about:logins in te typen.
cs-sign-out-button = Afmelden

## Data collection section

dc-heading = Gegevensverzameling en -gebruik
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-browser
dc-subheader-content-2 = { -product-mozilla-accounts } toestaan om technische en interactiegegevens naar { -brand-mozilla } te verzenden.
dc-subheader-ff-content = Als u de technische- en interactiegegevensinstellingen van uw { -brand-firefox }-browser wilt bekijken of bijwerken, opent u de instellingen van { -brand-firefox } en navigeert u naar Privacy en Beveiliging.
dc-opt-out-success-2 = Afmelden succesvol. { -product-mozilla-accounts } stuurt geen technische of interactiegegevens naar { -brand-mozilla }.
dc-opt-in-success-2 = Bedankt! Door deze gegevens te delen helpt u ons { -product-mozilla-accounts } te verbeteren.
dc-opt-in-out-error-2 = Sorry, er is een probleem opgetreden bij het wijzigen van uw voorkeur voor gegevensverzameling
dc-learn-more = Meer info

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }-menu
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Aangemeld als
drop-down-menu-sign-out = Afmelden
drop-down-menu-sign-out-error-2 = Sorry, er is een probleem opgetreden bij het afmelden

## Flow Container

flow-container-back = Terug

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Voer uw wachtwoord opnieuw in voor de veiligheid
flow-recovery-key-confirm-pwd-input-label = Voer uw wachtwoord in
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Accountherstelsleutel aanmaken
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Nieuwe accountherstelsleutel aanmaken

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Accountherstelsleutel aangemaakt – Download en bewaar deze nu
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Met deze sleutel kunt u uw gegevens herstellen als u uw wachtwoord bent vergeten. Download hem nu en bewaar hem op een plek die u kunt onthouden – u kunt later niet meer terugkeren naar deze pagina.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Doorgaan zonder downloaden

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Sleutel voor accountherstel aangemaakt

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Maak een accountherstelsleutel aan voor het geval u uw wachtwoord vergeet
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Uw accountherstelsleutel wijzigen
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = We versleutelen navigatiegegevens – wachtwoorden, bladwijzers en meer. Het is geweldig voor de privacy, maar u kunt uw gegevens verliezen als u uw wachtwoord vergeet.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Daarom is het maken van een accountherstelsleutel zo belangrijk – u kunt deze gebruiken om uw gegevens te herstellen.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Beginnen
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Annuleren

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Maak verbinding met uw authenticator-app
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Stap 1:</strong> scan deze QR-code met een authenticator-app, zoals Duo of Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-code voor het instellen van authenticatie in twee stappen. Scan deze of kies ‘Kunt u de QR-code niet scannen?’ om in plaats daarvan een geheime sleutel voor installatie op te halen.
flow-setup-2fa-cant-scan-qr-button = Kunt u de QR-code niet scannen?
flow-setup-2fa-manual-key-heading = Code handmatig invoeren
flow-setup-2fa-manual-key-instruction = <strong>Stap 1:</strong> voer deze code in de authenticator-app van uw voorkeur in.
flow-setup-2fa-scan-qr-instead-button = QR-code scannen?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Meer info over authenticator-apps
flow-setup-2fa-button = Doorgaan
flow-setup-2fa-step-2-instruction = <strong>Stap 2:</strong> voer de code van uw authenticator-app in.
flow-setup-2fa-input-label = Voer 6-cijferige code in
flow-setup-2fa-code-error = Ongeldige of verlopen code. Controleer uw authenticator-app en probeer het opnieuw.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Kies een herstelmethode
flow-setup-2fa-backup-choice-description = Dit maakt aanmelden mogelijk als u geen toegang hebt tot uw mobiele apparaat of authenticator-app.
flow-setup-2fa-backup-choice-phone-title = Hersteltelefoonnummer
flow-setup-2fa-backup-choice-phone-badge = Meest eenvoudig
flow-setup-2fa-backup-choice-phone-info = Ontvang een herstelcode via sms. Momenteel beschikbaar in de VS en Canada.
flow-setup-2fa-backup-choice-code-title = Reserve-authenticatiecodes
flow-setup-2fa-backup-choice-code-badge = Meest veilig
flow-setup-2fa-backup-choice-code-info = Maak en bewaar authenticatiecodes voor eenmalig gebruik.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Meer over herstel en simswaprisico

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Voer reserve-authenticatiecode in
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Bevestig dat u uw codes hebt opgeslagen door er een in te voeren. Zonder deze codes kunt u zich mogelijk niet aanmelden als u uw authenticator-app niet hebt.
flow-setup-2fa-backup-code-confirm-code-input = Voer code van 10 tekens in
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Voltooien

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Reserve-authenticatiecodes opslaan
flow-setup-2fa-backup-code-dl-save-these-codes = Bewaar deze op een plek die u kunt onthouden. Als u geen toegang hebt tot uw authenticator-app, moet u een van de codes invoeren om aan te melden.
flow-setup-2fa-backup-code-dl-button-continue = Doorgaan

##

flow-setup-2fa-inline-complete-success-banner = Authenticatie in twee stappen ingeschakeld
flow-setup-2fa-inline-complete-success-banner-description = Om al uw verbonden apparaten te beschermen, dient u zich overal waar u deze account gebruikt af te melden en vervolgens weer aan te melden met uw nieuwe authenticatie in twee stappen.
flow-setup-2fa-inline-complete-backup-code = Reserve-authenticatiecodes
flow-setup-2fa-inline-complete-backup-phone = Hersteltelefoonnummer
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } code resterend
       *[other] { $count } codes resterend
    }
flow-setup-2fa-inline-complete-backup-code-description = Dit is de veiligste herstelmethode als u zich niet kunt aanmelden met uw mobiele apparaat of authenticator-app.
flow-setup-2fa-inline-complete-backup-phone-description = Dit is de eenvoudigste herstelmethode als u zich niet kunt aanmelden met uw authenticator-app.
flow-setup-2fa-inline-complete-learn-more-link = Hoe dit uw account beschermt
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Doorgaan naar { $serviceName }
flow-setup-2fa-prompt-heading = Authenticatie in twee stappen instellen
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } vereist dat u authenticatie in twee stappen instelt om uw account veilig te houden.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = U kunt elk van <authenticationAppsLink>deze authenticator-apps</authenticationAppsLink> gebruiken om verder te gaan.
flow-setup-2fa-prompt-continue-button = Doorgaan

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Voer verificatiecode in
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Er is per sms een 6-cijferige code verstuurd naar <span>{ $phoneNumber }</span>. Deze code verloopt na 5 minuten.
flow-setup-phone-confirm-code-input-label = Voer 6-cijferige code in
flow-setup-phone-confirm-code-button = Bevestigen
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Code verlopen?
flow-setup-phone-confirm-code-resend-code-button = Code nogmaals versturen
flow-setup-phone-confirm-code-resend-code-success = Code verzonden
flow-setup-phone-confirm-code-success-message-v2 = Hersteltelefoonnummer toegevoegd
flow-change-phone-confirm-code-success-message = Hersteltelefoonnummer gewijzigd

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Verifieer uw telefoonnummer
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = U ontvangt een sms van { -brand-mozilla } met een code om uw nummer te verifiëren. Deel deze code met niemand.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Hersteltelefoonnummers zijn alleen beschikbaar in de Verenigde Staten en Canada. VoIP-nummers en telefoonmaskers worden niet aanbevolen.
flow-setup-phone-submit-number-legal = Door uw nummer op te geven, gaat u ermee akkoord dat we dit opslaan, zodat we u kunnen sms’en voor uitsluitend accountverificatie. Er kunnen kosten voor berichten en gegevens van toepassing zijn.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Code verzenden

## HeaderLockup component, the header in account settings

header-menu-open = Menu sluiten
header-menu-closed = Websitenavigatiemenu
header-back-to-top-link =
    .title = Naar boven
header-back-to-settings-link =
    .title = Terug naar instellingen voor { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Help

## Linked Accounts section

la-heading = Gekoppelde accounts
la-description = U hebt toegang tot de volgende accounts geautoriseerd.
la-unlink-button = Ontkoppelen
la-unlink-account-button = Ontkoppelen
la-set-password-button = Wachtwoord instellen
la-unlink-heading = Ontkoppelen van externe account
la-unlink-content-3 = Weet u zeker dat u uw account wilt ontkoppelen? Als u uw account ontkoppelt, wordt u niet automatisch afgemeld bij uw verbonden services. Om dat te doen, moet u zich handmatig afmelden vanuit de sectie Verbonden services.
la-unlink-content-4 = Voordat u uw account ontkoppelt, moet u een wachtwoord instellen. Zonder wachtwoord kunt u niet aanmelden nadat u uw account hebt ontkoppeld.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Sluiten
modal-cancel-button = Annuleren
modal-default-confirm-button = Bevestigen

## ModalMfaProtected

modal-mfa-protected-title = Voer bevestigingscode in
modal-mfa-protected-subtitle = Help ons te controleren dat u het bent die uw accountgegevens wijzigt
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Voer binnen { $expirationTime } minuut de code in die naar <email>{ $email }</email> is verzonden.
       *[other] Voer binnen { $expirationTime } minuten de code in die naar <email>{ $email }</email> is verzonden.
    }
modal-mfa-protected-input-label = Voer 6-cijferige code in
modal-mfa-protected-cancel-button = Annuleren
modal-mfa-protected-confirm-button = Bevestigen
modal-mfa-protected-code-expired = Code verlopen?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Nieuwe code versturen per e-mail.

## Modal Verify Session

mvs-verify-your-email-2 = Bevestig uw e-mailadres
mvs-enter-verification-code-2 = Voer uw bevestigingscode in
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Voer binnen 5 minuten de bevestigingscode in die naar <email>{ $email }</email> is verzonden.
msv-cancel-button = Annuleren
msv-submit-button-2 = Bevestigen

## Settings Nav

nav-settings = Instellingen
nav-profile = Profiel
nav-security = Beveiliging
nav-connected-services = Verbonden services
nav-data-collection = Gegevensverzameling en -gebruik
nav-paid-subs = Betaalde abonnementen
nav-email-comm = E-mailcommunicatie

## Page2faChange

page-2fa-change-title = Authenticatie in twee stappen wijzigen
page-2fa-change-success = Authenticatie in twee stappen is bijgewerkt
page-2fa-change-success-additional-message = Om al uw verbonden apparaten te beschermen, dient u zich overal waar u deze account gebruikt af te melden en vervolgens weer aan te melden met uw nieuwe authenticatie in twee stappen.
page-2fa-change-totpinfo-error = Er is een fout opgetreden bij het vervangen van uw app voor authenticatie in twee stappen. Probeer het later opnieuw.
page-2fa-change-qr-instruction = <strong>Stap 1:</strong> scan deze QR-code met een authenticator-app, zoals Duo of Google Authenticator. Dit creëert een nieuwe verbinding, oude verbindingen zullen niet meer werken.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Reserve-authenticatiecodes
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Er is een probleem opgetreden bij het vervangen van uw reserve-authenticatiecodes
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Er is een probleem opgetreden bij het aanmaken van uw reserve-authenticatiecodes
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Reserve-authenticatiecodes bijgewerkt
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Reserve-authenticatiecodes aangemaakt
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Bewaar deze op een plek die u kunt onthouden. Uw oude codes worden vervangen nadat u de volgende stap hebt voltooid.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Bevestig dat u uw codes hebt opgeslagen door er één in te voeren. Uw oude reserve-authenticatiecodes worden uitgeschakeld zodra deze stap is voltooid.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Onjuiste reserve-authenticatiecode

## Page2faSetup

page-2fa-setup-title = Authenticatie in twee stappen
page-2fa-setup-totpinfo-error = Er is een fout opgetreden bij het instellen van authenticatie in twee stappen. Probeer het later opnieuw.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Die code is niet juist. Probeer het opnieuw.
page-2fa-setup-success = Authenticatie in twee stappen is ingeschakeld
page-2fa-setup-success-additional-message = Om al uw verbonden apparaten te beschermen, dient u zich overal waar u deze account gebruikt af te melden en vervolgens weer aan te melden met authenticatie in twee stappen.

## Avatar change page

avatar-page-title =
    .title = Profielfoto
avatar-page-add-photo = Foto toevoegen
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Foto maken
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Foto verwijderen
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Foto opnieuw maken
avatar-page-cancel-button = Annuleren
avatar-page-save-button = Opslaan
avatar-page-saving-button = Opslaan…
avatar-page-zoom-out-button =
    .title = Uitzoomen
avatar-page-zoom-in-button =
    .title = Inzoomen
avatar-page-rotate-button =
    .title = Roteren
avatar-page-camera-error = Kon camera niet initialiseren
avatar-page-new-avatar =
    .alt = nieuwe profielafbeelding
avatar-page-file-upload-error-3 = Er is een probleem opgetreden bij het uploaden van uw profielafbeelding
avatar-page-delete-error-3 = Er is een probleem opgetreden bij het verwijderen van uw profielafbeelding
avatar-page-image-too-large-error-2 = De afbeeldingsbestandsgrootte is te groot om te uploaden

## Password change page

pw-change-header =
    .title = Wachtwoord wijzigen
pw-8-chars = Ten minste 8 tekens
pw-not-email = Niet uw e-mailadres
pw-change-must-match = Nieuw wachtwoord komt overeen met bevestiging
pw-commonly-used = Geen veelgebruikt wachtwoord
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Blijf veilig – gebruik wachtwoorden niet opnieuw. Meer tips om <linkExternal>sterke wachtwoorden te maken</linkExternal>.
pw-change-cancel-button = Annuleren
pw-change-save-button = Opslaan
pw-change-forgot-password-link = Wachtwoord vergeten?
pw-change-current-password =
    .label = Voer huidig wachtwoord in
pw-change-new-password =
    .label = Voer nieuw wachtwoord in
pw-change-confirm-password =
    .label = Bevestig nieuw wachtwoord
pw-change-success-alert-2 = Wachtwoord bijgewerkt

## Password create page

pw-create-header =
    .title = Wachtwoord aanmaken
pw-create-success-alert-2 = Wachtwoord ingesteld
pw-create-error-2 = Sorry, er is een probleem opgetreden bij het instellen van uw wachtwoord

## Delete account page

delete-account-header =
    .title = Account verwijderen
delete-account-step-1-2 = Stap 1 van 2
delete-account-step-2-2 = Stap 2 van 2
delete-account-confirm-title-4 = U hebt misschien uw { -product-mozilla-account } verbonden met een of meer van de volgende { -brand-mozilla }-producten of -diensten die u veilig en productief houden op internet:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox }-gegevens  synchroniseren
delete-account-product-firefox-addons = { -brand-firefox }-add-ons
delete-account-acknowledge = Bevestig dat door uw account te verwijderen:
delete-account-chk-box-1-v4 =
    .label = Al uw betaalde abonnementen worden opgezegd
delete-account-chk-box-2 =
    .label = U opgeslagen informatie en functies in { -brand-mozilla }-producten kunt verliezen
delete-account-chk-box-3 =
    .label = Uw opgeslagen informatie mogelijk niet hersteld kan worden, als u dit e-mailadres opnieuw activeert
delete-account-chk-box-4 =
    .label = Alle extensies en thema’s die u op addons.mozilla.org hebt gepubliceerd zullen worden verwijderd
delete-account-continue-button = Doorgaan
delete-account-password-input =
    .label = Voer wachtwoord in
delete-account-cancel-button = Annuleren
delete-account-delete-button-2 = Verwijderen

## Display name page

display-name-page-title =
    .title = Weergavenaam
display-name-input =
    .label = Voer schermnaam in
submit-display-name = Opslaan
cancel-display-name = Annuleren
display-name-update-error-2 = Er is een probleem opgetreden bij het bijwerken van uw schermnaam
display-name-success-alert-2 = Schermnaam bijgewerkt

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Recente accountactiviteit
recent-activity-account-create-v2 = Account aangemaakt
recent-activity-account-disable-v2 = Account uitgeschakeld
recent-activity-account-enable-v2 = Account ingeschakeld
recent-activity-account-login-v2 = Accountaanmelding gestart
recent-activity-account-reset-v2 = Wachtwoordherinitialisatie gestart
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = E-mailbounces gewist
recent-activity-account-login-failure = Accountaanmeldingspoging mislukt
recent-activity-account-two-factor-added = Authenticatie in twee stappen ingeschakeld
recent-activity-account-two-factor-requested = Authenticatie in twee stappen aangevraagd
recent-activity-account-two-factor-failure = Authenticatie in twee stappen mislukt
recent-activity-account-two-factor-success = Authenticatie in twee stappen gelukt
recent-activity-account-two-factor-removed = Authenticatie in twee stappen verwijderd
recent-activity-account-password-reset-requested = Account heeft wachtwoordherinitialisatie aangevraagd
recent-activity-account-password-reset-success = Accountwachtwoord met succes opnieuw ingesteld
recent-activity-account-recovery-key-added = Accountherstelsleutel ingeschakeld
recent-activity-account-recovery-key-verification-failure = Verificatie van accountherstelsleutel mislukt
recent-activity-account-recovery-key-verification-success = Verificatie van accountherstelsleutel gelukt
recent-activity-account-recovery-key-removed = Sleutel voor accountherstel verwijderd
recent-activity-account-password-added = Nieuw wachtwoord toegevoegd
recent-activity-account-password-changed = Wachtwoord gewijzigd
recent-activity-account-secondary-email-added = Secundair e-mailadres toegevoegd
recent-activity-account-secondary-email-removed = Secundair e-mailadres verwijderd
recent-activity-account-emails-swapped = Primaire en secundaire e-mailadressen omgewisseld
recent-activity-session-destroy = Afgemeld bij sessie
recent-activity-account-recovery-phone-send-code = Hersteltelefooncode verzonden
recent-activity-account-recovery-phone-setup-complete = Instellen hersteltelefoonnummer voltooid
recent-activity-account-recovery-phone-signin-complete = Aanmelden met hersteltelefoonnummer voltooid
recent-activity-account-recovery-phone-signin-failed = Aanmeld met hersteltelefoonnummer mislukt
recent-activity-account-recovery-phone-removed = Hersteltelefoonnummer verwijderd
recent-activity-account-recovery-codes-replaced = Herstelcodes vervangen
recent-activity-account-recovery-codes-created = Herstelcodes aangemaakt
recent-activity-account-recovery-codes-signin-complete = Aanmelden met herstelcodes voltooid
recent-activity-password-reset-otp-sent = Bevestigingscode voor wachtwoordherinitialisatie verzonden
recent-activity-password-reset-otp-verified = Bevestigingscode van wachtwoordherinitialisatie geverifieerd
recent-activity-must-reset-password = Wachtwoordherinitialisatie nodig
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Overige accountactiviteit

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Accountherstelsleutel
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Terug naar instellingen

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Hersteltelefoonnummer verwijderen
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Hierdoor wordt <strong>{ $formattedFullPhoneNumber }</strong> verwijderd als uw hersteltelefoonnummer.
settings-recovery-phone-remove-recommend = We raden u aan deze methode te behouden, omdat deze eenvoudiger is dan het opslaan van reserve-authenticatiecodes.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Als u de add-on verwijdert, zorg er dan voor dat u uw opgeslagen reserve-authenticatiecodes nog hebt. <linkExternal>Herstelmethoden vergelijken</linkExternal>
settings-recovery-phone-remove-button = Telefoonnummer verwijderen
settings-recovery-phone-remove-cancel = Annuleren
settings-recovery-phone-remove-success = Hersteltelefoonnummer verwijderd

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Hersteltelefoonnummer toevoegen
page-change-recovery-phone = Hersteltelefoonnummer wijzigen
page-setup-recovery-phone-back-button-title = Terug naar instellingen
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Telefoonnummer wijzigen

## Add secondary email page

add-secondary-email-step-1 = Stap 1 van 2
add-secondary-email-error-2 = Er is een probleem opgetreden bij het aanmaken van dit e-mailadres
add-secondary-email-page-title =
    .title = Secundair e-mailadres
add-secondary-email-enter-address =
    .label = Voer e-mailadres in
add-secondary-email-cancel-button = Annuleren
add-secondary-email-save-button = Opslaan
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = E-mailmaskers kunnen niet als secundair e-mailadres worden gebruikt

## Verify secondary email page

add-secondary-email-step-2 = Stap 2 van 2
verify-secondary-email-page-title =
    .title = Secundair e-mailadres
verify-secondary-email-verification-code-2 =
    .label = Voer uw bevestigingscode in
verify-secondary-email-cancel-button = Annuleren
verify-secondary-email-verify-button-2 = Bevestigen
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Voer binnen 5 minuten de bevestigingscode in die naar <strong>{ $email }</strong> is verzonden.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } met succes toegevoegd
verify-secondary-email-resend-code-button = Bevestigingscode opnieuw verzenden

##

# Link to delete account on main Settings page
delete-account-link = Account verwijderen
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Met succes aangemeld. Uw { -product-mozilla-account } en gegevens blijven actief.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Ontdek waar uw privégegevens zijn gelekt en neem de controle
# Links out to the Monitor site
product-promo-monitor-cta = Ontvang een gratis scan

## Profile section

profile-heading = Profiel
profile-picture =
    .header = Afbeelding
profile-display-name =
    .header = Weergavenaam
profile-primary-email =
    .header = Primair e-mailadres

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Stap { $currentStep } van { $numberOfSteps }.

## Security section of Setting

security-heading = Beveiliging
security-password =
    .header = Wachtwoord
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Gemaakt op { $date }
security-not-set = Niet ingesteld
security-action-create = Aanmaken
security-set-password = Stel een wachtwoord in om te synchroniseren en bepaalde accountbeveiligingsfuncties te gebruiken.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Recente accountactiviteit bekijken
signout-sync-header = Sessie verlopen
signout-sync-session-expired = Sorry, er is iets misgegaan. Meld u af vanuit het browsermenu en probeer het opnieuw.

## SubRow component

tfa-row-backup-codes-title = Reserve-authenticatiecodes
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Geen codes beschikbaar
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } code resterend
       *[other] { $numCodesAvailable } codes resterend
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Nieuwe codes aanmaken
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Toevoegen
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Dit is de veiligste herstelmethode als u uw mobiele apparaat of authenticator-app niet kunt gebruiken.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Hersteltelefoonnummer
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Geen telefoonnummer toegevoegd
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Wijzigen
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Toevoegen
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Verwijderen
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Hersteltelefoonnummer verwijderen
tfa-row-backup-phone-delete-restriction-v2 = Als u uw hersteltelefoonnummer wilt verwijderen, voeg dan reserve-authenticatiecodes toe of schakel eerst authenticatie in twee stappen uit om te voorkomen dat u geen toegang meer hebt tot uw account.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Dit is de eenvoudigste herstelmethode als u uw authenticator-app niet kunt gebruiken.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Meer info over het risico van simkaartwisseling

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Uitschakelen
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Inschakelen
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Indienen…
switch-is-on = aan
switch-is-off = uit

## Sub-section row Defaults

row-defaults-action-add = Toevoegen
row-defaults-action-change = Wijzigen
row-defaults-action-disable = Uitschakelen
row-defaults-status = Geen

## Account recovery key sub-section on main Settings page

rk-header-1 = Accountherstelsleutel
rk-enabled = Ingeschakeld
rk-not-set = Niet ingesteld
rk-action-create = Aanmaken
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Wijzigen
rk-action-remove = Verwijderen
rk-key-removed-2 = Sleutel voor accountherstel verwijderd
rk-cannot-remove-key = Uw sleutel voor accountherstel kon niet worden verwijderd.
rk-refresh-key-1 = Accountherstelsleutel vernieuwen
rk-content-explain = Uw gegevens herstellen wanneer u uw wachtwoord vergeet.
rk-cannot-verify-session-4 = Sorry, er is een probleem opgetreden bij het bevestigen van uw sessie
rk-remove-modal-heading-1 = Accountherstelsleutel verwijderen?
rk-remove-modal-content-1 =
    Als u uw wachtwoord herinitialiseert, kunt u uw accountherstelsleutel niet gebruiken
    om toegang te krijgen tot uw gegevens. U kunt deze actie niet ongedaan maken.
rk-remove-error-2 = Uw sleutel voor accountherstel kon niet worden verwijderd
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Accountherstelsleutel verwijderen

## Secondary email sub-section on main Settings page

se-heading = Secundair e-mailadres
    .header = Secundair e-mailadres
se-cannot-refresh-email = Sorry, er is een probleem opgetreden bij het vernieuwen van dat e-mailadres.
se-cannot-resend-code-3 = Sorry, er is een probleem opgetreden bij het opnieuw verzenden van de bevestigingscode
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } is nu uw primaire e-mailadres
se-set-primary-error-2 = Sorry, er is een probleem opgetreden bij het wijzigen van uw primaire e-mailadres
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } met succes verwijderd
se-delete-email-error-2 = Sorry, er is een probleem opgetreden bij het verwijderen van dit e-mailadres
se-verify-session-3 = U moet uw huidige sessie bevestigen om deze actie uit te voeren
se-verify-session-error-3 = Sorry, er is een probleem opgetreden bij het bevestigen van uw sessie
# Button to remove the secondary email
se-remove-email =
    .title = E-mailadres verwijderen
# Button to refresh secondary email status
se-refresh-email =
    .title = E-mailadres vernieuwen
se-unverified-2 = onbevestigd
se-resend-code-2 =
    Bevestiging vereist. <button>Verzend de bevestigingscode opnieuw</button>
    als deze niet in uw Postvak IN of uw map Ongewenste post staat.
# Button to make secondary email the primary
se-make-primary = Primair maken
se-default-content = Toegang tot uw account als u niet kunt aanmelden op uw primaire e-mailadres.
se-content-note-1 =
    Noot: een secundair e-mailadres herstelt uw gegevens niet – daarvoor
    hebt u een <a>accountherstelsleutel</a> nodig.
# Default value for the secondary email
se-secondary-email-none = Geen

## Two Step Auth sub-section on Settings main page

tfa-row-header = Authenticatie in twee stappen
tfa-row-enabled = Ingeschakeld
tfa-row-disabled-status = Uitgeschakeld
tfa-row-action-add = Toevoegen
tfa-row-action-disable = Uitschakelen
tfa-row-action-change = Wijzigen
tfa-row-button-refresh =
    .title = Authenticatie in twee stappen vernieuwen
tfa-row-cannot-refresh =
    Sorry, er is een probleem opgetreden bij het vernieuwen van authenticatie
    in twee stappen.
tfa-row-enabled-description = Uw account wordt beschermd door authenticatie in twee stappen. U dient een eenmalige toegangscode vanaf uw authenticatie-app in te voeren wanneer u zich aanmeldt bij uw { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Hoe dit uw account beschermt
tfa-row-disabled-description-v2 = Help uw account te beveiligen door een authenticatie-app van derden te gebruiken als tweede stap om u aan te melden.
tfa-row-cannot-verify-session-4 = Sorry, er is een probleem opgetreden bij het bevestigen van uw sessie
tfa-row-disable-modal-heading = Authenticatie in twee stappen uitschakelen?
tfa-row-disable-modal-confirm = Uitschakelen
tfa-row-disable-modal-explain-1 =
    U kunt deze actie niet ongedaan maken. U hebt ook
    de optie om <linkExternal>uw reserve-authenticatiecodes te vervangen</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Authenticatie in twee stappen uitgeschakeld
tfa-row-cannot-disable-2 = Authenticatie in twee stappen kon niet worden uitgeschakeld
tfa-row-verify-session-info = U moet uw huidige sessie bevestigen om authenticatie in twee stappen in te stellen

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Door verder te gaan, gaat u akkoord met de:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla }-abonnementsservices, <mozSubscriptionTosLink>Servicevoorwaarden</mozSubscriptionTosLink> en <mozSubscriptionPrivacyLink>Privacyverklaring</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Servicevoorwaarden</mozillaAccountsTos> en <mozillaAccountsPrivacy>Privacyverklaring</mozillaAccountsPrivacy> van { -product-mozilla-accounts(capitalization: "uppercase") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Door door te gaan stemt u in met de <mozillaAccountsTos>Servicevoorwaarden</mozillaAccountsTos> en <mozillaAccountsPrivacy>Privacyverklaring</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Of
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Aanmelden met
continue-with-google-button = Doorgaan met { -brand-google }
continue-with-apple-button = Doorgaan met { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Onbekende account
auth-error-103 = Onjuist wachtwoord
auth-error-105-2 = Ongeldige bevestigingscode
auth-error-110 = Ongeldige token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = U hebt het te vaak geprobeerd. Probeer het later opnieuw.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = U hebt het te vaak geprobeerd. Probeer het { $retryAfter } opnieuw.
auth-error-125 = De aanvraag is om veiligheidsredenen geblokkeerd
auth-error-129-2 = U hebt een ongeldig telefoonnummer ingevoerd. Controleer dit en probeer het opnieuw.
auth-error-138-2 = Onbevestigde sessie
auth-error-139 = Secundair e-mailadres moet anders zijn dan uw account-e-mailadres
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Dit e-mailadres is door een andere account gereserveerd. Probeer het later opnieuw of gebruik een ander e-mailadres.
auth-error-155 = TOTP-token niet gevonden
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Reserve-authenticatiecode niet gevonden
auth-error-159 = Ongeldige accountherstelsleutel
auth-error-183-2 = Ongeldige of verlopen bevestigingscode
auth-error-202 = Functie niet ingeschakeld
auth-error-203 = Systeem niet beschikbaar, probeer het later opnieuw
auth-error-206 = Kan geen wachtwoord aanmaken, wachtwoord al ingesteld
auth-error-214 = Hersteltelefoonnummer bestaat al
auth-error-215 = Hersteltelefoonnummer bestaat niet
auth-error-216 = Sms-limiet bereikt
auth-error-218 = Kan hersteltelefoonnummer niet verwijderen; reserve-authenticatiecodes ontbreken.
auth-error-219 = Dit telefoonnummer is bij te veel accounts geregistreerd. Probeer een ander nummer.
auth-error-999 = Onverwachte fout
auth-error-1001 = Aanmeldingspoging geannuleerd
auth-error-1002 = Sessie verlopen. Meld u aan om door te gaan.
auth-error-1003 = Lokale opslag of cookies zijn nog steeds uitgeschakeld
auth-error-1008 = Uw oude en nieuwe wachtwoord moeten verschillen
auth-error-1010 = Geldig wachtwoord vereist
auth-error-1011 = Geldig e-mailadres vereist
auth-error-1018 = Uw bevestigings-e-mail is zojuist geretourneerd. Hebt u het e-mailadres verkeerd getypt?
auth-error-1020 = Hebt u het e-mailadres verkeerd getypt? firefox.com is geen geldige e-mailservice
auth-error-1031 = U moet uw leeftijd invoeren om te registreren
auth-error-1032 = U moet een geldige leeftijd invoeren om te registreren
auth-error-1054 = Ongeldige code voor authenticatie in twee stappen
auth-error-1056 = Ongeldige reserve-authenticatiecode
auth-error-1062 = Ongeldige omleiding
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Hebt u het e-mailadres verkeerd getypt? { $domain } is geen geldige e-mailservice
auth-error-1066 = E-mailmaskers kunnen niet worden gebruikt om een account aan te maken.
auth-error-1067 = Hebt u het e-mailadres verkeerd getypt?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Nummer eindigend op { $lastFourPhoneNumber }
oauth-error-1000 = Er is iets misgegaan. Sluit dit tabblad en probeer het opnieuw.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = U bent aangemeld bij { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-mailadres bevestigd
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Aanmelding bevestigd
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Meld u aan bij deze { -brand-firefox } om de installatie te voltooien
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Aanmelden
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Wilt u meer apparaten toevoegen? Meld u aan bij { -brand-firefox } op een ander apparaat om de installatie te voltooien
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Meld u aan bij { -brand-firefox } op een ander apparaat om de installatie te voltooien
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Wilt u toegang tot uw tabbladen, bladwijzers en wachtwoorden op een ander apparaat?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Een ander apparaat verbinden
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Niet nu
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Meld u aan bij { -brand-firefox } voor Android om de installatie te voltooien
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Meld u aan bij { -brand-firefox } voor iOS om de installatie te voltooien

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Lokale opslag en cookies zijn vereist
cookies-disabled-enable-prompt-2 = Schakel cookies en lokale opslag in uw browser in voor toegang tot uw { -product-mozilla-account }. Hierdoor worden functionaliteiten zoals het onthouden van u tussen sessies ingeschakeld.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Opnieuw proberen
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Meer info

## Index / home page

index-header = Voer uw e-mailadres in
index-sync-header = Doorgaan naar uw { -product-mozilla-account }
index-sync-subheader = Synchroniseer uw wachtwoorden, tabbladen en bladwijzers overal waar u { -brand-firefox } gebruikt.
index-relay-header = Een e-mailmasker aanmaken
index-relay-subheader = Geef het e-mailadres op waarnaar u e-mailberichten vanuit uw gemaskeerde e-mailadres wilt doorsturen.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Doorgaan naar { $serviceName }
index-subheader-default = Doorgaan naar accountinstellingen
index-cta = Registreren of aanmelden
index-account-info = Een { -product-mozilla-account } ontgrendelt ook de toegang tot meer privacybeschermende producten van { -brand-mozilla }.
index-email-input =
    .label = Voer uw e-mailadres in
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Account met succes verwijderd
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Uw bevestigings-e-mailbericht is zojuist geretourneerd. Hebt u het e-mailadres verkeerd getypt?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Oeps! We konden uw accountherstelsleutel niet aanmaken. Probeer het later opnieuw.
inline-recovery-key-setup-recovery-created = Sleutel voor accountherstel aangemaakt
inline-recovery-key-setup-download-header = Beveilig uw account
inline-recovery-key-setup-download-subheader = Nu downloaden en opslaan
inline-recovery-key-setup-download-info = Bewaar deze sleutel op een plek die u kunt onthouden – u kunt deze pagina later niet meer openen.
inline-recovery-key-setup-hint-header = Beveiligingsaanbeveling

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Configuratie annuleren
inline-totp-setup-continue-button = Doorgaan
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Voeg een beveiligingslaag toe aan uw account door beveiligingscodes van een van <authenticationAppsLink>deze apps voor authenticatie</authenticationAppsLink> te vereisen.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Schakel tweestapsauthenticatie in <span>om door te gaan naar uw accountinstellingen</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Schakel tweestapsauthenticatie in <span>om door te gaan naar { $serviceName }</span>
inline-totp-setup-ready-button = Gereed
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scan uw authenticatiecode <span>om door te gaan naar { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Voer handmatig uw code in <span>om door te gaan naar { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scan uw authenticatiecode <span>om door te gaan naar uw accountinstellingen</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Voer handmatig uw code in <span>om door te gaan naar accountinstellingen</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Typ deze geheime sleutel in uw authenticatie-app. <toggleToQRButton>QR-code scannen?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scan de QR-code in uw authenticatie-app en voer vervolgens de authenticatiecode in die wordt verstrekt. <toggleToManualModeButton>Kunt u de code niet scannen?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Na voltooiing worden authenticatiecodes voor u gegenereerd die u kunt invoeren.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Authenticatiecode
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Authenticatiecode vereist
tfa-qr-code-alt = Gebruik de code { $code } om authenticatie in twee stappen in ondersteunde toepassingen in te schakelen.
inline-totp-setup-page-title = Authenticatie in twee stappen

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Juridisch
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Servicevoorwaarden
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Privacyverklaring

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Privacyverklaring

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Servicevoorwaarden

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Hebt u zich zojuist aangemeld bij { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Ja, apparaat goedkeuren
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Als u dit niet was, <link>wijzig dan uw wachtwoord</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Apparaat verbonden
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = U synchroniseert nu met: { $deviceFamily } op { $deviceOS }
pair-auth-complete-sync-benefits-text = U hebt nu op al uw apparaten toegang tot uw geopende tabbladen, wachtwoorden en bladwijzers.
pair-auth-complete-see-tabs-button = Tabbladen van gesynchroniseerde apparaten bekijken
pair-auth-complete-manage-devices-link = Apparaten beheren

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Voer uw authenticatiecode in <span>om door te gaan naar uw accountinstellingen</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Voer uw authenticatiecode in <span>om door te gaan naar { $serviceName }</span>
auth-totp-instruction = Open uw app voor authenticatie en voer de aangeboden authenticatiecode in.
auth-totp-input-label = Voer 6-cijferige code in
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Bevestigen
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Authenticatiecode vereist

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Goedkeuring <span>vanaf uw andere apparaat</span> nu vereist

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Koppelen mislukt
pair-failure-message = Het installatieproces is beëindigd.

## Pair index page

pair-sync-header = { -brand-firefox } synchroniseren op uw telefoon of tablet
pair-cad-header = { -brand-firefox } verbinden op een ander apparaat
pair-already-have-firefox-paragraph = Hebt u al { -brand-firefox } op een telefoon of tablet?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Uw apparaat synchroniseren
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Of downloaden
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scan om { -brand-firefox } voor mobiel te downloaden, of stuur uzelf een <linkExternal>downloadkoppeling</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Niet nu
pair-take-your-data-message = Neem uw tabbladen, bladwijzers en wachtwoorden overal mee waar u { -brand-firefox } gebruikt.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Beginnen
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-code

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Apparaat verbonden
pair-success-message-2 = Koppelen gelukt.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Koppeling <span>voor { $email }</span> bevestigen
pair-supp-allow-confirm-button = Koppeling bevestigen
pair-supp-allow-cancel-link = Annuleren

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Goedkeuring <span>vanaf uw andere apparaat</span> nu vereist

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Koppelen via een app
pair-unsupported-message = Hebt u de systeemcamera gebruikt? U moet koppelen vanuit een { -brand-firefox }-app.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Maak een wachtwoord aan om te synchroniseren
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Hierdoor worden uw gegevens versleuteld. Het dient anders te zijn dan uw { -brand-google }- of { -brand-apple }-accountwachtwoord.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Even geduld, u wordt doorgestuurd naar de geautoriseerde toepassing.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Voer uw accountherstelsleutel in
account-recovery-confirm-key-instruction = Deze sleutel herstelt uw versleutelde navigatiegegevens, zoals wachtwoorden en bladwijzers, van { -brand-firefox }-servers.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Voer uw accountherstelsleutel van 32 tekens in
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Uw opslaghint is:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Doorgaan
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Kunt u uw accountherstelsleutel niet vinden?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Nieuw wachtwoord aanmaken
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Wachtwoord ingesteld
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Sorry, er is een probleem opgetreden bij het instellen van uw wachtwoord
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Accountherstelsleutel gebruiken
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Uw wachtwoord is geherinitialiseerd.
reset-password-complete-banner-message = Vergeet niet een nieuwe accountherstelsleutel aan te maken vanuit uw { -product-mozilla-account }-instellingen om toekomstige aanmeldingsproblemen te voorkomen.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } probeert u terug te sturen om een e-mailmasker te gebruiken nadat u zich hebt aangemeld.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Voer code van 10 tekens in
confirm-backup-code-reset-password-confirm-button = Bevestigen
confirm-backup-code-reset-password-subheader = Voer reserve-authenticatiecode in
confirm-backup-code-reset-password-instruction = Voer een van de codes voor eenmalig gebruik in die u hebt opgeslagen bij het instellen van authenticatie in twee stappen.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Bent u buitengesloten?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Controleer uw e-mail
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = We hebben een bevestigingscode naar <span>{ $email }</span> gestuurd.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Voer binnen 10 minuten een 8-cijferige code in
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Doorgaan
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Code nogmaals versturen
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Een andere account gebruiken

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Herinitialiseer uw wachtwoord
confirm-totp-reset-password-subheader-v2 = Voer tweestaps-authenticatiecode in
confirm-totp-reset-password-instruction-v2 = Controleer uw <strong>authenticatie-app</strong> om uw wachtwoord te herinitialiseren.
confirm-totp-reset-password-trouble-code = Problemen bij het invoeren van de code?
confirm-totp-reset-password-confirm-button = Bevestigen
confirm-totp-reset-password-input-label-v2 = Voer 6-cijferige code in
confirm-totp-reset-password-use-different-account = Een andere account gebruiken

## ResetPassword start page

password-reset-flow-heading = Uw wachtwoord opnieuw instellen
password-reset-body-2 =
    We vragen u een aantal dingen die alleen u weet om uw account
    veilig te houden.
password-reset-email-input =
    .label = Voer uw e-mailadres in
password-reset-submit-button-2 = Doorgaan

## ResetPasswordConfirmed

reset-password-complete-header = Uw wachtwoord is opnieuw ingesteld
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Doorgaan naar { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Uw wachtwoord herinitialiseren
password-reset-recovery-method-subheader = Een herstelmethode kiezen
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Laten we controleren dat u het bent die uw herstelmethoden gebruikt.
password-reset-recovery-method-phone = Hersteltelefoonnummer
password-reset-recovery-method-code = Reserve-authenticatiecodes
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } code resterend
       *[other] { $numBackupCodes } codes resterend
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Er is een probleem opgetreden bij het verzenden van een code naar uw hersteltelefoonnummer
password-reset-recovery-method-send-code-error-description = Probeer het later opnieuw of gebruik uw reserve-authenticatiecodes.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Herinitialiseer uw wachtwoord
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Voer herstelcode in
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Er is per sms een 6-cijferige code verstuurd naar het telefoonnummer eindigend op <span>{ $lastFourPhoneDigits }</span>. Deze code verloopt na 5 minuten. Deel deze code met niemand.
reset-password-recovery-phone-input-label = Voer 6-cijferige code in
reset-password-recovery-phone-code-submit-button = Bevestigen
reset-password-recovery-phone-resend-code-button = Code nogmaals versturen
reset-password-recovery-phone-resend-success = Code verzonden
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Bent u buitengesloten?
reset-password-recovery-phone-send-code-error-heading = Er is een probleem opgetreden bij het verzenden van een code
reset-password-recovery-phone-code-verification-error-heading = Er is een probleem opgetreden bij het verifiëren van uw code
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Probeer het later opnieuw.
reset-password-recovery-phone-invalid-code-error-description = De code is ongeldig of verlopen.
reset-password-recovery-phone-invalid-code-error-link = Reserve-authenticatiecodes in plaats hiervan gebruiken?
reset-password-with-recovery-key-verified-page-title = Wachtwoord met succes opnieuw ingesteld
reset-password-complete-new-password-saved = Nieuw wachtwoord opgeslagen!
reset-password-complete-recovery-key-created = Nieuwe accountherstelsleutel aangemaakt. Download en bewaar deze nu.
reset-password-complete-recovery-key-download-info = Deze sleutel is essentieel voor gegevensherstel als u uw wachtwoord vergeet. <b>Download en bewaar het nu veilig, omdat u deze pagina later niet meer kunt openen.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Fout:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Aanmelding valideren…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Bevestigingsfout
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Bevestigingskoppeling verlopen
signin-link-expired-message-2 = De koppeling waarop u hebt geklikt is verlopen of is al gebruikt.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Voer uw wachtwoord in <span>voor uw { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Doorgaan naar { $serviceName }
signin-subheader-without-logo-default = Doorgaan naar accountinstellingen
signin-button = Aanmelden
signin-header = Aanmelden
signin-use-a-different-account-link = Een andere account gebruiken
signin-forgot-password-link = Wachtwoord vergeten?
signin-password-button-label = Wachtwoord
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } probeert u terug te sturen om een e-mailmasker te gebruiken nadat u zich hebt aangemeld.
signin-code-expired-error = Code verlopen. Meld u opnieuw aan.
signin-account-locked-banner-heading = Herinitialiseer uw wachtwoord
signin-account-locked-banner-description = We hebben uw account vergrendeld om deze te beschermen tegen verdachte activiteit.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Herinitialiseer uw wachtwoord om u aan te melden

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = De koppeling waarop u hebt geklikt miste tekens en is mogelijk beschadigd geraakt door uw e-mailclient. Kopieer het adres zorgvuldig en probeer het opnieuw.
report-signin-header = Ongeautoriseerde aanmelding melden?
report-signin-body = U hebt een e-mailbericht ontvangen over een poging om toegang tot uw account te krijgen. Wilt u deze activiteit als verdacht melden?
report-signin-submit-button = Activiteit melden
report-signin-support-link = Waarom gebeurt dit?
report-signin-error = Sorry, er was een probleem tijdens het indienen van het rapport.
signin-bounced-header = Sorry. We hebben uw account vergrendeld.
# $email (string) - The user's email.
signin-bounced-message = De bevestigingsmail die we naar { $email } hebben verstuurd, is geretourneerd en om uw { -brand-firefox }-gegevens te beschermen, is uw account vergrendeld.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Als dit een geldig e-mailadres is, <linkExternal>laat dit dan weten</linkExternal> en we helpen uw account te ontgrendelen.
signin-bounced-create-new-account = Hebt u dat e-mailadres niet meer? Maak een nieuwe account
back = Terug

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Verifieer deze aanmelding <span>om door te gaan naar uw accountinstellingen</span>
signin-push-code-heading-w-custom-service = Verifieer deze aanmelding <span>om door te gaan naar { $serviceName }</span>
signin-push-code-instruction = Controleer uw andere apparaten en keur deze aanmelding goed vanuit uw { -brand-firefox }-browser.
signin-push-code-did-not-recieve = Hebt u de melding niet ontvangen?
signin-push-code-send-email-link = Verzend de code via e-mail

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Bevestig uw aanmelding
signin-push-code-confirm-description = We hebben een aanmeldpoging vanaf het volgende apparaat gedetecteerd. Als u dit was, keur dan de aanmelding goed
signin-push-code-confirm-verifying = Verifiëren
signin-push-code-confirm-login = Aanmelding bevestigen
signin-push-code-confirm-wasnt-me = Dit was ik niet, wijzig wachtwoord.
signin-push-code-confirm-login-approved = Uw aanmelding is goedgekeurd. Sluit dit venster.
signin-push-code-confirm-link-error = Koppeling is beschadigd. Probeer het opnieuw.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Aanmelden
signin-recovery-method-subheader = Kies een herstelmethode
signin-recovery-method-details = Laten we controleren dat u het bent die uw herstelmethoden gebruikt.
signin-recovery-method-phone = Hersteltelefoonnummer
signin-recovery-method-code-v2 = Reserve-authenticatiecodes
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } code resterend
       *[other] { $numBackupCodes } codes resterend
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Er is een probleem opgetreden bij het verzenden van een code naar uw hersteltelefoonnummer
signin-recovery-method-send-code-error-description = Probeer het later opnieuw of gebruik uw reserve-authenticatiecodes.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Aanmelden
signin-recovery-code-sub-heading = Voer reserve-authenticatiecode in
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Voer een van de codes voor eenmalig gebruik in die u hebt opgeslagen bij het instellen van authenticatie in twee stappen.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Voer code van 10 tekens in
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Bevestigen
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Hersteltelefoonnummer gebruiken
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Bent u buitengesloten?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Reserve-authenticatiecode vereist
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Er is een probleem opgetreden bij het verzenden van een code naar uw hersteltelefoonnummer
signin-recovery-code-use-phone-failure-description = Probeer het later opnieuw.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Aanmelden
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Voer herstelcode in
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Er is per sms een 6-cijferige code verstuurd naar het telefoonnummer eindigend op <span>{ $lastFourPhoneDigits }</span>. Deze code verloopt na 5 minuten. Deel deze code met niemand.
signin-recovery-phone-input-label = Voer 6-cijferige code in
signin-recovery-phone-code-submit-button = Bevestigen
signin-recovery-phone-resend-code-button = Code nogmaals versturen
signin-recovery-phone-resend-success = Code verzonden
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Bent u buitengesloten?
signin-recovery-phone-send-code-error-heading = Er is een probleem opgetreden bij het verzenden van een code
signin-recovery-phone-code-verification-error-heading = Er is een probleem opgetreden bij het verifiëren van uw code
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Probeer het later opnieuw.
signin-recovery-phone-invalid-code-error-description = De code is ongeldig of verlopen.
signin-recovery-phone-invalid-code-error-link = Reserve-authenticatiecodes in plaats hiervan gebruiken?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Met succes aangemeld. Er kunnen beperkingen van toepassing zijn als u uw hersteltelefoonnummer opnieuw gebruikt.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Bedankt voor uw opmerkzaamheid
signin-reported-message = Ons team is op de hoogte gebracht. Dit soort meldingen helpen ons om indringers tegen te houden.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Voer bevestigingscode in <span>voor uw { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Voer binnen 5 minuten de code in die naar <email>{ $email }</email> is verzonden.
signin-token-code-input-label-v2 = Voer 6-cijferige code in
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Bevestigen
signin-token-code-code-expired = Code verlopen?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Nieuwe code versturen per e-mail.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Bevestigingscode vereist
signin-token-code-resend-error = Er is iets misgegaan. Er kon geen nieuwe code worden verzonden.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } probeert u terug te sturen om een e-mailmasker te gebruiken nadat u zich hebt aangemeld.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Aanmelden
signin-totp-code-subheader-v2 = Voer tweestaps-authenticatiecode in
signin-totp-code-instruction-v4 = Controleer uw <strong>authenticatie-app</strong> om uw aanmelding te bevestigen.
signin-totp-code-input-label-v4 = Voer 6-cijferige code in
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Waarom wordt u gevraagd om te authenticeren?
signin-totp-code-aal-banner-content = U hebt authenticatie in twee stappen op uw account ingesteld, maar hebt zich op dit apparaat nog niet met een code aangemeld.
signin-totp-code-aal-sign-out = Afmelden op dit apparaat
signin-totp-code-aal-sign-out-error = Sorry, er is een probleem opgetreden bij het afmelden
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Bevestigen
signin-totp-code-other-account-link = Een andere account gebruiken
signin-totp-code-recovery-code-link = Problemen bij het invoeren van de code?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Authenticatiecode vereist
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } probeert u terug te sturen om een e-mailmasker te gebruiken nadat u zich hebt aangemeld.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Deze aanmelding autoriseren
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Controleer uw e-mail op de autorisatiecode die naar { $email } is verzonden.
signin-unblock-code-input = Voer autorisatiecode in
signin-unblock-submit-button = Doorgaan
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Autorisatiecode vereist
signin-unblock-code-incorrect-length = Autorisatiecode moet 8 tekens bevatten
signin-unblock-code-incorrect-format-2 = Autorisatiecode mag alleen letters en/of cijfers bevatten
signin-unblock-resend-code-button = Niet in Postvak IN of map met spam? Opnieuw verzenden
signin-unblock-support-link = Waarom gebeurt dit?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } probeert u terug te sturen om een e-mailmasker te gebruiken nadat u zich hebt aangemeld.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Voer bevestigingscode in
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Voer bevestigingscode in <span>voor uw { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Voer binnen 5 minuten de code in die naar <email>{ $email }</email> is verzonden.
confirm-signup-code-input-label = Voer 6-cijferige code in
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Bevestigen
confirm-signup-code-sync-button = Begin met synchroniseren
confirm-signup-code-code-expired = Code verlopen?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Nieuwe code versturen per e-mail.
confirm-signup-code-success-alert = Account met succes bevestigd
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Bevestigingscode is vereist
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } probeert u terug te sturen om een e-mailmasker te gebruiken nadat u zich hebt aangemeld.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Maak een wachtwoord aan
signup-relay-info = Er is een wachtwoord nodig om uw gemaskeerde e-mailadressen veilig te beheren en toegang te krijgen tot de beveiligingshulpmiddelen van { -brand-mozilla }.
signup-sync-info = Synchroniseer uw wachtwoorden, bladwijzers en meer, overal waar u { -brand-firefox } gebruikt.
signup-sync-info-with-payment = Synchroniseer uw wachtwoorden, betalingsmethoden, bladwijzers en meer, overal waar u { -brand-firefox } gebruikt.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = E-mailadres wijzigen

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synchronisatie is ingeschakeld
signup-confirmed-sync-success-banner = { -product-mozilla-account } bevestigd
signup-confirmed-sync-button = Beginnen met surfen
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Uw wachtwoorden, betalingsmethoden, adressen, bladwijzers, geschiedenis en meer kunnen overal waar u { -brand-firefox } gebruikt synchroniseren.
signup-confirmed-sync-description-v2 = Uw wachtwoorden, adressen, bladwijzers, geschiedenis en meer kunnen overal waar u { -brand-firefox } gebruikt synchroniseren.
signup-confirmed-sync-add-device-link = Nog een apparaat toevoegen
signup-confirmed-sync-manage-sync-button = Synchronisatie beheren
signup-confirmed-sync-set-password-success-banner = Synchronisatiewachtwoord aangemaakt
