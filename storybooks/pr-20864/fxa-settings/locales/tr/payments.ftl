# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Hesap ana sayfası
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Promosyon kodu uygulandı
coupon-submit = Uygula
coupon-remove = Kaldır
coupon-error = Girdiğiniz kod geçersiz veya süresi dolmuş.
coupon-error-generic = Kod işlenirken bir hata oluştu. Lütfen tekrar deneyin.
coupon-error-expired = Girdiğiniz kodun süresi dolmuş.
coupon-error-limit-reached = Girdiğiniz kodun kullanım limiti doldu.
coupon-error-invalid = Girdiğiniz kod geçersiz.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Kodu yazın

## Component - Fields

default-input-error = Bu alan gereklidir
input-error-is-required = { $label } gereklidir

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } logosu

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Zaten  { -product-mozilla-account }nız var mı? <a>Giriş yapın</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = E-posta adresinizi yazın
new-user-confirm-email =
    .label = E-postanızı doğrulayın
new-user-subscribe-product-updates-mozilla = { -brand-mozilla }’dan ürün haberleri ve duyuruları almak istiyorum
new-user-subscribe-product-updates-snp = { -brand-mozilla }’dan güvenlik ve gizlilik ile ilgili haberleri ve duyuruları almak istiyorum
new-user-subscribe-product-updates-hubs = { -product-mozilla-hubs } ve { -brand-mozilla }’dan ürün haberleri ve duyuruları almak istiyorum
new-user-subscribe-product-updates-mdnplus = { -brand-mozilla } ve { -product-mdn-plus }’tan ürün haberleri ve duyuruları almak istiyorum
new-user-subscribe-product-assurance = E-postanızı yalnızca hesabınızı açmak için kullanıyoruz. Asla üçüncü şahıslara satmıyoruz.
new-user-email-validate = E-posta geçerli değil
new-user-email-validate-confirm = E-postalar eşleşmiyor
new-user-already-has-account-sign-in = Zaten bir hesabınız var. <a>Giriş yapın</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = E-postanızı yanlış mı yazdınız? { $domain } e-posta hizmeti vermiyor.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Teşekkürler!
payment-confirmation-thanks-heading-account-exists = Teşekkürler, şimdi e-postanızı kontrol edin!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = { $email } adresine { $product_name } ürününü kullanmaya nasıl başlayacağınızla ilgili ayrıntıları içeren bir onay e-postası gönderildi.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = { $email } adresine, hesabınızın kurulumuna ilişkin talimatların yanı sıra ödeme ayrıntılarınızı içeren bir e-posta göndereceğiz.
payment-confirmation-order-heading = Sipariş ayrıntıları
payment-confirmation-invoice-number = Fatura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Ödeme bilgileri
payment-confirmation-amount = { $interval } { $amount }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] Günlük { $amount }
       *[other] { $intervalCount } günde bir { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] Haftalık { $amount }
       *[other] { $intervalCount } haftada bir { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] Aylık { $amount }
       *[other] { $intervalCount } ayda bir { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] Yıllık { $amount }
       *[other] { $intervalCount } yılda bir { $amount }
    }
payment-confirmation-download-button = İndirmeye devam et

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = { -brand-mozilla }’nın <termsOfServiceLink>Hizmet Koşulları</termsOfServiceLink> ve <privacyNoticeLink>Gizlilik Bildirimi</privacyNoticeLink> kapsamında, ben aboneliğimi iptal edene dek, belirlediğim ödeme yöntemiyle aşağıda belirtilen tutarda ödeme almasını onaylıyorum.
payment-confirm-checkbox-error = Devam etmek için bunu kabul etmeniz gerekiyor

## Component - PaymentErrorView

