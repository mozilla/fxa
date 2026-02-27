# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Баннерны ябу
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Күбрәк белү
# Alt text for close banner image
brand-close-banner =
    .alt = Баннерны ябу
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m логотибы

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Иңдерү һәм дәвам итү
    .title = Иңдерү һәм дәвам итү
recovery-key-pdf-heading = Хисапны Коткару Ачкычы
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Төзелгән: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Хисапны Коткару Ачкычы
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Ачкычыгызны саклау өчен урыннар
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Хисапны коткару ачкычыгыз турында күбрәк белү

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = { -brand-mozilla } хәбәрләренә язылыгыз:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Иң соңгы яңалыкларыбыз һәм продукт яңартуларыбыз турында хәбәрдар булыгыз
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Яңа продуктларны иртәрәк сынап карау мөмкинлеге

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Йөкләнде
datablock-copy =
    .message = Күчерелде
datablock-print =
    .message = Бастырылды

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (чама белән)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (чама белән)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (чама белән)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (чама белән)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Урнашу билгесез
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $genericOSName } системасында { $browserName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP адрес: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Серсүз
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Серсүзне кабатлагыз
form-password-with-inline-criteria-signup-submit-button = Хисап язмасы булдыру
form-password-with-inline-criteria-reset-new-password =
    .label = Яңа серсүз
form-password-with-inline-criteria-confirm-password =
    .label = Серсүзне раслау
form-password-with-inline-criteria-reset-submit-button = Яңа серсүз булдыру
form-password-with-inline-criteria-match-error = Серсүзләр туры килми
form-password-with-inline-criteria-sr-too-short-message = Серсүз кимендә 8 билге булырга тиеш.
form-password-with-inline-criteria-sr-requirements-met = Кертелгән серсүз барлык серсүз таләпләренә дә туры килә
form-password-with-inline-criteria-sr-passwords-match = Керелгән серсүзләр бер-берсенә  туры килә.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Бу кыр кирәкле

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)


# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } хисабын коткару ачкычы
get-data-trio-download-2 =
    .title = Иңдерү
    .aria-label = Иңдерү
get-data-trio-copy-2 =
    .title = Күчереп алу
    .aria-label = Күчереп алу
get-data-trio-print-2 =
    .title = Бастыру
    .aria-label = Бастыру

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Игътибар
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Кисәтү
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Канада байрагы
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Уңышлы
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Кабызылган
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Хәбәрне ябу
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Код
error-icon-aria-label =
    .aria-label = Хата
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Мәгълүмат
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Америка Кушма Штатлары байрагы

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-create-header = Хисабыгызны саклагыз

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Серсүзне яшерү
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Серсүзне күрсәтү
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Серсүзегез хәзер яшерелгән.

## Phone number component

# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Кире

## LinkDamaged component

# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Раслау сылтамасына зыян килгән
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Сылтамага зыян килгән

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Яңа сылтама алу

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Серсүзегез исегездәме?
# link navigates to the sign in page
remember-password-signin-link = Керү

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Беренчел эл. почта адресы расланды инде
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Керү расланды инде

## Locale Toggle Component

# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Яраксыз сорау

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-min-length = Кимендә 8 символ
password-strength-inline-not-email = Эл. почта адресыгыз түгел
password-strength-inline-not-common = Еш кулланылучы серсүз түгел

## Notification Promo Banner component

account-recovery-notification-cta = Булдыру

## Ready component

manage-your-account-button = Хисабыгыз белән идарә итү
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Сез хәзер { $serviceName } хезмәтен куллана аласыз
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Сез хәзер хисап көйләүләрен куллана аласыз
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Хисабыгыз хәзер!
ready-continue = Дәвам итү
sign-in-complete-header = Керү расланды
sign-up-complete-header = Хисап расланды
primary-email-verified-header = Төп эл. почта адресы расланды

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Ачкычыгызны саклау өчен урыннар:
flow-recovery-key-download-storage-ideas-folder-v2 = Хәвефсез җиһаздагы папка
flow-recovery-key-download-storage-ideas-cloud = Ышанычлы болыт саклагычы
flow-recovery-key-download-storage-ideas-pwd-manager = Серсүз идарәчесе

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Әзер

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Кисәтү
password-reset-chevron-expanded = Кисәтүне төреп кую
password-reset-chevron-collapsed = Кисәтүне җәеп күрсәтү
password-reset-warning-have-key = Хисапны коткару ачкычыгыз бармы?

