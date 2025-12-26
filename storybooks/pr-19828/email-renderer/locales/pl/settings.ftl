# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Nowy kod został wysłany na Twój adres e-mail.
resend-link-success-banner-heading = Nowy odnośnik został wysłany na Twój adres e-mail.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Dodaj { $accountsEmail } do kontaktów, aby zapewnić odbiór wiadomości.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Zamknij komunikat
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = 1 listopada nazwa „{ -product-firefox-accounts(case: "nom", capitalization: "lower") }” zostanie zmieniona na „{ -product-mozilla-accounts(case: "nom", capitalization: "lower") }”
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Nadal będziesz się logować przy użyciu tej samej nazwy użytkownika i hasła i nie będzie żadnych innych zmian w produktach, z których korzystasz.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Zmieniliśmy nazwę „{ -product-firefox-accounts(case: "nom", capitalization: "lower") }” na „{ -product-mozilla-accounts(case: "nom", capitalization: "lower") }”. Nadal będziesz się logować przy użyciu tej samej nazwy użytkownika i hasła i nie będzie żadnych innych zmian w produktach, z których korzystasz.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Więcej informacji
# Alt text for close banner image
brand-close-banner =
    .alt = Zamknij komunikat
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo „m” { -brand-mozilla(case: "gen") }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Wstecz
button-back-title = Wstecz

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Pobierz i kontynuuj
    .title = Pobierz i kontynuuj
recovery-key-pdf-heading = Klucz odzyskiwania konta
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Utworzono: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Klucz odzyskiwania konta
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Ten klucz umożliwia odzyskanie zaszyfrowanych danych przeglądarki (w tym haseł, zakładek i historii), jeśli zapomnisz hasła. Przechowuj go w miejscu, które zapamiętasz.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Miejsca, w których można zachować klucz
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Więcej informacji o kluczu odzyskiwania konta
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Przepraszamy, wystąpił problem podczas pobierania klucza odzyskiwania konta.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Więcej od { -brand-mozilla(case: "gen") }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Najnowsze aktualności i informacje o produktach
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Wczesny dostęp do testowania nowych produktów
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Wezwania do działań mających na celu odzyskanie Internetu

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Pobrano
datablock-copy =
    .message = Skopiowano
datablock-print =
    .message = Wydrukowano

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Skopiowano kod
       *[other] Skopiowano kody
    }
datablock-download-success =
    { $count ->
        [one] Pobrano kod
       *[other] Pobrano kody
    }
