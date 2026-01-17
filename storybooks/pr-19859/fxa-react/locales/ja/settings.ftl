# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = 新しいコードをメールに送信しました。
resend-link-success-banner-heading = 新しいリンクをメールに送信しました。
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = 確実に受信できるよう { $accountsEmail } を連絡先に追加しておいてください。

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = バナーを閉じる
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts }が 11 月 1 日から { -product-mozilla-accounts }に名称変更されます
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = これまでと同じユーザー名とパスワードでログインできます。ご使用の製品にその他の変更はありません。
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = { -product-firefox-accounts }を { -product-mozilla-accounts }に名称変更しました。これまでと同じユーザー名とパスワードでログインできます。ご使用の製品にその他の変更はありません。
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = 詳細情報
# Alt text for close banner image
brand-close-banner =
    .alt = バナーを閉じる
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m ロゴ

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = 戻る
button-back-title = 戻る

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = ダウンロードして続ける
    .title = ダウンロードして続ける
recovery-key-pdf-heading = アカウント回復用キー
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = 作成日: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = アカウント回復用キー
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = パスワードを忘れた場合、暗号化されたブラウジングデータ (パスワード、ブックマーク、閲覧履歴など) をこのキーで復元できます。このキーを思い出しやすい場所に保管してください。
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = キーを保管する場所
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = アカウント回復用キーの詳細
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = 申し訳ありませんが、アカウント回復用キーのダウンロード中に問題が発生しました。

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = { -brand-mozilla } からの詳細:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = 最新ニュースと製品アップデートを入手
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = 新製品をテストするための早期アクセス
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = インターネットを取り戻すために行動を起こしましょう

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = ダウンロード済み
datablock-copy =
    .message = コピーしました
datablock-print =
    .message = 印刷済み

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success = コードをコピーしました
datablock-download-success = コードをダウンロードしました
datablock-print-success = コードを印刷しました

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = コピーしました

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $country }、{ $region }、{ $city } (おおよその位置)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $country }、{ $region } (おおよその位置)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $country }、{ $city } (おおよその位置)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (おおよその位置)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = 場所不明
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $genericOSName } の { $browserName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP アドレス: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = パスワード
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = パスワードを再入力してください
form-password-with-inline-criteria-signup-submit-button = アカウントを作成
form-password-with-inline-criteria-reset-new-password =
    .label = 新しいパスワード
form-password-with-inline-criteria-confirm-password =
    .label = 新しいパスワードの確認
form-password-with-inline-criteria-reset-submit-button = 新しいパスワードを作成
form-password-with-inline-criteria-set-password-new-password-label =
    .label = パスワード
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = パスワードを再入力してください
form-password-with-inline-criteria-set-password-submit-button = 同期を開始
form-password-with-inline-criteria-match-error = パスワードが一致しません
form-password-with-inline-criteria-sr-too-short-message = パスワードは 8 文字以上にする必要があります。
form-password-with-inline-criteria-sr-not-email-message = パスワードにメールアドレスを含めることはできません。
form-password-with-inline-criteria-sr-not-common-message = パスワードは一般的に使用されているパスワードにしてはいけません。
form-password-with-inline-criteria-sr-requirements-met = 入力されたパスワードはすべてのパスワード要件を満たしています。
form-password-with-inline-criteria-sr-passwords-match = 入力したパスワードは一致しています。

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = この項目は必須です

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)


# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } アカウント回復用キー
get-data-trio-title-backup-verification-codes = バックアップ認証コード
get-data-trio-download-2 =
    .title = ダウンロード
    .aria-label = ダウンロード
get-data-trio-copy-2 =
    .title = コピー
    .aria-label = コピー
get-data-trio-print-2 =
    .title = 印刷
    .aria-label = 印刷

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = 警告標識
authenticator-app-aria-label =
    .aria-label = 認証アプリ
backup-codes-icon-aria-label-v2 =
    .aria-label = バックアップ認証コードが有効
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = バックアップ認証コードが無効
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = 回復用 SMS が有効
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = 回復用 SMS が無効
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = カナダ国旗
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = チェックマーク
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = 完了
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = 有効
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = メッセージを閉じる
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = コード
error-icon-aria-label =
    .aria-label = エラー
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = アメリカ国旗

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = コンピューターとスマートフォン、それぞれに失恋ハートの画像
hearts-verified-image-aria-label =
    .aria-label = コンピューターとスマートフォン、それぞれにドキドキハートの画像
signin-recovery-code-image-description =
    .aria-label = 非表示のテキストを含むドキュメント。
signin-totp-code-image-label =
    .aria-label = 6 桁のコードが隠されている端末。
confirm-signup-aria-label =
    .aria-label = リンクを含む封筒
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = アカウント回復用キーを表す図。
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = アカウント回復用キーを表すイラスト。
lightbulb-aria-label =
    .aria-label = ストレージヒントの作成を表すイラスト。
email-code-image-aria-label =
    .aria-label = コードを含む電子メールを表す図。

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = { -brand-firefox } にログインしました。
inline-recovery-key-setup-create-header = アカウントを保護してください
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = データを保護するために少しお時間をいただけますか？
inline-recovery-key-setup-info = アカウント回復用キーを作成すると、もしパスワードを忘れても同期しているブラウジングデータを回復できます。
inline-recovery-key-setup-start-button = アカウント回復用キーを作成
inline-recovery-key-setup-later-button = 後で

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = パスワードを隠す
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = パスワードを開示
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = パスワードが画面に表示されています。
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = パスワードが隠されています。
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = パスワードが画面に表示されました。
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = パスワードが隠されました。

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = 国を選択してください
input-phone-number-enter-number = 電話番号を入力してください
input-phone-number-country-united-states = アメリカ合衆国
input-phone-number-country-canada = カナダ
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = 戻る

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = パスワードをリセットするリンクが壊れています
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = 確認リンクが壊れています
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = リンクが不完全です
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = 認証リンク URL の長さが足りません。受信したメールクライアントにより、リンクが途中で切れている可能性があります。正しい URL を確認の上コピーし、再度お試しください。

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = パスワードを思い出しましたか？
# link navigates to the sign in page
remember-password-signin-link = ログイン

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = 優先メールアドレスは既に確認されています
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = ログインは既に確認されています
confirmation-link-reused-message = 確認リンクは一度のみ使用でき、このリンクは既に使用されています。

