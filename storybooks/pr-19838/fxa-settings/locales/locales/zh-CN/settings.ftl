# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = 已向您的邮箱发送新验证码。
resend-link-success-banner-heading = 已向您的邮箱发送新链接。
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = 建议将 { $accountsEmail } 添加到您的通讯录以确保顺畅接收。

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = 关闭横幅
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = 11 月 1 日起，{ -product-firefox-accounts }将更名为 { -product-mozilla-accounts }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = 您仍将使用原有的用户名和密码，所使用的产品内容也不会有其他变化。
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = 我们已将 { -product-firefox-accounts }更名为 { -product-mozilla-accounts }。您仍将使用原有的用户名和密码，所使用的产品内容也不会有其他变化。
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = 详细了解
# Alt text for close banner image
brand-close-banner =
    .alt = 关闭提示
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } 的“m”字徽标

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = 返回
button-back-title = 返回

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = 下载并继续
    .title = 下载并继续
recovery-key-pdf-heading = 账户恢复密钥
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = 创建日期：{ $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = 账户恢复密钥
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = 如果您忘记了密码，可以使用此密钥来恢复加密的浏览器数据（包括密码、书签和历史记录）。请妥善保管密钥。
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = 密钥存放位置
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = 详细了解账户恢复密钥
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = 很抱歉，下载您的账户恢复密钥时出现问题。

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = 接收 { -brand-mozilla } 的更多消息：
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = 获取最新消息和产品动态
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = 抢先体验新产品
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = 重领互联网的行动号召

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = 已下载
datablock-copy =
    .message = 已复制
datablock-print =
    .message = 已打印

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success = 已复制验证码
datablock-download-success = 已下载验证码
datablock-print-success = 已打印验证码

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = 已复制

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $country }, { $region }, { $city }（估计）
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $country }, { $region }（估计）
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $country }, { $city }（估计）
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country }（估计）
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = 位置未知
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $genericOSName } 上的 { $browserName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP 地址：{ $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = 密码
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = 再次输入密码
form-password-with-inline-criteria-signup-submit-button = 创建账户
form-password-with-inline-criteria-reset-new-password =
    .label = 新密码
form-password-with-inline-criteria-confirm-password =
    .label = 再次输入密码
form-password-with-inline-criteria-reset-submit-button = 创建新密码
form-password-with-inline-criteria-set-password-new-password-label =
    .label = 密码
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = 再次输入密码
form-password-with-inline-criteria-set-password-submit-button = 开始同步
form-password-with-inline-criteria-match-error = 两次输入的密码不一致
form-password-with-inline-criteria-sr-too-short-message = 密码至少需要包含 8 个字符。
form-password-with-inline-criteria-sr-not-email-message = 密码中不能包含您的邮箱地址。
form-password-with-inline-criteria-sr-not-common-message = 不能使用常见密码。
form-password-with-inline-criteria-sr-requirements-met = 输入的密码符合各项密码要求。
form-password-with-inline-criteria-sr-passwords-match = 两次输入的密码一致。

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = 此字段必填

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = 输入 { $codeLength } 位数的验证码以继续操作
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = 输入由 { $codeLength } 个字符组成的验证码以继续操作

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } 账户恢复密钥
get-data-trio-title-backup-verification-codes = 备用验证码
get-data-trio-download-2 =
    .title = 下载
    .aria-label = 下载
get-data-trio-copy-2 =
    .title = 复制
    .aria-label = 复制
get-data-trio-print-2 =
    .title = 打印
    .aria-label = 打印

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
    .aria-label = 身份验证应用程序
backup-codes-icon-aria-label-v2 =
    .aria-label = 已启用备用验证码
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = 已禁用备用验证码
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = 恢复短信已启用
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = 恢复短信已禁用
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = 加拿大国旗
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = 已勾选
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = 成功
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = 已启用
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = 关闭消息
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = 验证码
error-icon-aria-label =
    .aria-label = 错误
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = 信息
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = 美国国旗

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = 一台电脑和一部手机，上面分别有一颗破碎的心
hearts-verified-image-aria-label =
    .aria-label = 一台电脑、一部手机和一台平板，上面分别有一颗跳动的心
signin-recovery-code-image-description =
    .aria-label = 包含隐藏文本的文档。
signin-totp-code-image-label =
    .aria-label = 包含隐藏 6 位验证码的设备。
confirm-signup-aria-label =
    .aria-label = 包含链接的信封
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = 表示账户恢复密钥的插图。
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = 账户恢复密钥的图案。
password-image-aria-label =
    .aria-label = 一幅插图，展示了输入密码的情景。
lightbulb-aria-label =
    .aria-label = 创建存储的图案。
email-code-image-aria-label =
    .aria-label = 一封包含验证码的电子邮件的插图。
recovery-phone-image-description =
    .aria-label = 收到验证码短信的移动设备。
recovery-phone-code-image-description =
    .aria-label = 一台移动设备收到验证码。
backup-recovery-phone-image-aria-label =
    .aria-label = 具有短信功能的移动设备
backup-authentication-codes-image-aria-label =
    .aria-label = 显示验证码的设备屏幕
sync-clouds-image-aria-label =
    .aria-label = 带同步图标的云朵图案
confetti-falling-image-aria-label =
    .aria-label = 五彩纸屑飘落动画

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = 您已登录 { -brand-firefox }。
inline-recovery-key-setup-create-header = 保护账户安全
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = 花上片刻来保护您的数据吧？
inline-recovery-key-setup-info = 创建账户恢复密钥。即使忘记密码，也能恢复同步的浏览数据。
inline-recovery-key-setup-start-button = 创建账户恢复密钥
inline-recovery-key-setup-later-button = 稍后设置

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = 隐藏密码
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = 显示密码
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = 您的密码目前显示在屏幕上。
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = 您的密码目前被隐藏。
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = 您的密码现在会显示在屏幕上。
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = 您的密码现在会被隐藏。

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = 选择国家/地区
input-phone-number-enter-number = 请输入电话号码
input-phone-number-country-united-states = 美国
input-phone-number-country-canada = 加拿大
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = 后退

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = 重置密码链接已损坏
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = 确认链接已损坏
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = 链接不完整
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = 您点击的链接缺少字符，可能是您的邮件客户端损坏了该链接。请确保复制了完整的网址，然后再试一次。

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = 发送新链接

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = 想起密码了？
# link navigates to the sign in page
remember-password-signin-link = 登录

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = 主邮箱地址已经确认
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = 登录已确认
confirmation-link-reused-message = 此确认链接已被使用，并只能使用一次。

## Locale Toggle Component

locale-toggle-select-label = 选择语言
locale-toggle-browser-default = 浏览器默认值
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = 错误请求

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = 需要使用此密码才能访问您存储在我们服务器上的加密数据。
password-info-balloon-reset-risk-info = 重置后可能会丢失密码、书签等数据。

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = 请使用您没有在其它网站使用过的强密码。确保其符合安全要求：
password-strength-short-instruction = 使用强密码：
password-strength-inline-min-length = 至少 8 个字符
password-strength-inline-not-email = 不包含您的邮箱地址
password-strength-inline-not-common = 不是常见密码
password-strength-inline-confirmed-must-match = 再次输入的密码与新密码一致
password-strength-inline-passwords-match = 密码符合

## Notification Promo Banner component

account-recovery-notification-cta = 创建
account-recovery-notification-header-value = 忘记密码也不致丢失数据
account-recovery-notification-header-description = 创建账户恢复密钥，以在忘记密码时恢复同步的浏览数据。
recovery-phone-promo-cta = 添加恢复电话号码
recovery-phone-promo-heading = 添加恢复电话号码，为账户增添额外保护
recovery-phone-promo-description = 现在，您可在无法使用双因子身份验证应用时，通过由短信发送的一次性密码登录。
recovery-phone-promo-info-link = 详细了解“恢复”，以及“SIM 卡交换”风险
promo-banner-dismiss-button =
    .aria-label = 关闭横幅

## Ready component

ready-complete-set-up-instruction = 在您的其他 { -brand-firefox } 设备上输入新的密码以完成设置。
manage-your-account-button = 管理账户
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = 您可以使用 { $serviceName } 了
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = 您现在可以使用账户设置了
# Message shown when the account is ready but the user is not signed in
ready-account-ready = 您的账户准备好了！
ready-continue = 继续
sign-in-complete-header = 已确认登录
sign-up-complete-header = 账户已确认
primary-email-verified-header = 主邮箱已确认

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = 密钥存放位置：
flow-recovery-key-download-storage-ideas-folder-v2 = 安全设备上的文件夹
flow-recovery-key-download-storage-ideas-cloud = 可信的云存储
flow-recovery-key-download-storage-ideas-print-v2 = 打印的物理副本
flow-recovery-key-download-storage-ideas-pwd-manager = 密码管理器

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = 添加提示，帮助自己找到密钥
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = 此提示应能帮助您记起账户恢复密钥的位置。我们可在您重置密码时向您显示此提示，以帮助恢复数据。
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = 输入提示（选填）
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = 完成
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = 提示不能超过 255 个字符。
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = 提示不能包含不安全的 unicode 字符。只允许使用字母、数字、标点符号和符号。

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = 警告
password-reset-chevron-expanded = 折叠警告
password-reset-chevron-collapsed = 展开警告
password-reset-data-may-not-be-recovered = 您的浏览数据有可能无法恢复
password-reset-previously-signed-in-device-2 = 还留有以前登录过的设备？
password-reset-data-may-be-saved-locally-2 = 相应设备可能存有您的浏览数据。请重置密码，然后在那台设备上登录，即可恢复数据并同步。
password-reset-no-old-device-2 = 有新设备，但已无法使用旧设备？
password-reset-encrypted-data-cannot-be-recovered-2 = 很抱歉，我们无法恢复 { -brand-firefox } 服务器中加密存储的浏览数据。
password-reset-warning-have-key = 拥有账户恢复密钥？
password-reset-warning-use-key-link = 立即使用以重置密码，并可保留数据

## Alert Bar

alert-bar-close-message = 关闭消息

## User's avatar

avatar-your-avatar =
    .alt = 您的头像
avatar-default-avatar =
    .alt = 默认头像

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } 产品
bento-menu-tagline = { -brand-mozilla } 的更多保护您隐私的产品。
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } 桌面浏览器
bento-menu-firefox-mobile = { -brand-firefox } 移动浏览器
bento-menu-made-by-mozilla = { -brand-mozilla } 出品

