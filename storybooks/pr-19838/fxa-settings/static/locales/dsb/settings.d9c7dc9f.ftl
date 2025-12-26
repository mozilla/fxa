# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Nowy kod jo se pósłał na wašu e-mailowu adresu.
resend-link-success-banner-heading = Nowy wótkaz jo se pósłał na wašu e-mailowu adresu.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Pśidajśo swójim kontaktam { $accountsEmail }, aby dodaśe bźez problemow zawěsćił.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Chórgoj zacyniś
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } se 1. nowembra do { -product-mozilla-accounts } pśemjenijo
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Pśizjawijośo se ze samskim wužywaŕskim mjenim a gronidłom a njebudu dalšne změny na produktach, kótarež wužywaśo.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Smy { -product-firefox-accounts } do { -product-mozilla-accounts } pśemjenili. Pśizjawijośo se ze samskim wužywaŕskim mjenim a gronidłom a njebudu dalšne změny na produktach, kótarež wužywaśo.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Dalšne informacije
# Alt text for close banner image
brand-close-banner =
    .alt = Chórgoj zacyniś
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo m { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Slědk
button-back-title = Slědk

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Ześěgnuś a pókšacowaś
    .title = Ześěgnuś a pókšacowaś
recovery-key-pdf-heading = Kontowy wótnowjeński kluc
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Generěrowany: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Kontowy wótnowjeński kluc
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Toś ten kluc wam zmóžnja, waše skoděrowane daty wobglědowaka (mjazy nimi gronidła, cytańske znamjenja a historiju) wótnowiś, jolic swój gronidło zabywaśo. Składujśo jo na městnje, kótarež móžośo se spomnjeś.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Městna za składowanje wašogo kluca
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Zgóńśo wěcej wó swójom kontowem wótnowjeńskem klucu
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Bóžko jo pśi ześěgowanju kontowego wótnowjeńskego kluca problem nastał

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Wobstarajśo se wěcej wót { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Wobstarajśo se nejnowše nowosći  a produktowe aktualizacije
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Docasny pśistup, aby nowe produkty testował
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Napominanja k akciji, aby internet slědk dostał

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Ześěgnjony
datablock-copy =
    .message = Kopěrowane
datablock-print =
    .message = Śišćane

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] { $count } kod kopěrowany
        [two] { $count } koda kopěrowanej
        [few] { $count } kody kopěrowane
       *[other] { $count } kody kopěrowane
    }
datablock-download-success =
    { $count ->
        [one] { $count } kod ześěgnjony
        [two] { $count } koda ześěgnjonej
        [few] { $count } kody ześěgnjone
       *[other] { $count } kody ześěgnjone
    }