## Locale Toggle Component

locale-toggle-select-label = 言語を選択
locale-toggle-browser-default = ブラウザーの設定に従う
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = 不正なリクエスト

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = このパスワードは、格納されたアカウント情報の暗号化されたデータにアクセスするために必要です。
password-info-balloon-reset-risk-info = リセットすることにより、パスワードやブックマークなどのデータが失われる可能性があります。

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = 他のサイトで使用したことのない強固なパスワードを選択してください。次のセキュリティ要件を満たしていることを確認してください:
password-strength-short-instruction = 強固なパスワードを選択してください:
password-strength-inline-min-length = 最低 8 文字
password-strength-inline-not-email = メールアドレスと一致しないこと
password-strength-inline-not-common = よく使われるパスワードと一致しないこと
password-strength-inline-confirmed-must-match = 確認のための再入力が新しいパスワードと一致すること

## Notification Promo Banner component

account-recovery-notification-cta = 作成
account-recovery-notification-header-value = パスワードを忘れてもデータを復元できるように設定してください
account-recovery-notification-header-description = アカウント回復用キーを作成すると、もしパスワードを忘れても同期しているブラウジングデータを回復できます。
recovery-phone-promo-cta = 回復用電話番号を追加
recovery-phone-promo-heading = 回復用電話番号でアカウントの保護を強化しましょう
recovery-phone-promo-description = 2 段階認証アプリを使用できない場合は、SMS 経由のワンタイムパスワードを使用してログインできるようになりました。

## Ready component

ready-complete-set-up-instruction = 他の端末上の { -brand-firefox } でも新しいパスワードを入力して、設定を完了してください。
manage-your-account-button = アカウント管理
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = { $serviceName } が利用可能になりました
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = アカウント設定を使用する準備ができました
# Message shown when the account is ready but the user is not signed in
ready-account-ready = アカウントの準備が整いました。
ready-continue = 続ける
sign-in-complete-header = ログインが確認されました
sign-up-complete-header = アカウントを確認しました
primary-email-verified-header = 優先メールアドレスを確認しました

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = キーを保管する場所:
flow-recovery-key-download-storage-ideas-folder-v2 = 安全な端末内のフォルダー
flow-recovery-key-download-storage-ideas-cloud = 信頼できるクラウドストレージ
flow-recovery-key-download-storage-ideas-print-v2 = 物理コピーで印刷
flow-recovery-key-download-storage-ideas-pwd-manager = パスワードマネージャー

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = キーを見つけるのに役立つヒントを追加してください
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = このヒントは、アカウント回復キーを保管した場所を思い出すのに役立ちます。これは、パスワードをリセットしてデータを回復するときに表示されます。
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = ヒントを入力してください (任意)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = 完了
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = このヒントは 255 文字以内に短くしてください。
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = ヒントに安全でないユニコードの制御文字等を含めることはできません。通常の文字、数字、句読点、記号のみが使用できます。

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = 警告
password-reset-chevron-expanded = 警告を折りたたみます
password-reset-chevron-collapsed = 警告を展開します
password-reset-data-may-not-be-recovered = ブラウザーのデータは回復されないかもしれません
password-reset-previously-signed-in-device-2 = 以前にログインした端末をお持ちの場合:
password-reset-data-may-be-saved-locally-2 = ブラウザーのデータが端末に保存されているかもしれません。パスワードをリセットした後にその端末にログインすると、データを回復して同期します。
password-reset-no-old-device-2 = 新しい端末はあるが、以前の端末にアクセスできない場合:
password-reset-encrypted-data-cannot-be-recovered-2 = 残念ながら、{ -brand-firefox } サーバーの暗号化されたブラウザーデータは回復できません。
password-reset-warning-have-key = アカウント回復キーをお持ちの場合:
password-reset-warning-use-key-link = 今すぐ使用して、データを保持したままパスワードをリセットしてください。

## Alert Bar

alert-bar-close-message = メッセージを閉じる

## User's avatar

avatar-your-avatar =
    .alt = あなたのアバター
avatar-default-avatar =
    .alt = 既定のアバター

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } の製品
bento-menu-tagline = プライバシーを保護する他の { -brand-mozilla } の製品
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = デスクトップ向け { -brand-firefox } ブラウザー
bento-menu-firefox-mobile = モバイル向け { -brand-firefox } ブラウザー
bento-menu-made-by-mozilla = Made by { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = モバイルまたはタブレット上で { -brand-firefox } を入手する
connect-another-find-fx-mobile-2 = { -google-play } と { -app-store } で { -brand-firefox } を見つけます。
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = { -google-play } で { -brand-firefox } をダウンロード
connect-another-app-store-image-3 =
    .alt = { -app-store } で { -brand-firefox } をダウンロード

## Connected services section

cs-heading = 接続済みサービス
cs-description = ログインして利用中の端末やサービス
cs-cannot-refresh = 申し訳ありませんが、接続されたサービスのリフレッシュ中に問題が発生しました。
cs-cannot-disconnect = クライアントが見つからないため、切断できません
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = { $service } からログアウトしました
cs-refresh-button =
    .title = 接続済みサービスをリフレッシュ
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = 項目が不足または重複していますか？
cs-disconnect-sync-heading = Sync から切断

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = ブラウジングデータは <span>{ $device }</span> に残りますが、アカウントと同期されなくなります。
cs-disconnect-sync-reason-3 = <span>{ $device }</span> の接続を解除する主な理由は何ですか？

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = この端末について:
cs-disconnect-sync-opt-suspicious = 疑わしい
cs-disconnect-sync-opt-lost = 紛失または盗難にあった
cs-disconnect-sync-opt-old = 古いまたは買い替えた
cs-disconnect-sync-opt-duplicate = 重複している
cs-disconnect-sync-opt-not-say = 無回答

##

cs-disconnect-advice-confirm = 了解しました
cs-disconnect-lost-advice-heading = 紛失または盗難にあった端末を切断しました
cs-disconnect-lost-advice-content-3 = 端末が紛失または盗難にあったときは、あなたの情報を守るためにアカウント設定で { -product-mozilla-account }のパスワードを変更してください。端末のメーカーのサポートで、データのリモート消去に関しての情報を確認してください。
cs-disconnect-suspicious-advice-heading = 疑わしい端末を切断しました
cs-disconnect-suspicious-advice-content-2 = 接続を解除した端末に不正使用の疑いがあるときは、あなたの情報を守るためにアカウント設定で { -product-mozilla-account }のパスワードを変更してください。アドレスバーに about:logins と入力して、{ -brand-firefox } に保存されたパスワードも変更してください。
cs-sign-out-button = ログアウト

## Data collection section

dc-heading = データの収集と使用
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } ブラウザー
dc-subheader-content-2 = { -product-mozilla-accounts } が技術データと対話データを { -brand-mozilla } へ送信することを許可する
dc-subheader-ff-content = { -brand-firefox } ブラウザーの技術データと対話データの設定は、{ -brand-firefox } の設定を開いて「プライバシーとセキュリティ」から確認できます。
dc-opt-out-success-2 = オプトアウトが完了しました。{ -product-mozilla-accounts }が技術データと対話データを { -brand-mozilla } へ送信しないように設定を変更しました。
dc-opt-in-success-2 = ご協力ありがとうございます。このデータを共有することで { -product-mozilla-accounts }の改善に役立てられます。
dc-opt-in-out-error-2 = データ収集設定の変更時に問題が発生しました
dc-learn-more = 詳細情報

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }メニュー
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = ログイン中のアカウント
drop-down-menu-sign-out = ログアウト
drop-down-menu-sign-out-error-2 = 申し訳ありませんが、ログアウト中に問題が発生しました

