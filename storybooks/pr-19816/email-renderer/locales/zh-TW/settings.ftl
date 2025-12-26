# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = 已將新代碼寄送到您的信箱。
resend-link-success-banner-heading = 已將新鏈結寄送到您的信箱。
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = 請將 { $accountsEmail } 加到通訊錄以確保收信正常。

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = 關閉橫幅
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = 11 月 1 日起，{ -product-firefox-accounts }將更名為 { -product-mozilla-accounts }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = 您仍可使用相同的帳號與密碼登入，能使用的產品服務內容也維持不變。
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = 我們已將 { -product-firefox-accounts }更名為 { -product-mozilla-accounts }。您仍可使用相同的帳號與密碼登入，能使用的產品服務內容也維持不變。
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = 更多資訊
# Alt text for close banner image
brand-close-banner =
    .alt = 關閉橫幅
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m 標誌

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = 上一頁
button-back-title = 上一頁

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = 下載並繼續
    .title = 下載並繼續
recovery-key-pdf-heading = 帳號救援金鑰
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = 產生於：{ $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = 帳號救援金鑰
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = 若您忘記密碼，此金鑰可讓您救回瀏覽器的加密資料（包含網站密碼、書籤、瀏覽紀錄）。請將此金鑰保存於可找回的地方。
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = 金鑰存放位置
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = 了解帳號救援金鑰的更多資訊
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = 很抱歉，下載帳號救援金鑰時發生問題。

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = 獲得 { -brand-mozilla } 的更多消息：
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = 獲得我們的最新消息與最新產品資訊
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = 搶先體驗最新產品
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = 採取行動奪回網路環境

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = 已下載
datablock-copy =
    .message = 已複製
datablock-print =
    .message = 已列印

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success = 已複製代碼
datablock-download-success = 已下載代碼
datablock-print-success = 已列印代碼

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = 已複製！

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $country } { $region } { $city }（估計地點）
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $country } { $region }（估計地點）
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $country } { $city }（估計地點）
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country }（估計地點）
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = 未知地點
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $genericOSName } 上的 { $browserName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP 位置：{ $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = 密碼
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = 重複輸入密碼
form-password-with-inline-criteria-signup-submit-button = 註冊帳號
form-password-with-inline-criteria-reset-new-password =
    .label = 新密碼
form-password-with-inline-criteria-confirm-password =
    .label = 請再次輸入密碼
form-password-with-inline-criteria-reset-submit-button = 建立新密碼
form-password-with-inline-criteria-set-password-new-password-label =
    .label = 密碼
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = 重複輸入密碼
form-password-with-inline-criteria-set-password-submit-button = 開始同步
form-password-with-inline-criteria-match-error = 密碼不符合
form-password-with-inline-criteria-sr-too-short-message = 密碼必須包含至少 8 個字元。
form-password-with-inline-criteria-sr-not-email-message = 密碼不得包含您的電子郵件地址。
form-password-with-inline-criteria-sr-not-common-message = 密碼不能是被普遍使用的密碼。
form-password-with-inline-criteria-sr-requirements-met = 輸入的密碼應符合所有要求。
form-password-with-inline-criteria-sr-passwords-match = 輸入的密碼相符。

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = 此欄位必填

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = 請輸入 { $codeLength } 位數的驗證碼繼續
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = 請輸入 { $codeLength } 個字元的驗證碼繼續

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } 帳號救援金鑰
get-data-trio-title-backup-verification-codes = 備用驗證碼
get-data-trio-download-2 =
    .title = 下載
    .aria-label = 下載
get-data-trio-copy-2 =
    .title = 複製
    .aria-label = 複製
get-data-trio-print-2 =
    .title = 列印
    .aria-label = 列印

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = 警告
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = 注意
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = 警告
authenticator-app-aria-label =
    .aria-label = 驗證器應用程式
backup-codes-icon-aria-label-v2 =
    .aria-label = 已啟用備用驗證碼
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = 已停用備用驗證碼
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = 已啟用救援簡訊
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = 已停用救援簡訊
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = 加拿大國旗
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = 勾選
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = 成功
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = 啟用
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = 關閉訊息
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = 驗證碼
error-icon-aria-label =
    .aria-label = 錯誤
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = 資訊
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = 美國國旗

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = 一台電腦與一支手機，當中分別有破碎的心
hearts-verified-image-aria-label =
    .aria-label = 一台電腦、一支手機與一台平板電腦，各自有一顆跳動中的心
signin-recovery-code-image-description =
    .aria-label = 包含隱藏文字的文件。
signin-totp-code-image-label =
    .aria-label = 包含隱藏六位數安全碼的裝置。
confirm-signup-aria-label =
    .aria-label = 包含鏈結的信封
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = 表示帳號救援金鑰的插圖。
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = 表示帳號救援金鑰的插圖。
password-image-aria-label =
    .aria-label = 展示密碼輸入過程的示意圖。
lightbulb-aria-label =
    .aria-label = 請使用者建立備份儲存位置提示的插圖。
email-code-image-aria-label =
    .aria-label = 表示出一封含有確認碼的電子郵件的圖片。
recovery-phone-image-description =
    .aria-label = 透過簡訊收到驗證碼的行動裝置。
recovery-phone-code-image-description =
    .aria-label = 在行動裝置上收到的驗證碼。
backup-recovery-phone-image-aria-label =
    .aria-label = 可收發簡訊的行動裝置
backup-authentication-codes-image-aria-label =
    .aria-label = 裝置畫面中顯示驗證碼
sync-clouds-image-aria-label =
    .aria-label = 雲端同步圖示
confetti-falling-image-aria-label =
    .aria-label = 射出紙花的動畫

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = 您已登入 { -brand-firefox }。
inline-recovery-key-setup-create-header = 讓您的帳號更安全
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = 要不要花點時間來保護您的資料？
inline-recovery-key-setup-info = 建立帳號救援金鑰，就算忘記密碼也能還原同步過的瀏覽資料。
inline-recovery-key-setup-start-button = 產生帳號救援金鑰
inline-recovery-key-setup-later-button = 稍後再做

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = 隱藏密碼
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = 顯示密碼
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = 您的密碼目前顯示在畫面上。
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = 您的密碼目前隱藏。
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = 您的密碼現在顯示在畫面上。
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = 您的密碼現在已隱藏。

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = 選擇國家
input-phone-number-enter-number = 請輸入手機號碼
input-phone-number-country-united-states = 美國
input-phone-number-country-canada = 加拿大
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = 上一頁

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = 重設密碼鏈結已毀損
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = 驗證鏈結無效
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = 鏈結毀損
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = 您點擊的鏈結可能缺少了一些字元，或您的收信軟體修改了郵件內容。請確認您複製了完整的網址，再次開啟確認鏈結。

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = 取得新鏈結

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = 想起密碼了嗎？
# link navigates to the sign in page
remember-password-signin-link = 登入

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = 主要電子郵件地址已經驗證過了
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = 已確認過此次登入
confirmation-link-reused-message = 該確認鏈結只能使用一次，已經被使用過了。

## Locale Toggle Component

locale-toggle-select-label = 選擇語言
locale-toggle-browser-default = 瀏覽器預設值
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = 請求錯誤

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = 需要使用此密碼才能存取所有您儲存在我們這的加密資料。
password-info-balloon-reset-risk-info = 進行重設，可能會失去網頁密碼、書籤等資料。

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = 請使用您從未使用過的、足夠強大的密碼。密碼應符合下列安全性要求：
password-strength-short-instruction = 使用較強的密碼：
password-strength-inline-min-length = 至少八個字元長
password-strength-inline-not-email = 不可以與您的電子郵件地址相同
password-strength-inline-not-common = 不可以是常見的密碼
password-strength-inline-confirmed-must-match = 再次輸入的密碼與新密碼相符
password-strength-inline-passwords-match = 密碼符合

## Notification Promo Banner component

account-recovery-notification-cta = 建立
account-recovery-notification-header-value = 就算忘記密碼也不失去資料
account-recovery-notification-header-description = 建立帳號救援金鑰，讓您在忘記密碼時也能還原同步過的瀏覽資料。
recovery-phone-promo-cta = 新增救援電話號碼
recovery-phone-promo-heading = 使用救援電話號碼，為您的帳號再加一層保護
recovery-phone-promo-description = 現在起，若您無法使用兩階段驗證應用程式，還可以透過接收簡訊驗證碼的方式來登入。
recovery-phone-promo-info-link = 了解救援與 SIM Swap 風險的更多資訊
promo-banner-dismiss-button =
    .aria-label = 關閉橫幅

## Ready component

ready-complete-set-up-instruction = 請到您另一台 { -brand-firefox } 裝置中輸入新密碼完成設定。
manage-your-account-button = 管理帳號
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = 您可以使用 { $serviceName } 了
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = 已經準備好可以進入帳號設定
# Message shown when the account is ready but the user is not signed in
ready-account-ready = 您的帳號準備好了！
ready-continue = 繼續
sign-in-complete-header = 登入完成
sign-up-complete-header = 帳號已確認
primary-email-verified-header = 已驗證主要電子郵件地址

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = 金鑰存放位置：
flow-recovery-key-download-storage-ideas-folder-v2 = 安全裝置上的資料夾
flow-recovery-key-download-storage-ideas-cloud = 可靠的雲端儲存服務
flow-recovery-key-download-storage-ideas-print-v2 = 印出紙本
flow-recovery-key-download-storage-ideas-pwd-manager = 密碼管理員

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = 加入能協助您找到金鑰的提示
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = 未來萬一需要透過密碼重設功能來救回資料時，我們可透過此提示來提醒您把帳號救援金鑰保存在何處。
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = 輸入提示（選填）
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = 完成
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = 提示不可以超過 255 個字。
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = 提示內容不可使用 Unicode 特殊字元，僅接受一般文字、拉丁字母、數字、標點符號。

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = 警告
password-reset-chevron-expanded = 摺疊警告
password-reset-chevron-collapsed = 展開警告
password-reset-data-may-not-be-recovered = 可能無法救回您的上網資料
password-reset-previously-signed-in-device-2 = 有先前登入過的裝置嗎？
password-reset-data-may-be-saved-locally-2 = 您的瀏覽器資料可能還保存在該裝置中，請重設密碼，然後到該裝置登入，即可恢復資料並同步回來。
password-reset-no-old-device-2 = 有新的裝置，但已經沒辦法使用任何先前的裝置了嗎？
password-reset-encrypted-data-cannot-be-recovered-2 = 很抱歉，無法恢復您在 { -brand-firefox } 伺服器上，已加密過的瀏覽器資料。
password-reset-warning-have-key = 之前有保存帳號救援金鑰嗎？
password-reset-warning-use-key-link = 現在即可使用，以重設密碼並保留資料。

## Alert Bar

alert-bar-close-message = 關閉訊息

## User's avatar

avatar-your-avatar =
    .alt = 您的大頭照
avatar-default-avatar =
    .alt = 預設大頭照

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } 產品
bento-menu-tagline = { -brand-mozilla } 更多會保護您隱私的產品
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } Browser 桌面版
bento-menu-firefox-mobile = { -brand-firefox } Browser 行動版
bento-menu-made-by-mozilla = 由 { -brand-mozilla } 打造

