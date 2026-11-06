## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Singkronkeun parabot">
body-devices-image = <img data-l10n-name="devices-image" alt="Parabot">
fxa-privacy-url = Kawijakan Salindungan { -brand-mozilla }
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(kapitalisasi: "huruf besar") } Iber Privasi
moz-accounts-terms-url = { -product-mozilla-accounts(kapitalisasi: "huruf besar") } Syarat Layanan
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Undeur  { $productName } di { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Undeur { $productName } di { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Pasang { $productName } dina <a data-l10n-name="anotherDeviceLink">parabot déstop lianna</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Pasang { $productName } dina <a data-l10n-name="anotherDeviceLink">séjén parabot</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Undeur { $productName } di Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Undeur { $productName } di App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Pasang { $productName } dina séjén parabot:
automated-email-change-2 = Upama anjeun teu migawé ieu, geuwat <a data-l10n-name="passwordChangeLink">ganti kecap sandi anjeun</a>.
automated-email-support = PIkeun leuwih teleb, buka <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Upama anjeun teu migawé ieu, geuwat ganti kecap sandi anjeun:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Pikeun leuwih teleb, buka Pangrojong { -brand-mozilla }:
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Pikeun leuwih teleb, buka <a data-l10n-name="supportLink">Pangrojong { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Ieu surél otomatis. Lamun teu kahaja, ulah diwaro.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ieu surél otomatis; upama anjeun henteu nyatujuan, mangga ganti kecap konci anjeun:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Paménta ieu asalna ti { $uaBrowser } dina { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Paménta ieu asalna ti { $uaBrowser } dina { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Paménta ieu asalna ti { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Paménta ieu asalna ti { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Paménta ieu asalna ti { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Lamun lain  anjeun, <a data-l10n-name="revokeAccountRecoveryLink">hapus konci anyar</a> jeung <a data-l10n-name="passwordChangeLink">robah sandi anjeun</a>.
automatedEmailRecoveryKey-change-pwd-only = Lamun ieu lain anjeun, <a data-l10n-name="passwordChangeLink">robah sandi anjeun</a>.
automatedEmailRecoveryKey-more-info = PIkeun leuwih teleb, buka <a data-l10n-name="supportLink">{ -brand-mozilla } Pangrojong</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Paménta ieu asalna ti:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Lamun ieu lain anjeun, hapus konci anyar:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Lamun ieu lain anjeun, ganti sandi anjeun:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = jeung ganti sandi anjeun:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Pikeun leuwih teleb, buka Pangrojong { -brand-mozilla }:
automated-email-reset =
    Ieu surélék otomatis; lamun anjeun teu nyatujuan, mangga <a data-l10n-name="resetLink">ganti kecap sandi</a>.
    Pikeun leuwih lengkep, mangga buka <a data-l10n-name="supportLink">Dukungan { -brand-mozilla }</a>.
brand-banner-message = Naha anjeun nyaho yén urang ngarobah ngaran tina { -product-firefox-accounts } jadi { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Lenyepan</a>
change-password-plaintext = Mun sangkaan anjeun batur aya nu nyoba ngaksés ka akun anjeun, geura robah sandi anjeun.
manage-account = Kokolakeun akun
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
cadReminderFirst-subject-1 = Panginget! Hayu urang singkronkeun { -brand-firefox }
cadReminderFirst-action = Singkronkeun séjén alat
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Butuh dua pikeun nyingkronkeun
cadReminderFirst-description-v2 = Bawa tab kana sakabéh alat anjeun. Paké tetengger anjeun, sandi, jeung data séjén di mana waé anjeun maké { -brand-firefox }.
cadReminderSecond-subject-2 = Ulah kaliwat! Hayu anggeuskeun pangaturan singkronisasi anjeun
cadReminderSecond-action = Singkronkeun séjén alat
cadReminderSecond-title-2 = Ulah poho nyingkronkeun!
lowRecoveryCodes-action-2 = Jieun kode
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Anyar asup ka { $clientName }
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Lain anjeun? Ganti kecap sandina:
newDeviceLogin-action = Kokolakeun akun
passwordChangeRequired-subject = Aya kagiatan picurigaeun
passwordChanged-subject = Kecap sandi geus diropéa
passwordChanged-title = Ngarobah sandi geus hasil
passwordResetAccountRecovery-subject-2 = Sandi anjeun geus disetél ulang
postAddAccountRecovery-action = Kokolakeun akun
postAddLinkedAccount-action = Kokolakeun akun
postAddTwoStepAuthentication-action = Kokolakeun akun
postChangePrimary-subject = Surélék utama geus diropéa
postChangePrimary-title = Surélék utama anyar
postChangePrimary-action = Kokolakeun akun
postConsumeRecoveryCode-action = Kokolakeun akun
postNewRecoveryCodes-action = Kokolakeun akun
postRemoveAccountRecovery-action = Kokolakeun akun
postRemoveSecondary-subject = Surélék sékunder geus dilaan
postRemoveSecondary-title = Surélék sékunder geus dilaan
postRemoveSecondary-action = Kokolakeun akun
postRemoveTwoStepAuthentication-action = Kokolakeun akun
postVerifySecondary-subject = Surélék sékundér ditambahkeun
postVerifySecondary-title = Surélék sékundér ditambahkeun
postVerifySecondary-action = Kokolakeun akun
recovery-subject = Setél ulang kecap sandi anjeun
recovery-action = Jieun sandi anyar
unblockCode-title = Nu asup téh anjeun lin?
unblockCode-prompt = Mun enya mah, ieu kodeu otorisasi nu anjeun perlukeun:
unblockCode-report-plaintext = Mun henteu, bantuan kami nyingkahan nu ngaganggu sarta laporkeun ka kami.
verify-subject = Réngsékeun nyieun akun anjeun
verifyLogin-action = Konfirmasi peta asup
verifyLoginCode-expiry-notice = Bakal kadaluwarsa dina 5 menit.
verifyPrimary-description = Pamundut pikeun milampah parobahan akun geus dijieun ti perangkat di handap:
verifyPrimary-subject = Puguhkeun surél utama
verifyShortCode-expiry-notice = Bakal kadaluwarsa dina 5 menit.