## Flow Container

flow-container-back = 戻る

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = 安全のためパスワードを再入力してください
flow-recovery-key-confirm-pwd-input-label = パスワードを入力してください
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = アカウント回復用キーを作成
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = 新しいアカウント回復用キーを作成する

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = アカウント回復キーが作成されました — 今すぐダウンロードして保管してください
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = パスワードを忘れた場合に、このキーを使用してデータを回復できます。今すぐダウンロードして、覚えやすい場所に保管してください。後でこのページに戻ることはできません。
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = ダウンロードせずに続ける

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = アカウント回復用キーが生成されました

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = パスワードを忘れた場合に備えてアカウント回復用キーを作成します
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = アカウント回復用キーを変更してください
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = パスワードやブックマークなどのブラウジングデータは暗号化されます。これは、プライバシー保護には優れていますが、パスワードを忘れるとデータが失われることを意味します。
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = そのため、アカウント回復用キーの作成が非常に重要です。このキーを使用してデータを復元してください。
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = はじめる
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = キャンセル

## FlowSetup2faApp

flow-setup-2fa-qr-heading = 認証アプリを設定します
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>ステップ 1:</strong> 認証アプリ (Duo や Google Authenticator など) を使用して、この QR コードをスキャンしてください。
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = 2 段階認証を設定するための QR コードです。スキャンするか、「QR コードをスキャンできませんか？」からセットアップ用の秘密鍵を入手してください。
flow-setup-2fa-cant-scan-qr-button = QR コードをスキャンできませんか？
flow-setup-2fa-manual-key-heading = 手動でコードを入力してください
flow-setup-2fa-manual-key-instruction = <strong>ステップ 1:</strong> 使用したい認証アプリにこのコードを入力してください。
flow-setup-2fa-scan-qr-instead-button = 代わりに QR コードをスキャンしますか？
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = 認証アプリについての詳細
flow-setup-2fa-button = 続ける
flow-setup-2fa-step-2-instruction = <strong>ステップ 2:</strong> 認証アプリからコードを入力してください。
flow-setup-2fa-input-label = 6 桁のコードを入力
flow-setup-2fa-code-error = コードが無効であるか、有効期限が切れています。認証アプリを確認してもう一度お試しください。

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = 回復方法を選択してください
flow-setup-2fa-backup-choice-description = モバイル端末や認証アプリにアクセスできない場合でも、この方法でログインできるようになります。
flow-setup-2fa-backup-choice-phone-title = 回復用電話番号
flow-setup-2fa-backup-choice-phone-badge = 簡単
flow-setup-2fa-backup-choice-phone-info = 回復用コードをテキストメッセージで受け取ります。現在、アメリカとカナダのみで利用可能です。
flow-setup-2fa-backup-choice-code-title = バックアップ認証コード
flow-setup-2fa-backup-choice-code-badge = 安全
flow-setup-2fa-backup-choice-code-info = 1 度だけ使用できる認証コードを作成し、保存します。
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = 回復と SIM スワップの危険性についての詳細

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = バックアップ認証コードを入力してください
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = 保存していることを確認するためにコードを一つ入力してください。認証アプリを使用できない場合、コードがないとログインできません。
flow-setup-2fa-backup-code-confirm-code-input = 10 文字のコードを入力
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = 完了

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = バックアップ認証コードを保存してください
flow-setup-2fa-backup-code-dl-save-these-codes = 思い出しやすい場所に保管してください。認証アプリにアクセスできない場合、ログインするために一つ入力する必要があります。
flow-setup-2fa-backup-code-dl-button-continue = 続ける

##

