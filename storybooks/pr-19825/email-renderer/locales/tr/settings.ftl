# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = E-postanıza yeni bir kod gönderildi.
resend-link-success-banner-heading = E-postanıza yeni bir bağlantı gönderildi.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Sorunsuz ulaşması için { $accountsEmail } adresini kişi listenize ekleyebilirsiniz.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Duyuruyu kapat
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts }nın adı 1 Kasım’da { -product-mozilla-accounts } olarak değiştirilecek
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Aynı kullanıcı adı ve parolanızı kullanmaya devam edeceksiniz. Kullandığınız ürünlerde başka hiçbir değişiklik olmayacak.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = “{ -product-firefox-accounts }”nın adını “{ -product-mozilla-accounts }” olarak değiştirdik. Aynı kullanıcı adı ve parolanızı kullanmaya devam edebilirsiniz. Kullandığınız ürünlerde herhangi bir değişiklik olmayacak.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Daha fazla bilgi alın
# Alt text for close banner image
brand-close-banner =
    .alt = Duyuruyu kapat
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m logosu

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Geri
button-back-title = Geri

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = İndir ve devam et
    .title = İndir ve devam et
recovery-key-pdf-heading = Hesap kurtarma anahtarı
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Oluşturma: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Hesap kurtarma anahtarı
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Parolanızı unutursanız şifrelenmiş tarayıcı verilerinizi (parolalar, yer imleri ve geçmiş dahil) bu anahtarla kurtarabilirsiniz. Anahtarınızı unutmayacağınız bir yerde saklayın.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Anahtarınızı saklayabileceğiniz yerler
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Hesap kurtarma anahtarınız hakkında daha fazla bilgi alın
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Hesap kurtarma anahtarınız indirilirken bir sorun oluştu.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = { -brand-mozilla } bültenlerine kaydolun:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = En son haberlerden ve ürün güncellemelerinden haberdar olun
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Yeni ürünleri test etmek için erken erişim
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = İnternete sahip çıkmak için harekete geçme çağrıları

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = İndirildi
datablock-copy =
    .message = Kopyalandı
datablock-print =
    .message = Yazdırıldı

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Kod kopyalandı
       *[other] Kodlar kopyalandı
    }
datablock-download-success =
    { $count ->
        [one] Kod indirildi
       *[other] Kodlar indirildi
    }
datablock-print-success =
    { $count ->
        [one] Kod yazdırıldı
       *[other] Kodlar yazdırıldı
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Kopyalandı

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (tahmini)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (tahmini)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (tahmini)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (tahmini)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Bilinmeyen konum
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } - { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP adresi: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Parola
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Parola tekrarı
form-password-with-inline-criteria-signup-submit-button = Hesap oluştur
form-password-with-inline-criteria-reset-new-password =
    .label = Yeni parola
form-password-with-inline-criteria-confirm-password =
    .label = Parolayı onaylayın
form-password-with-inline-criteria-reset-submit-button = Yeni parola oluştur
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Parola
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Parola tekrarı
form-password-with-inline-criteria-set-password-submit-button = Eşitlemeyi başlat
form-password-with-inline-criteria-match-error = Parolalar uyuşmuyor
form-password-with-inline-criteria-sr-too-short-message = Parola en az 8 karakterden oluşmalıdır.
form-password-with-inline-criteria-sr-not-email-message = Parolanız e-posta adresinizi içeremez.
form-password-with-inline-criteria-sr-not-common-message = Parolanız yaygın olarak kullanılan bir parola olmamalıdır.
form-password-with-inline-criteria-sr-requirements-met = Girdiğiniz parola tüm parola gereksinimlerine uygun.
form-password-with-inline-criteria-sr-passwords-match = Girilen parolalar eşleşiyor.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Bu alanı doldurmalısınız

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Devam etmek için { $codeLength } haneli kodu yazın
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Devam etmek için { $codeLength } karakterlik kodu yazın

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } hesap kurtarma anahtarı
get-data-trio-title-backup-verification-codes = Yedek kimlik doğrulama kodları
get-data-trio-download-2 =
    .title = İndir
    .aria-label = İndir
get-data-trio-copy-2 =
    .title = Kopyala
    .aria-label = Kopyala
get-data-trio-print-2 =
    .title = Yazdır
    .aria-label = Yazdır

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Uyarı
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Dikkat
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Uyarı
authenticator-app-aria-label =
    .aria-label = Kimlik doğrulayıcı uygulaması
backup-codes-icon-aria-label-v2 =
    .aria-label = Yedek kimlik doğrulama kodları etkinleştirildi
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Yedek kimlik doğrulama kodları devre dışı bırakıldı
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Kurtarma kısa mesajı etkin
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Kurtarma kısa mesajı devre dışı
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanada bayrağı
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = İşaretle
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Başarılı
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Etkin
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Mesajı kapat
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kod
error-icon-aria-label =
    .aria-label = Hata
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Bilgi
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Amerika Birleşik Devletleri bayrağı

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Her birinde kırık bir kalp olan bir bilgisayar ve bir cep telefonu
hearts-verified-image-aria-label =
    .aria-label = Her birinde kalp atışları olan bir bilgisayar, cep telefonu ve tablet
signin-recovery-code-image-description =
    .aria-label = Gizli metin içeren belge.
signin-totp-code-image-label =
    .aria-label = 6 basamaklı gizli kodu olan bir cihaz.
confirm-signup-aria-label =
    .aria-label = Bağlantı içeren bir zarf
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Bir hesap kurtarma anahtarını betimleyen resim.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Bir hesap kurtarma anahtarını betimleyen resim.
password-image-aria-label =
    .aria-label = Parola girmeyi betimleyen bir çizim.
lightbulb-aria-label =
    .aria-label = Saklama ipucu oluşturmayı betimleyen çizim.
email-code-image-aria-label =
    .aria-label = Kod içeren bir e-postayı betimleyen çizim.
recovery-phone-image-description =
    .aria-label = Kısa mesajla kod alan bir mobil cihaz.
recovery-phone-code-image-description =
    .aria-label = Bir mobil cihaza ulaşan kod.
backup-recovery-phone-image-aria-label =
    .aria-label = SMS mesajı özelliğine sahip mobil cihaz
backup-authentication-codes-image-aria-label =
    .aria-label = Kodlar görünen cihaz ekranı
sync-clouds-image-aria-label =
    .aria-label = Eşitleme simgesi olan bulutlar
confetti-falling-image-aria-label =
    .aria-label = Düşen konfeti animasyonu

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = { -brand-firefox }’a giriş yaptınız.
inline-recovery-key-setup-create-header = Hesabınızın güvenliğini sağlayın
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Verilerinizi korumak için bir dakikanızı ayırır mısınız?
inline-recovery-key-setup-info = Parolanızı unutursanız eşitlenmiş gezinti verilerinizi kurtarabilmek için bir hesap kurtarma anahtarı oluşturun.
inline-recovery-key-setup-start-button = Hesap kurtarma anahtarı oluşturun
inline-recovery-key-setup-later-button = Daha sonra oluşturacağım

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Parolayı gizle
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Parolayı göster
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Parolanız şu anda ekranda görülebilir durumda.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Parolanız şu anda gizli.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Parolanız artık ekranda görülebilir.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Parolanız gizlendi.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Ülke seçin
input-phone-number-enter-number = Telefon numarasını yazın
input-phone-number-country-united-states = Amerika Birleşik Devletleri
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Geri

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Parolayı sıfırlama bağlantısı hasarlı
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Onay bağlantısı zarar görmüş
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Bozuk bağlantı
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Tıkladığınız bağlantıda bazı karakterler eksikti. Bağlantı, e-posta istemciniz tarafından bozulmuş olabilir. Adresi dikkatle kopyalayıp tekrar deneyin.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Yeni bağlantı iste

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Parolanızı hatırladınız mı?
# link navigates to the sign in page
remember-password-signin-link = Giriş yap

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Ana e-posta zaten onaylanmış
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Giriş zaten onaylanmış
confirmation-link-reused-message = Bu onay bağlantısı daha önce kullanılmış ve yeniden kullanılamaz.

## Locale Toggle Component

locale-toggle-select-label = Dil seçin
locale-toggle-browser-default = Tarayıcı varsayılanı
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Hatalı istek

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Bizde depolanan şifrelenmiş verilerinize erişmek için bu parolaya ihtiyacınız olacak.
password-info-balloon-reset-risk-info = Sıfırlama yaparsanız parolalar ve yer imleri gibi verileriniz kaybolabilir.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Başka sitelerde kullanmadığınız, güçlü bir parola seçin. Güvenlik gereksinimlerini karşıladığından emin olun:
password-strength-short-instruction = Güçlü bir parola seçin:
password-strength-inline-min-length = En az 8 karakter
password-strength-inline-not-email = E-posta adresiniz olmamalı
password-strength-inline-not-common = Yaygın olarak kullanılan bir parola olmamalı
password-strength-inline-confirmed-must-match = Onay yeni parola ile eşleşiyor
password-strength-inline-passwords-match = Parolalar eşleşiyor