datablock-print-success =
    { $count ->
        [one] Wydrukowano kod
       *[other] Wydrukowano kody
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Skopiowano

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (przybliżone)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (przybliżone)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (przybliżone)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (przybliżone)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Nieznane położenie
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } w systemie { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Adres IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Hasło
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Powtórz hasło
form-password-with-inline-criteria-signup-submit-button = Utwórz konto
form-password-with-inline-criteria-reset-new-password =
    .label = Nowe hasło
form-password-with-inline-criteria-confirm-password =
    .label = Potwierdź hasło
form-password-with-inline-criteria-reset-submit-button = Utwórz nowe hasło
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Hasło
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Powtórz hasło
form-password-with-inline-criteria-set-password-submit-button = Zacznij synchronizować
form-password-with-inline-criteria-match-error = Hasła są niezgodne
form-password-with-inline-criteria-sr-too-short-message = Hasło musi mieć co najmniej 8 znaków.
form-password-with-inline-criteria-sr-not-email-message = Hasło nie może zawierać Twojego adresu e-mail.
form-password-with-inline-criteria-sr-not-common-message = Hasło nie może być często używanym hasłem.
form-password-with-inline-criteria-sr-requirements-met = Wpisane hasło spełnia wszystkie wymagania.
form-password-with-inline-criteria-sr-passwords-match = Wpisane hasła są zgodne.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = To pole jest wymagane

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Wpisz { $codeLength }-cyfrowy kod, aby kontynuować
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Wpisz { $codeLength }-znakowy kod, aby kontynuować

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Klucz odzyskiwania konta { -brand-firefox(case: "gen") }
get-data-trio-title-backup-verification-codes = Zapasowe kody uwierzytelniania
get-data-trio-download-2 =
    .title = Pobierz
    .aria-label = Pobierz
get-data-trio-copy-2 =
    .title = Kopiuj
    .aria-label = Kopiuj
get-data-trio-print-2 =
    .title = Drukuj
    .aria-label = Drukuj

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Powiadomienie
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Uwaga
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Ostrzeżenie
authenticator-app-aria-label =
    .aria-label = Aplikacja uwierzytelniająca
backup-codes-icon-aria-label-v2 =
    .aria-label = Włączono zapasowe kody uwierzytelniania
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Wyłączono zapasowe kody uwierzytelniania
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Włączono SMS-y odzyskiwania
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Wyłączono SMS-y odzyskiwania
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Flaga kanadyjska
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Zaznaczone
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Powodzenie
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Włączone
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Zamknij komunikat
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kod
error-icon-aria-label =
    .aria-label = Błąd
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informacje
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Flaga USA

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Komputer i telefon komórkowy ze złamanymi serduszkami
hearts-verified-image-aria-label =
    .aria-label = Komputer i telefon komórkowy z bijącymi serduszkami
signin-recovery-code-image-description =
    .aria-label = Dokument zawierający ukryty tekst.
signin-totp-code-image-label =
    .aria-label = Urządzenie z ukrytym sześciocyfrowym kodem.
confirm-signup-aria-label =
    .aria-label = Koperta zawierająca odnośnik
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Rysunek przedstawiający klucz odzyskiwania konta.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Rysunek przedstawiający klucz odzyskiwania konta.
password-image-aria-label =
    .aria-label = Ilustracja przedstawiająca wpisywanie hasła.
lightbulb-aria-label =
    .aria-label = Rysunek przedstawiający tworzenie wskazówki o miejscu przechowywania.
email-code-image-aria-label =
    .aria-label = Rysunek przedstawiający wiadomość e-mail zawierającą kod.
recovery-phone-image-description =
    .aria-label = Telefon odbierający kod SMS-em.
recovery-phone-code-image-description =
    .aria-label = Kod odebrany na telefonie.
backup-recovery-phone-image-aria-label =
    .aria-label = Telefon z możliwością wysyłania i odbierania wiadomości SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Ekran urządzenia z kodami
sync-clouds-image-aria-label =
    .aria-label = Chmury z ikoną synchronizacji
confetti-falling-image-aria-label =
    .aria-label = Animowane spadające konfetti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Zalogowano do { -brand-firefox(case: "gen") }.
inline-recovery-key-setup-create-header = Zabezpiecz swoje konto
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Masz chwilę, aby zabezpieczyć swoje dane?
inline-recovery-key-setup-info = Utwórz klucz odzyskiwania konta, dzięki któremu będzie możliwość odzyskania synchronizowanych danych przeglądania, jeśli kiedykolwiek zapomnisz hasła.
inline-recovery-key-setup-start-button = Utwórz klucz odzyskiwania konta
inline-recovery-key-setup-later-button = Zrób to później

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Ukryj hasło
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Pokaż hasło
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Twoje hasło jest obecnie widoczne na ekranie.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Twoje hasło jest obecnie ukryte.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Twoje hasło jest teraz widoczne na ekranie.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Twoje hasło jest teraz ukryte.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Wybierz kraj
input-phone-number-enter-number = Wpisz numer telefonu
input-phone-number-country-united-states = Stany Zjednoczone
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Wstecz

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Odnośnik do zmiany hasła jest uszkodzony
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Odnośnik potwierdzenia jest uszkodzony
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Uszkodzony odnośnik
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = W klikniętym odnośniku brakuje znaków. Mógł on zostać uszkodzony przez klienta poczty. Starannie skopiuj adres i spróbuj ponownie.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Wyślij nowy odnośnik

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Pamiętasz hasło?
# link navigates to the sign in page
remember-password-signin-link = Zaloguj się

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Główny adres e-mail został już potwierdzony
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Już potwierdzono logowanie
confirmation-link-reused-message = Ten odnośnik potwierdzenia został już użyty, a może być używany tylko raz.

## Locale Toggle Component

locale-toggle-select-label = Wybierz język
locale-toggle-browser-default = Domyślny język przeglądarki
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Błędne żądanie

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = To hasło jest potrzebne, aby uzyskać dostęp do wszystkich zaszyfrowanych danych przechowywanych u nas.
password-info-balloon-reset-risk-info = Zmiana hasła oznacza, że możliwa jest utrata danych, takich jak hasła i zakładki.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Wybierz silne hasło, którego wcześniej nie używano na innych witrynach. Upewnij się, że spełnia ono wymagania bezpieczeństwa:
password-strength-short-instruction = Wybierz silne hasło:
password-strength-inline-min-length = Musi mieć co najmniej 8 znaków
password-strength-inline-not-email = Nie może być Twoim adresem e-mail
password-strength-inline-not-common = Nie może być często używanym hasłem
password-strength-inline-confirmed-must-match = Potwierdzenie zgadza się z nowym hasłem
password-strength-inline-passwords-match = Hasła są zgodne

## Notification Promo Banner component

account-recovery-notification-cta = Utwórz
account-recovery-notification-header-value = Nie strać swoich danych, jeśli zapomnisz hasła
account-recovery-notification-header-description = Utwórz klucz odzyskiwania konta, aby odzyskać synchronizowane dane przeglądania, jeśli kiedykolwiek zapomnisz hasła.
recovery-phone-promo-cta = Dodaj telefon odzyskiwania
recovery-phone-promo-heading = Dodaj dodatkową ochronę do swojego konta za pomocą telefonu odzyskiwania
recovery-phone-promo-description = Teraz możesz logować się za pomocą jednorazowego hasła otrzymanego SMS-em, jeśli nie możesz skorzystać z aplikacji uwierzytelniania dwuetapowego.
recovery-phone-promo-info-link = Więcej informacji o odzyskiwania i ryzyku podmiany karty SIM
promo-banner-dismiss-button =
    .aria-label = Zamknij komunikat

## Ready component

ready-complete-set-up-instruction = Dokończ konfigurację wprowadzając nowe hasło na pozostałych urządzeniach z { -brand-firefox(case: "ins") }.
manage-your-account-button = Zarządzaj kontem
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Można teraz używać usługi { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Można teraz używać ustawień konta
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Konto jest gotowe!
ready-continue = Kontynuuj
sign-in-complete-header = Potwierdzono logowanie
sign-up-complete-header = Potwierdzono konto
primary-email-verified-header = Potwierdzono główny adres e-mail

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Miejsca, w których można zachować klucz:
flow-recovery-key-download-storage-ideas-folder-v2 = Folder na zabezpieczonym urządzeniu
flow-recovery-key-download-storage-ideas-cloud = Zaufany serwis do przechowywania plików
flow-recovery-key-download-storage-ideas-print-v2 = Wydrukowana kartka
flow-recovery-key-download-storage-ideas-pwd-manager = Menedżer haseł

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Dodaj wskazówkę, która pomoże Ci znaleźć klucz
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Ta wskazówka powinna być pomocna przy szukaniu klucza odzyskiwania konta. Możemy pokazać Ci ją podczas zmiany hasła, aby odzyskać Twoje dane.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Wpisz wskazówkę (opcjonalnie)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Dokończ
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Wskazówka nie może mieć więcej niż 254 znaki.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Wskazówka nie może zawierać niebezpiecznych znaków Unicode. Dozwolone są tylko litery, cyfry, znaki interpunkcyjne i symbole.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Ostrzeżenie
password-reset-chevron-expanded = Ukryj ostrzeżenie
password-reset-chevron-collapsed = Pokaż ostrzeżenie
password-reset-data-may-not-be-recovered = Dane Twojej przeglądarki mogą nie zostać odzyskane
password-reset-previously-signed-in-device-2 = Masz jakieś urządzenie, na którym wcześniej się logowano?
password-reset-data-may-be-saved-locally-2 = Dane Twojej przeglądarki mogą być zachowane na tym urządzeniu. Zmień hasło, a następnie zaloguj się na nim, aby odzyskać i zsynchronizować dane.
password-reset-no-old-device-2 = Masz nowe urządzenie, ale nie masz dostępu do żadnego z poprzednich?
password-reset-encrypted-data-cannot-be-recovered-2 = Przepraszamy, ale nie można odzyskać zaszyfrowanych danych Twojej przeglądarki znajdujących się na serwerach { -brand-firefox(case: "gen") }.
password-reset-warning-have-key = Masz klucz odzyskiwania konta?
password-reset-warning-use-key-link = Użyj go teraz, aby zmienić hasło i zachować swoje dane

## Alert Bar

alert-bar-close-message = Zamknij komunikat

## User's avatar

avatar-your-avatar =
    .alt = Twój awatar
avatar-default-avatar =
    .alt = Domyślny awatar

##


# BentoMenu component

bento-menu-title-3 = Produkty { -brand-mozilla(case: "gen") }
bento-menu-tagline = Więcej produktów od { -brand-mozilla(case: "gen") }, które chronią Twoją prywatność
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Przeglądarka { -brand-firefox } na komputery
bento-menu-firefox-mobile = Przeglądarka { -brand-firefox } na telefon
bento-menu-made-by-mozilla = Tworzone przez { -brand-mozilla(case: "acc") }

## Connect another device promo

connect-another-fx-mobile = Pobierz { -brand-firefox(case: "acc") } na telefon lub tablet
connect-another-find-fx-mobile-2 = Znajdź { -brand-firefox(case: "acc") } w { -google-play } lub { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Pobierz { -brand-firefox(case: "acc") } z { -google-play }
connect-another-app-store-image-3 =
    .alt = Pobierz { -brand-firefox(case: "acc") } na { -app-store }

## Connected services section

cs-heading = Połączone usługi
cs-description = Wszystko, czego używasz i do czego zalogowano.
cs-cannot-refresh =
    Przepraszamy, wystąpił problem podczas odświeżania
    listy połączonych usług.
cs-cannot-disconnect = Nie odnaleziono klienta, nie można rozłączyć
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Wylogowano z usługi { $service }
cs-refresh-button =
    .title = Odśwież połączone usługi
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Brak elementu lub jakieś są podwójne?
cs-disconnect-sync-heading = Rozłącz synchronizację

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Dane przeglądania pozostaną na urządzeniu <span>{ $device }</span>,
    ale nie będzie ono już synchronizowane z tym kontem.
cs-disconnect-sync-reason-3 = Jaki jest główny powód rozłączenia urządzenia <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Urządzenie jest:
cs-disconnect-sync-opt-suspicious = Podejrzane
cs-disconnect-sync-opt-lost = Zgubione lub skradzione
cs-disconnect-sync-opt-old = Stare lub wymienione
cs-disconnect-sync-opt-duplicate = Podwójne
cs-disconnect-sync-opt-not-say = Nie chcę powiedzieć

##

cs-disconnect-advice-confirm = OK
cs-disconnect-lost-advice-heading = Rozłączono zgubione lub skradzione urządzenie
cs-disconnect-lost-advice-content-3 = Ponieważ urządzenie zostało zgubione lub skradzione, w celu zachowania bezpieczeństwa swoich danych należy zmienić hasło { -product-mozilla-account(case: "gen", capitalization: "lower") } w ustawieniach konta. Należy także poszukać informacji o możliwości zdalnego usunięcia danych u producenta urządzenia.
cs-disconnect-suspicious-advice-heading = Rozłączono podejrzane urządzenie
cs-disconnect-suspicious-advice-content-2 = Jeśli rozłączane urządzenie jest rzeczywiście podejrzane, należy zmienić hasło { -product-mozilla-account(case: "acc", capitalization: "lower") } w ustawieniach konta, aby zapewnić bezpieczeństwo swoich danych. Należy także zmienić wszystkie inne hasła zachowane w { -brand-firefox(case: "loc") }, wpisując about:logins na pasku adresu.
cs-sign-out-button = Wyloguj się

## Data collection section

dc-heading = Zbieranie i wykorzystywanie danych
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Przeglądarka { -brand-firefox }
dc-subheader-content-2 = Pozwól { -product-mozilla-accounts(case: "dat", capitalization: "lower") } wysyłać dane techniczne i o interakcjach do { -brand-mozilla(case: "gen") }.
dc-subheader-ff-content = Aby przejrzeć lub zaktualizować ustawienia danych technicznych i o interakcjach przeglądarki { -brand-firefox }, otwórz ustawienia { -brand-firefox(case: "gen") } i przejdź do sekcji „Prywatność i bezpieczeństwo”.
dc-opt-out-success-2 = Pomyślnie zrezygnowano. { -product-mozilla-accounts } nie będą wysyłać danych technicznych i o interakcjach do { -brand-mozilla(case: "gen") }.
dc-opt-in-success-2 = Dzięki! Dzielenie się tymi danymi pomaga nam ulepszać { -product-mozilla-accounts(case: "acc", capitalization: "lower") }.
dc-opt-in-out-error-2 = Przepraszamy, wystąpił problem podczas zmieniania preferencji zbierania danych
dc-learn-more = Więcej informacji

# DropDownAvatarMenu component

drop-down-menu-title-2 = Menu { -product-mozilla-account(case: "gen", capitalization: "lower") }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Zalogowano jako
drop-down-menu-sign-out = Wyloguj się
drop-down-menu-sign-out-error-2 = Przepraszamy, wystąpił problem z wylogowaniem

## Flow Container

flow-container-back = Wstecz

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Wpisz hasło ponownie w celach bezpieczeństwa
flow-recovery-key-confirm-pwd-input-label = Wpisz hasło
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Utwórz klucz odzyskiwania konta
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Utwórz nowy klucz odzyskiwania konta

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Utworzono klucz odzyskiwania konta — teraz pobierz go i zachowaj
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Ten klucz umożliwia odzyskanie danych, jeśli zapomnisz hasła. Pobierz go teraz i zachowaj w miejscu, które zapamiętasz — nie będzie można później wrócić do tej strony.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Kontynuuj bez pobierania

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Utworzono klucz odzyskiwania konta

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Utwórz klucz odzyskiwania konta na wypadek zapomnienia hasła
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Zmień klucz odzyskiwania konta
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Szyfrujemy dane przeglądania — hasła, zakładki i nie tylko. To świetne rozwiązanie w zakresie prywatności, ale oznacza też, że możesz stracić swoje dane, jeśli zapomnisz hasła.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Dlatego tak ważne jest utworzenie klucza odzyskiwania konta — możesz go użyć, aby odzyskać swoje dane.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Zacznij teraz
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Anuluj

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Połącz się ze swoją aplikacją uwierzytelniającą
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>1. krok:</strong> zeskanuj ten kod QR za pomocą dowolnej aplikacji uwierzytelniającej, takiej jak Duo lub Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Kod QR do konfiguracji uwierzytelniania dwuetapowego. Zeskanuj go lub wybierz „Nie możesz zeskanować kodu QR?”, aby zamiast tego uzyskać tajny klucz do konfiguracji.
flow-setup-2fa-cant-scan-qr-button = Nie możesz zeskanować kodu QR?
flow-setup-2fa-manual-key-heading = Wpisz kod ręcznie
flow-setup-2fa-manual-key-instruction = <strong>1. krok:</strong> wpisz ten kod w wybranej aplikacji uwierzytelniającej.
flow-setup-2fa-scan-qr-instead-button = Czy zamiast tego zeskanować kod QR?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Więcej informacji o aplikacjach uwierzytelniających
flow-setup-2fa-button = Kontynuuj
flow-setup-2fa-step-2-instruction = <strong>2. krok:</strong> wpisz kod ze swojej aplikacji uwierzytelniającej.
flow-setup-2fa-input-label = Wpisz sześciocyfrowy kod
flow-setup-2fa-code-error = Nieprawidłowy lub wygasły kod. Sprawdź aplikację uwierzytelniającą i spróbuj ponownie.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Wybierz metodę odzyskiwania
flow-setup-2fa-backup-choice-description = Umożliwia to zalogowanie, jeśli nie masz dostępu do telefonu lub aplikacji uwierzytelniającej.
flow-setup-2fa-backup-choice-phone-title = Telefon odzyskiwania
flow-setup-2fa-backup-choice-phone-badge = Najłatwiejsza
flow-setup-2fa-backup-choice-phone-info = Otrzymaj kod odzyskiwania SMS-em. Obecnie dostępne w USA i Kanadzie.
flow-setup-2fa-backup-choice-code-title = Zapasowe kody uwierzytelniania
flow-setup-2fa-backup-choice-code-badge = Najbezpieczniejsza
flow-setup-2fa-backup-choice-code-info = Utwórz i zapisz jednorazowe kody uwierzytelniania.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Więcej informacji o odzyskiwania i ryzyku podmiany karty SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Wpisz zapasowy kod uwierzytelniania
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Potwierdź zapisanie kodów, wpisując jeden z nich. Bez nich możesz nie być w stanie się zalogować, jeśli nie masz aplikacji uwierzytelniającej.
flow-setup-2fa-backup-code-confirm-code-input = Wpisz 10-znakowy kod
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Dokończ

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Zapisz zapasowe kody uwierzytelniania
flow-setup-2fa-backup-code-dl-save-these-codes = Przechowuj je w miejscu, którego nie zapomnisz. Musisz wpisać jeden z nich, jeśli nie masz dostępu do aplikacji uwierzytelniającej.
flow-setup-2fa-backup-code-dl-button-continue = Kontynuuj

##

flow-setup-2fa-inline-complete-success-banner = Włączono uwierzytelnianie dwuetapowe
flow-setup-2fa-inline-complete-backup-code = Zapasowe kody uwierzytelniania
flow-setup-2fa-inline-complete-backup-phone = Telefon odzyskiwania
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Pozostał { $count } kod
        [few] Pozostały { $count } kody
       *[many] Pozostało { $count } kodów
    }
flow-setup-2fa-inline-complete-backup-code-description = To najbezpieczniejsza metoda odzyskiwania, jeśli nie możesz zalogować się za pomocą telefonu lub aplikacji uwierzytelniającej.
flow-setup-2fa-inline-complete-backup-phone-description = To najłatwiejsza metoda odzyskiwania, jeśli nie możesz zalogować się za pomocą aplikacji uwierzytelniającej.
flow-setup-2fa-inline-complete-learn-more-link = W jaki sposób chroni to Twoje konto
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Przejdź do usługi { $serviceName }
flow-setup-2fa-prompt-heading = Skonfiguruj uwierzytelnianie dwuetapowe
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } wymaga skonfigurowania uwierzytelniania dwuetapowego, aby zapewnić bezpieczeństwo konta.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Aby kontynuować, możesz użyć jednej z <authenticationAppsLink>tych aplikacji uwierzytelniających</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Kontynuuj

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Wpisz kod weryfikacyjny
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Sześciocyfrowy kod został wysłany na numer <span>{ $phoneNumber }</span> za pomocą wiadomości SMS. Ten kod wygasa po 5 minutach.
flow-setup-phone-confirm-code-input-label = Wpisz sześciocyfrowy kod
flow-setup-phone-confirm-code-button = Potwierdź
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Kod wygasł?
flow-setup-phone-confirm-code-resend-code-button = Wyślij ponownie kod
flow-setup-phone-confirm-code-resend-code-success = Wysłano kod
flow-setup-phone-confirm-code-success-message-v2 = Dodano telefon odzyskiwania
flow-change-phone-confirm-code-success-message = Zmieniono telefon odzyskiwania

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Zweryfikuj numer telefonu
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Otrzymasz wiadomość SMS od { -brand-mozilla(case: "gen") } z kodem weryfikującym numer telefonu. Nie udostępniaj tego kodu nikomu.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Telefon odzyskiwania jest dostępny tylko w Stanach Zjednoczonych i Kanadzie. Numery VoIP i maski telefoniczne nie są zalecane.
flow-setup-phone-submit-number-legal = Podając swój numer, zgadzasz się na jego przechowywanie, abyśmy mogli wysłać Ci wiadomość SMS wyłącznie w celu weryfikacji konta. Mogą obowiązywać opłaty za wiadomości i dane komórkowe.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Wyślij kod

## HeaderLockup component, the header in account settings

header-menu-open = Zamknij menu
header-menu-closed = Menu nawigacji witryny
header-back-to-top-link =
    .title = Wróć na górę
header-back-to-settings-link =
    .title = Wróć do ustawień { -product-mozilla-account(case: "gen", capitalization: "lower") }
header-title-2 = { -product-mozilla-account }
header-help = Pomoc

## Linked Accounts section

la-heading = Powiązane konta
la-description = Upoważniono dostęp do poniższych kont.
la-unlink-button = Odwiąż
la-unlink-account-button = Odwiąż
la-set-password-button = Ustaw hasło
la-unlink-heading = Odwiąż od konta innej firmy
la-unlink-content-3 = Czy na pewno odwiązać konto? Nie spowoduje to automatycznego wylogowania z połączonych usług. Aby to zrobić, musisz ręcznie wylogować się w sekcji „Połączone usługi”.
la-unlink-content-4 = Przed odwiązaniem konta musisz ustawić hasło. Bez hasła nie będzie możliwości zalogowania się po odwiązaniu konta.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Zamknij
modal-cancel-button = Anuluj
modal-default-confirm-button = Potwierdź

## ModalMfaProtected

modal-mfa-protected-title = Wpisz kod potwierdzenia
modal-mfa-protected-subtitle = Pomóż nam upewnić się, że to Ty zmieniasz dane swojego konta
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu { $expirationTime } minuty.
        [few] Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu { $expirationTime } minut.
       *[many] Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu { $expirationTime } minut.
    }
