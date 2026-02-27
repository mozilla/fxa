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
cancellationSurvey = この <a data-l10n-name="cancellationSurveyUrl">簡単なアンケート</a> に回答して、サービスの改善にご協力ください。
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = この簡単なアンケートに回答して、サービスの改善にご協力ください。
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
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = 請求書の表示：{ $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = { $productName } のサブスクリプションがキャンセルされました
subscriptionAccountDeletion-title = ご利用ありがとうございました
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = 最近、{ -product-mozilla-account }が削除されたことにより、{ $productName } のサブスクリプションがキャンセルされました。最後の { $invoiceTotal } の請求は { $invoiceDateOnly } に支払われました。
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
subscriptionRenewalReminder-content-closing = 今後とも宜しくお願い致します。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } チームより
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
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } のサブスクリプションの支払い情報を更新してください
subscriptionsPaymentProviderCancelled-title = 申し訳ありませんが、お支払い方法に問題があります
subscriptionsPaymentProviderCancelled-content-detected = 次のサブスクリプションの支払い方法に問題が見つかりました。
