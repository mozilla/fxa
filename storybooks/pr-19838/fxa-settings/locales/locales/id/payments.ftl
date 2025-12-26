# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Beranda Akun
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Kode Promo Diterapkan
coupon-submit = Terapkan
coupon-remove = Hapus
coupon-error = Kode yang Anda masukkan tidak valid atau kedaluwarsa.
coupon-error-generic = Terjadi kesalahan saat memproses kode. Silakan coba lagi.
coupon-error-expired = Kode yang Anda masukkan sudah kedaluwarsa.
coupon-error-limit-reached = Kode yang Anda masukkan telah mencapai batasnya.
coupon-error-invalid = Kode yang Anda masukkan tidak valid.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Masukkan Kode

## Component - Fields

default-input-error = Bidang ini wajib diisi.
input-error-is-required = { $label } diperlukan

## Component - Header

brand-name-mozilla-logo = Logo { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Sudah memiliki { -product-mozilla-account }? <a>Masuk</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Masukkan surel Anda
new-user-confirm-email =
    .label = Konfirmasi surel Anda
new-user-subscribe-product-updates-mozilla = Saya ingin menerima berita dan pembaruan produk dari { -brand-mozilla }
new-user-subscribe-product-assurance = Kami hanya menggunakan alamat surel Anda untuk membuat akun. Kami tidak akan pernah menjualnya kepada pihak ketiga.
new-user-email-validate = Surel tidak valid
new-user-email-validate-confirm = Surel tidak cocok
new-user-already-has-account-sign-in = Anda sudah memiliki akun. <a>Masuk</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Salah ketik surel? { $domain } tidak menawarkan surel.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Terima kasih!
payment-confirmation-thanks-heading-account-exists = Terima kasih, sekarang periksa surel Anda!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Surel konfirmasi telah dikirim ke { $email } dengan detail tentang cara memulai { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Anda akan menerima surel di { $email } dengan instruksi untuk menyiapkan akun Anda, serta detail pembayaran Anda.
payment-confirmation-order-heading = Detail pesanan
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informasi pembayaran
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day = { $amount } setiap { $intervalCount } hari
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week = { $amount } setiap { $intervalCount } pekan
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month = { $amount } setiap { $intervalCount } bulan
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year = { $amount } setiap { $intervalCount } tahun
payment-confirmation-download-button = Lanjutkan mengunduh

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = Coba lagi
payment-error-manage-subscription-button = Kelola langganan saya

## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm

payment-name =
    .placeholder = Nama Lengkap
    .label = Nama yang tertera pada kartu Anda
payment-cc =
    .label = Kartu anda
payment-cancel-btn = Batal
payment-update-btn = Perbarui
payment-pay-btn = Bayar sekarang
payment-pay-with-paypal-btn-2 = Bayar dengan { -brand-paypal }
payment-validate-name-error = Masukkan nama Anda.

## Component - PaymentLegalBlurb

payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } kebijakan privasi</paypalPrivacyLink>
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } kebijakan privasi</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Pilih metode pembayaran Anda
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }

## Component - PaymentProcessing

payment-processing-message = Mohon tunggu sementara kami memproses pembayaran Anda…

## Component - PaymentProviderDetails


## Component - PayPalButton

pay-with-heading-paypal-2 = Bayar dengan { -brand-paypal }

## Component - PlanDetails

plan-details-list-price = Daftar Harga
plan-details-show-button = Tampilkan detail
plan-details-tax = Pajak dan Biaya

## Component - PlanErrorDialog

product-no-such-plan = Tidak ada paket untuk produk ini.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + pajak { $taxAmount }

## Component - SubscriptionTitle

subscription-success-title = Konfirmasi berlangganan

## Component - TermsAndPrivacy