modal-mfa-protected-input-label = Wpisz sześciocyfrowy kod
modal-mfa-protected-cancel-button = Anuluj
modal-mfa-protected-confirm-button = Potwierdź
modal-mfa-protected-code-expired = Kod wygasł?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Wyślij nowy.

## Modal Verify Session

mvs-verify-your-email-2 = Potwierdź adres e-mail
mvs-enter-verification-code-2 = Wpisz kod potwierdzenia
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Proszę wpisać kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu 5 minut.
msv-cancel-button = Anuluj
msv-submit-button-2 = Potwierdź

## Settings Nav

nav-settings = Ustawienia
nav-profile = Profil
nav-security = Bezpieczeństwo
nav-connected-services = Połączone usługi
nav-data-collection = Zbieranie i wykorzystywanie danych
nav-paid-subs = Płatne subskrypcje
nav-email-comm = Ustawienia poczty

## Page2faChange

page-2fa-change-title = Zmień uwierzytelnianie dwuetapowe
page-2fa-change-success = Uwierzytelnianie dwuetapowe zostało zaktualizowane
page-2fa-change-totpinfo-error = Wystąpił błąd podczas zmiany aplikacji do uwierzytelniania dwuetapowego. Spróbuj ponownie później.
page-2fa-change-qr-instruction = <strong>1. krok:</strong> zeskanuj ten kod QR za pomocą dowolnej aplikacji uwierzytelniającej, takiej jak Duo lub Google Authenticator. Utworzy to nowe połączenie, a wszystkie poprzednie połączenia przestaną działać.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Zapasowe kody uwierzytelniania
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Wystąpił problem podczas zastępowania zapasowych kodów uwierzytelniania
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Wystąpił problem podczas tworzenia zapasowych kodów uwierzytelniania
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Zaktualizowano zapasowe kody uwierzytelniania
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Utworzono zapasowe kody uwierzytelniania
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Zachowaj je w miejscu, które będziesz pamiętać. Stare kody zostaną zastąpione po wykonaniu następnego kroku.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Potwierdź zapisanie kodów, wprowadzając jeden. Twoje stare zapasowe kody uwierzytelniania zostaną wyłączone po wykonaniu tego kroku.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Niepoprawny zapasowy kod uwierzytelniania

