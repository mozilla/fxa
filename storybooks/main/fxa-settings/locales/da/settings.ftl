# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = En ny kode blev sendt til din mailadresse.
resend-link-success-banner-heading = Et nyt link blev sendt til din mailadresse.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Føj mailadressen { $accountsEmail } til dine kontakter for at sikre en problemfri levering.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Luk banner
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } ændrer navn til { -product-mozilla-accounts } den 1. november
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Du skal stadig logge ind med samme brugernavn og adgangskode, og der er ingen andre ændringer af de produkter, du bruger.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Vi har ændret navnet { -product-firefox-accounts } til { -product-mozilla-accounts }. Du skal stadig logge ind med samme brugernavn og adgangskode, og der er ingen andre ændringer af de produkter, du bruger.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Læs mere
# Alt text for close banner image
brand-close-banner =
    .alt = Luk banner
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m-logo

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Tilbage
button-back-title = Tilbage

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Hent og fortsæt
    .title = Hent og fortsæt
recovery-key-pdf-heading = Genoprettelsesnøgle til kontoen
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Oprettet: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Genoprettelsesnøgle til kontoen
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Med denne nøgle kan du gendanne dine krypterede browserdata (herunder adgangskoder, bogmærker og historik), hvis du glemmer din adgangskode. Gem den et sted, du kan huske.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Steder du kan gemme din nøgle
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Læs mere om din genoprettelsesnøgle til kontoen
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Der opstod desværre et problem med at hente din genoprettelsesnøgle til kontoen.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Få mere fra { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Få vores seneste nyheder og produktopdateringer
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Tidlig adgang til at teste nye produkter
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Opfordringer til handling for at tage kontrollen over internettet tilbage

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Hentet
datablock-copy =
    .message = Kopieret
datablock-print =
    .message = Udskrevet

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Kode kopieret
       *[other] Koder kopieret
    }
datablock-download-success =
    { $count ->
        [one] Kode hentet
       *[other] Koder hentet
    }
