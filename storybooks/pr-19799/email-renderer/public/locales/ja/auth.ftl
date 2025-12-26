## Non-email strings

session-verify-send-push-title-2 = { -product-mozilla-account }にログインしますか？
session-verify-send-push-body-2 = ここをクリックしてご自身であることを確認してください
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { -brand-mozilla } の確認コードは { $code } です。5 分間有効です。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } の確認コード: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { -brand-mozilla } の回復用コードは { $code } です。5 分間有効です。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } コード: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { -brand-mozilla } の回復用コードは { $code } です。5 分間有効です。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } コード: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } ロゴ">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="端末の同期">
body-devices-image = <img data-l10n-name="devices-image" alt="端末">
fxa-privacy-url = { -brand-mozilla } プライバシーポリシー
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } プライバシー通知
moz-accounts-terms-url = { -product-mozilla-accounts }利用規約
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } ロゴ">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } ロゴ">
subplat-automated-email = これは自動で配信されたメールです。心当たりがない場合は、何も行わないでください。
subplat-privacy-notice = プライバシー通知
subplat-privacy-plaintext = プライバシー通知:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = このメールは { $email } の { -product-mozilla-account }で { $productName } に登録されたため送信されました。
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = このメールは { $email } の { -product-mozilla-account }宛に送信されています。
subplat-explainer-multiple-2 = このメールは { $email } の { -product-mozilla-account }で複数の製品を購読されているため送信されました。
subplat-explainer-was-deleted-2 = このメールは { $email } が { -product-mozilla-account }に登録されたため送信されました。
subplat-manage-account-2 = { -product-mozilla-account }の設定はあなたの <a data-l10n-name="subplat-account-page">アカウントのページ</a> で管理できます。
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = アカウントページ { $accountSettingsUrl } にアクセスして、{ -product-mozilla-account }の設定を管理してください。
subplat-terms-policy = 利用規約とキャンセルポリシー
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = 購読を解除
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = 購読を再開
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = 支払い情報を更新
subplat-privacy-policy = { -brand-mozilla } プライバシーポリシー
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } プライバシー通知
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } サービス利用規約
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = 法的通知
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = プライバシー
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = アカウントが削除された場合でも、<a data-l10n-name="unsubscribeLink">配信停止を依頼</a> しない限り、Mozilla Corporation および Mozilla Foundation からのメールは引き続き配信されます。
account-deletion-info-block-support = ご不明な点やご質問がありましたら、お気軽に <a data-l10n-name="supportLink">サポートチーム</a> までお問い合わせください。
account-deletion-info-block-communications-plaintext = アカウントが削除された場合でも、配信停止を依頼しない限り、Mozilla Corporation および Mozilla Foundation からのメールは引き続き配信されます。
account-deletion-info-block-support-plaintext = ご不明な点やご質問がありましたら、お気軽にサポートチームまでお問い合わせください:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ -google-play } で { $productName } をダウンロード">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ -app-store } で { $productName } をダウンロード">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = { $productName } を <a data-l10n-name="anotherDeviceLink">別のデスクトップ端末</a> にインストールしてください。
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = { $productName } を <a data-l10n-name="anotherDeviceLink">別の端末</a> にインストールしてください。
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Google Play で { $productName } を入手する:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = App Store で { $productName } を入手する:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = { $productName } を別の端末にインストールする:
automated-email-change-2 = この操作に覚えがない場合、すぐに <a data-l10n-name="passwordChangeLink">パスワードを変更</a> してください。
automated-email-support = 詳細については、<a data-l10n-name="supportLink">{ -brand-mozilla } サポート</a> をご覧ください。
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = この操作に覚えがない場合、すぐにパスワード変更をしてください:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = 詳細については、{ -brand-mozilla } サポートをご覧ください:
automated-email-inactive-account = これは自動送信されたメールです。前回の { -product-mozilla-account } へのログインから2 年が経ったため送信されています。
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } 詳細については、<a data-l10n-name="supportLink">{ -brand-mozilla } サポート</a> をご覧ください。
automated-email-no-action-plaintext = これは自動的に配信されたメールです。心当たりがない場合は、何も行わないでください。
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = これは自動送信されたメールです。この操作に覚えがない場合は、パスワードを変更してください:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = このリクエストは { $uaOS } { $uaOSVersion } 上の { $uaBrowser } から送信されました。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = このリクエストは { $uaOS } 上の { $uaBrowser } から送信されました。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = このリクエストは { $uaBrowser } から送信されました。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = このリクエストは { $uaOS } { $uaOSVersion } から送信されました。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = このリクエストは { $uaOS } から送信されました。
automatedEmailRecoveryKey-delete-key-change-pwd = 心当たりがない場合は、<a data-l10n-name="revokeAccountRecoveryLink">新しいキーを削除</a> し、<a data-l10n-name="passwordChangeLink">パスワードを変更</a> してください。
automatedEmailRecoveryKey-change-pwd-only = 心当たりがない場合は、<a data-l10n-name="passwordChangeLink">パスワードを変更</a> してください。
automatedEmailRecoveryKey-more-info = 詳細については、<a data-l10n-name="supportLink">{ -brand-mozilla } サポート</a> をご覧ください。
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = このリクエストは以下から送信されました:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = 心当たりがない場合は、新しいキーを削除してください:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = 心当たりがない場合は、パスワードを変更してください:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = パスワードも変更してください:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = 詳細については、{ -brand-mozilla } サポートをご覧ください:
automated-email-reset =
    これは自動送信されたメールです。この操作に覚えがない場合は、<a data-l10n-name="resetLink">パスワードをリセットしてください</a>。
    詳しい情報は <a data-l10n-name="supportLink">{ -brand-mozilla } サポート</a> をご覧ください。
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = あなたがこの操作を許可していない場合は、今すぐ { $resetLink } でパスワードをリセットしてください。
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    この操作に覚えがない場合、すぐに<a data-l10n-name="resetLink">パスワードリセット</a>と <a data-l10n-name="twoFactorSettingsLink">2 段階認証のリセット</a>をしてください。
    詳細については、<a data-l10n-name="supportLink">{ -brand-mozilla } サポート</a> をご覧ください。
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = この操作に覚えがない場合、すぐにパスワードをリセットしてください:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = 同時に、2 段階認証もリセットしてください:
brand-banner-message = アカウントの名称が { -product-firefox-accounts } から { -product-mozilla-accounts } に変更されたことをご存知ですか？ <a data-l10n-name="learnMore">詳細</a>
cancellationSurvey = この <a data-l10n-name="cancellationSurveyUrl">簡単なアンケート</a> に回答して、サービスの改善にご協力ください。
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = この簡単なアンケートに回答して、サービスの改善にご協力ください。
change-password-plaintext = もし誰かがあなたのアカウントへアクセスしようとしていると思われる場合は、パスワードを変更してください。
manage-account = アカウント管理
manage-account-plaintext = { manage-account }:
payment-details = 支払いの詳細:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = 請求書番号: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = 支払日: { $invoiceDateOnly } に合計 { $invoiceTotal }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = 次回の請求: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>支払い方法:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = 支払い方法: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = 支払い方法: 末尾が { $lastFour } の { $cardName }
payment-provider-card-ending-in-plaintext = 支払い方法: 末尾が { $lastFour } のカード
payment-provider-card-ending-in = <b>支払い方法:</b> 末尾が { $lastFour } のカード
payment-provider-card-ending-in-card-name = <b>支払い方法:</b> 末尾が { $lastFour } の { $cardName }

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>請求書番号:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = 請求書番号: { $invoiceNumber }
subscription-charges-invoice-date = <b>日付:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = 日付: { $invoiceDateOnly }
subscription-charges-prorated-price = 日割り価格
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = 日割り価格: { $remainingAmountTotal }
subscription-charges-list-price = 定価
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = 定価: { $offeringPrice }
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = 小計: { $invoiceSubtotal }