datablock-print-success =
    { $count ->
        [one] { $count } kod wuśišćany
        [two] { $count } koda wuśišćanej
        [few] { $count } kody wuśišćane
       *[other] { $count } kody wuśišćane
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Kopěrowany

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (pówoblicone)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (pówoblicone)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (pówoblicone)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (pówoblicone)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Njeznate městno
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } na { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-adresa: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Gronidło
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Gronidło wóspjetowaś
form-password-with-inline-criteria-signup-submit-button = Konto załožyś
form-password-with-inline-criteria-reset-new-password =
    .label = Nowe gronidło
form-password-with-inline-criteria-confirm-password =
    .label = Gronidło wobkšuśiś
form-password-with-inline-criteria-reset-submit-button = Nowe gronidło napóraś
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Gronidło
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Gronidło wóspjetowaś
form-password-with-inline-criteria-set-password-submit-button = Synchronizaciju zachopiś
form-password-with-inline-criteria-match-error = Gronidle njejstej jadnakej
form-password-with-inline-criteria-sr-too-short-message = Gronidło musy nanejmjenjej 8 znamuškow wopśimowaś.
form-password-with-inline-criteria-sr-not-email-message = Gronidło njesmějo wašu e-mailowu adresu wopśimowaś.
form-password-with-inline-criteria-sr-not-common-message = Gronidło njesměj zgromadnje wužywane gronidło byś.
form-password-with-inline-criteria-sr-requirements-met = Zapódane gronidło wšykne pominanja na gronidło respektěrujo.
form-password-with-inline-criteria-sr-passwords-match = Zapódane gronidła su jadnake.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Toś to pólo jo trjebne

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Zapódajśo { $codeLength }-městnowy kod, aby pókšacował
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Zapódajśo { $codeLength }-znamjenjowy kod, aby pókšacował

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Kontowy wótnowjeński kluc { -brand-firefox }
get-data-trio-title-backup-verification-codes = Kody za zawěsćeńsku awtentifikaciju
get-data-trio-download-2 =
    .title = Ześěgnuś
    .aria-label = Ześěgnuś
get-data-trio-copy-2 =
    .title = Kopěrowaś
    .aria-label = Kopěrowaś
get-data-trio-print-2 =
    .title = Śišćaś
    .aria-label = Śišćaś

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Warnowanje
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Glědajśo
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Warnowanje
authenticator-app-aria-label =
    .aria-label = Nałoženje awtentificěrowanja
backup-codes-icon-aria-label-v2 =
    .aria-label = Awtentifikaciske kody za zawěsćenje su se zmóžnili
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Awtentifikaciske kody za zawěsćenje su se znjemóžnili
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Wótnowjeński SMS zmóžnjony
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Wótnowjeński SMS znjemóžnjony
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadiska chórgojcka
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Markěrowaś
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Wuspěch
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Zmóžnjony
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Powěźeńku zacyniś
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kod
error-icon-aria-label =
    .aria-label = Zmólka
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informacije
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Chórgojcka Zjadnośonych statow

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Licadło a mobilny telefon a na kuždem wobraz złamaneje wutšoby
hearts-verified-image-aria-label =
    .aria-label = Licadło, mobilny telefon a tablet a na kuždem wobraz bijuceje wutšoby
signin-recovery-code-image-description =
    .aria-label = Dokument, kótaryž schowany tekst wopśimujo.
signin-totp-code-image-label =
    .aria-label = Rěd ze schowanym 6-městnowym kodom.
confirm-signup-aria-label =
    .aria-label = Wobalka, kótaraž wótkaz wopśimujo
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ilustracija za kontowy wótnowjeński kluc.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ilustracija za kontowy wótnowjeński kluc.
password-image-aria-label =
    .aria-label = Ilustracija, kótaraž zapódaśe gronidła pokazujo.
lightbulb-aria-label =
    .aria-label = Ilustracija za napóranje składowańskeje pokazki.
email-code-image-aria-label =
    .aria-label = Ilustracija za mejlku, kótaraž kod wopśimujo.
recovery-phone-image-description =
    .aria-label = Mobilny rěd, kótaryž kod pśez tekstowu powěźeńku dostawa.
recovery-phone-code-image-description =
    .aria-label = Kod jo se dostał na mobilnem rěźe.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilny rěd z móžnosću, tekstowe powěźeńki SMS słaś
backup-authentication-codes-image-aria-label =
    .aria-label = Rědowa wobrazowka z kodami
sync-clouds-image-aria-label =
    .aria-label = Mroki ze symbolom synchronizacije
confetti-falling-image-aria-label =
    .aria-label = Animěrowany padajucy konfeti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Sćo pla { -brand-firefox } pśizjawjony.
inline-recovery-key-setup-create-header = Zawěsććo swójo konto
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Maśo minutu, aby swóje daty šćitał?
inline-recovery-key-setup-info = Napórajśo kontowy wótnowjeński kluc, aby mógał swóje synchronizaciske pśeglědowańske daty wótnowiś, jolic swójo gronidło zabydnjośo.
inline-recovery-key-setup-start-button = Kontowy wótnowjeński kluc napóraś
inline-recovery-key-setup-later-button = Pózdźej cyniś

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Gronidła schowaś
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Gronidło pokazaś
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Wašo gronidło jo tuchylu na wobrazowce widobne.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Wašo gronidło jo tuchylu schowane.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Wašo gronidło jo něnto na wobrazowce widobne.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Wašo gronidło jo něnto schowane.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Wubjeŕśo kraj
input-phone-number-enter-number = Zapódajśo telefonowy numer
input-phone-number-country-united-states = Zjadnośone staty
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Slědk

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Wótkaz k slědkstajanjeju gronidła wobškóźony
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Wobkšuśeński wótkaz jo wobškóźony
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Wótkaz jo wobškóźony
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Wótkazoju, na kótaryž sćo kliknuł, znamuška feluju, a jo snaź pśez waš e-mailowy program wobškóźony. Kopěrujśo adresu kradosćiwje a wopytajśo hyšći raz.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Nowy wótkaz dostaś

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Gronidło se spomniś?
# link navigates to the sign in page
remember-password-signin-link = Pśizjawiś

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Primarna e-mailowa adresa jo južo wokšuśona
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Pśizjawjenje jo se južo wobkšuśiło
confirmation-link-reused-message = Toś ten wobkšuśeński wótkaz jo se južo wužył a dajo se jano jaden raz wužywaś.

## Locale Toggle Component

locale-toggle-select-label = Rěc wubraś
locale-toggle-browser-default = Standard wobglědowaka
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Špatne napšašowanje

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Trjebaśo toś to gronidł za pśistup k skoděrowanym datam, kótarež pla nas składujośo.
password-info-balloon-reset-risk-info = Slědkstajenje groni, až se snaź daty ako gronidła a cytańske znamjenja zgubiju.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Wubjeŕśo mócne gronidło, kótarež njejsćo wužył na drugich sedłach. Źiwajśo na to, až wěstotnym pominanjam wótpowědujo:
password-strength-short-instruction = Wubjeŕśo mócne gronidło:
password-strength-inline-min-length = Nanejmjenjej 8 znamuškow
password-strength-inline-not-email = Nic waša e-mailowa adresa
password-strength-inline-not-common = Nic cesto wužywane gronidło
password-strength-inline-confirmed-must-match = Wobkšuśenje nowemu gronidłoju wótpowědujo
password-strength-inline-passwords-match = Gronidle stej jadnakej

## Notification Promo Banner component

account-recovery-notification-cta = Napóraś
account-recovery-notification-header-value = Njezgubujśo swóje daty, jolic swójo gronidło zabydnjośo.
account-recovery-notification-header-description = Napórajśo kontowy wótnowjeński kluc, aby swóje synchronizaciske pśeglědowańske daty wótnowiś, jolic swójo gronidło zabydnjośo.
recovery-phone-promo-cta = Wótnowjeński telefon pśidaś
recovery-phone-promo-heading = Pśidajśo swójomu kontoju pśidatny šćit z wótnowjeńskim telefonom
recovery-phone-promo-description = Něnto móžośo se z jadnorazowym gronidłom pśez SMS pśizjawiś, jolic njamóžośo swójo nałoženje za dwójokšacowu awtentifikaciju wužywaś.
recovery-phone-promo-info-link = Zgóńśo wěcej wó wótnowjenju a riziku SIM swap
promo-banner-dismiss-button =
    .aria-label = Chórgoj zachyśiś

## Ready component

ready-complete-set-up-instruction = Zapódajśo swójo nowe gronidło na swójich drugich rědach { -brand-firefox }, aby zarědowanje dokóńcył.
manage-your-account-button = Zastojśo swójo konto
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Móžośo něnto { $serviceName } wužywaś
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Móžośo něnto kontowe nastajenja wužywaś
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Wašo konto jo gótowo!
ready-continue = Dalej
sign-in-complete-header = Pśizjawjenje jo se wobkšuśiło
sign-up-complete-header = Konto jo wobkšuśone
primary-email-verified-header = Primarna e-mailowa adresa jo wokšuśona

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Městna za składowanje wašogo kluca:
flow-recovery-key-download-storage-ideas-folder-v2 = Zarědnik na wěstem rěźe
flow-recovery-key-download-storage-ideas-cloud = Dowěry gódny składowak w clouźe
flow-recovery-key-download-storage-ideas-print-v2 = Wuśišćana kopija
flow-recovery-key-download-storage-ideas-pwd-manager = Zastojnik gronidłow

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Pśidajśo pokaz, aby swój kluc zasej namakał
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Toś ten pokaz dejał wam pomagaś, se spomnjeś, źož sćo składł swój kluc kontowego wótnowjenja. Móžomy wam jen za slědkstajenje gronidła pokazaś, aby se waše daty wótnowili.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Zapódajśo pokaz (na žycenje)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Dokóńcyś
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Pokaz musy mjenjej ako 255 znamuškow wopśimowaś.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Pokaz njesmějo njewěste znamuška Unicode wopśimowaś. Jano pismiki, licby, interpunkciske znamuška a symbole su dowólone.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Warnowanje
password-reset-chevron-expanded = Warnowanje schowaś
password-reset-chevron-collapsed = Warnowanje pokazaś
password-reset-data-may-not-be-recovered = Daty wašogo wobglědowaka se snaź njewobnowiju
password-reset-previously-signed-in-device-2 = Maśo rěd, źož sćo se do togo pśizjawił?
password-reset-data-may-be-saved-locally-2 = Daty wašogo wobglědowaka su snaź na tom rěźe skłaźone. Stajśo swójo gronidło slědk, pśizjawśo se pón tam, aby swóje daty wótnowił a synchronizěrował.
password-reset-no-old-device-2 = Maśo nowy rěd, ale njamaśo pśistup k swójim staršym?
password-reset-encrypted-data-cannot-be-recovered-2 = Jo nam luto, ale waše skoděrowane daty wobglědowaka na serwerach { -brand-firefox } njedaju se wótnowiś.
password-reset-warning-have-key = Maśo kontowy wótnowjeński kluc?
password-reset-warning-use-key-link = Wužywajśo jen něnto, aby swójo gronidło slědk stajił a swóje daty wobchował

## Alert Bar

alert-bar-close-message = Powěźeńku zacyniś

## User's avatar

avatar-your-avatar =
    .alt = Waš awatar
avatar-default-avatar =
    .alt = Standardny awatar

##


# BentoMenu component

bento-menu-title-3 = Produkty { -brand-mozilla }
bento-menu-tagline = Dalšne produkty wót { -brand-mozilla }, kótarež wašu priwatnosć šćitaju
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Wobglědowak { -brand-firefox } za desktop
bento-menu-firefox-mobile = Wobglědowak { -brand-firefox } za mobilne rědy
bento-menu-made-by-mozilla = Wót { -brand-mozilla } wuwity

## Connect another device promo

connect-another-fx-mobile = Wobstarajśo se { -brand-firefox } za mobilny telefon abo tablet
connect-another-find-fx-mobile-2 = { -brand-firefox } w { -google-play } a { -app-store } namakaś.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Ześěgniśo { -brand-firefox } wót { -google-play }
connect-another-app-store-image-3 =
    .alt = Ześěgniśo { -brand-firefox } wót { -app-store }

## Connected services section

cs-heading = Zwězane słužby
cs-description = Wškno, což wužywaśo a źož sćo pśizjawjony.
cs-cannot-refresh =
    Pśi aktualizěrowanju lisćiny zwězanych słužbow jo problem
    nastał.
cs-cannot-disconnect = Klient njejo sr namakał, zwisk njedajo se źěliś
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Wót { $service } wótzjawjony
cs-refresh-button =
    .title = Zwězane słužby aktualizěrowaś
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Felujuce abo dwójne elementy?
cs-disconnect-sync-heading = Ze Sync źěliś

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Waše pśeglědowańske daty na <span>{ $device }</span> wóstanu, 
    ale njebuźo wěcej z wašym kontom synchronizěrowaś.
cs-disconnect-sync-reason-3 = Co jo głowna pśicyna za źělenje wót <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Rěd jo:
cs-disconnect-sync-opt-suspicious = Suspektny
cs-disconnect-sync-opt-lost = Zgubjony abo kšadnjony
cs-disconnect-sync-opt-old = Stary abo wuměnjony
cs-disconnect-sync-opt-duplicate = Dwójny
cs-disconnect-sync-opt-not-say = Bźez pódaśa

##

cs-disconnect-advice-confirm = W pórěźe, som zrozměł
cs-disconnect-lost-advice-heading = Zgubjony abo kšadnjony rěd jo se źělił
cs-disconnect-lost-advice-content-3 = Dokulaž waš rěd jo se zgubił abo kšadnuł, wy měł gronidło swójogo { -product-mozilla-account(case: "gen", capitalization: "lower") } w swójich kontowych nastajenjach změniś, aby waše informacije wěste źaržał. Wy měł teke za informacijami wót wašogo rědowego zgótowarja pytaś, aby waše daty znazdala wulašował.
cs-disconnect-suspicious-advice-heading = Suspektny rěd jo se źělił
cs-disconnect-suspicious-advice-content-2 = Jolic wótźělony rěd jo napšawdu suspektny, wy dejał gronidło swójogo { -product-mozilla-account(case: "gen", capitalization: "lower") } w swójich nastajenjach změniś, aby swóje informacije wěste źaržał. Wy dejał teke about:logins do adresowego póla zapódaś, aby druge gronidła změnił, kótarež sćo składł w { -brand-firefox }.
cs-sign-out-button = Wótzjawiś

## Data collection section

dc-heading = Zběranje a wužywanje datow
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Wobglědowak { -brand-firefox }
dc-subheader-content-2 = { -product-mozilla-accounts(case: "dat", capitalization: "upper") } dowóliś, techniske a interakciske daty na { -brand-mozilla } pósłaś.
dc-subheader-ff-content = Aby techniske nastajenja a nastajenja za interakciske daty wobglědowaka { -brand-firefox } pśeglědował abo aktualizěrował, wócyńśo nastajenja { -brand-firefox } a nawigěrujśo k Priwatnosć a wěstota.
dc-opt-out-success-2 = Wótzjawjenje wuspěšne. { -product-mozilla-accounts } njebudu techniske abo interakciske daty na { -brand-mozilla } słaś.
dc-opt-in-success-2 = Wjeliki źěk! Źělenje toś tych datow nam pomaga, { -product-mozilla-accounts(case: "acc", capitalization: "lower") } pólěpšyś.
dc-opt-in-out-error-2 = Bóžko jo pśi změnjanju wašogo nastajenja datoweje zběrki problem nastał
dc-learn-more = Dalšne informacije

# DropDownAvatarMenu component

drop-down-menu-title-2 = Meni { -product-mozilla-account(case: "gen", capitalization: "lower") }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Pśizjawjony ako
drop-down-menu-sign-out = Wótzjawiś
drop-down-menu-sign-out-error-2 = Bóžko jo pśi wótzjawjanju problem nastał

## Flow Container

flow-container-back = Slědk

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Zapódajśo swójo gronidło z pśicynow wěstoty znowego
flow-recovery-key-confirm-pwd-input-label = Zapódajśo swójo gronidło
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Kontowy wótnowjeński kluc napóraś
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Nowy kontowy wótnowjeński kluc napóraś

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Kontowy wótnowjeński kluc jo se napórał – ześěgniśo a składujśo jen něnto
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Toś ten kluc wam zmóžnja, waše daty wótnowiś, jolic swójo gronidło zabywaśo. Ześěgniśo jen něnto a składujśo jen na městnje, kótarež móžośo se spomnjeś – njamóžośo se pózdźej toś tomu bokoju wrośiś.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Dalej bźez ześěgnjenja

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Kontowy wótnowjeński kluc jo se napórał

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Napórajśo kontowy wótnowjeński kluc, jolic swójo gronidło zabywaśo
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Změńśo swój kontowy wótnowjeński kluc
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Koděrujomy pśeglědowańske daty – gronidła, cytańske znamjenja a wěcej. To jo wjelicne za priwatnosć, ale móžośo teke swóje daty zgubiś, jolic swójo gronidło zabywa.śo
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Togodla jo tak wažnje, až kontowy wótnowjeński kluc napórajośo – móžośo jen wužywaś, aby swóje daty wótnowił.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Prědne kšace
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Pśetergnuś

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Z wašym nałoženim awtentifikacije zwězaś
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Kšac 1:</strong> Scannujśo toś ten QR-kod z pomocu nałoženja awtentifikacije ako Duo abo Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-kod za konfiguraciju dwójokšacoweje awtentifikacije. Scannujśo jen abo wubjeŕśo „Njamóžośo QR-kod scannowaś?“, aby město togo konfiguraciski kluc dostał.
flow-setup-2fa-cant-scan-qr-button = Njamóžośo QR-kod scannowaś?
flow-setup-2fa-manual-key-heading = Kod manuelnje zapódaś
flow-setup-2fa-manual-key-instruction = <strong>Kšac 1:</strong> Zapódajśo toś ten kod w swójom preferěrowanem nałoženju awtentifikacije.
flow-setup-2fa-scan-qr-instead-button = QR-kod město togo scannowaś?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Zgóńśo wěcej wó nałoženjach awtentifikacije
flow-setup-2fa-button = Dalej
flow-setup-2fa-step-2-instruction = <strong>Kšac 2:</strong> Zapódajśo kod ze swójogo nałoženja awtentifikacije.
flow-setup-2fa-input-label = 6-městnowy kod zapódaś
flow-setup-2fa-code-error = Njepłaśiwy abo spadnjony kod. Pśeglědujśo swóje nałoženje awtentifikacije a wopytajśo hyšći raz.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Wubjeŕśo wótnowjeńsku metodu
flow-setup-2fa-backup-choice-description = To wam zmóžnja pśizjawiś, jolic pśistup k swójomu mobilnemu rědoju abo awtentifikaciskemu nałoženjeju njamaśo.
flow-setup-2fa-backup-choice-phone-title = Wótnowjeński telefon
flow-setup-2fa-backup-choice-phone-badge = Nejlažčejšy
flow-setup-2fa-backup-choice-phone-info = Wobstarajśo se wótnowjeński kod pśez tekstowu powěźeńku. Tuchylu w USA a Kanaźe k dispoziciji.
flow-setup-2fa-backup-choice-code-title = Kody za zawěsćeńsku awtentifikaciju
flow-setup-2fa-backup-choice-code-badge = Nejwěsćejšy
flow-setup-2fa-backup-choice-code-info = Napórajśo a składujśo kody awtentifikacije za jadnorazowe wužyśe.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Zgóńśo wěcej wó wótnowjenju a riziku SIM swap

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Zapódajśo kod za zawěsćeńsku awtentifikaciju
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Zapódajśo kod, aby wobkšuśił, až sćo składł swóje kody. Bźez toś tych kodow njamóžośo se snaź pśizjawiś, jolic swójo autentifikaciske nałoženje njamaśo.
flow-setup-2fa-backup-code-confirm-code-input = 10-městnowy kod zapódaś
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Dokóńcyś

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Kod za zawěsćeńske awtentificěrowanje składowaś
flow-setup-2fa-backup-code-dl-save-these-codes = Wobchowajśo je na městnje, na kótarež se dopominaśo. Jolic pśistup k swójomu nałoženjeju awtentifikacije njamaśo, musyśo jaden zapódaś, aby se pśizjawił.
flow-setup-2fa-backup-code-dl-button-continue = Dalej

##

flow-setup-2fa-inline-complete-success-banner = Dwójokšacowa awtentifikacija jo se zmóžniła
flow-setup-2fa-inline-complete-success-banner-description = Aby wšykne swóje zwězane rědy šćitał, wy měł se wšuźi, źož toś te konto wužywaśo, wótzjawić a se pón z pomocu swójeje noweje dwójokšacoweje awtentifikacije zasej pśizjawiś.
flow-setup-2fa-inline-complete-backup-code = Kody za zawěsćeńsku awtentifikaciju
flow-setup-2fa-inline-complete-backup-phone = Wótnowjeński telefon
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } kod wušej
        [two] { $count } koda wušej
        [few] { $count } kody wušej
       *[other] { $count } kodow wušej
    }