datablock-print-success =
    { $count ->
        [one] Kode udskrevet
       *[other] Koder udskrevet
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Kopieret

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (anslået)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (anslået)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (anslået)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (anslået)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Position ukendt
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } på { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-adresse: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Adgangskode
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Gentag adgangskode
form-password-with-inline-criteria-signup-submit-button = Opret konto
form-password-with-inline-criteria-reset-new-password =
    .label = Ny adgangskode
form-password-with-inline-criteria-confirm-password =
    .label = Bekræft adgangskode
form-password-with-inline-criteria-reset-submit-button = Opret ny adgangskode
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Adgangskode
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Gentag adgangskode
form-password-with-inline-criteria-set-password-submit-button = Start synkronisering
form-password-with-inline-criteria-match-error = Adgangskoderne er ikke ens
form-password-with-inline-criteria-sr-too-short-message = Adgangskoden skal indeholde mindst otte tegn.
form-password-with-inline-criteria-sr-not-email-message = Adgangskoden må ikke indeholde din mailadresse.
form-password-with-inline-criteria-sr-not-common-message = Adgangskoden må ikke være en ofte anvendt adgangskode.
form-password-with-inline-criteria-sr-requirements-met = Den indtastede adgangskode opfylder alle kravene til adgangskoder.
form-password-with-inline-criteria-sr-passwords-match = De indtastede adgangskoder er ens.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Dette felt er påkrævet

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Indtast den { $codeLength }-cifrede kode for at fortsætte
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Indtast koden på { $codeLength } tegn for at fortsætte

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Genoprettelsesnøgle til { -brand-firefox }-konto
get-data-trio-title-backup-verification-codes = Reserve-godkendelseskoder
get-data-trio-download-2 =
    .title = Hent
    .aria-label = Hent
get-data-trio-copy-2 =
    .title = Kopier
    .aria-label = Kopier
get-data-trio-print-2 =
    .title = Udskriv
    .aria-label = Udskriv

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Advarsel
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Bemærk
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Advarsel
authenticator-app-aria-label =
    .aria-label = Godkendelsesapplikation
backup-codes-icon-aria-label-v2 =
    .aria-label = Reserve-godkendelseskoder aktiveret
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Reserve-godkendelseskoder deaktiveret
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Genoprettelses-SMS er aktiveret
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Genoprettelses-SMS deaktiveret
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Canadisk flag
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Flueben
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Succes
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Aktiveret
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Luk besked
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kode
error-icon-aria-label =
    .aria-label = Fejl
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Information
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = USA's flag

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = En computer og en mobiltelefon med et billede af et knust hjerte på hver
hearts-verified-image-aria-label =
    .aria-label = En computer, en mobiltelefon og en tablet med et pulserende hjerte på hver
signin-recovery-code-image-description =
    .aria-label = Dokument, der indeholder skjult tekst.
signin-totp-code-image-label =
    .aria-label = En enhed med en skjult sekscifret kode.
confirm-signup-aria-label =
    .aria-label = En konvolut med et link
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Illustration af en genoprettelsesnøgle til en konto.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Illustration af en genoprettelsesnøgle til en konto.
password-image-aria-label =
    .aria-label = En illustration af indtastning af en adgangskode.
lightbulb-aria-label =
    .aria-label = Illustration af oprettelse af huskeregel.
email-code-image-aria-label =
    .aria-label = Illustration af en mail, der indeholder en kode.
recovery-phone-image-description =
    .aria-label = Mobil enhed, der modtager en kode i en SMS-besked.
recovery-phone-code-image-description =
    .aria-label = Kode modtaget på en mobil enhed.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobil enhed med SMS-meddelelsesfunktioner
backup-authentication-codes-image-aria-label =
    .aria-label = Enhedsskærm med koder
sync-clouds-image-aria-label =
    .aria-label = Skyer med et synkroniseringsikon
confetti-falling-image-aria-label =
    .aria-label = Animeret faldende konfetti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Du er logget ind på { -brand-firefox }.
inline-recovery-key-setup-create-header = Beskyt din konto
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Har du et øjeblik til at beskytte dine data?
inline-recovery-key-setup-info = Opret en genoprettelsesnøgle til kontoen, så du kan gendanne dine synkroniserede data, hvis du nogensinde glemmer din adgangskode.
inline-recovery-key-setup-start-button = Opret genoprettelsesnøgle til kontoen
inline-recovery-key-setup-later-button = Gør det senere

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Skjul adgangskode
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Vis adgangskode
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Din adgangskode er i øjeblikket synlig på skærmen.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Din adgangskode er i øjeblikket skjult.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Din adgangskode er nu synlig på skærmen.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Din adgangskode er nu skjult.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Vælg land
input-phone-number-enter-number = Indtast telefonnummer
input-phone-number-country-united-states = USA
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Tilbage

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Link til nulstilling af adgangskode beskadiget
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Bekræftelseslink beskadiget
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Link beskadiget
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Linket, du klikkede på, manglede tegn og kan være blevet ødelagt af dit mailprogram. Kopier adressen, og prøv igen.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Modtag nyt link

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Kan du huske adgangskoden?
# link navigates to the sign in page
remember-password-signin-link = Log ind

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Primær mailadresse allerede bekræftet
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Login er allerede bekræftet
confirmation-link-reused-message = Det bekræftelseslink er allerede blevet brugt, og det kan kun bruges én gang.

## Locale Toggle Component

locale-toggle-select-label = Vælg sprog
locale-toggle-browser-default = Browser-standard
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Ugyldig forespørgsel

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Du skal bruge denne adgangskode for at få adgang til de krypterede data, du gemmer hos os.
password-info-balloon-reset-risk-info = En nulstilling kan medføre tab af data som fx adgangskoder og bogmærker.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Vælg en stærk adgangskode, du ikke har brugt på andre websteder. Sørg for, at den opfylder sikkerhedskravene:
password-strength-short-instruction = Vælg en stærk adgangskode:
password-strength-inline-min-length = Mindst otte tegn
password-strength-inline-not-email = Ikke din mailadresse
password-strength-inline-not-common = Ikke en almindeligt brugt adgangskode
password-strength-inline-confirmed-must-match = Bekræftelsen matcher den nye adgangskode
password-strength-inline-passwords-match = Adgangskoderne er ens

## Notification Promo Banner component

account-recovery-notification-cta = Opret
account-recovery-notification-header-value = Mist ikke dine data, hvis du glemmer din adgangskode
account-recovery-notification-header-description = Opret en genoprettelsesnøgle til kontoen for at gendanne dine synkroniserede data, hvis du nogensinde glemmer din adgangskode.
recovery-phone-promo-cta = Tilføj telefonnummer til genoprettelse
recovery-phone-promo-heading = Få ekstra beskyttelse af din konto med et telefonnummer til genoprettelse
recovery-phone-promo-description = Nu kan du logge ind med en engangs-adgangskode via SMS, hvis du ikke kan bruge din godkendelsesapp til totrinsgodkendelse.
recovery-phone-promo-info-link = Læs mere om genoprettelse og SIM-swapping-risiko
promo-banner-dismiss-button =
    .aria-label = Afvis banner

## Ready component

ready-complete-set-up-instruction = Indtast din nye adgangskode på dine andre { -brand-firefox }-enheder for at færdiggøre opsætningen.
manage-your-account-button = Håndter din konto
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Du er nu klar til at bruge { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Du er nu klar til at bruge kontoindstillingerne
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Din konto er klar!
ready-continue = Fortsæt
sign-in-complete-header = Login er bekræftet
sign-up-complete-header = Konto bekræftet
primary-email-verified-header = Primær mailadresse bekræftet

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Steder du kan gemme din nøgle:
flow-recovery-key-download-storage-ideas-folder-v2 = Mappe på en sikker enhed
flow-recovery-key-download-storage-ideas-cloud = Betroet opbevaring i skyen
flow-recovery-key-download-storage-ideas-print-v2 = Udskrevet fysisk kopi
flow-recovery-key-download-storage-ideas-pwd-manager = Adgangskode-håndtering

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Tilføj en huskeregel til at hjælpe med at finde din nøgle
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Denne huskeregel skal hjælpe dig med at huske, hvor du gemte din genoprettelsesnøgle til kontoen. Vi kan vise dig tippet, når du nulstiller adgangskoden for at gendanne dine data.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Indtast en huskeregel (valgfrit)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Afslut
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Huskereglen skal indeholde færre end 255 tegn.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Huskereglen kan ikke indeholde usikre unicode-tegn. Kun bogstaver, tal, tegnsætningstegn og symboler er tilladt.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Advarsel
password-reset-chevron-expanded = Sammenfold advarsel
password-reset-chevron-collapsed = Fold advarsel ud
password-reset-data-may-not-be-recovered = Dine browserdata bliver måske ikke gendannet
password-reset-previously-signed-in-device-2 = Har du en enhed, hvor du tidligere har logget ind?
password-reset-data-may-be-saved-locally-2 = Dine browserdata er muligvis gemt på den pågældende enhed. Nulstil din adgangskode, og log derefter ind på enheden for at gendanne og synkronisere dine data.
password-reset-no-old-device-2 = Har du en ny enhed, men ikke adgang til nogen af dine gamle enheder?
password-reset-encrypted-data-cannot-be-recovered-2 = Vi beklager, men dine krypterede browserdata på { -brand-firefox }' servere kan ikke gendannes.
password-reset-warning-have-key = Har du en genoprettelsesnøgle til kontoen?
password-reset-warning-use-key-link = Brug den nu til at nulstille din adgangskode og beholde dine data

## Alert Bar

alert-bar-close-message = Luk besked

## User's avatar

avatar-your-avatar =
    .alt = Din avatar
avatar-default-avatar =
    .alt = Standard-avatar

##


# BentoMenu component

bento-menu-title-3 = Produkter fra { -brand-mozilla }
bento-menu-tagline = Flere produkter fra { -brand-mozilla }, der beskytter dit privatliv
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } Browser til din computer
bento-menu-firefox-mobile = { -brand-firefox } Browser til din telefon
bento-menu-made-by-mozilla = Lavet af { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Få { -brand-firefox } på mobil eller tablet
connect-another-find-fx-mobile-2 = Find { -brand-firefox } i { -google-play } og { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Hent { -brand-firefox } på { -google-play }
connect-another-app-store-image-3 =
    .alt = Hent { -brand-firefox } i { -app-store }

## Connected services section

cs-heading = Forbundne tjenester
cs-description = Alle tjenester, du bruger og er logget ind på.
cs-cannot-refresh =
    Der opstod desværre et problem med at opdatere listen over forbundne
    tjenester.
cs-cannot-disconnect = Klienten blev ikke fundet, kunne ikke afbryde forbindelsen
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Logget ud af { $service }
cs-refresh-button =
    .title = Opdater forbundne tjenester
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Manglende eller gentagne elementer?
cs-disconnect-sync-heading = Afbryd forbindelsen til Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Dine browsing-data vil stadig blive gemt på <span>{ $device }</span>,
    men vil ikke længere blive synkroniseret med din konto.
cs-disconnect-sync-reason-3 = Hvad er hovedårsagen til, at du afbryder forbindelsen til <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Enheden er:
cs-disconnect-sync-opt-suspicious = Mistænkelig
cs-disconnect-sync-opt-lost = Mistet eller stjålet
cs-disconnect-sync-opt-old = Gammel eller udskiftet
cs-disconnect-sync-opt-duplicate = En dublet
cs-disconnect-sync-opt-not-say = Det vil jeg helst ikke oplyse

##

cs-disconnect-advice-confirm = Ok, forstået
cs-disconnect-lost-advice-heading = Afbrudt forbindelsen til mistet eller stjålet enhed
cs-disconnect-lost-advice-content-3 = Da din enhed er mistet eller stjålet, skal du ændre adgangskoden til din { -product-mozilla-account } i dine kontoindstillinger for at beskytte dine informationer. Du skal også kigge efter oplysninger fra producenten af din enhed om fjernsletning af dine data.
cs-disconnect-suspicious-advice-heading = Afbrudt forbindelsen til mistænkelig enhed
cs-disconnect-suspicious-advice-content-2 = Hvis den frakoblede enhed virkelig er mistænkelig, skal du ændre adgangskoden til din { -product-mozilla-account } i dine kontoindstillinger for at beskytte dine data. Du skal også ændre de andre adgangskoder, du har gemt i { -brand-firefox }, ved at skrive about:logins i adressefeltet.
cs-sign-out-button = Log ud

## Data collection section

dc-heading = Dataindsamling og -brug
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-browser
dc-subheader-content-2 = Tillad at { -product-mozilla-accounts } indsender tekniske data og data om brug til { -brand-mozilla }.
dc-subheader-ff-content = For at gennemse eller opdatere indstillinger for din  { -brand-firefox }-browsers tekniske data og data om brug, åbn { -brand-firefox }' indstillinger og gå til Privatliv og sikkerhed.
dc-opt-out-success-2 = Fravalget lykkedes. { -product-mozilla-accounts } indsender ikke tekniske data og data om brug til { -brand-mozilla }.
dc-opt-in-success-2 = Tak! Deling af disse data hjælper os med at forbedre { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Der opstod desværre et problem med at ændre din indstilling for dataindsamling
dc-learn-more = Læs mere

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }-menu
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Logget ind som
drop-down-menu-sign-out = Log ud
drop-down-menu-sign-out-error-2 = Der opstod desværre et problem med at logge dig ud

## Flow Container

flow-container-back = Tilbage

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Indtast din adgangskode igen for at øge sikkerheden
flow-recovery-key-confirm-pwd-input-label = Indtast din adgangskode
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Opret genoprettelsesnøgle til konto
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Opret ny genoprettelsesnøgle til kontoen

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Genoprettelsesnøgle til kontoen oprettet — Hent og gem den nu
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Med denne nøgle kan du gendanne dine data, hvis du glemmer din adgangskode. Hent den nu og gem den et sted, du kan huske — Du kan ikke vende tilbage til denne side senere.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Fortsæt uden at hente

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Genoprettelsesnøgle til kontoen blev oprettet

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Opret en genoprettelsesnøgle til kontoen, i tilfælde af at du glemmer din adgangskode
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Skift din genoprettelsesnøgle til kontoen
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Vi krypterer browserdata –– adgangskoder, bogmærker med mere. Det gør vi for at beskytte dit privatliv bedst mulig. Men det betyder, at du kan miste dine data, hvis du glemmer din adgangskode.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Derfor er det meget vigtig, at du opretter en genoprettelsesnøgle til kontoen –– du skal bruge den til at gendanne dine data.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Kom i gang
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Annuller

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Opret forbindelse til din godkendelsesapp
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Trin 1:</strong> Skan denne QR-kode ved hjælp af en godkendelsesapp, såsom Duo eller Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-kode til opsætning af totrinsgodkendelse. Skan den, eller vælg "Kan du ikke scanne QR-koden?" for at få en hemmelig nøgle i stedet.
flow-setup-2fa-cant-scan-qr-button = Kan du ikke skanne QR-koden?
flow-setup-2fa-manual-key-heading = Indtast kode manuelt
flow-setup-2fa-manual-key-instruction = <strong>Trin 1:</strong> Indtast denne kode i din foretrukne godkendelsesapp.
flow-setup-2fa-scan-qr-instead-button = Skan QR-kode i stedet?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Læs mere om godkendelsesapps
flow-setup-2fa-button = Fortsæt
flow-setup-2fa-step-2-instruction = <Strong>Trin 2:</strong> Indtast koden fra din godkendelsesapp.
flow-setup-2fa-input-label = Indtast sekscifret kode
flow-setup-2fa-code-error = Ugyldig eller udløbet kode. Tjek din godkendelsesapp og prøv igen.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Vælg en genoprettelsesmetode
flow-setup-2fa-backup-choice-description = Dette giver dig mulighed for at logge ind, hvis du ikke har adgang til din mobile enhed eller godkendelsesapp.
flow-setup-2fa-backup-choice-phone-title = Telefonnummer til genoprettelse
flow-setup-2fa-backup-choice-phone-badge = Nemmeste
flow-setup-2fa-backup-choice-phone-info = Få en genoprettelseskode i en SMS-besked. Er i øjeblikket kun tilgængeligt i USA og Canada.
flow-setup-2fa-backup-choice-code-title = Reserve-godkendelseskoder
flow-setup-2fa-backup-choice-code-badge = Sikreste
flow-setup-2fa-backup-choice-code-info = Opret og gem engangs-godkendelseskoder.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Læs om genoprettelse og SIM-swapping-risiko

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Indtast reserve-godkendelseskode
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Bekræft at du har gemt dine koder ved at indtaste en af dem. Uden disse koder kan du muligvis ikke logge ind, hvis du ikke har din godkendelsesapp.
flow-setup-2fa-backup-code-confirm-code-input = Indtast koden på ti tegn
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Afslut

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Gem reserve-godkendelseskoder
flow-setup-2fa-backup-code-dl-save-these-codes = Gem dem et sted, du kan huske. Du skal indtaste en kode for at logge ind, hvis du ikke har adgang til din godkendelsesapp.
flow-setup-2fa-backup-code-dl-button-continue = Fortsæt

##

flow-setup-2fa-inline-complete-success-banner = Totrinsgodkendelse aktiveret
flow-setup-2fa-inline-complete-success-banner-description = For at beskytte alle dine forbundne enheder, bør du logge ud overalt, hvor du bruger denne konto, og derefter logge ind igen ved hjælp af din nye totrinsgodkendelse.
flow-setup-2fa-inline-complete-backup-code = Reserve-godkendelseskoder
flow-setup-2fa-inline-complete-backup-phone = Telefonnummer til genoprettelse
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } kode tilbage
       *[other] { $count } koder tilbage
    }
flow-setup-2fa-inline-complete-backup-code-description = Dette er den sikreste genoprettelsesmetode, hvis du ikke kan logge ind med din mobile enhed eller godkendelsesapp.
flow-setup-2fa-inline-complete-backup-phone-description = Dette er den nemmeste genoprettelsesmetode, hvis du ikke kan logge ind med din godkendelsesapp.
flow-setup-2fa-inline-complete-learn-more-link = Sådan beskytter det din konto
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Fortsæt til { $serviceName }
flow-setup-2fa-prompt-heading = Opsæt totrinsgodkendelse
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } kræver, at du opsætter totrinsgodkendelse for at holde din konto sikker.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Du kan anvende enhver af <authenticationAppsLink>disse godkendelsesapps</authenticationAppsLink> for at fortsætte.
flow-setup-2fa-prompt-continue-button = Fortsæt

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Indtast bekræftelseskode
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = En sekscifret kode blev sendt til <span>{ $phoneNumber }</span> i en SMS-besked. Denne kode udløber efter fem minutter.
flow-setup-phone-confirm-code-input-label = Indtast sekscifret kode
flow-setup-phone-confirm-code-button = Bekræft
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Er koden udløbet?
flow-setup-phone-confirm-code-resend-code-button = Send kode igen
flow-setup-phone-confirm-code-resend-code-success = Kode sendt
flow-setup-phone-confirm-code-success-message-v2 = Telefonnummer til genoprettelse tilføjet
flow-change-phone-confirm-code-success-message = Telefonnummer til genoprettelse ændret

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Bekræft dit telefonnummer
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Du vil modtage en SMS-besked fra { -brand-mozilla } med en kode til at bekræfte dit nummer. Del ikke denne koden med nogen.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Telefonnumre til genoprettelse er kun tilgængelige i USA og Canada. VoIP-numre og telefon-masker anbefales ikke.
flow-setup-phone-submit-number-legal = Ved at oplyse dit nummer accepterer du, at vi gemmer det. Vi bruger det kun til at sende SMS-beskeder til dig til kontobekræftelse. Der kan forekomme takster for SMS-beskeder og data.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Send kode

