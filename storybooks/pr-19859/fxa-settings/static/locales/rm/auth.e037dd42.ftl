## Non-email strings

session-verify-send-push-title-2 = Acceder a tes conto { -product-mozilla-account }?
session-verify-send-push-body-2 = Clicca qua per confermar tia identitad
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } è tes code da verificaziun { -brand-mozilla }. El scada en 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Code da verificaziun da { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } è tes code da recuperaziun { -brand-mozilla }. El scada en 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Code da { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo da { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronisar ils apparats">
body-devices-image = <img data-l10n-name="devices-image" alt="Apparats">
fxa-privacy-url = Directivas per la protecziun da datas da { -brand-mozilla }
moz-accounts-privacy-url-2 = Infurmaziuns davart la protecziun da datas da { -product-mozilla-accounts }
moz-accounts-terms-url = Cundiziuns d'utilisaziun da { -product-mozilla-accounts }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo da { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo da { -brand-mozilla }">
subplat-automated-email = Quai è in e-mail automatic. Sche ti has retschavì per sbagl quest e-mail na stos ti far nagut.
subplat-privacy-notice = Infurmaziuns davart la protecziun da datas
subplat-privacy-plaintext = Infurmaziuns davart la protecziun da datas:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Ti retschaivas quest e-mail perquai che { $email } è associà cun in { -product-mozilla-account } e ti has in abunament da { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Ti retschaivas quest e-mail perquai che { $email } ha in { -product-mozilla-account }.
subplat-explainer-multiple-2 = Ti retschaivas quest e-mail perquai che { $email } è associà cun in { -product-mozilla-account } e ti has abunà plirs products.
subplat-explainer-was-deleted-2 = Ti retschaivas quest e-mail perquai che { $email } è vegnì duvrà per avrir in { -product-mozilla-account }.
subplat-manage-account-2 = Administrescha tes parameters dal { -product-mozilla-account } cun visitar tia <a data-l10n-name="subplat-account-page">pagina dal conto</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Administrescha tes parameters dal { -product-mozilla-account } cun visitar tia pagina dal conto: { $accountSettingsUrl }
subplat-terms-policy = Cundiziuns e reglas per l’annullaziun
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Annullar l’abunament
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivar l’abunament
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualisar las infurmaziuns per la facturaziun
subplat-privacy-policy = Directivas per la protecziun da datas da { -brand-mozilla }
subplat-privacy-policy-2 = Infurmaziuns davart la protecziun da datas da { -product-mozilla-accounts }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Cundiziuns d'utilisaziun dals { -product-mozilla-accounts }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Infurmaziuns giuridicas
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Protecziun da datas
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Sche tes conto è stizzà, vegns ti anc adina a retschaiver e-mails da la Mozilla Corporation e da la Mozilla Foundation, nun che ti <a data-l10n-name="unsubscribeLink">dumondias d’annullar l’abunament</a>.
account-deletion-info-block-support = Sche ti has ina dumonda u dovras agid, pos ti gugent contactar noss <a data-l10n-name="supportLink">team d’agid</a>.
account-deletion-info-block-communications-plaintext = Sche tes conto vegn stizzà, vegns ti anc adina a retschaiver e-mails da la Mozilla Corporation e da la Mozilla Foundation, nun che ti dumondias d’annullar l’abunament:
account-deletion-info-block-support-plaintext = Sche ti has ina dumonda u dovras agid, pos ti gugent contactar noss team d’agid:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Telechargiar { $productName } da { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Telechargiar { $productName } da l'{ -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installar { $productName } sin in <a data-l10n-name="anotherDeviceLink">auter computer</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installar { $productName } sin in <a data-l10n-name="anotherDeviceLink">auter apparat</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Ir per { $productName } sin Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Telechargiar { $productName } dal App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installar { $productName } sin in auter apparat:
automated-email-change-2 = Sche ti n'has betg effectuà questa acziun, <a data-l10n-name="passwordChangeLink">mida subit tes pled-clav</a>.
automated-email-support = Per ulteriuras infurmaziuns, visita <a data-l10n-name="supportLink">l'agid da { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Sche ti n'has betg effectuà questa acziun, mida subit tes pled-clav:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Per ulteriuras infurmaziuns, visita l'agid da { -brand-mozilla }:
automated-email-inactive-account = Quai è in e-mail automatic. Ti al retschaivas perquai che ti has in { -product-mozilla-account } ed igl è gia 2 onns dapi che ti es t’annunzià l’ultima giada.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Per ulteriuras infurmaziuns, visita l'<a data-l10n-name="supportLink">agid da { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Quai è in e-mail automatic. Sche ti al has survegnì per sbagl na stos ti far nagut.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Quai è in e-mail automatic; sche ti n'has betg autorisà questa acziun, mida per plaschair tes pled-clav:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Questa dumonda vegn da { $uaBrowser } sin { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Questa dumonda vegn da { $uaBrowser } sin { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Questa dumonda vegn da { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Questa dumonda vegn da { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Questa dumonda vegn da { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Sche ti n'has betg fatg quai, <a data-l10n-name="revokeAccountRecoveryLink">stizza la nova clav</a> e <a data-l10n-name="passwordChangeLink">mida tes pled-clav</a>.
automatedEmailRecoveryKey-change-pwd-only = Sche ti n'has betg fatg quai, <a data-l10n-name="passwordChangeLink">mida tes pled-clav</a>.
automatedEmailRecoveryKey-more-info = Per ulteriuras infurmaziuns, visita <a data-l10n-name="supportLink">l'agid da { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Questa dumonda vegn da:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Sche ti n'has betg fatg quai, stizza la nova clav:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Sche ti n'has betg fatg quai, mida tes pled-clav:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = e mida tes pled-clav:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Per ulteriuras infurmaziuns, visita l'agid da { -brand-mozilla }:
automated-email-reset =
    Quai è in e-mail automatic. Sche ti n'has betg autorisà questa acziun, <a data-l10n-name="resetLink">reinizialisescha per plaschair tes pled-clav</a>.
    Per ulteriuras infurmaziuns, per plaschair visitar il <a data-l10n-name="supportLink">support da { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Sche ti n’has betg autorisà questa acziun, reinizialisescha per plaschair ussa tes pled-clav sin { $resetLink }
brand-banner-message = Sas ti che nus avain midà noss num da { -product-firefox-accounts } en { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Ulteriuras infurmaziuns</a>
cancellationSurvey = Ans gida per plaschair da meglierar noss servetschs cun participar a questa <a data-l10n-name="cancellationSurveyUrl">curta enquista</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ans gida per plaschair da meglierar noss servetschs cun participar a questa curta enquista:
change-password-plaintext = Sche ti supponas ch’insatgi emprovia dad acceder a tes conto, mida p.pl. tes pled-clav.
manage-account = Administrar il conto
manage-account-plaintext = { manage-account }:
payment-details = Detagls dal pajament:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numer da quint: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Debità: { $invoiceTotal } ils { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Proxim quint: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Summa intermediara: { $invoiceSubtotal }

##

subscriptionSupport = Dumondas davart tes abunament? Noss <a data-l10n-name="subscriptionSupportUrl">team d'agid</a> stat a tia disposiziun.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Dumondas davart tes abunament? Noss team d’agid stat a tia disposiziun:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Grazia per abunar { $productName }. Sche ti has dumondas davart tes abunament u sche ti dovras ulteriuras infurmaziuns davart { $productName }, <a data-l10n-name="subscriptionSupportUrl">ans contactescha</a> per plaschair.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Grazia per abunar { $productName }. Sche ti has dumondas davart tes abunament u sche ti dovras ulteriuras infurmaziuns davart { $productName }, ans contactescha per plaschair:
subscriptionUpdateBillingEnsure = Ti pos controllar <a data-l10n-name="updateBillingUrl">qua</a> che tia metoda da pajament e las infurmaziuns dal conto èn actualas.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Ti pos controllar qua che tia metoda da pajament e las infurmaziuns dal conto èn actualas:
subscriptionUpdateBillingTry = Nus vegnin ad empruvar anc ina giada dad incassar tes pajament durant ils proxims dis, ma ti stos probablamain gidar cun <a data-l10n-name="updateBillingUrl">actualisar tias infurmaziuns da pajament</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Nus vegnin ad empruvar anc ina giada dad incassar tes pajament durant ils proxims dis, ma ti stos probablamain gidar cun actualisar tias infurmaziuns da pajament:
subscriptionUpdatePayment = Per evitar l'interrupziun da tes servetsch, <a data-l10n-name="updateBillingUrl">actualisescha per plaschair tias infurmaziuns da pajament</a> il pli spert pussaivel.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Per evitar l’interrupziun da tes servetsch, actualisescha per plaschair tias infurmaziuns da pajament il pli spert pussaivel:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } sin { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } sin { $uaOS }
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Mussar il quint: { $invoiceLink }
cadReminderFirst-subject-1 = Promemoria! Igl è uras da sincronisar { -brand-firefox }
cadReminderFirst-action = Sincronisar in auter apparat
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = I dovra dus per sincronisar
cadReminderFirst-description-v2 = Prenda cun tai tes tabs sin tut tes apparats. Va per tes segnapaginas, pleds-clav ed autras datas per als avair dapertut là nua che ti dovras { -brand-firefox }.
cadReminderSecond-subject-2 = Na sta betg cun la bucca sitga! Cumplettescha la configuraziun da tia sincronisaziun
cadReminderSecond-action = Sincronisar in auter apparat
cadReminderSecond-title-2 = N'emblida betg da sincronisar!
cadReminderSecond-description-sync = Sincronisescha tes segnapaginas, pleds-clav, tabs averts e dapli – dapertut là nua che ti utiliseschas { -brand-firefox }.
cadReminderSecond-description-plus = En pli èn tias datas adina criptadas. Mo ti ed ils apparats als quals ti permettas l'access las vesan.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bainvegni tar { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bainvegni tar { $productName }
downloadSubscription-content-2 = Entschaiva ad utilisar tut las funcziuns inclusas en tes abunament:
downloadSubscription-link-action-2 = Emprims pass
fraudulentAccountDeletion-subject-2 = Tes conto { -product-mozilla-account } è vegnì stizzà
fraudulentAccountDeletion-title = Tes conto è vegnì stizzà
fraudulentAccountDeletion-content-part1-v2 = Dacurt è vegnì creà cun agid da questa adressa dad e-mail in { -product-mozilla-account } cun in abunament che custa. Nus avain ta dumandà – uschia faschain nus quai cun tut ils contos novs – da confermar il conto cun validar questa adressa dad e-mail.
fraudulentAccountDeletion-content-part2-v2 = Ussa avain nus constatà ch'il conto n'è mai vegnì confermà. Cunquai che quest pass manca, na savain nus betg sch'i sa tracta dad in abunament autorisà. En consequenza è il { -product-mozilla-account } registrà cun questa adressa dad e-mail vegnì stizzà e tes abunament è vegnì annullà e tut las debitaziuns restituidas.
fraudulentAccountDeletion-contact = En cas da dumondas, contactescha per plaschair noss <a data-l10n-name="mozillaSupportUrl">team d'agid</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = En cas da dumondas, contactescha per plaschair noss team d'agid: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Ultima schanza da mantegnair tes { -product-mozilla-account }
inactiveAccountFinalWarning-title = Tes conto { -brand-mozilla } e tias datas vegnan a vegnir stizzadas
inactiveAccountFinalWarning-preview = T’annunzia per mantegnair tes conto
inactiveAccountFinalWarning-account-description = Tes { -product-mozilla-account } vegn utilisà per acceder a products gratuits per la protecziun da datas e la navigaziun sco la sincronisaziun da { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Ils <strong>{ $deletionDate }</strong>, vegnan tes conto e tias datas persunalas a vegnir stizzadas permanentamain, nun che ti t’annunzias.
inactiveAccountFinalWarning-action = T’annunzia en tes conto per al mantegnair
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = T’annunzia en tes conto per al mantegnair:
inactiveAccountFirstWarning-subject = Na perda betg tes conto
inactiveAccountFirstWarning-title = Vuls ti mantegnair tes conto { -brand-mozilla } e tias datas?
inactiveAccountFirstWarning-account-description-v2 = Tes { -product-mozilla-account } serva per acceder a products gratuits per la protecziun da datas e la navigaziun sco la sincronisaziun da { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Nus avain fatg stim che ti n’es betg t’annunzià dapi 2 onns.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tias datas persunalas e tes conto vegnan a vegnir stizzads permanentamain ils <strong>{ $deletionDate }</strong> pervia da tia inactivitad.
inactiveAccountFirstWarning-action = T’annunzia en tes conto per al mantegnair
inactiveAccountFirstWarning-preview = T’annunzia en tes conto per al mantegnair
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = T’annunzia en tes conto per al mantegnair:
inactiveAccountSecondWarning-subject = Dumonda d’agir: eliminaziun dal conto en 7 dis
inactiveAccountSecondWarning-title = Tes conto { -brand-mozilla } e tias datas vegnan a vegnir stizzadas en 7 dis
inactiveAccountSecondWarning-account-description-v2 = Tes { -product-mozilla-account } serva per acceder a products gratuits per la protecziun da datas e la navigaziun sco la sincronisaziun da { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tias datas persunalas e tes conto vegnan a vegnir stizzads definitivamain ils <strong>{ $deletionDate }</strong> pervia da tia inactivitad.
inactiveAccountSecondWarning-action = T’annunzia en tes conto per al mantegnair
inactiveAccountSecondWarning-preview = T’annunzia en tes conto per al mantegnair
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = T’annunzia en tes conto per al mantegnair:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Ti n'has pli nagins codes d'autentificaziun da backup!
codes-reminder-title-one = Ti dovras tes ultim code d'autentificaziun da backup
codes-reminder-title-two = Temp da crear ulteriurs codes d'autentificaziun da backup
codes-reminder-description-part-one = Codes d'autentificaziun da backup ta gidan da restaurar tias datas en cas che ti emblidas tes pled-clav.
codes-reminder-description-part-two = Creescha ussa novs codes per che ti na perdias pli tard betg tias datas.
codes-reminder-description-two-left = Ti has mo pli dus codes.
codes-reminder-description-create-codes = Creescha novs codes d'autentificaziun da backup per puspè pudair acceder a tes conto en cas che ti vegns in bel di exclus da tes conto.
lowRecoveryCodes-action-2 = Crear codes
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nagins codes d'autentificaziun da backup pli
        [one] Mo pli 1 code d'autentificaziun da backup
       *[other] Mo pli { $numberRemaining } codes d'autentificaziun da backup!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nova annunzia a { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nova annunzia en tes { -product-mozilla-account }
newDeviceLogin-title-3 = Tes { -product-mozilla-account } è vegnì duvrà per s'annunziar
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Quai n'es betg ti? <a data-l10n-name="passwordChangeLink">Mida tes pled-clav</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Quai n'es betg ti? Mida tes pled-clav:
newDeviceLogin-action = Administrar il conto
passwordChanged-subject = Actualisà il pled-clav
passwordChanged-title = Midà cun success il pled-clav
passwordChanged-description-2 = Il pled-clav da tes { -product-mozilla-account } è vegnì midà cun success cun agid da suandant apparat:
passwordChangeRequired-subject = Observà ina activitad suspecta
password-forgot-otp-title = Emblidà tes pled-clav?
password-forgot-otp-request = Nus avain retschavì ina dumonda da midar il pled-clav per tes { -product-mozilla-account } da:
password-forgot-otp-code-2 = Sche ti es stà quai, qua è tes code da conferma per cuntinuar:
password-forgot-otp-expiry-notice = Quest code scada en 10 minutas.
passwordReset-subject-2 = Tes pled-clav è vegnì reinizialisà
passwordReset-title-2 = Tes pled-clav è vegnì reinizialisà
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Ti has reinizialisà tes pled-clav da { -product-mozilla-account } sin:
passwordResetAccountRecovery-subject-2 = Tes pled-clav è vegnì reinizialisà
passwordResetAccountRecovery-title-3 = Tes pled-clav è vegnì reinizialisà
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Ti has duvrà tia clav da recuperaziun dal conto per reinizialisar tes pled-clav da { -product-mozilla-account } sin:
passwordResetAccountRecovery-information = Nus avain ta deconnectà sin tut tes apparats sincronisads. Nus avain creà ina nova clav da recuperaziun dal conto per remplazzar quella che ti has utilisà. Ti la pos midar en ils parameters da tes conto.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Nus avain ta deconnectà sin tut tes apparats sincronisads. Nus avain creà ina nova clav da recuperaziun dal conto per remplazzar quella che ti has utilisà. Ti la pos midar en ils parameters da tes conto:
passwordResetAccountRecovery-action-4 = Administrar il conto
passwordResetWithRecoveryKeyPrompt-subject = Tes pled-clav è vegnì reinizialisà
passwordResetWithRecoveryKeyPrompt-title = Tes pled-clav è vegnì reinizialisà
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Ti has reinizialisà tes pled-clav da { -product-mozilla-account } sin:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Crear ina clav da recuperaziun dal conto
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Crear ina clav da recuperaziun dal conto:
passwordResetWithRecoveryKeyPrompt-cta-description = Ti vegns a stuair s’annunziar danovamain sin tut tes apparats sincronisads. Protegia la proxima giada tias datas cun agid dad ina clav da recuperaziun dal conto. Quella ta permetta da recuperar tias datas sche ti emblidas tes pled-clav.
postAddAccountRecovery-subject-3 = Creà ina nova clav da recuperaziun dal conto
postAddAccountRecovery-title2 = Ti has creà ina nova clav da recuperaziun dal conto
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Tegna en salv questa clav en in lieu segir – ti vegns a la duvrar per recuperar tias datas da navigaziun criptadas sche ti emblidas tes pled-clav.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Questa clav po vegnir duvrada mo ina suletta giada. Suenter l'utilisaziun creain nus automaticamain ina nova clav per tai. Ma ti pos era da tut temp crear ina nova clav en ils parameters dal conto.
postAddAccountRecovery-action = Administrar il conto
postAddLinkedAccount-subject-2 = Nov conto associà cun tes { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Tes conto da { $providerName } è vegnì collià cun tes conto da { -product-mozilla-account }
postAddLinkedAccount-action = Administrar il conto
postAddRecoveryPhone-subject = Agiuntà in telefon per la recuperaziun dal conto
postAddRecoveryPhone-preview = Il conto è protegì da l’autentificaziun en dus pass
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Ti has agiuntà { $maskedLastFourPhoneNumber } sco numer da telefon per la recuperaziun da tes conto
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Co quai protegia tes conto
postAddRecoveryPhone-how-protect-plaintext = Co quai protegia tes conto:
postAddRecoveryPhone-enabled-device = Ti l’has activà ord:
postAddRecoveryPhone-action = Administrar il conto
postAddTwoStepAuthentication-title-2 = Ti has activà l'autentificaziun en dus pass
postAddTwoStepAuthentication-action = Administrar il conto
postChangeAccountRecovery-subject = Midà la clav da recuperaziun dal conto
postChangeAccountRecovery-title = Ti has midà tia clav da recuperaziun dal conto
postChangeAccountRecovery-body-part1 = Ti has ussa ina nova clav da recuperaziun dal conto. Tia clav precedenta è vegnida stizzada.
postChangeAccountRecovery-body-part2 = Tegna en salv questa nova clav en in lieu segir – ti vegns a la duvrar per recuperar tias datas da navigaziun criptadas sche ti emblidas tes pled-clav.
postChangeAccountRecovery-action = Administrar il conto
postChangePrimary-subject = Adressa dad e-mail principala actualisada
postChangePrimary-title = Nova adressa dad e-mail principala
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Tia nova adressa principala è ussa { $email }. Questa adressa è ussa tes num d'utilisader per t'annunziar en tes { -product-mozilla-account }. En pli serva ella per retschaiver avis da segirezza e confermas d'annunzia.
postChangePrimary-action = Administrar il conto
postChangeRecoveryPhone-subject = Actualisà il numer da telefon per la recuperaziun dal conto
postChangeRecoveryPhone-preview = Il conto è protegì da l’autentificaziun en dus pass
postChangeRecoveryPhone-title = Ti has midà il numer da telefon per la recuperaziun da tes conto
postChangeRecoveryPhone-description = Ti has ussa in nov numer da telefon per la recuperaziun dal conto. Il numer da telefon precedent è vegnida stizzà.
postChangeRecoveryPhone-requested-device = Tia dumonda deriva da:
postConsumeRecoveryCode-action = Administrar il conto
postNewRecoveryCodes-subject-2 = Creà novs codes d'autentificaziun da backup
postNewRecoveryCodes-title-2 = Ti has creà novs codes d'autentificaziun da backup
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Els èn vegnids creads sin:
postNewRecoveryCodes-action = Administrar il conto
postRemoveAccountRecovery-subject-2 = Stizzà la clav da recuperaziun dal conto
postRemoveAccountRecovery-title-3 = Ti has stizzà tia clav da recuperaziun dal conto
postRemoveAccountRecovery-body-part1 = Tia clav da recuperaziun dal conto è necessari per recuperar tias datas da navigaziun criptadas sche ti emblidas tes pled-clav.
postRemoveAccountRecovery-body-part2 = Sche ti n'has anc betg fatg quai, creescha ina nova clav da recuperaziun dal conto en tes parameters dal conto per evitar che ti perdias tes pleds-clav, segnapaginas, la cronologia da navigaziun e dapli.
postRemoveAccountRecovery-action = Administrar il conto
postRemoveRecoveryPhone-subject = Allontanà il numer da telefon per la recuperaziun dal conto
postRemoveRecoveryPhone-preview = Il conto è protegì da l’autentificaziun en dus pass
postRemoveRecoveryPhone-title = Allontanà il numer da telefon per la recuperaziun dal conto
postRemoveRecoveryPhone-requested-device = Tia dumonda deriva da:
postRemoveSecondary-subject = Allontanà l’adressa dad e-mail alternativa
postRemoveSecondary-title = Allontanà l’adressa dad e-mail alternativa
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Ti has allontanà cun success { $secondaryEmail } sco adressa dad e-mail secundara da tes { -product-mozilla-account }. Avis da segirezza e confermas d'annunzia na vegnan betg pli tramessas a questa adressa.
postRemoveSecondary-action = Administrar il conto
postRemoveTwoStepAuthentication-subject-line-2 = L'autentificaziun en dus pass è deactivada
postRemoveTwoStepAuthentication-title-2 = Ti has deactivà l'autentificaziun en dus pass
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Ti l'has deactivà cun agid da:
postRemoveTwoStepAuthentication-action = Administrar il conto
postRemoveTwoStepAuthentication-not-required-2 = Ti na dovras nagins codes da segirezza pli da tia app d'autentificaziun per t'annunziar.
postSigninRecoveryCode-subject = Utilisà il code d’autentificaziun da backup per l’annunzia
postSigninRecoveryCode-preview = Confermar l’activitad dal conto
postSigninRecoveryCode-title = Tes code d’autentificaziun da backup è vegnì utilisà per s’annunziar
postSigninRecoveryCode-description = Sche ti n’has betg fatg quai, duessas ti midar immediatamain tes pled-clav per mantegnair la segirezza da tes conto.
postSigninRecoveryCode-device = Ti es t’annunzià da:
postSigninRecoveryCode-action = Administrar il conto
postSigninRecoveryPhone-subject = Utilisà il numer da telefon da recuperaziun per s’annunziar
postSigninRecoveryPhone-preview = Confermar l’activitad dal conto
postSigninRecoveryPhone-title = Tes numer da telefon da recuperaziun è vegnì utilisà per s’annunziar
postSigninRecoveryPhone-description = Sche ti n’has betg fatg quai, duessas ti midar immediatamain tes pled-clav per mantegnair la segirezza da tes conto.
postSigninRecoveryPhone-device = Ti es t’annunzià da:
postSigninRecoveryPhone-action = Administrar il conto
postVerify-sub-title-3 = Nus ans allegrain che ti es qua!
postVerify-title-2 = Vuls ti vesair il medem tab sin dus apparats?
postVerify-description-2 = Quai è simpel! Installescha simplamain { -brand-firefox } sin in auter apparat e t'annunzia per sincronisar. Sco sch'i fiss magia!
postVerify-sub-description = (Psst… Quai vul era dir che ti pos ir per tes segnapaginas, pleds-clav ed autras datas da { -brand-firefox } dapertut là nua che ti es annunzià.)
postVerify-subject-4 = Bainvegni tar { -brand-mozilla }!
postVerify-setup-2 = Connectar in auter apparat:
postVerify-action-2 = Connectar in auter apparat
postVerifySecondary-subject = Agiuntà ina adressa dad e-mail alternativa
postVerifySecondary-title = Agiuntà ina adressa dad e-mail alternativa
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Ti has confermà cun success { $secondaryEmail } sco adressa dad e-mail alternativa per tes { -product-mozilla-account }. Avis da segirezza e confermas d'annunzia vegnan ussa tramess ad omaduas adressas.
postVerifySecondary-action = Administrar il conto
recovery-subject = Redefinir tes pled-clav
recovery-title-2 = Emblidà tes pled-clav?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Nus avain retschavì ina dumonda da midar il pled-clav per tes { -product-mozilla-account } da:
recovery-new-password-button = Creescha in nov pled-clav cun cliccar sin il buttun sutvart. Questa colliaziun vegn a scrudar en ina ura.
recovery-copy-paste = Creescha in nov pled-clav cun copiar ed encollar l'URL sutvart en tes navigatur. Questa colliaziun vegn a scrudar en ina ura.
recovery-action = Crear in nov pled-clav
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Tes abunament da { $productName } è vegnì annullà
subscriptionAccountDeletion-title = Donn che ti vas
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Ti has dacurt stizzà tes { -product-mozilla-account }. En consequenza avain nus annullà tes abunament da { $productName }. Tes ultim pajament da { $invoiceTotal } è vegnì pajà ils { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Bainvegni tar { $productName }: Definescha per plaschair tes pled-clav.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Bainvegni tar { $productName }
subscriptionAccountFinishSetup-content-processing = Tes pajament vegn elavurà. Quai po cuzzar enfin quatter dis da lavur. Tes abunament vegn renovà automaticamain suenter mintga perioda da facturaziun sche ti n'al annulleschas betg.
subscriptionAccountFinishSetup-content-create-3 = Sco proxim stos ti crear in pled-clav per il { -product-mozilla-account } per pudair cumenzar ad utilisar tes nov abunament.
subscriptionAccountFinishSetup-action-2 = Cumenzar
subscriptionAccountReminderFirst-subject = Promemoria: Terminescha la configuraziun da tes conto
subscriptionAccountReminderFirst-title = Ti na pos anc betg acceder a tes abunament
subscriptionAccountReminderFirst-content-info-3 = Avant in pèr dis has ti creà in { -product-mozilla-account } ma n'al has mai confermà. Nus sperain che ti termineschias la configuraziun per che ti possias utilisar tes nov abunament.
subscriptionAccountReminderFirst-content-select-2 = Tscherna «Crear in pled-clav» per endrizzar in nov pled-clav e cumplettar la conferma da tes conto.
subscriptionAccountReminderFirst-action = Crear in pled-clav
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Ultima promemoria: Endrizza tes conto
subscriptionAccountReminderSecond-title-2 = Bainvegni tar { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Avant in pèr dis has ti creà in { -product-mozilla-account } ma n'al has mai confermà. Nus sperain che ti termineschias la configuraziun per che ti possias utilisar tes nov abunament.
subscriptionAccountReminderSecond-content-select-2 = Tscherna «Crear in pled-clav» per endrizzar in nov pled-clav e cumplettar la conferma da tes conto.
subscriptionAccountReminderSecond-action = Crear in pled-clav
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Tes abunament da { $productName } è vegnì annullà
subscriptionCancellation-title = Donn che ti vas

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Nus avain annullà tes abunament da { $productName }. Tes ultim pajament da { $invoiceTotal } è exequì pajà ils { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Nus avain annullà tes abunament da { $productName }. Tes ultim pajament da { $invoiceTotal } vegn exequi ils { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tes servetsch vegn a cuntinuar enfin la fin da tia perioda da facturaziun actuala ils { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Ti has midà a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Tia midada da { $productNameOld } a { $productName } è succedida correctamain.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A partir da tes proxim quint mida la summa indebitada da { $paymentAmountOld } per { $productPaymentCycleOld } a { $paymentAmountNew } per { $productPaymentCycleNew }. Il medem mument retschaivas ti ina bunificaziun unica da { $paymentProrated } che reflectescha la debitaziun pli bassa durant il rest da quest { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Sch'igl è necessari dad installar nova software per pudair utilisar { $productName }, retschaivas ti in e-mail separà cun instrucziuns per la telechargiar.
subscriptionDowngrade-content-auto-renew = Tes abunament vegn renovà automaticamain la fin da mintga perioda da facturaziun, nun che ti ta decidas da l’annullar.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Tes abunament da { $productName } è vegnì annullà
subscriptionFailedPaymentsCancellation-title = Tes abunament è vegnì annullà
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Nus avain annullà tes abunament da { $productName } perquai che pliras emprovas da debitaziun n'èn betg reussidas. Per puspè avair access, cumenza in nov abunament cun ina metoda da pajament actualisada.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pajament per { $productName } confermà
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Grazia per abunar { $productName }
subscriptionFirstInvoice-content-processing = Tes pajament vegn actualmain elavurà. Quai po durar enfin quatter lavurdis.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Ti vegns a retschaiver in e-mail separà che declera co utilisar { $productName }.
subscriptionFirstInvoice-content-auto-renew = Tes abunament vegn renovà automaticamain la fin da mintga perioda da facturaziun, nun che ti ta decidas da l’annullar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Pajament per { $productName } betg reussì
subscriptionPaymentFailed-title = Perstgisa, nus avain in problem cun tes pajament
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Nus avain gì in problem cun tes ultim pajament per { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Actualisaziun da las infurmaziuns da pajament necessaria per { $productName }
subscriptionPaymentProviderCancelled-title = Perstgisa, nus avain in problem cun tia metoda da pajament
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Nus essan fruntads sin in problem cun tia metoda da pajament per { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Reactivà l'abunament da { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Grazia per reactivar tes abunament da { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Tes ciclus da facturaziun e pajament vegn a restar medem. La proxima debitaziun munta a { $invoiceTotal } e succeda ils { $nextInvoiceDateOnly }. Tes abunament vegn renovà automaticamain mintga perioda da facturaziun nun che ti decidas dad annullar l'abunament.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Avis da prolungaziun automatica da { $productName }
subscriptionRenewalReminder-title = Tes abunament vegn prest prolungà
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = CharA clientA da { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Tes abunament actual è configurà uschia ch'el vegn prolungà automaticamain en { $reminderLength } dis. Lura vegn { -brand-mozilla } a prolungar tes abunament per { $planIntervalCount } { $planInterval } e la summa da { $invoiceTotal } vegn indebitada cun la metoda da pajament da tes conto.
subscriptionRenewalReminder-content-closing = Amiaivels salids
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = il team da { $productName }
subscriptionsPaymentProviderCancelled-subject = Actualisaziun da las infurmaziuns da pajament necessaria per ils abunaments da { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Perstgisa, nus avain in problem cun tia metoda da pajament
subscriptionsPaymentProviderCancelled-content-detected = Nus essan fruntads sin in problem cun tia metoda da pajament per ils suandants abunaments.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Retschavì il pajament per { $productName }
subscriptionSubsequentInvoice-title = Grazia per tes abunament!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Nus avain retschavì tes ultim pajament per { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Ti has midà a { $productName }
subscriptionUpgrade-title = Grazia per l’upgrade!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Tes abunament vegn renovà automaticamain la fin da mintga perioda da facturaziun, nun che ti ta decidas da l’annullar.
unblockCode-title = Emprovas ti da t’annunziar?
unblockCode-prompt = Sche gea, quai è il code d’autorisaziun che ti dovras:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Sche gea, quai è il code d'autorisaziun che ti dovras: { $unblockCode }
unblockCode-report = Sche na, ans pos ti gidar d'ans defender encunter laders ed <a data-l10n-name="reportSignInLink">ans rapportar quai</a>.
unblockCode-report-plaintext = Sche na ans pos ti gidar d’ans defender encunter laders ed ans rapportar quai.
verificationReminderFinal-subject = Ultima promemoria per confermar tes conto
verificationReminderFinal-description-2 = Avant in pèr emnas has ti creà in { -product-mozilla-account }, ma ti n'al has mai confermà. Per tia segirezza stizzain nus il conto sch'el na vegn betg verifitgà durant las proximas 24 uras.
confirm-account = Confermar il conto
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = N'emblida betg da confermar tes conto
verificationReminderFirst-title-3 = Bainvegni tar { -brand-mozilla }!
verificationReminderFirst-description-3 = Avant in pèr dis has ti creà in { -product-mozilla-account }, ma ti n'al has mai confermà. Conferma per plaschair tes conto entaifer ils proxims 15 dis, uschiglio vegn el stizzà automaticamain.
verificationReminderFirst-sub-description-3 = Na manchenta betg il navigatur che dat la prioritad a ti ed a tia sfera privata.
confirm-email-2 = Confermar il conto
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confermar il conto
verificationReminderSecond-subject-2 = N'emblida betg da confermar tes conto
verificationReminderSecond-title-3 = Na manchenta nagut da { -brand-mozilla }!
verificationReminderSecond-description-4 = Avant in pèr dis has ti creà in { -product-mozilla-account }, ma ti n'al has mai confermà. Conferma per plaschair tes conto entaifer ils proxims 10 dis, uschiglio vegn el stizzà automaticamain.
verificationReminderSecond-second-description-3 = Tes { -product-mozilla-account } ta permetta da sincronisar tias datas da { -brand-firefox } tranter tes apparats e ta dat access ad ulteriurs products per la protecziun da datas da { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Participescha a nossa missiun che vul transfurmar l'internet en in lieu avert per ina e mintgin.
verificationReminderSecond-action-2 = Confermar il conto
verify-title-3 = Avra l'internet cun { -brand-mozilla }
verify-description-2 = Conferma tes conto e profitescha il meglier da { -brand-mozilla } – dapertut là nua che ti t’annunzias. L‘emprim pass:
verify-subject = Finir la creaziun da tes conto
verify-action-2 = Confermar il conto
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Es ti t'annunzia en { $clientName }?
verifyLogin-description-2 = Ans gida da proteger tes conto cun confermar che ti es t'annunzià en:
verifyLogin-subject-2 = Confermar l'annunzia
verifyLogin-action = Confermar l’annunzia
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Es ti t'annunzia en { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ans gida da proteger tes conto cun acceptar tia annunzia en:
verifyLoginCode-prompt-3 = Sche gea, qua è tes code d'autorisaziun:
verifyLoginCode-expiry-notice = El scada en 5 minutas.
verifyPrimary-title-2 = Confermar l'adressa dad e-mail principala
verifyPrimary-description = Il suandant apparat ha dumandà da pudair modifitgar il conto:
verifyPrimary-subject = Confermar l’adressa dad e-mail principala
verifyPrimary-action-2 = Confermar l’adressa d‘e-mail
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Suenter la conferma èsi pussaivel da modifitgar il conto (p.ex. agiuntar ina adressa dad e-mail alternativa) cun agid da quest apparat.
verifySecondaryCode-title-2 = Confermar l'adressa dad e-mail secundara
verifySecondaryCode-action-2 = Confermar l’adressa d‘e-mail
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Ina dumonda per utilisar { $email } sco adressa dad e-mail secundara è vegnida fatga da suandant { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Utilisescha quest code da conferma:
verifySecondaryCode-expiry-notice-2 = El scada en 5 minutas. Uschespert che questa adressa è confermada, retschaiva ella avis e confermas da segirezza.
verifyShortCode-title-3 = Avra l'internet cun { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Conferma tes conto e profitescha al maximum da { -brand-mozilla } – dapertut là nua che ti t’annunzias. L‘emprim pass:
verifyShortCode-prompt-3 = Dovra quest code da conferma:
verifyShortCode-expiry-notice = El scada en 5 minutas.