payment-error-retry-button = Tekrar dene
payment-error-manage-subscription-button = Aboneliğimi yönet

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Zaten { -brand-google } veya { -brand-apple } uygulama mağazası aracılığıyla alınmış bir { $productName } aboneliğiniz var.
iap-upgrade-no-bundle-support = Bu abonelikler için yükseltmeleri desteklemiyoruz ancak yakında destekleyeceğiz.
iap-upgrade-contact-support = Bu ürünü yine de alabilirsiniz. Size yardımcı olabilmemiz için lütfen destek ile iletişime geçin.
iap-upgrade-get-help-button = Yardım alın

## Component - PaymentForm

payment-name =
    .placeholder = Adınız ve soyadınız
    .label = Kartınızda göründüğü şekliyle adınız
payment-cc =
    .label = Kartınız
payment-cancel-btn = İptal et
payment-update-btn = Güncelle
payment-pay-btn = Ödeme yap
payment-pay-with-paypal-btn-2 = { -brand-paypal } ile öde
payment-validate-name-error = Lütfen adınızı girin

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } güvenli ödeme işlemleri için { -brand-name-stripe } ve { -brand-paypal } kullanır.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } gizlilik ilkeleri</stripePrivacyLink> ve <paypalPrivacyLink>{ -brand-paypal } gizlilik ilkeleri</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } güvenli ödeme işlemleri için { -brand-paypal } kullanır.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } gizlilik ilkeleri</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } güvenli ödeme işlemleri için { -brand-name-stripe } kullanır.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } gizlilik ilkeleri</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Ödeme yönteminizi seçin
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Öncelikle aboneliğinizi onaylamanız gerekiyor

## Component - PaymentProcessing

payment-processing-message = Ödemeniz işleme alınıyor. Lütfen bekleyin…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = { $last4 } ile biten kart

## Component - PayPalButton

pay-with-heading-paypal-2 = { -brand-paypal } ile öde

## Component - PlanDetails

plan-details-header = Ürün ayrıntıları
plan-details-list-price = Liste fiyatı
plan-details-show-button = Ayrıntıları göster
plan-details-hide-button = Ayrıntıları gizle
plan-details-total-label = Toplam
plan-details-tax = Vergiler ve ücretler

## Component - PlanErrorDialog

product-no-such-plan = Bu ürün için böyle bir plan yok.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } vergi
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] Günlük { $priceAmount }
       *[other] { $intervalCount } günde bir { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] Günlük { $priceAmount }
           *[other] { $intervalCount } günde bir { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] Haftalık { $priceAmount }
       *[other] { $intervalCount } haftada bir { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] Haftalık { $priceAmount }
           *[other] { $intervalCount } haftada bir { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] Aylık { $priceAmount }
       *[other] { $intervalCount } ayda bir { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] Aylık { $priceAmount }
           *[other] { $intervalCount } ayda bir { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] Yıllık { $priceAmount }
       *[other] { $intervalCount } yılda bir { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] Yıllık { $priceAmount }
           *[other] { $intervalCount } yılda bir { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] Günlük { $priceAmount } + { $taxAmount } vergi
       *[other] { $intervalCount } günde bir { $priceAmount } + { $taxAmount } vergi
    }
    .title =
        { $intervalCount ->
            [one] Günlük { $priceAmount } + { $taxAmount } vergi
           *[other] { $intervalCount } günde bir { $priceAmount } + { $taxAmount } vergi
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] Haftalık { $priceAmount } + { $taxAmount } vergi
       *[other] { $intervalCount } haftada bir { $priceAmount } + { $taxAmount } vergi
    }
    .title =
        { $intervalCount ->
            [one] Haftalık { $priceAmount } + { $taxAmount } vergi
           *[other] { $intervalCount } haftada bir { $priceAmount } + { $taxAmount } vergi
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] Aylık { $priceAmount } + { $taxAmount } vergi
       *[other] { $intervalCount } ayda bir { $priceAmount } + { $taxAmount } vergi
    }
    .title =
        { $intervalCount ->
            [one] Aylık { $priceAmount } + { $taxAmount } vergi
           *[other] { $intervalCount } ayda bir { $priceAmount } + { $taxAmount } vergi
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] Yıllık { $priceAmount } + { $taxAmount } vergi
       *[other] { $intervalCount } yılda bir { $priceAmount } + { $taxAmount } vergi
    }
    .title =
        { $intervalCount ->
            [one] Yıllık { $priceAmount } + { $taxAmount } vergi
           *[other] { $intervalCount } yılda bir { $priceAmount } + { $taxAmount } vergi
        }