terms = Ketentuan Layanan
privacy = Pemberitahuan Privasi
terms-download = Unduh Ketentuan

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = Tutup
settings-subscriptions-title = Langganan
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Kode Promo

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Kesalahan aplikasi umum
basic-error-message = Terjadi kesalahan. Silakan coba lagi nanti.
payment-error-1 = Hmm. Terjadi masalah saat mengotorisasi pembayaran Anda. Coba lagi atau hubungi penerbit kartu Anda.
payment-error-2 = Hmm. Terjadi masalah saat mengotorisasi pembayaran Anda. Hubungi penerbit kartu Anda.
expired-card-error = Sepertinya kartu kredit Anda telah kedaluwarsa. Coba kartu lain.
insufficient-funds-error = Sepertinya kartu Anda tidak memiliki dana yang mencukupi. Coba kartu lain.
withdrawal-count-limit-exceeded-error = Sepertinya besaran transaksi ini melebihi batas kredit Anda. Coba kartu lain.
charge-exceeds-source-limit = Sepertinya besaran transaksi ini melebihi batas kredit harian Anda. Gunakan kartu lain atau coba lagi dalam 24 jam.
instant-payouts-unsupported = Sepertinya kartu debit Anda tidak disiapkan untuk pembayaran instan. Coba kartu debit atau kredit lain.
duplicate-transaction = Hmm. Sepertinya transaksi identik baru saja dikirim. Periksa riwayat pembayaran Anda.
coupon-expired = Sepertinya kode promo telah kedaluwarsa.
card-error = Transaksi Anda tidak dapat diproses. Harap verifikasi informasi kartu kredit Anda dan coba lagi.
country-currency-mismatch = Mata uang untuk langganan ini tidak berlaku di negara yang terkait dengan pembayaran Anda.
currency-currency-mismatch = Maaf. Anda tidak dapat beralih antar mata uang.
location-unsupported = Lokasi Anda saat ini tidak didukung menurut Ketentuan Layanan kami.
no-subscription-change = Maaf. Anda tidak dapat mengubah paket langganan Anda.
product-plan-error =
    .title = Bermasalah saat memuat rincian paket
product-profile-error =
    .title = Bermasalah saat memuat profil
product-customer-error =
    .title = Bermasalah saat memuat pelanggan
product-plan-not-found = Paket tidak ditemukan

## Hooks - coupons


## Routes - Checkout - New user

new-user-card-title = Masukkan informasi kartu Anda

## Routes - Product and Subscriptions

sub-update-payment-title = Informasi pembayaran

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate


## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade

product-plan-change-heading = Tinjau perubahan Anda
sub-change-submit = Konfirmasi perubahan
sub-update-current-plan-label = Paket saat ini
sub-update-new-plan-label = Paket baru
sub-update-total-label = Total baru

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-yearly = { $productName } (Tahunan)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Batal Berlangganan
sub-item-stay-sub = Tetap Berlangganan

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Anda tidak akan dapat menggunakan { $name } setelah
    { $period }, hari terakhir dari siklus berlangganan Anda.

## Routes - Subscription

sub-route-idx-cancel-failed = Gagal membatalkan langganan
sub-route-idx-contact = Hubungi Bantuan

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Bermasalah saat memuat pelanggan
sub-billing-update-success = Informasi penagihan Anda telah berhasil diperbarui

## Routes - Subscription - ActionButton

pay-update-change-btn = Ubah
pay-update-manage-btn = Kelola

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Tagihan berikutnya pada { $date }
sub-expires-on = Kedaluwarsa pada { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Habis berlaku pada { $expirationDate }
sub-route-idx-updating = Memperbarui informasi penagihan…

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Tidak ada paket untuk langganan ini.

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Ingin tetap menggunakan { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Akses Anda ke { $name } akan berlanjut, dan siklus tagihan
    dan pembayaran Anda akan tetap sama. Pembayaran selanjutnya sebesar
    { $amount } ditagihkan pada kartu berakhiran { $last } pada { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Akses Anda ke { $name } akan berlanjut, dan siklus tagihan
    dan pembayaran Anda akan tetap sama. Pembayaran selanjutnya sebesar
    { $amount } akan dilakukan pada { $endDate }.
reactivate-confirm-button = Berlangganan kembali

## $date (Date) - Last day of product access

reactivate-panel-copy = Anda akan kehilangan akses ke { $name } pada <strong>{ $date }</strong>.
reactivate-success-copy = Terima kasih! Anda sudah siap.
reactivate-success-button = Tutup

## Routes - Subscriptions - Subscription iap item

sub-iap-item-apple-purchase-2 = { -brand-apple }: Pembelian dalam Aplikasi
sub-iap-item-manage-button = Kelola