## Notification Promo Banner component

account-recovery-notification-cta = Oluştur
account-recovery-notification-header-value = Parolanızı unutursanız verileriniz kaybolmasın
account-recovery-notification-header-description = Parolanızı unutursanız eşitlenmiş gezinti verilerinizi kurtarmak için bir hesap kurtarma anahtarı oluşturun.
recovery-phone-promo-cta = Kurtarma telefonu ekleyin
recovery-phone-promo-heading = Kurtarma telefonuyla hesabınıza ekstra koruma ekleyin
recovery-phone-promo-description = İki aşamalı kimlik doğrulama uygulamanızı kullanamıyorsanız artık SMS yoluyla tek kullanımlık parolayla giriş yapabilirsiniz.
recovery-phone-promo-info-link = Kurtarma ve SIM swap saldırısı hakkında daha fazla bilgi alın
promo-banner-dismiss-button =
    .aria-label = Bildirimi kapat

## Ready component

ready-complete-set-up-instruction = Yeni parolanızı diğer { -brand-firefox } cihazlarınıza girerek kurulumu tamamlayın.
manage-your-account-button = Hesabınızı yönetin
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = { $serviceName } artık kullanıma hazır
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Artık hesap ayarlarını kullanmaya hazırsınız
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Hesabınız hazır!
ready-continue = Devam et
sign-in-complete-header = Giriş onaylandı
sign-up-complete-header = Hesap onaylandı
primary-email-verified-header = Ana e-posta onaylandı

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Anahtarınızı saklayabileceğiniz yerler:
flow-recovery-key-download-storage-ideas-folder-v2 = Güvenli bir cihazdaki bir klasör
flow-recovery-key-download-storage-ideas-cloud = Güvenilir bulut depolama
flow-recovery-key-download-storage-ideas-print-v2 = Yazdırılmış fiziksel kopya
flow-recovery-key-download-storage-ideas-pwd-manager = Parola yöneticisi

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Anahtarınızı bulmanıza yardımcı olacak bir ipucu ekleyin
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Bu ipucu, hesap kurtarma anahtarınızı nerede sakladığınızı size hatırlatmalı. Verilerinizi kurtarmak için parola sıfırlama esnasında bu ipucunu size gösterebiliriz.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = İpucunuzu yazın (isteğe bağlı)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Bitir
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = İpucu 255 karakterden kısa olmalıdır.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = İpucu güvensiz unicode karakterler içeremez. Yalnızca harf, sayı, noktalama işareti ve simge içerebilir.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Uyarı
password-reset-chevron-expanded = Uyarıyı daralt
password-reset-chevron-collapsed = Uyarıyı genişlet
password-reset-data-may-not-be-recovered = Tarayıcı verileriniz kurtarılamayabilir
password-reset-previously-signed-in-device-2 = Daha önce giriş yaptığınız bir cihazınız var mı?
password-reset-data-may-be-saved-locally-2 = Tarayıcı verileriniz o cihazda kayıtlı olabilir. Parolanızı sıfırlayın, ardından verilerinizi geri yüklemek ve eşitlemek için o cihazdan giriş yapın.
password-reset-no-old-device-2 = Yeni bir cihazınız var ama eski cihazlarınıza erişemiyor musunuz?
password-reset-encrypted-data-cannot-be-recovered-2 = Üzgünüz, { -brand-firefox } sunucularındaki şifrelenmiş tarayıcı verileriniz bu durumda maalesef kurtarılamaz.
password-reset-warning-have-key = Hesap kurtarma anahtarınız var mı?
password-reset-warning-use-key-link = Parolanızı sıfırlayıp verilerinizi geri yüklemek için şimdi onu kullanabilirsiniz

## Alert Bar

alert-bar-close-message = Mesajı kapat

## User's avatar

avatar-your-avatar =
    .alt = Avatarınız
avatar-default-avatar =
    .alt = Varsayılan avatar

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } ürünleri
bento-menu-tagline = Gizliliğinizi koruyan diğer { -brand-mozilla } ürünleri
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Bilgisayarlar için { -brand-firefox } tarayıcısı
bento-menu-firefox-mobile = Mobil cihazlar için { -brand-firefox } tarayıcısı
bento-menu-made-by-mozilla = { -brand-mozilla } güvencesiyle

## Connect another device promo

connect-another-fx-mobile = { -brand-firefox }’u mobil cihazınıza veya tabletinize indirin
connect-another-find-fx-mobile-2 = { -brand-firefox } tarayıcısını { -google-play } ve { -app-store }’da bulabilirsiniz.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = { -brand-firefox }’u { -google-play }’den indir
connect-another-app-store-image-3 =
    .alt = { -brand-firefox }’u { -app-store }’dan indir

## Connected services section

cs-heading = Bağlı hizmetler
cs-description = Kullandığınız ve giriş yaptığınız her şey.
cs-cannot-refresh =
    Üzgünüz, bağlı hizmetlerin listesi yenilenirken bir
    sorun oluştu.
cs-cannot-disconnect = İstemci bulunamadı, bağlantı kesilemiyor
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = { $service } oturumu kapatıldı
cs-refresh-button =
    .title = Bağlı hizmetleri yenile
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Eksik veya çift kayıtlar mı var?
cs-disconnect-sync-heading = Sync bağlantısını kes

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Gezinti verileriniz <span>{ $device }</span> cihazında kalacak,
    ancak artık hesabınızla eşitlenmeyecek.
cs-disconnect-sync-reason-3 = <span>{ $device }</span> cihazının bağlantısını kesme nedeniniz nedir?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Cihaz:
cs-disconnect-sync-opt-suspicious = Şüpheli
cs-disconnect-sync-opt-lost = Kayboldu veya çalındı
cs-disconnect-sync-opt-old = Eski veya değiştirildi
cs-disconnect-sync-opt-duplicate = Çift kopya
cs-disconnect-sync-opt-not-say = Söylemek istemiyorum

##

cs-disconnect-advice-confirm = Tamam, anladım
cs-disconnect-lost-advice-heading = Kayıp veya çalınan cihazın bağlantısı kesildi
cs-disconnect-lost-advice-content-3 = Cihazınız kaybolduysa veya çalındıysa bilgilerinizi güvende tutmak için hesap ayarlarınızdan { -product-mozilla-account } parolanızı değiştirmelisiniz. Ayrıca verilerinizi uzaktan silme konusunda cihaz üreticinizden bilgi almanızı öneririz.
cs-disconnect-suspicious-advice-heading = Şüpheli cihazın bağlantısı kesildi
cs-disconnect-suspicious-advice-content-2 = Bağlantısını kestiğiniz cihaz gerçekten şüpheliyse bilgilerinizi güvende tutmak için hesap ayarlarınızdan { -product-mozilla-account } parolanızı değiştirmelisiniz. { -brand-firefox } tarayıcınıza kaydettiğiniz ve adres çubuğuna about:logins yazarak görebileceğiniz parolaları da değiştirmenizi öneririz.
cs-sign-out-button = Çıkış yap

## Data collection section

dc-heading = Veri toplanması ve kullanımı
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } tarayıcısı
dc-subheader-content-2 = { -product-mozilla-accounts }nın teknik verileri ve etkileşim verilerini { -brand-mozilla }'ya göndermesine izin veriyorum.
dc-subheader-ff-content = { -brand-firefox } tarayıcınızın teknik veri ve etkileşim verisi ayarlarını incelemek veya güncellemek isterseniz { -brand-firefox } ayarlarını açıp Gizlilik ve Güvenlik bölümüne gidin.
dc-opt-out-success-2 = Ayrılma işlemi başarılı. { -product-mozilla-accounts } artık teknik verileri ve etkileşim verilerini { -brand-mozilla }'ya göndermeyecek.
dc-opt-in-success-2 = Teşekkürler! Bu verileri paylaşmanız { -product-mozilla-accounts }nı geliştirmemize yardımcı oluyor.
dc-opt-in-out-error-2 = Üzgünüz, veri toplama tercihiniz değiştirilirken bir sorun oluştu
dc-learn-more = Daha fazla bilgi al

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } menüsü
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Giriş yapan kullanıcı
drop-down-menu-sign-out = Çıkış yap
drop-down-menu-sign-out-error-2 = Üzgünüz, çıkış yapılırken bir sorun oluştu

## Flow Container