## Alert Bar

alert-bar-close-message = Хәбәрне ябу

## User's avatar

avatar-your-avatar =
    .alt = Сезнең аватар
avatar-default-avatar =
    .alt = Стандарт аватар

##


# BentoMenu component

bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Компьютерлар өчен { -brand-firefox } браузеры
bento-menu-firefox-mobile = Мобиль җиһазлар өчен { -brand-firefox } браузеры
bento-menu-made-by-mozilla = { -brand-mozilla } тарафыннан җитештерелгән

## Connect another device promo

connect-another-fx-mobile = Мобиль җиһазыгызга { -brand-firefox } программасын урнаштырыгыз

## Connected services section

cs-heading = Тоташтырылган Хезмәтләр
cs-cannot-refresh =
    Гафу итегез, тоташтырылган хезмәтләр исемлеген яңартканда
    кыенлыклар килеп чыкты.
cs-cannot-disconnect = Клиент табылмады, тоташуны өзеп булмый
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = { $service } хезмәтеннән чыктыгыз
cs-refresh-button =
    .title = Бәйләнгән хезмәтләрне яңарту
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Табылмаган яки кабатланган элементлар бармы?
cs-disconnect-sync-heading = Синхронлауны өзү

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Җиһаз:
cs-disconnect-sync-opt-suspicious = Шикле
cs-disconnect-sync-opt-lost = Югалган яки урланган
cs-disconnect-sync-opt-old = Иске яки алыштырылган
cs-disconnect-sync-opt-duplicate = Кабатланган
cs-disconnect-sync-opt-not-say = Әйтәсем килми

##

cs-disconnect-advice-confirm = Яхшы, аңладым
cs-disconnect-lost-advice-heading = Югалган яки урланган җиһаз өзелде
cs-disconnect-suspicious-advice-heading = Шикле җиһаз тоташкан
cs-sign-out-button = Чыгу

## Data collection section

dc-heading = Мәгълүмат туплау һәм аны куллану
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } браузеры
dc-learn-more = Күбрәк белү

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } менюсы
drop-down-menu-sign-out = Чыгу

## Flow Container

flow-container-back = Кире

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-input-label = Серсүзегезне кертегез
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Хисапны коткару ачкычын булдыру
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Яңа хисапны коткару ачкычын булдыру

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Хисапны коткару ачкычы ясалды — аны хәзер үк иңдерегез һәм саклагыз
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Иңдермичә дәвам итү

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Хисапны коткару ачкычы булдырылды

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Серсүз онытылып киткән очракларда куллану өчен бер хисапны коткару ачкычы булдырыгыз
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Хисапны коткару ачкычын үзгәртү
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Башлап җибәрү
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Баш тарту

## HeaderLockup component, the header in account settings

header-menu-open = Менюны ябу
header-menu-closed = Сайт навигациясе менюсы
header-back-to-top-link =
    .title = Сәхифә башына
header-title-2 = { -product-mozilla-account }
header-help = Ярдәм

## Linked Accounts section

la-heading = Бәйле хисап язмалары
la-unlink-button = Бәйләнешне өзү
la-unlink-account-button = Бәйләнешне өзү
la-set-password-button = Серсүз урнаштыру
la-unlink-heading = Өченче тараф хисабы белән бәйләнешне өзү
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Ябу
modal-cancel-button = Баш тарту
modal-default-confirm-button = Раслау

## Modal Verify Session

mvs-verify-your-email-2 = Эл. почтагызны раслагыз
mvs-enter-verification-code-2 = Раслау кодыгызны кертегез
msv-cancel-button = Баш тарту
msv-submit-button-2 = Раслау

## Settings Nav

nav-settings = Көйләүләр
nav-profile = Профиль
nav-security = Хәвефсезлек
nav-connected-services = Тоташтырылган Хезмәтләр
nav-data-collection = Мәгълүмат туплау һәм аны куллану
nav-paid-subs = Түләүле язылулар
nav-email-comm = Эл. почта элемтәләр

## Avatar change page

avatar-page-title =
    .title = Профиль рәсеме
avatar-page-add-photo = Рәсем өстәү
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Фотога төшерү
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Фотоны бетерү
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Яңадан фотога төшерү
avatar-page-cancel-button = Баш тарту
avatar-page-save-button = Саклау
avatar-page-saving-button = Саклау…
avatar-page-zoom-out-button =
    .title = Кечерәйтү