## Component - SubscriptionTitle

subscription-create-title = Aboneliğinizi ayarlayın
subscription-success-title = Abonelik onayı
subscription-processing-title = Abonelik onaylanıyor…
subscription-error-title = Abonelik onaylanırken hata oluştu…
subscription-noplanchange-title = Bu abonelik planı değişikliği desteklemiyor
subscription-iapsubscribed-title = Zaten abonesiniz
sub-guarantee = 30 gün para iade garantisi

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Kullanım Koşulları
privacy = Gizlilik Bildirimi
terms-download = İndirme Koşulları

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Hesapları
# General aria-label for closing modals
close-aria =
    .aria-label = Kutuyu kapat
settings-subscriptions-title = Abonelikler
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Promosyon kodu

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] Günlük { $amount }
       *[other] { $intervalCount } günde bir { $amount }
    }
    .title =
        { $intervalCount ->
            [one] Günlük { $amount }
           *[other] { $intervalCount } günde bir { $amount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] Haftalık { $amount }
       *[other] { $intervalCount } haftada bir { $amount }
    }
    .title =
        { $intervalCount ->
            [one] Haftalık { $amount }
           *[other] { $intervalCount } haftada bir { $amount }
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] Aylık { $amount }
       *[other] { $intervalCount } ayda bir { $amount }
    }
    .title =
        { $intervalCount ->
            [one] Aylık { $amount }
           *[other] { $intervalCount } ayda bir { $amount }
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] Yıllık { $amount }
       *[other] { $intervalCount } yılda bir { $amount }
    }
    .title =
        { $intervalCount ->
            [one] Yıllık { $amount }
           *[other] { $intervalCount } yılda bir { $amount }
        }

## Error messages

# App error dialog
general-error-heading = Genel uygulama hatası
basic-error-message = Bir şeyler yanlış gitti. Lütfen daha sonra tekrar deneyin.
payment-error-1 = Ödemeniz onaylanırken bir sorun oluştu. Tekrar deneyin ya da kartınızı veren kuruluşla iletişime geçin.
payment-error-2 = Ödemeniz onaylanırken bir sorun oluştu. Kartınızı veren kuruluşla iletişime geçin.
payment-error-3b = Ödemeniz işlenirken beklenmedik bir hata oluştu, lütfen tekrar deneyin.
expired-card-error = Kredi kartınızın kullanım süresi dolmuş. Başka bir kart deneyin.
insufficient-funds-error = Kartınızda yeterli bakiye yok gibi görünüyor. Başka bir kart deneyin.
withdrawal-count-limit-exceeded-error = Bu işlem kredi limitinizi aşacak gibi görünüyor. Başka bir kart deneyin.
charge-exceeds-source-limit = Bu işlem günlük kredi limitinizi aşacak gibi görünüyor. 24 saat sonra tekrar deneyin ya da başka bir kart deneyin.
instant-payouts-unsupported = Banka kartınız anında ödeme için ayarlanmamış. Başka bir banka veya kredi kartı deneyin.
duplicate-transaction = Benzer bir işlem yeni gönderilmiş gibi görünüyor. Ödeme geçmişinizi kontrol edin.
coupon-expired = Promosyon kodunun süresi dolmuş.
card-error = İşleminiz gerçekleştirilemedi. Lütfen kredi kartı bilgilerinizi kontrol edip tekrar deneyin.
country-currency-mismatch = Bu aboneliğin para birimi, ödemenizle ilişkili ülke için geçerli değil.
currency-currency-mismatch = Üzgünüz, para birimleri arasında geçiş yapamazsınız.
location-unsupported = Hizmet Koşullarımız kapsamında şu anki konumunuz desteklenmiyor.
no-subscription-change = Maalesef abonelik planınızı değiştiremezsiniz.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = { $mobileAppStore } üzerinden zaten abone oldunuz.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Bir sistem hatası nedeniyle { $productName } kaydınız başarısız oldu. Ödeme yönteminizden ücret alınmadı. Lütfen tekrar deneyin.
fxa-post-passwordless-sub-error = Abonelik onaylandı, ancak onay sayfası yüklenemedi. Hesabınızı ayarlamak için lütfen e-postanızı kontrol edin.
newsletter-signup-error = Ürün güncelleme e-postalarına kayıtlı değilsiniz. Hesap ayarlarınızda tekrar deneyebilirsiniz.
product-plan-error =
    .title = Planlar yüklenirken sorun oluştu