## Connect another device promo

connect-another-fx-mobile = 下载适用于手机或平板电脑的 { -brand-firefox }
connect-another-find-fx-mobile-2 = 在 { -google-play } 和 { -app-store } 上查找 { -brand-firefox }。
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = 到 { -google-play } 下载 { -brand-firefox }
connect-another-app-store-image-3 =
    .alt = 到 { -app-store } 下载 { -brand-firefox }

## Connected services section

cs-heading = 关联服务
cs-description = 您正在使用并登录的所有项目。
cs-cannot-refresh = 很抱歉，刷新关联服务列表时出现问题。
cs-cannot-disconnect = 找不到客户端，无法断开连接
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = 已退出 { $service }
cs-refresh-button =
    .title = 刷新关联服务
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = 有缺失或重复？
cs-disconnect-sync-heading = 断开同步

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    您的浏览数据将继续留在 <span>{ $device }</span> 上，
    但不会再与您的账户同步。
cs-disconnect-sync-reason-3 = 请问为何要断开连接 <span>{ $device }</span>？

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = 该设备：
cs-disconnect-sync-opt-suspicious = 可疑
cs-disconnect-sync-opt-lost = 丢失或被盗
cs-disconnect-sync-opt-old = 旧的或不再使用
cs-disconnect-sync-opt-duplicate = 重复
cs-disconnect-sync-opt-not-say = 我不想说

##

cs-disconnect-advice-confirm = 好的，明白了
cs-disconnect-lost-advice-heading = 丢失或被盗的设备已断开连接
cs-disconnect-lost-advice-content-3 = 鉴于您的设备已丢失或被盗，为了确保信息安全，您应在账户设置中更改您的 { -product-mozilla-account }密码，并从设备制造商处了解如何远程抹除数据。
cs-disconnect-suspicious-advice-heading = 可疑设备已断开连接
cs-disconnect-suspicious-advice-content-2 = 若解绑的设备确实可疑，为了确保您的信息安全，应及时到账户设置中更改 { -product-mozilla-account }密码，以及在地址栏输入 about:logins，更改所有保存在 { -brand-firefox } 中的网站密码。
cs-sign-out-button = 退出

## Data collection section

dc-heading = 数据收集与使用
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } 浏览器
dc-subheader-content-2 = 允许 { -product-mozilla-accounts }向 { -brand-mozilla } 发送技术与交互数据。
dc-subheader-ff-content = 若要检查或更新 { -brand-firefox } 浏览器的技术与交互数据设置，请打开 { -brand-firefox } 设置，然后前往“隐私与安全”部分。
dc-opt-out-success-2 = 退出成功，{ -product-mozilla-accounts }将不再向 { -brand-mozilla } 发送技术与交互数据。
dc-opt-in-success-2 = 感谢！共享此数据可帮助我们改进 { -product-mozilla-accounts }。
dc-opt-in-out-error-2 = 抱歉，更改您的数据收集首选项时遇到问题
dc-learn-more = 详细了解

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }菜单
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = 已登录为
drop-down-menu-sign-out = 退出
drop-down-menu-sign-out-error-2 = 抱歉，退出登录时出现问题。

## Flow Container