flow-setup-2fa-inline-complete-backup-code-description = To jo nejwěsćejša wótnowjeńska metoda, jolic njamóžośo se swójim mobilnym rědom abo awtentifikaciskim nałoženim pśizjawiś.
flow-setup-2fa-inline-complete-backup-phone-description = To jo nejlažčejša wótnowjeńska metoda, jolic njamóžośo se swójim awtentifikaciskim nałoženim pśizjawiś.
flow-setup-2fa-inline-complete-learn-more-link = Kak to wašo konto šćita
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Dalej k { $serviceName }
flow-setup-2fa-prompt-heading = Dwójokšacowu awtentifikaciju konfigurěrowaś
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } pomina, až dwójokšacowu awtentifikaciju konfigurěrujośo, aby wašo konto wěste wóstało.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Móžośo <authenticationAppsLink>toś te awtentifikaciske nałoženja</authenticationAppsLink> wužywaś, aby pókšacował.
flow-setup-2fa-prompt-continue-button = Dalej

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Wobkšuśeński kod zapódaś
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Šesćměstnowy kod jo se pósłał pśez tekstowu powěsć na <span>{ $phoneNumber }</span>. Toś ten kod za 5 minutow spadnjo.
flow-setup-phone-confirm-code-input-label = 6-městnowy kod zapódaś
flow-setup-phone-confirm-code-button = Wobkšuśiś
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Kod jo spadnuł?
flow-setup-phone-confirm-code-resend-code-button = Kod znowego słaś
flow-setup-phone-confirm-code-resend-code-success = Kod jo se pósłał
flow-setup-phone-confirm-code-success-message-v2 = Wótnowjeński telefon pśidany
flow-change-phone-confirm-code-success-message = Wótnowjeński telefon změnjony

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Pśeglědajśo swój telefonowy numer
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Dostanjośo tekstowu powěsć wót { -brand-mozilla } z kodom, aby swój numer pśeglědował. Njeźělśo toś ten kod z někim drugim.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Wótnowjeński telefon jo jano w Zjadnośonych statach a Kanaźe k dispoziciji. Numery VoIP a telefonowe maski se njepórucaju.
flow-setup-phone-submit-number-legal = Gaž waš numer pódawaśo, zwólijośo do togo, až móžomy jen składowaś, aby my mógli wam powěźeńku jano za kontowe pśeglědowanje pósłali. Płaśonki mógu se za powěsći a datowe raty pominaś.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Kod słaś

## HeaderLockup component, the header in account settings

header-menu-open = Meni zacyniś
header-menu-closed = Meni sedłoweje nawigacije
header-back-to-top-link =
    .title = Slědk górjej
header-back-to-settings-link =
    .title = Slědk k nastajenjam { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Pomoc

## Linked Accounts section

la-heading = Zwězane konta
la-description = Smy awtorizěrowali pśistup k slědujucym kontam.
la-unlink-button = Zwisk źěliś
la-unlink-account-button = Zwisk źěliś
la-set-password-button = Gronidło nastajiś
la-unlink-heading = Wót konta tśeśego póbitowarja źěliś
la-unlink-content-3 = Cośo napšawdu zwisk ze swójim kontom źěliś? Gaž zwisk ze swójim kontom źěliśo, njewótzjawijośo se awtomatiski wót swójich zwězanych słužbow. Aby to cynił, musyśo se manuelnje wót wótrězka zwězanych słužbow wótzjawiś.
la-unlink-content-4 = Nježli až zwězanje ze swójim kontom wótwónoźujośo, musyśo gronidło nastajiś. Bźez gronidła njedajo móžnosć za was, se pó wótwónoźowanju zwězanja z wašym kontom pśizjawiś.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Zacyniś
modal-cancel-button = Pśetergnuś
modal-default-confirm-button = Wobkšuśiś

## ModalMfaProtected

modal-mfa-protected-title = Wobkšuśeński kod zapódaś
modal-mfa-protected-subtitle = Pomagajśo nam zwěsćiś, až wy sćo změnił kontowe informacije
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Zapódajśo kod, kótaryž jo se pósłał za { $expirationTime } minutu na <email>{ $email }</email>.
        [two] Zapódajśo kod, kótaryž jo se pósłał za { $expirationTime } minuśe na <email>{ $email }</email>.
        [few] Zapódajśo kod, kótaryž jo se pósłał za { $expirationTime } minuty na <email>{ $email }</email>.
       *[other] Zapódajśo kod, kótaryž jo se pósłał za { $expirationTime } minutow na <email>{ $email }</email>.
    }
modal-mfa-protected-input-label = 6-městnowy kod zapódaś
modal-mfa-protected-cancel-button = Pśetergnuś
modal-mfa-protected-confirm-button = Wobkšuśiś
modal-mfa-protected-code-expired = Kod jo spadnuł?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Nowy kod pśez e-mail pósłaś.

## Modal Verify Session

mvs-verify-your-email-2 = Wašu e-mailowu adresu wobkšuśiś
mvs-enter-verification-code-2 = Zapódajśo swój wobkšuśeński kod
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Pšosym zapódajśo wobkšuśeński kod, kótaryž jo se pósłał za 5 minutow na <email>{ $email }</email>.
msv-cancel-button = Pśetergnuś
msv-submit-button-2 = Wobkšuśiś

## Settings Nav

nav-settings = Nastajenja
nav-profile = Profil
nav-security = Wěstota
nav-connected-services = Zwězane słužby
nav-data-collection = Zběranje a wužywanje datow
nav-paid-subs = Zapłaśone abonementy
nav-email-comm = E-mailowa komunikacija

## Page2faChange