flow-container-back = Geri dön

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Güvenliğiniz için parolanızı yeniden yazın
flow-recovery-key-confirm-pwd-input-label = Parolanızı girin
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Hesap kurtarma anahtarı oluştur
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Yeni hesap kurtarma anahtarı oluştur

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Hesap kurtarma anahtarı oluşturuldu. Hemen indirip saklayın
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Parolanızı unutursanız bu anahtarı kullanarak verilerinizi kurtarabilirsiniz. Şimdi bu anahtarı indirin ve unutmayacağınız bir yerde saklayın. Daha sonra bu sayfaya geri dönemezsiniz.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = İndirmeden devam et

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Hesap kurtarma anahtarı oluşturuldu

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Parolanızı unutursanız kullanabileceğiniz bir hesap kurtarma anahtarı oluşturun
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Hesap kurtarma anahtarınızı değiştirin
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Gezinti verilerinizi, parolalarınızı, yer imlerini ve diğer bilgilerinizi şifreliyoruz. Gizlilik açısından en doğrusu bu, ama parolanızı unutursanız verilerinizi kaybedebilirsiniz.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Bu yüzden hesap kurtarma anahtarı oluşturmanız çok önemli. Verilerinizi geri getirmek istediğinizde anahtarınızı kullanabilirsiniz.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Başla
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = İptal

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Kimlik doğrulama uygulamanıza bağlanın
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>1. adım:</strong> Duo veya Google Authenticator gibi bir kimlik doğrulama uygulamasına bu QR kodunu okutun.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = İki aşamalı doğrulamayı ayarlamak için QR kodu. Kodu okutun veya onun yerine gizli anahtarı görmek için “QR kodunu okutamıyor musunuz?”u seçin.
flow-setup-2fa-cant-scan-qr-button = QR kodunu okutamıyor musunuz?
flow-setup-2fa-manual-key-heading = Kodu kendiniz yazın
flow-setup-2fa-manual-key-instruction = <strong>1. adım:</strong> Bu kodu istediğiniz bir kimlik doğrulama uygulamasına yazın.
flow-setup-2fa-scan-qr-instead-button = Bunun yerine QR kodu okutulsun mu?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Kimlik doğrulama uygulamaları hakkında daha fazla bilgi alın
flow-setup-2fa-button = İleri
flow-setup-2fa-step-2-instruction = <strong>2. adım:</strong> Kimlik doğrulama uygulamanızdaki kodu yazın.
flow-setup-2fa-input-label = 6 basamaklı kodu yazın
flow-setup-2fa-code-error = Kod geçersiz veya süresi dolmuş. Kimlik doğrulama uygulamanızı kontrol edip yeniden deneyin.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Bir kurtarma yöntemi seçin
flow-setup-2fa-backup-choice-description = Bu yöntem, mobil cihazınıza veya kimlik doğrulama uygulamanıza erişemiyorsanız giriş yapmanızı sağlar.
flow-setup-2fa-backup-choice-phone-title = Kurtarma telefonu
flow-setup-2fa-backup-choice-phone-badge = En kolay
flow-setup-2fa-backup-choice-phone-info = SMS ile kurtarma kodu alın. yalnızca Şu anda ABD ve Kanada’da kullanılabilir.
flow-setup-2fa-backup-choice-code-title = Yedek kimlik doğrulama kodları
flow-setup-2fa-backup-choice-code-badge = En güvenli
flow-setup-2fa-backup-choice-code-info = Tek kullanımlık kimlik doğrulama kodları oluşturup kaydedin.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Kurtarma ve SIM swap saldırısı hakkında bilgi alın

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Yedek kimlik doğrulama kodunu yazın
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Kodları kaydettiğinizi onaylamak için kodlardan birini yazın. Kimlik doğrulama uygulamanıza erişemediğinizde bu kodlar olmadan giriş yapamayabilirsiniz.
flow-setup-2fa-backup-code-confirm-code-input = 10 karakterli kodu yazın
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Bitir

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Yedek kimlik doğrulama kodlarını kaydedin
flow-setup-2fa-backup-code-dl-save-these-codes = Bunları unutmayacağınız bir yerde saklayın. Kimlik doğrulama uygulamanıza erişiminiz olmadığında giriş yapmak için bu kodlardan birini girmeniz gerekecek.
flow-setup-2fa-backup-code-dl-button-continue = İleri

##

flow-setup-2fa-inline-complete-success-banner = İki aşamalı kimlik doğrulama etkinleştirildi
flow-setup-2fa-inline-complete-backup-code = Yedek kimlik doğrulama kodları
flow-setup-2fa-inline-complete-backup-phone = Kurtarma telefonu
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } kod kaldı
       *[other] { $count } kod kaldı
    }
flow-setup-2fa-inline-complete-backup-code-description = Mobil cihazınızla veya kimlik doğrulama uygulamanızla giriş yapamıyorsanız bu en güvenli kurtarma yöntemidir.
flow-setup-2fa-inline-complete-backup-phone-description = Kimlik doğrulama uygulamanızla giriş yapamıyorsanız bu en kolay kurtarma yöntemidir.
flow-setup-2fa-inline-complete-learn-more-link = İki aşamalı kimlik doğrulama, hesabınızı nasıl korur?
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = { $serviceName } hizmetine devam et
flow-setup-2fa-prompt-heading = İki aşamalı kimlik doğrulamayı ayarla
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName }, hesabınızı güvende tutmak için iki aşamalı kimlik doğrulamasını ayarlamanızı gerektiriyor.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Devam etmek için <authenticationAppsLink>bu kimlik doğrulama uygulamalarından</authenticationAppsLink> herhangi birini kullanabilirsiniz.
flow-setup-2fa-prompt-continue-button = Devam et

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Doğrulama kodunu girin
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = <span>{ $phoneNumber }</span> numarasına kısa mesajla altı haneli bir kod gönderdik. Bu kodun geçerlilik süresi 5 dakikadır.
flow-setup-phone-confirm-code-input-label = 6 basamaklı kodu girin
flow-setup-phone-confirm-code-button = Onayla
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Kodun süresi mi doldu?
flow-setup-phone-confirm-code-resend-code-button = Kodu yeniden gönder
flow-setup-phone-confirm-code-resend-code-success = Kod gönderildi
flow-setup-phone-confirm-code-success-message-v2 = Kurtarma telefonu eklendi
flow-change-phone-confirm-code-success-message = Kurtarma telefonu değiştirildi

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Telefon numaranızı doğrulayın
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = { -brand-mozilla }’dan numaranızı doğrulamak için bir kod içeren bir SMS alacaksınız. Bu kodu kimseyle paylaşmayın.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Kurtarma telefonu yalnızca Amerika Birleşik Devletleri ve Kanada’da kullanılabilir. VoIP numaraları ve telefon maskeleri önerilmez.
flow-setup-phone-submit-number-legal = Numaranızı verdiğinizde, yalnızca hesabınızı doğrulama amacıyla size kısa mesaj gönderebilmemiz için numaranızı saklamamızı kabul etmiş olursunuz. Mesaj ve veri ücretleri uygulanabilir.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Kodu gönder

## HeaderLockup component, the header in account settings

header-menu-open = Menüyü kapat
header-menu-closed = Site gezinti menüsü
header-back-to-top-link =
    .title = Başa dön
header-back-to-settings-link =
    .title = { -product-mozilla-account } ayarlarına dön
header-title-2 = { -product-mozilla-account }
header-help = Yardım

## Linked Accounts section

la-heading = Bağlı hesaplar
la-description = Aşağıdaki hesaplara erişim izni verdiniz.
la-unlink-button = Bağlantıyı kes
la-unlink-account-button = Bağlantıyı kes
la-set-password-button = Parola belirle
la-unlink-heading = Üçüncü taraf hesabıyla bağlantıyı kes
la-unlink-content-3 = Hesabınızın bağlantısını kesmek istediğinizden emin misiniz? Hesabınızın bağlantısını kesmeniz bağlı hizmetlerden otomatik olarak çıkış yapmanızı sağlamaz. Bunu yapmak için "Bağlı hizmetler" bölümünden manuel olarak çıkış yapmanız gerekecektir.
la-unlink-content-4 = Hesabınızın bağlantısını kaldırmadan önce bir parola belirlemelisiniz. Hesabınızın bağlantısını kaldırdıktan sonra parolanız olmadan giriş yapamazsınız.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Kapat
modal-cancel-button = İptal
modal-default-confirm-button = Onayla

## ModalMfaProtected

modal-mfa-protected-title = Onay kodunu girin
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] <email>{ $email }</email> adresine gönderdiğimiz kodu { $expirationTime } dakika içinde girin.
       *[other] <email>{ $email }</email> adresine gönderdiğimiz kodu { $expirationTime } dakika içinde girin.
    }
modal-mfa-protected-input-label = 6 basamaklı kodu girin
modal-mfa-protected-cancel-button = Vazgeç
modal-mfa-protected-confirm-button = Onayla
modal-mfa-protected-code-expired = Kodun süresi mi doldu?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = E-posta ile yeni kod gönder.

## Modal Verify Session

mvs-verify-your-email-2 = E-postanızı onaylayın
mvs-enter-verification-code-2 = Onay kodunuzu girin
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Lütfen <email>{ $email }</email> adresine gönderilen onay kodunu 5 dakika içinde girin.
msv-cancel-button = İptal
msv-submit-button-2 = Onayla

## Settings Nav

nav-settings = Ayarlar
nav-profile = Profil
nav-security = Güvenlik
nav-connected-services = Bağlı hizmetler
nav-data-collection = Veri toplanması ve kullanımı
nav-paid-subs = Ücretli abonelikler
nav-email-comm = E-posta iletişimi

