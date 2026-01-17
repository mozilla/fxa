## Non-email strings

session-verify-send-push-title-2 = { -product-mozilla-account } эченә кердегезме?
session-verify-send-push-body-2 = Сез икәнегезне раслау өчен монда басыгыз
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } раслау коды: { $code }
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } коды: { $code }
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } коды: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } логотибы">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Җиһазларны синхронлау">
body-devices-image = <img data-l10n-name="devices-image" alt="Җиһазлар">
fxa-privacy-url = { -brand-mozilla }’ның Хосусыйлык Сәясәте
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Хосусыйлык Аңлатмасы
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } Куллану Шартлары
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } логотибы">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } логотибы">
subplat-automated-email = Бу автоматик электрон хат. Аның килүе бер хата аркасында булды дип уйласагыз, берни дә эшләргә кирәкми.
subplat-privacy-notice = Хосусыйлык аңлатмасы
subplat-privacy-plaintext = Хоусыйлык аңлатмасы:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = { $email } адресы өчен { -product-mozilla-account } аккаунты булганы һәм Сез { $productName } хезмәтенә теркәлгәнегез өчен, Сезгә бу хат җибәрелде.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = { $email } адресы өчен { -product-mozilla-account } хисабы булганга, Сезгә бу хат җибәрелде.
subplat-explainer-multiple-2 = { $email } адресы өчен { -product-mozilla-account } аккаунты булганга һәм Сез берничә продуктка язылганга күрә, Сезгә бу хат җибәрелде.
subplat-explainer-was-deleted-2 = { $email } адресы өчен { -product-mozilla-account } хисабы булганы өчен, Сезгә бу хат җибәрелде.
subplat-manage-account-2 = { -product-mozilla-account } көйләүләрен <a data-l10n-name="subplat-account-page">Хисап битегездә</a> үзгәртә аласыз.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = { -product-mozilla-account } көйләүләрен хисап битегездә карап һәм үзгәртеп була: { $accountSettingsUrl }
subplat-terms-policy = Шартлар һәм баш тарту сәясәте
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Язылудан баш тарту
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Язылуны яңадан активлаштыру
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Түләү турындагы мәгълүматны яңарту
subplat-privacy-policy = { -brand-mozilla }-ның Хосусыйлык Сәясәте
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Хосусыйлык Аңлатмасы
subplat-privacy-policy-plaintext = { subplat-privacy-policy } :
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } Куллану Шартлары
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Хокукый мәсьәләләр
subplat-legal-plaintext = { subplat-legal }：
subplat-privacy = Хосусыйлык
subplat-privacy-website-plaintext = { subplat-privacy }：
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName }-ны { -google-play }-дан йөкләп алу">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName }-ны { -app-store }-дан йөкләп алу">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = { $productName } кушымтасын <a data-l10n-name="anotherDeviceLink"> башка компьютерга</a> урнаштырыгыз.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = { $productName } кушымтасын <a data-l10n-name="anotherDeviceLink">башка җиһазга</a> урнаштырыгыз.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = { $productName } кушымтасын Google Play-дан алу:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = { $productName } кушымтасын App Store-дан иңдерү:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = { $productName } кушымтасын башка җиһазга урнаштыру:
automated-email-change-2 = Әгәр дә бу гамәлне Сез эшләмәгән булсагыз, хәзер үк <a data-l10n-name="passwordChangeLink">серсүзегезне үзгәртегез</a>.
automated-email-support = Күбрәк мәгълүмат өчен <a data-l10n-name="supportLink">{ -brand-mozilla } Ярдәм</a> битен зыярат итегез.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Әгәр дә бу гамәлне эшләмәгән булсагыз, серсүзегезне хәзер үк үзгәртегез:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Күбрәк мәгълүмат өчен { -brand-mozilla } Ярдәм битен зыярат итегез:
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Күбрәк мәгълүмат өчен <a data-l10n-name="supportLink">{ -brand-mozilla } Ярдәм</a> битен зыярат итегез.
automated-email-no-action-plaintext = Бу автоматик электрон хат. Сезгә ялгыш җибәрелгән булса, берни дә эшләргә кирәкми.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Бу автоматик бер электрон хат; әгәр бу гамәлгә рөхсәт бирмәгән булсагыз, зинһар серсүзегезне үзгәртегез:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Бу сорау { $uaOS } { $uaOSVersion } системасындагы { $uaBrowser } кушымтасыннан килде.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Бу сорау { $uaOS } системасындагы { $uaBrowser } кушымтасыннан килде.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Бу сорау { $uaBrowser } кушымтасыннан килде.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Бу сорау { $uaOS } { $uaOSVersion } системасыннан килде.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Бу сорау { $uaOS } системасыннан килде.
automatedEmailRecoveryKey-delete-key-change-pwd = Әгәр дә моны Сез эшләмәгән булсагыз, <a data-l10n-name="revokeAccountRecoveryLink">яңа ачкычны бетерегез</a> һәм <a data-l10n-name="passwordChangeLink">серсүзегезне үзгәртегез</a>.
automatedEmailRecoveryKey-change-pwd-only = Әгәр дә моны Сез эшләмәгән булсагыз, <a data-l10n-name="passwordChangeLink">серсүзегезне үзгәртегез</a>.
automatedEmailRecoveryKey-more-info = Күбрәк мәгълүмат өчен <a data-l10n-name="supportLink">{ -brand-mozilla } Ярдәм</a> битен зыярат итегез.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Бу сорау түбәндәгедән килде:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Әгәр дә моны Сез эшләмәгән булсагыз, яңа ачкычны бетерегез:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Әгәр дә моны Сез эшләмәгән булсагыз, серсүзегезне үзгәртегез:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = һәм серсүзегезне үзгәртегез:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Күбрәк мәгълүмат өчен { -brand-mozilla } Ярдәм битен зыярат итегез:
automated-email-reset =
    Бу автоматик бер электрон хат. Әгәр бу гамәлгә рөхсәт бирмәгән булсагыз, <a data-l10n-name="resetLink">зинһар серсүзегезне алыштырыгыз</a>.
    Күбрәк белү өчен, <a data-l10n-name="supportLink">{ -brand-mozilla } Ярдәм</a> адресын зыярат итегез.