avatar-page-zoom-in-button =
    .title = Зурайту
avatar-page-rotate-button =
    .title = Борып кую
avatar-page-camera-error = Камераны кабызып булмады
avatar-page-new-avatar =
    .alt = яңа профиль рәсеме
avatar-page-file-upload-error-3 = Профиль рәсемегезне йөкләгәндә хата китте
avatar-page-delete-error-3 = Профиль рәсемегезне бетергәндә хата китте
avatar-page-image-too-large-error-2 = Рәсем файлы йөкләп булмаслык зур

## Password change page

pw-change-header =
    .title = Серсүзне үзгәртү
pw-8-chars = Кимендә 8 символ
pw-not-email = Эл. почта адресыгыз түгел
pw-change-must-match = Яңа серсүз раслауга туры килә
pw-commonly-used = Еш куллана торган серсүз түгел
pw-change-cancel-button = Баш тарту
pw-change-save-button = Саклау
pw-change-forgot-password-link = Паролыгызны оныттыгызмы?
pw-change-current-password =
    .label = Хәзерге серсүзегезне кертегез
pw-change-new-password =
    .label = Яңа паролны языгыз
pw-change-confirm-password =
    .label = Яңа серсүзне раслагыз
pw-change-success-alert-2 = Серсүз яңартылды

## Password create page

pw-create-header =
    .title = Серсүз булдыру
pw-create-success-alert-2 = Cерсүз куелды
pw-create-error-2 = Гафу итегез, серсүзне куюда хата килеп чыкты

## Delete account page

delete-account-header =
    .title = Хисапны бетерү
delete-account-step-1-2 = Адым 1/2
delete-account-step-2-2 = Адым 2/2
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox } мәгълүматларын синхронлау
delete-account-product-firefox-addons = { -brand-firefox } кушымчалары
delete-account-continue-button = Дәвам итү
delete-account-password-input =
    .label = Паролны кертү
delete-account-cancel-button = Баш тарту
delete-account-delete-button-2 = Бетерү

## Display name page

display-name-page-title =
    .title = Күрсәтеләчәк исемегез
display-name-input =
    .label = Күрсәтеләчәк исемне кертегез
submit-display-name = Саклау
cancel-display-name = Баш тарту
display-name-success-alert-2 = Күрсәтелүче исем яңартылды

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Соңгы хисап гамәлләре
recent-activity-account-create-v2 = Хисап булдырылды
recent-activity-account-disable-v2 = Хисап сүндерелде
recent-activity-account-enable-v2 = Хисап кабызылды
recent-activity-account-login-v2 = Хисапка керү башланды
recent-activity-account-reset-v2 = Серсүзне үзгәртү башланды
recent-activity-account-two-factor-added = Ике адымлы аутентификация кабызылды
recent-activity-account-two-factor-requested = Ике адымлы аутентификация соралды
recent-activity-account-two-factor-failure = Ике адымлы аутентификация уңышсыз тәмамланды
recent-activity-account-two-factor-success = Ике адымлы аутентификация уңышлы булды
recent-activity-account-two-factor-removed = Ике адымлы аутентификация сүндерелде
recent-activity-account-password-reset-requested = Хисап серсүзен үзгәртүне сорады
recent-activity-account-password-reset-success = Хисап серсүзен үзгәртү уңышлы тәмамланды
recent-activity-account-recovery-key-added = Хисапны коткару ачкычы кабызылды
recent-activity-account-recovery-key-removed = Хисапны коткару ачкычы бетерелде
recent-activity-account-password-added = Яңа серсүз өстәлде
recent-activity-account-password-changed = Cерсүз үзгәртелде
recent-activity-account-secondary-email-added = Икенчел эл. почта адресы өстәлде
recent-activity-account-secondary-email-removed = Икенчел эл. почта адресы бетерелде
recent-activity-account-emails-swapped = Беренчел һәм икенчел эл. почталар алыштырылды
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Башка хисап гамәлләре

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Хисапны коткару ачкычы
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Көйләүләргә кире кайту

## Add secondary email page

add-secondary-email-step-1 = Адым 1/2
add-secondary-email-error-2 = Бу эл. почтаны ясаганда хата китте
add-secondary-email-page-title =
    .title = Икенчел эл. почта адресы