flow-container-back = 返回

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = 请再次输入密码以确保安全
flow-recovery-key-confirm-pwd-input-label = 请输入密码
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = 创建账户恢复密钥
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = 创建新的账户恢复密钥

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = 已创建账户恢复密钥，请立即下载并保存
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = 如果您忘记密码，可使用此密钥恢复数据。请立即下载此密钥，并将其存储在您会记得的位置。此后将无法再回到本页面。
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = 继续但不下载

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = 已创建账户恢复密钥

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = 创建账户恢复密钥，以防忘记密码
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = 更改账户恢复密钥
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = 我们会加密浏览数据，包括密码、书签等。这样能很好地保护隐私，但如果您忘记密码，就有可能丢失数据。
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = 您可以通过账户恢复密钥恢复数据，因此很有必要创建该密钥。
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = 开始创建
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = 取消

## FlowSetup2faApp

flow-setup-2fa-qr-heading = 连接至身份验证应用
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>第 1 步：</strong>使用任意一款身份验证应用（例如 Duo 或 Google 身份验证器）扫描此二维码。
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = 用于设置两步验证的二维码。请扫描此二维码，或选择“无法扫描二维码”以获取替用的设置密钥。
flow-setup-2fa-cant-scan-qr-button = 无法扫描二维码？
flow-setup-2fa-manual-key-heading = 手动输入代码
flow-setup-2fa-manual-key-instruction = <strong>第 1 步：</strong>在您想要使用的身份验证应用中输入此代码。
flow-setup-2fa-scan-qr-instead-button = 改为扫描二维码？
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = 详细了解身份验证应用
flow-setup-2fa-button = 继续
flow-setup-2fa-step-2-instruction = <strong>第 2 步：</strong>输入身份验证应用提供的代码。
flow-setup-2fa-input-label = 请输入 6 位验证码
flow-setup-2fa-code-error = 验证码无效或已过期。请检查您的身份验证应用，然后重试。

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = 请选择一项恢复方式
flow-setup-2fa-backup-choice-description = 这是您在无法使用移动设备或身份验证应用时的登录方法。
flow-setup-2fa-backup-choice-phone-title = 恢复电话号码
flow-setup-2fa-backup-choice-phone-badge = 最简单
flow-setup-2fa-backup-choice-phone-info = 通过短信获取恢复验证码。目前仅在美国和加拿大可用。
flow-setup-2fa-backup-choice-code-title = 备用验证码
flow-setup-2fa-backup-choice-code-badge = 最安全
flow-setup-2fa-backup-choice-code-info = 创建并保存一次性验证码。
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = 了解“恢复”，以及“SIM 卡交换”风险

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = 请输入备用验证码
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = 请输入任意一个验证码，以确认您已保存验证码。若遗失这些验证码，且无法使用身份验证应用，则可能导致无法登录。
flow-setup-2fa-backup-code-confirm-code-input = 请输入由 10 个字符组成的验证码
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = 完成

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = 保存备用验证码
flow-setup-2fa-backup-code-dl-save-these-codes = 请将这些验证码保存在您不会遗忘的地方。如果您无法使用身份验证应用，则需要输入其中一个验证码才能登录。
flow-setup-2fa-backup-code-dl-button-continue = 继续

##

flow-setup-2fa-inline-complete-success-banner = 已启用两步验证
flow-setup-2fa-inline-complete-success-banner-description = 为保护所有连接的设备，您应在所有使用此账户的设备上退出登录，然后再使用新的两步验证信息重新登录。
flow-setup-2fa-inline-complete-backup-code = 备用验证码
flow-setup-2fa-inline-complete-backup-phone = 恢复电话号码
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info = 剩余 { $count } 个验证码
flow-setup-2fa-inline-complete-backup-code-description = 在无法通过移动设备或身份验证器应用登录时，这是最安全的恢复方式。
flow-setup-2fa-inline-complete-backup-phone-description = 在无法通过身份验证器应用登录时，这是最简易的恢复方式。
flow-setup-2fa-inline-complete-learn-more-link = 此举如何保护您的账户
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = 继续使用 { $serviceName }
flow-setup-2fa-prompt-heading = 设置两步验证
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } 需要您设置两步验证以保护账户安全。
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = 您可以使用<authenticationAppsLink>此处列出的身份验证应用</authenticationAppsLink>（任选一个）来继续操作。
flow-setup-2fa-prompt-continue-button = 继续

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = 请输入验证码
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = 一个六位数验证码已通过短信发送到 <span>{ $phoneNumber }</span>，5 分钟内有效。
flow-setup-phone-confirm-code-input-label = 请输入 6 位验证码
flow-setup-phone-confirm-code-button = 确认
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = 验证码已过期？
flow-setup-phone-confirm-code-resend-code-button = 重新发送验证码
flow-setup-phone-confirm-code-resend-code-success = 验证码已发送
flow-setup-phone-confirm-code-success-message-v2 = 已添加恢复电话号码
flow-change-phone-confirm-code-success-message = 已更改恢复电话号码

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = 请验证您的电话号码
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = 您会收到一条来自 { -brand-mozilla } 的短信，内容是用于验证您的手机号的验证码。请不要与任何人分享此验证码。
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = 恢复电话号码仅在美国和加拿大可用。不建议使用 VoIP 和虚拟手机号。
flow-setup-phone-submit-number-legal = 提供号码即代表您同意我们存储您的号码。我们仅在验证账户时向您发送短信，可能需支付短信和数据费用。
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = 发送验证码

## HeaderLockup component, the header in account settings

header-menu-open = 关闭菜单
header-menu-closed = 网站导航菜单
header-back-to-top-link =
    .title = 回到顶端
header-back-to-settings-link =
    .title = 返回 { -product-mozilla-account }设置
header-title-2 = { -product-mozilla-account }
header-help = 帮助

## Linked Accounts section

la-heading = 已连接账户
la-description = 您已授权连接下列账户。
la-unlink-button = 断开连接
la-unlink-account-button = 断开连接
la-set-password-button = 设置密码
la-unlink-heading = 断开与第三方账户的连接
la-unlink-content-3 = 您确定要断开与账户的连接吗？此操作不会自动将您从这些服务退出。为此，您需要到“关联服务”版块手动退出。
la-unlink-content-4 = 在取消账户关联前，必须先设置密码。如果没有密码，此后将无法登录。
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = 关闭
modal-cancel-button = 取消
modal-default-confirm-button = 确认

## ModalMfaProtected

modal-mfa-protected-title = 输入确认码
modal-mfa-protected-subtitle = 请协助确认是您本人在更改账户信息
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction = 请在 { $expirationTime } 分钟内输入发送到 <email>{ $email }</email> 的验证码。
modal-mfa-protected-input-label = 请输入 6 位确认码
modal-mfa-protected-cancel-button = 取消
modal-mfa-protected-confirm-button = 确认
modal-mfa-protected-code-expired = 确认码已过期？
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = 重新发送确认码

## Modal Verify Session

mvs-verify-your-email-2 = 确认您的邮箱地址
mvs-enter-verification-code-2 = 请输入您的确认码
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = 请在 5 分钟内输入发送到 <email>{ $email }</email> 的确认码。
msv-cancel-button = 取消
msv-submit-button-2 = 确认

## Settings Nav

