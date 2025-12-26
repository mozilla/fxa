# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Закрыць банер
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } будуць перайменаваны ва { -product-mozilla-accounts } 1 лістапада
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Вы па-ранейшаму будзеце ўваходзіць у сістэму з тым жа імем карыстальніка і паролем, і ніякіх іншых змен у прадуктах, якімі вы карыстаецеся, не будзе.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Мы перайменавалі { -product-firefox-accounts } ва { -product-mozilla-accounts }. Вы па-ранейшаму будзеце ўваходзіць у сістэму з тым жа імем карыстальніка і паролем, і ніякіх іншых змен у прадуктах, якімі вы карыстаецеся, не будзе.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Падрабязней
# Alt text for close banner image
brand-close-banner =
    .alt = Закрыць банер
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Лагатып { -brand-mozilla } m

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Назад
button-back-title = Назад

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Сцягнуць і працягваць
    .title = Сцягнуць і працягваць
recovery-key-pdf-heading = Ключ аднаўлення ўліковага запісу
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Згенераваны: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Ключ аднаўлення ўліковага запісу
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Гэты ключ дазваляе аднавіць зашыфраваныя звесткі браўзера (уключаючы паролі, закладкі і гісторыю), калі вы забудзеце пароль. Захоўвайце яго ў месцы, якое вы запомніце.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Месцы для захоўвання вашага ключа
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Даведайцеся больш пра ключ аднаўлення ўліковага запісу
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = На жаль, узнікла праблема пры сцягванні ключа аднаўлення ўліковага запісу.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Атрымайце больш ад { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Ранні доступ да тэставання новых прадуктаў

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Сцягнута
datablock-copy =
    .message = Скапіявана
datablock-print =
    .message = Надрукавана

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (прыблізна)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (прыблізна)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (прыблізна)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (прыблізна)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Невядомае месцазнаходжанне
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } на { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-адрас: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Пароль
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Паўтарыце пароль
form-password-with-inline-criteria-signup-submit-button = Стварыць уліковы запіс
form-password-with-inline-criteria-reset-new-password =
    .label = Новы пароль
form-password-with-inline-criteria-confirm-password =
    .label = Пацвердзіце пароль
form-password-with-inline-criteria-reset-submit-button = Стварыць новы пароль
form-password-with-inline-criteria-match-error = Паролі не супадаюць

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Гэта поле абавязковае

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)


# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Ключ аднаўлення ўліковага запісу { -brand-firefox }
get-data-trio-title-backup-verification-codes = Рэзервовыя коды аўтэнтыфікацыі
get-data-trio-download-2 =
    .title = Сцягванне
    .aria-label = Сцягванне
get-data-trio-copy-2 =
    .title = Капіяваць
    .aria-label = Капіяваць
get-data-trio-print-2 =
    .title = Друкаваць
    .aria-label = Друкаваць

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Перасцярога
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Увага
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Папярэджанне

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Камп'ютар і мабільны тэлефон з выявай разбітага сэрца на іх
hearts-verified-image-aria-label =
    .aria-label = Камп'ютар, мабільны тэлефон і планшэт з пульсуючым сэрцам на кожным з іх
signin-recovery-code-image-description =
    .aria-label = Дакумент, які змяшчае схаваны тэкст.
signin-totp-code-image-label =
    .aria-label = Прылада са схаваным 6-значным кодам.
confirm-signup-aria-label =
    .aria-label = Канверт са спасылкай
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ілюстрацыя, якая прадстаўляе ключ аднаўлення ўліковага запісу.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ілюстрацыя, якая прадстаўляе ключ аднаўлення ўліковага запісу.
lightbulb-aria-label =
    .aria-label = Ілюстрацыя, якая прадстаўляе стварэнне падказкі для сховішча.

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Схаваць пароль
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Паказаць пароль

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Выбар краіны
input-phone-number-enter-number = Увядзіце нумар тэлефона
input-phone-number-country-united-states = Злучаныя Штаты
input-phone-number-country-canada = Канада
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Назад

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Спасылка для скіду пароля пашкоджана
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Спасылка для пацвярджэння пашкоджана
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Спасылка пашкоджана
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = У спасылцы, па якой вы прайшлі, прапушчаны сімвалы, магчыма, яна была пашкоджана вашым паштовым кліентам. Акуратна скапіруйце адрас і паспрабуйце ізноў.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Атрымаць новую спасылку

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Памятаеце пароль?
# link navigates to the sign in page
remember-password-signin-link = Увайсці

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Асноўны адрас электроннай пошты ўжо пацверджаны
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Уваход у сістэму ўжо пацверджаны
confirmation-link-reused-message = Гэта спасылка для пацвярджэння ўжо была выкарыстана, і можа выкарыстоўвацца толькі адзін раз.