## Connect another device promo

connect-another-fx-mobile = 下載行動裝置或平板電腦版本的 { -brand-firefox }
connect-another-find-fx-mobile-2 = 到 { -google-play } 或 { -app-store } 尋找 { -brand-firefox }。
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = 到 { -google-play } 下載 { -brand-firefox }
connect-another-app-store-image-3 =
    .alt = 到 { -app-store } 下載 { -brand-firefox }

## Connected services section

cs-heading = 已連結的服務
cs-description = 您正在使用並登入的所有項目。
cs-cannot-refresh = 很抱歉，重新整理已連結的服務清單時發生問題。
cs-cannot-disconnect = 找不到客戶端，無法取消連線
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = 已登出 { $service }
cs-refresh-button =
    .title = 重新整理已連結的服務
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = 少了什麼東西，或有重複項目嗎？
cs-disconnect-sync-heading = 中斷與 Sync 的連結

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = 您的瀏覽資料將保留在「<span>{ $device }</span>」上，但不再與您的帳號同步。
cs-disconnect-sync-reason-3 = 要取消連結「<span>{ $device }</span>」這台裝置的主要原因是什麼？

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = 裝置是：
cs-disconnect-sync-opt-suspicious = 此裝置看來很可疑
cs-disconnect-sync-opt-lost = 已遺失此裝置
cs-disconnect-sync-opt-old = 已經不再使用此裝置
cs-disconnect-sync-opt-duplicate = 這是重複的裝置
cs-disconnect-sync-opt-not-say = 我不想說

##

cs-disconnect-advice-confirm = 好的，知道了
cs-disconnect-lost-advice-heading = 遭竊或遺失的裝置已離線
cs-disconnect-lost-advice-content-3 = 由於您的裝置遺失或遭竊，為了確保資訊安全，應該到「帳號設定」當中更改 { -product-mozilla-account }的密碼。您也應該洽詢裝置製造商，了解要如何從遠端清除裝置中的資料。
cs-disconnect-suspicious-advice-heading = 可疑裝置已離線
cs-disconnect-suspicious-advice-content-2 = 若中斷連線的裝置看來可疑，為了確保您的資訊安全，應該到「帳號設定」當中更改 { -product-mozilla-account }的密碼。您也應該在網址列輸入 about:logins，更換儲存到 { -brand-firefox } 的所有網站密碼。
cs-sign-out-button = 登出

## Data collection section

dc-heading = 資料收集與使用
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } 瀏覽器
dc-subheader-content-2 = 允許 { -product-mozilla-accounts }傳送技術與互動資料給 { -brand-mozilla }。
dc-subheader-ff-content = 若要確認或更新您的 { -brand-firefox } 瀏覽器技術與互動資料設定，請開啟 { -brand-firefox } 設定，然後開啟「隱私權與安全性」頁面。
dc-opt-out-success-2 = 成功退出。{ -product-mozilla-accounts }將不再傳送技術或互動資料給 { -brand-mozilla }。
dc-opt-in-success-2 = 感謝您！分享此資料可協助我們改進 { -product-mozilla-accounts }。
dc-opt-in-out-error-2 = 很抱歉，更改您的資料收集偏好設定時發生問題
dc-learn-more = 了解更多

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } 選單
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = 已登入為
drop-down-menu-sign-out = 登出
drop-down-menu-sign-out-error-2 = 很抱歉，將您登出時發生問題

## Flow Container