flow-setup-2fa-inline-complete-success-banner = 2 段階認証が有効になりました
flow-setup-2fa-inline-complete-backup-code = バックアップ認証コード
flow-setup-2fa-inline-complete-backup-phone = 回復用電話番号
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info = コード: 残り { $count } 個
flow-setup-2fa-inline-complete-backup-code-description = 携帯端末や認証アプリでログインできない場合にアカウントを回復する最も安全な方法です。
flow-setup-2fa-inline-complete-backup-phone-description = 認証アプリでログインできない場合でも簡単にアカウントを回復できる方法です。
flow-setup-2fa-inline-complete-learn-more-link = アカウント保護に役立つ理由
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = { $serviceName } へ進む
flow-setup-2fa-prompt-continue-button = 続ける

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = 確認コードを入力してください
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = <span>{ $phoneNumber }</span> にテキストメッセージで 6 桁のコードを送信しました。このコードは 5 分間で有効期限切れになります。
flow-setup-phone-confirm-code-input-label = 6 桁のコードを入力
flow-setup-phone-confirm-code-button = 確認
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = コードの有効期限が切れていますか？
flow-setup-phone-confirm-code-resend-code-button = 確認コードを再送する
flow-setup-phone-confirm-code-resend-code-success = コードを送信しました
flow-setup-phone-confirm-code-success-message-v2 = 回復用電話番号を追加しました

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = 電話番号を確認します
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = 電話番号を確認するために { -brand-mozilla } からテキストメッセージを送信します。このコードは誰とも共有しないでください。
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = 回復用電話番号はアメリカ合衆国とカナダのみで利用可能です。VoIP の電話番号や電話番号マスクは非推奨です。
flow-setup-phone-submit-number-legal = 電話番号を提供すると、テキストメッセージを送信してアカウントを認証する目的で電話番号が保存されることに同意したものとみなされます。メッセージやデータ通信には料金がかかる場合があります。
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = コードを送信

## HeaderLockup component, the header in account settings

header-menu-open = メニューを閉じる
header-menu-closed = サイトナビゲーションメニュー
header-back-to-top-link =
    .title = トップに戻る
header-title-2 = { -product-mozilla-account }
header-help = ヘルプ

## Linked Accounts section

la-heading = リンクされたアカウント
la-description = 次のアカウントへのアクセスを許可しました。
la-unlink-button = リンク解除
la-unlink-account-button = リンク解除
la-set-password-button = パスワードを設定
la-unlink-heading = サードパーティのアカウントとのリンクを解除する
la-unlink-content-3 = 本当にアカウントとのリンクを解除しますか？ アカウントとのリンクを解除しても接続済みのサービスはログアウトされません。ログアウトするには、 [接続済みサービス] から手動でログアウトする必要があります。
la-unlink-content-4 = アカウントのリンクを解除する前にパスワードを設定する必要があります。パスワードを設定しないと、リンクを解除した後に再度ログインすることができません。
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = 閉じる
modal-cancel-button = キャンセル
modal-default-confirm-button = 確認

## ModalMfaProtected

modal-mfa-protected-title = 確認コードを入力してください
modal-mfa-protected-subtitle = アカウント情報を変更しようとしているのがあなた本人であることを確認します
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction = { $expirationTime } 分以内に <email>{ $email }</email> 宛に送信されたコードを入力してください。
modal-mfa-protected-input-label = 6 桁のコードを入力
modal-mfa-protected-cancel-button = キャンセル
modal-mfa-protected-confirm-button = 確認
modal-mfa-protected-code-expired = コードの有効期限が切れていますか？
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = 新しいコードをメールに送信する。

## Modal Verify Session

mvs-verify-your-email-2 = メールアドレスを確認
mvs-enter-verification-code-2 = 確認コードを入力してください
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = 5 分以内に <email>{ $email }</email> に送信された確認コードを入力してください。
msv-cancel-button = キャンセル
msv-submit-button-2 = 確認

## Settings Nav

nav-settings = 設定
nav-profile = プロファイル
nav-security = セキュリティ
nav-connected-services = 接続済みサービス
nav-data-collection = データの収集と使用
nav-paid-subs = 有料サブスクリプション
nav-email-comm = メールの設定管理

## Page2faChange

page-2fa-change-success = 2 段階認証が更新されました
page-2fa-change-qr-instruction = <strong>ステップ 1:</strong> 認証アプリ (Duo や Google Authenticator など) を使用して、この QR コードをスキャンしてください。これにより新しい設定が作成され、以前の設定は機能しなくなります。

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = バックアップ認証コード
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = バックアップ認証コードの差し替え時に問題が発生しました
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = バックアップ認証コードの生成時に問題が発生しました

## Page2faSetup

page-2fa-setup-title = 2 段階認証
page-2fa-setup-success = 2 段階認証が有効化されました

## Avatar change page

avatar-page-title =
    .title = プロファイル写真
avatar-page-add-photo = 写真を追加
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = 写真を撮影
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = 写真を削除
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = 写真を撮り直す
avatar-page-cancel-button = キャンセル
avatar-page-save-button = 保存する
avatar-page-saving-button = 保存中...
avatar-page-zoom-out-button =
    .title = ズームアウト
avatar-page-zoom-in-button =
    .title = ズームイン
avatar-page-rotate-button =
    .title = 回転
avatar-page-camera-error = カメラを初期化できませんでした
avatar-page-new-avatar =
    .alt = 新しいプロファイル写真
avatar-page-file-upload-error-3 = プロファイル写真のアップロードに問題が発生しました
avatar-page-delete-error-3 = プロファイル写真の削除に問題がありました
avatar-page-image-too-large-error-2 = 画像ファイルのサイズが大きすぎてアップロードできません

## Password change page

pw-change-header =
    .title = パスワードを変更
pw-8-chars = 最低 8 文字
pw-not-email = あなたのメールアドレスではありません
pw-change-must-match = 新しいパスワードを再入力して一致させる必要があります
pw-commonly-used = よくあるパスワードは使用できません
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = 安全のため、パスワードを再利用してはいけません。<linkExternal>強力なパスワードを作成する</linkExternal>ためのヒントをご覧ください。
pw-change-cancel-button = キャンセル
pw-change-save-button = 保存
pw-change-forgot-password-link = パスワードを忘れましたか？
pw-change-current-password =
    .label = 現在のパスワードを入力してください
pw-change-new-password =
    .label = 新しいパスワードを入力してください
pw-change-confirm-password =
    .label = 新しいパスワードを再入力してください
pw-change-success-alert-2 = パスワードを更新しました

## Password create page

pw-create-header =
    .title = パスワードを作成
pw-create-success-alert-2 = パスワードを設定しました
pw-create-error-2 = 申し訳ありませんが、パスワードの設定中に問題が発生しました

## Delete account page

delete-account-header =
    .title = アカウントを削除
