## Non-email strings

session-verify-send-push-title-2 = { -product-mozilla-account }nıza giriş mi yapıyorsunuz?
session-verify-send-push-body-2 = Siz olduğunuzu onaylamak için tıklayın
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { -brand-mozilla } dogrulama kodunuz: { $code }. Gecerlilik suresi 5 dakikadir.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } dogrulama kodu: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { -brand-mozilla } kurtarma kodunuz: { $code }. Gecerlilik suresi 5 dakikadir.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kodu: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { -brand-mozilla } kurtarma kodunuz: { $code }. Gecerlilik suresi 5 dakikadir.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } kodu: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logosu">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Cihazları eşitle">
body-devices-image = <img data-l10n-name="devices-image" alt="Cihazlar">
fxa-privacy-url = { -brand-mozilla } Gizlilik İlkeleri
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Gizlilik Bildirimi
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } Hizmet Koşulları
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logosu">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logosu">
subplat-automated-email = Bu e-posta otomatik olarak gönderilmiştir. Hatalı olduğunu düşünüyorsanız bir şey yapmanıza gerek yoktur.
subplat-privacy-notice = Gizlilik bildirimi
subplat-privacy-plaintext = Gizlilik bildirimi:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = { $email } adresine kayıtlı bir { -product-mozilla-account }nız olduğu ve { $productName } ürününe kaydolduğunuz için bu e-postayı aldınız.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = { $email } adresine kayıtlı bir { -product-mozilla-account } olduğu için bu e-postayı aldınız.
subplat-explainer-multiple-2 = { $email } adresine kayıtlı bir { -product-mozilla-account }nız olduğu ve birden fazla ürüne kaydolduğunuz için bu e-postayı aldınız.
subplat-explainer-was-deleted-2 = { $email } adresine kayıtlı bir { -product-mozilla-account } olduğu için bu e-postayı aldınız.
subplat-manage-account-2 = { -product-mozilla-account } ayarlarınızı yönetmek için <a data-l10n-name="subplat-account-page">hesap sayfanızı</a> ziyaret edin.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = { -product-mozilla-account } ayarlarınızı yönetmek için hesap sayfanıza gidebilirsiniz: { $accountSettingsUrl }
subplat-terms-policy = Koşullar ve iptal politikası
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Aboneliği iptal et
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Aboneliği yeniden etkinleştir
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Fatura bilgilerini güncelle
subplat-privacy-policy = { -brand-mozilla } Gizlilik İlkeleri
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Gizlilik Bildirimi
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } Hizmet Koşulları
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Hukuki Bilgiler
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Gizlilik
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Hesabınız silinse bile <a data-l10n-name="unsubscribeLink">abonelikten ayrılmadığınız</a> sürece Mozilla Corporation ve Mozilla Vakfı’ndan e-posta almaya devam edeceksiniz:
account-deletion-info-block-support = Herhangi bir sorunuz veya yardıma ihtiyacınız varsa <a data-l10n-name="supportLink">destek ekibimizle</a> iletişime geçebilirsiniz.
account-deletion-info-block-communications-plaintext = Hesabınız silinse bile abonelikten ayrılmak istemediğiniz sürece Mozilla Corporation ve Mozilla Vakfı’ndan e-posta almaya devam edeceksiniz:
account-deletion-info-block-support-plaintext = Herhangi bir sorunuz veya yardıma ihtiyacınız varsa destek ekibimizle iletişime geçebilirsiniz:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName } uygulamasını { -google-play }’den indir">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName } uygulamasını { -app-store }’dan indir">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = { $productName } uygulamasını <a data-l10n-name="anotherDeviceLink">başka bir bilgisayara</a> yükleyin.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = { $productName } uygulamasını <a data-l10n-name="anotherDeviceLink">başka bir cihaza</a> yükleyin.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = { $productName } uygulamasını Google Play’den indirin:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = { $productName } uygulamasını App Store’dan indirin:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = { $productName } uygulamasını başka bir cihaza yükleyin:
automated-email-change-2 = Bu işlemi siz yapmadıysanız hemen <a data-l10n-name="passwordChangeLink">parolanızı değiştirin</a>.
automated-email-support = Daha fazla bilgi için <a data-l10n-name="supportLink">{ -brand-mozilla } Destek</a> sayfasını ziyaret edin.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Bu işlemi siz yapmadıysanız hemen parolanızı değiştirin:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Daha fazla bilgi için { -brand-mozilla } Destek sayfasını ziyaret edin:
automated-email-inactive-account = Bu otomatik bir e-postadır. Bu e-postayı bir { -product-mozilla-account }nız olduğu ve son oturum açmanızın üzerinden 2 yıl geçtiği için alıyorsunuz.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Daha fazla bilgi için <a data-l10n-name="supportLink">{ -brand-mozilla } Destek</a>'i ziyaret edin.
automated-email-no-action-plaintext = Bu otomatik bir e-postadır. Bu e-postayı yanlışlıkla aldıysanız herhangi bir şey yapmanıza gerek yok.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Bu otomatik bir e-postadır. Bu eyleme siz izin vermediyseniz lütfen parolanızı değiştirin:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Bu istek { $uaOS } { $uaOSVersion } işletim sistemindeki { $uaBrowser } tarayıcısından yapıldı.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Bu istek { $uaOS } işletim sistemindeki { $uaBrowser } tarayıcısından yapıldı.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Bu istek { $uaBrowser } tarayıcısından yapıldı.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Bu istek { $uaOS } { $uaOSVersion } işletim sisteminden yapıldı.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Bu istek { $uaOS } işletim sisteminden yapıldı.
automatedEmailRecoveryKey-delete-key-change-pwd = Bunu yapan siz değilseniz <a data-l10n-name="revokeAccountRecoveryLink">yeni anahtarı silip</a> <a data-l10n-name="passwordChangeLink">parolanızı değiştirin</a>.
automatedEmailRecoveryKey-change-pwd-only = Bunu yapan siz değilseniz <a data-l10n-name="passwordChangeLink">parolanızı değiştirin</a>.
automatedEmailRecoveryKey-more-info = Daha fazla bilgi için <a data-l10n-name="supportLink">{ -brand-mozilla } Destek</a> sitesini ziyaret edebilirsiniz.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Bu istek şuradan geldi:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Bu siz değilseniz yeni anahtarı silin:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Bu siz değilseniz parolanızı değiştirin:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = ve parolanızı değiştirin:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Daha fazla bilgi için { -brand-mozilla } destek sayfasını ziyaret edin:
automated-email-reset =
    Bu otomatik bir e-postadır. Bu işlemi siz onaylamadıysanız <a data-l10n-name="resetLink">lütfen parolanızı sıfırlayın</a>.
    Daha fazla bilgi için lütfen <a data-l10n-name="supportLink">{ -brand-mozilla } Destek</a>'i ziyaret edin.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Bu işleme onay vermediyseniz lütfen hemen { $resetLink } adresinden parolanızı sıfırlayın
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Bu işlemi siz yapmadıysanız hemen <a data-l10n-name="resetLink">parolanızı</a> ve <a data-l10n-name="twoFactorSettingsLink">iki aşamalı kimlik doğrulamayı</a> sıfırlayın.
    Daha fazla bilgi için <a data-l10n-name="supportLink">{ -brand-mozilla } Destek</a>ʼi ziyaret edebilirsiniz.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Bu işlemi siz yapmadıysanız hemen parolanızı sıfırlayın:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Ayrıca iki aşamalı doğrulamayı da sıfırlayın:
brand-banner-message = { -product-firefox-accounts } adını { -product-mozilla-accounts } olarak değiştirdiğimizi biliyor muydunuz? <a data-l10n-name="learnMore">Bilgi alın</a>
cancellationSurvey = Hizmetlerimizi iyileştirebilmemiz için bu <a data-l10n-name="cancellationSurveyUrl">kısa ankete</a> katılmanızı rica ederiz.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hizmetlerimizi iyileştirebilmemiz için kısa bir ankete katılmanızı rica ederiz:
change-password-plaintext = Birisinin hesabınızı ele geçirmeye çalıştığını düşünüyorsanız lütfen parolanızı değiştirin.
manage-account = Hesabı yönet
manage-account-plaintext = { manage-account }:
payment-details = Ödeme ayrıntıları:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Fatura numarası: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceDateOnly } tarihinde { $invoiceTotal } tahsil edildi
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Sonraki fatura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Ödeme yöntemi:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Ödeme yöntemi: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Ödeme yöntemi: { $lastFour } ile biten { $cardName }
payment-provider-card-ending-in-plaintext = Ödeme yöntemi: { $lastFour } ile biten kart
payment-provider-card-ending-in = <b>Ödeme yöntemi:</b> { $lastFour } ile biten kart
payment-provider-card-ending-in-card-name = <b>Ödeme yöntemi:</b> { $lastFour } ile biten { $cardName }
subscription-charges-invoice-summary = Fatura özeti

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Fatura numarası:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Fatura numarası: { $invoiceNumber }
subscription-charges-invoice-date = <b>Tarih:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Tarih: { $invoiceDateOnly }
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Ara toplam: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Tek seferlik indirim
subscription-charges-one-time-discount-plaintext = Tek seferlik indirim: { $invoiceDiscountAmount }
subscription-charges-discount = İndirim
subscription-charges-discount-plaintext = İndirim: { $invoiceDiscountAmount }
subscription-charges-taxes = Vergiler ve ücretler
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Vergiler ve ücretler: { $invoiceTaxAmount }
subscription-charges-total = <b>Toplam</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Toplam: { $invoiceTotal }

##