flow-container-back = 上一頁

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = 為了保護帳號安全，請重新輸入密碼
flow-recovery-key-confirm-pwd-input-label = 請輸入您的密碼
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = 產生帳號救援金鑰
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = 產生新的帳號救援金鑰

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = 已建立帳號救援金鑰 — 請立即下載並儲存
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = 若您萬一忘記密碼，此金鑰可協助您救回資料。請立即下載，並在您能夠記得找回的方式也備份一份。本頁面只會顯示一次。
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = 不下載繼續

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = 已建立帳號救援金鑰

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = 建立帳號救援金鑰，避免忘記密碼時資料流失
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = 更換您的帳號救援金鑰
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = 我們會為您加密上網資料（密碼、書籤等等資料），對您的隱私很有保護。但要是忘記密碼，可能就會失去這些資料。
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = 所以帳號救援金鑰相當重要，萬一忘記密碼時，還可以用這把金鑰救回資料。
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = 開始使用
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = 取消

## FlowSetup2faApp

flow-setup-2fa-qr-heading = 連結您的驗證程式
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>第 1 步：</strong>使用任何驗證程式（例如 Duo 或 Google Authenticator）掃描下列這組 QR Code。
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = 用來設定兩階段驗證的 QR Code，請掃描，或點擊「無法掃描 QR Code？」以取得私鑰字串。
flow-setup-2fa-cant-scan-qr-button = 無法掃描 QR Code？
flow-setup-2fa-manual-key-heading = 手動輸入驗證碼
flow-setup-2fa-manual-key-instruction = <strong>第 1 步：</strong>於您想要使用的驗證器程式輸入此代碼。
flow-setup-2fa-scan-qr-instead-button = 改成掃描 QR Code？
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = 了解驗證程式的更多資訊
flow-setup-2fa-button = 繼續
flow-setup-2fa-step-2-instruction = <strong>第 2 步：</strong>使用驗證程式產生的驗證碼。
flow-setup-2fa-input-label = 請輸入六位數的驗證碼
flow-setup-2fa-code-error = 代碼無效或已失效，請確認您的驗證器程式後再試一次。

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = 選擇救援方式
flow-setup-2fa-backup-choice-description = 萬一無法再使用您的行動裝置或驗證程式時，讓您依然能夠登入。
flow-setup-2fa-backup-choice-phone-title = 救援電話號碼
flow-setup-2fa-backup-choice-phone-badge = 最簡單
flow-setup-2fa-backup-choice-phone-info = 透過簡訊接收救援碼，目前只在美國與加拿大提供。
flow-setup-2fa-backup-choice-code-title = 備用驗證碼
flow-setup-2fa-backup-choice-code-badge = 最安全
flow-setup-2fa-backup-choice-code-info = 建立並保存僅可使用一次的驗證碼。
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = 了解救援與 SIM Swap 風險的更多資訊

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = 請輸入備用驗證碼
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = 請輸入任一組備用驗證碼，以確認您已安全記錄下來。如果未來遺失了這些代碼，無法再使用驗證器時可能就無法再登入帳號。
flow-setup-2fa-backup-code-confirm-code-input = 請輸入 10 字元長的驗證碼
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = 完成

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = 儲存備用驗證碼
flow-setup-2fa-backup-code-dl-save-these-codes = 請將驗證碼保存在您記得的地方，萬一無法再使用驗證程式，就要使用備用驗證碼才能登入。
flow-setup-2fa-backup-code-dl-button-continue = 繼續

##

flow-setup-2fa-inline-complete-success-banner = 已開啟兩階段驗證
flow-setup-2fa-inline-complete-success-banner-description = 為了保護您所有的連線裝置，您應該從所有使用此帳號的裝置登出，然後再重新經過新的兩階段驗證登入。
flow-setup-2fa-inline-complete-backup-code = 備用驗證碼
flow-setup-2fa-inline-complete-backup-phone = 救援電話號碼
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info = 還剩下 { $count } 組驗證碼
flow-setup-2fa-inline-complete-backup-code-description = 若您無法再使用行動裝置或驗證程式登入，這是最安全的救援方法。
flow-setup-2fa-inline-complete-backup-phone-description = 若您無法再使用驗證程式登入，這是最簡單的救援方法。
flow-setup-2fa-inline-complete-learn-more-link = 此功能如何保護您的帳號
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = 繼續前往 { $serviceName }
flow-setup-2fa-prompt-heading = 設定兩階段驗證
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } 要求您設定兩階段驗證，以確保帳號安全。
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = 您可以使用<authenticationAppsLink>下列驗證程式</authenticationAppsLink>當中的任一種來設定。
flow-setup-2fa-prompt-continue-button = 繼續

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = 請輸入驗證碼
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = 已透過簡訊將六位數的驗證碼發送至尾碼為 <span>{ $phoneNumber }</span> 的門號，此驗證碼將於 5 分鐘後失效。
flow-setup-phone-confirm-code-input-label = 請輸入六位數的驗證碼
flow-setup-phone-confirm-code-button = 確認
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = 驗證碼失效？
flow-setup-phone-confirm-code-resend-code-button = 重寄驗證碼
flow-setup-phone-confirm-code-resend-code-success = 已傳送驗證碼
flow-setup-phone-confirm-code-success-message-v2 = 已新增救援電話號碼
flow-change-phone-confirm-code-success-message = 已更改救援電話號碼

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = 確認您的手機號碼
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = 您會收到來自 { -brand-mozilla } 的驗證簡訊，當中包含一組驗證碼。請勿將此驗證碼提供給任何人。
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = 救援電話號碼僅提供美國與加拿大使用者使用，不建議使用 VoIP 網路號碼或轉接門號。
flow-setup-phone-submit-number-legal = 提供您的電話號碼，就代表您同意我們將其儲存下來，僅供帳號驗證使用。您可能會被收取簡訊或數據傳輸費用。
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = 傳送驗證碼

## HeaderLockup component, the header in account settings

header-menu-open = 關閉選單
header-menu-closed = 網站導航選單
header-back-to-top-link =
    .title = 回到頁面頂端
header-back-to-settings-link =
    .title = 回到 { -product-mozilla-account }設定
header-title-2 = { -product-mozilla-account }
header-help = 說明

## Linked Accounts section

la-heading = 連結帳號
la-description = 您已授權連結下列帳號。
la-unlink-button = 解除連結
la-unlink-account-button = 解除連結
la-set-password-button = 設定密碼
la-unlink-heading = 解除與第三方帳號的連結
la-unlink-content-3 = 您確定要解除連結帳號嗎？解除連結不會將您自動從連結的服務登出，若想要登出，請到「已連結的服務」區塊手動登出。
la-unlink-content-4 = 解除連結帳號前，必需先設定密碼。若未設定密碼，取消連結後就無法再登入帳號了。
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = 關閉
modal-cancel-button = 取消
modal-default-confirm-button = 確認

## ModalMfaProtected

modal-mfa-protected-title = 請輸入確認碼
modal-mfa-protected-subtitle = 請幫助我們確認是您自己在修改帳號資訊
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction = 請在 { $expirationTime } 分鐘內輸入寄送到 <email>{ $email }</email> 的代碼。
modal-mfa-protected-input-label = 請輸入 6 位數的確認碼
modal-mfa-protected-cancel-button = 取消
modal-mfa-protected-confirm-button = 確認
modal-mfa-protected-code-expired = 驗證碼失效？
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = 重寄新驗證碼。

## Modal Verify Session

mvs-verify-your-email-2 = 確認電子郵件信箱
mvs-enter-verification-code-2 = 請輸入確認碼
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = 請於 5 分鐘內輸入發送到 <email>{ $email }</email> 的驗證碼。
msv-cancel-button = 取消
msv-submit-button-2 = 確認

## Settings Nav

nav-settings = 設定
nav-profile = 個人資料
nav-security = 安全性
nav-connected-services = 已連結的服務
nav-data-collection = 資料收集與使用
nav-paid-subs = 付費訂閱項目
nav-email-comm = 電子郵件通訊