## HeaderLockup component, the header in account settings

header-menu-open = Luk menu
header-menu-closed = Menu til websteds-navigation
header-back-to-top-link =
    .title = Tilbage til toppen
header-back-to-settings-link =
    .title = Tilbage til { -product-mozilla-account }-indstillinger
header-title-2 = { -product-mozilla-account }
header-help = Hjælp

## Linked Accounts section

la-heading = Tilknyttede konti
la-description = Du har godkendt adgang til følgende konti.
la-unlink-button = Fjern tilknytning
la-unlink-account-button = Fjern tilknytning
la-set-password-button = Angiv adgangskode
la-unlink-heading = Fjern tilknytning til tredjeparts-konto
la-unlink-content-3 = Er du sikker på, at du vil fjerne tilknytningen til din konto? Hvis du fjerner tilknytningen til din konto, logges du ikke automatisk ud af dine forbundne tjenester. For at gøre det, skal du manuelt logge ud i afsnittet Forbundne tjenester.
la-unlink-content-4 = Inden du fjerner tilknytningen til din konto, skal du angive en adgangskode. Uden en adgangskode er det umuligt at logge ind, efter du har fjernet tilknytningen til din konto.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Luk
modal-cancel-button = Annuller
modal-default-confirm-button = Bekræft

## ModalMfaProtected

modal-mfa-protected-title = Indtast bekræftelseskode
modal-mfa-protected-subtitle = Hjælp os med at sikre, at det er dig, der ændrer dine kontooplysninger
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Indtast koden, der blev sendt til <email>{ $email }</email>, indenfor { $expirationTime } minut.
       *[other] Indtast koden, der blev sendt til <email>{ $email }</email>, indenfor { $expirationTime } minutter.
    }
modal-mfa-protected-input-label = Indtast sekscifret kode
modal-mfa-protected-cancel-button = Annuller
modal-mfa-protected-confirm-button = Bekræft
modal-mfa-protected-code-expired = Er koden udløbet?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Send en ny kode.

## Modal Verify Session

mvs-verify-your-email-2 = Bekræft din mailadresse
mvs-enter-verification-code-2 = Indtast din bekræftelseskode
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Indtast den bekræftelseskode, der blev sendt til <email>{ $email }</email>, indenfor fem minutter.
msv-cancel-button = Annuller
msv-submit-button-2 = Bekræft

## Settings Nav

nav-settings = Indstillinger
nav-profile = Profil
nav-security = Sikkerhed
nav-connected-services = Forbundne tjenester
nav-data-collection = Dataindsamling og -brug
nav-paid-subs = Betalte abonnementer
nav-email-comm = Mail-kommunikation