add-secondary-email-enter-address =
    .label = Эл. почта адресын кертегез
add-secondary-email-cancel-button = Баш тарту
add-secondary-email-save-button = Саклау

## Verify secondary email page

add-secondary-email-step-2 = Адым 2/2
verify-secondary-email-page-title =
    .title = Икенчел эл. почта адресы
verify-secondary-email-cancel-button = Баш тарту
verify-secondary-email-verify-button-2 = Раслау
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } уңышлы өстәлде

##

# Link to delete account on main Settings page
delete-account-link = Хисапны бетерү

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }

## Profile section

profile-heading = Профиль
profile-picture =
    .header = Рәсем
profile-display-name =
    .header = Күрсәтеләчәк исемегез
profile-primary-email =
    .header = Төп эл. почта

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Адым { $currentStep }/{ $numberOfSteps }.

## Security section of Setting

security-heading = Хәвефсезлек
security-password =
    .header = Серсүз
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Төзелгән: { $date }
security-not-set = Көйләнмәгән
security-action-create = Булдыру
security-set-password = Синхронлау һәм хисап язмаларының билгеле хәвефсезлек мөмкинлекләрен куллану өчен серсүз куегыз.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Соңгы хисап гамәлләрен карау
signout-sync-header = Сессиянең вакыты чыкты
signout-sync-session-expired = Гафу итегез, ниндидер хата килеп чыкты. Браузер менюсыннан чыгып, зинһар янәдән тырышып карагыз.

## SubRow component

tfa-row-backup-codes-title = Резерв аутентификация кодлары
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Өстәү
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Үзгәртү
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Өстәү
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Бетерү

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Cүндерү
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Кабызу
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Җибәрү…
switch-is-on = кабынган
switch-is-off = cүнгән

## Sub-section row Defaults

row-defaults-action-add = Өстәү
row-defaults-action-change = Үзгәртү
row-defaults-action-disable = Cүндерү
row-defaults-status = Бернинди дә

## Account recovery key sub-section on main Settings page

rk-header-1 = Хисапны коткару ачкычы
rk-enabled = Кабызылган
rk-not-set = Көйләнмәгән
rk-action-create = Булдыру
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Үзгәртү
rk-action-remove = Бетерү
rk-key-removed-2 = Хисапны коткару ачкычы бетерелде
rk-cannot-remove-key = Хисабыгызны коткару ачкычын бетереп булмады.
rk-refresh-key-1 = Хисапны коткару ачкычын яңарту
rk-content-explain = Серсүзегезне онытканда, мәгълүматыгызны торгызыгыз.
rk-cannot-verify-session-4 = Гафу итегез, утырышыгызны раслаганда проблема килеп чыкты
rk-remove-modal-heading-1 = Хисапны коткару ачкычы бетерелсенме?
rk-remove-modal-content-1 = Серсүзегезне алыштырган очракта, мәгълүматыгызга ирешү өчен хисапны коткару ачкычын кулланып булмаячак. Бу гамәлне кире алып булмый.
rk-remove-error-2 = Хисабыгызны коткару ачкычын бетереп булмады
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Хисапны коткару ачкычын бетерү

## Secondary email sub-section on main Settings page

se-heading = Икенчел эл. почта адресы
    .header = Икенчел эл. почта адресы
se-cannot-refresh-email = Гафу итегез, бу эл. почтаны яңартканда хата килеп чыкты.
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } уңышлы бетерелде
# Button to remove the secondary email
se-remove-email =
    .title = Эл. почтаны бетерү
# Button to refresh secondary email status
se-refresh-email =
    .title = Эл. почтаны яңарту
se-unverified-2 = расланмаган
# Button to make secondary email the primary
se-make-primary = Төп адрес итү
# Default value for the secondary email
se-secondary-email-none = Бернинди дә

## Two Step Auth sub-section on Settings main page

tfa-row-header = Ике адымлы аутентификация
tfa-row-enabled = Кабызылган
tfa-row-disabled-status = Cүндерелгән
tfa-row-action-add = Өстәү
tfa-row-action-disable = Cүндерү
tfa-row-button-refresh =
    .title = Ике адымлы аутентификацияне яңарту
tfa-row-cannot-refresh =
    Гафу итегез, ике адымлы аутентификацияне яңартканда
    хата килеп чыкты.