nav-settings = 设置
nav-profile = 个人资料
nav-security = 账户安全
nav-connected-services = 关联服务
nav-data-collection = 数据收集与使用
nav-paid-subs = 付费订阅
nav-email-comm = 新闻通讯

## Page2faChange

page-2fa-change-title = 更改两步验证
page-2fa-change-success = 两步验证已更新
page-2fa-change-success-additional-message = 为保护所有连接的设备，您应在所有使用此账户的设备上退出登录，然后再使用新的两步验证信息重新登录。
page-2fa-change-totpinfo-error = 替换两步验证应用时出错，请稍后再试。
page-2fa-change-qr-instruction = <strong>第 1 步：</strong>使用任意一款身份验证应用（例如 Duo 或 Google 身份验证器）扫描此二维码。此操作将创建新的连接，而旧连接将失效。

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = 备用验证码
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = 更换您的备用验证码时出现问题
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = 创建备用验证码时出现问题
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = 备用验证码已更新
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = 已创建备用验证码
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = 请将这些验证码保存在您不会遗忘的地方。完成下一步骤后，您原有的验证码将被替代。
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = 请输入任意一个验证码，以确认您已保存验证码。完成此步骤后，您原有的备用验证码将无法再使用。
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = 备份验证码不正确

## Page2faSetup

page-2fa-setup-title = 两步验证
page-2fa-setup-totpinfo-error = 设置两步验证时出错，请稍后再试。
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = 备用验证码错误，请重试。
page-2fa-setup-success = 已启用两步验证
page-2fa-setup-success-additional-message = 为保护所有连接的设备，您应在所有使用此账户的设备上退出登录，然后再使用两步验证重新登录。

## Avatar change page

avatar-page-title =
    .title = 头像
avatar-page-add-photo = 添加照片
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = 拍照
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = 移除照片
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = 重拍照片
avatar-page-cancel-button = 取消
avatar-page-save-button = 保存
avatar-page-saving-button = 保存中…
avatar-page-zoom-out-button =
    .title = 缩小
avatar-page-zoom-in-button =
    .title = 放大
avatar-page-rotate-button =
    .title = 旋转
avatar-page-camera-error = 无法初始化摄像头
avatar-page-new-avatar =
    .alt = 更换头像
avatar-page-file-upload-error-3 = 上传您的头像时出现问题
avatar-page-delete-error-3 = 删除您的头像时出现问题
avatar-page-image-too-large-error-2 = 图片太大，无法上传

## Password change page

pw-change-header =
    .title = 更改密码
pw-8-chars = 至少 8 个字符
pw-not-email = 不可以与邮箱地址相同
pw-change-must-match = 新密码和确认密码输入需一致
pw-commonly-used = 不可以是常见密码
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = 安全无小事，杜绝复用密码。查看更多<linkExternal>创建高强度密码的小技巧</linkExternal>。
pw-change-cancel-button = 取消
pw-change-save-button = 保存
pw-change-forgot-password-link = 忘记密码？
pw-change-current-password =
    .label = 输入当前密码
pw-change-new-password =
    .label = 输入新密码
pw-change-confirm-password =
    .label = 确认新密码
pw-change-success-alert-2 = 密码已更新

## Password create page

pw-create-header =
    .title = 创建密码
pw-create-success-alert-2 = 密码已设置
pw-create-error-2 = 抱歉，设置密码时出现问题

## Delete account page

delete-account-header =
    .title = 删除账户
delete-account-step-1-2 = 步骤（1 / 2）
delete-account-step-2-2 = 步骤（2 / 2）
delete-account-confirm-title-4 = 此 { -product-mozilla-account }可能已关联至以下一项或多项 { -brand-mozilla } 产品或服务，它们正助力您安全、高效地畅游网络：
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = 同步 { -brand-firefox } 数据
delete-account-product-firefox-addons = { -brand-firefox } 附加组件
delete-account-acknowledge = 请确认，若您真要删除账户：
delete-account-chk-box-1-v4 =
    .label = 将取消您的所有付费订阅
delete-account-chk-box-2 =
    .label = 您可能丢失在 { -brand-mozilla } 产品中保存的信息以及功能
delete-account-chk-box-3 =
    .label = 用此邮箱地址重新激活，也无法恢复您保存的信息
delete-account-chk-box-4 =
    .label = 您发布到 addons.mozilla.org 的所有扩展和主题都将被删除。
delete-account-continue-button = 继续
delete-account-password-input =
    .label = 请输入密码
delete-account-cancel-button = 取消
delete-account-delete-button-2 = 删除

## Display name page

display-name-page-title =
    .title = 显示名称
display-name-input =
    .label = 请输入显示名称
submit-display-name = 保存
cancel-display-name = 取消
display-name-update-error-2 = 更新您的显示名称时出现问题
display-name-success-alert-2 = 显示名称已更新

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = 最近的账户活动
recent-activity-account-create-v2 = 创建账户
recent-activity-account-disable-v2 = 禁用账户
recent-activity-account-enable-v2 = 启用账户
recent-activity-account-login-v2 = 初始登录账户
recent-activity-account-reset-v2 = 已启动密码重置
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = 邮件退件被清除
recent-activity-account-login-failure = 尝试登录账户，未成功
recent-activity-account-two-factor-added = 启用两步验证
recent-activity-account-two-factor-requested = 请求两步验证
recent-activity-account-two-factor-failure = 两步验证失败
recent-activity-account-two-factor-success = 两步验证成功
recent-activity-account-two-factor-removed = 已移除两步验证
recent-activity-account-password-reset-requested = 账户请求重置密码
recent-activity-account-password-reset-success = 账户密码重置成功
recent-activity-account-recovery-key-added = 启用账户恢复密钥
recent-activity-account-recovery-key-verification-failure = 账户恢复密钥验证失败
recent-activity-account-recovery-key-verification-success = 账户恢复密钥验证成功
recent-activity-account-recovery-key-removed = 移除账户恢复密钥
recent-activity-account-password-added = 添加新密码
recent-activity-account-password-changed = 更改密码
recent-activity-account-secondary-email-added = 绑定备用邮箱
recent-activity-account-secondary-email-removed = 移除备用邮箱
recent-activity-account-emails-swapped = 主邮箱与备用邮箱调换
recent-activity-session-destroy = 退出会话
recent-activity-account-recovery-phone-send-code = 向恢复电话号码发送验证码
recent-activity-account-recovery-phone-setup-complete = 恢复电话号码设置完成
recent-activity-account-recovery-phone-signin-complete = 使用恢复电话号码登录完成
recent-activity-account-recovery-phone-signin-failed = 使用恢复电话号码登录失败
recent-activity-account-recovery-phone-removed = 移除恢复电话号码
recent-activity-account-recovery-codes-replaced = 替换恢复验证码
recent-activity-account-recovery-codes-created = 创建恢复验证码
recent-activity-account-recovery-codes-signin-complete = 使用恢复验证码登录
recent-activity-password-reset-otp-sent = 发送重置密码的确认码
recent-activity-password-reset-otp-verified = 验证重置密码的确认码
recent-activity-must-reset-password = 需要重置密码
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = 其他账户活动

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = 账户恢复密钥
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = 返回设置

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = 移除恢复电话号码
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = 此操作将移除您的恢复电话号码 <strong>{ $formattedFullPhoneNumber }</strong>。
settings-recovery-phone-remove-recommend = 我们推荐您继续使用此方式，因为这种方式比保存备用验证码更简单易行。
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = 若您决定删除此方式，请确保自己仍存有备用验证码。<linkExternal>对比不同的恢复方式</linkExternal>
settings-recovery-phone-remove-button = 移除恢复电话号码
settings-recovery-phone-remove-cancel = 取消
settings-recovery-phone-remove-success = 已移除恢复电话号码

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = 添加恢复电话号码
page-change-recovery-phone = 更改恢复电话号码
page-setup-recovery-phone-back-button-title = 回到设置
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = 更改电话号码