## Page2faChange

page-2fa-change-title = Skift totrinsgodkendelse
page-2fa-change-success = Totrinsgodkendelse er blevet opdateret
page-2fa-change-success-additional-message = For at beskytte alle dine forbundne enheder, bør du logge ud overalt, hvor du bruger denne konto, og derefter logge ind igen ved hjælp af din nye totrinsgodkendelse.
page-2fa-change-totpinfo-error = Der opstod en fejl under udskiftningen af din godkendelsesapp til totrinsgodkendelse. Prøv igen senere.
page-2fa-change-qr-instruction = <strong>Trin 1:</strong> Skan denne QR-kode ved hjælp af en godkendelsesapp, såsom Duo eller Google Authenticator. Dette opretter en ny forbindelse, og gamle forbindelser vil ikke længere fungere.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Reserve-godkendelseskoder
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Der opstod et problem med at erstatte dine reserve-godkendelseskoder
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Der opstod et problem med at oprette dine reserve-godkendelseskoder
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Reserve-godkendelseskoder opdateret
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Reserve-godkendelseskoder oprettet
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Gem dem et sted, du kan huske. Dine gamle koder vil blive erstattet, når du har gennemført næste trin.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Bekræft at du har gemt dine koder ved at indtaste en af dem. Dine gamle reserve-godkendelseskoder vil blive deaktiveret, når dette trin er gennemført.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Forkert reserve-godkendelseskode

## Page2faSetup

page-2fa-setup-title = Totrinsgodkendelse
page-2fa-setup-totpinfo-error = Der opstod en fejl under opsætningen af totrinsgodkendelse. Prøv igen senere.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Den kode er ikke korrekt. Prøv igen.
page-2fa-setup-success = Totrinsgodkendelse er blevet aktiveret
page-2fa-setup-success-additional-message = For at beskytte alle dine forbundne enheder, bør du logge ud overalt, hvor du bruger denne konto, og derefter logge ind igen ved hjælp af totrinsgodkendelse.

## Avatar change page

avatar-page-title =
    .title = Profilbillede
avatar-page-add-photo = Tilføj billede
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Tag billede
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Fjern billede
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Tag billede igen
avatar-page-cancel-button = Annuller
avatar-page-save-button = Gem
avatar-page-saving-button = Gemmer…
avatar-page-zoom-out-button =
    .title = Zoom ud
avatar-page-zoom-in-button =
    .title = Zoom ind
avatar-page-rotate-button =
    .title = Roter
avatar-page-camera-error = Kunne ikke initialisere kamera
avatar-page-new-avatar =
    .alt = nyt profilbillede
avatar-page-file-upload-error-3 = Der opstod et problem med at uploade dit profilbillede
avatar-page-delete-error-3 = Der opstod et problem med at slette dit profilbillede
avatar-page-image-too-large-error-2 = Billedfilen er for stor til at blive uploadet

## Password change page

pw-change-header =
    .title = Skift adgangskode
pw-8-chars = Mindst otte tegn
pw-not-email = Ikke din mailadresse
pw-change-must-match = Ny adgangskode matcher bekræftelsen
pw-commonly-used = Ikke en almindeligt brugt adgangskode
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Beskyt dig selv — genbrug ikke adgangskoder. Læs mere om, hvordan du <linkExternal>opretter stærke adgangskoder</linkExternal>.
pw-change-cancel-button = Annuller
pw-change-save-button = Gem
pw-change-forgot-password-link = Glemt adgangskode?
pw-change-current-password =
    .label = Indtast nuværende adgangskode
pw-change-new-password =
    .label = Indtast ny adgangskode
pw-change-confirm-password =
    .label = Bekræft ny adgangskode
pw-change-success-alert-2 = Adgangskode opdateret

## Password create page

pw-create-header =
    .title = Opret adgangskode
pw-create-success-alert-2 = Adgangskode oprettet
pw-create-error-2 = Der opstod desværre et problem med at oprette din adgangskode

## Delete account page

delete-account-header =
    .title = Slet konto
delete-account-step-1-2 = Trin 1 af 2
delete-account-step-2-2 = Trin 2 af 2
delete-account-confirm-title-4 = Du har muligvis knyttet din { -product-mozilla-account } til en eller flere af følgende { -brand-mozilla }-produkter eller tjenester, der sikrer dit privatliv og øger din produktivitet på nettet:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synkronisering af { -brand-firefox }-data
delete-account-product-firefox-addons = { -brand-firefox }-tilføjelser
delete-account-acknowledge = Bekræft venligst, at når du sletter din konto:
delete-account-chk-box-1-v4 =
    .label = Bliver alle dine betalte abonnementer annulleret
delete-account-chk-box-2 =
    .label = Kan du miste gemte oplysninger og funktioner i { -brand-mozilla }-produkter
delete-account-chk-box-3 =
    .label = Vil genaktivering med denne mailadresse muligvis ikke gendanne dine gemte oplysninger
delete-account-chk-box-4 =
    .label = Bliver alle udvidelser og temaer, du har udgivet via addons.mozilla.org, slettet
delete-account-continue-button = Fortsæt
delete-account-password-input =
    .label = Indtast adgangskode
delete-account-cancel-button = Annuller
delete-account-delete-button-2 = Slet

## Display name page

display-name-page-title =
    .title = Vist navn
display-name-input =
    .label = Indtast vist navn
submit-display-name = Gem
cancel-display-name = Annuller
display-name-update-error-2 = Der opstod et problem med at opdatere dit vist navn
display-name-success-alert-2 = Vist navn opdateret

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Seneste kontoaktivitet
recent-activity-account-create-v2 = Konto oprettet
recent-activity-account-disable-v2 = Konto deaktiveret
recent-activity-account-enable-v2 = Konto aktiveret
recent-activity-account-login-v2 = Login på konto påbegyndt
recent-activity-account-reset-v2 = Nulstilling af adgangskode påbegyndt
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Meddelelser om afviste mails ryddet
recent-activity-account-login-failure = Forsøg på kontologin mislykkedes
recent-activity-account-two-factor-added = Totrinsgodkendelse aktiveret
recent-activity-account-two-factor-requested = Anmodet om totrinsgodkendelse
recent-activity-account-two-factor-failure = Totrinsgodkendelse mislykkedes
recent-activity-account-two-factor-success = Totrinsgodkendelse lykkedes
recent-activity-account-two-factor-removed = Totrinsgodkendelse fjernet
recent-activity-account-password-reset-requested = Kontoen anmodede om nulstilling af adgangskode
recent-activity-account-password-reset-success = Adgangskode til konto nulstillet
recent-activity-account-recovery-key-added = Genoprettelsesnøgle til konto aktiveret
recent-activity-account-recovery-key-verification-failure = Bekræftelse af genoprettelsesnøgle til konto mislykkedes
recent-activity-account-recovery-key-verification-success = Bekræftelse af genoprettelsesnøgle til konto lykkedes
recent-activity-account-recovery-key-removed = Genoprettelsesnøgle til konto blev fjernet
recent-activity-account-password-added = Ny adgangskode tilføjet
recent-activity-account-password-changed = Adgangskode ændret
recent-activity-account-secondary-email-added = Sekundær mailadresse tilføjet
recent-activity-account-secondary-email-removed = Sekundær mailadresse fjernet
recent-activity-account-emails-swapped = Primær og sekundær mailadresse byttet om
recent-activity-session-destroy = Logget ud af session
recent-activity-account-recovery-phone-send-code = Telefonnummer til genoprettelse sendt
recent-activity-account-recovery-phone-setup-complete = Opsætning af telefonnummer til genoprettelse fuldført
recent-activity-account-recovery-phone-signin-complete = Login med telefonnummer til genoprettelse fuldført
recent-activity-account-recovery-phone-signin-failed = Login med telefonnummer til genoprettelse mislykkedes
recent-activity-account-recovery-phone-removed = Telefonnummer til genoprettelse fjernet
recent-activity-account-recovery-codes-replaced = Genoprettelseskoder udskiftet
recent-activity-account-recovery-codes-created = Genoprettelseskoder oprettet
recent-activity-account-recovery-codes-signin-complete = Login med genoprettelseskoder fuldført
recent-activity-password-reset-otp-sent = Bekræftelseskode til nulstilling af adgangskode sendt
recent-activity-password-reset-otp-verified = Bekræftelseskode til nulstilling af adgangskode bekræftet
recent-activity-must-reset-password = Nulstilling af adgangskode påkrævet
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Anden kontoaktivitet

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Genoprettelsesnøgle til kontoen
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Tilbage til indstillinger

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Fjern telefonnummer til genoprettelse
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Dette vil fjerne <strong>{ $formattedFullPhoneNumber }</strong> som telefonnummer til genoprettelse.
settings-recovery-phone-remove-recommend = Vi anbefaler, at du beholder denne metode, da det er lettere end at gemme reserve-godkendelseskoder.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Hvis du sletter det, så sørg for, at du stadig har gemte reserve-godkendelseskoder. <linkExternal>Sammenlign genoprettelsesmetoder</linkExternal>
settings-recovery-phone-remove-button = Fjern telefonnummer
settings-recovery-phone-remove-cancel = Annuller
settings-recovery-phone-remove-success = Telefonnummer til genoprettelse fjernet

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Tilføj telefonnummer til genoprettelse
page-change-recovery-phone = Skift telefonnummer til genoprettelse
page-setup-recovery-phone-back-button-title = Tilbage til indstillinger
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Skift telefonnummer