subscriptionSupport = Aboneliğinizle ilgili sorularınız mı var? <a data-l10n-name="subscriptionSupportUrl">Destek ekibimiz</a> size yardımcı olabilir.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Aboneliğinizle ilgili sorularınız mı var? Destek ekibimiz size yardımcı olabilir:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = { $productName } abonesi olduğunuz için teşekkür ederiz. Aboneliğinizle ilgili bir sorunuz veya { $productName } hakkında daha fazla bilgiye ihtiyacınız varsa lütfen <a data-l10n-name="subscriptionSupportUrl">bizimle iletişime geçin</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = { $productName } abonesi olduğunuz için teşekkür ederiz. Aboneliğinizle ilgili bir sorunuz veya { $productName } hakkında daha fazla bilgiye ihtiyacınız varsa lütfen bizimle iletişime geçin:
subscription-support-get-help = Aboneliğinizle ilgili yardım alın
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Aboneliğinizi yönetin</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Aboneliğinizi yönetin:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Destek birimine ulaşın</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Destek birimine ulaşın:
subscriptionUpdateBillingEnsure = Ödeme yönteminizin ve hesap bilgilerinizin güncel olup olmadığını <a data-l10n-name="updateBillingUrl">buradan</a> kontrol edebilirsiniz.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Ödeme yönteminizin ve hesap bilgilerinizin güncel olup olmadığını buradan kontrol edebilirsiniz:
subscriptionUpdateBillingTry = Birkaç gün içinde ödeme almayı tekrar deneyeceğiz. Sorunu gidermek için <a data-l10n-name="updateBillingUrl">ödeme bilgilerinizi güncellemeniz gerekebilir</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Birkaç gün içinde ödeme almayı tekrar deneyeceğiz. Sorunu gidermek için ödeme bilgilerinizi güncellemeniz gerekebilir:
subscriptionUpdatePayment = Hizmetinizde kesinti olmaması için lütfen en kısa sürede <a data-l10n-name="updateBillingUrl">ödeme bilgilerinizi güncelleyin</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Hizmetinizde kesinti olmaması için lütfen ödeme bilgilerinizi en kısa zamanda güncelleyin:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Daha fazla bilgi için <a data-l10n-name="supportLink">{ -brand-mozilla } Destek</a> sitesini ziyaret edebilirsiniz.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Daha fazla bilgi için { -brand-mozilla } Destek’i ziyaret edin: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } - { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } - { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (tahmini)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (tahmini)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (tahmini)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (tahmini)
view-invoice-link-action = Faturayı görüntüle
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Faturayı görüntüle: { $invoiceLink }
cadReminderFirst-subject-1 = Hatırlatma! Hadi { -brand-firefox }’u eşitleyelim
cadReminderFirst-action = Başka bir cihazı eşitle
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Eşitleme için iki cihaza ihtiyacınız var
cadReminderFirst-description-v2 = Sekmelerinizi yanınızda taşıyın. { -brand-firefox } kullandığınız her yerden yer imlerinize, parolalarınıza ve diğer verilerinize ulaşın.
cadReminderSecond-subject-2 = Eşitleme kurulumunuzu tamamlayalım
cadReminderSecond-action = Başka bir cihazı eşitle
cadReminderSecond-title-2 = Eşitlemeyi unutmayın!
cadReminderSecond-description-sync = Yer imlerinizi, parolalarınızı ve daha fazlasını { -brand-firefox } kullandığınız her yerde eşitleyin.
cadReminderSecond-description-plus = Ayrıca verileriniz her zaman şifrelenir. Yalnızca siz ve onayladığınız cihazlar görebilir.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = { $productName } uygulamasına hoş geldiniz
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = { $productName } uygulamasına hoş geldiniz
downloadSubscription-content-2 = Aboneliğinize dahil olan tüm özellikleri kullanmaya başlayalım:
downloadSubscription-link-action-2 = Başlayın
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account }nız silindi
fraudulentAccountDeletion-title = Hesabınız silindi
fraudulentAccountDeletion-content-part1-v2 = Yakın zamanda bu e-posta adresiyle bir { -product-mozilla-account } oluşturuldu ve abonelik ücreti alındı. Tüm yeni hesaplarda yaptığımız gibi, öncelikle bu e-posta adresini doğrulayarak hesabınızı onaylamanızı istemiştik.
fraudulentAccountDeletion-content-part2-v2 = Bu hesabın daha önce onaylanmadığını görüyoruz. Onay adımı tamamlanmadığı için bu aboneliğin gerçek olup olmadığından emin değiliz. Bu nedenle bu e-posta adresine kayıtlı { -product-mozilla-account }nı sildik, aboneliğinizi iptal ettik ve tüm ücretleri iade ettik.
fraudulentAccountDeletion-contact = Herhangi bir sorunuz varsa lütfen <a data-l10n-name="mozillaSupportUrl">destek ekibimizle</a> iletişime geçin.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Sorularınız varsa lütfen destek ekibimizle iletişime geçin: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = { -product-mozilla-account }nızı elinizde tutmak için son şansınız
inactiveAccountFinalWarning-title = { -brand-mozilla } hesabınız ve verileriniz silinecek
inactiveAccountFinalWarning-preview = Hesabınızı korumak için giriş yapın
inactiveAccountFinalWarning-account-description = { -product-mozilla-account }nız { -brand-firefox }’u eşitleme, { -product-mozilla-monitor }, { -product-firefox-relay } ve { -product-mdn } gibi ücretsiz gizlilik ve gezinti ürünlerine erişmek için kullanılır.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> tarihine kadar giriş yapmazsanız hesabınız ve kişisel verileriniz kalıcı olarak silinecektir.
inactiveAccountFinalWarning-action = Hesabınızı korumak için giriş yapın
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Hesabınızı korumak için giriş yapın:
inactiveAccountFirstWarning-subject = Hesabınızı kaybetmeyin
inactiveAccountFirstWarning-title = { -brand-mozilla } hesabınızı ve verilerinizi korumak istiyor musunuz?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account }nız { -brand-firefox }’u eşitleme, { -product-mozilla-monitor }, { -product-firefox-relay } ve { -product-mdn } gibi ücretsiz gizlilik ve gezinti ürünlerine erişmek için kullanılır.
inactiveAccountFirstWarning-inactive-status = İki yıldır giriş yapmadığınızı fark ettik.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Aktif olmadığınız için <strong>{ $deletionDate }</strong> tarihinde hesabınız ve kişisel verileriniz kalıcı olarak silinecektir.
inactiveAccountFirstWarning-action = Hesabınızı korumak için giriş yapın
inactiveAccountFirstWarning-preview = Hesabınızı korumak için giriş yapın
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Hesabınızı korumak için giriş yapın:
inactiveAccountSecondWarning-subject = İşlem gerekiyor: Hesabınız 7 gün sonra silinecek
inactiveAccountSecondWarning-title = 7 gün sonra { -brand-mozilla } hesabınız ve verileriniz silinecektir
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account }nız { -brand-firefox }’u eşitleme, { -product-mozilla-monitor }, { -product-firefox-relay } ve { -product-mdn } gibi ücretsiz gizlilik ve gezinti ürünlerine erişmek için kullanılır.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Aktif olmadığınız için <strong>{ $deletionDate }</strong> tarihinde hesabınız ve kişisel verileriniz kalıcı olarak silinecektir.
inactiveAccountSecondWarning-action = Hesabınızı korumak için giriş yapın
inactiveAccountSecondWarning-preview = Hesabınızı korumak için giriş yapın
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Hesabınızı korumak için giriş yapın:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Yedek kimlik doğrulama kodunuz kalmadı!
codes-reminder-title-one = Son yedek kimlik doğrulama kodunuzu kullanmak üzeresiniz
codes-reminder-title-two = Yeni yedek doğrulama kodları oluşturmanın vakti geldi
codes-reminder-description-part-one = Yedek kimlik doğrulama kodları, parolanızı unuttuğunuzda bilgilerinizi geri yüklemenize yardımcı olur.
codes-reminder-description-part-two = İleride verilerinizi kaybetmemek için yeni kodlar oluşturun.
codes-reminder-description-two-left = Sadece iki kodunuz kaldı.
codes-reminder-description-create-codes = Hesabınıza erişimi kaybederseniz hesabınızı kurtarmanızı sağlayacak yedek kimlik doğrulama kodları oluşturun.
lowRecoveryCodes-action-2 = Kod oluşturun
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Yedek kimlik doğrulama kodunuz kalmadı
        [one] Sadece 1 yedek kimlik doğrulama kodunuz kaldı
       *[other] Sadece { $numberRemaining } yedek kimlik doğrulama kodunuz kaldı!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Yeni { $clientName } girişi