brand-banner-message = Сез { -product-firefox-accounts } исемебезне { -product-mozilla-accounts } итеп үзгәрткәнебезне беләсезме? <a data-l10n-name="learnMore">Күбрәк белү</a>
cancellationSurvey = Хезмәтләребезне яхшыртырга ярдәм итү өчен зинһар бу <a data-l10n-name="cancellationSurveyUrl">кыска сораулыкка</a> җавап бирүегезне сорыйбыз.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Зинһар, хезмәтләребезне яхшыртырга ярдәм итү өчен бу кыска сораулыкны алыгыз:
change-password-plaintext = Берәрсе хисабыгызны кулга төшерергә маташа дип шикләнсәгез, зинһар паролыгызны үзгәртегез.
manage-account = Хисап белән идарә итү
manage-account-plaintext = { manage-account }:
payment-details = Түләү мәгълүматлары:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Квитанция номеры: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceDateOnly } көнне { $invoiceTotal } түләнде
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Киләсе квитанция: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Моңа кадәр барлыгы: { $invoiceSubtotal }

##

subscriptionSupport = Язылуыгыз турында сорауларыгыз бармы? Безнең <a data-l10n-name="subscriptionSupportUrl">ярдәм такымы</a> Сезгә бик теләп ярдәм итәчәк.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Язылуыгыз турында сорауларыгыз бармы? Безнең ярдәм такымы Сезгә бик теләп ярдәм итәчәк:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = { $productName } хәбәрләренә язылганыгыз өчен рәхмәт. Язылуларыгыз турында сорауларыгыз булса яки { $productName } турында күбрәк мәгълүмат эзләсәгез, зинһар <a data-l10n-name="subscriptionSupportUrl">безнең белән элемтәгә керегез</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = { $productName } хәбәрләренә язылганыгыз өчен рәхмәт. Язылуларыгыз турында сорауларыгыз булса яки { $productName } турында күбрәк мәгълүмат эзләсәгез, зинһар безнең белән элемтәгә керегез:
subscriptionUpdateBillingEnsure = Түләү ысулыгызның һәм хисабыгыз турындагы мәгълүматның актуаль булуын <a data-l10n-name="updateBillingUrl">монда</a> тикшерә аласыз.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Түләү ысулыгызның һәм хисабыгыз турындагы мәгълүматның актуаль булуын монда тикшерә аласыз:
subscriptionUpdateBillingTry = Берничә көн эчендә тагын бер кат түләвегезне алырга тырышып карарбыз. Ләкин проблема чишелсен өчен <a data-l10n-name="updateBillingUrl">түләү турындагы мәгълүматыгызны яңартырга</a> кирәк булырга мөмкин.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Берничә көн эчендә тагын бер кат түләвегезне алырга тырышып карарбыз, ләкин проблема чишелсен өчен түләү турындагы мәгълүматыгызны яңартырга кирәк булырга мөмкин:
subscriptionUpdatePayment = Хезмәтегезнең өзелүен булдырмас өчен, зинһар, тиз арада <a data-l10n-name="updateBillingUrl">түләү турындагы мәгълүматыгызны яңартыгыз</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Хезмәтегезнең өзелүен булдырмас өчен, зинһар, тиз арада түләү турындагы мәгълүматыгызны яңартыгыз:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } - { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaOS }-да { $uaBrowser }
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Квитанцияне карау: { $invoiceLink }
cadReminderFirst-subject-1 = Искәртү! Әйдәгез, { -brand-firefox } кушымтасын синхронлыйк
cadReminderFirst-action = Башка җиһазны синхронлау
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Синхронлау өчен 2 җиһаз кирәк
cadReminderFirst-description-v2 = Ачык табларыгыз барлык җиһазларыгызда да булсын. Сез { -brand-firefox } кулланган һәр җирдә дә кыстыргычларыгыз, серсүзләрегез һәм башка мәгълүматларыгыз сезнең белән."
cadReminderSecond-subject-2 = Онытмагыз! Әйдәгез синхронлауны көйләүне тәмамлыйк
cadReminderSecond-action = Башка җиһазны синхронлау
cadReminderSecond-title-2 = Синхронлауны онытмагыз!
cadReminderSecond-description-sync = Кыстыргычларны, серсүзләрне, ачык табларны синхронлау — { -brand-firefox }-ны кулланган һәр җирдә.
cadReminderSecond-description-plus = Моннан тыш, сезнең мәгълүматлар гел шифрлана. Аны Сез һәм Сез тикшергән җиһазлар гына күрә ала.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = { $productName } кушымтасына рәхим итегез
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = { $productName } кушымтасына рәхим итегез
downloadSubscription-content-2 = Абунәгезнең барлык мөмкинлекләрен куллана башлыйк:
downloadSubscription-link-action-2 = Башлап җибәрү
fraudulentAccountDeletion-subject-2 = Сезнең { -product-mozilla-account } хисабыгыз бетерелде
fraudulentAccountDeletion-title = Сезнең хисабыгыз бетерелде
fraudulentAccountDeletion-content-part1-v2 = Күптән түгел, { -product-mozilla-account } хисабы булдырылды һәм бу эл. почта адресы аша язылу бәясе алынды. Барлык яңа хисаплар белән булган кебек, башта бу эл. почта адресын раслап, хисабыгызны раславыгызны сорадык.
fraudulentAccountDeletion-content-part2-v2 = Хәзерге вакытта без хисапның беркайчан да расланмаганын күрәбез. Бу адым тәмамланмаганлыктан, бу вәкаләт бирелгән язылу булганмы-юкмы, без белмибез. Нәтиҗәдә, бу эл. почта адресына теркәлгән { -product-mozilla-account } хисабы бетерелде һәм барлык түләүләр кире кайтарлыып, язылуыгыз туктатылды.
fraudulentAccountDeletion-contact = Сорауларыгыз булса, зинһар, безнең <a data-l10n-name="mozillaSupportUrl">ярдәм төркеменә</a> мөрәҗәгать итегез.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Сорауларыгыз булса, зинһар, безнең ярдәм төркеменә мөрәҗәгать итегез: { $mozillaSupportUrl }
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Резерв аутентификация кодлары калмады!
codes-reminder-title-one = Бары тик бер резерв аутентификация коды калды
codes-reminder-title-two = Күбрәк резерв аутентификация кодларын булдыру вакыты
codes-reminder-description-two-left = Ике код кына калды.
lowRecoveryCodes-action-2 = Кодлар булдыру
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Резерв копия аутентификация кодлары калмады
        [one] Бары тик бер резерв копия аутентификация коды калды
       *[other] Бары тик { $numberRemaining } резерв копия аутентификация коды калды!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = { $clientName } эченә яңа керү
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Сез түгелме? Серсүзегезне үзгәртегез:
newDeviceLogin-action = Хисап белән идарә итү
passwordChanged-subject = Серсүз яңартылды
passwordChanged-title = Парол уңышлы үзгәртелде
passwordChangeRequired-subject = Шөбһәле гамәлләр ачыкланды
password-forgot-otp-title = Серсүзегезне оныттыгызмы?
password-forgot-otp-expiry-notice = Бу кодның яраклылык вакыты 10 минут.
passwordReset-subject-2 = Серсүзегез үзгәртелде
passwordReset-title-2 = Серсүзегез үзгәртелде
passwordResetAccountRecovery-subject-2 = Серсүзегез үзгәртелде
passwordResetAccountRecovery-title-3 = Серсүзегез үзгәртелде
passwordResetAccountRecovery-action-4 = Хисап белән идарә итү
passwordResetWithRecoveryKeyPrompt-subject = Серсүзегез үзгәртелде
passwordResetWithRecoveryKeyPrompt-title = Серсүзегез үзгәртелде
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Хисапны коткару ачкычын булдыру
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Хисапны коткару ачкычын булдыру:
postAddAccountRecovery-subject-3 = Яңа хисапны коткару ачкычы ясалды
postAddAccountRecovery-title2 = Сез яңа хисапны коткару ачкычы булдырдыгыз
postAddAccountRecovery-action = Хисап белән идарә итү
postAddLinkedAccount-action = Хисап белән идарә итү
postAddTwoStepAuthentication-title-2 = Сез ике адымлы аутентификацияне кабыздыгыз
postAddTwoStepAuthentication-action = Хисап белән идарә итү
postChangeAccountRecovery-subject = Хисапны коткару ачкычы үзгәртелде
postChangeAccountRecovery-title = Сез хисапны коткару ачкычыгызны үзгәрттегез
postChangeAccountRecovery-body-part1 = Хәзер Сезнең яңа хисапны коткару ачкычыгыз бар. Искесе бетерелде.
postChangeAccountRecovery-action = Хисап белән идарә итү
postChangePrimary-subject = Төп эл. почта адресы яңартылды
postChangePrimary-title = Яңа төп электрон почта адресы
postChangePrimary-action = Хисап белән идарә итү
postConsumeRecoveryCode-action = Хисап белән идарә итү
postNewRecoveryCodes-subject-2 = Яңа резерв копия аутентификация кодлары ясалды
postNewRecoveryCodes-title-2 = Сез яңа резерв копия аутентификация кодларын булдырдгыз
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Алар бу җиһазда ясалган:
postNewRecoveryCodes-action = Хисап белән идарә итү
postRemoveAccountRecovery-subject-2 = Хисапны коткару ачкычы бетерелде
postRemoveAccountRecovery-title-3 = Сез хисапны коткару ачкычын бетердегез
postRemoveAccountRecovery-action = Хисап белән идарә итү
postRemoveSecondary-subject = Икенчел электрон почта бетерелде
postRemoveSecondary-title = Икенчел электрон почта бетерелде
postRemoveSecondary-action = Хисап белән идарә итү
postRemoveTwoStepAuthentication-subject-line-2 = Ике адымлы аутентификация сүндерелде
postRemoveTwoStepAuthentication-title-2 = Сез ике адымлы аутентификацияне сүндердегез
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Сез аны бу җиһаздан сүндердегез:
postRemoveTwoStepAuthentication-action = Хисап белән идарә итү
postRemoveTwoStepAuthentication-not-required-2 = Сез кергәндә, аутентификация кушымтасыннан алынган хәвефсезлек кодлары кирәк түгел.
postVerify-sub-title-3 = Без сезне күреп бик бәхетле!
postVerify-title-2 = Бер үк табны ике җиһазда да күрәсегез киләме?
postVerify-description-2 = Бу җиңел! Башка җиһазга { -brand-firefox } урнаштырыгыз һәм синхронлауга керегез. Тылсым кебек!
postVerify-subject-4 = { -brand-mozilla }-ка рәхим итегез!
postVerify-setup-2 = Башка бер җиһазны тоташтыру:
postVerify-action-2 = Башка бер җиһазны тоташтыру
postVerifySecondary-subject = Икенчел эл. почта өстәлде
postVerifySecondary-title = Икенчел эл. почта өстәлде
postVerifySecondary-action = Хисап белән идарә итү
recovery-subject = Серсүзегезне алыштырыгыз
recovery-title-2 = Серсүзегезне оныттыгызмы?
recovery-action = Яңа парол булдыру
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Сезнең { $productName } хезмәтенә язылуыгыз бетерелде
subscriptionAccountDeletion-title = Китүегез безгә кызганыч
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = { $productName } программасына рәхим итегез: Зинһар, яңа бер серсүз уйлап табыгыз.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = { $productName } хезмәтенә рәхим итегез
subscriptionAccountFinishSetup-action-2 = Башлап җибәрү
subscriptionAccountReminderFirst-subject = Бер искәртү: Хисабыгызны көйләүне тәмамлагыз
subscriptionAccountReminderFirst-title = Сез әле абунәгезгә керә алмыйсыз
subscriptionAccountReminderFirst-action = Серсүз булдыру
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Соңгы искәртү: Хисабыгызны көйләгез
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla }-ка рәхим итегез!
subscriptionAccountReminderSecond-action = Серсүз булдыру
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Сезнең { $productName } хезмәтенә язылуыгыз бетерелде
subscriptionCancellation-title = Китүегез безгә кызганыч

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = { $productName } хезмәтенә күчтегез
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = { $productNameOld } продуктыннан { $productName } продуктына күчү уңышлы узды.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Сезнең { $productName } хезмәтенә язылуыгыз туктатылды
subscriptionFailedPaymentsCancellation-title = Язылуыгыз туктатылды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } өчен түләү расланды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = { $productName } хәбәрләренә язылганыгыз өчен рәхмәт
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } өчен түләү уңышсыз тәмамланды
subscriptionPaymentFailed-title = Гафу итегез, түләвегез белән проблема килеп чыкты
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = { $productName } өчен соңгы түләвегез белән бер проблема килеп чыкты.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName } өчен түләү турындагы мәгълүматны яңарту кирәк
subscriptionPaymentProviderCancelled-title = Гафу итегез, сезнең түләү ысулы белән проблема бар
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = { $productName } өчен түләү ысулыгыз белән бер проблема ачыкладык.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } продуктына язылу яңадан активлаштырылды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = { $productName } абунәгезне яңартуыгыз өчен рәхмәт!
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } абунәсен автоматик рәвештә озайту турындагы белдерү
subscriptionRenewalReminder-title = Абунәгез тиздән яңартылачак
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Хөрмәтле { $productName } мөштәрие,
subscriptionRenewalReminder-content-closing = Хөрмәт илә,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } такымы
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } абунәләре өчен түләү турындагы мәгълүматны яңарту кирәк
subscriptionsPaymentProviderCancelled-title = Гафу итегез, сезнең түләү ысулы белән проблема бар
subscriptionsPaymentProviderCancelled-content-detected = Түбәндәге абунәләр өчен түләү ысулыгыз белән бер проблема ачыкладык.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } өчен түләү кабул ителде
subscriptionSubsequentInvoice-title = Язылуыгыз өчен рәхмәт!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName } өчен соңгы түләвегезне кабул иттек.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = { $productName } продуктына күтәрелү уңышлы узды
subscriptionUpgrade-title = Яңартуыгыз өчен рәхмәт!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