## Page2faSetup

page-2fa-setup-title = Uwierzytelnianie dwuetapowe
page-2fa-setup-totpinfo-error = Wystąpił błąd podczas konfigurowania uwierzytelniania dwuetapowego. Spróbuj ponownie później.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Ten kod jest niepoprawny. Spróbuj ponownie.
page-2fa-setup-success = Uwierzytelnianie dwuetapowe zostało włączone

## Avatar change page

avatar-page-title =
    .title = Zdjęcie profilowe
avatar-page-add-photo = Dodaj zdjęcie
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Zrób zdjęcie
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Usuń zdjęcie
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Zrób zdjęcie jeszcze raz
avatar-page-cancel-button = Anuluj
avatar-page-save-button = Zachowaj
avatar-page-saving-button = Zachowywanie…
avatar-page-zoom-out-button =
    .title = Pomniejsz
avatar-page-zoom-in-button =
    .title = Powiększ
avatar-page-rotate-button =
    .title = Obróć
avatar-page-camera-error = Nie można zainicjować aparatu
avatar-page-new-avatar =
    .alt = nowe zdjęcie profilowe
avatar-page-file-upload-error-3 = Wystąpił problem podczas przesyłania zdjęcia profilowego
avatar-page-delete-error-3 = Wystąpił problem podczas usuwania zdjęcia profilowego
avatar-page-image-too-large-error-2 = Rozmiar pliku obrazu jest za duży, aby można go było wysłać

## Password change page

pw-change-header =
    .title = Zmień hasło
pw-8-chars = Musi mieć co najmniej 8 znaków
pw-not-email = Nie może być Twoim adresem e-mail
pw-change-must-match = Nowe hasło zgadza się z potwierdzeniem
pw-commonly-used = Nie może być często używanym hasłem
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Zachowaj bezpieczeństwo — każdego hasła używaj tylko w jednym miejscu. Przeczytaj o <linkExternal>tworzeniu silnych haseł</linkExternal>.
pw-change-cancel-button = Anuluj
pw-change-save-button = Zachowaj
pw-change-forgot-password-link = Nie pamiętasz hasła?
pw-change-current-password =
    .label = Wpisz obecne hasło
pw-change-new-password =
    .label = Wpisz nowe hasło
pw-change-confirm-password =
    .label = Potwierdź nowe hasło
pw-change-success-alert-2 = Zaktualizowano hasło

## Password create page

pw-create-header =
    .title = Utwórz hasło
pw-create-success-alert-2 = Ustawiono hasło
pw-create-error-2 = Przepraszamy, wystąpił problem z ustawieniem hasła

## Delete account page

delete-account-header =
    .title = Usuń konto
delete-account-step-1-2 = 1. krok z 2
delete-account-step-2-2 = 2. krok z 2
delete-account-confirm-title-4 = { -product-mozilla-account } mogło zostać połączone z co najmniej jednym produktem lub usługą { -brand-mozilla(case: "gen") }, która zapewnia bezpieczeństwo i produktywność w Internecie:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synchronizowanie danych { -brand-firefox(case: "gen") }
delete-account-product-firefox-addons = Dodatki do { -brand-firefox(case: "gen") }
delete-account-acknowledge = Proszę potwierdzić, że usuwając konto:
delete-account-chk-box-2 =
    .label = Zachowane informacje i funkcje w produktach { -brand-mozilla(case: "gen") } mogą zostać utracone
delete-account-chk-box-3 =
    .label = Ponowna aktywacja za pomocą tego adresu e-mail może nie przywrócić zachowanych informacji
delete-account-chk-box-4 =
    .label = Wszystkie rozszerzenia i motywy opublikowane przez Ciebie w serwisie addons.mozilla.org zostaną usunięte
delete-account-continue-button = Kontynuuj
delete-account-password-input =
    .label = Wpisz hasło
delete-account-cancel-button = Anuluj
delete-account-delete-button-2 = Usuń

## Display name page

display-name-page-title =
    .title = Wyświetlana nazwa
display-name-input =
    .label = Wpisz wyświetlaną nazwę
submit-display-name = Zachowaj
cancel-display-name = Anuluj
display-name-update-error-2 = Wystąpił problem podczas aktualizacji wyświetlanej nazwy
display-name-success-alert-2 = Zaktualizowano wyświetlaną nazwę

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Ostatnie działania na koncie
recent-activity-account-create-v2 = Utworzono konto
recent-activity-account-disable-v2 = Wyłączono konto
recent-activity-account-enable-v2 = Włączono konto
recent-activity-account-login-v2 = Rozpoczęto logowanie do konta
recent-activity-account-reset-v2 = Rozpoczęto zmianę hasła
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Wyczyszczono odrzucone wiadomości
recent-activity-account-login-failure = Próba zalogowania się na konto się nie powiodła
recent-activity-account-two-factor-added = Włączono uwierzytelnianie dwuetapowe
recent-activity-account-two-factor-requested = Zażądano uwierzytelniania dwuetapowego
recent-activity-account-two-factor-failure = Uwierzytelnienie dwuetapowe się nie powiodło
recent-activity-account-two-factor-success = Pomyślnie uwierzytelniono dwuetapowo
recent-activity-account-two-factor-removed = Usunięto uwierzytelnianie dwuetapowe
recent-activity-account-password-reset-requested = Konto zażądało zmianę hasła
recent-activity-account-password-reset-success = Pomyślnie zmieniono hasło konta
recent-activity-account-recovery-key-added = Włączono klucz odzyskiwania konta
recent-activity-account-recovery-key-verification-failure = Weryfikacja klucza odzyskiwania konta się nie powiodła
recent-activity-account-recovery-key-verification-success = Pomyślnie zweryfikowano klucz odzyskiwania konta
recent-activity-account-recovery-key-removed = Usunięto klucz odzyskiwania konta
recent-activity-account-password-added = Dodano nowe hasło
recent-activity-account-password-changed = Zmieniono hasło
recent-activity-account-secondary-email-added = Dodano dodatkowy adres e-mail
recent-activity-account-secondary-email-removed = Usunięto dodatkowy adres e-mail
recent-activity-account-emails-swapped = Zamieniono główny i dodatkowy adres e-mail
recent-activity-session-destroy = Wylogowano z sesji
recent-activity-account-recovery-phone-send-code = Wysłano kod na telefon odzyskiwania
recent-activity-account-recovery-phone-setup-complete = Ukończono konfigurację telefonu odzyskiwania
recent-activity-account-recovery-phone-signin-complete = Ukończono logowanie za pomocą telefonu odzyskiwania
recent-activity-account-recovery-phone-signin-failed = Logowanie za pomocą telefonu odzyskiwania się nie powiodło
recent-activity-account-recovery-phone-removed = Usunięto telefon odzyskiwania
recent-activity-account-recovery-codes-replaced = Zastąpiono kody odzyskiwania
recent-activity-account-recovery-codes-created = Utworzono kody odzyskiwania
recent-activity-account-recovery-codes-signin-complete = Ukończono logowanie za pomocą kodów odzyskiwania
recent-activity-password-reset-otp-sent = Wysłano kod potwierdzenia zmiany hasła
recent-activity-password-reset-otp-verified = Zweryfikowano kod potwierdzenia zmiany hasła
recent-activity-must-reset-password = Wymagana jest zmiana hasła
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Inne działanie na koncie

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Klucz odzyskiwania konta
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Wróć do ustawień

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Usuń numer telefonu odzyskiwania
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Spowoduje to usunięcie numeru <strong>{ $formattedFullPhoneNumber }</strong> z listy telefonów odzyskiwania.
settings-recovery-phone-remove-recommend = Zalecamy dalsze korzystanie z tej metody, ponieważ jest łatwiejsza niż zachowywanie zapasowych kodów uwierzytelniania.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Jeśli go usuniesz, upewnij się, że nadal masz zachowane zapasowe kody uwierzytelniania. <linkExternal>Porównaj metody odzyskiwania</linkExternal>
settings-recovery-phone-remove-button = Usuń numer telefonu
settings-recovery-phone-remove-cancel = Anuluj
settings-recovery-phone-remove-success = Usunięto telefon odzyskiwania

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Dodaj telefon odzyskiwania
page-change-recovery-phone = Zmień telefon odzyskiwania
page-setup-recovery-phone-back-button-title = Wróć do ustawień
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Zmień numer telefonu