## Locale Toggle Component

# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Дрэнны запыт

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Вам патрэбны гэты пароль для доступу да любых зашыфраваных звестак, якія вы захоўваеце ў нас.
password-info-balloon-reset-risk-info = Скід азначае патэнцыйную страту такіх звестак, як паролі ці закладкі.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-not-email = Не ваш адрас электроннай пошты

## Notification Promo Banner component

account-recovery-notification-cta = Стварыць

## Ready component

ready-complete-set-up-instruction = Закончыце наладку, увёўшы новы пароль на іншых вашых прыладах { -brand-firefox }.
manage-your-account-button = Кіруйце сваім уліковым запісам
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Цяпер вы можаце выкарыстоўваць { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Цяпер вы гатовыя выкарыстоўваць налады ўліковага запісу
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Ваш уліковы запіс гатовы!
ready-continue = Працягнуць
sign-in-complete-header = Уваход пацверджаны
sign-up-complete-header = Уліковы запіс пацверджаны
primary-email-verified-header = Асноўны адрас электроннай пошты пацверджаны

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Месцы для захоўвання вашага ключа:
flow-recovery-key-download-storage-ideas-folder-v2 = Папка на бяспечнай прыладзе
flow-recovery-key-download-storage-ideas-cloud = Надзейнае воблачнае сховішча
flow-recovery-key-download-storage-ideas-print-v2 = Друкаваная фізічная копія
flow-recovery-key-download-storage-ideas-pwd-manager = Менеджар пароляў

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Дадайце падказку, якая дапаможа знайсці ваш ключ
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Гэта падказка павінна дапамагчы вам успомніць, дзе вы захавалі ключ аднаўлення ўліковага запісу. Мы можам паказаць яе вам у часе скіду пароля, каб аднавіць вашы звесткі.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Увядзіце падказку (неабавязкова)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Скончыць
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Падказка павінна змяшчаць менш за 255 знакаў.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Падказка не можа ўтрымліваць небяспечныя сімвалы унікода. Дапускаюцца толькі літары, лічбы, знакі прыпынку і сімвалы.

## Alert Bar

alert-bar-close-message = Закрыць паведамленне

## User's avatar

avatar-your-avatar =
    .alt = Ваш аватар
avatar-default-avatar =
    .alt = Прадвызначаны аватар

##


# BentoMenu component

bento-menu-title-3 = Прадукты { -brand-mozilla }
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Браўзер { -brand-firefox } для камп'ютара
bento-menu-firefox-mobile = Браўзер { -brand-firefox } для мабільных
bento-menu-made-by-mozilla = Зроблена { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Усталюйце { -brand-firefox } на мабільную прыладу

## Connected services section

cs-heading = Падключаныя паслугі
cs-description = Усё, чым вы карыстаецеся і дзе ўвайшлі.
cs-cannot-refresh =
    На жаль, пры абнаўленні спіса
    падключаных паслуг узнікла праблема
cs-cannot-disconnect = Кліент не знойдзены, не ўдалося адключыць
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Вы выйшлі з { $service }
cs-refresh-button =
    .title = Абнавіць падключаныя паслугі
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Адсутнічаюць або дублююцца элементы?
cs-disconnect-sync-heading = Адлучыцца ад Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Вашы звесткі пра агляданне застануцца на <span>{ $device }</span>,
    але больш не будуць сінхранізавацца з уліковым запісам.
cs-disconnect-sync-reason-3 = Якая галоўная прычына адлучэння <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Гэтая прылада:
cs-disconnect-sync-opt-suspicious = Падазроная
cs-disconnect-sync-opt-lost = Згублена або скрадзена
cs-disconnect-sync-opt-old = Старая або заменена
cs-disconnect-sync-opt-duplicate = Дублікат
cs-disconnect-sync-opt-not-say = Не хачу ўказваць

##

cs-disconnect-advice-confirm = Зразумела
cs-disconnect-lost-advice-heading = Згубленая або скрадзеная прылада адлучана
cs-disconnect-lost-advice-content-3 = Паколькі ваша прылада была страчана або скрадзена, для захавання вашай інфармацыі ў бяспецы, вам варта змяніць пароль свайго { -product-mozilla-account } у наладах. Вам таксама варта азнаёміцца з парадамі вытворцы сваёй прылады па аддаленым выдаленні дадзеных.
cs-disconnect-suspicious-advice-heading = Падазроная прылада адлучана
cs-disconnect-suspicious-advice-content-2 =
    Калі адлучаная прылада сапраўды падазроная, вам варта змяніць пароль { -product-mozilla-account }
    у наладах уліковага запісу, каб захаваць вашу інфармацыю ў бяспецы. Вам таксама варта змяніць любыя іншыя паролі, якія вы захавалі ў { -brand-firefox }, увёўшы about:logins у адрасны радок.
cs-sign-out-button = Выйсці

## Data collection section

dc-heading = Збор і выкарыстанне дадзеных
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Браўзер { -brand-firefox }
dc-subheader-content-2 = Дазволіць { -product-mozilla-accounts } адпраўляць тэхнічныя дадзеныя і інфармацыю аб узаемадзеянні ў { -brand-mozilla }.
dc-opt-out-success-2 = Адмова пацверджана. { -product-mozilla-accounts } не будзе адпраўляць тэхнічныя дадзеныя або звесткі аб ўзаемадзеянні ў { -brand-mozilla }.
dc-opt-in-success-2 = Дзякуй! Адпраўка гэтых дадзеных дапаможа нам палепшыць { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = На жаль, пры змене параметраў збору дадзеных ўзнікла праблема
dc-learn-more = Падрабязней

# DropDownAvatarMenu component

drop-down-menu-title-2 = Меню { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Увайшоўшы як
drop-down-menu-sign-out = Выйсці
drop-down-menu-sign-out-error-2 = На жаль, пры выхадзе ўзнікла праблема

## Flow Container

flow-container-back = Назад

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Паўторна ўвядзіце пароль для бяспекі
flow-recovery-key-confirm-pwd-input-label = Увядзіце ваш пароль
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Стварыць ключ аднаўлення ўліковага запісу
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Стварыць новы ключ аднаўлення ўліковага запісу

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Ключ аднаўлення ўліковага запісу створаны — сцягніце і захавайце яго зараз
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Гэты ключ дазваляе аднавіць вашы дадзеныя, калі вы забыліся пароль. Сцягніце яго зараз і захавайце ў памятным месцы — вы не зможаце вярнуцца на гэтую старонку пазней.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Працягнуць без сцягвання

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Ключ аднаўлення ўліковага запісу створаны

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Стварыце ключ аднаўлення ўліковага запісу на выпадак, калі вы забудзеце пароль
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Змяніце свой ключ аднаўлення ўліковага запісу
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Мы шыфруем дадзеныя аглядання — паролі, закладкі і многае іншае. Гэта выдатна для прыватнасці, але вы можаце страціць свае дадзеныя, калі забудзеце пароль.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Вось чаму стварэнне ключа аднаўлення ўліковага запісу так важна — вы можаце выкарыстаць яго для аднаўлення дадзеных.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Пачаць
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Скасаваць

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Увядзіце код пацверджання
flow-setup-phone-confirm-code-input-label = Увядзіце 6-значны код
flow-setup-phone-confirm-code-button = Сцвердзіць
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Код пратэрмінаваны?
flow-setup-phone-confirm-code-resend-code-button = Паўторна адправіць код

## HeaderLockup component, the header in account settings

header-menu-open = Закрыць меню
header-menu-closed = Меню навігацыі па сайце
header-back-to-top-link =
    .title = Вярнуцца ўгару
header-title-2 = { -product-mozilla-account }
header-help = Даведка

## Linked Accounts section

la-heading = Звязаныя ўліковыя запісы
la-description = Вы дазволілі доступ да наступных уліковых запісаў.
la-unlink-button = Адвязаць
la-unlink-account-button = Адвязаць
la-set-password-button = Задаць пароль
la-unlink-heading = Адвязаць ад старонняга ўліковага запісу
la-unlink-content-3 = Вы ўпэўнены, што хочаце адвязаць свой акаўнт? Адвязванне ўліковага запісу не прывядзе да аўтаматычнага выхаду з падключаных паслуг. Для гэтага вам трэба будзе ўручную выйсці ў раздзела «Падключаныя паслугі».
la-unlink-content-4 = Перш чым адвязаць уліковы запіс, вы павінны ўсталяваць пароль. Без пароля вы не зможаце ўвайсці ў сістэму пасля адлучэння свайго ўліковага запісу.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Закрыць
modal-cancel-button = Скасаваць
modal-default-confirm-button = Пацвердзіць

## ModalMfaProtected

# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Адправіць новы код па электроннай пошце.

## Modal Verify Session

mvs-verify-your-email-2 = Пацвердзіце сваю электронную пошту
mvs-enter-verification-code-2 = Увядзіце код пацверджання
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Калі ласка, увядзіце код пацвярджэння, адпраўлены на адрас <email>{ $email }</email> на працягу 5 хвілін.
msv-cancel-button = Скасаваць
msv-submit-button-2 = Сцвердзіць

## Settings Nav

nav-settings = Налады
nav-profile = Профіль
nav-security = Бяспека
nav-connected-services = Падключаныя паслугі
nav-data-collection = Збор і выкарыстанне звестак
nav-paid-subs = Платныя падпіскі
nav-email-comm = Зносіны па электроннай пошце

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Узнікла праблема пры замене вашых рэзервовых кодаў аўтэнтыфікацыі
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Узнікла праблема пры стварэнні вашых рэзервовых кодаў аўтэнтыфікацыі

## Avatar change page

avatar-page-title =
    .title = Выява профілю
avatar-page-add-photo = Дадаць фота
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Зрабіць фота
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Выдаліць фота
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Перазняць фота
avatar-page-cancel-button = Скасаваць
avatar-page-save-button = Захаваць
avatar-page-saving-button = Захаванне…
avatar-page-zoom-out-button =
    .title = Паменшыць
avatar-page-zoom-in-button =
    .title = Павялічыць
avatar-page-rotate-button =
    .title = Павярнуць
avatar-page-camera-error = Немагчыма ініцыялізаваць камеру
avatar-page-new-avatar =
    .alt = новая выява профілю
avatar-page-file-upload-error-3 = Узнікла праблема з зацягваннем выявы профілю
avatar-page-delete-error-3 = Узнікла праблема з выдаленнем выявы профілю
avatar-page-image-too-large-error-2 = Памер файла выявы занадта вялікі для зацягвання

## Password change page

pw-change-header =
    .title = Змяніць пароль
pw-8-chars = Мінімум 8 знакаў
pw-not-email = Не ваш адрас электроннай пошты
pw-change-must-match = Новы пароль адпавядае пацверджанню
pw-commonly-used = Не часта выкарыстаны пароль
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Будзьце ў бяспецы - не выкарыстоўвайце паролі паўторна. Даведайцеся больш пра <linkExternal>стварэнне надзейных пароляў</linkExternal>.
pw-change-cancel-button = Скасаваць
pw-change-save-button = Захаваць
pw-change-forgot-password-link = Забыліся на пароль?
pw-change-current-password =
    .label = Увядзіце цяперашні пароль
pw-change-new-password =
    .label = Увядзіце новы пароль
pw-change-confirm-password =
    .label = Пацвердзіце новы пароль
pw-change-success-alert-2 = Пароль абноўлены

## Password create page

pw-create-header =
    .title = Стварыць пароль
pw-create-success-alert-2 = Пароль усталяваны
pw-create-error-2 = На жаль, падчас усталявання вашага пароля узнікла праблема

## Delete account page

delete-account-header =
    .title = Выдаліць уліковы запіс
delete-account-step-1-2 = Крок 1 з 2
delete-account-step-2-2 = Крок 2 з 2
delete-account-confirm-title-4 = Магчыма, вы падключылі свой { -product-mozilla-account } да аднаго ці некалькіх з наступных прадуктаў або паслуг { -brand-mozilla }, якія забяспечваюць вашу бяспеку і прадукцыйнасць у Інтэрнэце:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Сінхранізуюцца звесткі { -brand-firefox }
delete-account-product-firefox-addons = Дадаткі { -brand-firefox }
delete-account-acknowledge = Калі ласка, пацвердзіце, што пры выдаленні ўліковага запісу:
delete-account-chk-box-2 =
    .label = Вы можаце страціць захаваную інфармацыю і функцыі ў прадуктах { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Паўторнае падключэнне на гэту электронную пошту можа не аднавіць захаваную інфармацыю
delete-account-chk-box-4 =
    .label = Любыя пашырэнні і тэмы, якія вы апублікавалі на addons.mozilla.org, будуць выдалены
delete-account-continue-button = Працягнуць
delete-account-password-input =
    .label = Увядзіце пароль
delete-account-cancel-button = Скасаваць
delete-account-delete-button-2 = Выдаліць

## Display name page

display-name-page-title =
    .title = Бачнае імя
display-name-input =
    .label = Увядзіце бачнае імя
submit-display-name = Захаваць
cancel-display-name = Скасаваць
display-name-update-error-2 = Узнікла праблема з абнаўленнем бачнага імені
display-name-success-alert-2 = Бачнае імя абноўлена

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Апошнія дзеянні ўліковага запісу
recent-activity-account-create-v2 = Уліковы запіс створаны
recent-activity-account-disable-v2 = Уліковы запіс адключаны
recent-activity-account-enable-v2 = Уліковы запіс уключаны
recent-activity-account-login-v2 = Пачаты ўваход у ўліковы запіс
recent-activity-account-reset-v2 = Пачаты скід пароля
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Адмовы электроннай пошты ачышчаны
recent-activity-account-login-failure = Спроба ўваходу ў уліковы запіс не ўдалася
recent-activity-account-two-factor-added = Двухэтапная аўтарызацыя ўключана
recent-activity-account-two-factor-requested = Запытана двухэтапная аўтарызацыя
recent-activity-account-two-factor-failure = Двухэтапная аўтарызацыя не ўдалася
recent-activity-account-two-factor-success = Двухэтапная аўтарызацыя паспяховая
recent-activity-account-two-factor-removed = Двухэтапная аўтарызацыя выдалена
recent-activity-account-password-reset-requested = Уліковы запіс запытаў скід пароля
recent-activity-account-password-reset-success = Скід пароля ўліковага запісу паспяховы
recent-activity-account-recovery-key-added = Ключ аднаўлення ўліковага запісу ўключаны
recent-activity-account-recovery-key-verification-failure = Праверка ключа аднаўлення ўліковага запісу не ўдалася
recent-activity-account-recovery-key-verification-success = Праверка ключа аднаўлення ўліковага запісу паспяховая
recent-activity-account-recovery-key-removed = Ключ аднаўлення ўліковага запісу выдалены
recent-activity-account-password-added = Дададзены новы пароль
recent-activity-account-password-changed = Пароль зменены
recent-activity-account-secondary-email-added = Дададзены другі адрас электроннай пошты
recent-activity-account-secondary-email-removed = Другі адрас электроннай пошты выдалены
recent-activity-account-emails-swapped = Асноўны і другі адрас электроннай пошты памяняліся месцамі
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Іншыя дзеянні ўліковага запісу

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Ключ аднаўлення ўліковага запісу
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Вярнуцца да наладаў

## Add secondary email page

add-secondary-email-step-1 = Крок 1 з 2
add-secondary-email-error-2 = Узнікла праблема падчас дадання гэтага адраса электроннай пошты
add-secondary-email-page-title =
    .title = Дадатковая пошта
add-secondary-email-enter-address =
    .label = Увядзіце адрас электроннай пошты
add-secondary-email-cancel-button = Скасаваць
add-secondary-email-save-button = Захаваць

## Verify secondary email page

add-secondary-email-step-2 = Крок 2 з 2
verify-secondary-email-page-title =
    .title = Дадатковая пошта
verify-secondary-email-verification-code-2 =
    .label = Увядзіце код пацверджання
verify-secondary-email-cancel-button = Скасаваць
verify-secondary-email-verify-button-2 = Пацвердзіць
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Калі ласка, увядзіце код пацвярджэння, адпраўлены на адрас <strong>{ $email }</strong> цягам 5 хвілін.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } паспяхова дададзены

##

# Link to delete account on main Settings page
delete-account-link = Выдаліць уліковы запіс

## Profile section

profile-heading = Профіль
profile-picture =
    .header = Выява
profile-display-name =
    .header = Бачнае імя
profile-primary-email =
    .header = Асноўны адрас пошты

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Крок { $currentStep } з { $numberOfSteps }.

## Security section of Setting

security-heading = Бяспека
security-password =
    .header = Пароль
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Створаны { $date }
security-not-set = Не ўстаноўлены
security-action-create = Стварыць
security-set-password = Усталюйце пароль для сінхранізацыі і выкарыстання пэўных функцый бяспекі ўліковага запісу.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Паглядзець апошнія дзеянні ўліковага запісу

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Выключыць
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Уключыць
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Высыланне…
switch-is-on = укл
switch-is-off = выкл

## Sub-section row Defaults

row-defaults-action-add = Дадаць
row-defaults-action-change = Змяніць
row-defaults-action-disable = Адключыць
row-defaults-status = Няма

## Account recovery key sub-section on main Settings page

rk-header-1 = Ключ аднаўлення ўліковага запісу
rk-enabled = Уключаны
rk-not-set = Не ўстаноўлены
rk-action-create = Стварыць
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Змяніць
rk-action-remove = Выдаліць
rk-key-removed-2 = Ключ аднаўлення ўліковага запісу выдалены
rk-cannot-remove-key = Ключ аднаўлення вашага уліковага запісу не можа быць выдалены.
rk-refresh-key-1 = Абнавіць ключ аднаўлення ўліковага запісу
rk-content-explain = Аднавіце сваю інфармацыі, калі забудзеце пароль.
rk-cannot-verify-session-4 = На жаль, узнікла праблема з пацвярджэннем сеансу
rk-remove-modal-heading-1 = Выдаліць ключ аднаўлення ўліковага запісу?
rk-remove-modal-content-1 =
    У выпадку скіду пароля, вы не зможаце выкарыстаць свой ключ
    аднаўлення ўліковага запісу для доступу да вашых даных. Гэта дзеянне нельга скасаваць.
rk-remove-error-2 = Не атрымалася выдаліць ключ аднаўлення ўліковага запісу
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Выдаліць ключ аднаўлення ўліковага запісу

## Secondary email sub-section on main Settings page

se-heading = Дадатковая пошта
    .header = Дадатковая пошта
se-cannot-refresh-email = На жаль, пры абнаўленні гэтага адраса электроннай пошты ўзнікла праблема
se-cannot-resend-code-3 = На жаль, пры паўторнай адпраўцы праверачнага кода узнікла праблема
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } цяпер ваш асноўны адрас электроннай пошты
se-set-primary-error-2 = На жаль, пры змене вашага асноўнага адраса электроннай пошты ўзнікла праблема
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } паспяхова выдалены
se-delete-email-error-2 = На жаль, пры выдаленні гэтага адраса электроннай пошты ўзнікла праблема
se-verify-session-3 = Вам патрэбна пацвердзіць сваю бягучую сесію для выканання гэтага дзеяння
se-verify-session-error-3 = На жаль, узнікла праблема з пацвярджэннем сеансу
# Button to remove the secondary email
se-remove-email =
    .title = Выдаліць электронную пошту
# Button to refresh secondary email status
se-refresh-email =
    .title = Абнавіць электронную пошту
se-unverified-2 = непацверджаны
se-resend-code-2 =
    Патрабуецца пацверджанне. <button>Паўторна адправіць код пацверджання</button>
    калі яго няма ў вашай папцы «Уваходныя» ці «Спам».
# Button to make secondary email the primary
se-make-primary = Зрабіць асноўным
se-default-content = Атрымайце доступ да свайго ўліковага запісу, калі вы не можаце ўвайсці з дапамогай асноўнага адраса электроннай пошты.
se-content-note-1 =
    Заўвага: дадатковы адрас электроннай пошты не дазваляе аднавіць вашу інфармацыю.
    Для гэтага вам спатрэбіцца <a>ключ аднаўлення ўліковага запісу</a>.
# Default value for the secondary email
se-secondary-email-none = Няма

## Two Step Auth sub-section on Settings main page

tfa-row-header = Двухэтапная аўтарызацыя
tfa-row-enabled = Уключана
tfa-row-action-add = Дадаць
tfa-row-action-disable = Адключыць
tfa-row-button-refresh =
    .title = Абнавіць двухэтапную аўтарызацыю
tfa-row-cannot-refresh =
    На жаль, пры абнаўленні двухэтапнай
    аўтэнтыфікацыі узнікла праблема.
tfa-row-cannot-verify-session-4 = На жаль, узнікла праблема з пацвярджэннем сеансу
tfa-row-disable-modal-heading = Адключыць двухэтапную аўтарызацыю?
tfa-row-disable-modal-confirm = Адключыць
tfa-row-disable-modal-explain-1 =
    Вы не зможаце скасаваць гэта дзеянне. У вас таксама
    ёсць магчымасць <linkExternal>замяніць рэзервовыя коды аўтэнтыфікацыі</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Двухэтапная аўтарызацыя адключана
tfa-row-cannot-disable-2 = Немагчыма адключыць двухэтапную аўтарызацыю

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Працягваючы, вы згаджаецеся з:
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Працягваючы, вы згаджаецеся з <mozillaAccountsTos>умовамі абслугоўвання</mozillaAccountsTos> і <mozillaAccountsPrivacy>паведамленнем аб прыватнасці</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Або
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Увайсці з дапамогай
continue-with-google-button = Працягнуць з { -brand-google }
continue-with-apple-button = Працягнуць з { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Невядомы ўліковы запіс
auth-error-103 = Няправільны пароль
auth-error-105-2 = Нядзейсны код пацверджання
auth-error-110 = Нядзейсны токен
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Вы зрабілі надта шмат спробаў. Калі ласка, паспрабуйце зноў пазней.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Вы зрабілі дужа шмат спробаў. Паспрабуйце зноў { $retryAfter }.
auth-error-138-2 = Непацверджаны сеанс
auth-error-139 = Другі адрас электроннай пошты мусіць адрознівацца ад асноўнага
auth-error-155 = TOTP-токен не знойдзены
auth-error-159 = Нядзейсны ключ аднаўлення ўліковага запісу
auth-error-183-2 = Несапраўдны або пратэрмінаваны код пацвярджэння
auth-error-999 = Нечаканая памылка
auth-error-1003 = Лакальнае сховішча або кукі па-ранейшаму адключаны
auth-error-1008 = Ваш новы пароль павінен адрознівацца
auth-error-1011 = Патрэбен сапраўдны адрас электроннай пошты
auth-error-1018 = Ваш электронны ліст пацверджання толькі што вярнуўся. Памылка ўпісвання адраса?
auth-error-1067 = Няправільна набраны адрас пошты?

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Вы ўвайшлі ў { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Электронная пошта пацверджана
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Уваход пацверджаны
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Увайдзіце ў гэты { -brand-firefox }, каб закончыць наладу
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Увайсці
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Яшчэ дадаяце прылады? Увайдзіце ў { -brand-firefox } на іншай прыладзе, каб закончыць наладу
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Увайдзіце ў { -brand-firefox } на іншай прыладзе, каб закончыць наладу
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Хочаце атрымаць свае карткі, закладкі і паролі на іншай прыладзе?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Падключыць іншую прыладу
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Не зараз
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Увайдзіце ў { -brand-firefox } для Android, каб закончыць наладу
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Увайдзіце ў { -brand-firefox } для iOS, каб закончыць наладу

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Лакальнае сховішча і кукі абавязковыя
cookies-disabled-enable-prompt-2 = Калі ласка, уключыце кукі і лакальнае сховішча ў вашым браўзеры для доступу да свайго { -product-mozilla-account }. Гэта дасць магчымасць помніць вас паміж сеансамі.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Паспрабаваць зноў
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Падрабязней

## Index / home page

index-header = Увядзіце сваю электронную пошту
index-relay-header = Стварыць маску электроннай пошты
index-cta = Зарэгістравацца або ўвайсці
index-email-input =
    .label = Увядзіце сваю электронную пошту

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Скасаваць наладку
inline-totp-setup-continue-button = Працягнуць
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Дадайце ўзровень бяспекі да свайго ўліковага запісу, патрабуючы коды аўтарызацыі з адной з <authenticationAppsLink>гэтых праграм аўтэнтыфікацыі</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Уключыце двухэтапную аўтарызацыю, <span>каб перайсці да налад уліковага запісу</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Уключыце двухэтапную аўтарызацыю, <span>каб перайсці да { $serviceName }</span>
inline-totp-setup-ready-button = Гатова
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Скануйце код аўтарызацыі, <span>каб перайсці да { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Увядзіце код уручную, <span>каб перайсці да { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Скануйце код аўтарызацыі, <span>каб перайсці да налад уліковага запісу</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Увядзіце код уручную, <span>каб перайсці да налад уліковага запісу</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Увядзіце гэты сакрэтны ключ у сваю праграму аўтэнтыфікацыі. <toggleToQRButton>Сканаваць QR-код замест?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Адскануйце QR-код у сваёй праграме аўтэнтыфікацыі, а затым увядзіце код аўтарызацыі, які яна выдае. <toggleToManualModeButton>Не можаце сканаваць код?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Пасля завяршэння яна пачне генераваць коды аўтарызацыі для ўвядзення.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Код аўтарызацыі

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Прававыя звесткі
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Умовы абслугоўвання
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Паведамленне аб прыватнасці

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Паведамленне аб прыватнасці

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Умовы абслугоўвання

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Вы толькі што ўвайшлі ў { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Так, пацвердзіць прыладу
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Калі гэта былі не вы, <link>змяніце пароль</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Прылада падключана
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Зараз вы сінхранізуецеся з: { $deviceFamily } на { $deviceOS }
pair-auth-complete-sync-benefits-text = Цяпер вы можаце атрымаць доступ да адкрытых картак, пароляў і закладак на ўсіх сваіх прыладах.
pair-auth-complete-see-tabs-button = Праглядайце карткі на сінхранізаваных прыладах
pair-auth-complete-manage-devices-link = Кіраваць прыладамі

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Увядзіце код аўтарызацыі, <span>каб перайсці да налад уліковага запісу</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Увядзіце код аўтарызацыі, <span>каб перайсці да { $serviceName }</span>
auth-totp-instruction = Адкрыйце праграму аўтэнтыфікацыі і ўвядзіце код, які яна выдае.
auth-totp-input-label = Увядзіце 6-значны код
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Пацвердзіць
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Патрабуецца код аўтэнтыфікацыі

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Цяпер патрэбна пацвярджэнне <span>з іншай вашай прылады</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Спарванне не ўдалося
pair-failure-message = Працэс усталявання быў спынены.

## Pair index page

pair-sync-header = Сінхранізуйце { -brand-firefox } на тэлефоне або планшэце
pair-cad-header = Падключыць { -brand-firefox } на іншай прыладзе
pair-already-have-firefox-paragraph = Ужо маеце { -brand-firefox } на тэлефоне або планшэце?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Сінхранізуйце вашу прыладу
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = або сцягніце
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Скануйце, каб сцягнуць { -brand-firefox } для мабільнага, або адпраўце сабе <linkExternal>спасылку для сцягвання</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Не зараз
pair-take-your-data-message = Бярыце з сабой карткі, закладкі і паролі ўсюды, дзе вы карыстаецеся { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Пачаць
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-код

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Прылада злучана
pair-success-message-2 = Спарванне прайшло паспяхова.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Пацвердзіце спарванне <span>для { $email }</span>
pair-supp-allow-confirm-button = Пацвердзіце спарванне
pair-supp-allow-cancel-link = Скасаваць

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Цяпер патрэбна пацвярджэнне <span>з іншай вашай прылады</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Спарванне з дапамогай праграмы
pair-unsupported-message = Выкарыстоўвалі сістэмную камеру? Вы мусіце спарваць знутры праграмы { -brand-firefox }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Калі ласка, пачакайце, вы будзеце перанакіраваны ў аўтарызаваную праграму.

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Пароль усталяваны
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = На жаль, падчас усталявання вашага пароля узнікла праблема

# ConfirmBackupCodeResetPassword page


## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Праверце сваю электронную пошту
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Працягнуць
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Паўторна адправіць код
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Выкарыстаць іншы уліковы запіс

## ResetPassword start page

password-reset-flow-heading = Скінуць пароль
password-reset-email-input =
    .label = Увядзіце сваю электронную пошту

## ResetPasswordConfirmed

reset-password-complete-header = Ваш пароль быў скінуты

## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = Пароль паспяхова скінуты

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Памылка:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Праверка ўваходу…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Памылка пацверджання
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Тэрмін дзеяння спасылкі для пацвярджэння скончыўся

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Увядзіце пароль <span>для свайго { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Працягнуць у { $serviceName }
signin-subheader-without-logo-default = Перайсці да налад уліковага запісу
signin-button = Увайсці
signin-header = Увайсці
signin-use-a-different-account-link = Выкарыстаць іншы уліковы запіс
signin-forgot-password-link = Забылі пароль?

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-header = Паведаміць пра неаўтарызаваны ўваход?
signin-bounced-header = Прабачце. Мы заблакавалі ваш уліковы запіс.
# $email (string) - The user's email.
signin-bounced-message = Электронны ліст з пацвярджэннем, які мы адправілі на { $email }, быў вернуты, і мы заблакавалі ўліковы запіс, каб абараніць вашы звесткі { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Калі гэта сапраўдны адрас электроннай пошты, <linkExternal>паведаміце нам пра гэта</linkExternal>, і мы дапаможам разблакаваць ваш уліковы запіс.
signin-bounced-create-new-account = Больш не валодаеце гэтым адрасам? Стварыце новы ўліковы запіс
back = Назад

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-send-email-link = Выслаць код на эл. пошту

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Увайсці

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Увайсці
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Сцвердзіць
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Вы заблакаваны?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Патрабуецца рэзервовы код аўтарызацыі

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Увайсці

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Дзякуем за вашу пільнасць
signin-reported-message = Наша каманда апавешчана. Такія паведамленні дапамагаюць нам стрымліваць зламыснікаў.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Увядзіце код пацверджання <span>для свайго { -product-mozilla-account }</span>
signin-token-code-input-label-v2 = Увядзіце 6-значны код
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Сцвердзіць
signin-token-code-code-expired = Код пратэрмінаваны?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Адправіць новы код па электроннай пошце.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Патрэбен код пацвярджэння
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } паспрабуе адаслаць вас назад на выкарыстанне маскі электроннай пошты пасля ўваходу.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Увайсці
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Сцвердзіць
signin-totp-code-other-account-link = Выкарыстаць іншы уліковы запіс
signin-totp-code-recovery-code-link = Праблема з уводам кода?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Патрабуецца код аўтэнтыфікацыі

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Аўтарызуйце гэты ўваход
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Праверце ў сваёй электроннай пошце код аўтарызацыі, дасланы на { $email }.
signin-unblock-code-input = Увядзіце код аўтарызацыі
signin-unblock-submit-button = Працягнуць
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Патрэбен код аўтарызацыі
signin-unblock-resend-code-button = Няма ў уваходных ці ў спаме? Выслаць яшчэ раз
signin-unblock-support-link = Чаму гэта адбываецца?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } паспрабуе адаслаць вас назад на выкарыстанне маскі электроннай пошты пасля ўваходу.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Увядзіце код пацвярджэння
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Увядзіце код пацвярджэння <span>для свайго { -product-mozilla-account }</span>
confirm-signup-code-input-label = Увядзіце 6-значны код
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Сцвердзіць
confirm-signup-code-code-expired = Код пратэрмінаваны?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Адправіць новы код па электроннай пошце.
confirm-signup-code-success-alert = Уліковы запіс паспяхова пацверджаны
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Патрабуецца код пацвярджэння
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } паспрабуе адаслаць вас назад на выкарыстанне маскі электроннай пошты пасля ўваходу.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Змяніць адрас электроннай пошты