## Page2faChange

page-2fa-change-title = 更改兩階段驗證設定
page-2fa-change-success = 已更新兩階段驗證設定
page-2fa-change-success-additional-message = 為了保護您所有的連線裝置，您應該從所有使用此帳號的裝置登出，然後再重新經過新的兩階段驗證登入。
page-2fa-change-totpinfo-error = 取代您的兩階段驗證設定時發生錯誤，請稍後再試。
page-2fa-change-qr-instruction = <strong>第 1 步：</strong>使用任何驗證器應用程式（例如 Duo 或 Google Authenticator）掃描此 QR Code。這會建立一筆新項目，原本的項目將無法再使用。

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = 備用驗證碼
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = 取代您的備用驗證碼時發生問題
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = 建立您的備用驗證碼時發生問題
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = 已更新備用驗證碼
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = 已產生備用驗證碼
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = 請將這些驗證碼保存在之後能找得到的安全位置。完成下一步之後，所有的舊代碼將被取代。
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = 請在下面輸入任何一組代碼，以確保您已將代碼保存下來。完成這一步驟之後，將停用原先的備用驗證碼。
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = 備用驗證碼不正確

## Page2faSetup

page-2fa-setup-title = 兩階段驗證
page-2fa-setup-totpinfo-error = 設定兩階段驗證時發生錯誤，請稍後再試。
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = 備用驗證碼不正確，請再試一次。
page-2fa-setup-success = 已開啟兩階段驗證
page-2fa-setup-success-additional-message = 為了保護您所有的連線裝置，您應該從所有使用此帳號的裝置登出，然後再重新經過兩階段驗證登入。

## Avatar change page

avatar-page-title =
    .title = 個人資料大頭照
avatar-page-add-photo = 新增照片
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = 拍照
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = 移除照片
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = 重新拍照
avatar-page-cancel-button = 取消
avatar-page-save-button = 儲存
avatar-page-saving-button = 儲存中…
avatar-page-zoom-out-button =
    .title = 縮小
avatar-page-zoom-in-button =
    .title = 放大
avatar-page-rotate-button =
    .title = 旋轉
avatar-page-camera-error = 無法初始化攝影機
avatar-page-new-avatar =
    .alt = 新增個人資料照片
avatar-page-file-upload-error-3 = 更新您的個人資料大頭照時發生問題
avatar-page-delete-error-3 = 刪除您的個人資料大頭照時發生問題
avatar-page-image-too-large-error-2 = 圖片檔案太大，無法上傳

## Password change page

pw-change-header =
    .title = 更改密碼
pw-8-chars = 至少八個字元長
pw-not-email = 不可以與您的電子郵件地址相同
pw-change-must-match = 「新密碼」與「確認新密碼」輸入內容相符
pw-commonly-used = 不可以是常見的密碼
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = 確保安全 — 請勿重複使用密碼。若需有關於建立高安全性密碼的秘訣，<linkExternal>請見此處</linkExternal>。
pw-change-cancel-button = 取消
pw-change-save-button = 儲存
pw-change-forgot-password-link = 忘記密碼？
pw-change-current-password =
    .label = 請輸入您目前的密碼
pw-change-new-password =
    .label = 輸入新密碼
pw-change-confirm-password =
    .label = 確認新密碼
pw-change-success-alert-2 = 已更新密碼

## Password create page

pw-create-header =
    .title = 設定密碼
pw-create-success-alert-2 = 已設定密碼
pw-create-error-2 = 很抱歉，設定您的密碼時發生問題

## Delete account page

delete-account-header =
    .title = 刪除帳號
delete-account-step-1-2 = 第 1 步，共 2 步
delete-account-step-2-2 = 第 2 步，共 2 步
delete-account-confirm-title-4 = 您可能曾經將 { -product-mozilla-account }連結到下列一個或多個可讓您在網路世界中更加安全、做事更有效率的 { -brand-mozilla } 產品：
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox } 的同步資料
delete-account-product-firefox-addons = { -brand-firefox } 附加元件
delete-account-acknowledge = 請確認若刪除帳號：
delete-account-chk-box-1-v4 =
    .label = 將取消您所有已付款的訂閱內容
delete-account-chk-box-2 =
    .label = 您可能會失去 { -brand-mozilla } 產品中儲存的資訊與部分功能
delete-account-chk-box-3 =
    .label = 就算重新啟用此信箱，也不會恢復原存的資訊
delete-account-chk-box-4 =
    .label = 將刪除您所有發佈到 addons.mozilla.org 的擴充套件與佈景主題
delete-account-continue-button = 繼續
delete-account-password-input =
    .label = 輸入密碼
delete-account-cancel-button = 取消
delete-account-delete-button-2 = 刪除

## Display name page

display-name-page-title =
    .title = 顯示名稱
display-name-input =
    .label = 輸入顯示名稱
submit-display-name = 儲存
cancel-display-name = 取消
display-name-update-error-2 = 更新您的顯示名稱時發生錯誤
display-name-success-alert-2 = 已更新顯示名稱

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = 近期帳號活動
recent-activity-account-create-v2 = 已建立帳號
recent-activity-account-disable-v2 = 帳號已停用
recent-activity-account-enable-v2 = 已啟用帳號
recent-activity-account-login-v2 = 帳號開始登入
recent-activity-account-reset-v2 = 開始重設密碼
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = 清除郵件退信狀態
recent-activity-account-login-failure = 帳號嘗試登入失敗
recent-activity-account-two-factor-added = 已開啟兩階段驗證
recent-activity-account-two-factor-requested = 已要求進行兩階段驗證
recent-activity-account-two-factor-failure = 兩階段驗證失敗
recent-activity-account-two-factor-success = 兩階段驗證成功
recent-activity-account-two-factor-removed = 已移除兩階段驗證
recent-activity-account-password-reset-requested = 帳號要求重設密碼
recent-activity-account-password-reset-success = 帳號密碼重設成功
recent-activity-account-recovery-key-added = 已啟用帳號救援金鑰
recent-activity-account-recovery-key-verification-failure = 帳號救援金鑰驗證失敗
recent-activity-account-recovery-key-verification-success = 帳號救援金鑰驗證成功
recent-activity-account-recovery-key-removed = 已刪除救援金鑰
recent-activity-account-password-added = 已設定密碼
recent-activity-account-password-changed = 密碼已修改
recent-activity-account-secondary-email-added = 已加入次要電子郵件地址
recent-activity-account-secondary-email-removed = 已刪除次要電子郵件地址
recent-activity-account-emails-swapped = 已交換主要與次要電子郵件地址
recent-activity-session-destroy = 已登出使用階段
recent-activity-account-recovery-phone-send-code = 已傳送救援電話驗證碼
recent-activity-account-recovery-phone-setup-complete = 救援電話號碼設定完成
recent-activity-account-recovery-phone-signin-complete = 已使用救援電話號碼登入
recent-activity-account-recovery-phone-signin-failed = 使用救援電話號碼登入失敗
recent-activity-account-recovery-phone-removed = 已移除救援電話號碼已移除救援電話號碼
recent-activity-account-recovery-codes-replaced = 已取代備用驗證碼
recent-activity-account-recovery-codes-created = 已設定備用驗證碼
recent-activity-account-recovery-codes-signin-complete = 已使用備用驗證碼登入
recent-activity-password-reset-otp-sent = 已寄出密碼重設確認碼
recent-activity-password-reset-otp-verified = 已驗證密碼重設確認碼
recent-activity-must-reset-password = 必須重設密碼
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = 其他帳號活動

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = 帳號救援金鑰
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = 回到設定

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = 移除救援電話號碼
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = 將從您的救援電話號碼移除 <strong>{ $formattedFullPhoneNumber }</strong>。
settings-recovery-phone-remove-recommend = 因為這個方式比保存備用驗證碼簡單，我們建議您繼續使用這個方法。
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = 請務必先確認已經產生並保存備用驗證碼，再刪除救援號碼。<linkExternal>比較各種救援方式</linkExternal>
settings-recovery-phone-remove-button = 移除電話號碼
settings-recovery-phone-remove-cancel = 取消
settings-recovery-phone-remove-success = 已移除救援電話號碼

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = 新增救援電話號碼
page-change-recovery-phone = 更改救援電話號碼
page-setup-recovery-phone-back-button-title = 回到設定頁面
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = 更改電話號碼

