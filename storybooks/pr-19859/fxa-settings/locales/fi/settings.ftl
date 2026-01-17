# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Uusi koodi lähetettiin sähköpostiisi.
resend-link-success-banner-heading = Uusi linkki lähetettiin sähköpostiisi.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Lisää { $accountsEmail } yhteystietoihisi varmistaaksesi sujuvan toimituksen.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Sulje ilmoitus
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } saa uuden nimen 1. marraskuuta: { -product-mozilla-accounts }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Kirjaudut edelleen sisään samalla käyttäjätunnuksella ja salasanalla, eikä käyttämiisi tuotteisiin tapahdu muita muutoksia.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Olemme nimenneet { -product-firefox-accounts } uudelleen: { -product-mozilla-accounts }. Kirjaudut edelleen sisään samalla käyttäjätunnuksella ja salasanalla, eikä käyttämiisi tuotteisiin tapahdu muita muutoksia.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Lue lisää
# Alt text for close banner image
brand-close-banner =
    .alt = Sulje ilmoitus
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla }n m-logo

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Takaisin
button-back-title = Takaisin

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Lataa ja jatka
    .title = Lataa ja jatka
recovery-key-pdf-heading = Tilin palautusavain
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Luotu: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Tilin palautusavain
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Tämän avaimen avulla voit palauttaa salatut selaintietosi (mukaan lukien salasanat, kirjanmerkit ja historian), jos unohdat salasanasi. Säilytä avainta paikassa, jonka muistat.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Avaimen säilytyspaikkoja
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Lue lisää tilin palautusavaimesta
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Valitettavasti tilin palautusavaimen lataamisessa oli ongelma.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Lisää { -brand-mozilla }lta:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Vastaanota viimeisimmät uutiset ja tuotepäivitykset
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Varhainen pääsy uusien tuotteiden testaamiseen
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Kutsut Internetin kunnostamiseksi

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Ladattu
datablock-copy =
    .message = Kopioitu
datablock-print =
    .message = Tulostettu

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Koodi kopioitu
       *[other] Koodit kopioitu
    }
datablock-download-success =
    { $count ->
        [one] Koodi ladattu
       *[other] Koodit ladattu
    }
datablock-print-success =
    { $count ->
        [one] Koodi tulostettu
       *[other] Koodit tulostettu
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Kopioitu

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (arvio)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (arvio)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (arvio)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (arvio)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Tuntematon sijainti
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } alustalla { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-osoite: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Salasana
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Toista salasana
form-password-with-inline-criteria-signup-submit-button = Luo tili
form-password-with-inline-criteria-reset-new-password =
    .label = Uusi salasana
form-password-with-inline-criteria-confirm-password =
    .label = Vahvista salasana
form-password-with-inline-criteria-reset-submit-button = Luo uusi salasana
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Salasana
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Toista salasana
form-password-with-inline-criteria-set-password-submit-button = Aloita synkronointi
form-password-with-inline-criteria-match-error = Salasanat eivät täsmää
form-password-with-inline-criteria-sr-too-short-message = Salasanan tulee sisältää vähintään 8 merkkiä.
form-password-with-inline-criteria-sr-not-email-message = Salasana ei saa sisältää sähköpostiosoitettasi.
form-password-with-inline-criteria-sr-not-common-message = Salasana ei saa olla yleisesti käytetty salasana.
form-password-with-inline-criteria-sr-requirements-met = Syötetty salasana noudattaa kaikkia salasanavaatimuksia.
form-password-with-inline-criteria-sr-passwords-match = Annetut salasanat vastaavat toisiaan.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Tämä kenttä on pakollinen

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Anna { $codeLength }-numeroinen koodi jatkaaksesi
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Anna { $codeLength }-merkkinen koodi jatkaaksesi

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox }-tilin palautusavain
get-data-trio-download-2 =
    .title = Lataa
    .aria-label = Lataa
get-data-trio-copy-2 =
    .title = Kopioi
    .aria-label = Kopioi
get-data-trio-print-2 =
    .title = Tulosta
    .aria-label = Tulosta

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Hälytys
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Huomio
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Varoitus
authenticator-app-aria-label =
    .aria-label = Todennussovellus
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadan lippu
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Valitse
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Onnistui
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Käytössä
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Sulje viesti
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Koodi
error-icon-aria-label =
    .aria-label = Virhe
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Tietoa
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Yhdysvaltain lippu

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Tietokone ja matkapuhelin, joissa molemmissa on särkynyt sydän
hearts-verified-image-aria-label =
    .aria-label = Tietokone, matkapuhelin ja tabletti, joissa kaikissa on sykkivä sydän
signin-recovery-code-image-description =
    .aria-label = Piilotettua tekstiä sisältävä asiakirja.
signin-totp-code-image-label =
    .aria-label = Laite piilotetulla 6-numeroisella koodilla.
confirm-signup-aria-label =
    .aria-label = Kirjekuori, joka sisältää linkin
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Tilin palautusavainta esittävä kuva.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Tilin palautusavainta esittävä kuva.
password-image-aria-label =
    .aria-label = Kuva esittäen salasanan kirjoittamista.
lightbulb-aria-label =
    .aria-label = Talletusvihjeen luomista esittävä kuva.
email-code-image-aria-label =
    .aria-label = Kuva, joka esittää koodin sisältävää sähköpostiviestiä.
recovery-phone-image-description =
    .aria-label = Mobiililaite, joka vastaanottaa koodin tekstiviestillä.
recovery-phone-code-image-description =
    .aria-label = Koodi vastaanotettu mobiililaitteeseen.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobiililaite tekstiviestitoiminnoilla
backup-authentication-codes-image-aria-label =
    .aria-label = Laitteen näyttö ja koodeja
sync-clouds-image-aria-label =
    .aria-label = Pilviä, joissa on synkronointikuvake

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Olet kirjautunut { -brand-firefox }iin.
inline-recovery-key-setup-create-header = Suojaa tilisi
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Onko sinulla hetki aikaa suojata tietosi?
inline-recovery-key-setup-info = Luo tilin palautusavain, jotta voit palauttaa synkronoidut selaustiedot, jos unohdat salasanasi.
inline-recovery-key-setup-start-button = Luo tilin palautusavain
inline-recovery-key-setup-later-button = Tee se myöhemmin

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Piilota salasana
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Näytä salasana
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Salasanasi näkyy tällä hetkellä näytöllä.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Salasanasi on tällä hetkellä piilotettu.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Salasanasi näkyy nyt näytöllä.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Salasanasi on nyt piilotettu.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Valitse maa
input-phone-number-enter-number = Kirjoita puhelinnumero
input-phone-number-country-united-states = Yhdysvallat
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Takaisin

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Salasanan nollauslinkki on vaurioitunut
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Vahvistuslinkki vaurioitunut
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Linkki vioittunut
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Avaamastasi linkistä puuttui merkkejä. Sähköpostiohjelmasi on saattanut katkaista sen. Kopioi osoite huolellisesti ja yritä uudelleen.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Vastaanota uusi linkki

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Muistatko salasanasi?
# link navigates to the sign in page
remember-password-signin-link = Kirjaudu sisään

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Ensisijainen sähköposti on jo vahvistettu
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Kirjautuminen on jo vahvistettu
confirmation-link-reused-message = Tämä vahvistuslinkki on jo käytetty, ja linkkiä voi käyttää vain kerran.

