## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Perangkat">
fxa-privacy-url = Kebijakan Privasi { -brand-mozilla }
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Pemberitahuan Privasi
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } Syarat Layanan
account-deletion-info-block-communications = Jika akun Anda dihapus, Anda masih akan menerima surel dari Mozilla Corporation dan Mozilla Foundation, kecuali jika Anda <a data-l10n-name="unsubscribeLink">meminta untuk berhenti berlangganan</a>.
account-deletion-info-block-support = Jika Anda memiliki pertanyaan atau memerlukan bantuan, jangan ragu untuk menghubungi <a data-l10n-name="supportLink">tim dukungan</a> kami.
account-deletion-info-block-communications-plaintext = Jika akun Anda dihapus, Anda masih akan menerima surel dari Mozilla Corporation dan Mozilla Foundation, kecuali jika Anda meminta untuk berhenti berlangganan:
account-deletion-info-block-support-plaintext = Jika Anda memiliki pertanyaan atau memerlukan bantuan, jangan ragu untuk menghubungi tim dukungan kami:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Unduh { $productName } di { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Unduh { $productName } di { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Pasang { $productName } di <a data-l10n-name="anotherDeviceLink">perangkat desktop lain</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Pasang { $productName } di <a data-l10n-name="anotherDeviceLink">perangkat lain</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Dapatkan { $productName } di Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Unduh { $productName } di App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Pasang { $productName } di perangkat lain:
automated-email-change-2 = Jika Anda tidak melakukannya, <a data-l10n-name="passwordChangeLink">ubah sandi Anda</a> segera.
automated-email-support = Untuk info lebih lanjut, kunjungi <a data-l10n-name="supportLink">Dukungan { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Jika anda tidak merasa melakukan tindakan ini, ubah sandi Anda sekarang juga:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Untuk info lebih lanjut, kunjungi Dukungan { -brand-mozilla }:
automated-email-inactive-account = Ini adalah surel otomatis. Anda menerimanya karena Anda memiliki { -product-mozilla-account } dan sudah 2 tahun sejak terakhir kali Anda masuk.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Untuk info lebih lanjut, kunjungi <a data-l10n-name="supportLink">Dukungan { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Ini adalah surel otomatis. Jika Anda menerimanya secara tidak sengaja, Anda tidak perlu melakukan apa pun.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ini adalah surel otomatis; jika Anda tidak mengotorisasi tindakan ini, silakan ubah kata sandi Anda:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Permintaan ini berasal dari { $uaBrowser } pada { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Permintaan ini berasal dari { $uaBrowser } pada { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Permintaan ini berasal dari { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Permintaan ini berasal dari { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Permintaan ini berasal dari { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Jika ini bukan Anda, <a data-l10n-name="revokeAccountRecoveryLink">hapus kunci baru</a> dan <a data-l10n-name="passwordChangeLink">ubah sandi Anda</a>.
automatedEmailRecoveryKey-change-pwd-only = Jika ini bukan Anda, <a data-l10n-name="passwordChangeLink">ubah sandi Anda</a>.
automatedEmailRecoveryKey-more-info = Untuk info lebih lanjut, kunjungi <a data-l10n-name="supportLink">Dukungan { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Permintaan ini berasal dari:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Jika ini bukan Anda, hapus kunci baru:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Jika ini bukan Anda, ubah sandi Anda:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = dan ubah sandi Anda:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Untuk info lebih lanjut, kunjungi Dukungan { -brand-mozilla }:
automated-email-reset =
    Ini adalah surel otomatis; jika Anda tidak mengotorisasi tindakan ini, maka <a data-l10n-name="resetLink">silakan setel ulang sandi Anda</a>.
    Untuk informasi lebih lanjut, silakan kunjungi <a data-l10n-name="supportLink">Dukungan { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Jika Anda tidak melakukan tindakan ini, segera ubah kata sandi Anda di { $resetLink }
brand-banner-message = Tahukah Anda bahwa kami mengubah nama kami dari { -product-firefox-accounts } menjadi { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Pelajari lebih lanjut</a>
change-password-plaintext = Jika Anda mencurigai seseorang berusaha mendapatkan akses ke akun Anda, silakan ubah kata sandi Anda.
manage-account = Kelola akun
manage-account-plaintext = { manage-account }:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } di { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } di { $uaOS }
cadReminderFirst-subject-1 = Pengingat! Sinkronkan { -brand-firefox }
cadReminderFirst-action = Sinkronkan perangkat lain
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Sinkronisasi memerlukan dua perangkat.
cadReminderFirst-description-v2 = Akses tab Anda di semua perangkat. Dapatkan markah, sandi, dan data lainnya di mana pun Anda menggunakan { -brand-firefox }.
cadReminderSecond-subject-2 = Jangan lewatkan! Selesaikan pengaturan sinkronisasi Anda sekarang.
cadReminderSecond-action = Sinkronkan perangkat lain
cadReminderSecond-title-2 = Jangan lupa untuk sinkronisasi!
cadReminderSecond-description-sync = Sinkronkan markah, kata sandi, tab terbuka dan lainnya — di mana pun Anda menggunakan { -brand-firefox }.
cadReminderSecond-description-plus = Plus, data Anda selalu dienkripsi. Hanya Anda dan perangkat yang Anda setujui yang dapat melihatnya.
inactiveAccountFinalWarning-subject = Kesempatan terakhir untuk mempertahankan { -product-mozilla-account } Anda
inactiveAccountFinalWarning-title = Akun dan data { -brand-mozilla } Anda akan dihapus
inactiveAccountFinalWarning-preview = Masuk agar akun Anda tetap aktif
inactiveAccountFinalWarning-account-description = Akun { -product-mozilla-account } Anda digunakan untuk mengakses produk privasi dan penjelajahan gratis seperti sinkronisasi { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay }, dan { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Pada <strong>{ $deletionDate }</strong>, akun dan data pribadi Anda akan dihapus secara permanen, kecuali jika Anda masuk.
inactiveAccountFinalWarning-action = Masuk agar akun Anda tetap aktif
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Masuk agar akun Anda tetap aktif:
inactiveAccountFirstWarning-subject = Jangan biarkan akun Anda hilang
inactiveAccountFirstWarning-title = Ingin menyimpan akun dan data { -brand-mozilla } Anda?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account } Anda digunakan untuk mengakses privasi gratis dan produk penjelajahan seperti sinkronisasi { -brand-firefox }, { -product-mozilla-monitor } { -product-firefox-relay } dan { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Kami melihat Anda belum masuk selama 2 tahun.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Akun dan data pribadi Anda akan dihapus secara permanen pada <strong>{ $deletionDate }</strong> karena tidak ada aktivitas di akun Anda.
inactiveAccountFirstWarning-action = Masuk agar akun Anda tetap aktif
inactiveAccountFirstWarning-preview = Masuk agar akun Anda tetap aktif
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Masuk agar akun Anda tetap aktif:
inactiveAccountSecondWarning-subject = Tindakan diperlukan: Akun akan dihapus dalam 7 hari
inactiveAccountSecondWarning-title = Akun dan data { -brand-mozilla } Anda akan dihapus dalam 7 hari
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account } Anda digunakan untuk mengakses privasi gratis dan produk penjelajahan seperti sinkronisasi { -brand-firefox }, { -product-mozilla-monitor } { -product-firefox-relay } dan { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Akun dan data pribadi Anda akan dihapus secara permanen pada <strong>{ $deletionDate }</strong> karena tidak ada aktivitas di akun Anda.
inactiveAccountSecondWarning-action = Masuk agar akun Anda tetap aktif
inactiveAccountSecondWarning-preview = Masuk agar akun Anda tetap aktif
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Masuk agar akun Anda tetap aktif:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Anda kehabisan kode autentikasi cadangan!
codes-reminder-title-one = Anda menggunakan kode autentikasi cadangan terakhir
codes-reminder-title-two = Saatnya membuat kode autentikasi cadangan tambahan
codes-reminder-description-part-one = Kode autentikasi cadangan membantu Anda memulihkan informasi saat Anda lupa sandi.
codes-reminder-description-part-two = Buat kode baru sekarang agar Anda tidak kehilangan data Anda nanti.
codes-reminder-description-two-left = Anda hanya memiliki dua kode tersisa.
codes-reminder-description-create-codes = Buat kode otentikasi cadangan baru untuk membantu Anda masuk kembali ke akun Anda jika Anda terkunci.
lowRecoveryCodes-action-2 = Buat kode
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Tidak ada kode otentikasi yang tersisa
       *[other] Hanya { $numberRemaining } kode otentikasi cadangan yang tersisa!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Info masuk baru ke { $clientName }
newDeviceLogin-subjectForMozillaAccount = Info masuk baru ke { -product-mozilla-account } Anda
newDeviceLogin-title-3 = { -product-mozilla-account } Anda digunakan untuk masuk
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Bukan Anda? <a data-l10n-name="passwordChangeLink">Ubah sandi Anda</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Bukan Anda? Ubah sandi Anda:
newDeviceLogin-action = Kelola akun
passwordChangeRequired-subject = Aktivitas mencurigakan terdeteksi
passwordChanged-subject = Sandi telah diperbarui
passwordChanged-title = Sandi sukses diganti
passwordChanged-description-2 = { -product-mozilla-account } Anda telah berhasil diubah untuk perangkat berikut ini:
password-forgot-otp-title = Lupa sandi Anda?
password-forgot-otp-request = Kami menerima permintaan perubahan sandi pada { -product-mozilla-account } Anda dari:
password-forgot-otp-code-2 = Jika ini Anda, berikut adalah kode konfirmasi Anda untuk melanjutkan:
password-forgot-otp-expiry-notice = Kode ini kedaluwarsa dalam 10 menit.
passwordReset-subject-2 = Sandi Anda telah disetel ulang
passwordReset-title-2 = Sandi Anda telah disetel ulang
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Anda menyetel ulang sandi { -product-mozilla-account } pada:
passwordResetAccountRecovery-subject-2 = Sandi Anda telah diset ulang
passwordResetAccountRecovery-title-3 = Sandi Anda telah disetel ulang
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Anda menggunakan kunci pemulihan akun untuk menyetel ulang sandi { -product-mozilla-account } pada:
passwordResetAccountRecovery-information = Kami mengeluarkan Anda dari semua perangkat yang disinkronkan. Kami membuat kunci pemulihan akun baru untuk menggantikan yang Anda gunakan. Anda dapat mengubahnya di pengaturan akun Anda.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Kami mengeluarkan Anda dari semua perangkat yang disinkronkan. Kami membuat kunci pemulihan akun baru untuk menggantikan yang Anda gunakan. Anda dapat mengubahnya di pengaturan akun Anda:
passwordResetAccountRecovery-action-4 = Kelola akun
passwordResetWithRecoveryKeyPrompt-subject = Sandi Anda telah diset ulang
passwordResetWithRecoveryKeyPrompt-title = Sandi Anda telah diset ulang
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Anda menyetel ulang sandi { -product-mozilla-account } pada:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Buat kunci pemulihan akun
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Buat kunci pemulihan akun:
passwordResetWithRecoveryKeyPrompt-cta-description = Anda harus masuk lagi di semua perangkat yang disinkronkan. Amankan data Anda di lain waktu dengan kunci pemulihan akun. Ini memungkinkan Anda untuk memulihkan data Anda jika Anda lupa sandi Anda.
postAddAccountRecovery-subject-3 = Kunci pemulihan akun baru dibuat
postAddAccountRecovery-title2 = Anda membuat kunci pemulihan akun baru
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Simpan kunci ini di tempat yang aman — Anda akan membutuhkannya untuk memulihkan data penjelajahan terenkripsi Anda jika Anda lupa sandi Anda.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Kunci ini hanya dapat digunakan sekali. Setelah Anda menggunakannya, kami akan secara otomatis membuat yang baru untuk Anda. Atau Anda dapat membuat yang baru kapan saja dari pengaturan akun Anda.
postAddAccountRecovery-action = Kelola akun
postAddLinkedAccount-subject-2 = Akun baru terhubung ke { -product-mozilla-account } Anda.
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Akun { $providerName } Anda telah dihubungkan ke { -product-mozilla-account } Anda
postAddLinkedAccount-action = Kelola akun
postAddRecoveryPhone-subject = Telepon pemulihan ditambahkan
postAddRecoveryPhone-preview = Akun dilindungi oleh otentikasi dua langkah
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Anda menambahkan { $maskedLastFourPhoneNumber } sebagai nomor telepon pemulihan Anda
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Cara ini melindungi akun Anda
postAddRecoveryPhone-how-protect-plaintext = Cara ini melindungi akun Anda:
postAddRecoveryPhone-enabled-device = Anda mengaktifkannya dari:
postAddRecoveryPhone-action = Kelola akun
postAddTwoStepAuthentication-title-2 = Anda mengaktifkan autentikasi dua langkah
postAddTwoStepAuthentication-action = Kelola akun
postChangeAccountRecovery-subject = Kunci pemulihan akun diubah
postChangeAccountRecovery-title = Anda mengubah kunci pemulihan akun Anda
postChangeAccountRecovery-body-part1 = Anda sekarang memiliki kunci pemulihan akun baru. Kunci Anda sebelumnya telah dihapus.
postChangeAccountRecovery-body-part2 = Simpan kunci baru ini di tempat yang aman — Anda akan membutuhkannya untuk memulihkan data penjelajahan terenkripsi Anda jika Anda lupa kata sandi Anda.
postChangeAccountRecovery-action = Kelola akun
postChangePrimary-subject = Email utama diperbarui
postChangePrimary-title = Surel utama baru
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Anda sukses mengubah surel utama Anda ke { $email }. Sekarang alamat ini adalah nama pengguna Anda untuk masuk ke { -product-mozilla-account } Account Anda, serta menerima pemberitahuan keamanan dan konfirmasi masuk.
postChangePrimary-action = Kelola akun
postChangeRecoveryPhone-subject = Telepon pemulihan diperbarui
postChangeRecoveryPhone-preview = Akun dilindungi oleh otentikasi dua langkah
postChangeRecoveryPhone-title = Anda mengubah ponsel pemulihan Anda
postChangeRecoveryPhone-description = Anda sekarang memiliki telepon pemulihan baru. Nomor telepon Anda sebelumnya telah dihapus.
postChangeRecoveryPhone-requested-device = Anda memintanya dari:
postConsumeRecoveryCode-action = Kelola akun
postNewRecoveryCodes-subject-2 = Kode otentikasi cadangan baru dibuat
postNewRecoveryCodes-title-2 = Anda membuat kode autentikasi cadangan baru
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Kode dibuat pada:
postNewRecoveryCodes-action = Kelola akun
postRemoveAccountRecovery-subject-2 = Kunci pemulihan akun dihapus
postRemoveAccountRecovery-title-3 = Anda menghapus kunci pemulihan akun Anda
postRemoveAccountRecovery-body-part1 = Kunci pemulihan akun diperlukan untuk memulihkan data penjelajahan terenkripsi jika Anda lupa kata sandi.
postRemoveAccountRecovery-body-part2 = Jika Anda belum melakukannya, buat kunci pemulihan akun baru di pengaturan akun Anda untuk mencegah kehilangan kata sandi, markah, riwayat penjelajahan, dan data lainnya yang tersimpan.
postRemoveAccountRecovery-action = Kelola akun
postRemoveRecoveryPhone-subject = Telepon pemulihan dihapus
postRemoveRecoveryPhone-preview = Akun dilindungi oleh otentikasi dua langkah
postRemoveRecoveryPhone-title = Telepon pemulihan dihapus
postRemoveRecoveryPhone-requested-device = Anda memintanya dari:
postRemoveSecondary-subject = Surel sekunder telah dihapus
postRemoveSecondary-title = Surel sekunder telah dihapus
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Anda telah berhasil menghapus { $secondaryEmail } sebagai email sekunder dari { -product-mozilla-account }. Pemberitahuan keamanan dan konfirmasi masuk tidak akan lagi dikirim ke alamat ini.
postRemoveSecondary-action = Kelola akun
postRemoveTwoStepAuthentication-subject-line-2 = Autentikasi dua langkah dinonaktifkan
postRemoveTwoStepAuthentication-title-2 = Anda menonaktifkan autentikasi dua langkah
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Anda menonaktifkannya dari:
postRemoveTwoStepAuthentication-action = Kelola akun
postRemoveTwoStepAuthentication-not-required-2 = Anda tidak lagi memerlukan kode keamanan dari aplikasi autentikasi saat masuk.
postSigninRecoveryCode-subject = Cadangan kode autentikasi yang digunakan untuk masuk
postSigninRecoveryCode-preview = Konfirmasi aktivitas akun
postSigninRecoveryCode-title = Kode autentikasi cadangan Anda digunakan untuk masuk
postSigninRecoveryCode-description = Jika Anda tidak melakukannya, Anda harus segera mengubah sandi untuk menjaga keamanan akun Anda.
postSigninRecoveryCode-device = Anda masuk dari:
postSigninRecoveryCode-action = Kelola akun
postSigninRecoveryPhone-subject = Ponsel pemulihan digunakan untuk masuk
postSigninRecoveryPhone-preview = Konfirmasi aktivitas akun
postSigninRecoveryPhone-title = Ponsel pemulihan Anda digunakan untuk masuk
postSigninRecoveryPhone-description = Jika Anda tidak melakukannya, Anda harus segera mengubah sandi untuk menjaga keamanan akun Anda.
postSigninRecoveryPhone-device = Anda masuk dari:
postSigninRecoveryPhone-action = Kelola akun
postVerify-sub-title-3 = Kami senang melihat Anda!
postVerify-title-2 = Ingin melihat tab yang sama di dua perangkat?
postVerify-description-2 = Sangat mudah! Cukup pasang { -brand-firefox } di perangkat lain dan masuk untuk menyinkronkan. Ini seperti sulap!
postVerify-sub-description = (Ssst… Ini juga berarti Anda bisa mendapatkan markah, sandi, dan data { -brand-firefox } lainnya di mana pun Anda masuk.)
postVerify-subject-4 = Selamat datang di { -brand-mozilla }
postVerify-setup-2 = Sambungkan perangkat lain:
postVerify-action-2 = Hubungkan perangkat lain
postVerifySecondary-subject = Surel sekunder ditambahkan
postVerifySecondary-title = Surel sekunder ditambahkan
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Anda telah berhasil mengonfirmasi { $secondaryEmail } sebagai surel sekunder untuk { -product-mozilla-account } Anda. Pemberitahuan keamanan dan konfirmasi masuk sekarang akan dikirimkan ke kedua alamat surel.
postVerifySecondary-action = Kelola akun
recovery-subject = Setel ulang sandi
recovery-title-2 = Anda lupa sandi?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Kami menerima permintaan perubahan sandi pada { -product-mozilla-account } Anda dari:
recovery-new-password-button = Buat sandi baru dengan mengklik tombol di bawah ini. Tautan ini akan kedaluwarsa dalam satu jam.
recovery-copy-paste = Buat kata sandi baru dengan menyalin dan menempelkan URL di bawah ini ke peramban Anda. Tautan ini akan kedaluwarsa dalam satu jam.
recovery-action = Buat sandi baru
unblockCode-title = Apakah Anda benar-benar sedang masuk?
unblockCode-prompt = Jika ya, ini adalah kode otorisasi yang Anda butuhkan:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Jika ya, berikut adalah kode otorisasi yang Anda butuhkan: { $unblockCode }
unblockCode-report = Jika tidak, bantu kami menangkis penyusup dan <a data-l10n-name="reportSignInLink">laporkan kepada kami</a>.
unblockCode-report-plaintext = Jika tidak, mohon bantu kami untuk menangkis penyusup dan melaporkannya pada kami.
verificationReminderFinal-subject = Pengingat terakhir untuk mengonfirmasi akun Anda
verificationReminderFinal-description-2 = Beberapa minggu yang lalu Anda membuat { -product-mozilla-account }, tetapi tidak pernah mengonfirmasinya. Demi keamanan Anda, kami akan menghapus akun jika tidak diverifikasi dalam 24 jam ke depan.
confirm-account = Konfirmasi akun
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Ingatlah untuk mengonfirmasi akun Anda
verificationReminderFirst-title-3 = Selamat datang di { -brand-mozilla }
verificationReminderFirst-description-3 = Beberapa hari yang lalu Anda membuat { -product-mozilla-account }, tetapi tidak pernah mengonfirmasinya. Konfirmasikan akun Anda dalam 15 hari ke depan atau akun akan dihapus secara otomatis.
verificationReminderFirst-sub-description-3 = Jangan lewatkan peramban yang mengutamakan Anda dan privasi.
confirm-email-2 = Konfirmasi akun
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Konfirmasi akun
verificationReminderSecond-subject-2 = Ingatlah untuk mengonfirmasi akun Anda
verificationReminderSecond-title-3 = Jangan lewatkan { -brand-mozilla }!
verificationReminderSecond-description-4 = Beberapa hari yang lalu Anda membuat { -product-mozilla-account }, tetapi tidak pernah mengonfirmasinya. Konfirmasikan akun Anda dalam 10 hari ke depan atau akun akan dihapus secara otomatis.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } memungkinkan Anda menyinkronkan pengalaman { -brand-firefox } di berbagai perangkat dan memberi Anda akses ke lebih banyak produk dari { -brand-mozilla } yang melindungi privasi Anda.
verificationReminderSecond-sub-description-2 = Jadilah bagian dari misi kami untuk mengubah internet menjadi tempat yang terbuka untuk semua orang.
verificationReminderSecond-action-2 = Konfirmasi akun
verify-title-3 = Buka internet dengan { -brand-mozilla }
verify-description-2 = Konfirmasikan akun Anda dan dapatkan manfaat maksimal dari { -brand-mozilla } di mana pun Anda masuk dimulai dengan:
verify-subject = Selesaikan pembuatan akun Anda
verify-action-2 = Konfirmasi akun
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Apakah Anda sudah masuk ke { $clientName }?
verifyLogin-description-2 = Bantu kami menjaga keamanan akun Anda dengan mengonfirmasi bahwa Anda masuk pada:
verifyLogin-subject-2 = Konfirmasi masuk
verifyLogin-action = Mengkonfirmasi proses masuk
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Apakah Anda sudah masuk ke { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Bantu kami menjaga keamanan akun Anda dengan menyetujui proses masuk Anda pada:
verifyLoginCode-prompt-3 = Jika ya, berikut adalah kode otorisasi Anda:
verifyLoginCode-expiry-notice = Kedaluwarsa dalam 5 menit.
verifyPrimary-title-2 = Konfirmasi surel utama
verifyPrimary-description = Permintaan untuk melakukan perubahan akun telah dibuat dari peranti berikut:
verifyPrimary-subject = Konfirmasi surel utama
verifyPrimary-action-2 = Konfirmasi surel
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Setelah dikonfirmasi, perubahan akun seperti menambahkan surel sekunder akan dimungkinkan dari perangkat ini.
verifySecondaryCode-title-2 = Konfirmasi surel sekunder
verifySecondaryCode-action-2 = Konfirmasi surel
verifySecondaryCode-prompt-2 = Gunakan kode konfirmasi ini:
verifySecondaryCode-expiry-notice-2 = Kedaluwarsa dalam 5 menit. Setelah dikonfirmasi, alamat ini akan mulai menerima pemberitahuan dan konfirmasi keamanan.
verifyShortCode-title-3 = Buka internet dengan { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Konfirmasikan akun Anda dan dapatkan manfaat maksimal dari { -brand-mozilla } di mana pun Anda masuk dimulai dengan:
verifyShortCode-prompt-3 = Gunakan kode konfirmasi ini:
verifyShortCode-expiry-notice = Kedaluwarsa dalam 5 menit.