newDeviceLogin-subjectForMozillaAccount = { -product-mozilla-account }nıza yeni giriş
newDeviceLogin-title-3 = { -product-mozilla-account }nıza giriş yapıldı
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Siz değil miydiniz? <a data-l10n-name="passwordChangeLink">Parolanızı değiştirin</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Siz değil miydiniz? Parolanızı değiştirin:
newDeviceLogin-action = Hesabı yönet
passwordChanged-subject = Parola güncellendi
passwordChanged-title = Parola başarıyla değiştirildi
passwordChanged-description-2 = { -product-mozilla-account } parolanız aşağıdaki cihaz üzerinden değiştirildi:
passwordChangeRequired-subject = Şüpheli etkinlik algılandı
passwordChangeRequired-preview = Parolanızı hemen değiştirin
passwordChangeRequired-title-2 = Parolanızı sıfırlayın
passwordChangeRequired-suspicious-activity-3 = Hesabınızı şüpheli faaliyetlerden korumak için kilitledik. Önlem olarak tüm cihazlarınızdaki oturumlarınız kapatıldı ve eşitlenmiş verileriniz silindi.
passwordChangeRequired-sign-in-3 = Hesabınıza tekrar giriş yapmak için parolanızı sıfırlamanız yeterli.
passwordChangeRequired-different-password-2 = <b>Önemli:</b> Geçmişte kullandığınızdan farklı ve güçlü bir parola seçin.
passwordChangeRequired-different-password-plaintext-2 = Önemli: Geçmişte kullandığınızdan farklı ve güçlü bir parola seçin.
passwordChangeRequired-action = Parolayı sıfırla
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
password-forgot-otp-preview = Kodun geçerlilik süresi 10 dakikadır
password-forgot-otp-title = Parolanızı unuttunuz mu?
password-forgot-otp-request = { -product-mozilla-account }nız için bu cihazdan bir parola değiştirme isteği aldık:
password-forgot-otp-code-2 = Bunu siz talep ettiyseniz aşağıdaki onay koduyla devam edebilirsiniz:
password-forgot-otp-expiry-notice = Kodun geçerlilik süresi 10 dakikadır.
passwordReset-subject-2 = Parolanız sıfırlandı
passwordReset-title-2 = Parolanız sıfırlandı
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = { -product-mozilla-account } parolanızı sıfırladığınız cihaz ve tarih:
passwordResetAccountRecovery-subject-2 = Parolanız sıfırlandı
passwordResetAccountRecovery-title-3 = Parolanız sıfırlandı
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = { -product-mozilla-account } parolanızı sıfırlamak için hesap kurtarma anahtarınızı kullandığınız cihaz ve tarih:
passwordResetAccountRecovery-information = Eşitlenen tüm cihazlarınızdaki oturumlarınızı kapattık. Biraz önce kullandığınız hesap kurtarma anahtarının yerine yeni bir tane oluşturduk. Hesap ayarlarınızdan değiştirebilirsiniz.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Eşitlenen tüm cihazlarınızdaki oturumlarınızı kapattık. Biraz önce kullandığınız hesap kurtarma anahtarının yerine yeni bir tane oluşturduk. Hesap ayarlarınızdan değiştirebilirsiniz:
passwordResetAccountRecovery-action-4 = Hesabı yönet
passwordResetRecoveryPhone-subject = Kurtarma telefonu kullanıldı
passwordResetRecoveryPhone-preview = Bunu sizin yaptığınızdan emin olun
passwordResetRecoveryPhone-title = Parola sıfırlamayı onaylamak için kurtarma telefonunuz kullanıldı
passwordResetRecoveryPhone-device = Kurtarma telefonunun kullanıldığı yer:
passwordResetRecoveryPhone-action = Hesabı yönet
passwordResetWithRecoveryKeyPrompt-subject = Parolanız sıfırlandı
passwordResetWithRecoveryKeyPrompt-title = Parolanız sıfırlandı
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = { -product-mozilla-account } parolanızı sıfırladığınız cihaz ve tarih:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Hesap kurtarma anahtarı oluştur
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Hesap kurtarma anahtarı oluştur:
passwordResetWithRecoveryKeyPrompt-cta-description = Eşitlenen tüm cihazlarınıza yeniden giriş yapmanız gerekecek. Verilerinizi güvende tutmak için bir dahaki sefere hesap kurtarma anahtarı kullanmanızı öneririz. Bu sayede, parolanızı unutursanız verilerinizi kurtarabilirsiniz.
postAddAccountRecovery-subject-3 = Yeni hesap kurtarma anahtarı oluşturuldu
postAddAccountRecovery-title2 = Yeni bir hesap kurtarma anahtarı oluşturdunuz
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Bu anahtarı güvenli bir yerde saklayın. Parolanızı unutursanız şifrelenmiş gezinti verilerinizi geri yüklemek için bu anahtara ihtiyacınız olacak.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Bu anahtar sadece bir kez kullanılabilir. Kullandıktan sonra sizin için otomatik olarak yeni bir tane oluşturacağız. İstediğiniz zaman hesap ayarlarınızdan yeni bir tane oluşturabilirsiniz.
postAddAccountRecovery-action = Hesabı yönet
postAddLinkedAccount-subject-2 = { -product-mozilla-account }nıza yeni bir hesap bağlandı
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName } hesabınız { -product-mozilla-account }na bağlandı
postAddLinkedAccount-action = Hesabı yönet
postAddRecoveryPhone-subject = Kurtarma telefonu eklendi
postAddRecoveryPhone-preview = Hesabınız iki aşamalı doğrulamayla korunuyor
postAddRecoveryPhone-title-v2 = Kurtarma telefon numarası eklediniz
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = { $maskedLastFourPhoneNumber } numarasını kurtarma telefon numaranız olarak eklediniz
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = İki aşamalı kimlik doğrulama, hesabınızı nasıl korur?
postAddRecoveryPhone-how-protect-plaintext = İki aşamalı kimlik doğrulama, hesabınızı nasıl korur?
postAddRecoveryPhone-enabled-device = Bu cihazdan etkinleştirdiniz:
postAddRecoveryPhone-action = Hesabı yönet
postAddTwoStepAuthentication-preview = Hesabınız korunuyor
postAddTwoStepAuthentication-subject-v3 = İki aşamalı doğrulama açık
postAddTwoStepAuthentication-title-2 = İki aşamalı doğrulamayı açtınız
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = İşlemi yapan cihaz:
postAddTwoStepAuthentication-action = Hesabı yönet
postAddTwoStepAuthentication-code-required-v4 = Artık her girişinizde kimlik doğrulama uygulamanızdaki güvenlik kodları gerekecektir.
postAddTwoStepAuthentication-recovery-method-codes = Ayrıca kurtarma yönteminiz olarak yedek kimlik doğrulama kodlarını da eklediniz.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Ayrıca { $maskedPhoneNumber } numarasını kurtarma telefon numaranız olarak eklediniz.
postAddTwoStepAuthentication-how-protects-link = İki aşamalı kimlik doğrulama, hesabınızı nasıl korur?
postAddTwoStepAuthentication-how-protects-plaintext = İki aşamalı kimlik doğrulama, hesabınızı nasıl korur?
postChangeAccountRecovery-subject = Hesap kurtarma anahtarı değiştirildi
postChangeAccountRecovery-title = Hesap kurtarma anahtarınızı değiştirdiniz
postChangeAccountRecovery-body-part1 = Artık yeni bir hesap kurtarma anahtarınız var. Önceki anahtarınız silindi.
postChangeAccountRecovery-body-part2 = Bu yeni anahtarı güvenli bir yerde saklayın. Parolanızı unutursanız şifrelenmiş gezinti verilerinizi geri yüklemek için bu anahtara ihtiyacınız olacak.
postChangeAccountRecovery-action = Hesabınızı yönetin
postChangePrimary-subject = Ana e-posta güncellendi
postChangePrimary-title = Yeni ana e-posta
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Ana e-posta adresinizi { $email } olarak başarıyla değiştirdiniz. Bu adres artık { -product-mozilla-account }nıza giriş için kullanıcı adınız olacak. Güvenlik bildirimleri ve giriş onayları da bu adresinize gönderilecek.
postChangePrimary-action = Hesabı yönet
postChangeRecoveryPhone-subject = Kurtarma telefonu güncellendi
postChangeRecoveryPhone-preview = Hesabınız iki aşamalı doğrulamayla korunuyor
postChangeRecoveryPhone-title = Kurtarma telefonunuzu değiştirdiniz
postChangeRecoveryPhone-description = Artık yeni bir kurtarma telefonunuz var. Önceki telefon numaranız silindi.
postChangeRecoveryPhone-requested-device = Bu cihazdan istediniz:
postChangeTwoStepAuthentication-preview = Hesabınız korunuyor
postChangeTwoStepAuthentication-subject = İki aşamalı kimlik doğrulama güncellendi
postChangeTwoStepAuthentication-title = İki aşamalı kimlik doğrulama güncellendi
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = İşlemi yapan cihaz:
postChangeTwoStepAuthentication-action = Hesabı yönet
postChangeTwoStepAuthentication-how-protects-link = İki aşamalı kimlik doğrulama, hesabınızı nasıl korur?
postChangeTwoStepAuthentication-how-protects-plaintext = İki aşamalı kimlik doğrulama, hesabınızı nasıl korur?
postConsumeRecoveryCode-title-3 = Parola sıfırlamayı onaylamak için yedek kimlik doğrulama kodunuz kullanıldı
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kodun kullanıldığı yer:
postConsumeRecoveryCode-action = Hesabı yönet
postConsumeRecoveryCode-subject-v3 = Kullanılan yedek kimlik doğrulama kodu
postConsumeRecoveryCode-preview = Bunu sizin yaptığınızdan emin olun
postNewRecoveryCodes-subject-2 = Yeni yedek kimlik doğrulama kodları oluşturuldu
postNewRecoveryCodes-title-2 = Yeni yedek kimlik doğrulama kodları oluşturdunuz
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Oluşturan cihaz:
postNewRecoveryCodes-action = Hesabı yönet
postRemoveAccountRecovery-subject-2 = Hesap kurtarma anahtarı silindi
postRemoveAccountRecovery-title-3 = Hesap kurtarma anahtarınızı sildiniz
postRemoveAccountRecovery-body-part1 = Parolanızı unutursanız şifrelenmiş gezinti verilerinizi kurtarmak için hesap kurtarma anahtarınız gerekir.
postRemoveAccountRecovery-body-part2 = Henüz oluşturmadıysanız hesap ayarlarınızdan yeni bir hesap kurtarma anahtarı oluşturun. Kayıtlı parolalarınızı, yer imlerinizi, gezinti geçmişinizi ve diğer verilerinizi kaybetmeyin.
postRemoveAccountRecovery-action = Hesabı yönet
postRemoveRecoveryPhone-subject = Kurtarma telefonu kaldırıldı
postRemoveRecoveryPhone-preview = Hesabınız iki aşamalı doğrulamayla korunuyor
postRemoveRecoveryPhone-title = Kurtarma telefonu kaldırıldı
postRemoveRecoveryPhone-description-v2 = Kurtarma telefonunuz iki aşamalı doğrulama ayarlarınızdan kaldırıldı.
postRemoveRecoveryPhone-description-extra = Kimlik doğrulama uygulamanızı kullanamadığınız durumlarda giriş yapmak için yedek kimlik doğrulama kodlarınızı kullanabilirsiniz.
postRemoveRecoveryPhone-requested-device = Bu cihazdan istediniz:
postRemoveSecondary-subject = İkinci e-posta silindi
postRemoveSecondary-title = İkinci e-posta silindi
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = { -product-mozilla-account }nızda ikinci e-posta olarak kayıtlı { $secondaryEmail } adresini başarıyla sildiniz. Güvenlik bildirimleri ve giriş onayları artık bu adrese gönderilmeyecektir.
postRemoveSecondary-action = Hesabı yönet
postRemoveTwoStepAuthentication-subject-line-2 = İki aşamalı doğrulama kapatıldı
postRemoveTwoStepAuthentication-title-2 = İki aşamalı doğrulamayı kapattınız
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Bu cihazdan devre dışı bıraktınız:
postRemoveTwoStepAuthentication-action = Hesabı yönet
postRemoveTwoStepAuthentication-not-required-2 = Artık giriş yaparken kimlik doğrulama uygulamanızın güvenlik kodlarına ihtiyacınız yok.
postSigninRecoveryCode-subject = Yedek kimlik doğrulama koduyla giriş yapıldı
postSigninRecoveryCode-preview = Hesap işlemini onaylayın
postSigninRecoveryCode-title = Yedek kimlik doğrulama kodunuzla giriş yapıldı
postSigninRecoveryCode-description = Bunu siz yapmadıysanız hesabınızın güvenliğini sağlamak için parolanızı hemen değiştirmelisiniz.
postSigninRecoveryCode-device = Bu cihazdan giriş yaptınız:
postSigninRecoveryCode-action = Hesabı yönet
postSigninRecoveryPhone-subject = Kurtarma telefonuyla giriş yapıldı
postSigninRecoveryPhone-preview = Hesap işlemini onaylayın
postSigninRecoveryPhone-title = Kurtarma telefonunuzla giriş yapıldı
postSigninRecoveryPhone-description = Bunu siz yapmadıysanız hesabınızın güvenliğini sağlamak için parolanızı hemen değiştirmelisiniz.
postSigninRecoveryPhone-device = Giriş yaptığınız cihaz:
postSigninRecoveryPhone-action = Hesabı yönet
postVerify-sub-title-3 = Sizi gördüğümüze sevindik!
postVerify-title-2 = Aynı sekmeyi iki cihazınızda da görmek ister misiniz?
postVerify-description-2 = Çok kolay! Eşitlemeyi başlatmak için başka bir cihaza { -brand-firefox }’u yükleyip hesabınıza giriş yapmanız yeterli.
postVerify-sub-description = (Ayrıca yer imlerinize, parolalarınıza ve diğer { -brand-firefox } verilerinize tüm cihazlarınızdan ulaşabilirsiniz.)
postVerify-subject-4 = { -brand-mozilla }’ya hoş geldiniz!
postVerify-setup-2 = Başka bir cihaz bağla:
postVerify-action-2 = Başka bir cihaz bağla
postVerifySecondary-subject = İkinci e-posta eklendi
postVerifySecondary-title = İkinci e-posta eklendi
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = { $secondaryEmail } adresini { -product-mozilla-account }nızın ikinci e-postası olarak onayladınız. Güvenlik bildirimleri ve giriş onayları artık her iki adresinize de gönderilecektir.
postVerifySecondary-action = Hesabı yönet
recovery-subject = Parolanızı sıfırlayın
recovery-title-2 = Parolanızı mı unuttunuz?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = { -product-mozilla-account }nız için bu cihazdan bir parola değiştirme isteği aldık:
recovery-new-password-button = Aşağıdaki düğmeye tıklayarak yeni bir parola oluşturun. Bu bağlantının kullanım süresi bir saat sonra bitecek.
recovery-copy-paste = Aşağıdaki adresi kopyalayıp tarayıcınıza yapıştırarak yeni bir parola oluşturun. Bu bağlantının kullanım süresi bir saat sonra bitecek.
recovery-action = Yeni parola oluştur
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = { $productName } aboneliğiniz iptal edildi
subscriptionAccountDeletion-title = Ayrılmanıza üzüldük
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Yakın zamanda { -product-mozilla-account }nızı sildiniz. Bu nedenle { $productName } aboneliğinizi iptal ettik. { $invoiceTotal } tutarındaki son ödemeniz { $invoiceDateOnly } tarihinde ödendi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = { $productName } hizmetine hoş geldiniz: Lütfen parolanızı belirleyin.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = { $productName } hizmetine hoş geldiniz
subscriptionAccountFinishSetup-content-processing = Ödemeniz işleme alındı. Tamamlanması 4 iş günü sürebilir. İptal etmediğiniz sürece aboneliğiniz her fatura döneminde otomatik olarak yenilenecektir.
subscriptionAccountFinishSetup-content-create-3 = Ardından, yeni aboneliğinizi kullanmaya başlamak için { -product-mozilla-account } parolanızı oluşturacaksınız.
subscriptionAccountFinishSetup-action-2 = Başlayın
subscriptionAccountReminderFirst-subject = Hatırlatma: Hesabınızın kurulumunu tamamlayın
subscriptionAccountReminderFirst-title = Henüz aboneliğinize erişemezsiniz
subscriptionAccountReminderFirst-content-info-3 = Birkaç gün önce { -product-mozilla-account } açtınız ama hesabınızı henüz onaylamadınız. Yeni aboneliğinizi kullanabilmek için hesabınızın kurulumunu tamamlamanız gerekiyor.
subscriptionAccountReminderFirst-content-select-2 = Yeni parola belirlemek için “Parola oluştur”u seçerek hesabınızı doğrulamayı tamamlayın.
subscriptionAccountReminderFirst-action = Parola oluştur
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Son hatırlatma: Hesabınızı kurun
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla }’ya hoş geldiniz!
subscriptionAccountReminderSecond-content-info-3 = Birkaç gün önce { -product-mozilla-account } açtınız ama hesabınızı henüz onaylamadınız. Yeni aboneliğinizi kullanabilmek için hesabınızın kurulumunu tamamlamanız gerekiyor.
subscriptionAccountReminderSecond-content-select-2 = Yeni parola belirlemek için “Parola oluştur”u seçerek hesabınızı doğrulamayı tamamlayın.
subscriptionAccountReminderSecond-action = Parola oluştur
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = { $productName } aboneliğiniz iptal edildi
subscriptionCancellation-title = Ayrılmanıza üzüldük

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = { $productName } aboneliğinizi iptal ettik. { $invoiceTotal } tutarındaki son ödemeniz { $invoiceDateOnly } tarihinde alındı.
subscriptionCancellation-outstanding-content-2 = { $productName } aboneliğinizi iptal ettik. { $invoiceTotal } tutarındaki son ödemeniz { $invoiceDateOnly } tarihinde alınacaktır.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Hizmetiniz, mevcut fatura döneminizin sonuna kadar ({ $serviceLastActiveDateOnly }) devam edecektir.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = { $productName } aboneliğine geçtiniz
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = { $productNameOld } aboneliğinden { $productName } aboneliğine başarıyla geçtiniz.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Bir sonraki faturanızdan itibaren { $productPaymentCycleOld } { $paymentAmountOld } olan ödemeniz { $productPaymentCycleNew } { $paymentAmountNew } olarak değişecektir. Bu { $productPaymentCycleOld } ücret farkı nedeniyle hesabınıza tek seferlik { $paymentProrated } tutarında kredi tanımlanacaktır.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = { $productName } ürününü kullanmak için kurmanız gereken yeni bir yazılım varsa indirme talimatlarını içeren ayrı bir e-posta alacaksınız.
subscriptionDowngrade-content-auto-renew = İptal etmediğiniz sürece aboneliğiniz her fatura döneminde otomatik olarak yenilenir.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = { $productName } aboneliğiniz iptal edildi
subscriptionFailedPaymentsCancellation-title = Aboneliğiniz iptal edildi
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Birden çok ödeme denemesi başarısız olduğu için { $productName } aboneliğinizi iptal ettik. Yeniden buna erişim elde etmek için güncel bir ödeme yöntemiyle yeni bir abonelik başlatın.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } ödemesi onaylandı
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = { $productName } abonesi olduğunuz için teşekkür ederiz
subscriptionFirstInvoice-content-processing = Ödemeniz işleme alındı. Tamamlanması dört iş günü sürebilir.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = { $productName } ürününü kullanmaya nasıl başlayacağınız konusunda ayrı bir e-posta alacaksınız.
subscriptionFirstInvoice-content-auto-renew = İptal etmediğiniz sürece aboneliğiniz her fatura döneminde otomatik olarak yenilenir.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } ödemesi başarısız oldu
subscriptionPaymentFailed-title = Ödemenizle ilgili bir sorun yaşıyoruz
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = { $productName } için son ödemenizle ilgili bir sorun yaşadık.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName } için ödeme bilgilerinizi güncellemeniz gerekiyor
subscriptionPaymentProviderCancelled-title = Ödeme yönteminizle ilgili bir sorun yaşıyoruz
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = { $productName } ödeme yönteminizle ilgili bir sorun tespit ettik.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } aboneliği yeniden etkinleştirildi
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = { $productName } aboneliğinizi yeniden etkinleştirdiğiniz için teşekkür ederiz!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Fatura döngünüz ve ödemeniz aynı kalacaktır. Bir sonraki ödemeniz { $nextInvoiceDateOnly } tarihinde { $invoiceTotal } olacaktır. İptal etmediğiniz sürece aboneliğiniz her fatura döneminde otomatik olarak yenilenir.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } otomatik yenileme bildirimi
subscriptionRenewalReminder-title = Aboneliğiniz yakında yenilenecek
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Değerli { $productName } müşterisi,
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Mevcut aboneliğiniz { $reminderLength } gün sonra otomatik olarak yenilenecek şekilde ayarlandı. Bu durumda { -brand-mozilla }, { $planIntervalCount } { $planInterval } aboneliğinizi yenileyecek ve hesabınızdaki kayıtlı ödeme aracınızdan { $invoiceTotal } tahsil edilecektir.
subscriptionRenewalReminder-content-closing = Saygılarımızla,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } ekibi
subscriptionReplaced-subject = Yükseltmeniz kapsamında aboneliğiniz güncellendi
subscriptionReplaced-title = Aboneliğiniz güncellendi
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Paket dışı { $productName } aboneliğiniz değiştirildi ve artık yeni paketinize dahil edildi.
subscriptionReplaced-content-credit = Önceki aboneliğinizdeki kalan kullanmadığınız süre için hesabınıza kredi eklenecektir. Bu kredi otomatik olarak tanımlanacak ve gelecekteki faturalarınızdan düşülecektir.
subscriptionReplaced-content-no-action = Herhangi bir işlem yapmanız gerekmiyor.
subscriptionsPaymentExpired-subject-2 = Abonelikleriniz için kullandığınız ödeme yönteminin kullanım süresi dolmuş veya yakında dolacak
subscriptionsPaymentExpired-title-2 = Ödeme yönteminizin kullanım süresi dolmuş veya dolmak üzere
subscriptionsPaymentExpired-content-2 = Aşağıdaki abonelikler için kullandığınız ödeme yönteminin kullanım süresi dolmuş veya dolmak üzere.
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } abonelikleri için ödeme bilgilerinizi güncellemeniz gerekiyor
subscriptionsPaymentProviderCancelled-title = Kusura bakmayın, ödeme yönteminizle ilgili bir sorun yaşıyoruz
subscriptionsPaymentProviderCancelled-content-detected = Aşağıdaki abonelikler için ödeme yönteminizle ilgili bir sorun tespit ettik.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } ödemesi alındı
subscriptionSubsequentInvoice-title = Abone olduğunuz için teşekkürler!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName } için son ödemenizi aldık.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = { $productName } aboneliğine yükselttiniz
subscriptionUpgrade-title = Yükseltme yaptığınız için teşekkürler!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Başarıyla { $productName } aboneliğine yükselttiniz.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-credit = Hesabınıza { $paymentProrated } tutarında kredi yüklendi.
subscriptionUpgrade-auto-renew = İptal etmediğiniz sürece aboneliğiniz her fatura döneminde otomatik olarak yenilenir.
unblockCode-title = Giriş yapan siz misiniz?
unblockCode-prompt = Sizseniz bu yetkilendirme kodunu kullanabilirsiniz:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Sizseniz bu yetkilendirme kodunu kullanabilirsiniz: { $unblockCode }
unblockCode-report = Değilseniz, saldırganları kapı dışarı edebilmemiz için <a data-l10n-name="reportSignInLink">bize rapor edin</a>.
unblockCode-report-plaintext = Değilseniz, saldırganları kapı dışarı edebilmemiz için bize rapor edin.
verificationReminderFinal-subject = Hesabınızı onaylamanız için son hatırlatma
verificationReminderFinal-description-2 = Birkaç hafta önce bir { -product-mozilla-account } açtınız ama hesabınızı onaylamadınız. Güvenliğiniz için, önümüzdeki 24 saat içinde onaylamazsanız bu hesabı sileceğiz.
confirm-account = Hesabı onaylayın
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Hesabınızı onaylamayı unutmayın
verificationReminderFirst-title-3 = { -brand-mozilla }’ya hoş geldiniz!
verificationReminderFirst-description-3 = Birkaç gün önce bir { -product-mozilla-account } açtınız ama hesabınızı onaylamadınız. Lütfen hesabınızı 15 gün içinde onaylayın. Aksi halde hesap otomatik olarak silinecektir.
verificationReminderFirst-sub-description-3 = Sizi ve gizliliğinizi ilk sıraya koyan tarayıcıyı kaçırmayın.
confirm-email-2 = Hesabı onaylayın
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Hesabı onaylayın
verificationReminderSecond-subject-2 = Hesabınızı onaylamayı unutmayın
verificationReminderSecond-title-3 = { -brand-mozilla } sizi bekliyor!
verificationReminderSecond-description-4 = Birkaç gün önce bir { -product-mozilla-account } açtınız ama hesabınızı onaylamadınız. Lütfen hesabınızı 10 gün içinde onaylayın. Aksi halde hesap otomatik olarak silinecektir.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } sayesinde { -brand-firefox } verilerinizi cihazlarınız arasında eşitleyebilir ve gizliliğinizi koruyan diğer { -brand-mozilla } ürünlerini kullanabilirsiniz.
verificationReminderSecond-sub-description-2 = İnterneti herkese açık bir yere dönüştürme misyonumuzun bir parçası olun.
verificationReminderSecond-action-2 = Hesabı onaylayın
verify-title-3 = İnternete { -brand-mozilla } ile açılın
verify-description-2 = Hesabınızı doğrulayın, giriş yaptığınız her yerde { -brand-mozilla }’dan daha iyi şekilde yararlanın. Kullandığınız cihaz:
verify-subject = Hesabınızı oluşturmayı tamamlayın
verify-action-2 = Hesabı onaylayın
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Bu kodun kullanım süresi { $expirationTime } dakika sonra dolacak.
       *[other] Bu kodun kullanım süresi { $expirationTime } dakika sonra dolacak.
    }
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] { $expirationTime } dakika sonra süresi dolacak.
       *[other] { $expirationTime } dakika sonra süresi dolacak.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = { $clientName } uygulamasına giriş yaptınız mı?
