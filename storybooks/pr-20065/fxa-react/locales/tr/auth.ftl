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
cancellationSurvey = Hizmetlerimizi iyileştirebilmemiz için bu <a data-l10n-name="cancellationSurveyUrl">kısa ankete</a> katılmanızı rica ederiz.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hizmetlerimizi iyileştirebilmemiz için kısa bir ankete katılmanızı rica ederiz:
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
subscription-charges-list-price = Liste fiyatı
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Liste fiyatı: { $offeringPrice }
subscription-charges-subtotal = <b>Ara toplam</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Ara toplam: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Tek seferlik indirim
subscription-charges-one-time-discount-plaintext = Tek seferlik indirim: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration } aylık indirim
       *[other] { $discountDuration } aylık indirim
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration } aylık indirim: { $invoiceDiscountAmount }
       *[other] { $discountDuration } aylık indirim: { $invoiceDiscountAmount }
    }
subscription-charges-discount = İndirim
subscription-charges-discount-plaintext = İndirim: { $invoiceDiscountAmount }
subscription-charges-taxes = Vergiler ve ücretler
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Vergiler ve ücretler: { $invoiceTaxAmount }
subscription-charges-total = <b>Toplam</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Toplam: { $invoiceTotal }
subscription-charges-credit-applied = Uygulanan kredi
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Uygulanan kredi: { $creditApplied }
subscription-charges-amount-paid = <b>Ödenen tutar</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Ödenen tutar: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Hesabınıza { $creditReceived } tutarında kredi geldi. Bu tutar gelecekteki faturalarınızdan düşülecektir.

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
view-invoice-link-action = Faturayı görüntüle
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Faturayı görüntüle: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = { $productName } aboneliğiniz iptal edildi
subscriptionAccountDeletion-title = Ayrılmanıza üzüldük
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Yakın zamanda { -product-mozilla-account }nızı sildiniz. Bu nedenle { $productName } aboneliğinizi iptal ettik. { $invoiceTotal } tutarındaki son ödemeniz { $invoiceDateOnly } tarihinde ödendi.
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
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = { $productName } aboneliğiniz yakında bitecek
subscriptionEndingReminder-title = { $productName } aboneliğiniz yakında bitecek
subscriptionEndingReminder-content-closing = Abone olduğunuz için teşekkürler!
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Destek ekibimizle iletişime geçin: { $subscriptionSupportUrlWithUtm }
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
subscriptionPaymentExpired-subject-2 = { $productName } için ödeme yönteminizin süresi doldu veya yakında dolacak
subscriptionPaymentExpired-title-2 = Ödeme yönteminizin kullanım süresi dolmuş veya dolmak üzere
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
subscriptionsPaymentExpired-subject-2 = Abonelikleriniz için kullandığınız ödeme yönteminin kullanım süresi dolmuş veya yakında dolacak
subscriptionsPaymentExpired-title-2 = Ödeme yönteminizin kullanım süresi dolmuş veya dolmak üzere
subscriptionsPaymentExpired-content-2 = Aşağıdaki abonelikler için kullandığınız ödeme yönteminin kullanım süresi dolmuş veya dolmak üzere.
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } abonelikleri için ödeme bilgilerinizi güncellemeniz gerekiyor
subscriptionsPaymentProviderCancelled-title = Kusura bakmayın, ödeme yönteminizle ilgili bir sorun yaşıyoruz
subscriptionsPaymentProviderCancelled-content-detected = Aşağıdaki abonelikler için ödeme yönteminizle ilgili bir sorun tespit ettik.