## Add secondary email page

add-secondary-email-step-1 = 第 1 步，共 2 步
add-secondary-email-error-2 = 建立此郵件時發生錯誤
add-secondary-email-page-title =
    .title = 次要電子郵件地址
add-secondary-email-enter-address =
    .label = 輸入電子郵件地址
add-secondary-email-cancel-button = 取消
add-secondary-email-save-button = 儲存
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = 不可使用轉寄信箱作為次要電子郵件地址。

## Verify secondary email page

add-secondary-email-step-2 = 第 2 步，共 2 步
verify-secondary-email-page-title =
    .title = 次要電子郵件地址
verify-secondary-email-verification-code-2 =
    .label = 請輸入確認碼
verify-secondary-email-cancel-button = 取消
verify-secondary-email-verify-button-2 = 確認
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = 請於 5 分鐘內輸入發送到 <strong>{ $email }</strong> 的驗證碼。
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = 成功加入 { $email }
verify-secondary-email-resend-code-button = 重寄確認碼

##

# Link to delete account on main Settings page
delete-account-link = 刪除帳號
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = 登入成功。將繼續保留您的 { -product-mozilla-account }與資料。

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = 看看您的隱私資訊在哪裡外洩，並且進行管控
# Links out to the Monitor site
product-promo-monitor-cta = 免費掃描

## Profile section

profile-heading = 個人資料
profile-picture =
    .header = 照片
profile-display-name =
    .header = 顯示名稱
profile-primary-email =
    .header = 主要電子郵件地址

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = 第 { $currentStep } 步，共 { $numberOfSteps } 步。

## Security section of Setting

security-heading = 安全性
security-password =
    .header = 密碼
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = 建立於 { $date }
security-not-set = 未設定
security-action-create = 設定
security-set-password = 設定密碼，方可使用同步功能與其他帳號安全相關功能。
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = 檢視近期帳號活動
signout-sync-header = 登入階段已過期
signout-sync-session-expired = 抱歉，有些東西不對勁，請從瀏覽器選單登出後再試一次。

## SubRow component

tfa-row-backup-codes-title = 備用驗證碼
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = 無備用驗證碼可用
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 = 剩餘 { $numCodesAvailable } 組備用驗證碼
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = 建立新的備用驗證碼
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = 新增
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = 當您無法再使用您的行動裝置或驗證程式時，這是最安全的救援方法。
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = 救援電話號碼
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = 未設定手機號碼
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = 變更
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = 新增
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = 移除
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = 移除救援電話號碼
tfa-row-backup-phone-delete-restriction-v2 = 若您想要移除救援電話號碼，請先產生備用驗證碼，或停用兩階段驗證，以避免被鎖在帳號外面無法登入。
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = 當您無法再使用驗證程式時，這是最安全的救援方法。
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = 了解 SIM 卡替換攻擊的風險

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = 關閉
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = 開啟
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = 送出中…
switch-is-on = 開啟
switch-is-off = 關閉

## Sub-section row Defaults

row-defaults-action-add = 新增
row-defaults-action-change = 變更
row-defaults-action-disable = 停用
row-defaults-status = 無

## Account recovery key sub-section on main Settings page

rk-header-1 = 帳號救援金鑰
rk-enabled = 啟用
rk-not-set = 未設定
rk-action-create = 建立
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = 變更
rk-action-remove = 移除
rk-key-removed-2 = 已刪除帳號救援金鑰
rk-cannot-remove-key = 無法刪除您的帳號救援金鑰。
rk-refresh-key-1 = 重新整理帳號救援金鑰
rk-content-explain = 當您忘記密碼時恢復資訊。
rk-cannot-verify-session-4 = 很抱歉，確認您的連線階段時發生問題
rk-remove-modal-heading-1 = 要移除帳號救援金鑰嗎？
rk-remove-modal-content-1 = 若您重設密碼，就無法再使用帳號救援金鑰來存取資料，也無法恢復此動作。
rk-remove-error-2 = 無法刪除您的帳號救援金鑰
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = 刪除帳號救援金鑰

## Secondary email sub-section on main Settings page

se-heading = 次要電子郵件地址
    .header = 次要電子郵件地址
se-cannot-refresh-email = 很抱歉，重新整理該電子郵件地址時發生問題。
se-cannot-resend-code-3 = 很抱歉，重新寄出驗證碼時發生問題
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = 已將您的主要電子郵件地址更改為 { $email }
se-set-primary-error-2 = 很抱歉，更改您的主要電子郵件地址時發生問題
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = 成功刪除 { $email }
se-delete-email-error-2 = 很抱歉，刪除此電子郵件地址時發生問題
se-verify-session-3 = 必須要驗證您目前的使用階段，才能進行此操作
se-verify-session-error-3 = 很抱歉，確認您的連線階段時發生問題
# Button to remove the secondary email
se-remove-email =
    .title = 移除電子郵件地址
# Button to refresh secondary email status
se-refresh-email =
    .title = 重新整理電子郵件地址
se-unverified-2 = 未確認
se-resend-code-2 = 需要驗證帳號。若未收到驗證信或跑到垃圾信件匣，可<button>點此重寄驗證碼</button>。
# Button to make secondary email the primary
se-make-primary = 設為主要信箱
se-default-content = 讓您在無法使用主要電子郵件地址時，還能存取帳號。
se-content-note-1 = 註：只設定次要電子郵件帳號無法恢復您的資訊，還需要有<a>帳號救援金鑰</a>才行。
# Default value for the secondary email
se-secondary-email-none = 無

## Two Step Auth sub-section on Settings main page

tfa-row-header = 兩階段驗證
tfa-row-enabled = 啟用
tfa-row-disabled-status = 已停用
tfa-row-action-add = 新增
tfa-row-action-disable = 停用
tfa-row-action-change = 變更
tfa-row-button-refresh =
    .title = 重新整理兩階段驗證狀態