## Add secondary email page

add-secondary-email-step-1 = 步骤（1 / 2）
add-secondary-email-error-2 = 创建此邮件时出现问题
add-secondary-email-page-title =
    .title = 备用邮箱地址
add-secondary-email-enter-address =
    .label = 请输入邮箱地址
add-secondary-email-cancel-button = 取消
add-secondary-email-save-button = 保存
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = 无法将马甲邮箱设为备用邮箱

## Verify secondary email page

add-secondary-email-step-2 = 步骤（2 / 2）
verify-secondary-email-page-title =
    .title = 备用邮箱地址
verify-secondary-email-verification-code-2 =
    .label = 请输入您的确认码
verify-secondary-email-cancel-button = 取消
verify-secondary-email-verify-button-2 = 确认
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = 请在 5 分钟内输入发送到 <strong>{ $email }</strong> 的确认码。
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } 成功添加
verify-secondary-email-resend-code-button = 重新发送确认码

##

# Link to delete account on main Settings page
delete-account-link = 删除账户
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = 登录成功。您的 { -product-mozilla-account }和数据将保留。

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = 扫描隐私信息泄露，掌控属于您的秘密
# Links out to the Monitor site
product-promo-monitor-cta = 免费扫描

## Profile section

profile-heading = 个人资料
profile-picture =
    .header = 照片
profile-display-name =
    .header = 显示名称
profile-primary-email =
    .header = 主邮箱

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = 第 { $currentStep } 步，共 { $numberOfSteps } 步。

## Security section of Setting

security-heading = 账户安全
security-password =
    .header = 密码
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = 创建于 { $date }
security-not-set = 未设置
security-action-create = 创建
security-set-password = 请设置密码以启用同步及使用更多账户安全功能。
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = 查看近期账户活动
signout-sync-header = 会话已过期
signout-sync-session-expired = 抱歉，出了点问题。请在浏览器菜单中退出登录，然后再重试。

## SubRow component

tfa-row-backup-codes-title = 备用验证码
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = 没有可用的验证码
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 = 剩余 { $numCodesAvailable } 个验证码
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = 创建新验证码
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = 添加
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = 在无法使用移动设备或身份验证应用时，这是最安全的恢复方式。
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = 恢复电话号码
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = 未添加电话号码
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = 更改
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = 添加
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = 移除
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = 移除恢复电话号码
tfa-row-backup-phone-delete-restriction-v2 = 若要移除恢复电话号码，请先添加备用验证码或关闭两步验证，以免无法登录账户。
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = 在无法使用身份验证应用时，这是最简易的恢复方式。
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = 了解 SIM 卡交换攻击的风险

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = 关闭
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = 开启
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = 正在提交…
switch-is-on = 开启
switch-is-off = 关闭

## Sub-section row Defaults

row-defaults-action-add = 添加
row-defaults-action-change = 更改
row-defaults-action-disable = 禁用
row-defaults-status = 无

## Account recovery key sub-section on main Settings page

rk-header-1 = 账户恢复密钥
rk-enabled = 已启用
rk-not-set = 未设置
rk-action-create = 创建
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = 更改
rk-action-remove = 移除
rk-key-removed-2 = 已移除账户恢复密钥
rk-cannot-remove-key = 无法删除您的账户恢复密钥。
rk-refresh-key-1 = 刷新账户恢复密钥
rk-content-explain = 忘记密码时可用于恢复数据。
rk-cannot-verify-session-4 = 抱歉，确认您的会话时出现问题
rk-remove-modal-heading-1 = 要移除账户恢复密钥吗？
rk-remove-modal-content-1 = 以后重置密码时，将无法再使用账户恢复密钥访问您的数据。此操作不可撤销。
rk-remove-error-2 = 无法删除您的账户恢复密钥
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = 删除账户恢复密钥

## Secondary email sub-section on main Settings page

se-heading = 备用邮箱
    .header = 备用邮箱
se-cannot-refresh-email = 抱歉，刷新邮箱地址时出现问题。
se-cannot-resend-code-3 = 抱歉，重新发送确认码时出现问题
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } 现在是您的主邮箱
se-set-primary-error-2 = 抱歉，更改您的主邮箱时出现问题
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } 已成功删除
se-delete-email-error-2 = 抱歉，删除此电子邮件地址时出现问题
se-verify-session-3 = 您需要确认当前会话才能执行此操作
se-verify-session-error-3 = 抱歉，确认您的会话时出现问题
# Button to remove the secondary email
se-remove-email =
    .title = 移除邮箱地址
# Button to refresh secondary email status
se-refresh-email =
    .title = 刷新邮箱地址
se-unverified-2 = 未确认
se-resend-code-2 = 需要验证账户。如果验证邮件不在您的收件箱或垃圾邮件文件夹中，请<button>重新发送确认码</button>。
# Button to make secondary email the primary
se-make-primary = 设为主邮箱
se-default-content = 主邮箱不可用时，用此访问账户。
se-content-note-1 = 注意：无法通过备用邮箱恢复您的数据 — 您需要使用<a>账户恢复密钥</a>。
# Default value for the secondary email
se-secondary-email-none = 无

## Two Step Auth sub-section on Settings main page

tfa-row-header = 两步验证
tfa-row-enabled = 已启用
tfa-row-disabled-status = 已禁用
tfa-row-action-add = 添加
tfa-row-action-disable = 禁用
tfa-row-action-change = 更改
tfa-row-button-refresh =
    .title = 刷新两步验证状态