## Locale Toggle Component

locale-toggle-select-label = Valitse kieli
locale-toggle-browser-default = Selaimen oletus
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Virheellinen pyyntö

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Tarvitset tämän salasanan käsitelläksesi palveluumme tallentamiasi salattuja tietojasi.
password-info-balloon-reset-risk-info = Nollauksen seurauksena saatat menettää salasanojen ja kirjanmerkkien kaltaiset tiedot.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Valitse vahva salasana, jota et ole käyttänyt muilla sivustoilla. Varmista, että se täyttää turvallisuusvaatimukset:
password-strength-short-instruction = Valitse vahva salasana:
password-strength-inline-min-length = Vähintään 8 merkkiä
password-strength-inline-not-email = Ei sinun sähköpostiosoite
password-strength-inline-not-common = Ei yleisesti käytetty salasana
password-strength-inline-confirmed-must-match = Vahvistus vastaa uutta salasanaa
password-strength-inline-passwords-match = Salasanat täsmäävät

## Notification Promo Banner component

account-recovery-notification-cta = Luo
account-recovery-notification-header-value = Älä menetä tietojasi, jos unohdat salasanasi
account-recovery-notification-header-description = Luo tilin palautusavain synkronoitujen selaustietojen palauttamiseksi, jos unohdat salasanasi.
recovery-phone-promo-cta = Lisää palauttamisen puhelinnumero

## Ready component

ready-complete-set-up-instruction = Viimeistele määritys syöttämällä uusi salasana muihin { -brand-firefox }-asennuksiisi.
manage-your-account-button = Hallinnoi tiliä
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Voit nyt aloittaa palvelun { $serviceName } käyttämisen
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Olet nyt valmis käyttämään tilin asetuksia
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Tilisi on valmis!
ready-continue = Jatka
sign-in-complete-header = Kirjautuminen vahvistettu
sign-up-complete-header = Tili vahvistettu
primary-email-verified-header = Ensisijainen sähköposti vahvistettu

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Avaimen säilytyspaikkoja:
flow-recovery-key-download-storage-ideas-folder-v2 = Kansio suojatulla laitteella
flow-recovery-key-download-storage-ideas-cloud = Luotettu pilvitallennustila
flow-recovery-key-download-storage-ideas-print-v2 = Tulostettu fyysinen kopio
flow-recovery-key-download-storage-ideas-pwd-manager = Salasanojen hallinta

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Lisää vihje, joka auttaa löytämään avaimesi
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Tämän vihjeen tulisi auttaa sinua muistamaan, mihin talletit tilin palautusavaimen. Voimme näyttää vihjeen sinulle, kun nollaat salasanasi, jotta voit palauttaa tietosi.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Anna vihje (valinnainen)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Valmis
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Vihje saa sisältää alle 255 merkkiä.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Vihje ei saa sisältää vaarallisia unicode-merkkejä. Vain kirjaimet, numerot, välimerkit ja symbolit ovat sallittuja.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Varoitus
password-reset-chevron-expanded = Supista varoitus
password-reset-chevron-collapsed = Laajenna varoitus
password-reset-data-may-not-be-recovered = Selaimen tietoja ei välttämättä palauteta
password-reset-previously-signed-in-device-2 = Onko sinulla laitetta, jolla olet aiemmin kirjautunut?
password-reset-no-old-device-2 = Onko sinulla uusi laite, mutta et pääse käyttämään aiempia laitteitasi?
password-reset-encrypted-data-cannot-be-recovered-2 = Olemme pahoillamme, mutta salattuja selaintietojasi { -brand-firefox }-palvelimilla ei voida palauttaa.
password-reset-warning-have-key = Onko sinulla tilin palautusavain?
password-reset-warning-use-key-link = Käytä sitä nyt salasanan vaihtamiseen ja tietojesi säilyttämiseen

## Alert Bar

alert-bar-close-message = Sulje viesti

## User's avatar

avatar-your-avatar =
    .alt = Avatar-kuva
avatar-default-avatar =
    .alt = Oletusavatar

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla }-tuotteet
bento-menu-tagline = Lisää yksityisyyttäsi suojaavia tuotteita { -brand-mozilla }lta
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox }-selain työpöydälle
bento-menu-firefox-mobile = { -brand-firefox }-selain mobiililaitteille
bento-menu-made-by-mozilla = { -brand-mozilla }lta

## Connect another device promo

connect-another-fx-mobile = Hanki { -brand-firefox } puhelimeen tai tablettiin
connect-another-find-fx-mobile-2 = Löydä { -brand-firefox } { -google-play }sta ja { -app-store }sta.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Lataa { -brand-firefox } { -google-play }sta
connect-another-app-store-image-3 =
    .alt = Lataa { -brand-firefox } { -app-store }sta

## Connected services section

cs-heading = Yhdistetyt palvelut
cs-description = Kaikki mitä käytät ja mihin olet sisäänkirjautuneena.
cs-cannot-refresh =
    Valitettavasti yhdistettyjen palvelujen listauksen
    päivittämisessä ilmeni ongelma.
cs-cannot-disconnect = Asiakasta ei löydy, yhteyttä ei voi katkaista
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Kirjautunut ulos palvelusta { $service }
cs-refresh-button =
    .title = Päivitä yhdistetyt palvelut
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Puuttuuko jokin tai onko jokin kahteen kertaan?
cs-disconnect-sync-heading = Katkaise yhteys Sync-palveluun

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Selaustietosi säilyvät laitteella <span>{ $device }</span>,
    mutta kyseinen laite ei enää synkronoi tilillesi.
cs-disconnect-sync-reason-3 = Mikä on pääasiallinen syy laitteen <span>?{ $device }</span> yhteyden katkaisuun?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Laite on:
cs-disconnect-sync-opt-suspicious = Epäilyttävä
cs-disconnect-sync-opt-lost = Kadonnut tai varastettu
cs-disconnect-sync-opt-old = Vanha tai vaihdettu uudempaan
cs-disconnect-sync-opt-duplicate = Kaksoiskappale
cs-disconnect-sync-opt-not-say = En halua sanoa

##