page-2fa-change-title = Dwójokšacowu awtentifikaciju zmeniś
page-2fa-change-success = Dwójokšacowa awtentifikacija jo se zaktualizěrowała
page-2fa-change-success-additional-message = Aby wšykne swóje zwězane rědy šćitał, wy měł se wšuźi, źož toś te konto wužywaśo, wótzjawić a se pón z pomocu swójeje noweje dwójokšacoweje awtentifikacije zasej pśizjawiś.
page-2fa-change-totpinfo-error = Pśi wuměnjanju nałoženja dwójokšacoweje awtentifikacije jo zmólka nastała. Wopytajśo pózdźej hyšći raz.
page-2fa-change-qr-instruction = <strong>Kšac 1:</strong> Scannujśo toś ten QR-kod z pomocu awtentifikaciskego nałoženja, na pśikład Duo abo Google Authenticator. To nowy zwisk napórajo, stare zwiski njebudu wěcej funkcioněrowaś.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Kody za zawěsćeńsku awtentifikaciju
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Pśi wuměnjanju wašych kodow za zawěsćeńsku awtentifikaciju jo problem nastał
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Pśi napóranju wašych kodow za zawěsćeńsku awtentifikaciju jo problem nastał
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Awtentifikaciske kody za zawěsćenje su se zaktualizěrowali
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Awtentifikaciske kody za zawěsćenje su se napórali
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Wobchowajśo je na městnje, na kótarež se dopominaśo. Waše stare kody se wuměnja, za tym až sćo dokóncył pśiducy kšac.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Zapódajśo kod, aby wobkšuśił, až sćo składł swóje kody. Waše stare zawěsćeńske awtentifikaciske kody se znjemóžniju, gaž jo se toś ten kšac dokóńcył.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Wopacny kod za zawěsćeńsku awtentifikaciju

## Page2faSetup

page-2fa-setup-title = Dwójokšacowa awtentifikacija
page-2fa-setup-totpinfo-error = Pśi konfiguraciji dwójokšacoweje awtentifikacije jo zmólka nastała.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Ten kod njejo korektny. Wopytajśo hyšći raz.
page-2fa-setup-success = Dwójokšacowa awtentifikacija jo se zmóžniła
page-2fa-setup-success-additional-message = Aby wšykne swóje zwězane rědy šćitał, wy měł se wšuźi, źož toś te konto wužywaśo, wótzjawić a se pón z pomocu dwójokšacoweje awtentifikacije zasej pśizjawiś.

## Avatar change page

avatar-page-title =
    .title = Profilowy wobraz
avatar-page-add-photo = Foto pśidaś
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fotografěrowaś
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Foto wótwónoźeś
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Znowego fotografěrowaś
avatar-page-cancel-button = Pśetergnuś
avatar-page-save-button = Składowaś
avatar-page-saving-button = Składujo se…
avatar-page-zoom-out-button =
    .title = Pómjeńšyś
avatar-page-zoom-in-button =
    .title = Pówětšyś
avatar-page-rotate-button =
    .title = Wobwjertnuś
avatar-page-camera-error = Kamera njedajo se inicializěrowaś
avatar-page-new-avatar =
    .alt = nowy profilowy wobraz
avatar-page-file-upload-error-3 = Pśi nagrawanju wašogo profilowego wobraza jo problem nastał
avatar-page-delete-error-3 = Pśi lašowanju wašogo profilowego wobraza jo problem nastał
avatar-page-image-too-large-error-2 = Wobrazowa dataja jo pśewjelika za nagraśe

## Password change page

pw-change-header =
    .title = Gronidło změniś
pw-8-chars = Nanejmjenjej 8 znamuškow
pw-not-email = Nic waša e-mailowa adresa
pw-change-must-match = Nowe gronidło wobkšuśenjeju wótpowědujo
pw-commonly-used = Nic cesto wužywane gronidło
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Wóstańśo wěsty – njewužywajśo gronidła wěcej raz. Glejśo dalšne pokaze aby <linkExternal>mócne gronidła napórał</linkExternal>.
pw-change-cancel-button = Pśetergnuś
pw-change-save-button = Składowaś
pw-change-forgot-password-link = Sćo gronidło zabył?
pw-change-current-password =
    .label = Aktualne gronidło zapódaś
pw-change-new-password =
    .label = Nowe gronidło zapódaś
pw-change-confirm-password =
    .label = Nowe gronidło wobkšuśiś
pw-change-success-alert-2 = Gronidło jo se zaktualizěrowało

## Password create page

pw-create-header =
    .title = Gronidło napóraś
pw-create-success-alert-2 = Gronidło jo se nastajiło
pw-create-error-2 = Bóžko jo nastał problem pśi stajanju wašogo gronidła

## Delete account page

delete-account-header =
    .title = Konto wulašowaś
delete-account-step-1-2 = Kšac 1 z 2
delete-account-step-2-2 = Kšac 2 z 2
delete-account-confirm-title-4 = Sćo snaź zwězał swójo { -product-mozilla-account(case: "acc", capitalization: "lower") } z jednym produktom abo z jedneju słužbu  { -brand-mozilla } abo z někotarymi z nich, kótarež was wěsty a produktiwny we webje źarže:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Daty { -brand-firefox } se synchronizěruju
delete-account-product-firefox-addons = Dodanki { -brand-firefox }
delete-account-acknowledge = Pšosym lašujśo swójo konto, aby to wobkšuśił:
delete-account-chk-box-1-v4 =
    .label = Wšykne zapłaśone abonementy, kótarež maśo, se wupowěźeju
delete-account-chk-box-2 =
    .label = Móžośo skłaźone informacije a funkcije produktow { -brand-mozilla } zgubiś
delete-account-chk-box-3 =
    .label = Waše skłaźone informacije njedaju se snaź wótnowiś, gaž toś tu e-mailowu adresu znowego aktiwěrujośo
delete-account-chk-box-4 =
    .label = Rozšyrjenja, kótarež sćo wózjawił na addons.mozilla.org, se wulašuju.
delete-account-continue-button = Dalej
delete-account-password-input =
    .label = Gronidło zapódaś
delete-account-cancel-button = Pśetergnuś
delete-account-delete-button-2 = Lašowaś

## Display name page

display-name-page-title =
    .title = Zwobraznjeńske mě
display-name-input =
    .label = Zapódajśo zwobraznjeńske mě
submit-display-name = Składowaś
cancel-display-name = Pśetergnuś
display-name-update-error-2 = Pśi aktualizěrowanju wašogo zwobraznjeńskego mjenja jo problem nastał
display-name-success-alert-2 = Zwobraznjeńske mě zaktualizěrowane

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Nejnowša kontowa aktiwita
recent-activity-account-create-v2 = Konto załožone
recent-activity-account-disable-v2 = Konto znjemóžnjone
recent-activity-account-enable-v2 = Konto zmóžnjone
recent-activity-account-login-v2 = Kontowe pśizjawjenje jo se iniciěrowało
recent-activity-account-reset-v2 = Slědkstajenje jo se iniciěrowało
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = E-mailowe wótpokazanja wulašowane
recent-activity-account-login-failure = Wopyt kontowego pśizjawjenja njejo se raźiło
recent-activity-account-two-factor-added = Dwójokšacowa awtentifikacija jo se zmóžniła
recent-activity-account-two-factor-requested = Dwójokšacowa awtentifikacija jo se pominała
recent-activity-account-two-factor-failure = Dwójokšacowa awtentifikacija njejo se raźiła
recent-activity-account-two-factor-success = Dwójokšacowa awtentifikacija wuspěšna
recent-activity-account-two-factor-removed = Dwójokšacowa awtentifikacija jo se wótwónoźeła
recent-activity-account-password-reset-requested = Konto jo pominało slědkstajenje gronidła
recent-activity-account-password-reset-success = Kontowe gronidło jo se wuspěšnje slědk stajiło
recent-activity-account-recovery-key-added = Kontowy wótnowjeński kluc zmóžnjony
recent-activity-account-recovery-key-verification-failure = Pśeglědanje kontowego wótnowjeńskego kluca njejo se raźiło
recent-activity-account-recovery-key-verification-success = Pśeglědanje kontowego wótnowjeńskego kluca wuspěšne
recent-activity-account-recovery-key-removed = Kontowy wótnowjeński kluc jo se wótwónoźeł
recent-activity-account-password-added = Nowe gronidło pśidane
recent-activity-account-password-changed = Gronidło změnjone
recent-activity-account-secondary-email-added = Sekundarna e-mailowa adresa pśidana
recent-activity-account-secondary-email-removed = Sekundarna e-mailowa adresa wótwónoźona
recent-activity-account-emails-swapped = Primarne a sekundarne e-mailowe adrese su zaměnjone
recent-activity-session-destroy = Wót pósejźenja wótzjawjony
recent-activity-account-recovery-phone-send-code = Telefonowy kod za wótnowjenje pósłany
recent-activity-account-recovery-phone-setup-complete = Konfiguracija wótnowjeńskego telefona dokóńcona
recent-activity-account-recovery-phone-signin-complete = Pśizjawjenje z wótnowjeńskim telefonom dokóńcone
recent-activity-account-recovery-phone-signin-failed = Pśizjawjenje z wótnowjeńskim telefonom njeraźone
recent-activity-account-recovery-phone-removed = Wótnowjeński telefon wótwónoźony
recent-activity-account-recovery-codes-replaced = Wótnowjeński kod wuměnjony
recent-activity-account-recovery-codes-created = Wótnowjeńske kody napórane
recent-activity-account-recovery-codes-signin-complete = Pśizjawjenje z wótnowjeńskimi kodami dokóńcone
recent-activity-password-reset-otp-sent = Wobkšuśeński kod za slědkstajenje gronidła jo se pósłał
recent-activity-password-reset-otp-verified = Wobkšuśeński kod za slědkstajenje gronidła jo se pśeglědał
recent-activity-must-reset-password = Slědkstajenje gronidła trjebne
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Druga kontowa aktiwita

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Kontowy wótnowjeński kluc
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Slědk k nastajenjam

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Numer wótnowjeńskego telefona wótwónoźeś
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = To <strong>{ $formattedFullPhoneNumber }</strong> ako waš wótnowjeński telefon wótwónoźijo.
settings-recovery-phone-remove-recommend = Pórucujomy, pśi toś tej metoźe wóstaś, dokulaž jo lažčejša, ako awtentifikaciske kody za zawěsćenje składowaś.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Jolic je lašujośo, zawěsććo, až maśo swóje skłaźone awtentifikaciske kody. <linkExternal>Wótnowjeńske metody pśirownaś</linkExternal>
settings-recovery-phone-remove-button = Telefonowy numer wótwónoźeś
settings-recovery-phone-remove-cancel = Pśetergnuś
settings-recovery-phone-remove-success = Wótnowjeński telefon wótwónoźony

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Wótnowjeński telefon pśidaś
page-change-recovery-phone = Wótnowjeński telefon změniś
page-setup-recovery-phone-back-button-title = Slědk k nastajenjam
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Telefonowy numer změniś

