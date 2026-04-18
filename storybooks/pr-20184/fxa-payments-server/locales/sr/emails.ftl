## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } лого">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = { -brand-mozilla } полиса приватности
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } обавештење о приватности
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } услови коришћења
account-deletion-info-block-communications = Ако се ваш налог обрише, и даље ћете примати е-пошту од Mozilla Corporation и Mozilla Foundation, осим ако не <a data-l10n-name="unsubscribeLink">затражите одјаву</a>.
account-deletion-info-block-support = Ако имате било каквих питања или вам је потребна помоћ, слободно контактирајте наш <a data-l10n-name="supportLink">тим за подршку</a>.
account-deletion-info-block-communications-plaintext = Ако се ваш налог обрише, и даље ћете примати е-пошту од Mozilla Corporation и Mozilla Foundation, осим ако не затражите одјаву:
account-deletion-info-block-support-plaintext = Ако имате било каквих питања или вам је потребна помоћ, слободно контактирајте наш тим за подршку:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Download { $productName } on { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Download { $productName } on the { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Инсталирајте { $productName } на <a data-l10n-name="anotherDeviceLink">другом десктоп уређају</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Инсталирајте { $productName } на <a data-l10n-name="anotherDeviceLink">другом уређају</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Преузмите { $productName } на Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Преузмите { $productName } на App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Инсталирајте { $productName } на другом уређају:
automated-email-change-2 = Ако ово нисте ви урадили, одмах <a data-l10n-name="passwordChangeLink">промените лозинку</a>.
automated-email-support = За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ако ово нисте ви урадили, одмах промените лозинку:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = За више информација, посетите { -brand-mozilla } подршку.
automated-email-inactive-account = Ово је аутоматска порука. Примате је јер имате { -product-mozilla-account } и прошло је 2 године од ваше последње пријаве.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
automated-email-no-action-plaintext = Ово је аутоматизована е-порука. Ако сте грешком је примили, не морате ништа да учините.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ово је аутоматизована е-порука; ако нисте затражили ову акцију, онда промените лозинку:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Овај захтев је стигао са прегледача { $uaBrowser } на систему { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Овај захтев је стигао са прегледача { $uaBrowser } на систему { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Овај захтев је стигао са прегледача { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Овај захтев је стигао са система { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Овај захтев је стигао са система { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ако ово нисте били ви, <a data-l10n-name="revokeAccountRecoveryLink">обришите нови кључ</a> и <a data-l10n-name="passwordChangeLink">промените лозинку</a>.
automatedEmailRecoveryKey-change-pwd-only = Ако ово нисте били ви, <a data-l10n-name="passwordChangeLink">промените лозинку</a>.
automatedEmailRecoveryKey-more-info = За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Овај захтев је стигао са:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ако ово нисте били ви, обришите нови кључ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ако ово нисте били ви, промените лозинку:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = и промените лозинку:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = За више информација, посетите Mozilla подршку:
automated-email-reset =
    Ово је аутоматизована е-порука. Ако нисте затражили ову акцију, онда <a data-l10n-name="resetLink">ресетујте лозинку</a>.
    За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Ако нисте ви покренули ову радњу, ресетујте своју лозинку сада на { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Ако нисте ви покренули ову радњу, одмах <a data-l10n-name="resetLink">ресетујте своју лозинку</a> и <a data-l10n-name="twoFactorSettingsLink">ресетујте потврду идентитета у два корака</a>.
    За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Ако нисте ви покренули ову радњу, одмах ресетујте своју лозинку на:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Такође, ресетујте потврду идентитета у два корака на:
brand-banner-message = Да ли сте знали да смо променили име из { -product-firefox-accounts } у { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Сазнајте више</a>
change-password-plaintext = Ако сумњате да неко покушава да приступи вашем налогу, промените лозинку.
manage-account = Управљајте налогом
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = За више информација, посетите { -brand-mozilla } подршку: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } за { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } за { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (процењено)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (процењено)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (процењено)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (процењено)
cadReminderFirst-subject-1 = Подсећамо да усклађујете { -brand-firefox }
cadReminderFirst-action = Усклади други уређај
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = За усклађивање је потребно двоје
cadReminderFirst-description-v2 = Пренесите своје језичке на све своје уређаје. Нека вам обележивачи, лозинке и остали подаци буду доступни свуда где користите { -brand-firefox }.
cadReminderSecond-subject-2 = Хајде да завршимо подешавање вашег усклађивања
cadReminderSecond-action = Усклади други уређај
cadReminderSecond-title-2 = Не заборавите да усклађујете!
cadReminderSecond-description-sync = Усклађујте ваше обележиваче, лозинке, отворене језичке и друго - свугде где користите { -brand-firefox }.
cadReminderSecond-description-plus = Уз то, ваши подаци ће бити шифровани и видљиви само вама и уређајима које одобрите.
inactiveAccountFinalWarning-subject = Последња шанса да задржите свој { -product-mozilla-account }
inactiveAccountFinalWarning-title = Ваш { -brand-mozilla } налог и подаци ће бити обрисани
inactiveAccountFinalWarning-preview = Пријавите се да бисте задржили свој налог
inactiveAccountFinalWarning-account-description = Ваш { -product-mozilla-account } се користи за приступ бесплатним производима за приватност и прегледање као што су { -brand-firefox } усклађивање, { -product-mozilla-monitor }, { -product-firefox-relay } и { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Дана <strong>{ $deletionDate }</strong>, ваш налог и ваши лични подаци ће бити трајно обрисани осим ако се не пријавите.
inactiveAccountFinalWarning-action = Пријавите се да бисте задржили свој налог
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Пријавите се да бисте задржили свој налог:
inactiveAccountFirstWarning-subject = Немојте изгубити свој налог
inactiveAccountFirstWarning-title = Да ли желите да задржите свој { -brand-mozilla } налог и податке?
inactiveAccountFirstWarning-account-description-v2 = Ваш { -product-mozilla-account } се користи за приступ бесплатним производима за приватност и прегледање као што су { -brand-firefox } усклађивање, { -product-mozilla-monitor }, { -product-firefox-relay } и { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Приметили смо да се нисте пријавили 2 године.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Ваш налог и ваши лични подаци ће бити трајно обрисани <strong>{ $deletionDate }</strong> јер нисте били активни.
inactiveAccountFirstWarning-action = Пријавите се да бисте задржили свој налог
inactiveAccountFirstWarning-preview = Пријавите се да бисте задржили свој налог
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Пријавите се да бисте задржили свој налог:
inactiveAccountSecondWarning-subject = Потребна је радња: Брисање налога за 7 дана
inactiveAccountSecondWarning-title = Ваш { -brand-mozilla } налог и подаци ће бити обрисани за 7 дана
inactiveAccountSecondWarning-account-description-v2 = Ваш { -product-mozilla-account } се користи за приступ бесплатним производима за приватност и прегледање као што су { -brand-firefox } усклађивање, { -product-mozilla-monitor }, { -product-firefox-relay } и { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Ваш налог и ваши лични подаци ће бити трајно обрисани <strong>{ $deletionDate }</strong> јер нисте били активни.
inactiveAccountSecondWarning-action = Пријавите се да бисте задржили свој налог
inactiveAccountSecondWarning-preview = Пријавите се да бисте задржили свој налог
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Пријавите се да бисте задржили свој налог:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Немате више резервних приступних кодова!
codes-reminder-title-one = Остао вам је само један резервни приступни код
codes-reminder-title-two = Време је да направите још резервних приступних кодова
codes-reminder-description-part-one = Резервни приступни кодови вам помажу да повратите ваше податке ако заборавите лозинку.
codes-reminder-description-part-two = Направите нове кодова сада да не изгубите ваше податке после.
codes-reminder-description-two-left = Имате још само два кода.
codes-reminder-description-create-codes = Направите нове резервне приступне кодове који ће вам помоћи да се вратите на ваш налог у случају да изгубите приступ.
lowRecoveryCodes-action-2 = Направи кодове
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Немате више резервних приступних кодова
        [one] Остао вам је само 1 резервни приступни код
        [few] Имате само { $numberRemaining } резервна приступна кода
       *[other] Имате само { $numberRemaining } резервних приступних кодова
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Нова пријава на { $clientName }
newDeviceLogin-subjectForMozillaAccount = Нова пријава на ваш { -product-mozilla-account }
newDeviceLogin-title-3 = Ваш { -product-mozilla-account } је коришћен за пријаву
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Нисте били ви? <a data-l10n-name="passwordChangeLink">Мењајте лозинку</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Нисте били ви? Мењајте лозинку:
newDeviceLogin-action = Управљајте налогом
passwordChangeRequired-subject = Откривена је сумњива радња
passwordChangeRequired-preview = Одмах промените своју лозинку
passwordChangeRequired-title-2 = Вратите своју лозинку
passwordChangeRequired-suspicious-activity-3 = Закључали смо ваш налог како бисмо га заштитили од сумњивих активности. Одјављени сте са свих својих уређаја, а сви усклађени подаци су обрисани из предострожности.
passwordChangeRequired-sign-in-3 = Да бисте се поново пријавили на свој налог, све што треба да урадите је да ресетујете лозинку.
passwordChangeRequired-different-password-2 = <b>Важно:</b> изаберите јаку лозинку која се разликује од оне коју сте користили у прошлости.
passwordChangeRequired-different-password-plaintext-2 = Важно: изаберите јаку лозинку која се разликује од оне коју сте користили у прошлости.
passwordChangeRequired-action = Врати лозинку
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Лозинка је ажурирана
passwordChanged-title = Лозинка је успешно промењена
passwordChanged-description-2 = Лозинка за ваш { -product-mozilla-account } је успешно промењена са следећег уређаја:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Користите { $code } да промените своју лозинку
password-forgot-otp-preview = Овај код истиче за 10 минута
password-forgot-otp-title = Заборавили сте лозинку?
password-forgot-otp-request = Примили смо захтев за промену лозинке на вашем { -product-mozilla-account } налогу од:
password-forgot-otp-code-2 = Ако сте ово били ви, ево вашег потврдног кода за наставак:
password-forgot-otp-expiry-notice = Овај код истиче за 10 минута.
passwordReset-subject-2 = Ваша лозинка је ресетована
passwordReset-title-2 = Ваша лозинка је ресетована
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Ресетовали сте лозинку за свој { -product-mozilla-account } дана:
passwordResetAccountRecovery-subject-2 = Ваша лозинка је ресетована
passwordResetAccountRecovery-title-3 = Ваша лозинка је ресетована
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Користили сте кључ за опоравак налога да бисте ресетовали лозинку за свој { -product-mozilla-account } дана:
passwordResetAccountRecovery-information = Одјавили смо вас са свих ваших усклађених уређаја. Направили смо нови кључ за опоравак налога који ће заменити онај који сте користили. Можете га променити у подешавањима свог налога.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Одјавили смо вас са свих ваших усклађених уређаја. Направили смо нови кључ за опоравак налога који ће заменити онај који сте користили. Можете га променити у подешавањима свог налога:
passwordResetAccountRecovery-action-4 = Управљај налогом
passwordResetRecoveryPhone-subject = Коришћен је телефон за опоравак
passwordResetRecoveryPhone-preview = Проверите да ли сте то били ви
passwordResetRecoveryPhone-title = Ваш телефон за опоравак је коришћен за потврду ресетовања лозинке
passwordResetRecoveryPhone-device = Телефон за опоравак је коришћен са:
passwordResetRecoveryPhone-action = Управљај налогом
passwordResetWithRecoveryKeyPrompt-subject = Ваша лозинка је ресетована
passwordResetWithRecoveryKeyPrompt-title = Ваша лозинка је ресетована
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Ресетовали сте лозинку за { -product-mozilla-account } дана:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Направи кључ за опоравак налога
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Направи кључ за опоравак налога:
passwordResetWithRecoveryKeyPrompt-cta-description = Мораћете поново да се пријавите на свим својим усклађеним уређајима. Следећи пут сачувајте своје податке помоћу кључа за опоравак налога. Ово вам омогућава да повратите своје податке ако заборавите лозинку.
postAddAccountRecovery-subject-3 = Направљен је нови кључ за опоравак налога
postAddAccountRecovery-title2 = Направили сте нови кључ за опоравак налога
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Сачувајте овај кључ на безбедном месту - биће вам потребан да повратите своје шифроване податке прегледања ако заборавите лозинку.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Овај кључ се може искористити само једном. Након што га искористите, аутоматски ћемо направити нови за вас. Или можете направити нови било када у подешавањима вашег налога.
postAddAccountRecovery-action = Управљајте налогом
postAddLinkedAccount-subject-2 = Нови налог је повезан са вашим { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Ваш { $providerName } налог је повезан са вашим { -product-mozilla-account }
postAddLinkedAccount-action = Управљај налогом
postAddRecoveryPhone-subject = Додат је телефон за опоравак
postAddRecoveryPhone-preview = Налог је заштићен потврдом идентитета у два корака
postAddRecoveryPhone-title-v2 = Додали сте број телефона за опоравак
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Додали сте { $maskedLastFourPhoneNumber } као свој број телефона за опоравак
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Како ово штити ваш налог
postAddRecoveryPhone-how-protect-plaintext = Како ово штити ваш налог:
postAddRecoveryPhone-enabled-device = Омогућили сте ово са:
postAddRecoveryPhone-action = Управљајте налогом
postAddTwoStepAuthentication-preview = Ваш налог је заштићен
postAddTwoStepAuthentication-subject-v3 = Потврда идентитета у два корака је укључена
postAddTwoStepAuthentication-title-2 = Укључили сте аутентификацију у два корака
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Затражили сте ово са:
postAddTwoStepAuthentication-action = Управљајте налогом
postAddTwoStepAuthentication-code-required-v4 = Сигурносни кодови из ваше апликације за потврду идентитета су сада потребни при свакој пријави.
postAddTwoStepAuthentication-recovery-method-codes = Такође сте додали резервне кодове за потврду идентитета као начин опоравка.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Такође сте додали { $maskedPhoneNumber } као ваш број телефона за опоравак.
postAddTwoStepAuthentication-how-protects-link = Како ово штити ваш налог
postAddTwoStepAuthentication-how-protects-plaintext = Како ово штити ваш налог:
postAddTwoStepAuthentication-device-sign-out-message = Да бисте заштитили све своје повезане уређаје, требало би да се одјавите свуда где користите овај налог, а затим се поново пријавите користећи потврду идентитета у два корака.
postChangeAccountRecovery-subject = Кључ за опоравак налога је промењен
postChangeAccountRecovery-title = Променили сте свој кључ за опоравак налога
postChangeAccountRecovery-body-part1 = Сада имате нови кључ за опоравак налога. Ваш претходни кључ је обрисан.
postChangeAccountRecovery-body-part2 = Сачувајте овај нови кључ на безбедном месту - биће вам потребан за враћање ваших шифрованих података прегледања ако заборавите лозинку.
postChangeAccountRecovery-action = Управљајте налогом
postChangePrimary-subject = Примарна адреса е-поште је ажурирана
postChangePrimary-title = Нова примарна адреса е-поште
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Успешно сте променили своју примарну адресу е-поште у { $email }. Ова адреса је сада ваше корисничко име за пријаву на ваш { -product-mozilla-account }, као и за примање безбедносних обавештења и потврда пријаве.
postChangePrimary-action = Управљајте налогом
postChangeRecoveryPhone-subject = Телефон за опоравак је ажуриран
postChangeRecoveryPhone-preview = Налог је заштићен потврдом идентитета у два корака
postChangeRecoveryPhone-title = Променили сте телефон за опоравак
postChangeRecoveryPhone-description = Сада имате нови телефон за опоравак. Ваш претходни број телефона је обрисан.
postChangeRecoveryPhone-requested-device = Захтевали сте ово са:
postChangeTwoStepAuthentication-preview = Ваш налог је заштићен
postChangeTwoStepAuthentication-subject = Потврда идентитета у два корака је ажурирана
postChangeTwoStepAuthentication-title = Потврда идентитета у два корака је ажурирана
postChangeTwoStepAuthentication-use-new-account = Сада треба да користите нови { -product-mozilla-account } унос у вашој апликацији за потврду идентитета. Стари више неће радити и можете га уклонити.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Захтевали сте ово са:
postChangeTwoStepAuthentication-action = Управљај налогом
postChangeTwoStepAuthentication-how-protects-link = Како ово штити ваш налог
postChangeTwoStepAuthentication-how-protects-plaintext = Како ово штити ваш налог:
postChangeTwoStepAuthentication-device-sign-out-message = Да бисте заштитили све своје повезане уређаје, требало би да се одјавите свуда где користите овај налог, а затим се поново пријавите користећи своју нову потврду идентитета у два корака.
postConsumeRecoveryCode-title-3 = Ваш резервни код за потврду идентитета је коришћен за потврду ресетовања лозинке
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Код је коришћен са:
postConsumeRecoveryCode-action = Управљајте налогом
postConsumeRecoveryCode-subject-v3 = Резервни код за потврду идентитета је коришћен
postConsumeRecoveryCode-preview = Проверите да ли сте то били ви
postNewRecoveryCodes-subject-2 = Нови резервни приступни кодови су направљени
postNewRecoveryCodes-title-2 = Направили сте нове резервне приступне кодове
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Направљени су на:
postNewRecoveryCodes-action = Управљајте налогом
postRemoveAccountRecovery-subject-2 = Кључ за опоравак налога је обрисан
postRemoveAccountRecovery-title-3 = Обрисали сте кључ за опоравак налога
postRemoveAccountRecovery-body-part1 = Ваш кључ за опоравак налога је неопходан за враћање ваших шифрованих података прегледања ако заборавите лозинку.
postRemoveAccountRecovery-body-part2 = Ако већ нисте, направите нови кључ за опоравак налога у подешавањима налога како бисте спречили губитак сачуваних лозинки, обележивача, историје прегледања и још много тога.
postRemoveAccountRecovery-action = Управљајте налогом
postRemoveRecoveryPhone-subject = Телефон за опоравак је уклоњен
postRemoveRecoveryPhone-preview = Налог је заштићен потврдом идентитета у два корака
postRemoveRecoveryPhone-title = Телефон за опоравак је уклоњен
postRemoveRecoveryPhone-description-v2 = Ваш телефон за опоравак је уклоњен из подешавања потврде идентитета у два корака.
postRemoveRecoveryPhone-description-extra = И даље можете користити своје резервне кодове за потврду идентитета да бисте се пријавили ако не можете да користите апликацију за потврду идентитета.
postRemoveRecoveryPhone-requested-device = Захтевали сте ово са:
postRemoveSecondary-subject = Уклоњена је секундарна адреса е-поште
postRemoveSecondary-title = Уклоњена је секундарна адреса е-поште
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Успешно сте уклонили { $secondaryEmail } као секундарну адресу е-поште са вашег { -product-mozilla-account }. Безбедносна обавештења и потврде пријаве више неће бити достављане на ову адресу.
postRemoveSecondary-action = Управљајте налогом
postRemoveTwoStepAuthentication-subject-line-2 = Аутентификација у два корака је искључена
postRemoveTwoStepAuthentication-title-2 = Искључили сте аутентификацију у два корака
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Онемогућили сте је са:
postRemoveTwoStepAuthentication-action = Управљајте налогом
postRemoveTwoStepAuthentication-not-required-2 = Када се пријавите, од вас се више неће тражити да унесете код из апликације за аутентификацију.
postSigninRecoveryCode-subject = Резервни код за потврду идентитета је коришћен за пријаву
postSigninRecoveryCode-preview = Потврдите активност на налогу
postSigninRecoveryCode-title = Ваш резервни код за потврду идентитета је коришћен за пријаву
postSigninRecoveryCode-description = Ако нисте ви ово урадили, требало би одмах да промените лозинку како бисте сачували безбедност свог налога.
postSigninRecoveryCode-device = Пријавили сте се са:
postSigninRecoveryCode-action = Управљајте налогом
postSigninRecoveryPhone-subject = Телефон за опоравак је коришћен за пријаву
postSigninRecoveryPhone-preview = Потврдите активност на налогу
postSigninRecoveryPhone-title = Ваш телефон за опоравак је коришћен за пријаву
postSigninRecoveryPhone-description = Ако нисте ви ово урадили, требало би одмах да промените лозинку како бисте сачували безбедност свог налога.
postSigninRecoveryPhone-device = Пријавили сте се са:
postSigninRecoveryPhone-action = Управљајте налогом
postVerify-sub-title-3 = Драго нам је што вас видимо!
postVerify-title-2 = Желите да видите исте језичке на два уређаја?
postVerify-description-2 = Једноставно је! Само инсталирајте { -brand-firefox } на други уређај и пријавите се да бисте усклађивали. Чиста магија!
postVerify-sub-description = (Псст… ово такође значи да се можете пријавити било где да видите ваше обележиваче, лозинке и друге { -brand-firefox } податке.)
postVerify-subject-4 = Добро дошли у { -brand-mozilla }!
postVerify-setup-2 = Повежите други уређај:
postVerify-action-2 = Повежи други уређај
postVerifySecondary-subject = Секундарна адреса додата
postVerifySecondary-title = Секундарна адреса додата
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Успешно сте потврдили { $secondaryEmail } као секундарну адресу е-поште за ваш { -product-mozilla-account }. Безбедносна обавештења и потврде пријаве ће се сада испоручивати на обе адресе е-поште.
postVerifySecondary-action = Управљајте налогом
recovery-subject = Ресетујте лозинку
recovery-title-2 = Заборавили сте лозинку?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Примили смо захтев за промену лозинке на вашем { -product-mozilla-account } налогу са:
recovery-new-password-button = Направите нову лозинку кликом на дугме испод. Ова веза истиче за један сат.
recovery-copy-paste = Направите нову лозинку тако што ћете копирати и налепити URL испод у ваш прегледач. Ова веза истиче за један сат.
recovery-action = Направи нову лозинку
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Користите { $unblockCode } за пријаву
unblockCode-preview = Овај код истиче за један сат
unblockCode-title = Да ли сте се ово ви пријавили?
unblockCode-prompt = Ако јесте, ево ауторизационог кода који вам је потребан:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Ако да, ево кода за ауторизацију који вам је потребан: { $unblockCode }
unblockCode-report = Ако не, помозите нам да одбијемо уљезе и <a data-l10n-name="reportSignInLink">пријавите нам то</a>.
unblockCode-report-plaintext = Ако не, помозите нам да одбијемо уљезе и пријавите нам то.
verificationReminderFinal-subject = Последњи подсетник да потврдите налог
verificationReminderFinal-description-2 = Пре неколико недеља сте направили { -product-mozilla-account }, али га никада нисте потврдили. Ради ваше безбедности, обрисаћемо налог ако не буде потврђен у наредна 24 сата.
confirm-account = Потврдите налог
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Не заборавите да потврдите налог
verificationReminderFirst-title-3 = Добро дошли у { -brand-mozilla }!
verificationReminderFirst-description-3 = Пре неколико дана сте направили { -product-mozilla-account }, али га никада нисте потврдили. Потврдите свој налог у наредних 15 дана или ће бити аутоматски обрисан.
verificationReminderFirst-sub-description-3 = Не пропустите прегледач који вас и вашу приватност ставља на прво место.
confirm-email-2 = Потврдите налог
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Потврдите налог
verificationReminderSecond-subject-2 = Не заборавите да потврдите налог
verificationReminderSecond-title-3 = Не пропустите { -brand-mozilla }!
verificationReminderSecond-description-4 = Пре неколико дана сте направили { -product-mozilla-account }, али га никада нисте потврдили. Потврдите свој налог у наредних 10 дана или ће бити аутоматски обрисан.
verificationReminderSecond-second-description-3 = Ваш { -product-mozilla-account } вам омогућава да ускладите своје { -brand-firefox } искуство на свим уређајима и откључава приступ већем броју производа за заштиту приватности из { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Будите део наше мисије да интернет учинимо местом отвореним за све.
verificationReminderSecond-action-2 = Потврдите налог
verify-title-3 = Отворите интернет уз { -brand-mozilla }
verify-description-2 = Потврдите свој налог и извуците максимум из { -brand-mozilla } свуда где се пријавите, почевши од:
verify-subject = Завршите прављење вашег налога
verify-action-2 = Потврдите налог
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Користите { $code } да промените свој налог
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Овај код истиче за { $expirationTime } минут.
        [few] Овај код истиче за { $expirationTime } минута.
       *[other] Овај код истиче за { $expirationTime } минута.
    }
verifyAccountChange-title = Да ли мењате податке о свом налогу?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Помозите нам да очувамо ваш налог безбедним тако што ћете одобрити ову промену на:
verifyAccountChange-prompt = Ако је одговор да, ево вашег кода за овлашћење:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Истиче за { $expirationTime } минут.
        [few] Истиче за { $expirationTime } минута.
       *[other] Истиче за { $expirationTime } минута.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Да ли сте се пријавили у { $clientName }?
verifyLogin-description-2 = Помозите нам да заштитимо ваш налог тако што ћете потврдити пријаву на:
verifyLogin-subject-2 = Потврдите пријаву
verifyLogin-action = Потврдите пријаву
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Користите { $code } за пријаву
verifyLoginCode-preview = Овај код истиче за 5 минута.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Да ли сте се пријавили у { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Помозите нам да заштитимо ваш налог тако што ћете потврдити пријаву на:
verifyLoginCode-prompt-3 = Ако да, ево вашег кода за ауторизацију:
verifyLoginCode-expiry-notice = Истиче за 5 минута.
verifyPrimary-title-2 = Потврдите примарну адресу е-поште
verifyPrimary-description = Захтев за измене налога је послат са следећег уређаја:
verifyPrimary-subject = Потврдите примарну адресу е-поште
verifyPrimary-action-2 = Потврдите адресу е-поште
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Једном када потврдите, измене налога као што је додавање секундарне адресе, ће бити могуће и са овог уређаја.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Користите { $code } да потврдите своју секундарну адресу е-поште
verifySecondaryCode-preview = Овај код истиче за 5 минута.
verifySecondaryCode-title-2 = Потврдите секундарну адресу е-поште
verifySecondaryCode-action-2 = Потврдите адресу е-поште
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Поднет је захтев за коришћење адресе { $email } као секундарне адресе е-поште са следећег { -product-mozilla-account } налога:
verifySecondaryCode-prompt-2 = Искористите овај код за потврду:
verifySecondaryCode-expiry-notice-2 = Истиче за 5 минута. Једном када верификујете, адреса ће добијати безбедносна обавештења и потврде о пријавама.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Користите { $code } да потврдите свој налог
verifyShortCode-preview-2 = Овај код истиче за 5 минута
verifyShortCode-title-3 = Отворите интернет уз { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Потврдите свој налог и извуците максимум из { -brand-mozilla } свуда где се пријавите, почевши од:
verifyShortCode-prompt-3 = Искористите овај код за потврду:
verifyShortCode-expiry-notice = Истиче за 5 минута.