cs-disconnect-advice-confirm = Selvä
cs-disconnect-lost-advice-heading = Yhteys kadonneeseen tai varastettuun laitteeseen on katkaistu
cs-disconnect-lost-advice-content-3 = Koska laitteesi katosi tai varastettiin, sinun tulisi vaihtaa { -product-mozilla-account }si salasana tilin asetuksissa. Sinun kannattaa myös etsiä ohjeita oman laitteen valmistajalta tietojen etäpoistoon liittyen.
cs-disconnect-suspicious-advice-heading = Yhteys epäilyttävään laitteeseen on katkaistu
cs-disconnect-suspicious-advice-content-2 = Jos irrotettu laite todellakin on epäilyttävä, sinun tulisi vaihtaa { -product-mozilla-account }n salasana tilin asetuksissa. Sinun kannattaa vaihtaa myös muut salasanat, jotka olet tallentanut { -brand-firefox }iin kirjoittamalla osoitepalkkiin about:logins.
cs-sign-out-button = Kirjaudu ulos

## Data collection section

dc-heading = Tietojen keruu ja käyttö
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-selain
dc-subheader-content-2 = Salli palvelun { -product-mozilla-accounts } lähettää teknistä tietoa ja vuorovaikutustietoa { -brand-mozilla }lle.
dc-opt-out-success-2 = Poistuminen onnistui. { -product-mozilla-accounts } ei lähetä teknistä tai vuorovaikutustietoa { -brand-mozilla }lle.
dc-opt-in-success-2 = Kiitos! Tämän tiedon jakaminen auttaa parantamaan { -product-mozilla-accounts } -palvelua.
dc-opt-in-out-error-2 = Valitettavasti tiedonkeruuasetusten muuttamisen yhteydessä ilmeni ongelma
dc-learn-more = Lue lisää

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }en valikko
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Kirjauduttu tunnuksella
drop-down-menu-sign-out = Kirjaudu ulos
drop-down-menu-sign-out-error-2 = Valitettavasti uloskirjautumisen kanssa ilmeni ongelma

## Flow Container

flow-container-back = Takaisin

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Syötä salasanasi uudelleen turvallisuuden vuoksi
flow-recovery-key-confirm-pwd-input-label = Kirjoita salasanasi
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Luo tilin palautusavain
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Luo uusi tilin palautusavain

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Tilin palautusavain luotu — Lataa ja tallenna se nyt
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Tämän avaimen avulla voit palauttaa tietosi, jos unohdat salasanasi. Lataa avain nyt ja talleta se johonkin paikkaan, jonka muistat – et voi palata tälle sivulle myöhemmin.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Jatka lataamatta

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Tilin palautusavain luotu

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Luo tilin palautusavain siltä varalta, että unohdat salasanasi
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Vaihda tilisi palautusavain
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Salaamme selaustiedot – salasanat, kirjanmerkit ja paljon muuta. Se on hyvä yksityisyyden kannalta, mutta se tarkoittaa, ettei tietojasi voi palauttaa, jos unohdat salasanasi.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Siksi tilin palautusavaimen luominen on niin tärkeää – voit käyttää avainta tietojesi palauttamiseen.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Aloitetaan
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Peruuta

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Yhdistä todennussovellukseesi
flow-setup-2fa-cant-scan-qr-button = Etkö voi skannata QR-koodia?
flow-setup-2fa-manual-key-heading = Kirjoita koodi manuaalisesti
flow-setup-2fa-manual-key-instruction = <strong>Vaihe 1:</strong> Syötä tämä koodi haluamaasi todennussovellukseen.
flow-setup-2fa-scan-qr-instead-button = Haluatko sen sijaan skannata QR-koodin?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Lue lisää todennussovelluksista
flow-setup-2fa-button = Jatka
flow-setup-2fa-step-2-instruction = <strong>Vaihe 2:</strong> Syötä todennussovelluksestasi saamasi koodi.
flow-setup-2fa-input-label = Kirjoita 6-numeroinen koodi
flow-setup-2fa-code-error = Virheellinen tai vanhentunut koodi. Tarkista todennussovelluksesi ja yritä uudelleen.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Valitse palautustapa
flow-setup-2fa-backup-choice-phone-badge = Helpoin
flow-setup-2fa-backup-choice-code-badge = Turvallisin

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-code-input = Kirjoita 10-merkkinen koodi
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Valmis

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-button-continue = Jatka

##

# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } koodi jäljellä
       *[other] { $count } koodia jäljellä
    }
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Jatka palveluun { $serviceName }
flow-setup-2fa-prompt-heading = Ota käyttöön kaksivaiheinen todennus
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } edellyttää kaksivaiheisen todennuksen käyttöönottoa tilisi turvallisuuden takaamiseksi.
flow-setup-2fa-prompt-continue-button = Jatka

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Kirjoita vahvistuskoodi
flow-setup-phone-confirm-code-input-label = Kirjoita 6-numeroinen koodi
flow-setup-phone-confirm-code-button = Vahvista
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Vanheniko koodi?
flow-setup-phone-confirm-code-resend-code-button = Lähetä koodi uudelleen
flow-setup-phone-confirm-code-resend-code-success = Koodi lähetetty
flow-setup-phone-confirm-code-success-message-v2 = Palauttamisen puhelinnumero lisätty

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Vahvista puhelinnumerosi
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Lähetä koodi

## HeaderLockup component, the header in account settings

header-menu-open = Sulje valikko
header-menu-closed = Sivuston navigointivalikko
header-back-to-top-link =
    .title = Takaisin ylös
header-back-to-settings-link =
    .title = Takaisin { -product-mozilla-account }n asetuksiin
header-title-2 = { -product-mozilla-account }
header-help = Ohje

## Linked Accounts section

la-heading = Linkitetyt tilit
la-description = Olet valtuuttanut pääsyn seuraaville tileille.
la-unlink-button = Poista linkitys
la-unlink-account-button = Poista linkitys
la-set-password-button = Aseta salasana
la-unlink-heading = Poista linkitys kolmannen osapuolen tilistä
la-unlink-content-3 = Haluatko varmasti poistaa tilisi linkityksen? Tilin linkityksen poistaminen ei kirjaa sinua automaattisesti ulos yhdistetyistä palveluista. Tätä varten sinun on kirjauduttava manuaalisesti ulos Yhdistetyt palvelut -osion kautta.
la-unlink-content-4 = Ennen kuin poistat tilisi linkityksen, sinun on asetettava salasana. Ilman salasanaa et voi kirjautua sisään tilin linkityksen poistamisen jälkeen.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Sulje
modal-cancel-button = Peruuta
modal-default-confirm-button = Vahvista

## ModalMfaProtected

modal-mfa-protected-title = Kirjoita vahvistuskoodi
modal-mfa-protected-subtitle = Auta meitä varmistamaan, että sinä itse muutat tilisi tietoja
modal-mfa-protected-input-label = Kirjoita 6-numeroinen koodi
modal-mfa-protected-cancel-button = Peruuta
modal-mfa-protected-confirm-button = Vahvista
modal-mfa-protected-code-expired = Vanheniko koodi?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Lähetä uusi koodi sähköpostiin.

## Modal Verify Session

mvs-verify-your-email-2 = Vahvista sähköposti
mvs-enter-verification-code-2 = Kirjoita vahvistuskoodi
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Kirjoita osoitteeseen <email>{ $email }</email> lähetetty vahvistuskoodi viiden minuutin kuluessa.
msv-cancel-button = Peruuta
msv-submit-button-2 = Vahvista