verifyLogin-description-2 = Hesabınızı güvende tutabilmemiz için giriş yaptığınızı onaylayın:
verifyLogin-subject-2 = Girişi onayla
verifyLogin-action = Girişi onayla
verifyLoginCode-preview = Kodun geçerlilik süresi 5 dakikadır.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = { $serviceName } hizmetine giriş yaptınız mı?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Girişinizi onaylayarak hesabınızı güvende tutmamıza yardımcı olun:
verifyLoginCode-prompt-3 = Yetkilendirme kodunuz:
verifyLoginCode-expiry-notice = Kodun geçerlilik süresi 5 dakikadır.
verifyPrimary-title-2 = Ana e-posta adresinizi doğrulayın
verifyPrimary-description = Aşağıdaki cihazdan bir hesap değiştirme isteği yapılmıştır:
verifyPrimary-subject = Ana e-posta adresini onayla
verifyPrimary-action-2 = E-postanızı doğrulayın
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Cihaz doğrulandıktan sonra, bu cihazdan ikinci e-posta ekleme gibi hesap değişiklikleri yapmak mümkün olacaktır.
verifySecondaryCode-preview = Kodun geçerlilik süresi 5 dakikadır.
verifySecondaryCode-title-2 = İkinci e-postayı onayla
verifySecondaryCode-action-2 = E-postanızı doğrulayın
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = { $email } adresini ikinci e-posta adresi olarak kullanmak için aşağıdaki { -product-mozilla-account }ndan bir istek yapıldı:
verifySecondaryCode-prompt-2 = Bu doğrulama kodunu kullanın:
verifySecondaryCode-expiry-notice-2 = Kodun geçerlilik süresi 5 dakikadır. Adres doğrulandıktan sonra güvenlik bildirimleri ve onaylar bu adrese de gönderilecektir.
verifyShortCode-preview-2 = Kodun geçerlilik süresi 5 dakikadır
verifyShortCode-title-3 = İnternete { -brand-mozilla } ile açılın
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Hesabınızı doğrulayın, giriş yaptığınız her yerde { -brand-mozilla }’dan daha iyi şekilde yararlanın. Kullandığınız cihaz:
verifyShortCode-prompt-3 = Bu doğrulama kodunu kullanın:
verifyShortCode-expiry-notice = Kodun geçerlilik süresi 5 dakikadır.
