## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } логотибы">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Җиһазларны синхронлау">
body-devices-image = <img data-l10n-name="devices-image" alt="Җиһазлар">
fxa-privacy-url = { -brand-mozilla }’ның Хосусыйлык Сәясәте
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Хосусыйлык Аңлатмасы
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } Куллану Шартлары
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
change-password-plaintext = Берәрсе хисабыгызны кулга төшерергә маташа дип шикләнсәгез, зинһар паролыгызны үзгәртегез.
manage-account = Хисап белән идарә итү
manage-account-plaintext = { manage-account }:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } - { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaOS }-да { $uaBrowser }
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
passwordChangeRequired-subject = Шөбһәле гамәлләр ачыкланды
passwordChanged-subject = Серсүз яңартылды
passwordChanged-title = Парол уңышлы үзгәртелде
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