##

subscriptionSupport = サブスクリプションについて質問がありますか？ <a data-l10n-name="subscriptionSupportUrl">サポートチーム</a>がお手伝いします。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = サブスクリプションについて質問がありますか？ サポートチームがお手伝いします:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = { $productName } にご登録いただきありがとうございます。{ $productName } のサブスクリプションや他の情報についての質問は、<a data-l10n-name="subscriptionSupportUrl">こちらからお問い合わせください</a>。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = { $productName } にご登録いただきありがとうございます。{ $productName } のサブスクリプションや他の情報についての質問は、こちらからお問い合わせください:
subscription-support-get-help = サブスクリプションのヘルプを見る
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">サブスクリプションを管理</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = サブスクリプションを管理:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">サポートへの問い合わせ</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = サポートへの問い合わせ:
subscriptionUpdateBillingEnsure = 現在のお支払い方法とアカウント情報は <a data-l10n-name="updateBillingUrl">こちら</a> で確認できます。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = 現在のお支払い方法とアカウント情報はこちらで確認できます:
subscriptionUpdateBillingTry = 今後、数日以内にお支払いを再試行しますが、<a data-l10n-name="updateBillingUrl">お支払い情報の更新</a>など、修正にご協力いただく必要があります。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = 今後、数日以内にお支払いを再試行しますが、お支払い情報の更新など、修正にご協力いただく必要があります:
subscriptionUpdatePayment = サービスの中断を防ぐため、できるだけ早く <a data-l10n-name="updateBillingUrl">お支払い情報を更新</a> してください。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = サービスの中断を防ぐため、できるだけ早くお支払い情報を更新してください:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = 詳細については、<a data-l10n-name="supportLink">{ -brand-mozilla } サポート</a> をご覧ください。
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = 詳細については、{ -brand-mozilla } サポートをご覧ください: { $supportUrl }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaOS } { $uaOSVersion } 上の { $uaBrowser }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaOS } 上の { $uaBrowser }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }、{ $stateCode }、{ $country } (おおよその位置)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $country }、{ $city } (おおよその位置)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }、{ $country } (おおよその位置)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (おおよその位置)
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = 請求書の表示：{ $invoiceLink }
cadReminderFirst-subject-1 = { -brand-firefox } の同期をお忘れなく
cadReminderFirst-action = 別の端末を同期する
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = 同期には 2 台が必要
cadReminderFirst-description-v2 = タブをご使用のすべて端末に持ち出せます。{ -brand-firefox } を使えば、どこでもブックマークやパスワード、その他のデータにアクセスできます。
cadReminderSecond-subject-2 = 忘れずに同期の設定を完了しましょう
cadReminderSecond-action = 別の端末を同期する
cadReminderSecond-title-2 = データの同期を忘れずに！
cadReminderSecond-description-sync = { -brand-firefox } をどこでも使えるように、ブックマーク、パスワード、開いたタブなどを同期しましょう。
cadReminderSecond-description-plus = さらに、データは常に暗号化されています。データを閲覧できるのはあなたが承認した端末だけです。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = { $productName } へようこそ。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = { $productName } へようこそ。
downloadSubscription-content-2 = サブスクリプションに含まれるすべての機能を使いましょう:
downloadSubscription-link-action-2 = はじめましょう
fraudulentAccountDeletion-subject-2 = あなたの { -product-mozilla-account }が削除されました
fraudulentAccountDeletion-title = あなたのアカウントは削除されました
fraudulentAccountDeletion-content-part1-v2 = このメールアドレスを使って { -product-mozilla-account }が作成され、サブスクリプションが請求されました。すべての新しいアカウントと同様にアカウントを確認するため、最初にこのメールアドレスを確認するようお願いします。
fraudulentAccountDeletion-content-part2-v2 = 現時点で、このアカウントはまだ確認されていません。確認手順が完了していないため、正規のサブスクリプションかどうか判断できません。そのため、このメールアドレスに登録した { -product-mozilla-account }が削除されました。また、サブスクリプションがキャンセルされ、お支払いをすべて払い戻しました。
fraudulentAccountDeletion-contact = ご不明な点がある場合、<a data-l10n-name="mozillaSupportUrl">サポートチーム</a> までお問い合わせください。
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = ご不明な点がある場合、サポートチームまでお問い合わせください: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = { -product-mozilla-account } を維持する最後のチャンスです
inactiveAccountFinalWarning-title = あなたの { -brand-mozilla } アカウントとデータが削除されます
inactiveAccountFinalWarning-preview = ログインしてアカウントを維持
inactiveAccountFinalWarning-account-description = { -product-mozilla-account }は、{ -brand-firefox } の同期、{ -product-mozilla-monitor }、{ -product-firefox-relay }、{ -product-mdn } など無料のプライバシーおよびブラウジング製品にアクセスするために使用されます。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = アカウントにログインしない限り、アカウントと個人データが <strong>{ $deletionDate }</strong> に完全に削除されます。
inactiveAccountFinalWarning-action = ログインしてアカウントを維持
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = ログインしてアカウントを維持:
inactiveAccountFirstWarning-subject = アカウントを維持するためにログインを！
inactiveAccountFirstWarning-title = データを削除せずに { -brand-mozilla } アカウントを使い続けますか？
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account } は、{ -brand-firefox } の同期、{ -product-mozilla-monitor } 、{ -product-firefox-relay } 、{ -product-mdn } などのプライバシーおよびブラウジングの製品を無料でアクセスするために使用されます。
inactiveAccountFirstWarning-inactive-status = 2年間ログインされていないようです。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = アカウント利用がないため、アカウントと個人データは <strong>{ $deletionDate }</strong> に完全に削除されます。
inactiveAccountFirstWarning-action = ログインしてアカウントを維持
inactiveAccountFirstWarning-preview = ログインしてアカウントを維持
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = ログインしてアカウントを維持:
inactiveAccountSecondWarning-subject = 行動が必要！ 7 日後にアカウントが削除されます
inactiveAccountSecondWarning-title = あなたの { -brand-mozilla } アカウントとデータが 7 日後に削除されます
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account }は、{ -brand-firefox } の同期、{ -product-mozilla-monitor }、{ -product-firefox-relay }、{ -product-mdn } など無料のプライバシーおよびブラウジング製品にアクセスするために使用されます。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = アカウント利用がないため、アカウントと個人データは <strong>{ $deletionDate }</strong> に完全に削除されます。
inactiveAccountSecondWarning-action = ログインしてアカウントを維持
inactiveAccountSecondWarning-preview = ログインしてアカウントを維持
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = ログインしてアカウントを維持:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = バックアップ認証コードが足りません！
codes-reminder-title-one = バックアップ認証コードが残り 1 つになりました
codes-reminder-title-two = バックアップ認証コードをもっと生成しましょう
codes-reminder-description-part-one = バックアップ認証コードは、パスワードを忘れたときに情報を復元するのに使います。
codes-reminder-description-part-two = 後でデータを失わないように、今すぐに新しいコードを生成しましょう。
codes-reminder-description-two-left = コードは残り 2 つです。
codes-reminder-description-create-codes = アカウントへのアクセスがロックアウトされた場合に再度アクセスできるようにするため、新しいバックアップ認証コードを生成しましょう。
lowRecoveryCodes-action-2 = コードを生成する
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] 残りのバックアップ認証コードがありません！
       *[other] 残りのバックアップ認証コードは { $numberRemaining } 個です！
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = { $clientName } への新規ログイン
newDeviceLogin-subjectForMozillaAccount = { -product-mozilla-account } への新規ログイン
newDeviceLogin-title-3 = あなたの { -product-mozilla-account }がログインに使用されました
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = 覚えがない場合は <a data-l10n-name="passwordChangeLink">パスワードを変更</a> してください。
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = 覚えがない場合はパスワードを変更してください:
newDeviceLogin-action = アカウント管理
passwordChanged-subject = パスワードを更新しました
passwordChanged-title = パスワード変更完了
passwordChanged-description-2 = あなたの { -product-mozilla-account }のパスワードが次の端末から変更されました:
passwordChangeRequired-subject = 疑わしいアクティビティが検出されました
passwordChangeRequired-preview = すぐにパスワードを変更してください
passwordChangeRequired-title-2 = パスワードをリセットしてください
passwordChangeRequired-suspicious-activity-3 = 疑わしいアクティビティから保護するためにアカウントをロックしました。すべての端末からログアウトし、同期されていたデータを予防的に削除しました。
passwordChangeRequired-sign-in-3 = パスワードをリセットすると、もう一度アカウントを使用できるようになります。
passwordChangeRequired-different-password-2 = <b>重要:</b> 過去に使用したことがなく、強固なパスワードを選択してください。
passwordChangeRequired-different-password-plaintext-2 = 重要: 過去に使用したことがなく、強固なパスワードを選択してください。
passwordChangeRequired-action = パスワードをリセット
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
password-forgot-otp-title = パスワードをお忘れですか？
password-forgot-otp-request = 次の端末で { -product-mozilla-account }のパスワード変更がリクエストされました:
password-forgot-otp-code-2 = その場合、次の確認コードを使用してください:
password-forgot-otp-expiry-notice = このコードの有効期限は 10 分です。
passwordReset-subject-2 = あなたのパスワードはリセットされました
passwordReset-title-2 = パスワードがリセットされました
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = 次の端末で、あなたの { -product-mozilla-account }のパスワードがリセットされました:
passwordResetAccountRecovery-subject-2 = あなたのパスワードはリセットされました
passwordResetAccountRecovery-title-3 = あなたのパスワードはリセットされました
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = 次の端末で、アカウント回復用キーを使用してあなたの { -product-mozilla-account }のパスワードがリセットされました:
passwordResetAccountRecovery-information = 同期されていたすべての端末からログアウトしました。使用したアカウント回復用キーを置き換える新しいキーを作成しました。アカウント設定から変更できます。
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = 同期されていたすべての端末からログアウトしました。使用したアカウント回復用キーを置き換える新しいキーを作成しました。アカウント設定から変更できます:
passwordResetAccountRecovery-action-4 = アカウント管理
passwordResetRecoveryPhone-subject = 回復用電話番号を使用しました
passwordResetRecoveryPhone-preview = あなたの操作であることを確認してください
passwordResetWithRecoveryKeyPrompt-subject = あなたのパスワードはリセットされました
passwordResetWithRecoveryKeyPrompt-title = あなたのパスワードはリセットされました
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = 次の端末で、{ -product-mozilla-account }のパスワードをリセットしました:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = アカウント回復用キーを作成
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = アカウント回復用キーを作成:
passwordResetWithRecoveryKeyPrompt-cta-description = 同期していたすべての端末でもう一度ログインする必要があります。次回はアカウント回復用キーと共にデータを安全に保管してください。パスワードを忘れてもデータを回復できます。
postAddAccountRecovery-subject-3 = 新しいアカウント回復用キーが生成されました
postAddAccountRecovery-title2 = 新しいアカウント回復用キーを生成しました
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = このキーを安全な場所に保管してください。パスワードを忘れた場合、暗号化されたブラウジングデータを復元するために、このキーが必要です。
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = このキーは 1 度だけ使用できます。使用すると、新しいものが自動的に作成されます。または、アカウント設定からいつでも新しいキーを作成できます。
postAddAccountRecovery-action = アカウント管理
postAddLinkedAccount-subject-2 = { -product-mozilla-account }に新しいアカウントがリンクされました
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName } のアカウントが { -product-mozilla-account }にリンクされています
postAddLinkedAccount-action = アカウント管理
postAddRecoveryPhone-subject = 回復用電話番号を追加しました
postAddRecoveryPhone-title-v2 = 回復用電話番号を追加しました
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = 回復用電話番号として { $maskedLastFourPhoneNumber } を追加しました
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = アカウント保護に役立つ理由
postAddRecoveryPhone-how-protect-plaintext = アカウント保護に役立つ理由:
postAddRecoveryPhone-enabled-device = 次の端末から有効にしました:
postAddRecoveryPhone-action = アカウントの管理
postAddTwoStepAuthentication-subject-v3 = 2 段階認証がオンです
postAddTwoStepAuthentication-title-2 = 2 段階認証をオンにしました
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = 次の端末からリクエストしました:
postAddTwoStepAuthentication-action = アカウント管理
postAddTwoStepAuthentication-code-required-v4 = 今後はログインのたびに認証アプリに表示されるセキュリティコードが必要となります。
postAddTwoStepAuthentication-recovery-method-codes = 回復方法としてバックアップ認証コードも追加しました。
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = 回復用電話番号として { $maskedPhoneNumber } も追加しました
postAddTwoStepAuthentication-how-protects-link = アカウント保護に役立つ理由
postAddTwoStepAuthentication-how-protects-plaintext = アカウント保護に役立つ理由:
postChangeAccountRecovery-subject = アカウント回復用キーが変更されました
postChangeAccountRecovery-title = アカウント回復用キーを変更しました
postChangeAccountRecovery-body-part1 = 新しいアカウント回復キーを作成しました。以前のキーは削除されました。
postChangeAccountRecovery-body-part2 = このキーを安全な場所に保管してください。パスワードを忘れた場合、暗号化されたブラウジングデータを復元するために、このキーが必要です。
postChangeAccountRecovery-action = アカウントを管理
postChangePrimary-subject = 優先メールアドレスが更新されました
postChangePrimary-title = 新しい優先メールアドレス
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = 優先メールアドレスが { $email } に変更されました。このアドレスは今後、{ -product-mozilla-account }へログインする際、そしてセキュリティ通知やログイン確認を受け取る際のユーザー名となります。
postChangePrimary-action = アカウント管理
postChangeRecoveryPhone-subject = 回復用電話番号を更新しました
postChangeRecoveryPhone-title = 回復用電話番号が変更されました
postChangeRecoveryPhone-description = 新しい回復用電話番号を登録しました。以前の電話番号は削除されました。
postChangeRecoveryPhone-requested-device = 次の端末からリクエストしました:
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = 次の端末からリクエストしました:
postChangeTwoStepAuthentication-action = アカウント管理
postConsumeRecoveryCode-action = アカウント管理
postConsumeRecoveryCode-preview = あなたの操作であることを確認してください
postNewRecoveryCodes-subject-2 = 新しいバックアップ認証コードが生成されました
postNewRecoveryCodes-title-2 = 新しいバックアップ認証コードを生成しました
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = 次の端末で生成されました:
postNewRecoveryCodes-action = アカウント管理
postRemoveAccountRecovery-subject-2 = アカウント回復用キーが削除されました
postRemoveAccountRecovery-title-3 = アカウント回復用キーを削除しました
postRemoveAccountRecovery-body-part1 = パスワードを忘れた場合、暗号化されたブラウジングデータを復元するには、アカウント回復用キーが必要になります。
postRemoveAccountRecovery-body-part2 = まだ作成していない場合は、アカウント設定で新しいアカウント回復キーを作成し、保存されたパスワード、ブックマーク、閲覧履歴などが失われないようにしましょう。
postRemoveAccountRecovery-action = アカウント管理
postRemoveRecoveryPhone-requested-device = 次の端末からリクエストしました:
postRemoveSecondary-subject = 予備アドレスが削除されました
postRemoveSecondary-title = 予備アドレスが削除されました
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = { $secondaryEmail } があなたの { -product-mozilla-account }の予備アドレスから削除されました。セキュリティ通知やログイン確認は今後このアドレスに送られなくなります。
postRemoveSecondary-action = アカウント管理
postRemoveTwoStepAuthentication-subject-line-2 = 2 段階認証がオフになりました
postRemoveTwoStepAuthentication-title-2 = 2 段階認証をオフにしました
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = 次の端末から無効にしました:
postRemoveTwoStepAuthentication-action = アカウント管理
postRemoveTwoStepAuthentication-not-required-2 = 今後はログイン時に認証アプリからのセキュリティコードを必要としません。
postSigninRecoveryPhone-action = アカウント管理
postVerify-sub-title-3 = 会えて光栄です！
postVerify-title-2 = 2 台の端末で同じタブを表示したいですか？
postVerify-description-2 = 簡単です！別の端末に { -brand-firefox } をインストールして同期するだけです。まるで魔法のようです！
postVerify-sub-description = （ログインしたどの端末からでも、ブックマークやパスワード、{ -brand-firefox } の他のデータにアクセスできます。）
postVerify-subject-4 = { -brand-mozilla } へようこそ！
postVerify-setup-2 = 別の端末を接続:
postVerify-action-2 = 別の端末を接続
postVerifySecondary-subject = 予備のメールアドレスが追加されました
postVerifySecondary-title = 予備のメールアドレスが追加されました
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = { $secondaryEmail } があなたの { -product-mozilla-account }の予備アドレスとして確認されました。セキュリティ通知やログイン確認は今後両方のメールアドレスに送られます。
postVerifySecondary-action = アカウント管理
recovery-subject = パスワードをリセットしました
recovery-title-2 = パスワードを忘れた場合
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = 次の端末で { -product-mozilla-account }のパスワード変更がリクエストされました:
recovery-new-password-button = 以下のボタンをクリックして新しいパスワードを生成してください。このリンクは 1 時間以内に有効期限切れになります。
recovery-copy-paste = 以下の URL をコピーしてブラウザーに貼り付け、新しいパスワードを生成してください。このリンクは 1 時間以内に有効期限切れになります。
recovery-action = 新しいパスワードを設定
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = { $productName } のサブスクリプションがキャンセルされました
subscriptionAccountDeletion-title = ご利用ありがとうございました
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = 最近、{ -product-mozilla-account }が削除されたことにより、{ $productName } のサブスクリプションがキャンセルされました。最後の { $invoiceTotal } の請求は { $invoiceDateOnly } に支払われました。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = { $productName } へようこそ: パスワードを設定してください。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = { $productName } へようこそ
subscriptionAccountFinishSetup-content-processing = お支払いは処理中です。完了するまで最大 4 営業日かかる場合があります。キャンセルを選択しない限り、サブスクリプションは請求期間ごとに自動的に更新されます。
subscriptionAccountFinishSetup-content-create-3 = 次に、{ -product-mozilla-account }のパスワードを作成して新しいサブスクリプションの使用を開始します。
subscriptionAccountFinishSetup-action-2 = はじめましょう
subscriptionAccountReminderFirst-subject = 通知: アカウントのセットアップを完了してください
subscriptionAccountReminderFirst-title = サブスクリプションにはまだアクセスできません
subscriptionAccountReminderFirst-content-info-3 = 数日前に { -product-mozilla-account }を作成されましたが、まだ確認されていません。確認してアカウントのセットアップを完了していただければ、新しいサブスクリプションが使用できるようになります。
subscriptionAccountReminderFirst-content-select-2 = 「パスワードを作成」を選択して新しいパスワードを設定し、アカウントの確認を完了してください。
subscriptionAccountReminderFirst-action = パスワードを作成
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = 最終通知: アカウントをセットアップしてください
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla } へようこそ！
subscriptionAccountReminderSecond-content-info-3 = 数日前に { -product-mozilla-account }を作成されましたが、まだ確認されていません。確認してアカウントのセットアップを完了していただければ、新しいサブスクリプションが使用できるようになります。
subscriptionAccountReminderSecond-content-select-2 = 「パスワードを作成」を選択して新しいパスワードを設定し、アカウントの確認を完了してください。
subscriptionAccountReminderSecond-action = パスワードを作成
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = { $productName } のサブスクリプションがキャンセルされました
subscriptionCancellation-title = ご利用ありがとうございました

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = { $productName } のサブスクリプションをキャンセルしました。最後の { $invoiceTotal } の請求は { $invoiceDateOnly } に支払われました。
subscriptionCancellation-outstanding-content-2 = { $productName } のサブスクリプションをキャンセルしました。最後の { $invoiceTotal } の請求は { $invoiceDateOnly } に支払われます。
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = サービスは現在の請求期間の終了日 { $serviceLastActiveDateOnly } まで継続されます。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = { $productName } に切り替えました
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = { $productNameOld } から { $productName } への切り替えが完了しました。
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = 次回の請求より、{ $paymentAmountOld } / { $productPaymentCycleOld } から { $paymentAmountNew } / { $productPaymentCycleNew } に変更されます。その際、この{ $productPaymentCycleOld }の残りの期間は低料金を反映させるため 1 度だけ { $paymentProrated } のクレジットが付与されます。
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = { $productName } の使用に必要な新しいソフトウェアをインストールする場合は、ダウンロード手順が記載された別のメールが届きます。
subscriptionDowngrade-content-auto-renew = キャンセルを選択しない限り、サブスクリプションは請求期間ごとに自動的に更新されます。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = { $productName } のサブスクリプションがキャンセルされました
subscriptionFailedPaymentsCancellation-title = サブスクリプションがキャンセルされました
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = 引き落としに複数回失敗したため、{ $productName } のサブスクリプションをキャンセルしました。再びアクセスするには、更新された支払い方法で新たにサブスクリプションを開始してください。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } への支払いを確認しました
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = { $productName } をご利用いただきありがとうございます
subscriptionFirstInvoice-content-processing = あなたのお支払いは現在処理中です。最大 4 営業日かかる場合があります。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = { $productName } の使用を開始する方法について別のメールが届きます。
subscriptionFirstInvoice-content-auto-renew = キャンセルを選択しない限り、サブスクリプションは請求期間ごとに自動的に更新されます。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } への支払いに失敗しました
subscriptionPaymentFailed-title = 申し訳ありませんが、お支払いに問題があります
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = { $productName } の最新のお支払いに問題がありました。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName } の支払い情報を更新してください
subscriptionPaymentProviderCancelled-title = 申し訳ありませんが、お支払い方法に問題があります。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = { $productName } の支払い方法に問題が見つかりました。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } のサブスクリプションを再開しました
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = { $productName } のサブスクリプションを再開していただき、ありがとうございます。
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = 請求サイクルとお支払い方法は同じです。次回は { $nextInvoiceDateOnly } に { $invoiceTotal } が請求されます。キャンセルを選択しない限り、サブスクリプションは請求期間ごとに自動的に更新されます。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } 自動更新のお知らせ
subscriptionRenewalReminder-title = サブスクリプションはまもなく更新されます
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = 平素より { $productName } をご利用いただき、誠にありがとうございます。
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = 現在のサブスクリプションはあと { $reminderLength } 日で自動的に更新されるよう設定されています。更新日に { -brand-mozilla } が { $planIntervalCount } { $planInterval } のサブスクリプションを更新し、{ $invoiceTotal } の料金があなたのアカウントの支払い方法に適用されます。
subscriptionRenewalReminder-content-closing = 今後とも宜しくお願い致します。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } チームより
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } のサブスクリプションの支払い情報を更新してください
subscriptionsPaymentProviderCancelled-title = 申し訳ありませんが、お支払い方法に問題があります
subscriptionsPaymentProviderCancelled-content-detected = 次のサブスクリプションの支払い方法に問題が見つかりました。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } への支払いを受領しました
subscriptionSubsequentInvoice-title = ご利用いただきありがとうございます！
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName } の最新のお支払いを受領しました。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = { $productName } にアップグレードしました
subscriptionUpgrade-title = アップグレードしていただきありがとうございます！

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = キャンセルを選択しない限り、サブスクリプションは請求期間ごとに自動的に更新されます。
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = { $unblockCode } を使用してログイン
unblockCode-preview = このコードの有効期限は 1 時間です
unblockCode-title = ログインしようとしているのはあなた自身ですか？
unblockCode-prompt = あなた自身の場合は、こちらの認証コードを使用してください:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = あなた自身の場合は、こちらの認証コードを使用してください:: { $unblockCode }
unblockCode-report = あなたではない場合は、侵入を防ぐため <a data-l10n-name="reportSignInLink">問題を報告</a> してください。
unblockCode-report-plaintext = あなたではない場合は、侵入を防ぐため問題を報告してください。
verificationReminderFinal-subject = 最終通知: アカウントの確認をしてください
verificationReminderFinal-description-2 = 数週間前に { -product-mozilla-account } が作成されましたが、まだ確認されていません。安全のため、 24 時間以内に確認されない場合はアカウントを削除します。
confirm-account = アカウントを確認
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = アカウントを確認してください
verificationReminderFirst-title-3 = { -brand-mozilla } へようこそ！
verificationReminderFirst-description-3 = 数日前に{ -product-mozilla-account }を作成されましたが、まだ確認が終わっていません。15 日以内に確認されない場合、アカウントが自動的に削除されます。
verificationReminderFirst-sub-description-3 = あなたとプライバシーを優先するブラウザーをお見逃しなく。
confirm-email-2 = アカウントを確認
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = アカウントを確認
verificationReminderSecond-subject-2 = アカウントを確認してください
verificationReminderSecond-title-3 = { -brand-mozilla } をお忘れなく！
verificationReminderSecond-description-4 = 数日前に { -product-mozilla-account }を作成されましたが、まだ確認が終わっていません。10 日以内に確認されない場合、アカウントが自動的に削除されます。
verificationReminderSecond-second-description-3 = { -product-mozilla-account } により、複数の端末で { -brand-firefox } のデータを同期し、プライバシーが保護された { -brand-mozilla } の他の製品にもアクセスできます。
verificationReminderSecond-sub-description-2 = インターネットをすべての人に開かれ、アクセス可能な場所として形作っていく私たちの使命にご協力ください。
verificationReminderSecond-action-2 = アカウントを確認
verify-title-3 = { -brand-mozilla } 製品でインターネットをオープンに
verify-description-2 = アカウントを確認すると、ログインしたどの端末からでも { -brand-mozilla } を最大限に活用できます。まずこちらから:
verify-subject = アカウント作成を完了してください
verify-action-2 = アカウントを確認
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = { $code } を使用してアカウントを変更
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview = このコードの有効期限は { $expirationTime } 分です。
verifyAccountChange-title = アカウント情報を変更しようとしていますか？
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = アカウントを安全に保つために、次の端末からのアカウントの変更を承認してください:
verifyAccountChange-prompt = はいの場合の認証コードはこちら:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice = { $expirationTime } 分以内に確認コードを入力してください。
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = { $clientName } にログインしましたか？
verifyLogin-description-2 = アカウントを安全に保つために、次の端末からのログインを確認してください:
verifyLogin-subject-2 = ログインを確認
verifyLogin-action = ログインを確認
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = { $code } を使用してログイン
verifyLoginCode-preview = このコードの有効期限は 5 分です。
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = { $serviceName } にログインしましたか？
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = アカウントを安全に保つために、次の端末からのログインを承認してください:
verifyLoginCode-prompt-3 = はいの場合の認証コードはこちら:
verifyLoginCode-expiry-notice = 5 分以内に確認コードを入力してください。
verifyPrimary-title-2 = 優先メールアドレス確認
verifyPrimary-description = アカウント変更を実行するリクエストが次の端末から行われました:
verifyPrimary-subject = 優先メールアドレス確認
verifyPrimary-action-2 = メールアドレスを確認
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = 確認が済むと、予備アドレスの追加などのアカウント変更をこの端末から行えるようになります。
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = { $code } を使用して予備アドレスを確認
verifySecondaryCode-preview = このコードの有効期限は 5 分です。
verifySecondaryCode-title-2 = 予備メールアドレスの確認
verifySecondaryCode-action-2 = メールアドレスを確認
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = { $email } を予備アドレスとして使用するためのリクエストが以下の { -product-mozilla-account }から行われました:
verifySecondaryCode-prompt-2 = この確認コードを使用してください:
verifySecondaryCode-expiry-notice-2 = この確認コードは 5 分で有効期限切れになります。確認が済み次第、このアドレスにセキュリティ通知や確認のメールが送られるようになります。
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = { $code } を使用してアカウントを確認
verifyShortCode-preview-2 = このコードの有効期限は 5 分です。
verifyShortCode-title-3 = { -brand-mozilla } でインターネットをオープンに
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = アカウントを確認すると、ログインしたどの端末からでも { -brand-mozilla } を最大限に活用できます。まずこちらから:
verifyShortCode-prompt-3 = この確認コードを使用してください:
verifyShortCode-expiry-notice = 5 分以内に確認コードを入力してください。