## Add secondary email page

add-secondary-email-step-1 = Kšac 1 z 2
add-secondary-email-error-2 = Pś napóranju toś teje e-mailoweje adrese jo problem nastał
add-secondary-email-page-title =
    .title = Druga e-mailowa adresa
add-secondary-email-enter-address =
    .label = E-mailowu adresu zapódaś
add-secondary-email-cancel-button = Pśetergnuś
add-secondary-email-save-button = Składowaś
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = E-mailowe maski njedaju se ako sekundarna e-mailowa adresa wužywaś

## Verify secondary email page

add-secondary-email-step-2 = Kšac 2 z 2
verify-secondary-email-page-title =
    .title = Druga e-mailowa adresa
verify-secondary-email-verification-code-2 =
    .label = Zapódajśo swój wobkšuśeński kod
verify-secondary-email-cancel-button = Pśetergnuś
verify-secondary-email-verify-button-2 = Wobkšuśiś
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Pšosym zapódajśo wobkšuśeński kod, kótaryž jo se pósłał za 5 minutow na <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } jo se wuspěšnje pśidała
verify-secondary-email-resend-code-button = Wobkšuśeński kod hyšći raz pósłaś

##

# Link to delete account on main Settings page
delete-account-link = Konto wulašowaś
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Wuspěšnje pśizjawjony. Waše { -product-mozilla-account } a daty aktiwne wóstanu.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Wuslěźćo, źož se waše priwatne informacije wótekšywaju a pśewzejśo kontrolu
# Links out to the Monitor site
product-promo-monitor-cta = Dostańśo dermotny scan

## Profile section

profile-heading = Profil
profile-picture =
    .header = Wobraz
profile-display-name =
    .header = Zwobraznjeńske mě
profile-primary-email =
    .header = Primarna e-mailowa adresa

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Kšac { $currentStep } z { $numberOfSteps }.

## Security section of Setting

security-heading = Wěstota
security-password =
    .header = Gronidło
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Napórany: { $date }
security-not-set = Njenastajony
security-action-create = Napóraś
security-set-password = Nastajśo gronidło, aby wěste wěstotne funkcije konta synchronizěrował a wužywał.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Nejnowšu kontowu aktiwitu pokazaś
signout-sync-header = Pósejźenje jo spadnuło
signout-sync-session-expired = Bóžko něco njejo se raźiło. Pšosym wótzjawśo se z menija wobglědowaka a wopytajśo hyšći raz.

## SubRow component

tfa-row-backup-codes-title = Kody za zawěsćeńsku awtentifikaciju
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Žedne kody k dispoziciji
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } kod zwóstawajucy
        [two] { $numCodesAvailable } koda zwóstawajucej
        [few] { $numCodesAvailable } kody zwóstawajuce
       *[other] { $numCodesAvailable } kody zwóstawajuce
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Nowe kody napóraś
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Pśidaś
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = To jo nejwěsćejša wótnowjeńska metoda, jolic njamóžośo swój mobilny rěd abo awtentifikaciske nałoženje wužywaś.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Wótnowjeński telefon
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Žeden telefonowy numer pśidany
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Změniś
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Pśidaś
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Wótwónoźeś
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Wótnowjeński telefon wótwónoźeś
tfa-row-backup-phone-delete-restriction-v2 = Jolic cośo swój wótnowjeński telefon wótwónoźeś, pśidajśo zawěsćeńske awtentifikaciske kody abo znjemóžniśo nejpjerwjej dwójokšacowu awtentifikaciju, aby se wobinuł, až se ze swójogo konta wuzamkujośo.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = To jo nejlažčejša wótnowjeńska metoda, jolic njamóžośo swójo awtentifikaciske nałoženje wužywaś.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Informacije wó riziku złoźejstwa SIM (SIM swap)

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Znjemóžniś
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Zmóžniś
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Sćelo se…
switch-is-on = zašaltowany
switch-is-off = wušaltowany

## Sub-section row Defaults

row-defaults-action-add = Pśidaś
row-defaults-action-change = Změniś
row-defaults-action-disable = Znjemóžniś
row-defaults-status = Žeden

## Account recovery key sub-section on main Settings page

rk-header-1 = Kontowy wótnowjeński kluc
rk-enabled = Zmóžnjony
rk-not-set = Njepóstajony
rk-action-create = Napóraś
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Změniś
rk-action-remove = Wótwónoźeś
rk-key-removed-2 = Kontowy wótnowjeński kluc jo se wótwónoźeł
rk-cannot-remove-key = Wótnowjeński kluc wašogo konta njedajo se wótwónoźeś.
rk-refresh-key-1 = Kontowy wótnowjeński kluc aktualizěrowaś
rk-content-explain = Wótnowśo swóje informacije, gaž sćo zabył swójo gronidło.
rk-cannot-verify-session-4 = Bóžko jo bastał problem pśi wobkšuśenju pósejźenja
rk-remove-modal-heading-1 = Kontowy wótnowjeński kluc wótwónoźeś?
rk-remove-modal-content-1 =
    Jolic wašo gronidło slědk stajaśo, njamóžośo swój
    kontowy wótnowjeński kluc wužywaś, aby pśistup k swójim datam měł. Njamóžośo toś tu akciju anulěrowaś.
rk-remove-error-2 = Wótnowjeński kluc wašogo konta njedajo se wótwónoźeś
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Kontowy wótnowjeński kluc lašowaś

## Secondary email sub-section on main Settings page

se-heading = Druga e-mailowa adresa
    .header = Druga e-mailowa adresa
se-cannot-refresh-email = Bóžko jo pśi aktualizěrowanju teje e-mailoweje adrese problem nastał.
se-cannot-resend-code-3 = Bóžko jo pśi wóspjetnem słanju wobkšuśeńskego koda problem nastał
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } jo něnto waša primarna e-mailowa adresa
se-set-primary-error-2 = Bóžko jo pśi změnjanju wašeje primarneje e-mailoweje adrese problem nastał
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } jo se wuspěšnje wulašowała
se-delete-email-error-2 = Bóžko jo pśi lašowanju toś teje e-mailoweje adrese problem nastał
se-verify-session-3 = Musyśo swójo aktualne pósejźenje pśeglědowaś, aby toś tu akciju wuwjadł
se-verify-session-error-3 = Bóžko jo bastał problem pśi wobkšuśenju pósejźenja
# Button to remove the secondary email
se-remove-email =
    .title = E-mailowu adresu wótwónoźeś
# Button to refresh secondary email status
se-refresh-email =
    .title = E-mailowu adresu aktualizěrowaś
se-unverified-2 = njewobkšuśony
se-resend-code-2 =
    Wobkšuśenje trjebne. <button>Sćelśo wobkšuśeński kod znowego</button>,
    jolic njejo we wašom zarědniku dochada pósta abo w spamowem zarědniku.
# Button to make secondary email the primary
se-make-primary = K primarnej adresy cyniś
se-default-content = Mějśo pśistup k swójomu kontoju, jolic njamóžośo se pla swójeje primarneje e-mailoweje adrese pśizjawiś.
se-content-note-1 =
    Pokazka: Sekundarna e-mailowa adresa waše informacije njewótnowijo – trjebaśo
    <a>kontowy wótnowjeński kluc</a> za to.
# Default value for the secondary email
se-secondary-email-none = Žedna

## Two Step Auth sub-section on Settings main page

tfa-row-header = Dwójokšacowa awtentifikacija
tfa-row-enabled = Zmóžnjony
tfa-row-disabled-status = Znjemóžnjony
tfa-row-action-add = Pśidaś
tfa-row-action-disable = Znjemóžniś
tfa-row-action-change = Změniś
tfa-row-button-refresh =
    .title = Dwójokšacowu awtentifikaciju aktualizěrowaś
tfa-row-cannot-refresh =
    Bóžko jo pśi aktualizěrowanju dwójokšacoweje
    awtentifikacije problem nastał.
tfa-row-enabled-description = Wašo konto se pśez dwójokšacowu awtentifikaciju šćita. Musyśo jadnorazowy gronidłowy kod  z nałoženja awtentifikacije  zapódaś, gaž se pla swójogo { -product-mozilla-account } pśizjawjaśo.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Kak to wašo konto šćita
tfa-row-disabled-description-v2 = Wužywajśo nałoženje awtentifikacije tśeśego póbitowarja ako drugi kšać, aby pomagał, swójo konto zawěsćił a pśizjawśo se.
tfa-row-cannot-verify-session-4 = Bóžko jo bastał problem pśi wobkšuśenju pósejźenja
tfa-row-disable-modal-heading = Dwójokšacowu awtentifikaciju znjemóžniś?
tfa-row-disable-modal-confirm = Znjemóžniś
tfa-row-disable-modal-explain-1 =
    Njamóžośo toś tu akciju anulěrowaś. Maśo teke
    móžnosć <linkExternal>swóje kody za zawěsćeńsku awtentifikaciju wuměniś</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Dwójokšacowa awtentifikacija jo se znjemóžniła