## Settings Nav

nav-settings = Asetukset
nav-profile = Profiili
nav-security = Turvallisuus
nav-connected-services = Yhdistetyt palvelut
nav-data-collection = Tietojen keruu ja käyttö
nav-paid-subs = Maksetut tilaukset
nav-email-comm = Sähköpostiviestintä

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Varatodennuskoodiesi korvaamisessa ilmeni ongelma
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Varatodennuskoodeja luotaessa ilmeni ongelma

## Page2faSetup

page-2fa-setup-title = Kaksivaiheinen todennus
page-2fa-setup-totpinfo-error = Kaksivaiheisen todennuksen määrittämisessä tapahtui virhe. Yritä myöhemmin uudelleen.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Koodi ei ole oikein. Yritä uudelleen.
page-2fa-setup-success = Kaksivaiheinen todennus on otettu käyttöön

## Avatar change page

avatar-page-title =
    .title = Profiilikuva
avatar-page-add-photo = Lisää kuva
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Ota kuva
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Poista kuva
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Ota uusi kuva
avatar-page-cancel-button = Peruuta
avatar-page-save-button = Tallenna
avatar-page-saving-button = Tallennetaan…
avatar-page-zoom-out-button =
    .title = Loitonna
avatar-page-zoom-in-button =
    .title = Lähennä
avatar-page-rotate-button =
    .title = Kierrä
avatar-page-camera-error = Kameraa ei voitu alustaa
avatar-page-new-avatar =
    .alt = uusi profiilikuva
avatar-page-file-upload-error-3 = Profiilikuvan lähettämisessä tapahtui virhe
avatar-page-delete-error-3 = Profiilikuvan poistamisessa tapahtui virhe
avatar-page-image-too-large-error-2 = Kuvatiedoston koko on liian suuri lähetettäväksi

## Password change page

pw-change-header =
    .title = Vaihda salasana
pw-8-chars = Vähintään 8 merkkiä
pw-not-email = Ei sinun sähköpostiosoite
pw-change-must-match = Uusi salasana vastaa vahvistusta
pw-commonly-used = Ei yleisesti käytetty salasana
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Pysy turvassa — älä käytä samoja salasanoja uudelleen. Katso lisää vinkkejä <linkExternal>vahvojen salasanojen luomiseen</linkExternal>.
pw-change-cancel-button = Peruuta
pw-change-save-button = Tallenna
pw-change-forgot-password-link = Unohditko salasanan?
pw-change-current-password =
    .label = Kirjoita nykyinen salasana
pw-change-new-password =
    .label = Kirjoita uusi salasana
pw-change-confirm-password =
    .label = Vahvista uusi salasana
pw-change-success-alert-2 = Salasana päivitetty

## Password create page

pw-create-header =
    .title = Luo salasana
pw-create-success-alert-2 = Salasana asetettu
pw-create-error-2 = Valitettavasti salasanaa asettaessa ilmeni ongelma

## Delete account page

delete-account-header =
    .title = Poista tili
delete-account-step-1-2 = Vaihe 1/2
delete-account-step-2-2 = Vaihe 2/2
delete-account-confirm-title-4 = Saatat olla yhdistänyt { -product-mozilla-account }si ainakin yhteen { -brand-mozilla }n tuotteeseen tai palveluun, joka pitää sinut verkossa turvassa ja tuotteliaana:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synkronoidaan { -brand-firefox }-tietoja
delete-account-product-firefox-addons = { -brand-firefox }-lisäosat
delete-account-acknowledge = Huomioi, että tilisi poistamalla:
delete-account-chk-box-2 =
    .label = Saatat menettää { -brand-mozilla }n tuotteisiin tallennetut tiedot ja ominaisuudet
delete-account-chk-box-3 =
    .label = Aktivointi uudelleen tällä sähköpostiosoitteella ei välttämättä palauta tallentamiasi tietoja
delete-account-chk-box-4 =
    .label = Kaikki addons.mozilla.org-palveluun julkaisemasi laajennukset ja teemat poistetaan
delete-account-continue-button = Jatka
delete-account-password-input =
    .label = Kirjoita salasana
delete-account-cancel-button = Peruuta
delete-account-delete-button-2 = Poista

## Display name page

display-name-page-title =
    .title = Näyttönimi
display-name-input =
    .label = Kirjoita näyttönimi
submit-display-name = Tallenna
cancel-display-name = Peruuta
display-name-update-error-2 = Näyttönimeäsi päivitettäessä tapahtui virhe
display-name-success-alert-2 = Näyttönimi päivitetty

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Viimeaikaiset tilitapahtumat
recent-activity-account-create-v2 = Tili luotu
recent-activity-account-disable-v2 = Tili poistettu käytöstä
recent-activity-account-enable-v2 = Tili otettu käyttöön
recent-activity-account-login-v2 = Tiliin kirjautuminen aloitettu
recent-activity-account-reset-v2 = Salasanan nollaus aloitettu
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Palautuneet sähköpostiviestit tyhjennetty
recent-activity-account-login-failure = Tilin kirjautumisyritys epäonnistui
recent-activity-account-two-factor-added = Kaksivaiheinen todennus otettu käyttöön
recent-activity-account-two-factor-requested = Kaksivaiheista todennusta pyydetty
recent-activity-account-two-factor-failure = Kaksivaiheinen todennus epäonnistui
recent-activity-account-two-factor-success = Kaksivaiheinen todennus onnistui
recent-activity-account-two-factor-removed = Kaksivaiheinen todennus poistettu
recent-activity-account-password-reset-requested = Tili pyysi salasanan nollaamista
recent-activity-account-password-reset-success = Tilin salasanan nollaus onnistui
recent-activity-account-recovery-key-added = Tilin palautusavain otettu käyttöön
recent-activity-account-recovery-key-verification-failure = Tilin palautusavaimen vahvistus epäonnistui
recent-activity-account-recovery-key-verification-success = Tilin palautusavaimen vahvistus onnistui
recent-activity-account-recovery-key-removed = Tilin palautusavain poistettu
recent-activity-account-password-added = Uusi salasana lisätty
recent-activity-account-password-changed = Salasana vaihdettu
recent-activity-account-secondary-email-added = Toissijainen sähköpostiosoite lisätty
recent-activity-account-secondary-email-removed = Toissijainen sähköpostiosoite poistettu
recent-activity-account-emails-swapped = Ensisijainen ja toissijainen sähköpostiosoite vaihdettu
recent-activity-session-destroy = Kirjauduttu ulos istunnosta
recent-activity-must-reset-password = Salasanan nollaus vaaditaan
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Muuta toimintaa tilillä

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Tilin palautusavain
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Takaisin asetuksiin

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Poista palauttamisen puhelinnumero
settings-recovery-phone-remove-button = Poista puhelinnumero
settings-recovery-phone-remove-cancel = Peruuta

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Lisää palauttamisen puhelinnumero
page-setup-recovery-phone-back-button-title = Takaisin asetuksiin
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Vaihda puhelinnumero