## Page2faChange

page-2fa-change-title = İki aşamalı doğrulamayı değiştir
page-2fa-change-success = İki aşamalı kimlik doğrulama güncellendi
page-2fa-change-totpinfo-error = İki aşamalı kimlik doğrulama uygulamanız değiştirilirken bir hata oluştu. Daha sonra yeniden deneyin.
page-2fa-change-qr-instruction = <strong>1. adım:</strong> Bu QR kodunu Duo veya Google Authenticator gibi bir kimlik doğrulama uygulamasıyla tarayın. Bu işlem yeni bir bağlantı oluşturur. Eski bağlantılar artık çalışmayacaktır.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Yedek kimlik doğrulama kodları
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Yedek kimlik doğrulama kodlarınız değiştirilirken bir sorun oluştu
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Yedek kimlik doğrulama kodlarınız oluşturulurken bir sorun oluştu
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Yedek kimlik doğrulama kodları güncellendi
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Yedek kimlik doğrulama kodları oluşturuldu
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Bu kodları unutmayacağınız bir yerde saklayın. Sonraki adımı tamamladığınızda eski kodlarınız iptal olacaktır.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Kodlarınızı kaydettiğinizi onaylamak için kodlardan birini girin. Bu adımı tamamladığınızda eski yedek kimlik doğrulama kodlarınız devre dışı bırakılacaktır.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Yanlış yedek kimlik doğrulama kodu

## Page2faSetup

page-2fa-setup-title = İki aşamalı doğrulama
page-2fa-setup-totpinfo-error = İki aşamalı doğrulama ayarlanırken bir hata oluştu. Daha sonra yeniden deneyin.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Bu kod doğru değil. Yeniden deneyin.
page-2fa-setup-success = İki aşamalı kimlik doğrulama etkinleştirildi

## Avatar change page

avatar-page-title =
    .title = Profil fotoğrafı
avatar-page-add-photo = Fotoğraf ekle
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fotoğraf çek
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Fotoğrafı kaldır
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Yeniden fotoğraf çek
avatar-page-cancel-button = İptal
avatar-page-save-button = Kaydet
avatar-page-saving-button = Kaydediliyor…
avatar-page-zoom-out-button =
    .title = Uzaklaştır
avatar-page-zoom-in-button =
    .title = Yakınlaştır
avatar-page-rotate-button =
    .title = Döndür
avatar-page-camera-error = Kamera başlatılamadı
avatar-page-new-avatar =
    .alt = yeni profil fotoğrafı
avatar-page-file-upload-error-3 = Profil fotoğrafınız yüklenirken bir sorun oluştu
avatar-page-delete-error-3 = Profil fotoğrafınız silinirken bir sorun oluştu
avatar-page-image-too-large-error-2 = Resim dosyası boyutu yüklenemeyecek kadar büyük

## Password change page

pw-change-header =
    .title = Parolayı değiştir
pw-8-chars = En az 8 karakter olmalı
pw-not-email = E-posta adresiniz olmamalı
pw-change-must-match = Yeni parola eşleşme onayı
pw-commonly-used = Yaygın olarak kullanılan bir parola olmamalı
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Güvende kalın: Aynı parolaları farklı yerlerde kullanmayın. <linkExternal>Güçlü parolalar oluşturmak</linkExternal> için daha fazla ipucu görün.
pw-change-cancel-button = İptal
pw-change-save-button = Kaydet
pw-change-forgot-password-link = Parolanızı unuttunuz mu?
pw-change-current-password =
    .label = Mevcut parolanızı yazın
pw-change-new-password =
    .label = Yeni parolanızı yazın
pw-change-confirm-password =
    .label = Yeni parolanızı doğrulayın
pw-change-success-alert-2 = Parola güncellendi

## Password create page

pw-create-header =
    .title = Parola oluştur
pw-create-success-alert-2 = Parola ayarlandı
pw-create-error-2 = Üzgünüz, parolanız ayarlanırken bir sorun oluştu

## Delete account page

delete-account-header =
    .title = Hesabı sil
delete-account-step-1-2 = Adım 1/2
delete-account-step-2-2 = Adım 2/2
delete-account-confirm-title-4 = { -product-mozilla-account }nızı, internette güvenliğinizi ve verimliliğinizi artıran aşağıdaki { -brand-mozilla } ürün ve hizmetlerine bağlamış olabilirsiniz:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox } verilerini eşitleme
delete-account-product-firefox-addons = { -brand-firefox } Eklentileri
delete-account-acknowledge = Hesabınızı sildiğinizde aşağıdakileri de kabul etmiş olursunuz:
delete-account-chk-box-1-v4 =
    .label = Sahip olduğunuz tüm ücretli abonelikler iptal edilecektir
delete-account-chk-box-2 =
    .label = { -brand-mozilla } ürünlerinde kayıtlı bilgilerinizi ve özellikleri kaybedebilirsiniz
delete-account-chk-box-3 =
    .label = Bu e-postayı yeniden etkinleştirseniz bile kayıtlı bilgileriniz geri gelmeyecektir
delete-account-chk-box-4 =
    .label = addons.mozilla.org’da yayımladığınız tüm eklentiler ve temalar silinecektir
delete-account-continue-button = Devam
delete-account-password-input =
    .label = Parolanızı yazın
delete-account-cancel-button = İptal
delete-account-delete-button-2 = Sil

## Display name page

display-name-page-title =
    .title = Görünen ad
display-name-input =
    .label = Görünen adı yazın
submit-display-name = Kaydet
cancel-display-name = İptal
display-name-update-error-2 = Görünen adınız güncellenirken bir sorun oluştu
display-name-success-alert-2 = Görünen ad güncellendi

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Son hesap etkinlikleri
recent-activity-account-create-v2 = Hesap oluşturuldu
recent-activity-account-disable-v2 = Hesap devre dışı bırakıldı
recent-activity-account-enable-v2 = Hesap etkinleştirildi
recent-activity-account-login-v2 = Hesap girişi başlatıldı
recent-activity-account-reset-v2 = Parola sıfırlama başlatıldı
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Geri dönen e-postalar temizlendi
recent-activity-account-login-failure = Hesaba giriş denemesi başarısız oldu
recent-activity-account-two-factor-added = İki aşamalı kimlik doğrulama etkinleştirildi
recent-activity-account-two-factor-requested = İki aşamalı kimlik doğrulama istendi
recent-activity-account-two-factor-failure = İki aşamalı kimlik doğrulama başarısız oldu
recent-activity-account-two-factor-success = İki aşamalı doğrulama başarılı oldu
recent-activity-account-two-factor-removed = İki aşamalı kimlik doğrulama kaldırıldı
recent-activity-account-password-reset-requested = Parola sıfırlama istendi
recent-activity-account-password-reset-success = Hesap parolası başarıyla sıfırlandı
recent-activity-account-recovery-key-added = Hesap kurtarma anahtarı etkinleştirildi
recent-activity-account-recovery-key-verification-failure = Hesap kurtarma anahtarı doğrulanamadı
recent-activity-account-recovery-key-verification-success = Hesap kurtarma anahtarı başarıyla doğrulandı
recent-activity-account-recovery-key-removed = Hesap kurtarma anahtarı kaldırıldı
recent-activity-account-password-added = Yeni parola eklendi
recent-activity-account-password-changed = Parola değiştirildi
recent-activity-account-secondary-email-added = İkinci e-posta adresi eklendi
recent-activity-account-secondary-email-removed = İkinci e-posta adresi kaldırıldı
recent-activity-account-emails-swapped = Birinci ve ikinci e-postalar birbirleriyle değiştirildi
recent-activity-session-destroy = Oturum kapatıldı
recent-activity-account-recovery-phone-send-code = Kurtarma telefon kodu gönderildi
recent-activity-account-recovery-phone-setup-complete = Kurtarma telefonu kurulumu tamamlandı
recent-activity-account-recovery-phone-signin-complete = Kurtarma telefonuyla giriş tamamlandı
recent-activity-account-recovery-phone-signin-failed = Kurtarma telefonuyla giriş başarısız oldu
recent-activity-account-recovery-phone-removed = Kurtarma telefonu kaldırıldı
recent-activity-account-recovery-codes-replaced = Kurtarma kodları değiştirildi
recent-activity-account-recovery-codes-created = Kurtarma kodları oluşturuldu
recent-activity-account-recovery-codes-signin-complete = Kurtarma kodlarıyla giriş tamamlandı
recent-activity-password-reset-otp-sent = Parola sıfırlama onay kodu gönderildi
recent-activity-password-reset-otp-verified = Parola sıfırlama onay kodu doğrulandı
recent-activity-must-reset-password = Parola sıfırlama gerekli
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Diğer hesap etkinlikleri

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Hesap kurtarma anahtarı
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Ayarlara dön

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Kurtarma telefon numarasını kaldır
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Bu işlem <strong>{ $formattedFullPhoneNumber }</strong> numaralı kurtarma telefonunuzu kaldıracaktır.
settings-recovery-phone-remove-recommend = Yedek kimlik doğrulama kodlarını kaydetmekten daha kolay olduğu için bu yöntemi kullanmanızı öneriyoruz.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Telefon numaranızı silseniz bile kayıtlı yedek kimlik doğrulama kodlarınız olduğundan emin olun. <linkExternal>Kurtarma yöntemlerini karşılaştırın</linkExternal>
settings-recovery-phone-remove-button = Telefon numarasını kaldır
settings-recovery-phone-remove-cancel = Vazgeç
settings-recovery-phone-remove-success = Kurtarma telefonu kaldırıldı

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Kurtarma telefonu ekle
page-change-recovery-phone = Kurtarma telefonunu değiştir
page-setup-recovery-phone-back-button-title = Ayarlara dön
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Telefon numarasını değiştir