delete-account-step-1-2 = ステップ 1/2
delete-account-step-2-2 = ステップ 2/2
delete-account-confirm-title-4 = あなたの { -product-mozilla-account }が、ウェブ上の安全と生産性を保つ次のいずれかの { -brand-mozilla } 製品と接続されている可能性があります:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox } データの同期
delete-account-product-firefox-addons = { -brand-firefox } のアドオン
delete-account-acknowledge = アカウントを削除する前に、以下の事項をご確認ください:
delete-account-chk-box-2 =
    .label = { -brand-mozilla } 製品内に保存された情報と機能が失われる可能性があります
delete-account-chk-box-3 =
    .label = このメールアドレスで再び有効化しても、保存された情報が復元できない場合があります
delete-account-chk-box-4 =
    .label = addons.mozilla.org に公開されたすべての拡張機能とテーマは削除されます
delete-account-continue-button = 続ける
delete-account-password-input =
    .label = パスワードを入力してください
delete-account-cancel-button = キャンセル
delete-account-delete-button-2 = 削除

## Display name page

display-name-page-title =
    .title = 表示名
display-name-input =
    .label = 表示名を入力してください
submit-display-name = 保存
cancel-display-name = キャンセル
display-name-update-error-2 = 表示名のアップデートに問題がありました
display-name-success-alert-2 = 表示名が更新されました

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = 最近のアカウント利用情報
recent-activity-account-create-v2 = アカウントを作成しました
recent-activity-account-disable-v2 = アカウントが無効になりました
recent-activity-account-enable-v2 = アカウントが有効になりました
recent-activity-account-login-v2 = アカウントのログインが開始されました
recent-activity-account-reset-v2 = パスワードのリセットが開始されました
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = メールのバウンスが解消されました
recent-activity-account-login-failure = アカウントへのログイン試行が失敗しました
recent-activity-account-two-factor-added = 2 段階認証が有効になりました
recent-activity-account-two-factor-requested = 2 段階認証が要求されました
recent-activity-account-two-factor-failure = 2 段階認証に失敗しました
recent-activity-account-two-factor-success = 2 段階認証に成功しました
recent-activity-account-two-factor-removed = 2 段階認証が削除されました
recent-activity-account-password-reset-requested = パスワードのリセットが要求されました
recent-activity-account-password-reset-success = パスワードのリセットが完了しました
recent-activity-account-recovery-key-added = アカウント回復用キーが有効になりました
recent-activity-account-recovery-key-verification-failure = アカウント回復用キーの検証に失敗しました
recent-activity-account-recovery-key-verification-success = アカウント回復用キーの検証が完了しました
recent-activity-account-recovery-key-removed = アカウント回復用キーを削除しました
recent-activity-account-password-added = 新しいパスワードを追加しました
recent-activity-account-password-changed = パスワードを変更しました
recent-activity-account-secondary-email-added = 予備のメールアドレスを追加しました
recent-activity-account-secondary-email-removed = 予備のメールアドレスを削除しました
recent-activity-account-emails-swapped = 優先メールアドレスと予備メールアドレスを交換しました
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = その他のアカウント利用情報

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = アカウント回復用キー
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = 設定に戻る

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

settings-recovery-phone-remove-cancel = キャンセル

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = 回復用電話番号の追加

## Add secondary email page

add-secondary-email-step-1 = ステップ 1/2
add-secondary-email-error-2 = このメールアドレスの設定中に問題が発生しました
add-secondary-email-page-title =
    .title = 予備アドレス
add-secondary-email-enter-address =
    .label = メールアドレスを入力してください
add-secondary-email-cancel-button = キャンセル
add-secondary-email-save-button = 保存
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = メールマスクは予備メールアドレスとして登録できません

## Verify secondary email page

add-secondary-email-step-2 = ステップ 2/2
verify-secondary-email-page-title =
    .title = 予備アドレス
verify-secondary-email-verification-code-2 =
    .label = 確認コードを入力してください
verify-secondary-email-cancel-button = キャンセル
verify-secondary-email-verify-button-2 = 確認
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = 5 分以内に <strong>{ $email }</strong> に送信された確認コードを入力してください。
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } の追加が完了しました

##

# Link to delete account on main Settings page
delete-account-link = アカウントを削除

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = 個人情報が漏えいした場所を発見してコントロールする
# Links out to the Monitor site
product-promo-monitor-cta = 無料でスキャン

## Profile section

profile-heading = プロファイル
profile-picture =
    .header = 写真
profile-display-name =
    .header = 表示名
profile-primary-email =
    .header = 優先メールアドレス

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = ステップ { $currentStep }/{ $numberOfSteps }。

## Security section of Setting

security-heading = セキュリティ
security-password =
    .header = パスワード
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = { $date } に作成
security-not-set = 未設定
security-action-create = 作成
security-set-password = パスワードを設定して同期し、特定のアカウントのセキュリティ機能を使用してください。
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = 最近のアカウント利用情報を見る
signout-sync-header = セッションの有効期限切れ
signout-sync-session-expired = 申し訳ございません。問題が発生しました。ブラウザーのメニューからログアウトして、もう一度お試しください。

## SubRow component

tfa-row-backup-codes-title = バックアップ認証コード
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 = コード: 残り { $numCodesAvailable } 個
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = 新しいコードを作成
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = 追加
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = 携帯端末や認証アプリを使用できない場合にアカウントを回復する最も安全な方法です。
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = 電話番号が追加されていません
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = 変更
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = 追加
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = 回復用電話番号を削除します
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = 認証アプリを使用できない場合でも簡単にアカウントを回復できる方法です。

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = オフにする
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = オンにする
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = 送信中...
switch-is-on = オン
switch-is-off = オフ

## Sub-section row Defaults

row-defaults-action-add = 追加
row-defaults-action-change = 変更
row-defaults-action-disable = 無効化
row-defaults-status = なし

## Account recovery key sub-section on main Settings page

rk-header-1 = アカウント回復用キー
rk-enabled = 有効
rk-not-set = 未設定
rk-action-create = 作成
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = 変更
rk-action-remove = 削除
rk-key-removed-2 = アカウント回復用キーが削除されました
rk-cannot-remove-key = アカウントの回復用キーを削除できませんでした。
rk-refresh-key-1 = アカウント回復用キーをリフレッシュ
rk-content-explain = パスワードを忘れたときに、あなたの情報を復元します。
rk-cannot-verify-session-4 = 申し訳ありませんが、セッションの確認中に問題が発生しました
rk-remove-modal-heading-1 = アカウント回復用キーを削除しますか？
rk-remove-modal-content-1 =
    パスワードをリセットした場合、
    アカウント回復用キーを使用してあなたのデータにアクセスできなくなります。この操作は元に戻せません。