## Add secondary email page

add-secondary-email-step-1 = Trin 1 af 2
add-secondary-email-error-2 = Der opstod et problem med at oprette denne mailadresse
add-secondary-email-page-title =
    .title = Sekundær mailadresse
add-secondary-email-enter-address =
    .label = Indtast mailadresse
add-secondary-email-cancel-button = Annuller
add-secondary-email-save-button = Gem
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Mail-masker kan ikke bruges som sekundær mailadresse

## Verify secondary email page

add-secondary-email-step-2 = Trin 2 af 2
verify-secondary-email-page-title =
    .title = Sekundær mailadresse
verify-secondary-email-verification-code-2 =
    .label = Indtast din bekræftelseskode
verify-secondary-email-cancel-button = Annuller
verify-secondary-email-verify-button-2 = Bekræft
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Indtast den bekræftelseskode, der blev sendt til <strong>{ $email }</strong>, indenfor fem minutter.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } tilføjet
verify-secondary-email-resend-code-button = Send bekræftelseskode igen

##

# Link to delete account on main Settings page
delete-account-link = Slet konto
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Logget ind. Din { -product-mozilla-account } og tilhørende data forbliver aktive.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Find ud af, hvor dine private oplysninger er blevet eksponeret, og løs problemet
# Links out to the Monitor site
product-promo-monitor-cta = Få en gratis skanning

## Profile section

profile-heading = Profil
profile-picture =
    .header = Billede
profile-display-name =
    .header = Vist navn
profile-primary-email =
    .header = Primær mailadresse

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Trin { $currentStep } af { $numberOfSteps }.

## Security section of Setting

security-heading = Sikkerhed
security-password =
    .header = Adgangskode
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Oprettet { $date }
security-not-set = Ikke oprettet
security-action-create = Opret
security-set-password = Opret en adgangskode for at synkronisere og bruge visse kontosikkerhedsfunktioner.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Se seneste kontoaktivitet
signout-sync-header = Sessionen er udløbet
signout-sync-session-expired = Noget gik galt. Log ud via browser-menuen og prøv igen.

## SubRow component

tfa-row-backup-codes-title = Reserve-godkendelseskoder
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Ingen koder tilgængelige
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } kode tilbage
       *[other] { $numCodesAvailable } koder tilbage
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Opret nye koder
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Tilføj
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Dette er den sikreste genoprettelsesmetode, hvis du ikke kan bruge til din mobile enhed eller godkendelsesapp.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Telefonnummer til genoprettelse
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Intet telefonnummer tilføjet
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Skift
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Tilføj
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Fjern
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Fjern telefonnummer til genoprettelse
tfa-row-backup-phone-delete-restriction-v2 = Hvis du vil fjerne dit telefonnummer til genoprettelse, skal du først tilføje reserve-godkendelseskoder eller deaktiver totrinsgodkendelse for at undgå at blive låst ude af din konto.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Dette er den nemmeste genoprettelsesmetode, hvis du ikke kan bruge din godkendelsesapp.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Læs mere om SIM-swapping-risiko

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Slå fra
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Slå til
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Indsender…
switch-is-on = til
switch-is-off = fra

## Sub-section row Defaults

row-defaults-action-add = Tilføj
row-defaults-action-change = Skift
row-defaults-action-disable = Deaktiver
row-defaults-status = Ingen

## Account recovery key sub-section on main Settings page

rk-header-1 = Genoprettelsesnøgle til kontoen
rk-enabled = Aktiveret
rk-not-set = Ikke indstillet
rk-action-create = Opret
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Skift
rk-action-remove = Fjern
rk-key-removed-2 = Genoprettelsesnøgle til kontoen blev fjernet
rk-cannot-remove-key = Genoprettelsesnøglen til din konto kunne ikke fjernes.
rk-refresh-key-1 = Opdater genoprettelsesnøgle til kontoen
rk-content-explain = Gendan dine gemte informationer, når du har glemt din adgangskode.
rk-cannot-verify-session-4 = Der opstod desværre et problem med at bekræfte din session
rk-remove-modal-heading-1 = Fjern genoprettelsesnøgle til kontoen?
rk-remove-modal-content-1 =
    Hvis du nulstiller din adgangskode, kan du ikke bruge din genoprettelsesnøgle
    til kontoen til at få adgang til dine data. Du kan ikke fortryde denne handling.
rk-remove-error-2 = Genoprettelsesnøglen til din konto kunne ikke fjernes
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Slet genoprettelsesnøgle til kontoen

## Secondary email sub-section on main Settings page

se-heading = Sekundær mailadresse
    .header = Sekundær mailadresse
se-cannot-refresh-email = Der opstod desværre et problem med at opdatere mailadressen.
se-cannot-resend-code-3 = Der opstod desværre et problem med at sende bekræftelseskoden igen
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } er nu din primære mailadresse
se-set-primary-error-2 = Der opstod desværre et problem med at ændre din primære mailadresse
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } blev slettet
se-delete-email-error-2 = Der opstod desværre et problem med at slette denne mailadresse
se-verify-session-3 = Du skal bekræfte din nuværende session for at udføre denne handling
se-verify-session-error-3 = Der opstod desværre et problem med at bekræfte din session
# Button to remove the secondary email
se-remove-email =
    .title = Fjern mailadresse
# Button to refresh secondary email status
se-refresh-email =
    .title = Opdater mailadresse
se-unverified-2 = Ikke-bekræftet
se-resend-code-2 =
    Bekræftelse nødvendig. <button>Send bekræftelseskode igen</button>,
    hvis den ikke er i din indbakke eller spam-mappe.
# Button to make secondary email the primary
se-make-primary = Sæt som primær
se-default-content = Få adgang til din konto, hvis du ikke kan logge ind på din primære mailkonto.
se-content-note-1 =
    Bemærk: En sekundær mailadresse vil ikke gendanne dine gemte informationer — du
    skal bruge en <a>genoprettelsesnøgle til kontoen</a> til det.
# Default value for the secondary email
se-secondary-email-none = Ingen

## Two Step Auth sub-section on Settings main page

tfa-row-header = Totrinsgodkendelse
tfa-row-enabled = Aktiveret
tfa-row-disabled-status = Deaktiveret
tfa-row-action-add = Tilføj
tfa-row-action-disable = Deaktiver
tfa-row-action-change = Skift
tfa-row-button-refresh =
    .title = Opdater totrinsgodkendelse
tfa-row-cannot-refresh =
    Der opstod desværre et problem med at opdatere
    totrinsgodkendelse.