## Add secondary email page

add-secondary-email-step-1 = Adım 1/2
add-secondary-email-error-2 = Bu e-posta oluşturulurken bir sorun oluştu
add-secondary-email-page-title =
    .title = İkinci e-posta
add-secondary-email-enter-address =
    .label = E-posta adresinizi yazın
add-secondary-email-cancel-button = İptal
add-secondary-email-save-button = Kaydet
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = İkinci e-posta olarak e-posta maskesi kullanılamaz

## Verify secondary email page

add-secondary-email-step-2 = Adım 2/2
verify-secondary-email-page-title =
    .title = İkinci e-posta
verify-secondary-email-verification-code-2 =
    .label = Onay kodunuzu girin
verify-secondary-email-cancel-button = İptal
verify-secondary-email-verify-button-2 = Onayla
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Lütfen <strong>{ $email }</strong> adresine gönderilen onay kodunu 5 dakika içinde girin.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } başarıyla eklendi
verify-secondary-email-resend-code-button = Onay kodunu yeniden gönder

##

# Link to delete account on main Settings page
delete-account-link = Hesabı sil
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Başarıyla giriş yapıldı. { -product-mozilla-account }nız ve verileriniz aktif kalacak.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Kişisel bilgilerinizin nerede ele geçirildiğini öğrenin
# Links out to the Monitor site
product-promo-monitor-cta = Ücretsiz taramayı başlat

## Profile section

profile-heading = Profil
profile-picture =
    .header = Fotoğraf
profile-display-name =
    .header = Görünen ad
profile-primary-email =
    .header = Birinci e-posta

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Adım { $currentStep }/{ $numberOfSteps }.

## Security section of Setting

security-heading = Güvenlik
security-password =
    .header = Parola
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Oluşturma: { $date }
security-not-set = Ayarlanmamış
security-action-create = Oluştur
security-set-password = Eşitleme yapmak ve belirli hesap güvenlik özelliklerini kullanmak için parolanızı belirleyin.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Son hesap etkinliklerini görüntüle
signout-sync-header = Oturumun süresi doldu
signout-sync-session-expired = Bir şeyler yanlış gitti. Lütfen tarayıcı menüsünden çıkış yapıp yeniden deneyin.

## SubRow component

tfa-row-backup-codes-title = Yedek kimlik doğrulama kodları
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Hiç kod kalmamış
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } kod kaldı
       *[other] { $numCodesAvailable } kod kaldı
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Yeni kodlar oluştur
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Ekle
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Mobil cihazınızı veya kimlik doğrulama uygulamanızı kullanamıyorsanız bu en güvenli kurtarma yöntemidir.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Kurtarma telefonu
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Telefon numarası eklemediniz
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Değiştir
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Ekle
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Kaldır
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Kurtarma telefonunu kaldır
tfa-row-backup-phone-delete-restriction-v2 = Kurtarma telefonunuzu kaldırmak istiyorsanız hesabınızın kilitlenmesini önlemek için öncelikle yedek kimlik doğrulama kodlarını ekleyin veya iki aşamalı kimlik doğrulamayı devre dışı bırakın.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Kimlik doğrulama uygulamanızı kullanamıyorsanız bu en kolay kurtarma yöntemidir.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = SIM swap saldırısı bilgi alın

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Kapat
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Aç
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Gönderiliyor…
switch-is-on = açık
switch-is-off = kapalı

## Sub-section row Defaults

row-defaults-action-add = Ekle
row-defaults-action-change = Değiştir
row-defaults-action-disable = Devre dışı bırak
row-defaults-status = Yok

## Account recovery key sub-section on main Settings page

rk-header-1 = Hesap kurtarma anahtarı
rk-enabled = Etkin
rk-not-set = Ayarlanmamış
rk-action-create = Oluştur
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Değiştir
rk-action-remove = Kaldır
rk-key-removed-2 = Hesap kurtarma anahtarı silindi
rk-cannot-remove-key = Hesap kurtarma anahtarınız silinemedi.
rk-refresh-key-1 = Hesap kurtarma anahtarını yenile
rk-content-explain = Parolanızı unutursanız bilgilerinizi geri yüklemenizi sağlar.
rk-cannot-verify-session-4 = Oturumunuz onaylanırken bir sorun oluştu
rk-remove-modal-heading-1 = Hesap kurtarma anahtarı kaldırılsın mı?
rk-remove-modal-content-1 = Parolanızı sıfırlarsanız verilerinize tekrar erişmek için hesap kurtarma anahtarınızı kullanamayacaksınız. Bu işlemi geri alamazsınız.
rk-remove-error-2 = Hesap kurtarma anahtarınız kaldırılamadı
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Hesap kurtarma anahtarını sil

## Secondary email sub-section on main Settings page

se-heading = İkinci e-posta
    .header = İkinci e-posta
se-cannot-refresh-email = Üzgünüz, bu e-posta yenilenirken bir sorun oluştu.
se-cannot-resend-code-3 = Onay kodu yeniden gönderilirken bir sorun oluştu
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } artık birinci e-postanız
se-set-primary-error-2 = Üzgünüz, birinci e-postanız değiştirilirken bir sorun oluştu
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } başarıyla silindi
se-delete-email-error-2 = Üzgünüz, bu e-posta silinirken bir sorun oluştu
se-verify-session-3 = Bu işlemi gerçekleştirmek için mevcut oturumunuzu onaylamalısınız
se-verify-session-error-3 = Oturumunuz onaylanırken bir sorun oluştu
# Button to remove the secondary email
se-remove-email =
    .title = E-postayı kaldır
# Button to refresh secondary email status
se-refresh-email =
    .title = E-postayı yenile
se-unverified-2 = onaylanmamış
se-resend-code-2 = Onay gerekiyor. Onay kodu gelen kutunuzda ve spam klasörünüzde görünmüyorsa <button>tekrar gönderebilirsiniz</button>.
# Button to make secondary email the primary
se-make-primary = Birinci yap
se-default-content = Birinci e-postanıza ulaşamasanız bile hesabınıza erişmenizi sağlar.
se-content-note-1 = Not: İkinci e-postanızı kullandığınızda bilgileriniz geri yüklenmeyecektir. Bunun için <a>hesap kurtarma anahtarı</a> kullanmanız gerekiyor.
# Default value for the secondary email
se-secondary-email-none = Yok

## Two Step Auth sub-section on Settings main page

tfa-row-header = İki aşamalı doğrulama
tfa-row-enabled = Etkin
tfa-row-disabled-status = Devre dışı
tfa-row-action-add = Ekle
tfa-row-action-disable = Devre dışı bırak
tfa-row-action-change = Değiştir
tfa-row-button-refresh =
    .title = İki aşamalı doğrulamayı yenile
tfa-row-cannot-refresh =
    Üzgünüz, iki aşamalı doğrulama yenilenirken
    bir sorun oluştu.
tfa-row-enabled-description = Hesabınız iki aşamalı doğrulamayla korunuyor. { -product-mozilla-account }nıza giriş yaparken kimlik doğrulama uygulamanızdan alacağınız tek kullanımlık kodu girmeniz gerekecektir.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = İki aşamalı kimlik doğrulama, hesabınızı nasıl korur?
tfa-row-disabled-description-v2 = Giriş yaparken ikinci adım olarak üçüncü taraf bir kimlik doğrulama uygulaması kullanarak hesabınızın güvenliğini sağlayın.
tfa-row-cannot-verify-session-4 = Oturumunuz onaylanırken bir sorun oluştu
tfa-row-disable-modal-heading = İki aşamalı doğrulama devre dışı bırakılsın mı?
tfa-row-disable-modal-confirm = Devre dışı bırak
tfa-row-disable-modal-explain-1 = Bu işlemi geri alamazsınız. İsterseniz <linkExternal>yedek kimlik doğrulama kodlarınızı değiştirebilirisiniz</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = İki aşamalı kimlik doğrulama kapatıldı
tfa-row-cannot-disable-2 = İki aşamalı doğrulama devre dışı bırakılamadı
tfa-row-verify-session-info = İki aşamalı doğrulamayı ayarlamak için mevcut oturumunuzu onaylamalısınız

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Devam ettiğinizde şunları kabul etmiş olursunuz:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } Abonelik Hizmetleri <mozSubscriptionTosLink>Hizmet Koşulları</mozSubscriptionTosLink> ve <mozSubscriptionPrivacyLink>Gizlilik Bildirimi</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>Hizmet Koşulları</mozillaAccountsTos> ve <mozillaAccountsPrivacy>Gizlilik Bildirimi</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Devam ederek <mozillaAccountsTos>Hizmet Koşulları</mozillaAccountsTos>’nı ve <mozillaAccountsPrivacy>Gizlilik Bildirimi</mozillaAccountsPrivacy>’ni kabul etmiş olursunuz.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = veya
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Bununla giriş yap
continue-with-google-button = { -brand-google } ile devam et
continue-with-apple-button = { -brand-apple } ile devam et