## Add secondary email page

add-secondary-email-step-1 = 1. krok z 2
add-secondary-email-error-2 = Wystąpił problem podczas tworzenia tego adresu e-mail
add-secondary-email-page-title =
    .title = Dodatkowy adres e-mail
add-secondary-email-enter-address =
    .label = Wpisz adres e-mail
add-secondary-email-cancel-button = Anuluj
add-secondary-email-save-button = Zachowaj
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Maski dla adresu e-mail nie mogą być używane jako dodatkowe adresy e-mail

## Verify secondary email page

add-secondary-email-step-2 = 2. krok z 2
verify-secondary-email-page-title =
    .title = Dodatkowy adres e-mail
verify-secondary-email-verification-code-2 =
    .label = Wpisz kod potwierdzenia
verify-secondary-email-cancel-button = Anuluj
verify-secondary-email-verify-button-2 = Potwierdź
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Proszę wpisać kod potwierdzenia wysłany na adres <strong>{ $email }</strong> w ciągu 5 minut.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Pomyślnie dodano adres { $email }

##

# Link to delete account on main Settings page
delete-account-link = Usuń konto
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Pomyślnie zalogowano. Twoje { -product-mozilla-account(case: "nom", capitalization: "lower") } i dane pozostaną aktywne.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Dowiedz się, gdzie wyciekły Twoje dane osobowe i je odzyskaj
# Links out to the Monitor site
product-promo-monitor-cta = Przeszukaj bezpłatnie

## Profile section

profile-heading = Profil
profile-picture =
    .header = Zdjęcie
profile-display-name =
    .header = Wyświetlana nazwa
profile-primary-email =
    .header = Główny adres e-mail

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = { $currentStep }. krok z { $numberOfSteps }.

## Security section of Setting

security-heading = Bezpieczeństwo
security-password =
    .header = Hasło
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Utworzono { $date }
security-not-set = Nie ustawiono
security-action-create = Utwórz
security-set-password = Ustaw hasło, aby synchronizować i korzystać z części funkcji bezpieczeństwa konta.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Ostatnie działania na koncie
signout-sync-header = Sesja wygasła
signout-sync-session-expired = Coś się nie powiodło. Proszę wylogować się z menu przeglądarki i spróbować ponownie.

## SubRow component

tfa-row-backup-codes-title = Zapasowe kody uwierzytelniania
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Brak dostępnych kodów
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Został { $numCodesAvailable } kod
        [few] Zostały { $numCodesAvailable } kody
       *[many] Zostało { $numCodesAvailable } kodów
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Utwórz nowe kody
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Dodaj
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = To najbezpieczniejsza metoda odzyskiwania, jeśli nie możesz użyć telefonu lub aplikacji uwierzytelniającej.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Telefon odzyskiwania
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nie dodano numeru telefonu
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Zmień
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Dodaj
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Usuń
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Usuń telefon odzyskiwania
tfa-row-backup-phone-delete-restriction-v2 = Jeśli chcesz usunąć telefon odzyskiwania, najpierw dodaj zapasowe kody uwierzytelniania lub wyłącz uwierzytelnianie dwuetapowe, aby uniknąć zablokowania konta.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = To najłatwiejsza metoda odzyskiwania, jeśli nie możesz użyć aplikacji uwierzytelniającej.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Więcej informacji o ryzyku zamiany karty SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Wyłącz
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Włącz
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Wysyłanie…
switch-is-on = włączone
switch-is-off = wyłączone

## Sub-section row Defaults

row-defaults-action-add = Dodaj
row-defaults-action-change = Zmień
row-defaults-action-disable = Wyłącz
row-defaults-status = Brak

## Account recovery key sub-section on main Settings page

rk-header-1 = Klucz odzyskiwania konta
rk-enabled = Włączony
rk-not-set = Nieustawiony
rk-action-create = Utwórz
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Zmień
rk-action-remove = Usuń
rk-key-removed-2 = Usunięto klucz odzyskiwania konta
rk-cannot-remove-key = Nie można usunąć klucza odzyskiwania konta.
rk-refresh-key-1 = Odśwież klucz odzyskiwania konta
rk-content-explain = Przywróć swoje dane, gdy zapomnisz hasła.
rk-cannot-verify-session-4 = Przepraszamy, wystąpił problem podczas potwierdzania sesji
rk-remove-modal-heading-1 = Usunąć klucz odzyskiwania konta?
rk-remove-modal-content-1 =
    W przypadku zmiany hasła nie będzie można użyć klucza odzyskiwania konta
    do uzyskania dostępu do swoich danych. Tego działania nie można cofnąć.
rk-remove-error-2 = Nie można usunąć klucza odzyskiwania konta
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Usuń klucz odzyskiwania konta

## Secondary email sub-section on main Settings page

se-heading = Dodatkowy adres e-mail
    .header = Dodatkowy adres e-mail
se-cannot-refresh-email = Przepraszamy, wystąpił problem podczas odświeżania tego adresu e-mail.
se-cannot-resend-code-3 = Przepraszamy, wystąpił problem podczas ponownego wysyłania kodu potwierdzenia
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } jest teraz głównym adresem e-mail
se-set-primary-error-2 = Przepraszamy, wystąpił problem podczas zmieniania głównego adresu e-mail
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = Pomyślnie usunięto adres { $email }
se-delete-email-error-2 = Przepraszamy, wystąpił problem podczas usuwania tego adresu e-mail
se-verify-session-3 = Musisz potwierdzić obecną sesję, aby wykonać to działanie
se-verify-session-error-3 = Przepraszamy, wystąpił problem podczas potwierdzania sesji
# Button to remove the secondary email
se-remove-email =
    .title = Usuń adres e-mail
# Button to refresh secondary email status
se-refresh-email =
    .title = Odśwież adres e-mail
se-unverified-2 = niepotwierdzony
se-resend-code-2 =
    Wymagane jest potwierdzenie. <button>Wyślij kod potwierdzenia jeszcze raz</button>,
    jeśli nie ma go w Odebranych ani w Niechcianych.
# Button to make secondary email the primary
se-make-primary = Ustaw jako główny
se-default-content = Uzyskaj dostęp do konta, jeśli nie możesz zalogować się na główny adres e-mail.
se-content-note-1 =
    Uwaga: dodatkowy adres e-mail nie przywróci danych — do tego
    potrzebny będzie <a>klucz odzyskiwania konta</a>.
# Default value for the secondary email
se-secondary-email-none = Brak

## Two Step Auth sub-section on Settings main page

tfa-row-header = Uwierzytelnianie dwuetapowe
tfa-row-enabled = Włączone
tfa-row-disabled-status = Wyłączone
tfa-row-action-add = Dodaj
tfa-row-action-disable = Wyłącz
tfa-row-action-change = Zmień
tfa-row-button-refresh =
    .title = Odśwież uwierzytelnianie dwuetapowe
tfa-row-cannot-refresh =
    Przepraszamy, wystąpił problem podczas odświeżania
    uwierzytelniania dwuetapowego.