rk-remove-error-2 = アカウントの回復用キーを削除できませんでした
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = アカウント回復用キーを削除

## Secondary email sub-section on main Settings page

se-heading = 予備アドレス
    .header = 予備アドレス
se-cannot-refresh-email = メールアドレスのリフレッシュ中に問題が発生しました。
se-cannot-resend-code-3 = 申し訳ありませんが、確認コードの再送信中に問題が発生しました
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } が優先アドレスになりました
se-set-primary-error-2 = 優先アドレスの変更時に問題が発生しました
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } の削除が完了しました
se-delete-email-error-2 = 申し訳ありませんが、メールアドレスの削除中に問題が発生しました
se-verify-session-3 = この処理を実行するために、現在のセッションを確認する必要があります
se-verify-session-error-3 = 申し訳ありませんが、セッションの確認中に問題が発生しました
# Button to remove the secondary email
se-remove-email =
    .title = メールアドレスを削除
# Button to refresh secondary email status
se-refresh-email =
    .title = メールアドレス設定をリフレッシュ
se-unverified-2 = 未確認
se-resend-code-2 = 確認が必要です。受信トレイまたは迷惑メールフォルダーに見つからない場合は、<button>確認コードを再送</button> してください。
# Button to make secondary email the primary
se-make-primary = 優先アドレスに設定
se-default-content = 優先アドレスでログインできない場合の予備アカウントです。
se-content-note-1 =
    注記: 予備アドレスは情報を復元しません — 復元するには、
    <a>アカウント回復用キー</a> が必要です。
# Default value for the secondary email
se-secondary-email-none = なし

## Two Step Auth sub-section on Settings main page

tfa-row-header = 2 段階認証
tfa-row-enabled = 有効
tfa-row-disabled-status = 無効
tfa-row-action-add = 追加
tfa-row-action-disable = 無効化
tfa-row-action-change = 変更
tfa-row-button-refresh =
    .title = 2 段階認証をリフレッシュ
tfa-row-cannot-refresh = 申し訳ありませんが、2 段階認証のリフレッシュ中に問題が発生しました。
tfa-row-enabled-description = 2 段階認証でアカウントが保護されています。{ -product-mozilla-account }にログインするときに、認証アプリのワンタイムパスコードを入力する必要があります。
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = アカウント保護に役立つ理由
tfa-row-disabled-description-v2 = ログインの 2 段階目にサードパーティの認証アプリを使用してアカウントを保護します。
tfa-row-cannot-verify-session-4 = 申し訳ありませんが、セッションの確認中に問題が発生しました
tfa-row-disable-modal-heading = 2 段階認証を無効化しますか？
tfa-row-disable-modal-confirm = 無効化
tfa-row-disable-modal-explain-1 =
    この操作は元に戻せません。
    <linkExternal>バックアップ認証コードを差し替える</linkExternal> オプションもあります。
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = 2 段階認証が無効化されました
tfa-row-cannot-disable-2 = 2 段階認証を無効化できませんでした

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = 続けることにより、次のことに同意したものとみなされます:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } サブスクリプションサービスの <mozSubscriptionTosLink>利用規約</mozSubscriptionTosLink> および <mozSubscriptionPrivacyLink>プライバシー通知</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts } <mozillaAccountsTos>サービス利用規約</mozillaAccountsTos> と <mozillaAccountsPrivacy>プライバシー通知</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = 続けることにより、<mozillaAccountsTos>サービス利用規約</mozillaAccountsTos> および <mozillaAccountsPrivacy>プライバシー通知</mozillaAccountsPrivacy> に同意したものとみなされます。

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = または
continue-with-google-button = { -brand-google } で続ける
continue-with-apple-button = { -brand-apple } で続ける

## Auth-server based errors that originate from backend service

auth-error-102 = 不明なアカウント
auth-error-103 = パスワードが正しくありません
auth-error-105-2 = 不正な確認コード
auth-error-110 = トークンが正しくありません
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = 何回も試したため中断されました。また後で試してください。
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = 何回も試したため中断されました。{ $retryAfter }に再度試してください。
auth-error-138-2 = 未確認のセッション
auth-error-139 = 予備のメールアドレスはアカウントのアドレスと別でなければなりません
auth-error-155 = TOTP トークンが見つかりません
auth-error-159 = 無効なアカウント回復用キー
auth-error-183-2 = 確認コードが不正または有効期限切れです
auth-error-999 = 予期しないエラー
auth-error-1001 = ログイン試行がキャンセルされました
auth-error-1002 = セッションの期限が切れました。続けるにはログインしてください。
auth-error-1003 = ローカルストレージまたは Cookie が無効になっています
auth-error-1008 = 新しいパスワードは別のものにしてください
auth-error-1010 = 正しいパスワードを入力してください (必須)
auth-error-1011 = 有効なメールアドレスが必要です
auth-error-1031 = 登録するには年齢を入力してください
auth-error-1032 = 登録するには有効な年齢を入力する必要があります
auth-error-1062 = リダイレクトが無効です
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = 末尾が { $lastFourPhoneNumber } の電話番号
oauth-error-1000 = エラーが発生しました。このタブを閉じて、もう一度試してください。

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = { -brand-firefox } にログインしました
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = メールアドレスを確認しました
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = ログインが確認されました
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = この { -brand-firefox } にログインして設定を完了してください
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = ログイン
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = まだ追加の端末がありますか？ 他の端末上で { -brand-firefox } にログインして設定を完了しましょう
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = 他の端末上の { -brand-firefox } にログインして設定を完了してください
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = 他の端末で開いているタブやブックマーク、パスワードを読み込みますか？
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = 他の端末を接続
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = 後で
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Android 版 { -brand-firefox } にログインして設定を完了してください
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = iOS 版 { -brand-firefox } にログインして設定を完了してください

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = ローカルストレージと Cookie が必要です
cookies-disabled-enable-prompt-2 = { -product-mozilla-account }へアクセスするには、お使いのブラウザーの Cookie とローカルストレージを有効にしてください。それによってセッションをまたいだログイン情報の記憶などの機能が使えるようになります。
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = 再試行
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = 詳細情報