tfa-row-disable-modal-heading = Ике адымлы аутентификация сүндерелсенме?
tfa-row-disable-modal-confirm = Cүндерү

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = яки
continue-with-google-button = { -brand-google } аркылы дәвам итү
continue-with-apple-button = { -brand-apple } аркылы дәвам итү

## Auth-server based errors that originate from backend service

auth-error-102 = Билгесез хисап
auth-error-103 = Парол хаталы
auth-error-105-2 = Раслау кодында хата
auth-error-110 = Хаталы токен
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Артык күп тапкыр тырышып карадыгыз. Зинһар, соңрак янәдән тырышып карагыз.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Артык күп тапкыр тырышып карадыгыз. Зинһар, { $retryAfter } вакыт кичкәч, янәдән тырышыгыз.
auth-error-138-2 = Расланмаган утырыш
auth-error-139 = Икенчел эл. почта хисабыгызның төп эл. почтасыннан башка булырга тиеш
auth-error-155 = TOTP токен табылмады
auth-error-159 = Яраксыз хисапны коткару ачкычы
auth-error-183-2 = Яраксыз яки вакыты чыккан раслау коды
auth-error-999 = Көтелмәгән хата
auth-error-1001 = Керергә тырышудан баш тартылды
auth-error-1002 = Сессиянең мөддәте бетте. Дәвам итү өчен керегез.
auth-error-1003 = Җирле саклагыч яки кукилар әле дә сүндерелгән
auth-error-1008 = Яңа парол иске паролдан үзгә булырга тиеш
auth-error-1010 = Дөрес cерсүз кирәк
auth-error-1011 = Дөрес эл. почта адресы кирәк
auth-error-1031 = Теркәлү өчен, яшегезне күрсәтүегез кирәк
auth-error-1032 = Теркәлү өчен, дөрес яшьне күрсәтүегез кирәк
auth-error-1062 = Яраксыз юнәлтү
oauth-error-1000 = Нидер булды. Бу табны ябып, зинһар янәдән тырышып карагыз.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Сез { -brand-firefox } эченә кердегез
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Эл. почта расланды
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Керү расланды
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Көйләүне тәмамлар өчен бу { -brand-firefox }-ка керегез
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Керү
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Әле дә җиһазлар өстисезме? Көйләүне тәмамлар өчен башка бер җиһаздан { -brand-firefox }-ка керегез
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Көйләүне тәмамлар өчен башка бер җиһаздан { -brand-firefox }-ка керегез
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Табларыгыз, кыстыргычларыгыз һәм серсүзләрегезне башка җиһазларда да кулланырга телисезме?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Башка бер җиһазны тоташтыру
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Хәзер түгел
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Көйләүне тәмамлар өчен, Android өчен { -brand-firefox }-ка керегез

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Янәдән тырышып карау
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Күбрәк белү

## Index / home page

index-header = Эл. почтагызны кертегез

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Урнаштырудан баш тарту
inline-totp-setup-continue-button = Дәвам итү
inline-totp-setup-ready-button = Әзер
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Аутентификация коды
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Аутентификация коды таләп ителә

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Хокукый мәсьәләләр
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Куллану шартлары
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Хосусыйлык аңлатмасы

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Хосусыйлык аңлатмасы

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Куллану шартлары

## AuthAllow page - Part of the device pairing flow

# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Әйе, җиһазны раслау

## PairAuthComplete page - part of the device pairing flow

pair-auth-complete-manage-devices-link = Җиһазлар белән идарә итү

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

auth-totp-input-label = 6-цифрлы кодны кертегез
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Раслау
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Аутентификация коды кирәк

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Хәзер <span>бүтән җиһазыгыздан</span> рөхсәт кирәк

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Ялгау килеп чыкмады
pair-failure-message = Урнаштыру процессы өзелде.

## Pair index page

pair-sync-header = { -brand-firefox }-ны телефоныгызда яки планшетыгызда синхронлагыз
pair-cad-header = { -brand-firefox }-ны башка җиһазда тоташтырыгыз
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Җиһазыгызны синхронлагыз
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Яки иңдерү
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Хәзер түгел
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Башлап җибәрү
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR коды

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Җиһаз тоташтырылды
pair-success-message-2 = Ялгау уңышлы булды.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = <span>{ $email } өчен</span> ялгауны раслау
pair-supp-allow-confirm-button = Ялгауны раслау
pair-supp-allow-cancel-link = Баш тарту

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Хәзер <span>бүтән җиһазыгыздан</span> рөхсәт кирәк

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Кушымта ярдәмендә ялгау