tfa-row-cannot-refresh = 很抱歉，重新整理兩階段驗證狀態時發生問題。
tfa-row-enabled-description = 已開啟兩階段驗證保護您的帳號。登入 { -product-mozilla-account }時，需要輸入驗證器程式當中產生的一組驗證碼。
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = 此功能如何保護您的帳號
tfa-row-disabled-description-v2 = 您可以使用第三方驗證器程式進行第二階段登入，來保護您的帳號安全。
tfa-row-cannot-verify-session-4 = 很抱歉，確認您的連線階段時發生問題
tfa-row-disable-modal-heading = 要停用兩階段驗證嗎？
tfa-row-disable-modal-confirm = 停用
tfa-row-disable-modal-explain-1 = 將無法還原此動作。您還可以<linkExternal>換新備用救援碼</linkExternal>。
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = 已關閉兩階段驗證
tfa-row-cannot-disable-2 = 無法停用兩階段驗證
tfa-row-verify-session-info = 必須先驗證您目前的使用階段，才能設定兩階段驗證

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = 使用本服務，代表您同意：
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } 訂閱服務的<mozSubscriptionTosLink>服務條款</mozSubscriptionTosLink>與<mozSubscriptionPrivacyLink>隱私權公告</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } 的<mozillaAccountsTos>服務條款</mozillaAccountsTos>與<mozillaAccountsPrivacy>隱私權公告</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = 使用本服務，代表您同意<mozillaAccountsTos>服務條款</mozillaAccountsTos>與<mozillaAccountsPrivacy>隱私權公告</mozillaAccountsPrivacy>。

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = 或著
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = 使用下列服務帳號登入
continue-with-google-button = 使用 { -brand-google } 帳號繼續
continue-with-apple-button = 使用 { -brand-apple } 帳號繼續

## Auth-server based errors that originate from backend service