tfa-row-enabled-description = Twoje konto jest chronione uwierzytelnianiem dwuetapowym. Podczas logowania do { -product-mozilla-account(case: "gen", capitalization: "lower") } będzie trzeba wpisać jednorazowy kod z aplikacji uwierzytelniającej.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = W jaki sposób chroni to Twoje konto
tfa-row-disabled-description-v2 = Zabezpiecz swoje konto, używając aplikacji uwierzytelniającej innej firmy jako drugiego kroku logowania.
tfa-row-cannot-verify-session-4 = Przepraszamy, wystąpił problem podczas potwierdzania sesji
tfa-row-disable-modal-heading = Wyłączyć uwierzytelnianie dwuetapowe?
tfa-row-disable-modal-confirm = Wyłącz
tfa-row-disable-modal-explain-1 =
    Tego działania nie będzie można cofnąć. Można zamiast tego
    <linkExternal>zastąpić zapasowe kody uwierzytelniania</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Uwierzytelnianie dwuetapowe jest wyłączone
tfa-row-cannot-disable-2 = Nie można wyłączyć uwierzytelniania dwuetapowego
tfa-row-verify-session-info = Musisz potwierdzić obecną sesję, aby skonfigurować uwierzytelnianie dwuetapowe

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Kontynuując, wyrażasz zgodę na:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>regulamin usługi</mozSubscriptionTosLink> i <mozSubscriptionPrivacyLink>zasady ochrony prywatności</mozSubscriptionPrivacyLink> usług subskrypcyjnych { -brand-mozilla(case: "gen") }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>regulamin usługi</mozillaAccountsTos> i <mozillaAccountsPrivacy>zasady ochrony prywatności</mozillaAccountsPrivacy> { -product-mozilla-accounts(case: "gen", capitalization: "lower") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Kontynuując, wyrażasz zgodę na <mozillaAccountsTos>regulamin usługi</mozillaAccountsTos> i <mozillaAccountsPrivacy>zasady ochrony prywatności</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Lub
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Zaloguj się za pomocą
continue-with-google-button = Kontynuuj za pomocą konta { -brand-google }
continue-with-apple-button = Kontynuuj za pomocą konta { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Nieznane konto
auth-error-103 = Niepoprawne hasło
auth-error-105-2 = Nieprawidłowy kod potwierdzenia
auth-error-110 = Nieprawidłowy token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Próbowano za wiele razy. Proszę spróbować ponownie później.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Próbowano za wiele razy. Proszę spróbować ponownie { $retryAfter }.
auth-error-125 = Żądanie zostało zablokowane z powodów bezpieczeństwa
auth-error-129-2 = Wprowadzono nieprawidłowy numer telefonu. Sprawdź go i spróbuj ponownie.
auth-error-138-2 = Niepotwierdzona sesja
auth-error-139 = Dodatkowy adres e-mail musi być inny niż adres e-mail konta
auth-error-155 = Nie odnaleziono tokena TOTP
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Nie odnaleziono zapasowego kodu uwierzytelniania
auth-error-159 = Nieprawidłowy klucz odzyskiwania konta
auth-error-183-2 = Kod potwierdzenia jest nieprawidłowy lub wygasł
auth-error-202 = Funkcja jest wyłączona
auth-error-203 = System jest niedostępny, spróbuj ponownie później
auth-error-206 = Nie można utworzyć hasła, hasło jest już ustawione
auth-error-214 = Numer telefonu odzyskiwania już istnieje
auth-error-215 = Numer telefonu odzyskiwania nie istnieje
auth-error-216 = Osiągnięto ograniczenie liczby wiadomości SMS
auth-error-218 = Nie można usunąć telefonu odzyskiwania, brakuje zapasowych kodów uwierzytelniania.
auth-error-219 = Ten numer telefonu został zarejestrowany na zbyt wielu kontach. Spróbuj innego numeru.
auth-error-999 = Nieznany błąd
auth-error-1001 = Anulowano próbę logowania
auth-error-1002 = Sesja wygasła. Zaloguj się, aby kontynuować.
auth-error-1003 = Obsługa lokalnego przechowywania danych lub ciasteczek jest nadal wyłączona
auth-error-1008 = Nowe hasło musi być inne niż poprzednie
auth-error-1010 = Wymagane jest prawidłowe hasło
auth-error-1011 = Wymagany jest prawidłowy adres e-mail
auth-error-1018 = Wiadomość z potwierdzeniem została zwrócona. Błąd w adresie e-mail?
auth-error-1020 = Błędnie wpisany adres e-mail? „firefox.com” nie jest prawdziwym serwisem pocztowym
auth-error-1031 = Należy podać swój wiek przed zarejestrowaniem
auth-error-1032 = Należy podać prawidłowy wiek przed zarejestrowaniem
auth-error-1054 = Nieprawidłowy kod uwierzytelniania dwuetapowego
auth-error-1056 = Nieprawidłowy zapasowy kod uwierzytelniania
auth-error-1062 = Nieprawidłowe przekierowanie
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Błędnie wpisany adres e-mail? „{ $domain }” nie jest prawdziwym serwisem pocztowym
auth-error-1066 = Do utworzenia konta nie można używać masek dla adresu e-mail.
auth-error-1067 = Błąd w adresie e-mail?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Numer kończący się na { $lastFourPhoneNumber }
oauth-error-1000 = Coś się nie powiodło. Proszę zamknąć tę kartę i spróbować ponownie.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Zalogowano do { -brand-firefox(case: "gen") }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Potwierdzono adres e-mail
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Potwierdzono logowanie
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Zaloguj się do tego { -brand-firefox(case: "gen") }, aby dokończyć konfigurację
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Zaloguj się
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Jeszcze dodajesz urządzenia? Zaloguj się do { -brand-firefox(case: "gen") } na innym urządzeniu, aby dokończyć konfigurację
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Zaloguj się do { -brand-firefox(case: "gen") } na innym urządzeniu, aby dokończyć konfigurację
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Chcesz korzystać z kart, zakładek i haseł na innym urządzeniu?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Połącz inne urządzenie
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Nie teraz
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Zaloguj się do { -brand-firefox(case: "gen") } na Androida, aby dokończyć konfigurację
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Zaloguj się do { -brand-firefox(case: "gen") } na iOS, aby dokończyć konfigurację

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Obsługa lokalnego przechowywania danych i ciasteczek jest wymagana
cookies-disabled-enable-prompt-2 = Proszę włączyć obsługę ciasteczek i lokalnego przechowywania danych w przeglądarce, aby uzyskać dostęp do { -product-mozilla-account(case: "gen", capitalization: "lower") }. Dzięki temu włączona zostanie funkcja zapamiętywania użytkownika między sesjami.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Spróbuj ponownie
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Więcej informacji

## Index / home page

index-header = Wpisz adres e-mail
index-sync-header = Przejdź do { -product-mozilla-account(case: "gen", capitalization: "lower") }
index-sync-subheader = Synchronizuj hasła, karty i zakładki wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
index-relay-header = Utwórz maskę dla adresu e-mail
index-relay-subheader = Podaj adres e-mail, na który przekazywać wiadomości z zamaskowanego adresu.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Przejdź do usługi { $serviceName }
index-subheader-default = Przejdź do ustawień konta
index-cta = Zarejestruj się lub zaloguj
index-account-info = { -product-mozilla-account } odblokowuje również dostęp do innych produktów { -brand-mozilla(case: "gen") } chroniących prywatność.
index-email-input =
    .label = Wpisz adres e-mail
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Pomyślnie usunięto konto
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Wiadomość z potwierdzeniem została zwrócona. Błąd w adresie e-mail?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Ups! Nie można utworzyć klucza odzyskiwania konta. Proszę spróbować ponownie później.
inline-recovery-key-setup-recovery-created = Utworzono klucz odzyskiwania konta
inline-recovery-key-setup-download-header = Zabezpiecz swoje konto
inline-recovery-key-setup-download-subheader = Pobierz go teraz i zachowaj
inline-recovery-key-setup-download-info = Zachowaj ten klucz w miejscu, które zapamiętasz — nie będzie można później wrócić do tej strony.
inline-recovery-key-setup-hint-header = Zalecenie dotyczące bezpieczeństwa

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Anuluj konfigurację
inline-totp-setup-continue-button = Kontynuuj
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Dodaj warstwę zabezpieczeń do swojego konta — kody uwierzytelniania z jednej z <authenticationAppsLink>tych aplikacji uwierzytelniających</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Włącz uwierzytelnianie dwuetapowe, <span>aby przejść do ustawień konta</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Włącz uwierzytelnianie dwuetapowe, <span>aby przejść do usługi { $serviceName }</span>
inline-totp-setup-ready-button = Gotowe
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Zeskanuj kod uwierzytelniania, <span>aby przejść do usługi { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Wpisz kod ręcznie, <span>aby przejść do usługi { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Zeskanuj kod uwierzytelniania, <span>aby przejść do ustawień konta</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Wpisz kod ręcznie, <span>aby przejść do ustawień konta</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Wpisz ten tajny klucz w aplikacji uwierzytelniającej. <toggleToQRButton>Czy zamiast tego zeskanować kod QR?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Zeskanuj kod QR w aplikacji uwierzytelniającej, a następnie wpisz podany przez nią kod uwierzytelniania. <toggleToManualModeButton>Nie możesz zeskanować kodu?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Po ukończeniu zacznie tworzyć kody uwierzytelniania, które należy podać.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Kod uwierzytelniania
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Wymagany jest kod uwierzytelniania
tfa-qr-code-alt = Użyj kodu { $code }, aby skonfigurować uwierzytelnianie dwuetapowe w obsługiwanych aplikacjach.
inline-totp-setup-page-title = Uwierzytelnianie dwuetapowe

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Podstawa prawna
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Regulamin usługi
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Zasady ochrony prywatności

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Zasady ochrony prywatności

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Regulamin usługi

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Czy właśnie zalogowano się do { -product-firefox(case: "gen") }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Tak, zatwierdź urządzenie
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Jeśli to nie Ty, <link>zmień hasło</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Połączono urządzenie
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = { $deviceFamily } w systemie { $deviceOS } będzie teraz synchronizowany
pair-auth-complete-sync-benefits-text = Masz teraz dostęp do otwartych kart, haseł i zakładek na wszystkich urządzeniach.
pair-auth-complete-see-tabs-button = Wyświetl karty z synchronizowanych urządzeń
pair-auth-complete-manage-devices-link = Zarządzaj urządzeniami

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Wpisz kod uwierzytelniania, <span>aby przejść do ustawień konta</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Wpisz kod uwierzytelniania, <span>aby przejść do usługi { $serviceName }</span>
auth-totp-instruction = Otwórz aplikację uwierzytelniającą i wpisz podany przez nią kod uwierzytelniania.
auth-totp-input-label = Wpisz sześciocyfrowy kod
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Potwierdź
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Wymagany jest kod uwierzytelniania

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Teraz wymagane jest zatwierdzenie <span>z innego używanego urządzenia</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Powiązanie się nie powiodło
pair-failure-message = Proces konfiguracji został przerwany.

## Pair index page

pair-sync-header = Synchronizuj { -brand-firefox(case: "acc") } na telefonie lub tablecie
pair-cad-header = Połącz { -brand-firefox(case: "acc") } na innym urządzeniu
pair-already-have-firefox-paragraph = Masz już { -brand-firefox(case: "acc") } na telefonie lub tablecie?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synchronizuj swoje urządzenie
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Lub pobierz
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Zeskanuj, aby pobrać { -brand-firefox(case: "acc") } na telefon, albo wyślij sobie <linkExternal>odnośnik do pobrania</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Nie teraz
pair-take-your-data-message = Korzystaj ze swoich kart, zakładek i haseł wszędzie, gdzie używasz { -brand-firefox(case: "acc") }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Zacznij teraz
# This is the aria label on the QR code image
pair-qr-code-aria-label = Kod QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Połączono urządzenie
pair-success-message-2 = Pomyślnie powiązano.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Potwierdź powiązanie <span>dla adresu { $email }</span>
pair-supp-allow-confirm-button = Potwierdź powiązanie
pair-supp-allow-cancel-link = Anuluj

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Teraz wymagane jest zatwierdzenie <span>z innego używanego urządzenia</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Powiąż za pomocą aplikacji
pair-unsupported-message = Czy użyto aparatu systemowego? Należy powiązać z poziomu aplikacji { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Utwórz hasło, aby synchronizować
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = To hasło szyfruje Twoje dane. Musi być inne niż Twoje hasło do konta { -brand-google } lub { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Proszę czekać, następuje przekierowanie do upoważnionej aplikacji.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Wpisz klucz odzyskiwania konta
account-recovery-confirm-key-instruction = Ten klucz umożliwia odzyskanie zaszyfrowanych danych przeglądania, takich jak hasła i zakładki, z serwerów { -brand-firefox(case: "gen") }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Wpisz 32-znakowy klucz odzyskiwania konta
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Wskazówka o miejscu przechowywania:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Kontynuuj
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Nie możesz znaleźć klucza odzyskiwania konta?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Utwórz nowe hasło
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Ustawiono hasło
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Przepraszamy, wystąpił problem z ustawieniem hasła
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Użyj klucza odzyskiwania konta
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Zmieniono hasło.
reset-password-complete-banner-message = Nie zapomnij utworzyć nowego klucza odzyskiwania konta w ustawieniach { -product-mozilla-account(case: "gen", capitalization: "lower") }, aby zapobiec przyszłym problemom z logowaniem.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Wpisz 10-znakowy kod
confirm-backup-code-reset-password-confirm-button = Potwierdź
confirm-backup-code-reset-password-subheader = Wpisz zapasowy kod uwierzytelniania
confirm-backup-code-reset-password-instruction = Wpisz jeden z jednorazowych kodów zachowanych podczas konfigurowania uwierzytelniania dwuetapowego.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Nie możesz się zalogować?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Sprawdź pocztę
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Wysłano kod potwierdzenia na adres <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Wpisz 8-cyfrowy kod w ciągu 10 minut
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Kontynuuj
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Wyślij ponownie kod
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Użyj innego konta

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Zmień hasło
confirm-totp-reset-password-subheader-v2 = Wpisz kod uwierzytelniania dwuetapowego
confirm-totp-reset-password-instruction-v2 = Sprawdź <strong>aplikację uwierzytelniającą</strong>, aby zmienić hasło.
confirm-totp-reset-password-trouble-code = Masz problem z wpisywaniem kodu?
confirm-totp-reset-password-confirm-button = Potwierdź
confirm-totp-reset-password-input-label-v2 = Wpisz sześciocyfrowy kod
confirm-totp-reset-password-use-different-account = Użyj innego konta

## ResetPassword start page

password-reset-flow-heading = Zmień hasło
password-reset-body-2 = Zapytamy Cię o kilka rzeczy znanych tylko Tobie, aby zapewnić bezpieczeństwo Twojego konta.
password-reset-email-input =
    .label = Wpisz adres e-mail
password-reset-submit-button-2 = Kontynuuj

## ResetPasswordConfirmed

reset-password-complete-header = Zmieniono hasło
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Przejdź do usługi { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Zmień hasło
password-reset-recovery-method-subheader = Wybierz metodę odzyskiwania
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Upewnijmy się, że to Ty korzystasz ze swoich metod odzyskiwania.
password-reset-recovery-method-phone = Telefon odzyskiwania
password-reset-recovery-method-code = Zapasowe kody uwierzytelniania
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Został { $numBackupCodes } kod
        [few] Zostały { $numBackupCodes } kody
       *[many] Zostało { $numBackupCodes } kodów
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Wystąpił problem podczas wysyłania kodu do telefonu odzyskiwania
password-reset-recovery-method-send-code-error-description = Proszę spróbować ponownie później lub użyć zapasowych kodów uwierzytelniania.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Zmień hasło
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Wpisz kod odzyskiwania
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Sześciocyfrowy kod został wysłany na numer telefony kończący się na <span>{ $lastFourPhoneDigits }</span> wiadomością SMS. Ten kod wygasa w ciągu 5 minut. Nie udostępniaj go nikomu.
reset-password-recovery-phone-input-label = Wpisz sześciocyfrowy kod
reset-password-recovery-phone-code-submit-button = Potwierdź
reset-password-recovery-phone-resend-code-button = Wyślij ponownie kod
reset-password-recovery-phone-resend-success = Wysłano kod
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Nie możesz się zalogować?
reset-password-recovery-phone-send-code-error-heading = Wystąpił problem podczas wysyłania kodu
reset-password-recovery-phone-code-verification-error-heading = Wystąpił problem podczas weryfikowania kodu
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Proszę spróbować ponownie później.
reset-password-recovery-phone-invalid-code-error-description = Kod jest nieprawidłowy lub wygasł.
reset-password-recovery-phone-invalid-code-error-link = Czy zamiast tego użyć zapasowych kodów uwierzytelniania?
reset-password-with-recovery-key-verified-page-title = Pomyślnie zmieniono hasło
reset-password-complete-new-password-saved = Zachowano nowe hasło
reset-password-complete-recovery-key-created = Utworzono nowy klucz odzyskiwania konta. Teraz pobierz go i zachowaj.
reset-password-complete-recovery-key-download-info =
    Ten klucz jest niezbędny do odzyskania danych, jeśli zapomnisz hasła.
    <b>Pobierz go teraz i zachowaj w bezpiecznym miejscu, ponieważ później
    nie będziesz mieć dostępu do tej strony.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Błąd:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Weryfikowanie logowania…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Błąd potwierdzenia
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Odnośnik potwierdzenia wygasł
signin-link-expired-message-2 = Kliknięty odnośnik wygasł lub został już wykorzystany.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Wpisz hasło <span>do { -product-mozilla-account(case: "gen", capitalization: "lower") }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Przejdź do usługi { $serviceName }
signin-subheader-without-logo-default = Przejdź do ustawień konta
signin-button = Zaloguj się
signin-header = Zaloguj się
signin-use-a-different-account-link = Użyj innego konta
signin-forgot-password-link = Nie pamiętasz hasła?
signin-password-button-label = Hasło
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.
signin-code-expired-error = Kod wygasł. Zaloguj się ponownie.
signin-account-locked-banner-heading = Zmień hasło
signin-account-locked-banner-description = Zablokowaliśmy Twoje konto, aby chronić je przed podejrzaną aktywnością.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Zmień hasło, aby się zalogować

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = W klikniętym odnośniku brakuje znaków. Mógł on zostać uszkodzony przez klienta poczty. Starannie skopiuj adres i spróbuj ponownie.
report-signin-header = Zgłosić nieupoważnione logowanie?
report-signin-body = To wiadomość o próbie dostępu do konta. Czy zgłosić ją jako podejrzaną?
report-signin-submit-button = Zgłoś działanie
report-signin-support-link = Dlaczego to się stało?
report-signin-error = Podczas przesyłania zgłoszenia wystąpił błąd.
signin-bounced-header = Konto zostało zablokowane.
# $email (string) - The user's email.
signin-bounced-message = Wiadomość z potwierdzeniem wysłana na adres { $email } została zwrócona, więc konto zostało zablokowane, aby chronić dane użytkownika { -brand-firefox(case: "gen") }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Jeśli to prawidłowy adres e-mail, to <linkExternal>daj nam znać</linkExternal>, a pomożemy w odblokowaniu konta.
signin-bounced-create-new-account = Ten adres e-mail zmienił właściciela? Utwórz nowe konto
back = Wstecz

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Zweryfikuj to logowanie, <span>aby przejść do ustawień konta</span>
signin-push-code-heading-w-custom-service = Zweryfikuj to logowanie, <span>aby przejść do usługi { $serviceName }</span>
signin-push-code-instruction = Sprawdź inne swoje urządzenia i zatwierdź to logowanie w przeglądarce { -brand-firefox }.
signin-push-code-did-not-recieve = Powiadomienie nie doszło?
signin-push-code-send-email-link = Wyślij kod na e-mail

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Potwierdź logowanie
signin-push-code-confirm-description = Wykryliśmy próbę logowania z poniższego urządzenia. Jeśli to Ty, zatwierdź logowanie
signin-push-code-confirm-verifying = Weryfikowanie
signin-push-code-confirm-login = Potwierdź logowanie
signin-push-code-confirm-wasnt-me = To nie ja, zmień hasło.
signin-push-code-confirm-login-approved = Logowanie zostało zatwierdzone. Zamknij to okno.
signin-push-code-confirm-link-error = Odnośnik jest uszkodzony. Proszę spróbować ponownie.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Zaloguj się
signin-recovery-method-subheader = Wybierz metodę odzyskiwania
signin-recovery-method-details = Upewnijmy się, że to Ty korzystasz ze swoich metod odzyskiwania.
signin-recovery-method-phone = Telefon odzyskiwania
signin-recovery-method-code-v2 = Zapasowe kody uwierzytelniania
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Został { $numBackupCodes } kod
        [few] Zostały { $numBackupCodes } kody
       *[many] Zostało { $numBackupCodes } kodów
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Wystąpił problem podczas wysyłania kodu do telefonu odzyskiwania
signin-recovery-method-send-code-error-description = Proszę spróbować ponownie później lub użyć zapasowych kodów uwierzytelniania.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Zaloguj się
signin-recovery-code-sub-heading = Wpisz zapasowy kod uwierzytelniania
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Wpisz jeden z jednorazowych kodów zachowanych podczas konfigurowania uwierzytelniania dwuetapowego.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Wpisz 10-znakowy kod
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Potwierdź
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Użyj telefonu odzyskiwania
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Nie możesz się zalogować?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Wymagany jest zapasowy kod uwierzytelniania
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Wystąpił problem podczas wysyłania kodu do telefonu odzyskiwania
signin-recovery-code-use-phone-failure-description = Proszę spróbować ponownie później.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Zaloguj się
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Wpisz kod odzyskiwania
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Sześciocyfrowy kod został wysłany na numer telefony kończący się na <span>{ $lastFourPhoneDigits }</span> wiadomością SMS. Ten kod wygasa w ciągu 5 minut. Nie udostępniaj go nikomu.
signin-recovery-phone-input-label = Wpisz sześciocyfrowy kod
signin-recovery-phone-code-submit-button = Potwierdź
signin-recovery-phone-resend-code-button = Wyślij ponownie kod
signin-recovery-phone-resend-success = Wysłano kod
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Nie możesz się zalogować?
signin-recovery-phone-send-code-error-heading = Wystąpił problem podczas wysyłania kodu
signin-recovery-phone-code-verification-error-heading = Wystąpił problem podczas weryfikowania kodu
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Proszę spróbować ponownie później.
signin-recovery-phone-invalid-code-error-description = Kod jest nieprawidłowy lub wygasł.
signin-recovery-phone-invalid-code-error-link = Czy zamiast tego użyć zapasowych kodów uwierzytelniania?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Pomyślnie zalogowano. Mogą obowiązywać ograniczenia, jeśli ponownie użyjesz telefonu odzyskiwania.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Dziękujemy za czujność
signin-reported-message = Nasz zespół został powiadomiony. Zgłoszenia pomagają nam odpędzać intruzów.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Wpisz kod potwierdzenia <span>do { -product-mozilla-account(case: "gen", capitalization: "lower") }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu 5 minut.
signin-token-code-input-label-v2 = Wpisz sześciocyfrowy kod
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Potwierdź
signin-token-code-code-expired = Kod wygasł?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Wyślij nowy.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Wymagany jest kod potwierdzenia
signin-token-code-resend-error = Coś się nie powiodło. Nie można wysłać nowego kodu.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Zaloguj się
signin-totp-code-subheader-v2 = Wpisz kod uwierzytelniania dwuetapowego
signin-totp-code-instruction-v4 = Sprawdź <strong>aplikację uwierzytelniającą</strong>, aby potwierdzić logowanie.
signin-totp-code-input-label-v4 = Wpisz sześciocyfrowy kod
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Potwierdź
signin-totp-code-other-account-link = Użyj innego konta
signin-totp-code-recovery-code-link = Masz problem z wpisywaniem kodu?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Wymagany jest kod uwierzytelniania
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Upoważnij to logowanie
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Sprawdź, czy na koncie { $email } jest kod upoważnienia.
signin-unblock-code-input = Wpisz kod upoważnienia
signin-unblock-submit-button = Kontynuuj
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Wymagany jest kod upoważnienia
signin-unblock-code-incorrect-length = Kod upoważnienia musi mieć 8 znaków
signin-unblock-code-incorrect-format-2 = Kod upoważnienia może zawierać tylko litery i cyfry
signin-unblock-resend-code-button = Nie ma nic w Odebranych ani w Niechcianych? Wyślij jeszcze raz
signin-unblock-support-link = Dlaczego to się stało?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Wpisz kod potwierdzenia
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Wpisz kod potwierdzenia <span>do { -product-mozilla-account(case: "gen", capitalization: "lower") }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu 5 minut.
confirm-signup-code-input-label = Wpisz sześciocyfrowy kod
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Potwierdź
confirm-signup-code-sync-button = Zacznij synchronizować
confirm-signup-code-code-expired = Kod wygasł?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Wyślij nowy.
confirm-signup-code-success-alert = Pomyślnie potwierdzono konto
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Wymagany jest kod potwierdzenia
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Utwórz hasło
signup-relay-info = Hasło jest potrzebne do bezpiecznego zarządzania zamaskowanymi adresami e-mail i do dostępu do narzędzi bezpieczeństwa { -brand-mozilla(case: "gen") }.
signup-sync-info = Synchronizuj hasła, zakładki i inne dane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
signup-sync-info-with-payment = Synchronizuj hasła, metody płatności, zakładki i inne dane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Zmień adres e-mail

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synchronizacja jest włączona
signup-confirmed-sync-success-banner = Potwierdzono { -product-mozilla-account(case: "acc", capitalization: "lower") }
signup-confirmed-sync-button = Zacznij przeglądać Internet
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Twoje hasła, metody płatności, adresy, zakładki, historia i inne dane mogą być synchronizowane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
signup-confirmed-sync-description-v2 = Twoje hasła, adresy, zakładki, historia i inne dane mogą być synchronizowane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
signup-confirmed-sync-add-device-link = Dodaj następne urządzenie
signup-confirmed-sync-manage-sync-button = Zarządzaj synchronizacją
signup-confirmed-sync-set-password-success-banner = Utworzono hasło synchronizacji