## AccountRecoveryConfirmKey page

# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Дәвам итү

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Яңа серсүз булдыру
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Серсүз урнаштырылды
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Гафу итегез, серсүзегезне урнаштыруда хата килеп чыкты
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Хисапны коткару ачкычын куллану
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Серсүзегез алмаштырылды

# ConfirmBackupCodeResetPassword page


## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Эл. почтагызны тикшерегез
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Дәвам итү
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Кодны яңадан җибәрү
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Башка бер хисап куллану

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Серсүзне алыштыру
confirm-totp-reset-password-subheader-v2 = Ике адымлы аутентификация кодын кертегез
confirm-totp-reset-password-trouble-code = Кодны кертеп булмыймы?
confirm-totp-reset-password-confirm-button = Раслау
confirm-totp-reset-password-input-label-v2 = 6-цифрлы кодны кертегез
confirm-totp-reset-password-use-different-account = Башка бер хисап куллану

## ResetPassword start page

password-reset-flow-heading = Серсүзне ташлату
password-reset-email-input =
    .label = Эл. почтагызны кертегез
password-reset-submit-button-2 = Дәвам итү

## ResetPasswordConfirmed

reset-password-complete-header = Серсүзегез алмаштырылды
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = { $serviceName } хезмәтенә күчү

## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = Серзүз уңышлы ташлатылды
reset-password-complete-new-password-saved = Яңа серсүз сакланды!

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Хата:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Керү тикшерелә…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Раслау хатасы
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Раслау сылтамасының вакыты узган
signin-link-expired-message-2 = Сез баскан сылтаманың вакыты чыккан яисә ул инде кулланылган.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = <span>{ -product-mozilla-account } хисабыгыз өчен</span> серсүзегезне кертегез
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = { $serviceName } хезмәтенә күчү
signin-subheader-without-logo-default = Хисап көйләүләренә күчү
signin-button = Керү
signin-header = Керү
signin-use-a-different-account-link = Башка бер хисап куллану
signin-forgot-password-link = Серсүзегезне оныттыгызмы?
signin-password-button-label = Серсүз

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

back = Кире

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-did-not-recieve = Искәртү килмәдеме?
signin-push-code-send-email-link = Кодны эл. почта аша җибәрү

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Керүегезне раслагыз
signin-push-code-confirm-verifying = Тикшерү
signin-push-code-confirm-login = Керүне раслау
signin-push-code-confirm-wasnt-me = Бу мин түгел, серсүзне үзгәртү.
signin-push-code-confirm-link-error = Сылтамага зыян килгән. Зинһар янәдән тырышып карагыз.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Керү
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Раслау
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Хисабыгыз биклеме?

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

signin-token-code-input-label-v2 = 6-цифрлы кодны кертегез
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Раслау
signin-token-code-code-expired = Кодның мөддәте беткәнме?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Эл. почта аша яңа код җибәрү.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Раслау коды кирәк

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Керү
signin-totp-code-subheader-v2 = Ике адымлы аутентификация кодын кертегез
signin-totp-code-input-label-v4 = 6-цифрлы кодны кертегез
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Раслау
signin-totp-code-other-account-link = Башка бер хисап куллану
signin-totp-code-recovery-code-link = Кодны кертеп булмыймы?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Аутентификация коды кирәк

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Бу керүне рөхсәт итү
signin-unblock-code-input = Авторизация кодын кертү
signin-unblock-submit-button = Дәвам итү
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Авторизация коды кирәк
signin-unblock-code-incorrect-length = Авторизация кодында 8 символ булырга тиеш
signin-unblock-code-incorrect-format-2 = Авторизация коды хәрефләр һәм/яки саннардан гына торырга тиеш
signin-unblock-support-link = Бу нидән килеп чыга?

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Раслау кодын кертү
confirm-signup-code-input-label = 6-цифрлы кодны кертегез
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Раслау
confirm-signup-code-code-expired = Мөддәте чыккан кодмы?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Эл. почта аша яңа код җибәрү.
confirm-signup-code-success-alert = Хисап уңышлы расланды
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Раслау коды кирәк

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Эл. почтаны үзгәртү