unblockCode-title = Керүче Сезме?
unblockCode-prompt = Әйе булса, Сезгә кирәкле авторизация коды менә бу:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Әйе булса, Сезгә кирәкле авторизация коды менә бу: { $unblockCode }
unblockCode-report = Юк икән, безгә алдакчылар белән көрәшергә ярдәм итү өчен бу хәл турында <a data-l10n-name="reportSignInLink">хәбәр итегез.</a>
unblockCode-report-plaintext = Юк булса, безгә алдакчылар белән көрәшергә ярдәм итү өчен бу хәл турында хәбәр итегез.
verificationReminderFinal-subject = Хисабыгызны раслау өчен соңгы искәртү
confirm-account = Хисапны раслагыз
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Хисабыгызны расларга онытмагыз
verificationReminderFirst-title-3 = { -brand-mozilla }-ка рәхим итегез!
verificationReminderFirst-sub-description-3 = Сезне һәм хосусыйлыгыгызны беренче урынга куйган браузерны күрми калмагыз.
confirm-email-2 = Хисапны раслагыз
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Хисапны раслагыз
verificationReminderSecond-subject-2 = Хисабыгызны расларга онытмагыз
verificationReminderSecond-action-2 = Хисапны раслагыз
verify-title-3 = Интернетны { -brand-mozilla } белән ачыгыз
verify-subject = Хисап язмагызны ясап бетерегез
verify-action-2 = Хисапны раслагыз
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Сез { $clientName } кушымтасына кердегезме?
verifyLogin-subject-2 = Керүне раслау
verifyLogin-action = Керүне раслау
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = { $serviceName } хезмәтенә кердегезме?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Керүегезне раслап, хисабыгызның куркынычсызлыгын сакларга ярдәм итегез:
verifyLoginCode-prompt-3 = Әйе булса, авторизация кодыгыз менә бу:
verifyLoginCode-expiry-notice = Кодның яраклылык вакыты 5 минут.
verifyPrimary-title-2 = Беренчел эл. почтагызны раслагыз
verifyPrimary-description = Түбәндәге җиһаздан хисапны үзгәртүгә үтенеч керде:
verifyPrimary-subject = Төп эл. почтаны раслау
verifyPrimary-action-2 = Эл. почтагызны раслагыз
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Расланганнан соң, икенчел эл. почта адресын өстәү кебек хисапка үзгәрешләр кертү бу җиһаздан мөмкин булачак.
verifySecondaryCode-title-2 = Икенчел эл. почтагызны раслагыз
verifySecondaryCode-action-2 = Эл. почтагызны раслагыз
verifySecondaryCode-prompt-2 = Бу раслау кодын кулланыгыз:
verifyShortCode-title-3 = Интернетны { -brand-mozilla } белән ачыгыз
verifyShortCode-prompt-3 = Бу раслау кодын куллану:
verifyShortCode-expiry-notice = Кодның яраклылык вакыты 5 минут.