tfa-row-enabled-description = Din konto er beskyttet af totrinsgodkendelse. Du skal indtaste en engangskode fra din godkendelsesapp, når du logger ind på din { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Sådan beskytter det din konto
tfa-row-disabled-description-v2 = Beskyt din konto ved at bruge en tredjeparts godkendelsesapp som et andet trin til at logge ind.
tfa-row-cannot-verify-session-4 = Der opstod desværre et problem med at bekræfte din session
tfa-row-disable-modal-heading = Deaktiver totrinsgodkendelse?
tfa-row-disable-modal-confirm = Deaktiver
tfa-row-disable-modal-explain-1 =
    Du kan ikke fortryde denne handling. Du har også
    mulighed for at <linkExternal>erstatte dine reserve-godkendelseskoder</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Totrinsgodkendelse deaktiveret
tfa-row-cannot-disable-2 = Totrinsgodkendelse kunne ikke deaktiveres
tfa-row-verify-session-info = Du skal bekræfte din nuværende session for at opsætte totrinsgodkendelse.

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Ved at fortsætte accepterer du:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Tjenestevilkår</mozSubscriptionTosLink> og <mozSubscriptionPrivacyLink>privatlivserklæring</mozSubscriptionPrivacyLink> for { -brand-mozilla }s abonnementstjenester
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>tjenestevilkår</mozillaAccountsTos> og <mozillaAccountsPrivacy>privatlivserklæring</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Ved at fortsætte accepterer du <mozillaAccountsTos>tjenestevilkårene</mozillaAccountsTos> og <mozillaAccountsPrivacy>privatlivserklæringen</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = eller
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Log ind med
continue-with-google-button = fortsæt med { -brand-google }
continue-with-apple-button = fortsæt med { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Ukendt konto
auth-error-103 = Forkert adgangskode
auth-error-105-2 = Ugyldig bekræftelseskode
auth-error-110 = Ugyldigt token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Du har prøvet for mange gange. Prøv igen senere.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Du har prøvet for mange gange. Prøv igen { $retryAfter }.
auth-error-125 = Forespørgslen blev blokeret af sikkerhedsmæssige årsager
auth-error-129-2 = Du har indtastet et ugyldigt telefonnummer. Kontroller det, og prøv igen.
auth-error-138-2 = Ubekræftet session
auth-error-139 = Sekundær mailadresse skal være forskellig fra mailadressen til din konto
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Denne mailadresse er reserveret af en anden konto. Prøv igen senere eller brug en anden mailadresse.
auth-error-155 = TOTP-token ikke fundet
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Reserve-godkendelseskode ikke fundet
auth-error-159 = Ugyldig genoprettelsesnøgle til kontoen
auth-error-183-2 = Ugyldig eller udløbet bekræftelseskode
auth-error-202 = Funktionen er ikke aktiveret
auth-error-203 = Systemet er ikke tilgængeligt, prøv igen om lidt
auth-error-206 = Kan ikke oprette adgangskode, adgangskode allerede angivet
auth-error-214 = Telefonnummer til genoprettelse findes allerede
auth-error-215 = Telefonnummer til genoprettelse findes ikke
auth-error-216 = Grænsen for SMS-beskeder er nået
auth-error-218 = Kunne ikke fjerne telefonnummer til genoprettelse, mangler reserve-godkendelseskoder.
auth-error-219 = Dette telefonnummer er blevet registreret med for mange konti. Prøv et andet nummer.
auth-error-999 = Uventet fejl
auth-error-1001 = Login-forsøg annulleret
auth-error-1002 = Sessionen udløb. Log ind for at fortsætte.
auth-error-1003 = Lokalt lager eller cookies er stadig deaktiveret
auth-error-1008 = Din nye adgangskode skal være anderledes
auth-error-1010 = Gyldig adgangskode påkrævet
auth-error-1011 = Gyldig mailadresse påkrævet
auth-error-1018 = Din bekræftelsesmail kom retur. Forkert indtastet mailadresse?
auth-error-1020 = Forkert indtastet mailadresse? firefox.com er ikke en gyldig mail-tjeneste
auth-error-1031 = Du skal indtaste din alder for at tilmelde dig
auth-error-1032 = Du skal indtaste en gyldig alder for at tilmelde dig
auth-error-1054 = Ugyldig kode til totrinsgodkendelse
auth-error-1056 = Ugyldig reserve-godkendelseskode
auth-error-1062 = Ugyldig omdirigering
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Forkert indtastet mailadresse? { $domain } er ikke en gyldig mail-tjeneste
auth-error-1066 = Mail-masker kan ikke bruges til at oprette en konto.
auth-error-1067 = Forkert indtastet mailadresse?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Nummer, der ender på { $lastFourPhoneNumber }
oauth-error-1000 = Noget gik galt. Luk dette faneblad og prøv igen.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Du er logget ind på { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Mailadresse bekræftet
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Login er bekræftet
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Log ind på denne { -brand-firefox } for at færdiggøre opsætningen
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Log ind
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Tilføjer du flere enheder? Log ind på { -brand-firefox } på en anden enhed for at færdiggøre opsætningen
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Log ind på { -brand-firefox } på en anden enhed for at færdiggøre opsætningen
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Vil du have dine faneblade, bogmærker og adgangskoder på en anden enhed?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Opret forbindelse til en ny enhed
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ikke nu
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Log ind på { -brand-firefox } til Android for at færdiggøre opsætningen
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Log ind på { -brand-firefox } til iOS for at færdiggøre opsætningen

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Lokalt lager og cookies er påkrævet
cookies-disabled-enable-prompt-2 = Du skal aktivere cookies og lokalt lager i din browser for at tilgå din { -product-mozilla-account }. Dette vil aktivere funktioner som fx at huske dig mellem sessioner.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Prøv igen
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Læs mere

## Index / home page

index-header = Indtast din mailadresse
index-sync-header = Fortsæt til { -product-mozilla-account }
index-sync-subheader = Synkroniser dine adgangskoder, faneblade og bogmærker overalt, hvor du bruger { -brand-firefox }.
index-relay-header = Opret en mail-maske
index-relay-subheader = Angiv den mailadresse, som mails fra din maskerede mailadresse skal videresendes til.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Fortsæt til { $serviceName }
index-subheader-default = Fortsæt til kontoindstillinger
index-cta = Tilmeld dig eller log ind
index-account-info = En { -product-mozilla-account } giver også adgang til flere privatlivsbeskyttende produkter fra { -brand-mozilla }.
index-email-input =
    .label = Indtast din mailadresse
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Kontoen er slettet
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Din bekræftelsesmail kom retur. Forkert indtastet mailadresse?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Vi kunne ikke oprette din genoprettelsesnøgle til kontoen. Prøv igen senere.
inline-recovery-key-setup-recovery-created = Genoprettelsesnøgle til kontoen blev oprettet
inline-recovery-key-setup-download-header = Beskyt din konto
inline-recovery-key-setup-download-subheader = Hent og gem den nu
inline-recovery-key-setup-download-info = Gem denne nøgle et sted, du vil huske - du kan ikke vende tilbage til denne side senere.
inline-recovery-key-setup-hint-header = Sikkerhedsanbefaling

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Annuller opsætning
inline-totp-setup-continue-button = Fortsæt
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Tilføj et ekstra lag af sikkerhed til din konto ved at kræve godkendelseskoder fra én af <authenticationAppsLink>disse godkendelsesapps</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Aktiver totrinsgodkendelse <span>for at fortsætte til kontoindstillingerne</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Aktiver totrinsgodkendelse <span>for at fortsætte til { $serviceName }</span>
inline-totp-setup-ready-button = Klar
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Skan godkendelseskoden <span>for at fortsætte til { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Indtast koden manuelt <span>for at fortsætte til { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Skan godkendelseskoden <span>for at fortsætte til kontoindstillingerne</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Indtast koden manuelt <span>for at fortsætte til kontoindstillingerne</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Skriv denne hemmelige nøgle i din godkendelsesapp. <toggleToQRButton>Skan QR-kode i stedet?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Skan QR-koden i din godkendelsesapp, og indtast den angivne godkendelseskode. <toggleToManualModeButton>Kan du ikke skanne koden?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Når processen er afsluttet, oprettes godkendelseskoder, som du kan indtaste.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Godkendelseskode
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Godkendelseskode påkrævet
tfa-qr-code-alt = Brug koden { $code } til at opsætte totrinsgodkendelse i understøttede applikationer.
inline-totp-setup-page-title = Totrinsgodkendelse

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Juridisk
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Tjenestevilkår
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Privatlivserklæring

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Privatlivserklæring

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Tjenestevilkår

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Har du lige logget ind på { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Ja, godkend enhed
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Hvis det ikke var dig, så <link>skift din adgangskode</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Enhed forbundet
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Du synkroniserer nu med: { $deviceFamily } på { $deviceOS }
pair-auth-complete-sync-benefits-text = Nu har du adgang til dine åbne faneblade, adgangskoder og bogmærker på alle dine enheder.
pair-auth-complete-see-tabs-button = Se faneblade fra synkroniserede enheder
pair-auth-complete-manage-devices-link = Håndter enheder

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Indtast godkendelseskoden <span>for at fortsætte til kontoindstillingerne</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Indtast godkendelseskoden <span>for at fortsætte til { $serviceName }</span>
auth-totp-instruction = Åbn din godkendelsesapp og indtast den angivne godkendelseskode.
auth-totp-input-label = Indtast sekscifret kode
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Bekræft
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Godkendelseskode påkrævet

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Godkendelse er nu påkrævet <span>fra din anden enhed</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Parring mislykkedes
pair-failure-message = Opsætningen blev afbrudt.

## Pair index page

pair-sync-header = Synkroniser { -brand-firefox } på din telefon eller tablet
pair-cad-header = Forbind { -brand-firefox } på en anden enhed
pair-already-have-firefox-paragraph = Har du allerede { -brand-firefox } på en telefon eller tablet?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synkroniser din enhed
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = eller hent
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Skan for at hente { -brand-firefox } til mobilen, eller send dig selv et <linkExternal>link til at hente appen</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ikke nu
pair-take-your-data-message = Tag dine faneblade, bogmærker og adgangskoder med dig overalt, hvor du bruger { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Kom i gang
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-kode

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Enhed forbundet
pair-success-message-2 = Parring lykkedes.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Bekræft parring <span>for { $email }</span>
pair-supp-allow-confirm-button = Bekræft parring
pair-supp-allow-cancel-link = Annuller

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Godkendelse er nu påkrævet <span>fra din anden enhed</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Parring ved hjælp af en app
pair-unsupported-message = Brugte du systemets kamera? Du skal parre ved hjælp af en { -brand-firefox }-app.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Opret adgangskode for at synkronisere
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Dette krypterer dine data. Den skal være forskellig fra adgangskoden til din { -brand-google }- eller { -brand-apple }-konto.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Vent venligst, du bliver omdirigeret til den godkendte applikation.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Indtast din genoprettelsesnøgle til kontoen
account-recovery-confirm-key-instruction = Med denne nøgle gendanner dine krypterede browserdata som fx adgangskoder og bogmærker fra { -brand-firefox }' servere.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Indtast din genoprettelsesnøgle til kontoen på 32 tegn
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Din huskeregel er:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Fortsæt
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Kan du ikke finde din genoprettelsesnøgle til kontoen?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Opret en ny adgangskode
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Adgangskode oprettet
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Der opstod desværre et problem med at oprette din adgangskode
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Brug en genoprettelsesnøgle til kontoen
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Din adgangskode er blevet nulstillet.
reset-password-complete-banner-message = Glem ikke at oprette en ny genoprettelsesnøgle til kontoen fra { -product-mozilla-account }-indstillingerne for at forhindre fremtidige login-problemer.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } vil forsøge at sende dig tilbage, så du kan bruge en mail-maske, når du har logget ind.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Indtast koden på ti tegn
confirm-backup-code-reset-password-confirm-button = Bekræft
confirm-backup-code-reset-password-subheader = Indtast reserve-godkendelseskode
confirm-backup-code-reset-password-instruction = Indtast en af engangskoderne, du gemte, da du opsatte totrinsgodkendelse.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Er du blevet låst ude?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Tjek din mail
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Vi sendte en bekræftelseskode til <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Indtast ottecifret kode indenfor ti minutter
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Fortsæt
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Send kode igen
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Brug en anden konto

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Nulstil din adgangskode
confirm-totp-reset-password-subheader-v2 = Indtast kode til totrinsgodkendelse
confirm-totp-reset-password-instruction-v2 = Tjek din <strong>godkendelsesapp</strong> for at nulstille din adgangskode.
confirm-totp-reset-password-trouble-code = Har du problemer med at indtaste koden?
confirm-totp-reset-password-confirm-button = Bekræft
confirm-totp-reset-password-input-label-v2 = Indtast sekscifret kode
confirm-totp-reset-password-use-different-account = Brug en anden konto

## ResetPassword start page

password-reset-flow-heading = Nulstil din adgangskode
password-reset-body-2 = For at sikre din konto, spørger vi dig om nogle ting, som kun du kender.
password-reset-email-input =
    .label = Indtast din mailadresse
password-reset-submit-button-2 = Fortsæt

## ResetPasswordConfirmed

reset-password-complete-header = Din adgangskode er blevet nulstillet
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Fortsæt til { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Nulstil din adgangskode
password-reset-recovery-method-subheader = Vælg en genoprettelsesmetode
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Lad os sikre os, at det er dig, der bruger dine genoprettelsesmetoder.
password-reset-recovery-method-phone = Telefonnummer til genoprettelse
password-reset-recovery-method-code = Reserve-godkendelseskoder
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kode tilbage
       *[other] { $numBackupCodes } koder tilbage
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Der opstod et problem under afsendelse af en kode til dit telefonnummer til genoprettelse
password-reset-recovery-method-send-code-error-description = Prøv igen senere eller brug dine reserve-godkendelseskoder.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Nulstil din adgangskode
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Indtast genoprettelseskode
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = En sekscifret kode blev sendt i en SMS-besked til telefonnummeret, der ender på <span>{ $lastFourPhoneDigits }</span>. Denne kode udløber efter fem minutter. Del ikke denne kode med nogen.
reset-password-recovery-phone-input-label = Indtast sekscifret kode
reset-password-recovery-phone-code-submit-button = Bekræft
reset-password-recovery-phone-resend-code-button = Send kode igen
reset-password-recovery-phone-resend-success = Kode sendt
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Er du blevet låst ude?
reset-password-recovery-phone-send-code-error-heading = Der opstod et problem med at sende en kode
reset-password-recovery-phone-code-verification-error-heading = Der opstod et problem med at bekræfte din kode
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Prøv igen senere.
reset-password-recovery-phone-invalid-code-error-description = Koden er ugyldig eller udløbet.
reset-password-recovery-phone-invalid-code-error-link = Brug reserve-godkendelseskoder i stedet?
reset-password-with-recovery-key-verified-page-title = Adgangskoden er blevet nulstillet
reset-password-complete-new-password-saved = Ny adgangskode gemt!
reset-password-complete-recovery-key-created = Ny genoprettelsesnøgle til kontoen oprettet. Hent og gem den nu.
reset-password-complete-recovery-key-download-info =
    Denne nøgle er nødvendig for
    gendannelse af data, hvis du glemmer din adgangskode. <b>Hent og gem den sikkert nu,
    da du ikke kan få adgang til denne side igen senere.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Fejl:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Validerer login…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Bekræftelsesfejl
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Bekræftelseslinket er udløbet
signin-link-expired-message-2 = Linket, du klikkede på, er udløbet eller er allerede blevet brugt.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Indtast adgangskoden <span>til din { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Fortsæt til { $serviceName }
signin-subheader-without-logo-default = Fortsæt til kontoindstillinger
signin-button = Log ind
signin-header = Log ind
signin-use-a-different-account-link = Brug en anden konto
signin-forgot-password-link = Glemt adgangskode?
signin-password-button-label = Adgangskode
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } vil forsøge at sende dig tilbage, så du kan bruge en mail-maske, når du har logget ind.
signin-code-expired-error = Koden er udløbet. Log ind igen.
signin-account-locked-banner-heading = Nulstil din adgangskode
signin-account-locked-banner-description = Vi har låst din konto for at beskytte den mod mistænkelig aktivitet.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Nulstil din adgangskode for at logge ind

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Linket, du klikkede på, manglede tegn og kan være blevet ødelagt af dit mailprogram. Kopier adressen, og prøv igen.
report-signin-header = Rapportér uautoriseret login?
report-signin-body = Du har modtaget en mail vedrørende forsøg på at få adgang til din konto. Vi du rapportere denne aktivitet som mistænkelig?
report-signin-submit-button = Rapportér aktivitet
report-signin-support-link = Hvorfor sker dette?
report-signin-error = Der opstod desværre et problem under indsendelsen af rapporten.
signin-bounced-header = Vi har låst din konto.
# $email (string) - The user's email.
signin-bounced-message = Bekræftelsesmailen, vi sendte til{ $email }, kom retur, så vi har låst din konto for at beskytte dine { -brand-firefox }-data.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Hvis det er en gyldig mailadresse, <linkExternal>så fortæl os det</linkExternal>. Så kan vi hjælpe med at låse din konto op.
signin-bounced-create-new-account = Er du ikke længere ejer af mailadressen? Opret en ny konto
back = Tilbage

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Bekræft dette login <span>for at fortsætte til kontoindstillinger</span>
signin-push-code-heading-w-custom-service = Bekræft dette login <span>for at fortsætte til { $serviceName }</span>
signin-push-code-instruction = Kontroller dine andre enheder og godkend dette login fra din { -brand-firefox }-browser.
signin-push-code-did-not-recieve = Har du ikke modtaget beskeden?
signin-push-code-send-email-link = Send kode

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Bekræft dit login
signin-push-code-confirm-description = Vi har registreret et login-forsøg fra følgende enhed. Hvis det var dig, så godkend login'et
signin-push-code-confirm-verifying = Bekræfter
signin-push-code-confirm-login = Bekræft login
signin-push-code-confirm-wasnt-me = Det var ikke mig, skift adgangskode.
signin-push-code-confirm-login-approved = Dit login er blevet godkendt. Luk dette vindue.
signin-push-code-confirm-link-error = Link er beskadiget. Prøv igen.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Log ind
signin-recovery-method-subheader = Vælg en genoprettelsesmetode
signin-recovery-method-details = Lad os sikre os, at det er dig, der bruger dine genoprettelsesmetoder.
signin-recovery-method-phone = Telefonnummer til genoprettelse
signin-recovery-method-code-v2 = Reserve-godkendelseskoder
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kode tilbage
       *[other] { $numBackupCodes } koder tilbage
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Der opstod et problem under afsendelse af en kode til dit telefonnummer til genoprettelse
signin-recovery-method-send-code-error-description = Prøv igen senere eller brug dine reserve-godkendelseskoder.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Log ind
signin-recovery-code-sub-heading = Indtast reserve-godkendelseskode
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Indtast en af engangskoderne, du gemte, da du opsatte totrinsgodkendelse.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Indtast koden på ti tegn
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Bekræft
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Brug telefonnummer til genoprettelse
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Er du blevet låst ude?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Reserve-godkendelseskode påkrævet
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Der opstod et problem under afsendelse af en kode til dit telefonnummer til genoprettelse
signin-recovery-code-use-phone-failure-description = Prøv igen senere.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Log ind
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Indtast genoprettelseskode
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = En sekscifret kode blev sendt i en SMS-besked til telefonnummeret, der ender på <span>{ $lastFourPhoneDigits }</span>. Denne kode udløber efter fem minutter. Del ikke denne kode med nogen.
signin-recovery-phone-input-label = Indtast sekscifret kode
signin-recovery-phone-code-submit-button = Bekræft
signin-recovery-phone-resend-code-button = Send kode igen
signin-recovery-phone-resend-success = Kode sendt
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Er du blevet låst ude?
signin-recovery-phone-send-code-error-heading = Der opstod et problem med at sende en kode
signin-recovery-phone-code-verification-error-heading = Der opstod et problem med at bekræfte din kode
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Prøv igen senere.
signin-recovery-phone-invalid-code-error-description = Koden er ugyldig eller udløbet.
signin-recovery-phone-invalid-code-error-link = Brug reserve-godkendelseskoder i stedet?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Du er logget ind. Der kan være begrænsninger, hvis du bruger dit telefonnummer til genoprettelse igen.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Det er godt, at du er opmærksom!
signin-reported-message = Vores team har fået besked. Rapporter som denne hjælper os med at afværge ubudne gæster.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Indtast bekræftelseskoden<span> til din { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Indtast koden, der blev sendt til <email>{ $email }</email>, indenfor fem minutter.
signin-token-code-input-label-v2 = Indtast sekscifret kode
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Bekræft
signin-token-code-code-expired = Er koden udløbet?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Send en ny kode.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Bekræftelseskode påkrævet
signin-token-code-resend-error = Noget gik galt. En ny kode kunne ikke sendes.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } vil forsøge at sende dig tilbage, så du kan bruge en mail-maske, når du har logget ind.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Log ind
signin-totp-code-subheader-v2 = Indtast kode til totrinsgodkendelse
signin-totp-code-instruction-v4 = Tjek din <strong>godkendelsesapp</strong> for at bekræfte dit login.
signin-totp-code-input-label-v4 = Indtast sekscifret kode
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Hvorfor bliver du bedt om at godkende?
signin-totp-code-aal-banner-content = Du har opsat totrinsgodkendelse på din konto, men har ikke logget ind med en kode på denne enhed endnu.
signin-totp-code-aal-sign-out = Log ud på denne enhed
signin-totp-code-aal-sign-out-error = Der var desværre et problem med at logge dig ud
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Bekræft
signin-totp-code-other-account-link = Brug en anden konto
signin-totp-code-recovery-code-link = Har du problemer med at indtaste koden?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Godkendelseskode påkrævet
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } vil forsøge at sende dig tilbage, så du kan bruge en mail-maske, når du har logget ind.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Godkend dette login
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Tjek din mail for godkendelseskoden, der er sendt til { $email }.
signin-unblock-code-input = Indtast godkendelseskode
signin-unblock-submit-button = Fortsæt
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Godkendelseskode påkrævet
signin-unblock-code-incorrect-length = Godkendelseskoden skal indeholde otte tegn
signin-unblock-code-incorrect-format-2 = Godkendelseskoden kan kun indeholde bogstaver og/eller tal
signin-unblock-resend-code-button = Er den ikke i indbakken eller spam-mappen? Send igen
signin-unblock-support-link = Hvorfor sker dette?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } vil forsøge at sende dig tilbage, så du kan bruge en mail-maske, når du har logget ind.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Indtast bekræftelseskode
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Indtast bekræftelseskoden <span>til din { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Indtast koden, der blev sendt til <email>{ $email }</email>, indenfor fem minutter.
confirm-signup-code-input-label = Indtast sekscifret kode
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Bekræft
confirm-signup-code-sync-button = Start synkronisering
confirm-signup-code-code-expired = Er koden udløbet?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Send en ny kode.
confirm-signup-code-success-alert = Konto bekræftet
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Bekræftelseskode er påkrævet
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } vil forsøge at sende dig tilbage, så du kan bruge en mail-maske, når du har logget ind.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Opret en adgangskode
signup-relay-info = En adgangskode er nødvendig for at kunne håndtere dine maskerede mailadresser sikkert og få adgang til { -brand-mozilla }s sikkerhedsværktøjer.
signup-sync-info = Synkroniser dine adgangskoder, bogmærker og mere overalt, hvor du bruger { -brand-firefox }.
signup-sync-info-with-payment = Synkroniser dine adgangskoder, betalingsmetoder, bogmærker og mere overalt, hvor du bruger { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Skift mailadresse

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synkronisering er slået til
signup-confirmed-sync-success-banner = { -product-mozilla-account } bekræftet
signup-confirmed-sync-button = Gå i gang
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Dine adgangskoder, betalingsmetoder, adresser, bogmærker, historik og mere kan synkroniseres overalt, hvor du bruger { -brand-firefox }.
signup-confirmed-sync-description-v2 = Dine adgangskoder, adresser, bogmærker, historik og mere kan synkroniseres overalt, hvor du bruger { -brand-firefox }.
signup-confirmed-sync-add-device-link = Tilføj en ny enhed
signup-confirmed-sync-manage-sync-button = Håndter synkronisering
signup-confirmed-sync-set-password-success-banner = Adgangskode til synkronisering oprettet