tfa-row-cannot-disable-2 = Dwójokšacowa awtentifikacija njedajo se znjemóžniś
tfa-row-verify-session-info = Musyśo swójo aktualne pósejźenje wobkšuśiś, aby toś dwójokšacowu awtentifikaciju konfigurěrował

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Gaž pókšacujośo, zwólijośo do:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Wužywańske wuměnenja</mozSubscriptionTosLink> a <mozSubscriptionPrivacyLink>Powěźeńka priwatnosći</mozSubscriptionPrivacyLink> abonementowych słužbow { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>Wužywańske wuměnjenja</mozillaAccountsTos> a <mozillaAccountsPrivacy>powěźeńki priwatnosći</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Gaž pókšacujośo, zwólijośo do <mozillaAccountsTos>wužywańskich wuměnjenjow</mozillaAccountsTos> a <mozillaAccountsPrivacy>powěźeńki priwatnosći</mozillaAccountsPrivacy>

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = abo
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Pśizjawiś z
continue-with-google-button = Dalej z { -brand-google }
continue-with-apple-button = Dalej z { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Njeznate konto
auth-error-103 = Wopacne gronidło
auth-error-105-2 = Njepłaśiwy wobkšuśeński kod
auth-error-110 = Njepłaśiwy token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Sćo to pśecesto wopytał. Wopytajśo pšosym pózdźej hyšći raz.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Sćo wopytał to pśecesto. Wopytajśo za { $retryAfter } hyšći raz.
auth-error-125 = Napšašowanje jo se z pśicynow wěstoty zablokěrowało
auth-error-129-2 = Sćo zapódał njepłaśiwy telefonowy numer. Pšosym pśeglědujśo jen a wopytajśo hyšći raz.
auth-error-138-2 = Njewobkšuśone pósejźenje
auth-error-139 = Druga e-mailowa adresa musy se wót adrese wašogo konta rozeznaś
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Toś ta e-mailowa adresa jo drugemu kontoju wuměnjona. Wopytajśo pózdźej hyšći raz abo wužywajśo drugu e-mailowu adresu.
auth-error-155 = TOTP-token njejo se namakał
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Awtentifikaciski kod za zawěsćenje njejo se namakał
auth-error-159 = Njepłaśiwy kontowy wótnowjeński kluc
auth-error-183-2 = Njepłaśiwy abo spadnjony wobkšuśeński kod
auth-error-202 = Funkcija njejo zmóžnjona
auth-error-203 = System njestoj k dispoziciji, wopytajśo za krotki cas hyšći raz
auth-error-206 = Njejo móžno gronidło napóraś, dokulaž gronidło jo južo nastajone
auth-error-214 = Numer wótnowjeńskego telefona južo eksistěrujo
auth-error-215 = Numer wótnowjeńskego telefona njeeksistěrujo
auth-error-216 = Limit tekstoweje powěsći dostany
auth-error-218 = Njejo móžno wótnowjeński telefon wótwónoźeś, awtentifikaciske kody za zawěsćenje feluju.
auth-error-219 = Toś ten telefonowy numer jo se zregistrěrował z pśewjele kontami. Pšosym wopytajśo drugi numer.
auth-error-999 = Njewótcakowana zmólka
auth-error-1001 = Pśizjawjeński wopyt pśetergnjony
auth-error-1002 = Pósejźenje jo wótběgnuło. Pśizjawśo se, aby pókšacował.
auth-error-1003 = Local Storage abo cookieje su hyšći znjemóžnjone
auth-error-1008 = Wašo nowe gronidło musy druge byś
auth-error-1010 = Płaśiwe gronidło trjebne
auth-error-1011 = Płaśiwa e-mailowa adresa trjebna
auth-error-1018 = Waša wobkšuśeńska mejlka jo se rowno wrośiła. Jo e-mailowa adresa wopak?
auth-error-1020 = E-mailowa adresa jo wopak napisana? firefox.com jo njepłaśiwa e-mailowa słužba
auth-error-1031 = Musyśo swójo starstwo zapódaś, aby se registrěrował
auth-error-1032 = Musyśo płaśiwe starstwo zapódaś, aby se registrěrował
auth-error-1054 = Njepłaśiwy kod za dwójokšacowu awtentifikaciju
auth-error-1056 = Njepłaśiwy kod za zawěsćeńsku awtentifikaciju
auth-error-1062 = Njepłaśiwe dalejpósrědnjenje
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = E-mailowa adresa jo wopak napisana? { $domain } jo njepłaśiwa e-mailowa słužba
auth-error-1066 = E-mailowe maski njedaju se za napóranje konta wužywaś.
auth-error-1067 = Sćo e-mailowu adresu wopak napisał?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Numer, kótaryž se na { $lastFourPhoneNumber } kóńcy.
oauth-error-1000 = Něco njejo se raźiło. Pšosym zacyńśo toś ten rejtarik a wopytajśo hyšći raz.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Sćo pla { -brand-firefox } pśizjawjony
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-mailowa adresa jo se wobkšuśiła
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Pśizjawjenje jo se wobkšuśiło
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Pśizjawśo se pla toś togo { -brand-firefox }, aby zarědowanje dokóńcył
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Pśizjawiś
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Cośo dalšne rědy pśidaś? Pśizjawśo se pla { -brand-firefox }, na drugem rěźe, aby zarědowanje dokóńcył
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Pśizjawśo se pla { -brand-firefox }, na drugem rěźe, aby zarědowanje dokóńcył
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Cośo swóje rejtariki, cytańske znamjenja a gronidła na drugem rěźe dostaś?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Z drugim rědom zwězaś
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Nic něnto
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Pśizjawśo se pla { -brand-firefox } za Android, aby zarědowanje dokóńcył
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Pśizjawśo se pla { -brand-firefox } za iOS, aby zarědowanje dokóńcył

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Local storage a cookieje su trjebne
cookies-disabled-enable-prompt-2 = Pšosym zmóžniśo cookieje a lokalny składowak we wašom wobglědowaku, aby pśistup ku { -product-mozilla-account(case: "dat", capitalization: "lower") } měł. To funkcije zmóžnja, ako na pśikład markowanje pśez pósejźenja.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Hyšći raz wopytaś
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Dalšne informacije

## Index / home page

index-header = Zapódajśo swóju e-mailowu adresu
index-sync-header = Dalej k swójomu kontoju { -product-mozilla-account }
index-sync-subheader = Synchronizěrujśo swóje gronidła, rejtariki a cytańske znamjenja wšuźi, źož { -brand-firefox } wužywaśo.
index-relay-header = E-mailowu masku napóraś
index-relay-subheader = Pšosym pódajśo e-mailowu adresu, na kótaruž cośo mejlki wót swójeje maskěrowaneje e-maile dalej pósrědniś.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Dalej k { $serviceName }
index-subheader-default = Dalej ku kontowym nastajenjam
index-cta = Registrěrowaś abo pśizjawiś
index-account-info = Konto { -product-mozilla-account } teke pśistup k wěcej produktam šćita datow wót { -brand-mozilla } zmóžnja.
index-email-input =
    .label = Zapódajśo swóju e-mailowu adresu
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Konto jo se wuspěšnje wulašowało
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Waša wobkšuśeńska mejlka jo se rowno wrośiła. Jo e-mailowa adresa wopak?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Hopla! Njejsmy mógli waš kontowy wótnowjeński kluc napóraś. Pšosym wopytajśo pózdźej hyšći raz.
inline-recovery-key-setup-recovery-created = Kontowy wótnowjeński kluc jo se napórał
inline-recovery-key-setup-download-header = Zawěsććo swójo konto
inline-recovery-key-setup-download-subheader = Ześěgniśo a składujśo jen něnto
inline-recovery-key-setup-download-info = Składujśo toś ten kluc na městnje, na kótarež se dopominaśo – njamóžośo se k toś tomu bokoju pózdźej wrośiś.
inline-recovery-key-setup-hint-header = Wěstotne pórucenje

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Instalaciju pśetergnuś
inline-totp-setup-continue-button = Dalej
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Pominajśo awtentifikaciske kody z jadnogo z <authenticationAppsLink>toś tych awtentifikaciskich nałoženjow</authenticationAppsLink>, aby pśidał swójomu kontoju wěstotnu rowninu.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Zmóžniśo dwójokšacowu awtentifikaciju, <span>aby z kontowymi nastajenjami pókšacował</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Zmóžniśo dwójokšacowu awtentifikaciju, <span>aby z { $serviceName } pókšacował</span>
inline-totp-setup-ready-button = Gótowo
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scannujśo awtentifikaciski kod, <span>aby z { $serviceName } pókšacował</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Zapódajśo kod z ruku, <span>aby z { $serviceName } pókšacował</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scannujśo awtentifikaciski kod, <span>aby z kontowymi nastajenjami pókšacował</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Zapódajśo kod z ruku, <span>aby z kontowymi nastajenjami pókšacował</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Zapódajśo toś ten pótajmny kluc do swójogo awtentifikaciskego nałoženja. <toggleToQRButton>QR-kod město togo scannowaś?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scannujśo QR-kod w swójom awtentifikaciskem nałoženju a zapódajśo pón awtentifikaciski kod, kótaryž se k dispoziciji staja. <toggleToManualModeButton>Njamóžośo kod scannowaś?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Gaž proces jo dokóńcony, se awtentificěrowańske kody napóraju, kótarež móžośo zapódaś.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Awtentificěrowański kod
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Awtentifikaciski kod trjebny
tfa-qr-code-alt = Wužywajśo kod { $code }, aby zarědował dwukšacowu awtentifikaciju w pódpěranych nałoženjach.
inline-totp-setup-page-title = Dwójokšacowa awtentifikacija

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Pšawniske
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Wužywańske wuměnjenja
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Powěźeńka priwatnosći

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Powěźeńka priwatnosći

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Wužywańske wuměnjenja

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Sćo se rowno pśizjawił pla { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Jo, rěd pśizwóliś
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Jolic njejsćo to był wy, <link>změńśo swójo gronidło</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Rěd jo zwězany
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Synchronizěrujośo něnto z: { $deviceFamily } na { $deviceOS }
pair-auth-complete-sync-benefits-text = Něnto maśo pśistup k swójim wócynjonym rejtarikam, gronidłam a cytańskim znamjenjam na wšych swójich rědach.
pair-auth-complete-see-tabs-button = Rejtariki ze synchronizěrowanych rědow pokazaś
pair-auth-complete-manage-devices-link = Rědy zastojaś

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Zapódajśo awtentifikaciski kod, <span>aby z kontowymi nastajenjami pókšacował</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Zapódajśo awtentifikaciski kod, <span>aby z { $serviceName } pókšacował</span>
auth-totp-instruction = Wócyńśo swójo awtentificěrowańske nałoženje a zapódajśo k dispoziciji stajony awtentifikaciski kod.
auth-totp-input-label = 6-městnowy kod zapódaś
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Wobkšuśiś
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Awtentifikaciski kod trjebny

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Pśizwólenje jo něnto <span>wót wašogo drugego rěda</span> trjebne

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Koplowanje njejo se raźiło
pair-failure-message = Instalěrowański proces jo se skóńcył.

## Pair index page

pair-sync-header = Synchronizěrujśo { -brand-firefox } na swójom telefonje abo tableśe
pair-cad-header = { -brand-firefox } na drugem rěźe zwězaś
pair-already-have-firefox-paragraph = Maśo južo { -brand-firefox } na telefonje abo tableśe?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synchronizěrujśo swój rěd
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Abo ześěgniśo
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scannujśo jen, aby { -brand-firefox } za mobilny rěd ześěgnuł, abo sćelśo se <linkExternal>ześěgnjeński wótkaz</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Nic něnto
pair-take-your-data-message = Wzejśo swóje rejtariki, cytańske znamjenja a gronidła wšuźi, źož { -brand-firefox } wužywaśo.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Prědne kšace
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-kod

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Rěd jo zwězany
pair-success-message-2 = Koplowanje jo se raźiło.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Wobkšuśćo koplowanje <span>za { $email }</span>
pair-supp-allow-confirm-button = Koplowanje wobkšuśiś
pair-supp-allow-cancel-link = Pśetergnuś

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Pśizwólenje jo něnto <span>wót wašogo drugego rěda</span> trjebne

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Z nałoženim koplowaś
pair-unsupported-message = Sćo wužył systemowu kameru? Musyśo w nałoženju { -brand-firefox } koplowaś.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Napórajśo gronidło za synchronizaciju
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = To waše daty koděrujo. Musy se wót kontowego gronidła { -brand-google } abo { -brand-apple } rozeznaś.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Pšosym cakajśo, buźośo se k awtorizěrowanemu nałoženjeju dalej pósrědnjaś.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Zapódajśo swój kontowy wótnowjeński kluc
account-recovery-confirm-key-instruction = Toś ten kluc waše skoděrowane pśeglědowańske daty, na pśikład gronidła a cytańske znamjenja, ze serwerow { -brand-firefox } wótnowja.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Zapódajśo swój 32-znamjenjowy kontowy wótnowjeński kluc
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Waš składowański pokaz jo:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Dalej
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Njamóžośo swój kontowy wótnowjeński kluc namakaś?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Nowe gronidło napóraś
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Gronidło jo se nastajiło
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Bóžko jo nastał problem pśi stajanju wašogo gronidła
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Kontowy wótnowjeński kluc wužywaś
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Wašo gronidło jo se slědk stajiło.
reset-password-complete-banner-message = Njezabywajśo nowy kontowy wótnowjeński kluc ze swójich nastajenjow { -product-mozilla-account } generěrowaś, aby pśiducym pśizjawjeńskim problemam zajźował.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } buźo was slědk słaś, aby pó pśizjawjenju e-mailowu masku wužywał.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = 10-městnowy kod zapódaś
confirm-backup-code-reset-password-confirm-button = Wobkšuśiś
confirm-backup-code-reset-password-subheader = Zapódajśo kod za zawěsćeńsku awtentifikaciju
confirm-backup-code-reset-password-instruction = Zapódajśo jaden z kodow za jadnorazowe wužywanje, gaž dwójokšacowu awtentifikaciju konfigurěrujośo.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Sćo se wuzamknuł?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Pséglědajśo swóju e-mail
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Smy pósłali wobkšuśeński kod do <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Zapódajśo 8-městnowy kod za 10 minutow
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Dalej
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Kod znowego słaś
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Wužywajśo druge konto

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Stajśo swójo gronidło slědk
confirm-totp-reset-password-subheader-v2 = Zapódajśo kod za dwójokšacowu awtentifikaciju
confirm-totp-reset-password-instruction-v2 = Zmóžniśo swójo <strong>nałoženje awtentificěrowanja</strong>, aby swójo gronidło slědk stajił.
confirm-totp-reset-password-trouble-code = Maśo problemy pśi zapódawanju koda?
confirm-totp-reset-password-confirm-button = Wobkšuśiś
confirm-totp-reset-password-input-label-v2 = 6-městnowy kod zapódaś
confirm-totp-reset-password-use-different-account = Druge konto wužywaś

## ResetPassword start page

password-reset-flow-heading = Stajśo swójo gronidło slědk
password-reset-body-2 =
    Pšašamy se za někotarymi wěcami, kótarež jano wy wěsćo, aby my wašo konto
    wěste źaržali.
password-reset-email-input =
    .label = Zapódajśo swóju e-mailowu adresu
password-reset-submit-button-2 = Dalej

## ResetPasswordConfirmed

reset-password-complete-header = Wašo gronidło jo se slědk stajiło
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Dalej k { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Stajśo swójo gronidło slědk
password-reset-recovery-method-subheader = Wubjeŕśo wótnowjeńsku metodu
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Pśeznańśo se, až wy swóje wótnowjeńske metody wužywaśo.
password-reset-recovery-method-phone = Wótnowjeński telefon
password-reset-recovery-method-code = Kody za zawěsćeńsku awtentifikaciju
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kod zwóstawajucy
        [two] { $numBackupCodes } koda zwóstawajucej
        [few] { $numBackupCodes } kody zwóstawajuce
       *[other] { $numBackupCodes } kody zwóstawajuce
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Pśi słanju koda na waš wótnowjeński telefon jo problem nastał
password-reset-recovery-method-send-code-error-description = Pšosym wopytajśo pózdźej hyšći raz abo wužywajśo swóje awtentifikaciske kody za zawěsćenje.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Stajśo swójo gronidło slědk
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Wótnowjeński kod zapódaś
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = 6-městnowy kod jo se pósłał na telefonowy numer, kótaryž se na <span>{ $lastFourPhoneDigits }</span> kóńcy. Toś ten kod za 5 minutow płaśiwosć zgubijo. Njedajśo nikomu toś ten kod k wěsći.
reset-password-recovery-phone-input-label = 6-městnowy kod zapódaś
reset-password-recovery-phone-code-submit-button = Wobkšuśiś
reset-password-recovery-phone-resend-code-button = Kod znowego słaś
reset-password-recovery-phone-resend-success = Kod jo se pósłał
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Sćo se wuzamknuł?
reset-password-recovery-phone-send-code-error-heading = Pśi słanju koda jo problem nastał
reset-password-recovery-phone-code-verification-error-heading = Pśi pśeglědowanju wašogo koda jo problem nastał
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Wopytajśo pšosym pózdźej hyšći raz.
reset-password-recovery-phone-invalid-code-error-description = Kod jo njepłaśiwy abo zestarjety.
reset-password-recovery-phone-invalid-code-error-link = Awtentifikaciske kody za zawěsćenje město togo wužywaś?
reset-password-with-recovery-key-verified-page-title = Gronidło jo se wuspěšnje slědk stajiło
reset-password-complete-new-password-saved = Nowe gronidło jo se składło!
reset-password-complete-recovery-key-created = Nowy kontowy wótnowjeński kluc jo se napórał. Ześěgniśo a składujśo jen něnto.
reset-password-complete-recovery-key-download-info =
    Toś ten kluc jo bytostny za
    datowe wótnowjenje, jolic swójo gronidło zabywaśo. <b>Ześěgniśo a składujśo jen něnto wěsće
    dokulaž pózdźej k toś tomu bokoju wěcej pśistup njamaśo.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Zmólka:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Pśizjawjenje se wobkšuśijo…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Wobkšuśeńska zmólka
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Wobkšuśeński wótkaz jo pśepadnuł
signin-link-expired-message-2 = Wótkaz, na kótaryž sćo kliknuł, jo spadnjony abo jo se južo wužywał.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Zapódajśo swójo gronidło <span>za swójo { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Dalej k { $serviceName }
signin-subheader-without-logo-default = Dalej ku kontowym nastajenjam
signin-button = Pśizjawiś
signin-header = Pśizjawiś
signin-use-a-different-account-link = Druge konto wužywaś
signin-forgot-password-link = Sćo gronidło zabył?
signin-password-button-label = Gronidło
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } buźo was slědk słaś, aby pó pśizjawjenju e-mailowu masku wužywał.
signin-code-expired-error = Kod jo spadnjony. Pšosym pśizjawśo se znowego.
signin-account-locked-banner-heading = Stajśo swójo gronidło slědk
signin-account-locked-banner-description = Smy zastajali wašo konto, aby was pśed suspektneju aktiwitu šćitali.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Stajśo swójo gronidło slědk, aby se pśizjawił

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Wótkazoju, na kótaryž sćo kliknuł, znamuška feluju, a jo snaź pśez waš e-mailowy program wobškóźony. Kopěrujśo adresu kradosćiwje a wopytajśo hyšći raz.
report-signin-header = Njeawtorizěrowane pśizjawjenje k wěsći daś?
report-signin-body = Sćo mejlku wó wopytanem pśistupu na swójo konto dostał. Cośo toś tu aktiwitu ako suspektnu k wěsći daś?
report-signin-submit-button = Aktiwitu k wěsći daś
report-signin-support-link = Cogodla se to stawa?
report-signin-error = Pśi slanju wašeje rozpšawy jo bóžko nastał problem.
signin-bounced-header = Bóžko jo wašo konto zastajone.
# $email (string) - The user's email.
signin-bounced-message = Wobkśuśeńska mejlka, kótaruž smy na { $email } pósłali, jo se wrośiła a smy wašo konto zastajili, aby my waše daty { -brand-firefox } šćitali.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Jolic to jo płaśiwa adresa, <linkExternal>informěrujśo nas</linkExternal> a móžomy pomagaś, wašo konto wótwóriś.
signin-bounced-create-new-account = Toś ta e-mailowa wěcej wam njesłuša? Załožćo konto
back = Slědk

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Pśeglědujśo toś to pśizjawjenje, <span>aby z kontowymi nastajenjami pókšacował</span>
signin-push-code-heading-w-custom-service = Pśeglědujśo toś to pśizjawjenje, <span>aby z { $serviceName } pókšacował</span>
signin-push-code-instruction = Pšosym kontrolěrujśo swóje druge rědy a pśizwólśo toś to pśizjawjenje ze swójogo wobglědowaka { -brand-firefox }.
signin-push-code-did-not-recieve = Njejsćo toś tu powěźeńku dostał?
signin-push-code-send-email-link = Kod z e-mailu pósłaś

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Wobkšuśćo swójo pśizjawjenje
signin-push-code-confirm-description = Smy namakali pśizjawjeński wopyt ze slědujucego rěda. Jolic sćo to wy był, pśizwólśo pšosym pśizjawjenje
signin-push-code-confirm-verifying = Pśespytujo se
signin-push-code-confirm-login = Pśizjawjenje wobkšuśiś
signin-push-code-confirm-wasnt-me = Ja njejsom był to, změńśo gronidło.
signin-push-code-confirm-login-approved = Wašo pśizjawjenje jo se pśizwóliło. Pšosym zacyńśo toś to wokno.
signin-push-code-confirm-link-error = Wótkaz jo wobškóźony. Wopytajśo pšosym hyšći raz.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Pśizjawiś
signin-recovery-method-subheader = Wubjeŕśo wótnowjeńsku metodu
signin-recovery-method-details = Pśeznańśo se, až wy swóje wótnowjeńske metody wužywaśo.
signin-recovery-method-phone = Wótnowjeński telefon
signin-recovery-method-code-v2 = Kody za zawěsćeńsku awtentifikaciju
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kod zwóstawajucy
        [two] { $numBackupCodes } koda zwóstawajucej
        [few] { $numBackupCodes } kody zwóstawajuce
       *[other] { $numBackupCodes } kody zwóstawajuce
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Pśi słanju koda na waš wótnowjeński telefon jo problem nastał
signin-recovery-method-send-code-error-description = Pšosym wopytajśo pózdźej hyšći raz abo wužywajśo swóje awtentifikaciske kody za zawěsćenje.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Pśizjawiś
signin-recovery-code-sub-heading = Zapódajśo kod za zawěsćeńsku awtentifikaciju
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Zapódajśo jaden z kodow za jadnorazowe wužywanje, gaž dwójokšacowu awtentifikaciju konfigurěrujośo.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = 10-městnowy kod zapódaś
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Wobkšuśiś
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Wótnowjeński telefon wužywaś
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Sćo se wuzamknuł?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Awtentifikaciski kod za zawěsćenje trjebny
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Pśi słanju koda na waš wótnowjeński telefon jo problem nastał
signin-recovery-code-use-phone-failure-description = Wopytajśo pšosym pózdźej hyšći raz.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Pśizjawiś
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Wótnowjeński kod zapódaś
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Šesćměstnowy kod jo se pósłał na telefonowy numer, kótaryž se na <span>{ $lastFourPhoneDigits }</span> kóńcy. Toś ten kod za 5 minutow płaśiwosć zgubijo. Njedajśo nikomu toś ten kod k wěsći.
signin-recovery-phone-input-label = 6-městnowy kod zapódaś
signin-recovery-phone-code-submit-button = Wobkšuśiś
signin-recovery-phone-resend-code-button = Kod znowego słaś
signin-recovery-phone-resend-success = Kod jo se pósłał
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Sćo se wuzamknuł?
signin-recovery-phone-send-code-error-heading = Pśi słanju koda jo problem nastał
signin-recovery-phone-code-verification-error-heading = Pśi pśeglědowanju wašogo koda jo problem nastał
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Wopytajśo pšosym pózdźej hyšći raz.
signin-recovery-phone-invalid-code-error-description = Kod jo njepłaśiwy abo zestarjety.
signin-recovery-phone-invalid-code-error-link = Awtentifikaciske kody za zawěsćenje město togo wužywaś?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Wuspěšnje pśizjawjeny. Dajo snaź wobgranicowanja, jolic waš wótnowjeński telefon znowego wužywaśo.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Źěkujomy se za wašu stražniwosć
signin-reported-message = Naš team jo powěźeńku dostał. Rozpšawy ako toś ta nam pomagaju, zadobywarje wótwoboraś.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Zapódajśo wobkšuśeński kod <span>za swójo  { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Zapódajśo kod, kótaryž jo se pósłał za 5 minutow na <email>{ $email }</email>.
signin-token-code-input-label-v2 = 6-městnowy kod zapódaś
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Wobkšuśiś
signin-token-code-code-expired = Kod jo spadnuł?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Nowy kod pśez e-mail pósłaś.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Wobkšuśeński kod trjebny
signin-token-code-resend-error = Něco njejo se raźiło. Nowy code njedajo se słaś.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } buźo was slědk słaś, aby pó pśizjawjenju e-mailowu masku wužywał.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Pśizjawiś
signin-totp-code-subheader-v2 = Zapódajśo kod za dwójokšacowu awtentifikaciju
signin-totp-code-instruction-v4 = Zmóžniśo swójo <strong>nałoženje awtentizěrowanja</strong>, aby swójo pśizjawjenje wobkšuśił.
signin-totp-code-input-label-v4 = 6-městnowy kod zapódaś
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Cogodla pšose was wó awtentifikaciju?
signin-totp-code-aal-banner-content = Sćo konfigurěrował dwójokšacowu awtentifikaciju na swójom konśe, ale hyšći njejsćo se pśizjawił z kodom na toś tom rěźe.
signin-totp-code-aal-sign-out = Na toś tom rěźe wótzjawiś
signin-totp-code-aal-sign-out-error = Bóžko jo pśi wótzjawjanju problem nastał
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Wobkšuśiś
signin-totp-code-other-account-link = Wužywajśo druge konto
signin-totp-code-recovery-code-link = Maśo problemy pśi zapódawanju koda?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Awtentifikaciski kod trjebny
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } buźo was slědk słaś, aby pó pśizjawjenju e-mailowu masku wužywał.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Toś to pśizjawjenje awtorizěrowaś
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Pśepytajśo swóju e-mail za awtorizěrowańskim kodom, kótaryž jo se na { $email } pósłał.
signin-unblock-code-input = Awtorizěrowański kod zapódaś
signin-unblock-submit-button = Dalej
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Awtorizěrowański kod trjebny
signin-unblock-code-incorrect-length = Kod awtorizacije musy 8 znamuškow wopśimowaś
signin-unblock-code-incorrect-format-2 = Awtorizaciski kod móžo jano pismiki a/abo licby wopśimowaś
signin-unblock-resend-code-button = Ani w postowem dochaźe ani w spamowem zarědniku? Znowego pósłaś
signin-unblock-support-link = Cogodla se to stawa?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } buźo was slědk słaś, aby pó pśizjawjenju e-mailowu masku wužywał.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Wobkšuśeński kod zapódaś
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Zapódajśo wobkšuśeński kod <span>za swójo { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Zapódajśo kod, kótaryž jo se pósłał za 5 minutow na <email>{ $email }</email>.
confirm-signup-code-input-label = 6-městnowy kod zapódaś
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Wobkšuśiś
confirm-signup-code-sync-button = Synchronizaciju zachopiś
confirm-signup-code-code-expired = Kod jo spadnuł?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Nowy kod pśez e-mail pósłaś.
confirm-signup-code-success-alert = Konto jo se wuspěšnje wobkšuśiło
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Wobkšuśeński kod jo trjebny
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } buźo was slědk słaś, aby pó pśizjawjenju e-mailowu masku wužywał.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Gronidło napóraś
signup-relay-info = Gronidło jo trjebna, aby swóje maskěrowane mejlki wěsće zastojaś a k wěstotnym rědam { -brand-mozilla } pśistup měł.
signup-sync-info = Synchronizěrujśo swóje gronidła, cytańske znamjenja a wěcej wšuźi, źož { -brand-firefox } wužywaśo.
signup-sync-info-with-payment = Synchronizěrujśo swóje gronidła, płaśeńske metody, cytańske znamjenja a wěcej wšuźi, źož { -brand-firefox } wužywaśo.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = E-mailowu adresu změniś

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synchronizacija jo zmóžnjona
signup-confirmed-sync-success-banner = { -product-mozilla-account } wobkšuśone
signup-confirmed-sync-button = Pśeglědowanje zachopiś
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Waše gronidła, płaśeńske metody, adrese, cytańske znamjenja, historija a wěcej daju se wšuźi synchronizěrowaś, źož { -brand-firefox } wužywaśo.
signup-confirmed-sync-description-v2 = Waše gronidła, adrese, cytańske znamjenja, historija a wěcej daju se wšuźi synchronizěrowaś, źož { -brand-firefox } wužywaśo.
signup-confirmed-sync-add-device-link = Drugi rěd pśidaś
signup-confirmed-sync-manage-sync-button = Synchronizaciju zastojaś
signup-confirmed-sync-set-password-success-banner = Gronidło za synchronizaciju napórane