tfa-row-cannot-refresh = 抱歉，刷新两步验证状态时出现问题。
tfa-row-enabled-description = 您的账户受两步验证保护。登录 { -product-mozilla-account }时，您将需要输入身份验证器应用中的一次性密码。
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = 此举如何保护您的账户
tfa-row-disabled-description-v2 = 将第三方身份验证应用作为登录的附加确认手段，帮助保护账户安全。
tfa-row-cannot-verify-session-4 = 抱歉，确认您的会话时出现问题
tfa-row-disable-modal-heading = 要禁用两步验证吗？
tfa-row-disable-modal-confirm = 禁用
tfa-row-disable-modal-explain-1 = 您将无法撤销此操作。您也可选择<linkExternal>更换备用验证码</linkExternal>。
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = 已禁用两步验证
tfa-row-cannot-disable-2 = 无法禁用两步验证
tfa-row-verify-session-info = 在设置两步验证前，需要先确认当前会话

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = 继续操作即表示您同意：
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } 订阅服务的<mozSubscriptionTosLink>服务条款</mozSubscriptionTosLink>和<mozSubscriptionPrivacyLink>隐私声明</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") }<mozillaAccountsTos>服务条款</mozillaAccountsTos>和<mozillaAccountsPrivacy>隐私声明</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = 继续操作即表示您同意<mozillaAccountsTos>服务条款</mozillaAccountsTos>和<mozillaAccountsPrivacy>隐私声明</mozillaAccountsPrivacy>。

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = 或者
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = 登录方式
continue-with-google-button = 通过 { -brand-google } 登录
continue-with-apple-button = 通过 { -brand-apple } 登录

## Auth-server based errors that originate from backend service