product-profile-error =
    .title = Profil yüklenirken sorun oluştu
product-customer-error =
    .title = Müşteri yüklenirken sorun oluştu
product-plan-not-found = Plan bulunamadı
product-location-unsupported-error = Konum desteklenmiyor

## Hooks - coupons

coupon-success = Planınız liste fiyatı üzerinden otomatik olarak yenilenecektir.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Planınız { $couponDurationDate } tarihinden sonra liste fiyatı üzerinden otomatik olarak yenilenecek.

## Routes - Checkout - New user

new-user-step-1-2 = 1. { -product-mozilla-account } oluşturun
new-user-card-title = Kart bilgilerinizi girin
new-user-submit = Şimdi abone ol

## Routes - Product and Subscriptions

sub-update-payment-title = Ödeme bilgileri

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Kartla öde
product-invoice-preview-error-title = Fatura ön izlemesi yüklenirken sorun oluştu
product-invoice-preview-error-text = Fatura ön izlemesi yüklenemedi

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Sizi henüz yükseltemiyoruz

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Değişikliğinizi gözden geçirin
sub-change-failed = Plan değişikliği başarısız oldu
sub-update-acknowledgment = Planınız hemen değişecek ve bu fatura döneminin kalan süresi için hesaplanan ek ücret tahsil edilecektir. { $startingDate } tarihinden itibaren tam ücret tahsil edilecektir.
sub-change-submit = Değişikliği onaylayın
sub-update-current-plan-label = Geçerli plan
sub-update-new-plan-label = Yeni plan
sub-update-total-label = Yeni toplam
sub-update-prorated-upgrade = Orantılı yükseltme

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (Günlük)
sub-update-new-plan-weekly = { $productName } (Haftalık)
sub-update-new-plan-monthly = { $productName } (Aylık)
sub-update-new-plan-yearly = { $productName } (Yıllık)
sub-update-prorated-upgrade-credit = Gördüğünüz negatif bakiye, hesabınıza alacak olarak tanımlanacak ve gelecekteki faturalardan düşülecektir.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Aboneliği iptal et
sub-item-stay-sub = Aboneliğimi sürdür

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg = Faturanızın son günü olan { $period } tarihinden sonra { $name } ürününü kullanamayacaksınız.
sub-item-cancel-confirm = { $name } ürününe erişimimi ve kayıtlı bilgilerimi { $period } tarihinde iptal et
# $promotion_name (String) - The name of the promotion.
# The <priceDetails></priceDetails> component acts as a placeholder and could use one of the following IDs:
# price-details-tax-${interval},
# price-details-no-tax-${interval},
# price-details-tax,
# price-details-no-tax
# Examples:
# 20% OFF coupon applied: $11.20 + $0.35 tax monthly
# Holiday Offer 2023 coupon applied: $11.20 monthly
# Cybersecurity Awareness Month 2023 coupon applied: $11.20 + $0.35 tax
# Summer Promo VPN coupon applied: $11.20
sub-promo-coupon-applied = { $promotion_name } kuponu uygulandı: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Bu abonelik ödemesi sonucunda hesap bakiyenize kredi eklendi: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Aboneliği yeniden etkinleştirme başarısız oldu
sub-route-idx-cancel-failed = Abonelik iptal edilemedi
sub-route-idx-contact = Destek birimine ulaş
sub-route-idx-cancel-msg-title = Gitmenize üzüldük
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    { $name } aboneliğiniz iptal edildi.
          <br />
          { $date } tarihine kadar { $name } ürününe erişmeye devam edeceksiniz.
