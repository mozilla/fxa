## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Лагатып { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Сінхранізацыя прылад">
body-devices-image = <img data-l10n-name="devices-image" alt="Прылады">
fxa-privacy-url = Палітыка прыватнасці { -brand-mozilla }
moz-accounts-privacy-url-2 = Паведамленне аб прыватнасці { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Умовы выкарыстання { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Калі ваш уліковы запіс будзе выдалены, вы ўсё роўна будзеце атрымліваць электронныя лісты ад Mozilla Corporation і Mozilla Foundation, калі вы не <a data-l10n-name="unsubscribeLink">папросіце адпісацца</a>.
account-deletion-info-block-support = Калі ў вас ёсць якія-небудзь пытанні ці вам патрэбна дапамога, звяжыцеся з нашай <a data-l10n-name="supportLink">службай падтрымкі</a>.
account-deletion-info-block-communications-plaintext = Калі ваш уліковы запіс будзе выдалены, вы ўсё роўна будзеце атрымліваць электронныя лісты ад Mozilla Corporation і Mozilla Foundation, калі вы не папросіце адпісацца:
account-deletion-info-block-support-plaintext = Калі ў вас ёсць якія-небудзь пытанні ці вам патрэбна дапамога, не саромейцеся звяртацца ў нашу службу падтрымкі:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Сцягнуць { $productName } з { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Сцягнуць { $productName } з { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Усталюйце { $productName } на <a data-l10n-name="anotherDeviceLink">іншы камп'ютар</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Усталюйце { $productName } на <a data-l10n-name="anotherDeviceLink">іншую прыладу</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Атрымайце { $productName } у Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Спампуйце { $productName } з App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Усталюйце { $productName } на іншую прыладу:
automated-email-change-2 = Калі вы гэтага не рабілі, неадкладна <a data-l10n-name="passwordChangeLink">змяніце свой пароль</a>.
automated-email-support = Для атрымання дадатковай інфармацыі наведайце <a data-l10n-name="supportLink">падтрымку { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Калі вы не рабілі гэтага дзеяння, неадкладна змяніце пароль:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Для атрымання дадатковай інфармацыі наведайце старонку падтрымкі { -brand-mozilla }:
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Для атрымання дадатковай інфармацыі наведайце <a data-l10n-name="supportLink">падтрымку { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Гэта аўтаматычна створанае паведамленне. Калі вы атрымалі яго памылкова, вам не трэба нічога рабіць.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Гэта аўтаматычна створаны ліст; калі вы не здзяйснялі гэтага дзеяння, калі ласка, змяніце свой пароль:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Гэты запыт прыйшоў з { $uaBrowser } на { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Гэты запыт прыйшоў з { $uaBrowser } на { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Гэты запыт прыйшоў ад { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Гэты запыт прыйшоў ад { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Гэты запыт прыйшоў ад { $uaOS }.
automatedEmailRecoveryKey-more-info = Для атрымання дадатковай інфармацыі наведайце <a data-l10n-name="supportLink">падтрымку { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Гэты запыт паступіў ад:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Калі гэта былі не вы, выдаліце новы ключ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Калі гэта былі не вы, змяніце пароль:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = і змяніць свой пароль:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Для атрымання дадатковай інфармацыі наведайце старонку падтрымкі { -brand-mozilla }:
automated-email-reset =
    Гэта аўтаматычна створаны ліст; калі вы не здзяйснялі гэтага дзеяння, калі ласка, <a data-l10n-name="resetLink">скіньце свой пароль</a>.
    Для атрымання дадатковай інфармацыі наведайце <a data-l10n-name="supportLink">Сайт падтрымкі { -brand-mozilla }</a>.
change-password-plaintext = Калі вы падазраяце, што хтосьці спрабуе атрымаць доступ да вашага ўліковага запісу, калі ласка, змяніце пароль.
manage-account = Кіраванне ўліковым запісам
manage-account-plaintext = { manage-account }:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } на { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } на { $uaOS }
cadReminderFirst-subject-1 = Напамін! Давайце сінхранізуем { -brand-firefox }
cadReminderFirst-action = Сінхранізаваць іншую прыладу
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Для сінхранізацыі патрэбна дзве прылады
cadReminderSecond-subject-2 = Не прапусціце! Давайце скончым наладку сінхранізацыі
cadReminderSecond-action = Сінхранізаваць іншую прыладу
cadReminderSecond-title-2 = Не забудзьцеся сінхранізаваць!
cadReminderSecond-description-sync = Сінхранізуйце свае закладкі, паролі, адкрытыя карткі і многае іншае — усюды, дзе вы карыстаецеся { -brand-firefox }.
cadReminderSecond-description-plus = Акрамя таго, вашы даныя заўсёды зашыфраваны. Толькі вы і вашы давераныя прылады змогуць іх убачыць.
inactiveAccountFinalWarning-preview = Увайдзіце ў свой уліковы запіс, каб захаваць яго
inactiveAccountFirstWarning-action = Увайдзіце ў свой уліковы запіс, каб захаваць яго
inactiveAccountFirstWarning-preview = Увайдзіце ў свой уліковы запіс, каб захаваць яго
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Увайдзіце ў свой уліковы запіс, каб захаваць яго
inactiveAccountSecondWarning-action = Увайдзіце ў свой уліковы запіс, каб захаваць яго
inactiveAccountSecondWarning-preview = Увайдзіце ў свой уліковы запіс, каб захаваць яго
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = У вас скончыліся рэзервовыя коды аўтэнтыфікацыі!
codes-reminder-title-one = Вы выкарыстоўваеце апошні рэзервовы код аўтэнтыфікацыі
codes-reminder-title-two = Час стварыць больш рэзервовых кодаў аўтэнтыфікацыі
codes-reminder-description-part-one = Рэзервовыя коды аўтэнтыфікацыі дапамогуць вам аднавіць вашу інфармацыю, калі вы забудзеце пароль.
codes-reminder-description-part-two = Стварыце новыя коды зараз, каб потым не страціць свае даныя.
codes-reminder-description-two-left = У вас засталося толькі два коды.
codes-reminder-description-create-codes = Стварыце новыя рэзервовыя коды аўтэнтыфікацыі, каб мець магчымасць увайсці ў свой уліковы запіс, калі вы заблакаваны.
lowRecoveryCodes-action-2 = Стварыць коды
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Не засталося рэзервовых кодаў аўтэнтыфікацыі
        [one] Застаўся толькі 1 рэзервовы код аўтэнтыфікацыі!
        [few] Засталося толькі { $numberRemaining } рэзервовых кодаў аўтэнтыфікацыі!
       *[many] Засталося толькі { $numberRemaining } рэзервовых кодаў аўтэнтыфікацыі!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Новы ўваход у { $clientName }
newDeviceLogin-subjectForMozillaAccount = Новы ўваход у ваш { -product-mozilla-account }
newDeviceLogin-title-3 = Ваш { -product-mozilla-account } быў выкарыстаны для ўваходу
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Гэта былі не вы? <a data-l10n-name="passwordChangeLink">Змяніце свой пароль</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Гэта былі не вы? Змяніце свой пароль:
newDeviceLogin-action = Кіраванне ўліковым запісам
passwordChangeRequired-subject = Выяўлена падазроная актыўнасць
passwordChangeRequired-preview = Неадкладна змяніце пароль
passwordChangeRequired-title-2 = Скінуць пароль
passwordChangeRequired-action = Скінуць пароль
passwordChanged-subject = Пароль абноўлены
passwordChanged-title = Пароль паспяхова зменены
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Выкарыстайце { $code }, каб змяніць пароль
password-forgot-otp-title = Забылі свой пароль?
password-forgot-otp-request = Мы атрымалі запыт на змену пароля для вашага { -product-mozilla-account } ад:
password-forgot-otp-expiry-notice = Гэты код дзейнічае 10 хвілін
passwordReset-subject-2 = Ваш пароль быў скінуты
passwordReset-title-2 = Ваш пароль быў скінуты
passwordResetAccountRecovery-subject-2 = Ваш пароль быў скінуты
passwordResetAccountRecovery-title-3 = Ваш пароль быў скінуты
passwordResetAccountRecovery-action-4 = Кіраваць уліковым запісам
passwordResetRecoveryPhone-action = Кіраванне ўліковым запісам
passwordResetWithRecoveryKeyPrompt-subject = Ваш пароль быў скінуты
passwordResetWithRecoveryKeyPrompt-title = Ваш пароль быў скінуты
postAddAccountRecovery-subject-3 = Створаны новы ключ аднаўлення ўліковага запісу
postAddAccountRecovery-title2 = Вы стварылі новы ключ аднаўлення ўліковага запісу
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Захавайце гэты ключ у надзейным месцы — ён спатрэбіцца вам для аднаўлення зашыфраваных звестак аглядання, калі вы забудзеце пароль.
postAddAccountRecovery-action = Кіраванне ўліковым запісам
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Уліковы запіс { $providerName } быў звязаны з вашым { -product-mozilla-account }
postAddLinkedAccount-action = Кіраваць уліковым запісам
postAddRecoveryPhone-preview = Уліковы запіс абаронены двухэтапнай аўтэнтыфікацыяй
postAddRecoveryPhone-title-v2 = Вы дадалі нумар тэлефона для аднаўлення
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Вы дадалі { $maskedLastFourPhoneNumber } у якасці нумара тэлефона для аднаўлення
postAddRecoveryPhone-enabled-device = Вы ўключылі яе з:
postAddRecoveryPhone-action = Кіраванне ўліковым запісам
postAddTwoStepAuthentication-title-2 = Вы ўключылі двухэтапную аўтэнтыфікацыю
postAddTwoStepAuthentication-action = Кіраванне ўліковым запісам
postChangeAccountRecovery-subject = Ключ аднаўлення ўліковага запісу зменены
postChangeAccountRecovery-body-part2 = Захавайце гэты новы ключ у надзейным месцы — ён спатрэбіцца вам для аднаўлення зашыфраваных звестак аглядання, калі вы забудзеце пароль.
postChangeAccountRecovery-action = Кіраванне ўліковым запісам
postChangePrimary-subject = Асноўны адрас эл.пошты зменены
postChangePrimary-title = Новы асноўны адрас эл.пошты
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Вы паспяхова змянілі свой асноўны адрас электроннай пошты на { $email }. Гэты адрас цяпер - ваша імя карыстальніка пры ўваходзе ў ваш уліковы запіс { -product-mozilla-account }, а таксама для атрымання абвестак бяспекі
postChangePrimary-action = Кіраванне ўліковым запісам
postChangeTwoStepAuthentication-action = Кіраваць уліковым запісам
postConsumeRecoveryCode-action = Кіраванне ўліковым запісам
postNewRecoveryCodes-subject-2 = Створаны новыя рэзервовыя коды аўтэнтыфікацыі
postNewRecoveryCodes-title-2 = Вы стварылі новыя рэзервовыя коды аўтэнтыфікацыі
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Яны былі створаны на:
postNewRecoveryCodes-action = Кіраванне ўліковым запісам
postRemoveAccountRecovery-subject-2 = Ключ аднаўлення ўліковага запісу выдалены
postRemoveAccountRecovery-title-3 = Вы выдалілі ключ аднаўлення ўліковага запісу
postRemoveAccountRecovery-action = Кіраванне ўліковым запісам
postRemoveRecoveryPhone-subject = Нумар тэлефона для аднаўлення выдалены
postRemoveRecoveryPhone-title = Нумар тэлефона для аднаўлення выдалены
postRemoveRecoveryPhone-requested-device = Вы запыталі гэта з:
postRemoveSecondary-subject = Другі адрас эл.пошты выдалены
postRemoveSecondary-title = Другі адрас эл.пошты выдалены
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Вы паспяхова выдалілі другі адрас { $secondaryEmail } з вашага ўліковага запісу { -product-mozilla-account }. Абвесткі бяспекі і пацвярджэнні ўваходу больш на гэты адрас дасылацца не будуць.
postRemoveSecondary-action = Кіраванне ўліковым запісам
postRemoveTwoStepAuthentication-subject-line-2 = Двухэтапная аўтарызацыя выключана
postRemoveTwoStepAuthentication-title-2 = Вы адключылі двухэтапную аўтэнтыфікацыю
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Вы адключылі яе з:
postRemoveTwoStepAuthentication-action = Кіраванне ўліковым запісам
postRemoveTwoStepAuthentication-not-required-2 = Вам больш не трэба будзе ўводзіць коды бяспекі з праграмы аўтэнтыфікацыі пры ўваходзе.
postSigninRecoveryCode-preview = Пацвердзіце дзеянні ўліковага запісу
postSigninRecoveryCode-action = Кіраваць уліковым запісам
postSigninRecoveryPhone-preview = Пацвердзіце дзеянні ўліковага запісу
postSigninRecoveryPhone-action = Кіраваць уліковым запісам
postVerify-sub-title-3 = Мы рады вас бачыць!
postVerify-title-2 = Хочаце бачыць адну і тую ж картку на дзвюх прыладах?
postVerify-description-2 = Гэта лёгка! Проста ўсталюйце { -brand-firefox } на іншую прыладу і ўвайдзіце ў свой уліковы запіс для сінхранізацыі. Гэта як магія!
postVerify-sub-description = (Псст… Гэта таксама азначае, што вы можаце атрымаць свае закладкі, паролі і іншыя даныя { -brand-firefox } усюды, дзе вы ўвайшлі ў свой уліковы запіс.)
postVerify-subject-4 = Вітаем у { -brand-mozilla }!
postVerify-setup-2 = Злучыць іншую прыладу:
postVerify-action-2 = Злучыць іншую прыладу
postVerifySecondary-subject = Дададзены другі адрас эл.пошты
postVerifySecondary-title = Дададзены другі адрас эл.пошты
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Вы паспяхова пацвердзілі другі адрас { $secondaryEmail } для вашага ўліковага запісу { -product-mozilla-account }. Абвесткі бяспекі і пацвярджэнні ўваходу цяпер будуць дасылацца на абодва адрасы электроннай пошты.
postVerifySecondary-action = Кіраванне ўліковым запісам
recovery-subject = Скінуць пароль
recovery-title-2 = Забылі свой пароль?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Мы атрымалі запыт на змену пароля для вашага { -product-mozilla-account } ад:
recovery-new-password-button = Стварыце новы пароль, націснуўшы кнопку ніжэй. Тэрмін дзеяння гэтай спасылкі скончыцца на працягу наступнай гадзіны.
recovery-copy-paste = Стварыце новы пароль, скапіраваўшы і ўставіўшы прыведзены ніжэй URL-адрас у свой браўзер. Тэрмін дзеяння гэтай спасылкі скончыцца на працягу наступнай гадзіны.
recovery-action = Стварыць новы пароль
unblockCode-title = Гэта вы ўваходзіце?
unblockCode-prompt = Калі так, вось код аўтарызацыі, які вам патрэбен:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Калі так, вось код аўтарызацыі, які вам патрэбен: { $unblockCode }
unblockCode-report = Калі не, дапамажыце нам стрымліваць зламыснікаў і <a data-l10n-name="reportSignInLink">паведаміце нам аб гэтым.</a>
unblockCode-report-plaintext = Калі не, дапамажыце нам стрымліваць зламыснікаў і паведамце нам аб гэтым.
verificationReminderFinal-subject = Апошні напамін аб праверцы вашага ўліковага запісу
verificationReminderFinal-description-2 = Пару тыдняў таму вы стварылі { -product-mozilla-account }, але так і не пацвердзілі яго. У мэтах вашай бяспекі мы выдалім уліковы запіс, калі вы не пацвердзіце яго на працягу наступных 24 гадзін.
confirm-account = Пацвердзіць уліковы запіс
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Не забудзьцеся пацвердзіць свой уліковы запіс
verificationReminderFirst-title-3 = Вітаем у { -brand-mozilla }!
verificationReminderFirst-description-3 = Некалькі дзён таму вы стварылі { -product-mozilla-account }, але так і не пацвердзілі яго. Калі ласка, пацвердзіце свой уліковы запіс на працягу наступных 15 дзён, інакш ён будзе аўтаматычна выдалены.
verificationReminderFirst-sub-description-3 = Не прапусціце браўзер, які ставіць вас і вашу прыватнасць на першае месца.
confirm-email-2 = Пацвердзіць уліковы запіс
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Пацвердзіць уліковы запіс
verificationReminderSecond-subject-2 = Не забудзьцеся пацвердзіць свой уліковы запіс
verificationReminderSecond-title-3 = Не прапусціце { -brand-mozilla }!
verificationReminderSecond-description-4 = Некалькі дзён таму вы стварылі { -product-mozilla-account }, але так і не пацвердзілі яго. Калі ласка, пацвердзіце свой уліковы запіс на працягу наступных 10 дзён, інакш ён будзе аўтаматычна выдалены.
verificationReminderSecond-sub-description-2 = Станьце часткай нашай місіі па пераўтварэнні Інтэрнэту ў месца, адкрытае для ўсіх.
verificationReminderSecond-action-2 = Пацвердзіць уліковы запіс
verify-title-3 = Адкрыйце Інтэрнэт з дапамогай { -brand-mozilla }
verify-description-2 = Пацвердзіце свой уліковы запіс і атрымайце максімальную аддачу ад { -brand-mozilla } усюды, дзе ўвайшлі, пачынаючы з:
verify-subject = Скончыце стварэнне ўліковага запісу
verify-action-2 = Пацвердзіць уліковы запіс
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Вы ўваходзілі ў { $clientName }?
verifyLogin-description-2 = Дапамажыце нам захаваць ваш уліковы запіс у бяспецы, пацвердзіўшы, што вы ўвайшлі ў сістэму:
verifyLogin-subject-2 = Пацвердзіць уваход
verifyLogin-action = Пацвердзіць уваход
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Вы ўвайшлі ў { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Дапамажыце нам захаваць ваш уліковы запіс у бяспецы, пацвердзіўшы, што вы ўвайшлі ў сістэму:
verifyLoginCode-prompt-3 = Калі так, вось ваш код аўтарызацыі:
verifyLoginCode-expiry-notice = Тэрмін яго дзеяння скончыцца праз 5 хвілін.
verifyPrimary-title-2 = Пацвердзіце асноўную электронную пошту
verifyPrimary-description = Запыт на змену ўліковага запісу быў зроблены з наступнай прылады:
verifyPrimary-subject = Пацвердзіце асноўную электронную пошту
verifyPrimary-action-2 = Пацвердзіце электронную пошту
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Пасля пацверджання з гэтай прылады стануць магчымымі змены ўліковага запісу, такія як даданне другога адрасу электроннай пошты.
verifySecondaryCode-title-2 = Пацвердзіце альтэрнатыўную электронную пошту
verifySecondaryCode-action-2 = Пацвердзіце электронную пошту
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Запыт на выкарыстанне { $email } у якасці другога адрасу электроннай пошты быў зроблены з наступнага { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Выкарыстайце гэты код пацверджання:
verifySecondaryCode-expiry-notice-2 = Яго тэрмін дзеяння мінае праз 5 хвілін. Пасля пацверджання, гэты адрас пачне атрымліваць абвесткі бяспекі і пацвярджэнні.
verifyShortCode-title-3 = Адкрыйце Інтэрнэт з дапамогай { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Пацвердзіце свой уліковы запіс і атрымайце максімальную аддачу ад { -brand-mozilla } усюды, дзе ўвайшлі, пачынаючы з:
verifyShortCode-prompt-3 = Выкарыстайце гэты код пацверджання:
verifyShortCode-expiry-notice = Тэрмін яго дзеяння скончыцца праз 5 хвілін.