## Auth-server based errors that originate from backend service

auth-error-102 = Bilinmeyen hesap
auth-error-103 = Parola yanlış
auth-error-105-2 = Geçersiz onay kodu
auth-error-110 = Geçersiz jeton
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Çok fazla deneme yaptınız. Lütfen daha sonra yeniden deneyin.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Çok fazla deneme yaptınız. { $retryAfter } yeniden deneyin.
auth-error-125 = Bu istek güvenlik nedeniyle engellendi
auth-error-129-2 = Geçersiz bir telefon numarası yazdınız. Lütfen kontrol edip yeniden deneyin.
auth-error-138-2 = Onaylanmamış oturum
auth-error-139 = İkinci e-posta, hesap e-posta adresinizden farklı olmalıdır
auth-error-155 = TOTP jetonu bulunamadı
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Yedek kimlik doğrulama kodu bulunamadı
auth-error-159 = Geçersiz hesap kurtarma anahtarı
auth-error-183-2 = Geçersiz veya süresi dolmuş onay kodu
auth-error-202 = Özellik etkin değil
auth-error-203 = Sistem şu an kullanılamıyor, daha sonra yeniden deneyin
auth-error-206 = Parola zaten belirlenmiş olduğu için parola oluşturulamıyor
auth-error-214 = Kurtarma telefon numarası zaten mevcut
auth-error-215 = Kurtarma telefon numarası mevcut değil
auth-error-216 = SMS sınırına ulaşıldı
auth-error-218 = Yedek kimlik doğrulama kodları eksik olduğu için kurtarma telefonu kaldırılamadı.
auth-error-219 = Bu telefon numarası çok fazla hesaba kayıtlı. Lütfen farklı bir numara deneyin.
auth-error-999 = Beklenmeyen hata
auth-error-1001 = Giriş denemesi iptal edildi
auth-error-1002 = Oturum zaman aşımına uğradı. Devam etmek için giriş yapın.
auth-error-1003 = Yerel depolama veya çerezler hâlâ devre dışı
auth-error-1008 = Yeni parolanız farklı olmalıdır
auth-error-1010 = Geçerli parola gerekli
auth-error-1011 = Geçerli bir e-posta gerekiyor
auth-error-1018 = Onay e-postanız geri döndü. E-posta adresinizi yanlış yazmış olabilir misiniz?
auth-error-1020 = E-postanızı yanlış mı yazdınız? firefox.com geçerli bir e-posta servisi değildir
auth-error-1031 = Kaydolmak için yaşınızı belirtmelisiniz
auth-error-1032 = Kaydolmak için geçerli bir yaş belirtmelisiniz
auth-error-1054 = İki aşamalı kimlik doğrulama kodu geçersiz
auth-error-1056 = Geçersiz yedek kimlik doğrulama kodu
auth-error-1062 = Geçersiz yönlendirme
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = E-postanızı yanlış mı yazdınız? { $domain } geçerli bir e-posta servisi değildir
auth-error-1066 = Hesap oluşturmak için e-posta maskeleri kullanılamaz.
auth-error-1067 = Adresinizi yanlış mı yazdınız?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = { $lastFourPhoneNumber } ile biten numara
oauth-error-1000 = Bir şeyler yanlış gitti. Lütfen bu sekmeyi kapatıp yeniden deneyin.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = { -brand-firefox }’a giriş yaptınız
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-posta onaylandı
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Giriş onaylandı
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Kurulumu tamamlamak için bu { -brand-firefox }’a giriş yapın
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Giriş yap
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Hâlâ cihaz mı ekliyorsunuz? Kurulumu tamamlamak için başka bir cihazdan { -brand-firefox }’a giriş yapın
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Kurulumu tamamlamak için başka bir cihazdan { -brand-firefox }’a giriş yapın
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Sekmelerinizi, yer imlerinizi ve parolalarınızı başka cihazlarda da kullanmak ister misiniz?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Başka bir cihaz bağla
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Şimdi değil
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Kurulumu tamamlamak için Android için { -brand-firefox }’a giriş yapın
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Kurulumu tamamlamak için iOS için { -brand-firefox }’a giriş yapın

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Yerel depolama ve çerezler gereklidir
cookies-disabled-enable-prompt-2 = { -product-mozilla-account }nıza erişmek için lütfen tarayıcınızda çerezleri ve yerel depolamayı etkinleştirin. Bu sayede oturumlar arasında sizi hatırlama gibi işlevleri kullanabileceğiz.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Tekrar dene
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Daha fazla bilgi al

## Index / home page

index-header = E-posta adresinizi yazın
index-sync-header = { -product-mozilla-account }nıza devam edin
index-sync-subheader = { -brand-firefox }’u kullandığınız her yerde parolalarınızı, sekmelerinizi ve yer imlerinizi eşitleyin.
index-relay-header = E-posta maskesi oluştur
index-relay-subheader = Lütfen maskeli e-posta adresinize gelen e-postaların iletileceği e-posta adresini girin.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = { $serviceName } hizmetine devam et
index-subheader-default = Hesap ayarlarına devam et
index-cta = Kaydol veya giriş yap
index-account-info = { -product-mozilla-account }, gizliliğinizi koruyan diğer { -brand-mozilla } ürünlerine de erişmenizi sağlar.
index-email-input =
    .label = E-posta adresinizi yazın
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Hesap başarıyla silindi
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Onay e-postanız geri döndü. E-posta adresinizi yanlış yazmış olabilir misiniz?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Hesap kurtarma anahtarınızı oluşturamadık. Lütfen daha sonra yeniden deneyin.
inline-recovery-key-setup-recovery-created = Hesap kurtarma anahtarı oluşturuldu
inline-recovery-key-setup-download-header = Hesabınızın güvenliğini sağlayın
inline-recovery-key-setup-download-subheader = Hemen indirip saklayın
inline-recovery-key-setup-download-info = Bu anahtarı unutmayacağınız bir yerde saklayın. Daha sonra bu sayfaya geri dönemeyeceksiniz.
inline-recovery-key-setup-hint-header = Güvenlik önerisi

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Kurulumu iptal et
inline-totp-setup-continue-button = Devam et
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = <authenticationAppsLink>Bu kimlik doğrulama uygulamalarından</authenticationAppsLink> biriyle kimlik doğrulama kodları oluşturarak hesabınızın güvenliğini artırın.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = <span>Hesap ayarlarına devam etmek için</span> iki aşamalı kimlik doğrulamayı etkinleştirin
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = <span>{ $serviceName } hizmetine devam etmek için</span> iki aşamalı kimlik doğrulamayı etkinleştirin
inline-totp-setup-ready-button = Hazır
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = <span>{ $serviceName } hizmetine devam etmek için</span> kimlik doğrulama kodunu tarayın
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = <span>{ $serviceName } hizmetine devam etmek için</span> kodu girin
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = <span>Hesap ayarlarına devam etmek için</span> kimlik doğrulama kodunu okutun
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = <span>Hesap ayarlarına devam etmek için</span> kodu girin
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Bu anahtarı kimlik doğrulama uygulamanıza yazın. <toggleToQRButton>Bunun yerine QR kodunu da okutabilirsiniz.</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Kimlik doğrulama uygulamanıza QR kodunu okutun ve karşısına gelen kimlik doğrulama kodunu buraya girin. <toggleToManualModeButton>Kodu okutamıyor musunuz?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = İşlem tamamlandığında kimlik doğrulama kodları oluşturulmaya başlanacaktır.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Kimlik doğrulama kodu
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Kimlik doğrulama kodu gerekli
tfa-qr-code-alt = Desteklenen uygulamalarda iki aşamalı doğrulamayı kurmak için { $code } kodunu kullanın.
inline-totp-setup-page-title = İki aşamalı doğrulama

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Hukuki Bilgiler
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Hizmet Koşulları
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Gizlilik Bildirimi

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Gizlilik Bildirimi

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Hizmet Koşulları

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Az önce { -product-firefox }’a giriş yaptınız mı?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Evet, cihazı onayla
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Giriş yapan siz değilseniz <link>parolanızı değiştirin</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Cihaz bağlandı
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Artık { $deviceOS } üzerindeki { $deviceFamily } ile eşitleme yapıyorsunuz
pair-auth-complete-sync-benefits-text = Artık açık sekmelerinize, parolalarınıza ve yer imlerinize tüm cihazlarınızdan erişebilirsiniz.
pair-auth-complete-see-tabs-button = Eşitlenmiş cihazlardan sekmeleri gör
pair-auth-complete-manage-devices-link = Cihazları yönet

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = <span>Hesap ayarlarına devam etmek için</span> kimlik doğrulama kodunu yazın
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = <span>{ $serviceName } hizmetine devam etmek için</span> kimlik doğrulama kodunu yazın
auth-totp-instruction = Kimlik doğrulama uygulamanızı açın ve uygulamanın verdiği kimlik doğrulama kodunu yazın.
auth-totp-input-label = 6 basamaklı kodu yazın
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Onayla
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Kimlik doğrulama kodu gerekli

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Şimdi <span>diğer cihazınızdan</span> onay vermeniz gerekiyor

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Eşleştirme başarısız oldu
pair-failure-message = Kurulum işlemi sonlandırıldı.

