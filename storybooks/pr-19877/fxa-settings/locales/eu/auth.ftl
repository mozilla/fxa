## Non-email strings

session-verify-send-push-title-2 = Zure { -product-mozilla-account }-n saioa hasi nahi duzu?
session-verify-send-push-body-2 = Klikatu hemen zeu zarela egiaztatzeko
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } zure { -brand-mozilla } egiaztapen-kodea da. 5 minutu barru iraungiko da.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } egiaztapen-kodea: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } zure { -brand-mozilla } berreskuratzeko kodea da. 5 minutu barru iraungiko da.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kodea: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = { -brand-mozilla }ren pribatutasun politika
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(majuskulaz: "uppercase") } pribatutasun-oharra
moz-accounts-terms-url = { -product-mozilla-accounts(majuskulaz: "uppercase") } Zerbitzu-baldintzak
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Mezu hau automatikoa da; errorez jaso baduzu, ez duzu ekintzarik burutu behar.
subplat-privacy-notice = Pribatutasun-oharra
subplat-privacy-plaintext = Pribatutasun-oharra:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Posta elektroniko hau jaso duzu { $email }-k { -product-mozilla-account } duelako eta { $productName }-n erregistratu zarelako.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Posta elektroniko hau jaso duzu { $email }-k { -product-mozilla-account } duelako.
subplat-explainer-multiple-2 = Posta elektroniko hau jaso duzu { $email }-k { -product-mozilla-account } duelako eta hainbat produktutara harpidetuta zaudelako.
subplat-explainer-was-deleted-2 = Posta elektroniko hau jaso duzu { $email } posta  { -product-mozilla-account } kontuan erregistratu delako..
subplat-manage-account-2 = Kudeatu zure { -product-mozilla-account } ezarpenak <a data-l10n-name="subplat-account-page">kontuaren orria</a> bisitatuz.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Kudeatu zure { -product-mozilla-account } ezarpenak zure kontuko orrian: { $accountSettingsUrl }
subplat-terms-policy = Baldintzak eta bertan behera uzteko politika
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Utzi harpidetza
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Aktibatu berriro harpidetza
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Eguneratu fakturazio-informazioa
subplat-privacy-policy = { -brand-mozilla }ren pribatutasun politika
subplat-privacy-policy-2 = { -product-mozilla-accounts(majuskulaz: "majuskulaz") } Pribatutasun-oharra
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(majuskulaz: "majuskulaz") } Zerbitzu-baldintzak
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Lege-oharra
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Pribatutasuna
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Zure kontua ezabatzen bada, Mozilla Corporation eta Mozilla Foundationen mezu elektronikoak jasoko dituzu, <a data-l10n-name="unsubscribeLink">harpidetza kentzeko eskatu arte</a>.
account-deletion-info-block-support = Galderarik baduzu edo laguntza behar baduzu, jar zaitez harremanetan gure <a data-l10n-name="supportLink">laguntza-taldearekin</a>.
account-deletion-info-block-communications-plaintext = Zure kontua ezabatzen bada, Mozilla Corporation eta Mozilla Foundation-en mezu elektronikoak jasoko dituzu, harpidetza kentzeko eskatzen ez baduzu behintzat:
account-deletion-info-block-support-plaintext = Galderarik baduzu edo laguntza behar baduzu, jar zaitez harremanetan gure laguntza-taldearekin:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Deskargatu { $productName } { -google-play }tik">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Deskargatu { $productName } { -app-store }tik">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instalatu { $productName } <a data-l10n-name="anotherDeviceLink">mahaigaineko beste gailu batean</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instalatu { $productName } <a data-l10n-name="anotherDeviceLink">beste gailu batean</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Lortu { $productName } Google Play-n:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Jaitsi { $productName } App Store-n
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instalatu { $productName } beste gailu batean
automated-email-change-2 = Ekintza hau egin ez baduzu, <a data-l10n-name="passwordChangeLink">aldatu pasahitza</a> berehala.
automated-email-support = Informazio gehiago lortzeko, joan<a data-l10n-name="supportLink">{ -brand-mozilla } Laguntza</a>ra.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Zuk ez baduzu egin, alda ezazu zure pasahitza orain
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Informazio gehiagorako, jo { -brand-mozilla }-ra
automated-email-inactive-account = Hau posta elektroniko automatiko bat da. { -product-mozilla-account } kontu bat duzulako eta 2 urte igaro dira azken saioa hasi zenuenetik jasotzen ari zara.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Informazio gehiago lortzeko, bisitatu <a data-l10n-name="supportLink">{ -brand-mozilla } Laguntza</a>.
automated-email-no-action-plaintext = Korreo automatiko bat da hau. Akats batengatik jaso baduzu, ez duzu ezer egin beharrik.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Korreo automatiko bat da hau; Ez baduzu hau onartu, mesedez, alda ezazu zure pasahitza:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Eskaera hau { $uaBrowser }-tik etorri da { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Eskaera hau { $uaBrowser }-tik etorri da { $uaOS }-n.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Eskaera hau { $uaBrowser }-tik etorri da.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Eskaera hau { $uaOS } { $uaOSVersion }-tik etorri da.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Eskaera hau { $uaOS }-tik etorri da.
automatedEmailRecoveryKey-delete-key-change-pwd = Zu ez bazara, <a data-l10n-name="revokeAccountRecoveryLink">ezabatu gako berria</a> eta <a data-l10n-name="passwordChangeLink"> aldatu zure pasahitza</a>.
automatedEmailRecoveryKey-change-pwd-only = Hau ez bazara, <a data-l10n-name="passwordChangeLink">aldatu pasahitza</a>.
automatedEmailRecoveryKey-more-info = Informazio gehiago lortzeko, joan <a data-l10n-name="supportLink">{ -brand-mozilla } Laguntza</a>ra.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Eskaera hemendik etorri da:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Hau ez bazara, ezabatu gako berria:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Hau ez bazara, aldatu pasahitza:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = eta aldatu pasahitza:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = edo informazio gehiago, bisitatu { -brand-mozilla } Laguntza:
automated-email-reset =
    Hau posta elektroniko automatizatu bat da; ekintza hau baimendu ez baduzu, <a data-l10n-name="resetLink">berrezarri pasahitza</a>.
    Informazio gehiago lortzeko, bisitatu <a data-l10n-name="supportLink">{ -brand-mozilla } Laguntza</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Ekintza hau baimendu ez bazenuen, berrezarri zure pasahitza orain { $resetLink } helbidean
brand-banner-message = Ba al zenekien gure izena { -product-firefox-accounts } izatetik { -product-mozilla-accounts } izatera aldatu dugula? <a data-l10n-name="learnMore">Lortu informazio gehiago</a>
cancellationSurvey = Mesedez, gure zerbitzuak hobetzen lagun iezaguzu honako <a data-l10n-name="cancellationSurveyUrl"> galdetegi motz honi erantzunez</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Mesedez, gure zerbitzuak hobetzen lagun iezaguzu honako galdetegi motz honi erantzunez
change-password-plaintext = Inor zure kontuan sartzen saiatzen ari dela susmatzen baduzu, mesedez aldatu zure pasahitza.
manage-account = Kudeatu kontua
manage-account-plaintext = { manage-account }:
payment-details = Ordainketaren xehetasunak:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Faktura-zenbakia: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Kobratuta: { $invoiceTotal } { $invoiceDateOnly } egunean
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Hurrengo faktura: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Azpi-totala: { $invoiceSubtotal }

##

subscriptionSupport = Zure harpidetzari buruzko galderarik ba al duzu? Gure <a data-l10n-name="subscriptionSupportUrl"> laguntza taldea </a> zuri laguntzeko prest dago.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Zure harpidetzari buruzko galderarik ba al duzu? Gure laguntza taldea laguntzeko prest dago.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Eskarrikasko { $productName }-n harpidetzeagatik. Zure harpidetzari buruz galderarik baduzu edo { $productName }ri buruz informazio gehiago nahi baduzu, jarri harremanetan <a data-l10n-name="subscriptionSupportUrl"> gurekin</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Eskarrikasko { $productName }-n harpidetzeagatik. Zure harpidetzari buruz galderarik baduzu edo { $productName }-ri buruz informazio gehiago nahi baduzu, jarri harremanetan gurekin.
subscriptionUpdateBillingEnsure = Zure ordainketa-metodoa eta kontuaren informazioa eguneratuta daudela <a data-l10n-name="updateBillingUrl"> hemen ziurtatu dezakezu</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Zure ordainketa-metodoa eta kontuaren informazioa eguneratuta daudela hemen ziurtatu dezakezu:
subscriptionUpdateBillingTry = Zure ordainketa egiten saiatuko gara berriro hurrengo egunetan, baina baliteke hori konpontzen lagundu behar izatea <a data-l10n-name="updateBillingUrl">ordainketen informazioa eguneratuz</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Zure ordainketa egiten saiatuko gara berriro hurrengo egunetan, baina baliteke hori konpontzen lagundu behar izatea ordainketen informazioa eguneratuz:
subscriptionUpdatePayment = Zure zerbitzua etenik ez izateko, mesedez <a data-l10n-name="updateBillingUrl">eguneratu zure ordainketa-informazioa</a> ahalik eta azkarren.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Zure zerbitzua etenik ez izateko, mesedez eguneratu zure ordainketa-informazioa ahalik eta azkarren.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } nabegatzailea { $uaOS }{ $uaOSVersion }-n
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } nabegatzailea { $uaOS }-n
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ikusi faktura: { $invoiceLink }
cadReminderFirst-subject-1 = Gogoratu! Sinkroniza dezagun { -brand-firefox }
cadReminderFirst-action = Sinkronizatu beste gailu bat
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Bi behar dira sinkronizatzeko
cadReminderFirst-description-v2 = Eraman zure fitxak gailu guztietara. Lortu zure laster-markak, pasahitzak eta bestelako datuak { -brand-firefox } erabiltzen dituzun toki guztietan.
cadReminderSecond-subject-2 = Ez galdu! Amai dezagun sinkronizazio konfigurazioa
cadReminderSecond-action = Sinkronizatu beste gailu bat
cadReminderSecond-title-2 = Ez ahaztu sinkronizatzea!
cadReminderSecond-description-sync = Sinkronizatu zure laster-markak, pasahitzak, irekitako fitxak eta gehiago { -brand-firefox } erabiltzen duzun toki guztietan.
cadReminderSecond-description-plus = Zure datuak beti zifratuak daude. Zu eta zure gailuak bakarrik onar dezakete hauek ikustea.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Ongi etorri { $productName }(e)ra
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Ongi etorri { $productName }(e)ra
downloadSubscription-content-2 = Has gaitezen zure harpidetzako erabilera guztiak erabiltzen:
downloadSubscription-link-action-2 = Hasi erabiltzen
fraudulentAccountDeletion-subject-2 = Zure { -product-mozilla-account } ezabatu zen
fraudulentAccountDeletion-title = Zure kontua ezabatu da
fraudulentAccountDeletion-content-part1-v2 = Duela gutxi, { -product-mozilla-account } bat sortu da eta harpidetza kobratu da helbide elektroniko hau erabiliz. Kontu berri guztiekin egiten dugun bezala, zure kontua berresteko eskatu dizugu helbide elektroniko hau balioztatuz.
fraudulentAccountDeletion-content-part2-v2 = Gaur egun, kontua ez dela inoiz baieztatu ikusten dugu. Urrats hau amaitu ez denez, ez dakigu ziur harpidetza baimendua den. Ondorioz, helbide elektroniko honetan erregistratutako { -product-mozilla-account } ezabatu egin da eta zure harpidetza bertan behera utzi da, gastu guztiak itzulita.
fraudulentAccountDeletion-contact = Galderarik baduzu, jarri harremanetan gure <a data-l10n-name="mozillaSupportUrl">laguntza-taldearekin</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Galderarik baduzu, mesedez, gure laguntza taldearekin jar zaitez harremanetan: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = { -product-mozilla-account } mantentzeko azken aukera
inactiveAccountFinalWarning-title = Zure { -brand-mozilla } kontua eta datuak ezabatu egingo dira
inactiveAccountFinalWarning-preview = Hasi saioa zure kontua mantentzeko
inactiveAccountFinalWarning-account-description = Zure { -product-mozilla-account } doako pribatutasun eta arakatze produktuak atzitzeko erabiltzen da, hala nola { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } eta { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> egunean, zure kontua eta zure datu pertsonalak betiko ezabatuko dira saioa hasi ezean.
inactiveAccountFinalWarning-action = Hasi saioa zure kontua mantentzeko
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Hasi saioa zure kontua mantentzeko:
inactiveAccountFirstWarning-subject = Ez galdu zure kontua
inactiveAccountFirstWarning-title = Zure { -brand-mozilla } kontua eta datuak mantendu nahi dituzu?
inactiveAccountFirstWarning-account-description-v2 = Zure { -product-mozilla-account } doako pribatutasun eta arakatze produktuak atzitzeko erabiltzen da, hala nola { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } eta { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Konturatu gara 2 urte daramatzazula saioa hasi gabe.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Zure kontua eta zure datu pertsonalak behin betiko ezabatuko dira <strong>{ $deletionDate }</strong> egunean, ez zarelako aktibo egon.
inactiveAccountFirstWarning-action = Hasi saioa zure kontua mantentzeko
inactiveAccountFirstWarning-preview = Hasi saioa zure kontua mantentzeko
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Hasi saioa zure kontua mantentzeko:
inactiveAccountSecondWarning-subject = Beharrezko ekintza: 7 egun barru kontua ezabatuko da
inactiveAccountSecondWarning-title = Zure { -brand-mozilla } kontua eta datuak ezabatu egingo dira 7 egun barru
inactiveAccountSecondWarning-account-description-v2 = Zure { -product-mozilla-account } doako pribatutasun eta arakatze produktuak atzitzeko erabiltzen da, hala nola { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } eta { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Zure kontua eta zure datu pertsonalak behin betiko ezabatuko dira <strong>{ $deletionDate }</strong> egunean, ez zarelako aktibo egon.
inactiveAccountSecondWarning-action = Hasi saioa zure kontua mantentzeko
inactiveAccountSecondWarning-preview = Hasi saioa zure kontua mantentzeko
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Hasi saioa zure kontua mantentzeko:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Babes-kopiarako autentikazio-koderik gabe gelditu zara!
codes-reminder-title-one = Zure azkeneko babes-kopiarako autentikazio-kodean zaude
codes-reminder-title-two = Babeskopiako autentifikazio-kode gehiago sortzeko garaia
codes-reminder-description-part-one = Babeskopiako autentifikazio-kodeek zure informazioa leheneratzen laguntzen dizute pasahitza ahazten duzunean.
codes-reminder-description-part-two = Zure datuak aurrerago ez galtzeko, sor itzazu kode berriak orain.
codes-reminder-description-two-left = Bakarrik bi kode gelditzen zaizkizu.
codes-reminder-description-create-codes = Sortu babeskopiko autentifikazio-kode berriak, blokeatuta bazaude zure kontua itzultzen laguntzeko.
lowRecoveryCodes-action-2 = Kodeak sortu
codes-create-plaintext = { lowRecoveryCodes-action-2 }
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Ez da ordezko autentifikazio-koderik geratzen
        [one] autentifikazio-kode bakarra geldintzen da
       *[other] { $numberRemaining } autentifikazio-kode bakarrik gelditzen dira!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Saio hasiera berria { $clientName }-n
newDeviceLogin-subjectForMozillaAccount = Hasi saioa zure { -product-mozilla-account } kontuan
newDeviceLogin-title-3 = Zure { -product-mozilla-account } erabili zen saioa hasteko
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Ez zara zu? <a data-l10n-name="passwordChangeLink"> Alda ezazu pasahitza</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Ez zara zu? Alda ezazu pasahitza:
newDeviceLogin-action = Kudeatu kontua
passwordChanged-subject = Pasahitza eguneratuta
passwordChanged-title = Pasahitza ondo aldatu da
passwordChanged-description-2 = Zure { -product-mozilla-account }-ko pasahitza ondo aldatu da ondorengo gailutik:
passwordChangeRequired-subject = Aktibitate susmagarria detektatu da
password-forgot-otp-title = Pasahitza ahaztu duzu?
password-forgot-otp-request = Zure { -product-mozilla-account } pasahitza aldatzeko eskaera jaso dugu hemendik:
password-forgot-otp-code-2 = Hau zu bazara, hona hemen zure berrespen-kodea aurrera egiteko:
password-forgot-otp-expiry-notice = Kode hau 10 minutu barru iraungiko da.
passwordReset-subject-2 = Zure pasahitza berrezarri egin da
passwordReset-title-2 = Zure pasahitza berrezarri egin da
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Zure { -product-mozilla-account } pasahitza berrezarri zenuen:
passwordResetAccountRecovery-subject-2 = Zure pasahitza berrezarri egin da
passwordResetAccountRecovery-title-3 = Zure pasahitza berrezarri egin da
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Zure { -product-mozilla-account } kontua berreskuratzeko gakoa erabili duzu pasahitza eguneratzeko data honetan:
passwordResetAccountRecovery-information = Sinkronizatutako gailu guztietatan amaitu dugu saioa. Kontua berreskuratzeko gako berri bat sortu dugu erabili zenuena ordezkatzeko. Zure kontuaren ezarpenetan alda dezakezu.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Sinkronizatutako gailu guztietatan amaitu dugu saioa. Kontua berreskuratzeko gako berri bat sortu dugu erabili zenuena ordezkatzeko. Zure kontuaren ezarpenetan alda dezakezu:
passwordResetAccountRecovery-action-4 = Kudeatu kontua
passwordResetWithRecoveryKeyPrompt-subject = Zure pasahitza berrezarri egin da
passwordResetWithRecoveryKeyPrompt-title = Zure pasahitza berrezarri egin da
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Zure { -product-mozilla-account } pasahitza berrezarri zenuen:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Sortu kontua  berreskuratzeko gakoa
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Sortu kontua berreskuratzeko gakoa:
passwordResetWithRecoveryKeyPrompt-cta-description = Berriro saioa hasi beharko duzu sinkronizatutako gailu guztietan. Mantendu zure datuak seguru hurrengoan kontua berreskuratzeko giltza batekin. Horri esker, zure datuak berreskura ditzakezu pasahitza ahazten baduzu.
postAddAccountRecovery-subject-3 = Kontua berreskuratzeko gako berria sortua
postAddAccountRecovery-title2 = Kontua berreskuratzeko gako berria sortu duzu
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Gorde gako hau leku seguru batean — pasahitza ahazten baduzu zure nabigazio-datuak enkriptatutakoak leheneratzeko beharko dituzu.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Gako hau behin bakarrik erabil daiteke. Erabili ondoren, automatikoki sortuko dizugu berri bat. Edo edozein unetan berri bat sor dezakezu zure kontuaren ezarpenetatik.
postAddAccountRecovery-action = Kudeatu kontua
postAddLinkedAccount-subject-2 = Kontu berria zure { -product-mozilla-account }-ri lotuta
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Zure { $providerName } kontuarekin lotu da zure { -product-mozilla-account }
postAddLinkedAccount-action = Kudeatu kontua
postAddRecoveryPhone-subject = Berreskuratze telefonoa gehitu da
postAddRecoveryPhone-preview = Bi urratseko autentifikazioaren bidez babestuta dagoen kontua
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = { $maskedLastFourPhoneNumber } gehitu duzu berreskuratzeko telefono zenbaki gisa
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Honek zure kontua nola babesten duen
postAddRecoveryPhone-how-protect-plaintext = Honek zure kontua nola babesten duen:
postAddRecoveryPhone-enabled-device = Hemendik gaitu duzu:
postAddRecoveryPhone-action = Kudeatu kontua
postAddTwoStepAuthentication-title-2 = Bi urratseko autentifikazioa aktibatu duzu
postAddTwoStepAuthentication-action = Kudeatu kontua
postChangeAccountRecovery-subject = Kontuaren berreskuratze-gakoa aldatuta
postChangeAccountRecovery-title = Kontua berreskuratzeko gakoa aldatu duzu
postChangeAccountRecovery-body-part1 = Orain kontua berreskuratzeko gako berri bat duzu. Zure aurreko gakoa ezabatu egin da.
postChangeAccountRecovery-body-part2 = Gorde gako hau leku seguru batean — pasahitza ahazten baduzu zure zifratutako nabigazio-datuak leheneratzeko beharko dituzu.
postChangeAccountRecovery-action = Kudeatu kontua
postChangePrimary-subject = Helbide elektroniko nagusia eguneratua
postChangePrimary-title = Helbide elektroniko nagusi berria
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Behar bezala aldatu duzu zure helbide elektroniko nagusia { $email } izatera. Helbide hau zure { -product-mozilla-account }-n saioa hasteko zure erabiltzaile-izena da, baita segurtasun jakinarazpenak eta saioa hasteko berrespenak jasotzeko ere.
postChangePrimary-action = Kudeatu kontua
postChangeRecoveryPhone-subject = Berreskuratze telefonoa eguneratu da
postChangeRecoveryPhone-preview = Bi urratseko autentifikazioaren bidez babestuta dagoen kontua
postChangeRecoveryPhone-title = Berreskuratzeko telefonoa aldatu duzu
postChangeRecoveryPhone-description = Orain berreskuratzeko telefono berri bat duzu. Zure aurreko telefono-zenbakia ezabatu egin da.
postChangeRecoveryPhone-requested-device = Honi eskatu diozu:
postConsumeRecoveryCode-action = Kudeatu kontua
postNewRecoveryCodes-subject-2 = Sortu dira babeskopiko autentifikazio-kode berriak
postNewRecoveryCodes-title-2 = Babeskopiarako autentifikazio-kodea berriak sortu dituzu
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Data honetan sortu ziren:
postNewRecoveryCodes-action = Kudeatu kontua
postRemoveAccountRecovery-subject-2 = Kontua berreskuratzeko gakoa ezabatua
postRemoveAccountRecovery-title-3 = Kontua berreskuratzeko gakoa ezabatu duzu
postRemoveAccountRecovery-body-part1 = Zure kontua berreskuratzeko gakoa beharrezkoa da zifratutako arakatze-datuak leheneratzeko pasahitza ahazten baduzu.
postRemoveAccountRecovery-body-part2 = Oraindik ez baduzu, sortu kontua berreskuratzeko gako berri bat kontuaren ezarpenetan, gordetako pasahitzak, laster-markak, arakatze-historia eta abar ez galtzeko.
postRemoveAccountRecovery-action = Kudeatu kontua
postRemoveRecoveryPhone-subject = Berreskuratze telefonoa kendu da
postRemoveRecoveryPhone-preview = Bi urratseko autentifikazioaren bidez babestuta dagoen kontua
postRemoveRecoveryPhone-title = Berreskuratze telefonoa kendu da
postRemoveRecoveryPhone-description-v2 = Zure berreskuratze-telefonoa bi urratseko autentifikazio-ezarpenetatik kendu da.
postRemoveRecoveryPhone-description-extra = Zure autentifikazio aplikazioa erabili ezin baduzu ere, zure babeskopiako autentifikazio-kodeak erabil ditzakezu saioa hasteko.
postRemoveRecoveryPhone-requested-device = Honi eskatu diozu:
postRemoveSecondary-subject = Helbide elektronikoa alternatiboa kenduta
postRemoveSecondary-title = Helbide elektronikoa alternatiboa kenduta
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Behar bezala kendu duzu { $secondaryEmail } bigarren mailako mezu elektroniko gisa zure { -product-mozilla-account }tik. Segurtasun-jakinarazpenak eta saioa hasteko berrespenak ez dira helbide honetara bidaliko.
postRemoveSecondary-action = Kudeatu kontua
postRemoveTwoStepAuthentication-subject-line-2 = Bi urratseko autentifikazioa desaktibatu da
postRemoveTwoStepAuthentication-title-2 = Bi urratseko autentifikazioa desaktibatu duzu
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Hemendik desgaitu duzu:
postRemoveTwoStepAuthentication-action = Kudeatu kontua
postRemoveTwoStepAuthentication-not-required-2 = Jada ez duzu zure autentifikazio-aplikazioko segurtasun-koderik behar saioa hasten duzunean.
postSigninRecoveryCode-subject = Saioa hasteko autentifikazio-kodearen babeskopia erabili da
postSigninRecoveryCode-preview = Berretsi kontuaren jarduera
postSigninRecoveryCode-title = Zure autentifikazio-kodearen babeskopia erabili da saioa hasteko
postSigninRecoveryCode-description = Hau egin ez baduzu, pasahitza berehala aldatu beharko zenuke kontua seguru mantentzeko.
postSigninRecoveryCode-device = Hemendik hasi duzu saioa:
postSigninRecoveryCode-action = Kudeatu kontua
postSigninRecoveryPhone-subject = Saioa hasteko erabili den berreskuratzeko telefonoa
postSigninRecoveryPhone-preview = Berretsi kontuaren jarduera
postSigninRecoveryPhone-title = Saioa hasteko berreskuratzeko telefonoa erabili da
postSigninRecoveryPhone-description = Hau egin ez baduzu, pasahitza berehala aldatu beharko zenuke kontua seguru mantentzeko.
postSigninRecoveryPhone-device = Hemendik hasi duzu saioa:
postSigninRecoveryPhone-action = Kudeatu kontua
postVerify-sub-title-3 = Pozik gaude zu ikusteaz!
postVerify-title-2 = Fitxa bera ikusi nahi duzu bi gailutan?
postVerify-description-2 = Erraza da! Instalatu { -brand-firefox } beste gailu batean eta hasi saioa sinkronizatzeko. Magia bezalakoa da!
postVerify-sub-description = (Psst… Horrek esan nahi du zure laster-markak, pasahitzak eta { -brand-firefox } beste datu batzuk lor ditzakezula saioa hasita duzun toki guztietan).
postVerify-subject-4 = Ongi etorri { -brand-mozilla }-ra!
postVerify-setup-2 = Konektatu beste gailu bat:
postVerify-action-2 = Konektatu beste gailu bat
postVerifySecondary-subject = Helbide elektroniko alternatiboa gehitua
postVerifySecondary-title = Helbide elektroniko alternatiboa gehitua
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Behar bezala berretsi duzu { $secondaryEmail } zure { -product-mozilla-account } bigarren mailako mezu elektroniko gisa. Segurtasun jakinarazpenak eta saioa hasteko baieztapenak bi helbide elektronikoetara bidaliko dira orain.
postVerifySecondary-action = Kudeatu kontua
recovery-subject = Berrezarri pasahitza
recovery-title-2 = Pasahitza ahaztu duzu?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Zure { -product-mozilla-account } pasahitza aldatzeko eskaera jaso dugu hemendik:
recovery-new-password-button = Sortu pasahitz berri bat beheko botoian klik eginez. Esteka hau hurrengo ordu batean iraungiko da.
recovery-copy-paste = Sortu pasahitz berri bat kopiatu eta itsatsi beheko URLa zure arakatzailean. Esteka hau hurrengo ordu bete barru iraungiko da.
recovery-action = Sortu pasahitz berria
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Zure { $productName } harpidetza bertan behera utzi da
subscriptionAccountDeletion-title = Sentitzen dugu zu joatea
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Duela gutxi ezabatu duzu zure { -product-mozilla-account }. Ondorioz, { $productName } harpidetza bertan behera utzi dugu. { $invoiceTotal }ren azken ordainketa { $invoiceDateOnly } egunean ordaindu zen.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Ongi etorri { $productName }-ra: ezarri zure pasahitza.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Ongi etorri { $productName }(e)ra
subscriptionAccountFinishSetup-content-processing = Ordainketa prozesatzen ari da eta lau lanegun behar izan ditzake osatzeko. Zure harpidetza automatikoki berrituko da fakturazio-aldi bakoitzean bertan behera uztea erabakitzen ez baduzu.
subscriptionAccountFinishSetup-content-create-3 = Ondoren, { -product-mozilla-account } pasahitz bat sortu beharko duzu harpidetza berria erabiltzen hasteko.
subscriptionAccountFinishSetup-action-2 = Hasi erabiltzen
subscriptionAccountReminderFirst-subject = Oroigarria: amaitu zure kontuaren ezarpenak
subscriptionAccountReminderFirst-title = Oraindik ezin duzu zure harpidetza sartu
subscriptionAccountReminderFirst-content-info-3 = Duela egun batzuk { -product-mozilla-account } bat sortu zenuen baina ez zenuen inoiz baieztatu. Zure kontua konfiguratzen amaitzea espero dugu, harpidetza berria erabil dezazun.
subscriptionAccountReminderFirst-content-select-2 = Hautatu "Sortu pasahitza" pasahitz berri bat konfiguratzeko eta zure kontua berresten amaitzeko.
subscriptionAccountReminderFirst-action = Sortu pasahitza
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Azken oroigarria: konfiguratu zure kontua
subscriptionAccountReminderSecond-title-2 = Ongi etorri { -brand-mozilla }-ra!
subscriptionAccountReminderSecond-content-info-3 = Duela egun batzuk { -product-mozilla-account } bat sortu zenuen baina ez zenuen inoiz baieztatu. Zure kontua konfiguratzen amaitzea espero dugu, harpidetza berria erabil dezazun.
subscriptionAccountReminderSecond-content-select-2 = Hautatu "Sortu pasahitza" pasahitz berri bat konfiguratzeko eta zure kontua berresten amaitzeko.
subscriptionAccountReminderSecond-action = Sortu pasahitza
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Zure { $productName } harpidetza bertan behera utzi da
subscriptionCancellation-title = Sentitzen dugu zu joatea

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = { $productName } harpidetza bertan behera utzi dugu. { $invoiceTotal }ren azken ordainketa { $invoiceDateOnly } egunean ordaindu zen.
subscriptionCancellation-outstanding-content-2 = { $productName } harpidetza bertan behera utzi dugu. { $invoiceTotal }ren azken ordainketa { $invoiceDateOnly } egunean ordainduko da.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Zure zerbitzuak uneko fakturazio-aldia amaitu arte jarraituko du, hau da, { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = { $productName }-ra aldatu zara
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = { $productNameOld }-tik { $productName }-ra behar bezala aldatu zara.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Zure hurrengo fakturatik hasita, zure kobratzea { $paymentAmountOld } { $productPaymentCycleOld } bakoitzeko izatetik,  { $paymentAmountNew } { $productPaymentCycleNew } bakoitzeko izatera aldatuko da. Une horretan, { $paymentProrated }-ko kreditu bakarre bat ere emango zaizu { $productPaymentCycleOld } honen gainontzeko kargu txikiagoa islatzeko.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = { $productName } erabili ahal izateko instalatu behar duzun software berria badago, mezu elektroniko bat jasoko duzu deskargatzeko argibideekin.
subscriptionDowngrade-content-auto-renew = Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du bertan behera uztea erabakitzen ez baduzu.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Zure { $productName } harpidetza bertan behera utzi da
subscriptionFailedPaymentsCancellation-title = Zure harpidetza bertan behera utzi da
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = { $productName } harpidetza bertan behera utzi dugu hainbat ordainketa-saiakerak huts egin direlako. Berriro sarbidea lortzeko, hasi harpidetza berri bat ordainketa-metodo eguneratu batekin.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } ordainketa berretsi da
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Eskerrik asko { $productName } zerbitzura harpidetzeagatik
subscriptionFirstInvoice-content-processing = Ordainketa prozesatzen ari da eta lau lanegun behar izan ditzake osatzeko.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = { $productName } erabiltzen hasteko mezu elektroniko bat jasoko duzu.
subscriptionFirstInvoice-content-auto-renew = Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du bertan behera uztea erabakitzen ez baduzu.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } ordainketak huts egin du
subscriptionPaymentFailed-title = Barkatu, arazoak ditugu ordainketarekin
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Arazo bat izan dugu { $productName }-ren azken ordainketarekin.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Ordainketa-informazioa eguneratu behar da { $productName }-rako
subscriptionPaymentProviderCancelled-title = Barkatu, arazoak ditugu ordainketa-metodoarekin
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Arazo bat hauteman dugu zure ordainketa-metodoarekin: { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } harpidetza berriz aktibatua
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Eskerrik asko { $productName } harpidetza berriz aktibatzeagatik!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Zure fakturazio-zikloa eta ordainketa berdinak izango dira. Hurrengo kargua { $invoiceTotal } izango da { $nextInvoiceDateOnly } egunean. Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du, bertan behera uztea erabakit arte.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } berritze automatikoko oharra
subscriptionRenewalReminder-title = Zure harpidetza laster berrituko da
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = { $productName } bezero agurgarria:
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Uneko harpidetza { $reminderLength } egun barru automatikoki berritzeko ezarrita dago. Une horretan, { -brand-mozilla }-k zure { $planIntervalCount } { $planInterval } harpidetza berrituko du eta { $invoiceTotal } kobratuko da zure kontuko ordainketa-metodoari.
subscriptionRenewalReminder-content-closing = Adeitasunez
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } taldea
subscriptionsPaymentProviderCancelled-subject = Ordainketa-informazioaren eguneratzea beharrezkoa da { -brand-mozilla } harpidetzetan
subscriptionsPaymentProviderCancelled-title = Barkatu, arazoak ditugu ordainketa-metodoarekin
subscriptionsPaymentProviderCancelled-content-detected = Arazo bat hauteman dugu zure ordainketa-metodoarekin hurrengo harpidetzetan.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } ordainketa jaso da
subscriptionSubsequentInvoice-title = Eskerrik asko harpidedun izateagatik!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName }-ren azken ordainketa jaso dugu.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = { $productName }-era berritu zara
subscriptionUpgrade-title = Eskerrik asko eguneratzeagatik!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du bertan behera uztea erabakitzen ez baduzu.
unblockCode-title = Zuk hasi duzu saioa?
unblockCode-prompt = Hala bada, hau da behar duzun baimen-kodea:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Baiezkoa bada, hona hemen behar duzun baimen-kodea: { $unblockCode }
unblockCode-report = Ezezkoa bada, lagundu intrusioak uxatzen eta <a data-l10n-name="reportSignInLink">jakinarazi iezaguzu</a>.
unblockCode-report-plaintext = Ez bada, lagun iezaguzu arrotzak kanporatzen eta eman horren berri guri.
verificationReminderFinal-subject = Zure kontua berresteko azken abisua
verificationReminderFinal-description-2 = Duela aste pare bat { -product-mozilla-account } bat sortu zenuen, baina ez zenuen inoiz baieztatu. Zure segurtasunerako, hurrengo 24 orduetan egiaztatzen ez bada kontua ezabatuko dugu.
confirm-account = Berretsi kontua
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Gogoratu zure kontua berrestea
verificationReminderFirst-title-3 = Ongi etorri { -brand-mozilla }-ra!
verificationReminderFirst-description-3 = Duela egun batzuk { -product-mozilla-account } bat sortu zenuen, baina ez duzu inoiz baieztatu. Mesedez, berretsi zure kontua hurrengo 15 egunetan edo automatikoki ezabatuko da.
verificationReminderFirst-sub-description-3 = Ez galdu zu eta zure pribatutasuna lehenik jartzen dituen arakatzailea.
confirm-email-2 = Berretsi kontua
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Berretsi kontua
verificationReminderSecond-subject-2 = Gogoratu zure kontua berrestea
verificationReminderSecond-title-3 = Ez galdu { -brand-mozilla }!
verificationReminderSecond-description-4 = Duela egun batzuk { -product-mozilla-account } bat sortu zenuen, baina ez duzu inoiz baieztatu. Mesedez, berretsi zure kontua hurrengo 10 egunetan edo automatikoki ezabatuko da.
verificationReminderSecond-second-description-3 = Zure { -product-mozilla-account } zure { -brand-firefox } esperientzia sinkronizatzeko aukera ematen dizu gailu guztietan eta { -brand-mozilla } zerbitzuko pribatutasuna babesten duten produktu gehiagorako sarbidea desblokeatzen du.
verificationReminderSecond-sub-description-2 = Izan zaitez Internet guztientzako irekia den leku bihurtzeko gure misioaren parte.
verificationReminderSecond-action-2 = Berretsi kontua
verify-title-3 = Ireki internet { -brand-mozilla }z
verify-description-2 = Berretsi kontua eta atera etekinik handiena { -brand-mozilla }-ri saioa hasten duzun toki guztietan:
verify-subject = Bukatu zure kontua sortzen
verify-action-2 = Berretsi kontua
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Hasi duzu saioa { $clientName }-(e)n?
verifyLogin-description-2 = Lagundu iezaguzu zure kontua seguru mantentzen saioa hasi duzula baieztatuz:
verifyLogin-subject-2 = Berretsi saio-hasiera
verifyLogin-action = Berretsi saio-hasiera
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Hasi duzu saioa { $serviceName }-(e)n?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Lagundu iezaguzu zure kontua seguru mantentzen saioa hastea onartuz:
verifyLoginCode-prompt-3 = Baiezkoa bada, hona hemen zure baimen-kodea:
verifyLoginCode-expiry-notice = 5 minututan iraungiko da.
verifyPrimary-title-2 = Berretsi helbide elektroniko lehenetsia
verifyPrimary-description = Kontua aldatzeko eskaera egin da gailu honetatik:
verifyPrimary-subject = Berretsi helbide elektroniko lehenetsia
verifyPrimary-action-2 = Berretsi helbide elektronikoa
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Berretsi ondoren, kontu-aldaketak egin ahal izango dira gailu honetatik bigarren mailako mezu elektroniko bat gehitzea, esaterako.
verifySecondaryCode-title-2 = Berretsi bigarren helbide elektronikoa
verifySecondaryCode-action-2 = Berretsi helbide elektronikoa
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = { $email } bigarren helbide elektroniko gisa erabiltzeko eskaera egin da { -product-mozilla-account } honetatik:
verifySecondaryCode-prompt-2 = Sartu baieztapen-kode hau:
verifySecondaryCode-expiry-notice-2 = 5 minututan iraungiko da. Behin baieztatuta, helbide hau segurtasun jakinarazpenak eta berrespenak jasotzen hasiko da.
verifyShortCode-title-3 = Ireki internet { -brand-mozilla }z
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Berretsi kontua eta atera etekinik handiena { -brand-mozilla }-ri saioa hasten duzun toki guztietan:
verifyShortCode-prompt-3 = Sartu baieztapen-kode hau:
verifyShortCode-expiry-notice = 5 minututan iraungiko da.