auth-error-102 = 未知帳號
auth-error-103 = 密碼不正確
auth-error-105-2 = 確認碼無效
auth-error-110 = token 無效
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = 您已嘗試太多次，請稍候再試。
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = 您已嘗試太多次，請等 { $retryAfter }再試。
auth-error-125 = 因為安全性因素，已封鎖請求
auth-error-129-2 = 您輸入的電話號碼無效，請檢查後再試一次。
auth-error-138-2 = 未驗證的使用階段
auth-error-139 = 次要信箱必須與您的帳號信箱不同
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = 此電子郵件地址已被其他帳號保留。請稍後再試或使用不同地址。
auth-error-155 = 找不到 TOTP token
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = 找不到備用驗證碼
auth-error-159 = 帳號救援金鑰無效
auth-error-183-2 = 驗證碼無效或失效
auth-error-202 = 功能未啟用
auth-error-203 = 系統暫時無法使用，請稍後再試一次
auth-error-206 = 已設定密碼，無法重複設定
auth-error-214 = 救援電話號碼已存在
auth-error-215 = 救援電話號碼不存在
auth-error-216 = 已達簡訊傳送限制
auth-error-218 = 未建立備用驗證碼，無法移除救援電話驗證號碼。
auth-error-219 = 此電話號碼已用於註冊太多帳號，請改用其他號碼。
auth-error-999 = 未預期的錯誤
auth-error-1001 = 已取消登入請求
auth-error-1002 = 登入階段已失效，請登入以繼續。
auth-error-1003 = 本機儲存空間或 Cookie 仍然停用
auth-error-1008 = 您的新密碼必須與舊密碼不同
auth-error-1010 = 必須輸入有效的密碼
auth-error-1011 = 請輸入有效的電子郵件信箱
auth-error-1018 = 您的確認信被退了，是不是輸錯電子郵件地址了？
auth-error-1020 = 打錯信箱地址了？firefox.com 不是有效的電子郵件服務業者
auth-error-1031 = 您必須輸入年齡才能註冊
auth-error-1032 = 您必須輸入有效年齡才能註冊
auth-error-1054 = 無效的兩階段驗證碼
auth-error-1056 = 備用驗證碼無效
auth-error-1062 = 重導無效
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = 打錯信箱地址了？{ $domain } 不是有效的電子郵件服務業者
auth-error-1066 = 不可使用轉寄信箱來註冊帳號。
auth-error-1067 = 打錯信箱地址？
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = 號碼尾碼為 { $lastFourPhoneNumber }
oauth-error-1000 = 有些東西不對勁，請關閉此分頁再試一次。

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = 您已登入 { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = 已確認電子郵件地址
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = 登入完成
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = 登入此 { -brand-firefox } 即可完成設定
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = 登入
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = 還要新增其他裝置嗎？請到其他裝置登入 { -brand-firefox } 完成設定
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = 在其他裝置登入 { -brand-firefox } 完成設定
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = 想要在其他台裝置上，也能獲得相同的分頁、書籤、網站密碼等資料嗎？
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = 連結其他裝置
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = 現在不要
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = 登入 { -brand-firefox } for Android 完成設定
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = 登入 { -brand-firefox } for iOS 完成設定

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = 必須開啟本機儲存空間與 Cookie 功能
cookies-disabled-enable-prompt-2 = 請開啟瀏覽器的 Cookie 與本機儲存空間功能，才能使用 { -product-mozilla-account }。這麼做可讓帳號系統在每次使用時記住您的登入狀態。
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = 重試
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = 了解更多

## Index / home page

index-header = 輸入您的電子郵件地址
index-sync-header = 繼續前往您的 { -product-mozilla-account }
index-sync-subheader = 在使用 { -brand-firefox } 的所有地方同步您的密碼、分頁、書籤。
index-relay-header = 建立新轉寄信箱
index-relay-subheader = 請提供要實際收到轉寄信件的電子郵件信箱。
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = 繼續前往 { $serviceName }
index-subheader-default = 繼續前往帳號設定
index-cta = 註冊或登入
index-account-info = 註冊 { -product-mozilla-account }，即可使用 { -brand-mozilla } 更多隱私保護相關產品。
index-email-input =
    .label = 輸入您的電子郵件地址
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = 已成功刪除帳號
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = 您的確認信被退了，是不是輸錯電子郵件地址了？

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = 抱歉！無法建立您的帳號救援金鑰，請稍候再試一次。
inline-recovery-key-setup-recovery-created = 已建立帳號救援金鑰
inline-recovery-key-setup-download-header = 讓您的帳號更安全
inline-recovery-key-setup-download-subheader = 立即下載保存
inline-recovery-key-setup-download-info = 未來無法再回到這個頁面，請務必將這把金鑰保存在之後還找得到的地方。
inline-recovery-key-setup-hint-header = 安全性建議

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = 取消設定
inline-totp-setup-continue-button = 繼續
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = 透過需要多輸入一組由<authenticationAppsLink>驗證程式</authenticationAppsLink>所產生的驗證碼，加強您的帳號安全性。
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = 開啟兩階段驗證<span>即可繼續前往帳號設定</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = 開啟兩階段驗證<span>即可繼續前往 { $serviceName }</span>
inline-totp-setup-ready-button = 準備就緒
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = 掃描驗證碼<span>即可繼續前往 { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = 輸入驗證碼<span>即可繼續前往 { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = 掃描驗證碼<span>即可繼續前往帳號設定</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = 輸入驗證碼<span>即可繼續前往帳號設定</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = 請在您的驗證器應用程式輸入下列私鑰。<toggleToQRButton>要改成掃描 QR Code 嗎？</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = 請在您的驗證器應用程式掃描下列 QR Code，然後輸入驗證器產生的安全碼。<toggleToManualModeButton>無法掃描 QR Code 嗎？</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = 完成後，就會自動開始產生驗證碼讓您登入。
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = 驗證碼
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = 需要輸入驗證碼
tfa-qr-code-alt = 使用代碼 { $code } 在支援的應用程式中設定兩階段驗證。
inline-totp-setup-page-title = 兩階段驗證

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = 法律資訊
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = 服務條款
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = 隱私權公告

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = 隱私權公告

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = 服務條款

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = 您剛登入 { -product-firefox } 嗎？
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = 是我，確認此裝置
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = 如果您沒有登入，<link>請立即更改密碼</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = 裝置已連線
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = 開始與下列裝置同步：{ $deviceOS } 上的 { $deviceFamily }
pair-auth-complete-sync-benefits-text = 您現在可以在所有裝置使用您開啟的分頁、密碼、書籤資料了。
pair-auth-complete-see-tabs-button = 顯示來自已同步裝置的分頁
pair-auth-complete-manage-devices-link = 管理裝置

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = 輸入驗證碼<span>即可繼續前往帳號設定</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = 輸入驗證碼<span>即可繼續前往 { $serviceName }</span>
auth-totp-instruction = 請開啟您的兩階段驗證程式，並輸入其提供的驗證碼。
auth-totp-input-label = 請輸入六位數的驗證碼
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = 確認
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = 需要輸入驗證碼

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = 請到另一台裝置進行確認

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = 配對失敗
pair-failure-message = 已中斷設定。

## Pair index page

pair-sync-header = 與手機或平板電腦上的 { -brand-firefox } 同步
pair-cad-header = 連結另一台裝置上的 { -brand-firefox }
pair-already-have-firefox-paragraph = 手機或平板電腦上也有 { -brand-firefox } 嗎？
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = 同步您的裝置
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = 或下載
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = 掃描即可下載 { -brand-firefox } 行動版，或者將<linkExternal>下載鏈結</linkExternal>寄給自己。
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = 現在不要
pair-take-your-data-message = 將您的 { -brand-firefox } 分頁、書籤、網站密碼隨身帶著走。
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = 開始使用
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR code

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = 裝置已連線
pair-success-message-2 = 配對成功。

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = 確認配對 <span>{ $email }</span>
pair-supp-allow-confirm-button = 確認配對
pair-supp-allow-cancel-link = 取消

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = 請到另一台裝置進行確認

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = 使用應用程式配對
pair-unsupported-message = 您用的是系統相機嗎？必須透過 { -brand-firefox } 程式中的相機配對。

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = 設定同步密碼
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = 將會加密您的資料，必須與您的 { -brand-google } 或 { -brand-apple } 帳號密碼不同。

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = 請稍後，將帶您前往要登入的應用程式。

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = 輸入您的帳號救援金鑰
account-recovery-confirm-key-instruction = 使用這把金鑰，可從 { -brand-firefox } 伺服器救回您加密過的密碼、書籤等上網資料。
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = 請輸入您的 32 字元帳號救援金鑰
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = 您當時設定的保存提示是：
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = 繼續
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = 找不到您的帳號救援金鑰嗎？

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = 建立新密碼
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = 已設定密碼
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = 很抱歉，設定您的密碼時發生問題
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = 使用帳號救援金鑰
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = 您的密碼已重設成功。
reset-password-complete-banner-message = 別忘記到 { -product-mozilla-account } 設定中產生一把新的帳號救援金鑰，避免未來遇到登入問題。
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = 登入後，{ -brand-firefox } 將嘗試使用您的轉寄信箱帶您回到原網站。

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = 請輸入 10 字元長的驗證碼
confirm-backup-code-reset-password-confirm-button = 確認
confirm-backup-code-reset-password-subheader = 請輸入備用驗證碼
confirm-backup-code-reset-password-instruction = 請輸入設定兩階段驗證時保存的任一組備用驗證碼。
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = 被鎖住了嗎？

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = 請收信確認
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = 我們已將確認碼寄到 <span>{ $email }</span>。
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = 請在 10 分鐘內輸入 8 位數的代碼
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = 繼續
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = 重寄確認碼
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = 使用另一個帳號

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = 重設您的密碼
confirm-totp-reset-password-subheader-v2 = 請輸入兩階段驗證碼
confirm-totp-reset-password-instruction-v2 = 請使用您的<strong>驗證程式</strong>以重設密碼。
confirm-totp-reset-password-trouble-code = 輸入代碼時遇到問題嗎？
confirm-totp-reset-password-confirm-button = 確認
confirm-totp-reset-password-input-label-v2 = 請輸入六位數的驗證碼
confirm-totp-reset-password-use-different-account = 使用另一個帳號

## ResetPassword start page

password-reset-flow-heading = 重設您的密碼
password-reset-body-2 = 我們將與您確認一些僅有您知道的問題，來確保您的帳號安全。
password-reset-email-input =
    .label = 請輸入您的電子郵件地址
password-reset-submit-button-2 = 繼續

## ResetPasswordConfirmed

reset-password-complete-header = 已重設您的密碼
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = 繼續前往 { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = 重設您的密碼
password-reset-recovery-method-subheader = 選擇救援方式
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = 請使用您原先設定的救援方式確認身分。
password-reset-recovery-method-phone = 救援電話號碼
password-reset-recovery-method-code = 備用驗證碼
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info = 剩餘 { $numBackupCodes } 組備用驗證碼
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = 傳送代碼到您的救援電話號碼時遇到問題
password-reset-recovery-method-send-code-error-description = 請稍後再試，或使用您的備用驗證碼。

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = 重設您的密碼
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = 請輸入救援碼
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = 已透過簡訊將六位數救援碼發送至尾碼為 <span>{ $lastFourPhoneDigits }</span> 的門號，此驗證碼將於 5 分鐘後失效，請勿將此驗證碼提供給任何人。
reset-password-recovery-phone-input-label = 請輸入六位數的救援碼
reset-password-recovery-phone-code-submit-button = 確認
reset-password-recovery-phone-resend-code-button = 重船救援碼
reset-password-recovery-phone-resend-success = 已傳送救援碼
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = 被鎖住了嗎？
reset-password-recovery-phone-send-code-error-heading = 傳送救援碼時遇到問題
reset-password-recovery-phone-code-verification-error-heading = 確認您輸入的救援碼時遇到問題
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = 請稍候再試。
reset-password-recovery-phone-invalid-code-error-description = 此救援碼無效，或已失效。
reset-password-recovery-phone-invalid-code-error-link = 要改用備用驗證碼嗎？
reset-password-with-recovery-key-verified-page-title = 密碼重設成功
reset-password-complete-new-password-saved = 已儲存新密碼！
reset-password-complete-recovery-key-created = 已建立新的帳號救援金鑰，請立即下載並儲存。
reset-password-complete-recovery-key-download-info = 萬一您忘記密碼時，必須使用這把金鑰才可以救回資料。<b>本頁面之後不會再顯示，請立即下載金鑰，並儲存在安全的地方。</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = 錯誤：
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = 正在驗證登入…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = 確認過程發生錯誤
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = 驗證鏈結已失效
signin-link-expired-message-2 = 您點擊的鏈結已失效，或已經被使用過。

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = 請輸入您的密碼 <span>{ -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = 繼續前往 { $serviceName }
signin-subheader-without-logo-default = 繼續前往帳號設定
signin-button = 登入
signin-header = 登入
signin-use-a-different-account-link = 使用另一個帳號
signin-forgot-password-link = 忘記密碼？
signin-password-button-label = 密碼
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = 登入後，{ -brand-firefox } 將嘗試使用您的轉寄信箱帶您回到原網站。
signin-code-expired-error = 驗證碼已失效，請重新登入。
signin-account-locked-banner-heading = 重設您的密碼
signin-account-locked-banner-description = 已鎖定您的帳號，避免遭受可疑活動影響。
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = 請重設密碼即可登入

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = 您點擊的鏈結可能缺少了一些字元，或您的郵件軟體修改了鏈結文字。請確認您複製了完整的網址，再次開啟確認鏈結。
report-signin-header = 要回報未經授權的登入嗎？
report-signin-body = 您將會收到嘗試登入帳號的相關資訊的電子郵件。您想要將該筆登入回報為可疑行為嗎？
report-signin-submit-button = 回報可疑行為
report-signin-support-link = 為什麼會發生？
report-signin-error = 很抱歉，送出報告時發生問題。
signin-bounced-header = 抱歉，我們鎖定了您的帳號。
# $email (string) - The user's email.
signin-bounced-message = 先前寄到 { $email } 的確認信被退回。為了保護您 { -brand-firefox } 的資料，已暫時鎖定您的帳號。
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = 若這是有效的電子郵件地址，<linkExternal>請讓我們知道</linkExternal>，我們將協助您解鎖帳號。
signin-bounced-create-new-account = 那個信箱已經停用了嗎？請註冊新帳號
back = 返回

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = 確認登入<span>即可繼續前往帳號設定</span>
signin-push-code-heading-w-custom-service = 確認登入<span>即可繼續前往 { $serviceName }</span>
signin-push-code-instruction = 請到您的其他裝置允許這次從 { -brand-firefox } 瀏覽器發起的登入。
signin-push-code-did-not-recieve = 沒有收到通知？
signin-push-code-send-email-link = 用電子郵件寄送驗證碼

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = 確認登入
signin-push-code-confirm-description = 我們偵測到下列裝置嘗試登入您的帳號。若這是您發起的，請允許登入
signin-push-code-confirm-verifying = 驗證中
signin-push-code-confirm-login = 確認登入
signin-push-code-confirm-wasnt-me = 不是我發起的，我要更改密碼。
signin-push-code-confirm-login-approved = 已允許您登入，可關閉視窗。
signin-push-code-confirm-link-error = 鏈結毀損，請再試一次。

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = 登入
signin-recovery-method-subheader = 選擇救援方式
signin-recovery-method-details = 請使用您原先設定的救援方式確認身分。
signin-recovery-method-phone = 救援電話號碼
signin-recovery-method-code-v2 = 備用驗證碼
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 = 剩餘 { $numBackupCodes } 組備用驗證碼
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = 傳送代碼到您的救援電話號碼時遇到問題
signin-recovery-method-send-code-error-description = 請稍後再試，或使用您的備用驗證碼。

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = 登入
signin-recovery-code-sub-heading = 請輸入備用驗證碼
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = 請輸入設定兩階段驗證時保存的任一組備用驗證碼。
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = 請輸入 10 字元長的備用驗證碼
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = 確認
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = 使用救援電話號碼
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = 被鎖住了嗎？
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = 需要使用備用驗證碼
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = 傳送代碼到您的救援電話號碼時遇到問題
signin-recovery-code-use-phone-failure-description = 請稍候再試。

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = 登入
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = 請輸入救援碼
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = 已透過簡訊將六位數驗證碼發送至尾碼為 <span>{ $lastFourPhoneDigits }</span> 的門號，此驗證碼將於 5 分鐘後失效，請勿將此驗證碼提供給任何人。
signin-recovery-phone-input-label = 請輸入六位數的驗證碼
signin-recovery-phone-code-submit-button = 確認
signin-recovery-phone-resend-code-button = 重寄驗證碼
signin-recovery-phone-resend-success = 已傳送驗證碼
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = 被鎖住了嗎？
signin-recovery-phone-send-code-error-heading = 傳送驗證碼時遇到問題
signin-recovery-phone-code-verification-error-heading = 確認您輸入的驗證碼時遇到問題
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = 請稍候再試。
signin-recovery-phone-invalid-code-error-description = 此驗證碼無效，或已失效。
signin-recovery-phone-invalid-code-error-link = 要改用備用驗證碼嗎？
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = 成功登入。若您再次使用救援電話號碼登入，可能會遇到帳號限制。

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = 感謝您提高警覺
signin-reported-message = 已通知我們的營運團隊。像這樣的回報可以幫助我們阻擋入侵者。

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = 請輸入您的確認碼 <span>{ -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = 請在 5 分鐘內輸入寄送到 <email>{ $email }</email> 的代碼。
signin-token-code-input-label-v2 = 請輸入六位數的安全碼
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = 確認
signin-token-code-code-expired = 驗證碼失效？
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = 重寄新驗證碼。
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = 請輸入確認碼
signin-token-code-resend-error = 有些東西怪怪的，無法寄出新的確認碼。
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = 登入後，{ -brand-firefox } 將嘗試使用您的轉寄信箱帶您回到原網站。

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = 登入
signin-totp-code-subheader-v2 = 請輸入兩階段驗證碼
signin-totp-code-instruction-v4 = 請使用您的<strong>驗證程式</strong>確認登入動作。
signin-totp-code-input-label-v4 = 請輸入六位數的驗證碼
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = 為什麼會要求您進行驗證？
signin-totp-code-aal-banner-content = 您為帳號設定了兩階段驗證，但還沒有在此裝置上使用驗證碼登入過。
signin-totp-code-aal-sign-out = 登出此裝置
signin-totp-code-aal-sign-out-error = 很抱歉，將您登出時發生問題
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = 確認
signin-totp-code-other-account-link = 使用另一個帳號
signin-totp-code-recovery-code-link = 輸入代碼時遇到問題嗎？
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = 需要輸入驗證碼
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = 登入後，{ -brand-firefox } 將嘗試使用您的轉寄信箱帶您回到原網站。

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = 授權此登入
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = 請到 { $email } 收信，取得授權碼。
signin-unblock-code-input = 輸入授權碼
signin-unblock-submit-button = 繼續
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = 需要輸入授權碼
signin-unblock-code-incorrect-length = 授權碼必須包含 8 個字元
signin-unblock-code-incorrect-format-2 = 授權碼僅可包含字母或數字
signin-unblock-resend-code-button = 沒在收件匣或垃圾信件匣中找到嗎？點此重送
signin-unblock-support-link = 為什麼會發生？
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = 登入後，{ -brand-firefox } 將嘗試使用您的轉寄信箱帶您回到原網站。

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = 請輸入確認碼
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = 請輸入您的確認碼 <span>{ -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = 請在 5 分鐘內輸入寄送到 <email>{ $email }</email> 的代碼。
confirm-signup-code-input-label = 請輸入六位數的驗證碼
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = 確認
confirm-signup-code-sync-button = 開始同步
confirm-signup-code-code-expired = 驗證碼失效？
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = 重寄新驗證碼。
confirm-signup-code-success-alert = 成功確認帳號
# Error displayed in tooltip.
confirm-signup-code-is-required-error = 需要輸入確認碼
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = 登入後，{ -brand-firefox } 將嘗試使用您的轉寄信箱帶您回到原網站。

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = 設定密碼
signup-relay-info = 需要設定密碼，才能安全地管理轉寄信箱，並使用 { -brand-mozilla } 的安全工具。
signup-sync-info = 在使用 { -brand-firefox } 的所有地方同步您的密碼、書籤與更多資料。
signup-sync-info-with-payment = 在使用 { -brand-firefox } 的所有地方同步您的密碼、付款方式、書籤與更多資料。
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = 更改電子郵件地址

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = 已開啟同步
signup-confirmed-sync-success-banner = { -product-mozilla-account } 已確認
signup-confirmed-sync-button = 開始上網
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = 隨時隨地使用 { -brand-firefox } 都可同步使用您的密碼、付款方式、地址、書籤、上網紀錄與更多資訊。
signup-confirmed-sync-description-v2 = 隨時隨地使用 { -brand-firefox } 都可同步使用您的密碼、地址、書籤、上網紀錄與更多資訊。
signup-confirmed-sync-add-device-link = 新增另一台裝置
signup-confirmed-sync-manage-sync-button = 管理同步
signup-confirmed-sync-set-password-success-banner = 已設定同步密碼