## Index / home page

index-header = メールアドレスを入力
index-sync-header = { -product-mozilla-account }へ進む
index-sync-subheader = { -brand-firefox } を使用しているすべての場所で、パスワード、タブ、ブックマークを同期しましょう。
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = { $serviceName } へ進む
index-subheader-default = アカウント設定に進む
index-cta = ログインまたはアカウント登録
index-account-info = { -product-mozilla-account }を使用すると、さらにプライバシーを保護する他の { -brand-mozilla } 製品にもアクセスできます。
index-email-input =
    .label = メールアドレスを入力
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = アカウントの削除が完了しました

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = アカウント回復用キーを生成できませんでした。また後で試してください。
inline-recovery-key-setup-download-header = アカウントを保護してください

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = セットアップをキャンセル
inline-totp-setup-continue-button = 続ける
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = <authenticationAppsLink>これらの認証アプリ</authenticationAppsLink> のいずれかからの認証コードを必須とすることでアカウントのセキュリティレベルを高めます。
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = 2 段階認証を有効にして <span>アカウント設定へ進む</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = 2 段階認証を有効にして <span>{ $serviceName } へ進む</span>
inline-totp-setup-ready-button = 準備完了
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = 認証コードをスキャンして <span>{ $serviceName } へ進む</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = コードを手入力して <span>{ $serviceName } へ進む</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = 認証コードをスキャンして <span>アカウント設定へ進む</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = コードを手入力して <span>アカウント設定へ進む</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = この秘密鍵を認証アプリに入力してください。<toggleToQRButton>または QR コードをスキャンしてください。</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = 認証アプリで QR コードをスキャンし、提供された認証コードを入力してください。 <toggleToManualModeButton>コードをスキャンできませんか?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = 完了すると、入力する認証コードの生成が開始されます。
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = 認証コード
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = 認証コードが必要です
tfa-qr-code-alt = コード { $code } を使って対応アプリケーション内で 2 段階認証を設定してください。
inline-totp-setup-page-title = 2 段階認証

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = 法的通知
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = サービス利用規約
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = プライバシー通知

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = プライバシー通知

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = サービス利用規約

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = 今 { -product-firefox } にログインしましたか？
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = はい。端末を承認します。
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = 心当たりがない場合は、<link>パスワードを変更してください</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = 端末が接続されました
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = 現在同期中です: { $deviceOS } 上の { $deviceFamily }
pair-auth-complete-sync-benefits-text = お使いのすべての端末でブックマークやタブ、パスワードにアクセスできるようになりました。
pair-auth-complete-see-tabs-button = 同期された端末のタブを表示します
pair-auth-complete-manage-devices-link = 端末を管理

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = 認証コードを入力して <span>アカウント設定へ進む</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = 認証コードを入力して <span>{ $serviceName } へ進む</span>
auth-totp-instruction = お使いの認証アプリを開いて、そこに表示された認証コードを入力してください。
auth-totp-input-label = 6 桁のコードを入力
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = 確認
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = 認証コードが必要です

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = <span>他の端末から</span> の承認が必要です

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = ペアリングに失敗しました
pair-failure-message = セットアップ処理が中断されました。

## Pair index page

pair-sync-header = スマートフォンやタブレットで { -brand-firefox } を同期する
pair-cad-header = 別の端末の { -brand-firefox } を接続する
pair-already-have-firefox-paragraph = スマートフォンやタブレットでお使いの { -brand-firefox } がありますか？
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = 端末を同期する
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = またはダウンロード
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = スキャンしてモバイル版 { -brand-firefox } をダウンロードするか、<linkExternal>ダウンロード リンク</linkExternal> を自分宛に送信してください。
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = 後で
pair-take-your-data-message = { -brand-firefox } を使用しているすべての場所でパスワード、タブ、ブックマークを持ち運びましょう。
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = はじめる
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR コード

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = 端末が接続されました
pair-success-message-2 = ペアリングに成功しました。

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = <span>{ $email }</span> のペアリングを確認
pair-supp-allow-confirm-button = ペアリングを確認
pair-supp-allow-cancel-link = キャンセル

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = <span>他の端末から</span> の承認が必要です

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = アプリを使用してペアリング
pair-unsupported-message = システムカメラを使用しましたか？ { -brand-firefox } アプリ内からペアリングする必要があります。

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = 認証されたアプリケーションにリダイレクトしています。しばらくお待ちください。

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = アカウント回復用キーを入力してください
account-recovery-confirm-key-instruction = このキーで、パスワードやブックマークなどの暗号化されたブラウジングデータを { -brand-firefox } のサーバーから回復します。
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = 32 文字のアカウント回復用キーを入力
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = 保管場所のヒント:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = 続ける
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = アカウント回復用キーが見つかりませんか？

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = 新しいパスワードを設定
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = パスワードを設定しました
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = 申し訳ありませんが、パスワードの設定中に問題が発生しました

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-confirm-button = 確認

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = メールを確認してください
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = 確認コードを <span>{ $email }</span> に送信しました。
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = 10 分以内に 8 桁のコードを入力してください
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = 続ける
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = 確認コードを再送する
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = 別のアカウントを使用する

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = パスワードをリセット
confirm-totp-reset-password-subheader-v2 = 2 段階認証コードを入力してください
confirm-totp-reset-password-instruction-v2 = パスワードをリセットするには、<strong>認証アプリ</strong>を確認してください。
confirm-totp-reset-password-trouble-code = コードの入力時に問題が発生しましたか？
confirm-totp-reset-password-confirm-button = 確認
confirm-totp-reset-password-input-label-v2 = 6 桁のコードを入力
confirm-totp-reset-password-use-different-account = 別のアカウントを使用する

## ResetPassword start page

password-reset-flow-heading = パスワードをリセット
password-reset-body-2 = アカウントを安全に保つために、あなただけが知っていることをいくつか質問します。
password-reset-email-input =
    .label = メールアドレスを入力