## Pair index page

pair-sync-header = { -brand-firefox }’u telefonunuz veya tabletinizle eşitleyin
pair-cad-header = Başka bir cihazdaki { -brand-firefox }’u bağlayın
pair-already-have-firefox-paragraph = Telefonunuzda veya tabletinizde zaten { -brand-firefox } var mı?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Cihazınızı eşitleyin
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = veya indirin
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Mobil cihazlar için { -brand-firefox }’u indirmek için kodu tarayın veya kendinize bir <linkExternal>indirme bağlantısı</linkExternal> gönderin.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Şimdi değil
pair-take-your-data-message = Sekmelerinizi, yer imlerinizi ve parolalarınızı { -brand-firefox }’u kullandığınız her yere götürün.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Başlayın
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR Kodu

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Cihaz bağlandı
pair-success-message-2 = Eşleştirme başarılı.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = <span>{ $email }</span> için eşleştirmeyi onaylayın
pair-supp-allow-confirm-button = Eşleştirmeyi onayla
pair-supp-allow-cancel-link = Vazgeç

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Şimdi <span>diğer cihazınızdan</span> onay vermeniz gerekiyor

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Uygulama kullanarak eşleştir
pair-unsupported-message = Sistem kamerasını mı kullandınız? Bir { -brand-firefox } uygulaması içinden eşleştirme yapmalısınız.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Eşitleme için parola oluşturun
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Bu işlem verilerinizi şifreler. { -brand-google } veya { -brand-apple } hesabınızın parolasından farklı olmalıdır.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Lütfen bekleyin, yetkili uygulamaya yönlendiriliyorsunuz.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Hesap kurtarma anahtarınızı girin
account-recovery-confirm-key-instruction = Bu anahtar, { -brand-firefox } sunucularındaki parolalarınız ve yer imleriniz gibi şifrelenmiş gezinti verilerinizi kurtarır.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = 32 karakterli hesap kurtarma anahtarınızı girin
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Saklama ipucunuz:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = İleri
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Hesap kurtarma anahtarınızı bulamıyor musunuz?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Yeni parola oluşturun
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Parola ayarlandı
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Parolanız ayarlanırken bir sorun oluştu
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Hesap kurtarma anahtarını kullan
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Parolanız sıfırlandı.
reset-password-complete-banner-message = Gelecekte sorun yaşamamak için { -product-mozilla-account } ayarlarınızdan yeni bir hesap kurtarma anahtarı oluşturmayı unutmayın.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox }, giriş yaptıktan sonra sizi e-posta maskesi kullanmaya yönlendirecektir.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = 10 karakterli kodu yazın
confirm-backup-code-reset-password-confirm-button = Onayla
confirm-backup-code-reset-password-subheader = Yedek kimlik doğrulama kodunu yazın
confirm-backup-code-reset-password-instruction = İki aşamalı doğrulamayı kurarken kaydettiğiniz tek kullanımlık kodlardan birini girin.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Hesabınız kilitlendi mi?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = E-postanızı kontrol edin
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = <span>{ $email }</span> adresine bir onay kodu gönderdik.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = 8 basamaklı kodu 10 dakika içinde yazın
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Devam
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Kodu yeniden gönder
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Farklı bir hesap kullan

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Parolanızı sıfırlayın
confirm-totp-reset-password-subheader-v2 = İki aşamalı kimlik doğrulama kodunu yazın
confirm-totp-reset-password-instruction-v2 = Parolanızı sıfırlamak için <strong>kimlik doğrulama uygulamanızı</strong> kontrol edin.
confirm-totp-reset-password-trouble-code = Kod girerken sorun mu yaşıyorsunuz?
confirm-totp-reset-password-confirm-button = Onayla
confirm-totp-reset-password-input-label-v2 = 6 basamaklı kodu yazın
confirm-totp-reset-password-use-different-account = Farklı bir hesap kullan

## ResetPassword start page

password-reset-flow-heading = Parolanızı sıfırlayın
password-reset-body-2 = Hesabınızı güvende tutmak için yalnızca sizin bildiğiniz birkaç şey soracağız.
password-reset-email-input =
    .label = E-posta adresinizi yazın
password-reset-submit-button-2 = Devam et

## ResetPasswordConfirmed