## Add secondary email page

add-secondary-email-step-1 = Vaihe 1/2
add-secondary-email-error-2 = Tämän sähköpostin luomisessa ilmeni ongelma
add-secondary-email-page-title =
    .title = Toissijainen sähköposti
add-secondary-email-enter-address =
    .label = Kirjoita sähköpostiosoite
add-secondary-email-cancel-button = Peruuta
add-secondary-email-save-button = Tallenna
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Sähköpostimaskeja ei voi käyttää toissijaisena sähköpostina

## Verify secondary email page

add-secondary-email-step-2 = Vaihe 2/2
verify-secondary-email-page-title =
    .title = Toissijainen sähköposti
verify-secondary-email-verification-code-2 =
    .label = Kirjoita vahvistuskoodi
verify-secondary-email-cancel-button = Peruuta
verify-secondary-email-verify-button-2 = Vahvista
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Kirjoita osoitteeseen <strong>{ $email }</strong> lähetetty vahvistuskoodi viiden minuutin kuluessa.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } lisätty onnistuneesti

##

# Link to delete account on main Settings page
delete-account-link = Poista tili
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Kirjautuminen onnistui. { -product-mozilla-account }si ja tietosi pysyvät aktiivisina.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
# Links out to the Monitor site
product-promo-monitor-cta = Hanki ilmainen tarkistus

## Profile section

profile-heading = Profiili
profile-picture =
    .header = Kuva
profile-display-name =
    .header = Näyttönimi
profile-primary-email =
    .header = Ensisijainen sähköposti

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Vaihe { $currentStep }/{ $numberOfSteps }.

## Security section of Setting

security-heading = Turvallisuus
security-password =
    .header = Salasana
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Luotu { $date }
security-not-set = Ei asetettu
security-action-create = Luo
security-set-password = Aseta salasana tilin tiettyjen suojausominaisuuksien synkronointia ja käyttöä varten.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Näytä viimeisimmät tilitapahtumat
signout-sync-header = Istunto vanhentui
signout-sync-session-expired = Pahoittelut, jotain meni pieleen. Kirjaudu ulos selaimen valikosta ja yritä uudelleen.

## SubRow component

# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Koodeja ei ole saatavilla
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } koodi jäljellä
       *[other] { $numCodesAvailable } koodia jäljellä
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Luo uudet koodit
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Lisää
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Puhelinnumeroa ei ole lisätty
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Vaihda
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Lisää
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Poista
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Poista palauttamisen puhelinnumero

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Poista käytöstä
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Ota käyttöön
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Lähetetään…
switch-is-on = päällä
switch-is-off = pois

## Sub-section row Defaults

row-defaults-action-add = Lisää
row-defaults-action-change = Muuta
row-defaults-action-disable = Poista käytöstä
row-defaults-status = Ei mitään

## Account recovery key sub-section on main Settings page

rk-header-1 = Tilin palautusavain
rk-enabled = Käytössä
rk-not-set = Ei asetettu
rk-action-create = Luo
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Vaihda
rk-action-remove = Poista
rk-key-removed-2 = Tilin palautusavain poistettu
rk-cannot-remove-key = Tilisi palautusavainta ei voitu poistaa.
rk-refresh-key-1 = Päivitä tilin palautusavain
rk-content-explain = Palauta tietosi kun unohdat salasanasi.
rk-cannot-verify-session-4 = Valitettavasti istunnon vahvistamisessa oli ongelma
rk-remove-modal-heading-1 = Poistetaanko tilin palautusavain?
rk-remove-modal-content-1 =
    Jos nollaat salasanasi, et voi käyttää tilin palautusavainta
    saadaksesi tietosi takaisin käyttöösi. Tätä toimintoa ei voi kumota.
rk-remove-error-2 = Tilisi palautusavainta ei voitu poistaa
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Poista tilin palautusavain

## Secondary email sub-section on main Settings page

se-heading = Toissijainen sähköposti
    .header = Toissijainen sähköposti
se-cannot-refresh-email = Valitettavasti sähköpostiosoitteen päivittämisessä ilmeni ongelma.
se-cannot-resend-code-3 = Valitettavasti vahvistuskoodin lähettämisessä uudelleen ilmeni ongelma
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } on nyt ensisijainen sähköpostiosoitteesi
se-set-primary-error-2 = Valitettavasti ensisijaisen sähköpostiosoitteesi vaihtamisessa ilmeni ongelma
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } poistettu
se-delete-email-error-2 = Valitettavasti tämän sähköpostiosoitteen poistamisessa ilmeni ongelma
se-verify-session-3 = Tämän toiminnon suorittamiseksi sinun on vahvistettava nykyinen istuntosi
se-verify-session-error-3 = Valitettavasti istunnon vahvistamisessa oli ongelma
# Button to remove the secondary email
se-remove-email =
    .title = Poista sähköpostiosoite
# Button to refresh secondary email status
se-refresh-email =
    .title = Päivitä sähköpostiosoite
se-unverified-2 = vahvistamaton
se-resend-code-2 =
    Vahvistus vaaditaan. <button>Lähetä vahvistuskoodi uudelleen</button>
    jos se ei ole Saapuneet- tai Roskaposti-kansioissa.
# Button to make secondary email the primary
se-make-primary = Tee ensisijaiseksi
se-default-content = Käytä tiliäsi, jos et voi kirjautua ensisijaiseen sähköpostiosoitteeseesi.
se-content-note-1 =
    Huomio: toissijainen sähköposti ei palauta tietojasi — tarvitset
    <a>tilin palautusavaimen</a> sitä varten.
# Default value for the secondary email
se-secondary-email-none = Ei mitään

## Two Step Auth sub-section on Settings main page

tfa-row-header = Kaksivaiheinen todennus
tfa-row-enabled = Käytössä
tfa-row-disabled-status = Pois käytöstä
tfa-row-action-add = Lisää
tfa-row-action-disable = Poista käytöstä
tfa-row-button-refresh =
    .title = Päivitä kaksivaiheinen todennus
tfa-row-cannot-refresh =
    Valitettavasti kaksivaiheisen todennuksen
    päivittämisessä ilmeni ongelma.
tfa-row-disabled-description-v2 = Auta suojaamaan tilisi käyttämällä kolmannen osapuolen todennussovellusta toisena vaiheena kirjautumisessa.
tfa-row-cannot-verify-session-4 = Valitettavasti istunnon vahvistamisessa oli ongelma
tfa-row-disable-modal-heading = Poistetaanko kaksivaiheinen todennus käytöstä?
tfa-row-disable-modal-confirm = Poista käytöstä
tfa-row-disable-modal-explain-1 =
    Et voi kumota tätä toimintoa. Sinulla on myös
    mahdollisuus <linkExternal>uusia varatodennuskoodisi</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Kaksivaiheinen todennus poistettu käytöstä
