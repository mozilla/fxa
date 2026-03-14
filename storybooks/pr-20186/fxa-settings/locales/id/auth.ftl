## Non-email strings

session-verify-send-push-title-2 = Masuk ke { -product-mozilla-account } Anda?
session-verify-send-push-body-2 = Klik di sini untuk mengonfirmasi bahwa ini memang Anda
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } adalah kode verifikasi { -brand-mozilla } Anda. Kedaluwarsa dalam 5 menit.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Kode verifikasi { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } adalah kode pemulihan { -brand-mozilla } Anda. Kedaluwarsa dalam 5 menit.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kode { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="logo { -brand-mozilla }">
subplat-automated-email = Email ini bersifat otomatis; jika menurut Anda email ini salah alamat, tidak ada tindakan yang harus dilakukan.
subplat-privacy-notice = Pemberitahuan privasi
subplat-privacy-plaintext = Pemberitahuan privasi:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Anda menerima surel ini karena { $email } memiliki { -product-mozilla-account } dan Anda mendaftar untuk { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Anda menerima surel ini karena { $email } memiliki { -product-mozilla-account }.
subplat-explainer-multiple-2 = Anda menerima surel ini karena { $email } memiliki { -product-mozilla-account } dan Anda telah berlangganan ke banyak produk.
subplat-explainer-was-deleted-2 = Anda menerima surel ini karena { $email } memiliki { -product-mozilla-account }.
subplat-manage-account-2 = Kelola pengaturan { -product-mozilla-account } Anda dengan mengunjungi <a data-l10n-name="subplat-account-page">laman akun</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Kelola pengaturan { -product-mozilla-account } Anda dengan mengunjungi laman akun Anda: { $accountSettingsUrl }
subplat-terms-policy = Ketentuan dan kebijakan pembatalan
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Batal berlangganan
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Aktivasi ulang langganan
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Perbarui informasi penagihan
subplat-privacy-policy = Kebijakan Privasi { -brand-mozilla }
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Pemberitahuan Privasi
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } Syarat Layanan
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privasi
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Bantu kami meningkatkan layanan kami dengan mengikuti <a data-l10n-name="cancellationSurveyUrl">survei singkat</a> ini.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Bantu kami meningkatkan layanan kami dengan mengikuti survei singkat ini:
payment-details = Rincian pembayaran:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Nomor Tagihan: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Ditagihkan: { $invoiceTotal } pada { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Tagihan Berikutnya: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

##

subscriptionSupport = Ada pertanyaan tentang langganan Anda? <a data-l10n-name="subscriptionSupportUrl">Tim dukungan</a> kami siap membantu Anda.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Ada pertanyaan tentang langganan Anda? Tim dukungan kami siap membantu Anda:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Terima kasih telah berlangganan { $productName }. Jika Anda memiliki pertanyaan tentang langganan atau memerlukan informasi lebih lanjut tentang { $productName }, silakan <a data-l10n-name="subscriptionSupportUrl">hubungi kami</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Terima kasih telah berlangganan { $productName }. Jika Anda memiliki pertanyaan tentang langganan Anda atau memerlukan informasi lebih lanjut tentang { $productName }, silakan hubungi kami:
subscriptionUpdateBillingEnsure = Anda dapat memastikan bahwa metode pembayaran dan informasi akun Anda adalah yang terbaru <a data-l10n-name="updateBillingUrl">di sini</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Anda dapat memastikan bahwa metode pembayaran dan informasi rekening Anda sudah diperbarui di sini:
subscriptionUpdateBillingTry = Kami akan mencoba memproses pembayaran Anda lagi dalam beberapa hari ke depan, tetapi Anda mungkin perlu <a data-l10n-name="updateBillingUrl">memperbarui informasi pembayaran Anda</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Kami akan mencoba memproses pembayaran Anda lagi dalam beberapa hari ke depan, tetapi Anda mungkin perlu memperbarui informasi pembayaran Anda.
subscriptionUpdatePayment = Untuk mencegah gangguan pada layanan Anda, silakan <a data-l10n-name="updateBillingUrl">perbarui informasi pembayaran Anda</a> sesegera mungkin.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Untuk mencegah gangguan pada layanan Anda, silakan perbarui informasi pembayaran Anda sesegera mungkin:
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Tampilkan Faktur: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Selamat datang di { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Selamat datang di { $productName }
downloadSubscription-content-2 = Mari mulai menggunakan semua fitur yang disertakan dalam langganan Anda:
downloadSubscription-link-action-2 = Mulai
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account } Anda telah dihapus
fraudulentAccountDeletion-title = Akun Anda telah dihapus
fraudulentAccountDeletion-content-part1-v2 = Baru-baru ini, { -product-mozilla-account } telah dibuat, dan langganan ditagihkan ke alamat surel ini. Seperti halnya semua akun baru, kami meminta Anda untuk mengonfirmasi akun dengan terlebih dahulu memverifikasi alamat surel ini.
fraudulentAccountDeletion-content-part2-v2 = Saat ini, kami melihat bahwa akun tersebut belum pernah dikonfirmasi. Karena langkah ini belum selesai, kami tidak yakin apakah ini adalah langganan yang sah. Akibatnya, { -product-mozilla-account } yang terdaftar pada surel ini telah dihapus dan langganan Anda dibatalkan, serta semua biaya telah dikembalikan.
fraudulentAccountDeletion-contact = Jika Anda memiliki pertanyaan, silakan hubungi <a data-l10n-name="mozillaSupportUrl">tim dukungan</a> kami.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Langganan { $productName } Anda telah dibatalkan
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Anda baru saja menghapus { -product-mozilla-account } Anda. Akibatnya, kami telah membatalkan langganan { $productName } Anda. Pembayaran terakhir Anda sebesar { $invoiceTotal } telah dibayarkan pada { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Pengingat: Selesaikan penyiapan akun Anda
subscriptionAccountReminderFirst-title = Anda belum dapat mengakses langganan Anda
subscriptionAccountReminderFirst-content-info-3 = Beberapa hari yang lalu, Anda membuat { -product-mozilla-account }, tetapi belum mengonfirmasinya. Kami harap Anda dapat menyelesaikan penyiapan akun agar dapat menggunakan langganan baru Anda.
subscriptionAccountReminderFirst-content-select-2 = Pilih “Buat Sandi” untuk menyiapkan sandi baru dan menyelesaikan konfirmasi akun Anda.
subscriptionAccountReminderFirst-action = Buat Sandi
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Pengingat terakhir: Siapkan akun Anda
subscriptionAccountReminderSecond-title-2 = Selamat datang di { -brand-mozilla }
subscriptionAccountReminderSecond-content-info-3 = Beberapa hari yang lalu, Anda membuat { -product-mozilla-account }, tetapi belum mengonfirmasinya. Kami harap Anda dapat menyelesaikan penyiapan akun agar dapat menggunakan langganan baru Anda.
subscriptionAccountReminderSecond-content-select-2 = Pilih “Buat Sandi” untuk menyiapkan sandi baru dan menyelesaikan konfirmasi akun Anda.
subscriptionAccountReminderSecond-action = Buat Sandi
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Langganan { $productName } Anda telah dibatalkan

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-outstanding-content-2 = Kami telah membatalkan langganan { $productName } Anda. Pembayaran terakhir Anda sebesar { $invoiceTotal } akan dibayarkan pada { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Layanan Anda akan berlanjut hingga akhir periode penagihan Anda saat ini, yaitu { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Anda telah beralih ke { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Anda telah berhasil beralih dari { $productNameOld } ke { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Mulai tagihan berikutnya, biaya langganan Anda akan berubah dari { $paymentAmountOld } per { $productPaymentCycleOld } menjadi { $paymentAmountNew } per { $productPaymentCycleNew }. Pada saat itu, Anda juga akan dikenakan biaya tambahan satu kali sebesar { $paymentProrated } untuk menyesuaikan perubahan tarif pada sisa periode { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Jika ada perangkat lunak baru untuk Anda pasang untuk menggunakan { $productName }, Anda akan menerima surel terpisah dengan petunjuk unduhan.
subscriptionDowngrade-content-auto-renew = Langganan Anda akan diperpanjang secara otomatis setiap periode penagihan kecuali Anda memilih untuk membatalkan.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Langganan { $productName } Anda telah dibatalkan
subscriptionFailedPaymentsCancellation-title = Langganan Anda telah dibatalkan
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Kami telah membatalkan langganan { $productName } Anda karena beberapa kali percobaan pembayaran gagal. Untuk mendapatkan akses lagi, mulailah berlangganan baru dengan metode pembayaran yang diperbarui.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pembayaran { $productName } dikonfirmasi
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Terima kasih telah berlangganan { $productName }
subscriptionFirstInvoice-content-processing = Pembayaran Anda sedang diproses dan mungkin membutuhkan waktu hingga empat hari kerja hingga selesai.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Anda akan menerima surel terpisah berisi panduan menggunakan { $productName }.
subscriptionFirstInvoice-content-auto-renew = Langganan Anda akan diperpanjang secara otomatis setiap periode penagihan kecuali Anda memilih untuk membatalkan.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Pembayaran { $productName } gagal
subscriptionPaymentFailed-title = Maaf, kami mengalami masalah dengan pembayaran Anda
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Kami mengalami masalah dengan pembayaran terakhir Anda untuk { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Pembaruan informasi pembayaran diperlukan untuk { $productName }
subscriptionPaymentProviderCancelled-title = Maaf, kami mengalami masalah dengan metode pembayaran Anda
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Kami mendeteksi adanya masalah dengan metode pembayaran Anda untuk { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Langganan { $productName } diaktifkan kembali
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Terima kasih telah mengaktifkan kembali langganan { $productName } Anda!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Siklus penagihan dan pembayaran Anda akan tetap sama. Tagihan Anda berikutnya sebesar { $invoiceTotal } pada { $nextInvoiceDateOnly }. Langganan Anda akan diperpanjang secara otomatis setiap periode penagihan kecuali Anda memilih untuk membatalkan.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Pemberitahuan perpanjangan otomatis { $productName }
subscriptionRenewalReminder-title = Langganan Anda akan segera diperbarui
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Pelanggan { $productName } yang terhormat,
subscriptionRenewalReminder-content-closing = Hormat kami,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Tim { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Pembayaran { $productName } diterima
subscriptionSubsequentInvoice-title = Terima kasih telah menjadi pelanggan!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Langganan Anda akan diperpanjang secara otomatis setiap periode penagihan kecuali Anda memilih untuk membatalkan.
subscriptionsPaymentProviderCancelled-subject = Pembaruan informasi pembayaran diperlukan untuk langganan { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Maaf, kami mengalami masalah dengan metode pembayaran Anda
subscriptionsPaymentProviderCancelled-content-detected = Kami telah mendeteksi masalah dengan metode pembayaran Anda untuk langganan berikut.