reset-password-complete-header = Parolanız sıfırlandı
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = { $serviceName } hizmetine devam et

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Parolanızı sıfırlayın
password-reset-recovery-method-subheader = Bir kurtarma yöntemi seçin
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Kurtarma yöntemlerinizi kullanan kişinin siz olduğunuzdan emin olmamız gerekiyor.
password-reset-recovery-method-phone = Kurtarma telefonu
password-reset-recovery-method-code = Yedek kimlik doğrulama kodları
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kod kaldı
       *[other] { $numBackupCodes } kod kaldı
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Kurtarma telefonunuza kod gönderilirken bir sorun oluştu
password-reset-recovery-method-send-code-error-description = Lütfen daha sonra yeniden deneyin veya yedek kimlik doğrulama kodlarınızı kullanın.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Parolanızı sıfırlayın
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Kurtarma kodunu girin
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = <span>{ $lastFourPhoneDigits }</span> ile biten telefon numarasına kısa mesajla 6 basamaklı bir kod gönderdik. Bu kodun geçerlilik süresi 5 dakikadır. Kodu hiç kimseyle paylaşmayın.
reset-password-recovery-phone-input-label = 6 basamaklı kodu yazın
reset-password-recovery-phone-code-submit-button = Onayla
reset-password-recovery-phone-resend-code-button = Kodu yeniden gönder
reset-password-recovery-phone-resend-success = Kod gönderildi
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Hesabınız kilitlendi mi?
reset-password-recovery-phone-send-code-error-heading = Kod gönderilirken bir sorun oluştu
reset-password-recovery-phone-code-verification-error-heading = Kodunuz doğrulanırken bir sorun oluştu
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Lütfen daha sonra yeniden deneyin.
reset-password-recovery-phone-invalid-code-error-description = Kod geçersiz veya süresi dolmuş.
reset-password-recovery-phone-invalid-code-error-link = Bunun yerine yedek kimlik doğrulama kodları kullanılsın mı?
reset-password-with-recovery-key-verified-page-title = Parola başarıyla sıfırlandı
reset-password-complete-new-password-saved = Yeni parola kaydedildi!
reset-password-complete-recovery-key-created = Yeni hesap kurtarma anahtarı oluşturuldu. Hemen indirip saklayın.
reset-password-complete-recovery-key-download-info = Parolanızı unutursanız verilerinizi kurtarmak için bu anahtara sahip olmalısınız. <b>Şimdi indirip güvenli bir şekilde saklayın. Daha sonra bu sayfaya erişemeyeceksiniz.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Hata:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Giriş doğrulanıyor…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Doğrulama hatası
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Onay bağlantısının süresi dolmuş
signin-link-expired-message-2 = Tıkladığınız bağlantının süresi dolmuş veya bağlantı daha önce kullanılmış.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = <span>{ -product-mozilla-account }</span> parolanızı yazın
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = { $serviceName } hizmetine devam et
signin-subheader-without-logo-default = Hesap ayarlarına devam et
signin-button = Giriş yap
signin-header = Giriş yap
signin-use-a-different-account-link = Farklı bir hesap kullan
signin-forgot-password-link = Parolanızı unuttunuz mu?
signin-password-button-label = Parola
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox }, giriş yaptıktan sonra sizi e-posta maskesi kullanmaya yönlendirecektir.
signin-code-expired-error = Kodun süresi doldu. Lütfen yeniden giriş yapın.
signin-account-locked-banner-heading = Parolanızı sıfırlayın
signin-account-locked-banner-description = Şüpheli etkinliklerden korumak için hesabınızı kilitledik.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Giriş yapmak için parolanızı sıfırlayın

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Tıkladığınız bağlantıda bazı karakterler eksikti. Bağlantı, e-posta istemciniz tarafından bozulmuş olabilir. Adresi dikkatle kopyalayıp tekrar deneyin.
report-signin-header = İzinsiz giriş rapor edilsin mi?
report-signin-body = Hesabınıza yapılan bir giriş denemesiyle ilgili bir e-posta aldınız. Bu denemeyi şüpheli etkinlik olarak rapor etmek ister misiniz?
report-signin-submit-button = Etkinliği rapor et
report-signin-support-link = Neden böyle bir şey oldu?
report-signin-error = Rapor gönderilirken bir sorun oluştu.
signin-bounced-header = Kusura bakmayın, hesabınızı kilitledik.
# $email (string) - The user's email.
signin-bounced-message = { $email } adresine gönderdiğimiz onay e-postası geri döndüğü için { -brand-firefox } verilerinizi korumak amacıyla hesabınızı kilitledik.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Bu e-posta adresi geçerliyse <linkExternal>bize haber verirseniz</linkExternal> hesabınızı açmanıza yardımcı olabiliriz.
signin-bounced-create-new-account = Bu e-posta adresine artık ulaşamıyor musunuz? Yeni bir hesap açın
back = Geri dön

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = <span>Hesap ayarlarına devam etmek için</span> bu hesabı doğrulayın
signin-push-code-heading-w-custom-service = <span>{ $serviceName } hizmetine devam etmek için</span> bu hesabı doğrulayın
signin-push-code-instruction = Lütfen diğer cihazlarınızı kontrol ederek { -brand-firefox } tarayıcınızdan bu girişi doğrulayın.
signin-push-code-did-not-recieve = Bildirim almadınız mı?
signin-push-code-send-email-link = Kodu e-posta ile gönder

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Girişinizi onaylayın
signin-push-code-confirm-description = Aşağıdaki cihazdan giriş yapılmaya çalışıldığını tespit ettik. Siz yaptıysanız lütfen girişi onaylayın
signin-push-code-confirm-verifying = Doğrulanıyor
signin-push-code-confirm-login = Girişi onayla
signin-push-code-confirm-wasnt-me = Bu ben değilim, parolayı değiştir.
signin-push-code-confirm-login-approved = Girişiniz onaylandı. Lütfen bu pencereyi kapatın.
signin-push-code-confirm-link-error = Bağlantı bozulmuş. Lütfen yeniden deneyin.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Giriş yap
signin-recovery-method-subheader = Bir kurtarma yöntemi seçin
signin-recovery-method-details = Kurtarma yöntemlerinizi kullanan kişinin siz olduğunuzdan emin olmamız gerekiyor.
signin-recovery-method-phone = Kurtarma telefonu
signin-recovery-method-code-v2 = Yedek kimlik doğrulama kodları
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kod kaldı
       *[other] { $numBackupCodes } kod kaldı
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Kurtarma telefonunuza kod gönderilirken bir sorun oluştu
signin-recovery-method-send-code-error-description = Lütfen daha sonra yeniden deneyin veya yedek kimlik doğrulama kodlarınızı kullanın.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Giriş yap
signin-recovery-code-sub-heading = Yedek kimlik doğrulama kodunuzu yazın
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = İki aşamalı doğrulamayı kurarken kaydettiğiniz tek kullanımlık kodlardan birini girin.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = 10 karakterli kodu yazın
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Onayla
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Kurtarma telefonunu kullan
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Hesabınız kilitlendi mi?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Yedek kimlik doğrulama kodu gerekli
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Kurtarma telefonunuza kod gönderilirken bir sorun oluştu
signin-recovery-code-use-phone-failure-description = Lütfen daha sonra yeniden deneyin.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Giriş yap
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Kurtarma kodunu girin
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = <span>{ $lastFourPhoneDigits }</span> ile biten telefon numarasına kısa mesajla altı haneli bir kod gönderdik. Bu kodun geçerlilik süresi 5 dakikadır. Kodu hiç kimseyle paylaşmayın.
signin-recovery-phone-input-label = 6 basamaklı kodu girin
signin-recovery-phone-code-submit-button = Onayla
signin-recovery-phone-resend-code-button = Kodu yeniden gönder
signin-recovery-phone-resend-success = Kod gönderildi
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Hesabınız kilitlendi mi?
signin-recovery-phone-send-code-error-heading = Kod gönderilirken bir sorun oluştu
signin-recovery-phone-code-verification-error-heading = Kodunuz doğrulanırken bir sorun oluştu
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Lütfen daha sonra yeniden deneyin.
signin-recovery-phone-invalid-code-error-description = Kod geçersiz veya süresi dolmuş.
signin-recovery-phone-invalid-code-error-link = Bunun yerine yedek kimlik doğrulama kodları kullanılsın mı?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Başarıyla giriş yapıldı. Kurtarma telefonunuzu tekrar kullanırsanız kısıtlamalar uygulanabilir.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Desteğiniz için teşekkür ederiz
signin-reported-message = Ekibimiz bilgilendirildi. Bu gibi raporlar, saldırganları dışarıda tutmamıza yardımcı oluyor.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = <span>{ -product-mozilla-account }</span> onay kodunuzu yazın
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = <email>{ $email }</email> adresine gönderdiğimiz kodu 5 dakika içinde girin.
signin-token-code-input-label-v2 = 6 basamaklı kodu girin
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Onayla
signin-token-code-code-expired = Kodun süresi mi doldu?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = E-posta ile yeni kod gönder.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Onay kodu gerekiyor
signin-token-code-resend-error = Bir sorun oluştu. Yeni kod gönderilemedi.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox }, giriş yaptıktan sonra sizi e-posta maskesi kullanmaya yönlendirecektir.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Giriş yap
signin-totp-code-subheader-v2 = İki aşamalı kimlik doğrulama kodunuzu yazın
signin-totp-code-instruction-v4 = Giriş işleminizi onaylamak için <strong>kimlik doğrulama uygulamanızı</strong> kontrol edin.
signin-totp-code-input-label-v4 = 6 basamaklı kodu yazın
signin-totp-code-aal-sign-out-error = Üzgünüz, çıkış yapılırken bir sorun oluştu
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Onayla
signin-totp-code-other-account-link = Farklı bir hesap kullan
signin-totp-code-recovery-code-link = Kod girerken sorun mu yaşıyorsunuz?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Kimlik doğrulama kodu gerekli
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox }, giriş yaptıktan sonra sizi e-posta maskesi kullanmaya yönlendirecektir.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Bu girişe izin ver
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = { $email } adresine gönderdiğimiz yetkilendirme kodunu kontrol edin.
signin-unblock-code-input = Yetkilendirme kodunu girin
signin-unblock-submit-button = Devam et
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Yetkilendirme kodu gerekli
signin-unblock-code-incorrect-length = Yetkilendirme kodu 8 karakterden oluşmalıdır
signin-unblock-code-incorrect-format-2 = Yetkilendirme kodu yalnızca harf ve rakamlardan oluşabilir
signin-unblock-resend-code-button = Gelen kutusunda ve spam klasöründe göremediniz mi? Yeniden gönderin
signin-unblock-support-link = Neden böyle bir şey oldu?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox }, giriş yaptıktan sonra sizi e-posta maskesi kullanmaya yönlendirecektir.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Onay kodunu girin
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = <span>{ -product-mozilla-account }</span> onay kodunuzu yazın
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = <email>{ $email }</email> adresine gönderdiğimiz kodu 5 dakika içinde girin.
confirm-signup-code-input-label = 6 basamaklı kodu girin
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Onayla
confirm-signup-code-sync-button = Eşitlemeyi başlat
confirm-signup-code-code-expired = Kodun süresi mi doldu?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = E-posta ile yeni kod gönder.
confirm-signup-code-success-alert = Hesap başarıyla onaylandı
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Onay kodu gerekli
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox }, giriş yaptıktan sonra sizi e-posta maskesi kullanmaya yönlendirecektir.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Parola oluşturun
signup-relay-info = Maskeli e-postalarınızı güvenli bir şekilde yönetmek ve { -brand-mozilla }’nın güvenlik araçlarına erişmek için bir parolaya ihtiyacınız var.
signup-sync-info = { -brand-firefox }’u kullandığınız her yerde parolalarınızı, yer imlerinizi ve daha fazlasını eşitleyin.
signup-sync-info-with-payment = { -brand-firefox }’u kullandığınız her yerde parolalarınızı, ödeme yöntemlerinizi, yer imlerinizi ve daha fazlasını eşitleyin.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = E-postayı değiştir

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Eşitleme açıldı
signup-confirmed-sync-success-banner = { -product-mozilla-account } onaylandı
signup-confirmed-sync-button = Gezinmeye başla
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Parolalarınız, ödeme yöntemleriniz, adresleriniz, yer imleriniz, geçmişiniz ve diğer bilgileriniz { -brand-firefox } kullandığınız her yerde eşitlenebilir.
signup-confirmed-sync-description-v2 = Parolalarınız, adresleriniz, yer imleriniz, geçmişiniz ve diğer bilgileriniz { -brand-firefox } kullandığınız her yerde eşitlenebilir.
signup-confirmed-sync-add-device-link = Başka bir cihaz ekle
signup-confirmed-sync-manage-sync-button = Eşitlemeyi yönet
signup-confirmed-sync-set-password-success-banner = Sync parolası oluşturuldu