tfa-row-cannot-disable-2 = Kaksivaiheista todennusta ei voitu poistaa käytöstä

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Jatkamalla hyväksyt:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla }n tilauspalvelujen <mozSubscriptionTosLink>käyttöehdot</mozSubscriptionTosLink> ja <mozSubscriptionPrivacyLink>tietosuojakäytäntö</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } -palvelun <mozillaAccountsTos>käyttöehdot</mozillaAccountsTos> ja <mozillaAccountsPrivacy>tietosuojakäytäntö</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Jatkamalla hyväksyt <mozillaAccountsTos>käyttöehdot</mozillaAccountsTos> ja <mozillaAccountsPrivacy>tietosuojakäytännön</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Tai
continue-with-google-button = Jatka käyttämällä { -brand-google }a
continue-with-apple-button = Jatka käyttämällä { -brand-apple }a

## Auth-server based errors that originate from backend service

auth-error-102 = Tuntematon tili
auth-error-103 = Virheellinen salasana
auth-error-105-2 = Virheellinen vahvistuskoodi
auth-error-110 = Virheellinen poletti
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Olet yrittänyt liian monta kertaa. Yritä uudestaan myöhemmin.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Olet yrittänyt liian monta kertaa. Odota { $retryAfter } ja yritä uudelleen.
auth-error-125 = Pyyntö estettiin tietoturvasyistä
auth-error-129-2 = Kirjoitit virheellisen puhelinnumeron. Tarkista se ja yritä uudelleen.
auth-error-138-2 = Vahvistamaton istunto
auth-error-139 = Toissijainen sähköpostiosoite ei saa olla sama kuin tilisi ensisijainen sähköpostiosoite
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Tämä sähköpostiosoite on varattu toiselle tilille. Yritä myöhemmin uudelleen tai käytä toista sähköpostiosoitetta.
auth-error-155 = TOTP-polettia ei löytynyt
auth-error-159 = Virheellinen tilin palautusavain
auth-error-183-2 = Virheellinen tai vanhentunut vahvistuskoodi
auth-error-202 = Ominaisuus ei ole käytössä
auth-error-203 = Järjestelmä ei ole käytettävissä, yritä pian uudelleen
auth-error-206 = Salasanaa ei voi luoda, salasana on jo asetettu
auth-error-214 = Palauttamisen puhelinnumero on jo olemassa
auth-error-215 = Palauttamisen puhelinnumeroa ei ole olemassa
auth-error-999 = Odottamaton virhe
auth-error-1001 = Kirjautumisyritys peruttu
auth-error-1002 = Istunto vanhentui. Kirjaudu sisään uudelleen.
auth-error-1003 = Paikallinen tallennustila tai evästeet ovat edelleen poissa käytöstä
auth-error-1008 = Uuden salasanan pitää erota vanhasta
auth-error-1010 = Salasanan täytyy olla kelvollinen
auth-error-1011 = Sähköpostiosoitteen täytyy olla kelvollinen
auth-error-1031 = Ikä täytyy antaa rekisteröitymistä varten
auth-error-1032 = Sinun tulee antaa kelvollinen ikä rekisteröityäksesi
auth-error-1054 = Virheellinen kaksivaiheisen todennuksen koodi
auth-error-1062 = Virheellinen uudelleenohjaus
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Kirjoititko sähköpostiosoitteen väärin? { $domain } ei ole kelvollinen sähköpostipalvelu
auth-error-1066 = Sähköpostimaskeja ei voi käyttää tilin luomiseen.
auth-error-1067 = Kirjoititko sähköpostiosoitteesi väärin?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Numero, joka päättyy { $lastFourPhoneNumber }
oauth-error-1000 = Jokin meni pieleen. Sulje tämä välilehti ja yritä uudelleen.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Olet kirjautunut { -brand-firefox }iin
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Sähköposti vahvistettu
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Kirjautuminen vahvistettu
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Viimeistele määritys kirjautumalla tähän { -brand-firefox }iin
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Kirjaudu sisään
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Lisäätkö laitteita edelleen? Kirjaudu { -brand-firefox }iin toisella laitteella viimeistelläksesi määrityksen
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Kirjaudu { -brand-firefox }iin toisella laitteella viimeistelläksesi määrityksen
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Haluatko saada välilehdet, kirjanmerkit ja salasanat toiselle laitteelle?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Yhdistä toinen laite
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ei nyt
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Kirjaudu { -brand-firefox }iin Androidissa viimeistelläksesi määrityksen
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Kirjaudu { -brand-firefox }iin iOS:ssä viimeistelläksesi määrityksen

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Paikallinen tallennustila ja evästeet vaaditaan
cookies-disabled-enable-prompt-2 = Ota evästeet ja paikallinen tallennustila käyttöön selaimessasi käyttääksesi { -product-mozilla-account }-palvelua. Tämä mahdollistaa toiminnot, joiden ansiosta sinut esimerkiksi muistetaan istuntojen välillä.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Yritä uudelleen
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Lue lisää

## Index / home page