password-reset-submit-button-2 = 続ける

## ResetPasswordConfirmed

reset-password-complete-header = パスワードがリセットされました
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = { $serviceName } へ進む

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = パスワードのリセット
password-reset-recovery-method-subheader = 回復方法を選択してください
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = 登録している回復方法であなたかどうかを確認します。
password-reset-recovery-method-phone = 回復用電話番号
password-reset-recovery-method-code = バックアップ認証コード

## ResetPasswordRecoveryPhone page

# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = 下 4 桁が <span>{ $lastFourPhoneDigits }</span> の電話番号にテキストメッセージで 6 桁のコードを送信しました。このコードは 5 分間で有効期限切れになります。コードは誰とも共有しないでください。
reset-password-recovery-phone-input-label = 6 桁のコードを入力
reset-password-recovery-phone-code-submit-button = 確認
reset-password-with-recovery-key-verified-page-title = パスワードのリセットが完了しました
reset-password-complete-new-password-saved = 新しいパスワードを保存しました！
reset-password-complete-recovery-key-created = 新しいアカウント回復キーを作成しました。今すぐダウンロードして保管してください。
reset-password-complete-recovery-key-download-info =
    このキーは
    パスワードを忘れた場合にデータの回復に必要です。<b>今すぐダウンロードして
    安全な場所に保管してください。後で再度このページにアクセスすることはできません。</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = エラー:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = ログインを検証しています…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = 確認エラー
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = 確認リンクの有効期限が切れています
signin-link-expired-message-2 = クリックしたリンクは有効期限が切れているか、すでに使用されています。

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = <span>{ -product-mozilla-account }</span> のパスワードを入力してください
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = { $serviceName } へ進む
signin-subheader-without-logo-default = アカウント設定に進む
signin-button = ログイン
signin-header = ログイン
signin-use-a-different-account-link = 別のアカウントを使用する
signin-forgot-password-link = パスワードをお忘れですか？
signin-password-button-label = パスワード

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = 認証リンク URL の長さが足りません。受信したメールクライアントにより、リンクが途中で切れている可能性があります。正しい URL を確認の上コピーし、再度お試しください。
report-signin-header = 未承認のログインを報告しますか？
report-signin-body = あなたのアカウントへのアクセス試行についてのメールをお送りしました。疑わしい挙動として報告しますか？
report-signin-submit-button = 疑わしい挙動を報告
report-signin-support-link = このような問題が起きた理由
report-signin-error = レポートの送信中に問題が発生しました。
signin-bounced-header = 申し訳ありません。あなたのアカウントはロックされています。
# $email (string) - The user's email.
signin-bounced-message = { $email } へ送られた確認メールが返送されてきたので、あなたの { -brand-firefox } データを守るためアカウントをロックしました。
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = このメールアドレスが正しい場合は、<linkExternal>ご連絡<</linkExternal> いただければロック解除をお手伝いします。
signin-bounced-create-new-account = 既にこのアドレスをお持ちでないなら、新しいアカウントを作成してください
back = 戻る

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = ログイン
signin-recovery-method-subheader = 回復方法を選択してください
signin-recovery-method-details = 登録している回復方法であなたかどうかを確認します。
signin-recovery-method-phone = 回復用電話番号
signin-recovery-method-code-v2 = バックアップ認証コード
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 = コード: 残り { $numBackupCodes } 個

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = ログイン
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = 確認
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = 締め出されていますか？
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = バックアップ認証コードが必要です

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = ログイン
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = 下 4 桁が <span>{ $lastFourPhoneDigits }</span> の電話番号にテキストメッセージで 6 桁のコードを送信しました。このコードは 5 分間で有効期限切れになります。コードは誰とも共有しないでください。
signin-recovery-phone-input-label = 6 桁のコードを入力
signin-recovery-phone-code-submit-button = 確認
signin-recovery-phone-resend-code-button = 確認コードを再送する
signin-recovery-phone-resend-success = コードを送信しました

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = あなたの警戒心に感謝します
signin-reported-message = 担当者に通知が送られました。こうした報告が侵入者を防ぐための助けとなります。

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = <span>{ -product-mozilla-account }</span> の確認コードを入力してください
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = 5 分以内に <email>{ $email }</email> 宛に送信されたコードを入力してください。
signin-token-code-input-label-v2 = 6 桁のコードを入力してください
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = 確認
signin-token-code-code-expired = コードの有効期限が切れていますか？
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = 新しいコードをメールに送信する。
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = 確認コードが必要です
signin-token-code-resend-error = エラーが発生しました。新しいコードを送信できませんでした。

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = ログイン
signin-totp-code-subheader-v2 = 2 段階認証コードを入力してください
signin-totp-code-instruction-v4 = ログイン確認のために、<strong>認証アプリ</strong>を確認してください。
signin-totp-code-input-label-v4 = 6 桁のコードを入力
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = 確認
signin-totp-code-other-account-link = 別のアカウントを使用する
signin-totp-code-recovery-code-link = コードの入力時に問題が発生しましたか？
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = 認証コードが必要です

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = このログインを承認
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = 認証コードを { $email } 宛にお送りしましたので、メールを確認してください。
signin-unblock-code-input = 認証コードを入力
signin-unblock-submit-button = 続ける
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = 認証コードが必要です
signin-unblock-code-incorrect-length = 認証コードは 8 文字でなければなりません
signin-unblock-code-incorrect-format-2 = 認証コードに含められるのは英数字のみです
signin-unblock-resend-code-button = 受信トレイや迷惑メールフォルダーに見当たりませんか？ 再送信
signin-unblock-support-link = このような問題が起きた理由

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = 確認コードの入力
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = <span>{ -product-mozilla-account }</span> の確認コードを入力してください
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = 5 分以内に <email>{ $email }</email> 宛に送信されたコードを入力してください。
confirm-signup-code-input-label = 6 桁のコードを入力してください
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = 確認
confirm-signup-code-code-expired = コードの有効期限が切れていますか？
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = 新しいコードをメール送信する。
confirm-signup-code-success-alert = アカウントの確認が完了しました
# Error displayed in tooltip.
confirm-signup-code-is-required-error = 確認コードが必要です

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = メールアドレスを変更