sub-route-idx-cancel-aside-2 = Sorularınız mı var? <a>{ -brand-mozilla } Destek sayfasını</a> ziyaret edin.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Müşteri yüklenirken sorun oluştu
sub-invoice-error =
    .title = Faturalar yüklenirken sorun oluştu
sub-billing-update-success = Fatura bilgileriniz başarıyla güncellendi
sub-invoice-previews-error-title = Fatura ön izlemeleri yüklenirken sorun oluştu
sub-invoice-previews-error-text = Fatura ön izlemeleri yüklenemedi

## Routes - Subscription - ActionButton

pay-update-change-btn = Değiştir
pay-update-manage-btn = Yönet

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Bir sonraki faturalandırma: { $date }
sub-next-bill-due-date = Bir sonraki fatura tarihi: { $date }
sub-expires-on = Son geçerlilik tarihi: { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Son kullanım: { $expirationDate }
sub-route-idx-updating = Fatura bilgileri güncelleniyor…
sub-route-payment-modal-heading = Geçersiz fatura bilgileri
sub-route-payment-modal-message-2 = { -brand-paypal } hesabınızda bir sorun var gibi görünüyor. Bu ödeme sorununu çözmek için gerekli adımları atmanız gerekiyor.
sub-route-missing-billing-agreement-payment-alert = Geçersiz ödeme bilgileri: Hesabınızla ilgili bir sorun var. <div>Yönet</div>
sub-route-funding-source-payment-alert = Geçersiz ödeme bilgisi: Hesabınızla ilgili bir hata var. Bilgilerinizi güncelledikten sonra bu uyarının temizlenmesi biraz zaman alabilir. <div>Yönet</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Bu abonelik için böyle bir plan yok.
invoice-not-found = Sonraki fatura bulunamadı
sub-item-no-such-subsequent-invoice = Bu abonelik için sonraki fatura bulunamadı.
sub-invoice-preview-error-title = Fatura ön izlemesi bulunamadı
sub-invoice-preview-error-text = Bu abonelik için fatura ön izlemesi bulunamadı

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = { $name } ürününü kullanmaya devam etmek ister misiniz?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy = { $name } ürününe erişiminiz devam edecek ve faturalandırma döngünüz ve ödemeniz aynı kalacaktır. Bir sonraki ödemeniz { $endDate } tarihinde { $last } ile biten kartınızdan { $amount } olacaktır.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy = { $name } ürününe erişiminiz devam edecek ve faturalandırma döngünüz ve ödemeniz aynı kalacaktır. Bir sonraki ödemeniz { $endDate } tarihinde { $amount } olacaktır.
reactivate-confirm-button = Yeniden abone ol

## $date (Date) - Last day of product access

reactivate-panel-copy = <strong>{ $date }</strong> tarihinde { $name } ürününe erişiminiz sona erecek.
reactivate-success-copy = Teşekkürler! Artık hazırsınız.
reactivate-success-button = Kapat

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Uygulama içi satın alma
sub-iap-item-apple-purchase-2 = { -brand-apple }: Uygulama içi satın alma
sub-iap-item-manage-button = Yönet