index-header = Kirjoita sähköpostiosoitteesi
index-sync-header = Jatka { -product-mozilla-account }llesi
index-sync-subheader = Synkronoi salasanat, välilehdet ja kirjanmerkit kaikkialla, missä käytät { -brand-firefox }ia.
index-relay-header = Luo sähköpostimaski
index-relay-subheader = Anna sähköpostiosoite, johon haluat välittää sähköpostiviestit sähköpostimaskistasi.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Jatka palveluun { $serviceName }
index-subheader-default = Jatka tilin asetuksiin
index-cta = Rekisteröidy tai kirjaudu sisään
index-email-input =
    .label = Kirjoita sähköpostiosoitteesi
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Tilin poistaminen onnistui
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Vahvistussähköpostisi palautui juuri. Kirjoititko sähköpostiosoitteesi väärin?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Oho! Emme voineet luoda tilin palautusavainta. Yritä myöhemmin uudelleen.
inline-recovery-key-setup-recovery-created = Tilin palautusavain luotu
inline-recovery-key-setup-download-header = Suojaa tilisi
inline-recovery-key-setup-download-subheader = Lataa ja tallenna se nyt
inline-recovery-key-setup-hint-header = Turvallisuussuositus

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Peru määritys
inline-totp-setup-continue-button = Jatka
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Paranna tilisi suojausta vaatimalla todennuskoodeja jollakin <authenticationAppsLink>näistä todennussovelluksista</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Ota kaksivaiheinen todennus käyttöön <span>jatkaaksesi tilin asetuksiin</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Ota kaksivaiheinen todennus käyttöön <span>jatkaaksesi palveluun { $serviceName }</span>
inline-totp-setup-ready-button = Valmis
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Skannaa todennuskoodi <span>jatkaaksesi palveluun { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Syötä koodi manuaalisesti <span>jatkaaksesi palveluun { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Skannaa todennuskoodi <span>jatkaaksesi tilin asetuksiin</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Syötä koodi manuaalisesti <span>jatkaaksesi tilin asetuksiin</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Syötä tämä salainen avain todennussovellukseesi. <toggleToQRButton>Vai haluatko sen sijaan skannata QR-koodin?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Skannaa QR-koodi todennussovellukseesi ja syötä sen ilmoittama todennuskoodi. <toggleToManualModeButton>Etkö voi skannata koodia?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Määrityksen valmistuttua sovellus tuottaa kirjautumisen yhteydessä tarvittavia todennuskoodeja.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Toodennuskoodi
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Todennuskoodi vaaditaan
tfa-qr-code-alt = Ota käyttöön kaksivaiheinen todennus tuetuissa sovelluksissa käyttämällä koodia { $code }.
inline-totp-setup-page-title = Kaksivaiheinen todennus

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Juridiset asiat
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Käyttöehdot
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Tietosuojakäytäntö

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Tietosuojakäytäntö

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Käyttöehdot

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Kirjauduitko juuri { -product-firefox }iin?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Kyllä, hyväksy laite
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Jos se et ollut sinä, <link>vaihda salasanasi</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Laite yhdistetty
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Synkronoit nyt: { $deviceFamily } alustalla { $deviceOS }
pair-auth-complete-sync-benefits-text = Löydät nyt avoimet välilehdet, salasanat ja kirjanmerkit kaikilta laitteiltasi.
pair-auth-complete-see-tabs-button = Näytä synkronoitujen laitteiden välilehdet
pair-auth-complete-manage-devices-link = Hallinnoi laitteita

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Syötä todennuskoodi <span>jatkaaksesi tilin asetuksiin</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Syötä todennuskoodi <span>jatkaaksesi palveluun { $serviceName }</span>
auth-totp-instruction = Avaa todennussovellus ja syötä sen näyttämä todennuskoodi.
auth-totp-input-label = Syötä 6-numeroinen koodi
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Vahvista
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Todennuskoodi vaaditaan

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Hyväksyntä vaaditaan nyt <span>joltakin muulta laitteeltasi</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Parin muodostaminen epäonnistui.
pair-failure-message = Määritysprosessi keskeytettiin.

## Pair index page

pair-sync-header = Synkronoi { -brand-firefox } puhelimella tai tabletilla
pair-cad-header = Yhdistä { -brand-firefox } toisella laitteella
pair-already-have-firefox-paragraph = Löytyykö { -brand-firefox } jo puhelimestasi tai tabletistasi?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synkronoi laitteesi
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Tai lataa
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Skannaa ladataksesi { -brand-firefox } mobiililaitteelle tai lähetä <linkExternal>latauslinkki</linkExternal> itsellesi.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ei nyt
pair-take-your-data-message = Ota välilehdet, kirjanmerkit ja salasanat mukaan kaikkialle missä käytät { -brand-firefox }ia.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Aloita
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-koodi

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Laite yhdistetty
pair-success-message-2 = Parin muodostaminen onnistui.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Vahvista parin muodostaminen <span>tilille { $email }</span>
pair-supp-allow-confirm-button = Vahvista parin muodostus
pair-supp-allow-cancel-link = Peruuta

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Hyväksyntä vaaditaan nyt <span>joltain muulta laitteeltasi</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Muodosta pari sovelluksella
pair-unsupported-message = Käytitkö järjestelmän kameraa? Parin muodostaminen tulee tehdä { -brand-firefox }-sovelluksesta.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Luo salasana synkronointia varten

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Odota, sinut ohjataan valtuutettuun sovellukseen.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Anna tilin palautusavain
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Anna 32-merkkinen tilin palautusavain
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Jatka
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Etkö löydä tilisi palautusavainta?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Luo uusi salasana
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Salasana asetettu
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Valitettavasti salasanaa asettaessa ilmeni ongelma
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Käytä tilin palautusavainta
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Salasanasi on nollattu.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Kirjoita 10-merkkinen koodi
confirm-backup-code-reset-password-confirm-button = Vahvista
confirm-backup-code-reset-password-subheader = Anna varatodennuskoodi
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Jäitkö ulos tililtäsi?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Tarkista sähköpostisi
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Lähetimme vahvistuskoodin osoitteeseen <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Syötä 8-numeroinen koodi 10 minuutin kuluessa
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Jatka
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Lähetä koodi uudelleen
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Käytä toista tiliä

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Nollaa salasanasi
confirm-totp-reset-password-subheader-v2 = Kirjoita kaksivaiheisen todennuksen koodi
confirm-totp-reset-password-trouble-code = Ongelmia koodin kirjoittamisen kanssa?
confirm-totp-reset-password-confirm-button = Vahvista
confirm-totp-reset-password-input-label-v2 = Kirjoita 6-numeroinen koodi
confirm-totp-reset-password-use-different-account = Käytä toista tiliä

## ResetPassword start page

password-reset-flow-heading = Nollaa salasanasi
password-reset-email-input =
    .label = Kirjoita sähköpostiosoitteesi
password-reset-submit-button-2 = Jatka

## ResetPasswordConfirmed

reset-password-complete-header = Salasanasi on nollattu
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Jatka palveluun { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Nollaa salasanasi
password-reset-recovery-method-subheader = Valitse palautustapa
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } koodi jäljellä
       *[other] { $numBackupCodes } koodia jäljellä
    }

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Nollaa salasanasi
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Kirjoita palautuskoodi
reset-password-recovery-phone-input-label = Kirjoita 6-numeroinen koodi
reset-password-recovery-phone-code-submit-button = Vahvista
reset-password-recovery-phone-resend-code-button = Lähetä koodi uudelleen
reset-password-recovery-phone-resend-success = Koodi lähetetty
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Jäitkö ulos tililtäsi?
reset-password-recovery-phone-send-code-error-heading = Koodin lähettämisessä oli ongelma
reset-password-recovery-phone-code-verification-error-heading = Koodisi vahvistamisessa oli ongelma
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Yritä myöhemmin uudelleen.
reset-password-recovery-phone-invalid-code-error-description = Koodi on virheellinen tai vanhentunut.
reset-password-with-recovery-key-verified-page-title = Salasanan nollaus onnistui
reset-password-complete-new-password-saved = Uusi salasana tallennettu!
reset-password-complete-recovery-key-created = Uusi tilin palautusavain luotu. Lataa ja tallenna se nyt.

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Virhe:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Vahvistetaan kirjautumista…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Vahvistusvirhe
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Vahvistuslinkki on vanhentunut
signin-link-expired-message-2 = Napsautamasi linkki on vanhentunut tai se on jo käytetty.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Anna <span>{ -product-mozilla-account }si</span> salasana
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Jatka palveluun { $serviceName }
signin-subheader-without-logo-default = Jatka tilin asetuksiin
signin-button = Kirjaudu sisään
signin-header = Kirjaudu sisään
signin-use-a-different-account-link = Käytä toista tiliä
signin-forgot-password-link = Unohditko salasanan?
signin-password-button-label = Salasana
signin-code-expired-error = Koodi vanhentunut. Kirjaudu sisään uudelleen.
signin-account-locked-banner-heading = Nollaa salasanasi
signin-account-locked-banner-description = Lukitsimme tilisi suojataksemme sitä epäilyttävältä toiminnalta.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Kirjaudu sisään nollaamalla salasanasi

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Avaamastasi linkistä puuttui merkkejä. Sähköpostiohjelmasi on saattanut katkaista sen. Kopioi osoite huolellisesti ja yritä uudelleen.
report-signin-header = Ilmoitetaanko luvattomasta kirjautumisesta?
report-signin-body = Sait sähköpostin tilisi käyttöyrityksestä. Haluatko ilmoittaa käyttöyrityksen epäilyttäväksi?
report-signin-submit-button = Ilmoita toiminnasta
report-signin-support-link = Mistä tämä johtuu?
signin-bounced-header = Pahoittelut, olemme lukinneet tilisi.
# $email (string) - The user's email.
signin-bounced-message = Osoitteeseen { $email } lähetetty vahvistusviesti palautui vastaanottamattomana ja tilisi on lukittu { -brand-firefox }-tietojesi suojaamiseksi.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Jos tämä on käytössä oleva sähköpostiosoite, <linkExternal>ilmoita siitä meille</linkExternal> niin autamme tilin lukituksen poistossa.
signin-bounced-create-new-account = Eikö sinulla ole enää pääsyä kyseiseen sähköpostiosoitteeseen? Luo uusi tili
back = Edellinen

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Vahvista tämä kirjautuminen <span>jatkaaksesi tilin asetuksiin</span>
signin-push-code-heading-w-custom-service = Vahvista tämä kirjautuminen <span>jatkaaksesi palveluun { $serviceName }</span>
signin-push-code-instruction = Tarkista muut laitteesi ja hyväksy tämä kirjautuminen { -brand-firefox }-selaimestasi.
signin-push-code-did-not-recieve = Etkö saanut ilmoitusta?
signin-push-code-send-email-link = Lähetä koodi sähköpostitse

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Vahvista kirjautumisesi
signin-push-code-confirm-description = Havaitsimme kirjautumisyrityksen seuraavasta laitteesta. Jos se olit sinä, hyväksy kirjautuminen
signin-push-code-confirm-verifying = Vahvistetaan
signin-push-code-confirm-login = Vahvista kirjautuminen
signin-push-code-confirm-wasnt-me = Tämä en ollut minä, vaihda salasana.
signin-push-code-confirm-login-approved = Kirjautumisesi on hyväksytty. Sulje tämä ikkuna.
signin-push-code-confirm-link-error = Linkki on vaurioitunut. Yritä uudelleen.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Kirjaudu sisään
signin-recovery-method-subheader = Valitse palautustapa
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } koodi jäljellä
       *[other] { $numBackupCodes } koodia jäljellä
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Ongelma lähetettäessä koodia palauttamisen puhelinnumeroon

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Kirjaudu sisään
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Kirjoita yksi kertakäyttöisistä koodeista, jotka tallensit kaksivaiheisen todennuksen määrittämisen yhteydessä.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Kirjoita 10-merkkinen koodi
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Vahvista
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Jäitkö ulos tililtäsi?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Varatodennuskoodi vaaditaan
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Ongelma lähetettäessä koodia palauttamisen puhelinnumeroon
signin-recovery-code-use-phone-failure-description = Yritä myöhemmin uudelleen.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Kirjaudu sisään
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Kirjoita palautuskoodi
signin-recovery-phone-input-label = Kirjoita 6-numeroinen koodi
signin-recovery-phone-code-submit-button = Vahvista
signin-recovery-phone-resend-code-button = Lähetä koodi uudelleen
signin-recovery-phone-resend-success = Koodi lähetetty
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Jäitkö ulos tililtäsi?
signin-recovery-phone-send-code-error-heading = Koodin lähettämisessä oli ongelma
signin-recovery-phone-code-verification-error-heading = Koodisi vahvistamisessa oli ongelma
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Yritä myöhemmin uudelleen.
signin-recovery-phone-invalid-code-error-description = Koodi on virheellinen tai vanhentunut.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Kiitos valppaudestasi
signin-reported-message = Tiimillemme on ilmoitettu. Tällaiset ilmoitukset auttavat meitä torjumaan tunkeutujia.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Anna vahvistuskoodi<span> { -product-mozilla-account }llesi</span>
signin-token-code-input-label-v2 = Kirjoita 6-numeroinen koodi
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Vahvista
signin-token-code-code-expired = Vanheniko koodi?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Lähetä uusi koodi sähköpostiin.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Vahvistuskoodi vaaditaan
signin-token-code-resend-error = Jokin meni pieleen. Uutta koodia ei voitu lähettää.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Kirjaudu sisään
signin-totp-code-subheader-v2 = Kirjoita kaksivaiheisen todennuksen koodi
signin-totp-code-input-label-v4 = Syötä 6-numeroinen koodi
signin-totp-code-aal-sign-out = Kirjaudu ulos tältä laitteelta
signin-totp-code-aal-sign-out-error = Valitettavasti uloskirjautumisen kanssa ilmeni ongelma
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Vahvista
signin-totp-code-other-account-link = Käytä toista tiliä
signin-totp-code-recovery-code-link = Ongelmia koodin kirjoittamisen kanssa?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Todennuskoodi vaaditaan

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Salli tämä kirjautuminen
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Katso osoitteeseen { $email } lähetetty valtuuskoodi.
signin-unblock-code-input = Kirjoita valtuuskoodi
signin-unblock-submit-button = Jatka
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Valtuuskoodi vaaditaan
signin-unblock-code-incorrect-length = Valtuutuskoodin tulee sisältää 8 merkkiä
signin-unblock-code-incorrect-format-2 = Valtuutuskoodi voi sisältää vain kirjaimia ja/tai numeroita
signin-unblock-resend-code-button = Ei saapuneissa tai roskapostissa? Lähetä uudestaan
signin-unblock-support-link = Mistä tämä johtuu?

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Kirjoita vahvistuskoodi
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Anna vahvistuskoodi<span> { -product-mozilla-account }llesi</span>
confirm-signup-code-input-label = Kirjoita 6-numeroinen koodi
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Vahvista
confirm-signup-code-sync-button = Aloita synkronointi
confirm-signup-code-code-expired = Vanheniko koodi?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Lähetä uusi koodi sähköpostiin.
confirm-signup-code-success-alert = Tilin vahvistaminen onnistui
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Vahvistuskoodi vaaditaan

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Luo salasana
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Vaihda sähköpostiosoite

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synkronointi on käytössä
signup-confirmed-sync-success-banner = { -product-mozilla-account } vahvistettu
signup-confirmed-sync-button = Aloita selaaminen
signup-confirmed-sync-add-device-link = Lisää toinen laite
signup-confirmed-sync-manage-sync-button = Hallinnoi synkronointia
signup-confirmed-sync-set-password-success-banner = Synkronoinnin salasana luotu