auth-error-102 = 未知账户
auth-error-103 = 密码错误
auth-error-105-2 = 确认码无效
auth-error-110 = 无效令牌
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = 您的尝试次数过多，请稍后再试。
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = 您已尝试太多次，请在 { $retryAfter }再试。
auth-error-125 = 因为安全性因素，已拦截请求
auth-error-129-2 = 您输入的电话号码无效，请核对并重试。
auth-error-138-2 = 未验证的会话
auth-error-139 = 备用邮箱地址必须不同于您的账户邮箱地址
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = 此邮箱已被其他账户占用。请稍后重试，或使用其他邮箱地址。
auth-error-155 = 找不到 TOTP 令牌
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = 找不到备用验证码
auth-error-159 = 账户恢复密钥无效
auth-error-183-2 = 确认码无效或已过期
auth-error-202 = 功能未启用
auth-error-203 = 系统不可用，请稍后再试
auth-error-206 = 由于已经设置密码，无法再次创建密码
auth-error-214 = 恢复电话号码已存在
auth-error-215 = 恢复电话号码不存在
auth-error-216 = 已达到信息数量上限
auth-error-218 = 由于缺少备用验证码，无法移除恢复电话号码。
auth-error-219 = 此电话号码已用于注册过多账户，请尝试使用其他号码。
auth-error-999 = 意外错误
auth-error-1001 = 登录尝试已取消
auth-error-1002 = 会话已过期。请登录以继续操作。
auth-error-1003 = 本地存储或 Cookie 仍然未启用
auth-error-1008 = 新旧密码不能相同
auth-error-1010 = 请输入有效的密码
auth-error-1011 = 需要有效的邮箱地址
auth-error-1018 = 确认邮件刚才已被退回，您输入的邮箱地址可能有误。
auth-error-1020 = 您输入的邮箱地址可能有误，firefox.com 不是有效的电子邮件服务
auth-error-1031 = 您需要输入您的年龄才能注册
auth-error-1032 = 您需要输入有效年龄才能注册
auth-error-1054 = 无效的两步验证码
auth-error-1056 = 备用验证码无效
auth-error-1062 = 无效重定向
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = 您输入的邮箱地址可能有误，{ $domain } 不是有效的电子邮件服务
auth-error-1066 = 无法使用马甲邮箱注册账户。
auth-error-1067 = 您输入的邮箱地址可能有误
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = 手机尾号为 { $lastFourPhoneNumber }
oauth-error-1000 = 出了点问题。请关闭此标签页，然后再试一次。

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = 您已登录 { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = 已验证电子邮件
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = 已确认登录
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = 登录此 { -brand-firefox } 以完成设置
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = 登录
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = 还想添加其他设备吗？请在新设备上登录 { -brand-firefox } 以完成配置
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = 在另一台设备上登录 { -brand-firefox } 以完成设置
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = 想在其他设备上也能获得标签页、书签和密码等数据吗？
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = 连接其他设备
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = 现在不要
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = 登录 Android 版 { -brand-firefox } 以完成设置
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = 登录 iOS 版 { -brand-firefox } 以完成设置

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = 需要本地存储和 Cookie
cookies-disabled-enable-prompt-2 = 请在浏览器中启用 Cookie 和本地存储功能以访问 { -product-mozilla-account }，这样您就可以使用记住登录状态等功能。
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = 重试
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = 详细了解

## Index / home page

index-header = 请输入邮箱地址
index-sync-header = 继续使用 { -product-mozilla-account }
index-sync-subheader = 在所有使用 { -brand-firefox } 的设备上，同步您的密码、标签页、书签。
index-relay-header = 创建马甲邮箱
index-relay-subheader = 请填写用于接收马甲邮箱转发邮件的邮箱地址。
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = 继续使用 { $serviceName }
index-subheader-default = 进入账户设置
index-cta = 注册或登录
index-account-info = { -product-mozilla-account }还可用于访问 { -brand-mozilla } 的更多隐私保护产品。
index-email-input =
    .label = 请输入邮箱地址
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = 已成功删除账户
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = 确认邮件刚才已被退回，您输入的邮箱地址可能有误。

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = 哎呀！无法创建账户恢复密钥，请稍后再试。
inline-recovery-key-setup-recovery-created = 已创建账户恢复密钥
inline-recovery-key-setup-download-header = 保护账户安全
inline-recovery-key-setup-download-subheader = 立即下载并存储
inline-recovery-key-setup-download-info = 请将此密钥存储在您会记得的位置。此后将无法再回到本页面。
inline-recovery-key-setup-hint-header = 安全建议

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = 取消设置
inline-totp-setup-continue-button = 继续
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = 通过须额外输入一组由<authenticationAppsLink>身份验证应用</authenticationAppsLink>所生成的验证码，更周全地保护您的账户。
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = 启用两步验证以<span>继续进行账户设置</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = 启用两步验证以<span>继续使用 { $serviceName }</span>
inline-totp-setup-ready-button = 完成
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = 扫描验证码以<span>继续使用 { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = 手动输入验证码<span>以进入 { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = 扫描验证码以<span>继续进行账户设置</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = 手动输入验证码<span>以继续进行账户设置</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = 请输入身份验证密钥。<toggleToQRButton>改为扫描二维码？</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = 请使用您的身份验证应用扫描二维码，并输入其提供的验证码。<toggleToManualModeButton>无法扫码？</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = 完成后，其将自动生成验证码供您输入。
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = 验证码
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = 请输入验证码
tfa-qr-code-alt = 使用安全码 { $code } 在支持的应用程序中设置两步验证。
inline-totp-setup-page-title = 两步验证

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = 法律
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = 服务条款
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = 隐私声明

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = 隐私声明

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = 服务条款

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = 您刚刚登录了 { -product-firefox } 吗？
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = 是的，确认此设备
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = 若非本人操作，请<link>更改密码</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = 设备已连接
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = 已开始与 { $deviceOS } 上的 { $deviceFamily } 同步
pair-auth-complete-sync-benefits-text = 现在，您可以在所有设备上访问您打开的标签页、密码和书签。
pair-auth-complete-see-tabs-button = 显示来自已同步设备的标签页
pair-auth-complete-manage-devices-link = 管理设备

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = 输入验证码以<span>以继续进行账户设置</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = 输入验证码<span>以进入 { $serviceName }</span>
auth-totp-instruction = 请打开您的身份验证应用，并输入其提供的验证码。
auth-totp-input-label = 请输入 6 位验证码
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = 确认
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = 请输入验证码

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text =
    <span>在您的另一台设备上</span>
    批准登录

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = 配对不成功
pair-failure-message = 设置过程已终止。

## Pair index page

pair-sync-header = 与手机或平板电脑上的 { -brand-firefox } 同步
pair-cad-header = 连接其他设备上的 { -brand-firefox }
pair-already-have-firefox-paragraph = 手机或平板电脑上已安装 { -brand-firefox }？
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = 同步您的设备
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = 还未安装？现在下载
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = 扫码下载移动版 { -brand-firefox }，或向自己发送<linkExternal>下载链接</linkExternal>。
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = 现在不要
pair-take-your-data-message = 将您的 { -brand-firefox } 标签页、书签、密码随身携带。
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = 开始使用
# This is the aria label on the QR code image
pair-qr-code-aria-label = 二维码

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = 设备已连接
pair-success-message-2 = 配对成功。

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text =
    确认配对此邮箱
    <span>{ $email }</span>
pair-supp-allow-confirm-button = 确认配对
pair-supp-allow-cancel-link = 取消

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text =
    <span>在您的另一台设备上</span>
    批准登录

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = 请使用应用程序配对
pair-unsupported-message = 您用的是系统相机？配对必须通过 { -brand-firefox } 应用程序扫码完成。

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = 创建密码以同步
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = 此密码将用于加密您的数据，请使用不同与 { -brand-google }、{ -brand-apple } 等账户的密码。

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = 请稍等，正将您重定向至授权的应用程序。

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = 请输入账户恢复密钥
account-recovery-confirm-key-instruction = 此密钥可从 { -brand-firefox } 服务器中恢复已加密的浏览数据，例如密码和书签。
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = 请输入包含 32 个字符的账户恢复密钥
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = 您存储的提示是：
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = 继续
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = 找不到账户恢复密钥了？

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = 创建新密码
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = 密码已设置
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = 抱歉，设置密码时出现问题
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = 使用账户恢复密钥
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = 您的密码已重置。
reset-password-complete-banner-message = 别忘了在 { -product-mozilla-account }设置中生成新的账户恢复密钥，避免将来登录时遇到问题。
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } 将尝试在您登录后返回原页面，供您使用马甲邮箱。

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = 请输入由 10 个字符组成的验证码
confirm-backup-code-reset-password-confirm-button = 确认
confirm-backup-code-reset-password-subheader = 请输入备用验证码
confirm-backup-code-reset-password-instruction = 请输入您在设置两步验证时保存的一次性验证码中的任意一个。
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = 无法通过验证？

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = 请查收邮件
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = 我们已将确认码发送至 <span>{ $email }</span>。
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = 请输入 8 位确认码（10 分钟内有效）
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = 继续
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = 重新发送验证码
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = 换个账户登录

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = 重置密码
confirm-totp-reset-password-subheader-v2 = 请输入两步验证的验证码
confirm-totp-reset-password-instruction-v2 = 请查看<strong>身份验证应用</strong>以重置密码。
confirm-totp-reset-password-trouble-code = 输入代码时遇到问题？
confirm-totp-reset-password-confirm-button = 确认
confirm-totp-reset-password-input-label-v2 = 请输入 6 位验证码
confirm-totp-reset-password-use-different-account = 换个账户登录

## ResetPassword start page

password-reset-flow-heading = 重置密码
password-reset-body-2 = 我们将询问一些仅您自己知道的信息，以确保账户安全。
password-reset-email-input =
    .label = 请输入您的电子邮箱
password-reset-submit-button-2 = 继续

## ResetPasswordConfirmed

reset-password-complete-header = 您的密码已重置
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = 继续使用 { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = 重设密码
password-reset-recovery-method-subheader = 选择恢复方式
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = 请协助确认是您本人在使用恢复方式。
password-reset-recovery-method-phone = 恢复电话号码
password-reset-recovery-method-code = 备用验证码
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info = 剩余 { $numBackupCodes } 个验证码
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = 向恢复电话号码发送验证码时出现问题
password-reset-recovery-method-send-code-error-description = 请稍后再试，或改用备用验证码。

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = 重设密码
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = 请输入恢复代码
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = 一个六位数验证码已通过短信发送到尾号为 <span>{ $lastFourPhoneDigits }</span> 的电话号码，5 分钟内有效。请勿向任何人透露。
reset-password-recovery-phone-input-label = 请输入 6 位验证码
reset-password-recovery-phone-code-submit-button = 确认
reset-password-recovery-phone-resend-code-button = 重新发送验证码
reset-password-recovery-phone-resend-success = 验证码已发送
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = 无法通过验证？
reset-password-recovery-phone-send-code-error-heading = 发送验证码时出现问题
reset-password-recovery-phone-code-verification-error-heading = 验证您的验证码时出现问题
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = 请稍后再试。
reset-password-recovery-phone-invalid-code-error-description = 验证码无效或已过期。
reset-password-recovery-phone-invalid-code-error-link = 改用备用验证码？
reset-password-with-recovery-key-verified-page-title = 密码重置成功
reset-password-complete-new-password-saved = 已保存新密码！
reset-password-complete-recovery-key-created = 已创建新的账户恢复密钥，请立即下载并存储。
reset-password-complete-recovery-key-download-info = 若您以后忘记密码，则只能通过此密钥来恢复数据。<b>请立即下载此密钥并安全存储，您此后将无法再查看此页面。</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = 错误：
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = 正在验证登录…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = 确认时发生错误
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = 确认链接已过期
signin-link-expired-message-2 = 您点击的链接已过期或已被使用。

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = <span>{ -product-mozilla-account }</span>请输入密码
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = 继续使用 { $serviceName }
signin-subheader-without-logo-default = 前往账户设置
signin-button = 登录
signin-header = 登录
signin-use-a-different-account-link = 换个账户登录
signin-forgot-password-link = 忘记密码？
signin-password-button-label = 密码
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } 将尝试在您登录后返回原页面，供您使用马甲邮箱。
signin-code-expired-error = 验证码已过期，请重新登录。
signin-account-locked-banner-heading = 重设密码
signin-account-locked-banner-description = 我们已锁定您的账户，以防范可疑活动带来的威胁
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = 重设密码以登录

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = 您点击的链接缺少字符，可能是您的邮件客户端损坏了该链接。请确保复制了完整的网址，然后再试一次。
report-signin-header = 报告未授权的登录？
report-signin-body = 您收到一封邮件，提醒您有人尝试访问您的账户。要将此次登录报告为可疑活动吗？
report-signin-submit-button = 报告此活动
report-signin-support-link = 为什么会出现此情况？
report-signin-error = 抱歉，提交报告时出现问题。
signin-bounced-header = 对不起。我们已锁定您的账户。
# $email (string) - The user's email.
signin-bounced-message = 我们发送至 { $email } 的确认电子邮件已被退回，我们已锁定您的账户以保护您的 { -brand-firefox } 数据。
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = 如果这是一个有效的电子邮件地址，请<linkExternal>告诉我们</linkExternal>，我们可以帮助解锁您的账户。
signin-bounced-create-new-account = 不再拥有该邮箱？创建一个新账户吧
back = 上一步

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = 验证此次登录<span>以继续进行账户设置</span>
signin-push-code-heading-w-custom-service = 验证此次登录<span>以进入 { $serviceName }</span>
signin-push-code-instruction = 请在您的其他设备上，批准此次来自 { -brand-firefox } 浏览器的登录。
signin-push-code-did-not-recieve = 没有收到通知？
signin-push-code-send-email-link = 通过邮件发送验证码

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = 请确认登录
signin-push-code-confirm-description = 我们发现来自以下设备的登录尝试。如果是您在操作，请批准此次登录。
signin-push-code-confirm-verifying = 正在验证
signin-push-code-confirm-login = 确认登录
signin-push-code-confirm-wasnt-me = 非本人操作，更改密码。
signin-push-code-confirm-login-approved = 已批准登录，请关闭此窗口。
signin-push-code-confirm-link-error = 链接已损坏，请重试。

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = 登录
signin-recovery-method-subheader = 请选择一项恢复方式
signin-recovery-method-details = 请协助确认是您本人在使用恢复方式。
signin-recovery-method-phone = 恢复电话号码
signin-recovery-method-code-v2 = 备用验证码
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 = 剩余 { $numBackupCodes } 个验证码
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = 向恢复电话号码发送验证码时出现问题
signin-recovery-method-send-code-error-description = 请稍后再试，或改用备用验证码。

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = 登录
signin-recovery-code-sub-heading = 请输入备用验证码
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = 请输入您在设置两步验证时保存的一次性验证码中的任意一个。
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = 请输入由 10 个字符组成的验证码
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = 确认
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = 使用恢复电话号码
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = 无法通过验证？
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = 需要使用备用验证码
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = 向恢复电话号码发送验证码时出现问题
signin-recovery-code-use-phone-failure-description = 请稍后再试。

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = 登录
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = 请输入恢复验证码
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = 一个六位数验证码已通过短信发送到尾号为 <span>{ $lastFourPhoneDigits }</span> 的电话号码，5 分钟内有效。请勿向任何人透露。
signin-recovery-phone-input-label = 请输入 6 位验证码
signin-recovery-phone-code-submit-button = 确认
signin-recovery-phone-resend-code-button = 重新发送验证码
signin-recovery-phone-resend-success = 验证码已发送
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = 无法通过验证？
signin-recovery-phone-send-code-error-heading = 发送验证码时出现问题
signin-recovery-phone-code-verification-error-heading = 验证您的验证码时出现问题
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = 请稍后再试。
signin-recovery-phone-invalid-code-error-description = 验证码无效或已过期。
signin-recovery-phone-invalid-code-error-link = 要改用备用验证码吗？
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = 登录成功。再次使用恢复电话号码登录时，可能会受到限制。

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = 感谢您的反馈
signin-reported-message = 我们已收到您的反馈，感谢您帮助我们防范入侵者。

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = <span>{ -product-mozilla-account }</span>请输入确认码
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = 请在 5 分钟内输入发送到 <email>{ $email }</email> 的验证码。
signin-token-code-input-label-v2 = 请输入 6 位验证码
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = 确认
signin-token-code-code-expired = 验证码已过期？
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = 重新发送验证码。
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = 请输入确认码
signin-token-code-resend-error = 出了点问题，无法发送新验证码。
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } 将尝试在您登录后返回原页面，供您使用马甲邮箱。

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = 登录
signin-totp-code-subheader-v2 = 请输入两步验证的验证码
signin-totp-code-instruction-v4 = 请通过<strong>身份验证应用</strong>确认登录。
signin-totp-code-input-label-v4 = 请输入 6 位验证码
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = 为什么需要进行身份验证？
signin-totp-code-aal-banner-content = 您为账户设置了两步验证，但未通过验证码登录过此设备。
signin-totp-code-aal-sign-out = 从此设备退出登录
signin-totp-code-aal-sign-out-error = 抱歉，退出登录时出现问题。
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = 确认
signin-totp-code-other-account-link = 换个账户登录
signin-totp-code-recovery-code-link = 输入验证码时遇到问题？
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = 请输入验证码
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } 将尝试在您登录后返回原页面，供您使用马甲邮箱。

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = 授权此次登录
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = 授权码邮件已发送至 { $email }，请注意查收。
signin-unblock-code-input = 请输入授权码
signin-unblock-submit-button = 继续
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = 请输入授权码
signin-unblock-code-incorrect-length = 授权码应由 8 个字符组成
signin-unblock-code-incorrect-format-2 = 授权码只能是字母、数字或其组合
signin-unblock-resend-code-button = 收件箱和垃圾邮件箱中都没有？重新发送
signin-unblock-support-link = 为什么会出现此情况？
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } 将尝试在您登录后返回原页面，供您使用马甲邮箱。

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = 输入确认码
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = <span>{ -product-mozilla-account }</span>请输入确认码
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = 请在 5 分钟内输入发送到 <email>{ $email }</email> 的验证码。
confirm-signup-code-input-label = 请输入 6 位验证码
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = 确认
confirm-signup-code-sync-button = 开始同步
confirm-signup-code-code-expired = 验证码已过期？
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = 重新发送验证码。
confirm-signup-code-success-alert = 账户已成功确认
# Error displayed in tooltip.
confirm-signup-code-is-required-error = 请输入确认码
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } 将尝试在您登录后返回原页面，供您使用马甲邮箱。

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = 创建密码
signup-relay-info = 需通过密码来安全管理您的马甲邮箱，以及使用 { -brand-mozilla } 的安全工具。
signup-sync-info = 在您使用 { -brand-firefox } 的各设备间，同步密码、书签等数据。
signup-sync-info-with-payment = 在您使用 { -brand-firefox } 的各设备间，同步密码、付款信息、书签等数据。
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = 更改邮箱

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = 同步服务已开启
signup-confirmed-sync-success-banner = 已确认 { -product-mozilla-account }
signup-confirmed-sync-button = 开始浏览
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = 您可以在使用 { -brand-firefox } 的各设备间，同步密码、付款方式、地址、书签、历史记录等数据。
signup-confirmed-sync-description-v2 = 您可以在使用 { -brand-firefox } 的各设备间，同步密码、地址、书签、历史记录等数据。
signup-confirmed-sync-add-device-link = 添加其他设备
signup-confirmed-sync-manage-sync-button = 管理同步
signup-confirmed-sync-set-password-success-banner = 已创建同步密码
