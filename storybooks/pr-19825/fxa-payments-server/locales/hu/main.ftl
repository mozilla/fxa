



-brand-mozilla =
    { $case ->
        [accusative] Mozillát
        [instrumental] Mozillával
       *[nominative] Mozilla
    }
-brand-firefox =
    { $case ->
        [accusative] Firefoxot
        [dative] Firefoxnak
        [genitive] Firefoxé
        [instrumental] Firefoxszal
        [causal] Firefoxért
        [translative] Firefoxszá
        [terminative] Firefoxig
        [illative] Firefoxba
        [adessive] Firefoxnál
        [ablative] Firefoxtól
        [elative] Firefoxból
        [sublative] Firefoxra
        [inessive] Firefoxban
        [superessive] Firefoxon
        [delative] Firefoxról
       *[nominative] Firefox
    }
-product-firefox-accounts = Firefox-fiókok
-product-mozilla-account = Mozilla-fiók
-product-mozilla-accounts = Mozilla-fiókok
-product-firefox-account = Firefox-fiók
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store =
    { $case ->
        [accusative] App Store-t
        [inessive] App Store-ban
        [instrumental] App Store-ral
        [elative] App Store-ból
       *[nominative] App Store
    }
-google-play =
    { $case ->
        [accusative] Google Playt
        [inessive] Google Playben
        [instrumental] Google Playjel
        [elative] Google Playből
       *[nominative] Google Play
    }

app-general-err-heading = Általános alkalmazáshiba
app-general-err-message = Hiba történt, próbálja újra később.
app-query-parameter-err-heading = Hibás kérés: érvénytelen lekérdezési paraméterek


app-footer-mozilla-logo-label = { -brand-mozilla } logó
app-footer-privacy-notice = Webhely adatvédelmi nyilatkozata
app-footer-terms-of-service = A szolgáltatás feltételei


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Új ablakban nyílik meg


app-loading-spinner-aria-label-loading = Betöltés…


app-logo-alt-3 =
    .alt = { -brand-mozilla } m logó



settings-home = Fiók kezdőlapja
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Promóciós kód alkalmazva
coupon-submit = Alkalmaz
coupon-remove = Eltávolítás
coupon-error = A megadott kód érvénytelen vagy lejárt.
coupon-error-generic = Hiba történt a kód feldolgozása során. Próbálja újra.
coupon-error-expired = A megadott kód lejárt.
coupon-error-limit-reached = A megadott kód elérte a korlátját.
coupon-error-invalid = A megadott kód érvénytelen.
coupon-enter-code =
    .placeholder = Adja meg a kódot


default-input-error = Ez a mező kötelező
input-error-is-required = { $label } szükséges


brand-name-mozilla-logo = { -brand-mozilla } logó


new-user-sign-in-link-2 = Már van { -product-mozilla-account }ja? <a>Jelentkezzen be</a>
new-user-enter-email =
    .label = Adja meg az e-mail-címét
new-user-confirm-email =
    .label = Erősítse meg az e-mail-címét
new-user-subscribe-product-updates-mozilla = Szeretnék termékhíreket és újdonságokat kapni a { -brand-mozilla(ending: "accented") }tól
new-user-subscribe-product-updates-snp = Szeretnék biztonsági és adatvédelmi híreket kapni a { -brand-mozilla(ending: "accented") }tól
new-user-subscribe-product-updates-hubs = Szeretnék termékhíreket és frissítéseket kapni a { -product-mozilla-hubs }-tól és a { -brand-mozilla(ending: "accented") }tól
new-user-subscribe-product-updates-mdnplus = Szeretnék termékhíreket és frissítéseket kapni az { -product-mdn-plus }-tól és a { -brand-mozilla(ending: "accented") }tól
new-user-subscribe-product-assurance = Csak a fiókja létrehozásához használjuk az e-mail-címét. Sosem adjuk el harmadik félnek.
new-user-email-validate = Az e-mail-cím érvénytelen
new-user-email-validate-confirm = Az e-mail-címek nem egyeznek
new-user-already-has-account-sign-in = Már van felhasználói fiókja. <a>Jelentkezzen be</a>
new-user-invalid-email-domain = Elírta az e-mail-címet? A(z) { $domain } nem nyújt e-mail szolgáltatást.


payment-confirmation-thanks-heading = Köszönjük!
payment-confirmation-thanks-heading-account-exists = Köszönjük, most pedig nézze meg az e-mailjeit!
payment-confirmation-thanks-subheading = Egy megerősítő e-mailt küldtünk a(z) { $email } címre, amely részletesen ismerteti a { $product_name } használatának elkezdését.
payment-confirmation-thanks-subheading-account-exists = Egy levelet fog kapni a(z) { $email } címre a fiókbeállítási utasításokkal és a fizetés részleteiről.
payment-confirmation-order-heading = Megrendelés részletei
payment-confirmation-invoice-number = Számla #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Fizetési információk
payment-confirmation-amount = { $amount } / { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } naponta
       *[other] { $amount } { $intervalCount } naponta
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } hetente
       *[other] { $amount } { $intervalCount } hetente
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } havonta
       *[other] { $amount } { $intervalCount } havonta
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } évente
       *[other] { $amount } { $intervalCount } évente
    }
payment-confirmation-download-button = Tovább a letöltéshez


payment-confirm-with-legal-links-static-3 = Felhatalmazom a { -brand-mozilla(ending: "accented") }t, hogy terhelje meg a megjelenített összeget az én fizetési módommal az <termsOfServiceLink>Szolgáltatási feltételek</termsOfServiceLink> és az <privacyNoticeLink>Adatvédelmi nyilatkozat</privacyNoticeLink> szerint, amíg le nem mondom az előfizetést.
payment-confirm-checkbox-error = Ezt be kell fejeznie, mielőtt továbblép


payment-error-retry-button = Próbálja újra
payment-error-manage-subscription-button = Saját feliratkozások kezelése


iap-upgrade-already-subscribed-2 = Már van { $productName } előfizetése a { -brand-google } vagy az { -brand-apple } alkalmazásboltján keresztül.
iap-upgrade-no-bundle-support = Jelenleg nem támogatjuk a frissítést ezekről az előfizetésekről, de hamarosan fogjuk.
iap-upgrade-contact-support = Továbbra is beszerezheti ezt a terméket – lépjen kapcsolatba a támogatással, hogy segíthessünk.
iap-upgrade-get-help-button = Segítség kérése


payment-name =
    .placeholder = Teljes név
    .label = A kártyán szereplő név
payment-cc =
    .label = Az Ön kártyája
payment-cancel-btn = Mégse
payment-update-btn = Frissítés
payment-pay-btn = Fizetés most
payment-pay-with-paypal-btn-2 = Fizetés { -brand-paypal }lal
payment-validate-name-error = Adja meg a nevét


payment-legal-copy-stripe-and-paypal-3 = A { -brand-mozilla } a { -brand-name-stripe }-ot és a { -brand-paypal }t használja a biztonságos fizetésfeldolgozáshoz.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>A { -brand-name-stripe } adatvédelmi irányelvei</stripePrivacyLink> &nbsp; <paypalPrivacyLink>A { -brand-paypal } atomvédelmi irányelvei</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = A { -brand-mozilla } a { -brand-paypal }t használja a biztonságos fizetésfeldolgozáshoz.
payment-legal-link-paypal-3 = <paypalPrivacyLink>A { -brand-paypal } adatvédelmi irányelvei</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = A { -brand-mozilla } a { -brand-name-stripe }-ot használja a biztonságos fizetésfeldolgozáshoz.
payment-legal-link-stripe-3 = <stripePrivacyLink>A { -brand-name-stripe } adatvédelmi irányelvei</stripePrivacyLink>.


payment-method-header = Válassza ki a fizetési módot
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Először jóvá kell hagynia az előfizetését


payment-processing-message = Várjon, amíg feldolgozzuk a fizetését…


payment-confirmation-cc-card-ending-in = { $last4 } végződésű kártya


pay-with-heading-paypal-2 = Fizetés { -brand-paypal }lal


plan-details-header = Termék részletei
plan-details-list-price = Listaár
plan-details-show-button = Részletek megjelenítése
plan-details-hide-button = Részletek elrejtése
plan-details-total-label = Összesen
plan-details-tax = Adók és díjak


product-no-such-plan = Nincs ilyen előfizetés ehhez a termékhez.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } adó
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } naponta
       *[other] { $priceAmount } minden { $intervalCount }. napon
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } naponta
           *[other] { $priceAmount } minden { $intervalCount }. napon
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } hetente
       *[other] { $priceAmount } minden { $intervalCount }. héten
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } hetente
           *[other] { $priceAmount } minden { $intervalCount }. héten
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } havonta
       *[other] { $priceAmount } minden { $intervalCount }. hónapban
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } havonta
           *[other] { $priceAmount } minden { $intervalCount }. hónapban
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } évente
       *[other] { $priceAmount } minden { $intervalCount }. évben
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } évente
           *[other] { $priceAmount } minden { $intervalCount }. évben
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } adó naponta
       *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. napon
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } adó naponta
           *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. napon
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } adó hetente
       *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. hetente
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } adó hetente
           *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. hetente
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } adó havonta
       *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. hónapban
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } adó havonta
           *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. hónapban
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } adó évente
       *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. évben
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } adó évente
           *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. évben
        }


subscription-create-title = Állítsa be a feliratkozását
subscription-success-title = Feliratkozás megerősítése
subscription-processing-title = Feliratkozás megerősítése…
subscription-error-title = Hiba a feliratkozás megerősítésekor…
subscription-noplanchange-title = Az előfizetési csomag ezen módosítása nem támogatott
subscription-iapsubscribed-title = Már előfizető
sub-guarantee = 30 napos pénzvisszafizetési garancia


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts }
terms = A szolgáltatás feltételei
privacy = Adatvédelmi nyilatkozat
terms-download = Letöltési feltételek


document =
    .title = Firefox-fiókok
close-aria =
    .aria-label = Felugró ablak bezárása
settings-subscriptions-title = Előfizetések
coupon-promo-code = Promóciós kód


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } naponta
       *[other] { $amount } minden { $intervalCount }. napon
    }
    .title =
        { $intervalCount ->
            [one] { $amount } naponta
           *[other] { $amount } minden { $intervalCount }. napon
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } hetente
       *[other] { $amount } minden { $intervalCount }. héten
    }
    .title =
        { $intervalCount ->
            [one] { $amount } hetente
           *[other] { $amount } minden { $intervalCount }. héten
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } havonta
       *[other] { $amount } minden { $intervalCount }. hónapban
    }
    .title =
        { $intervalCount ->
            [one] { $amount } havonta
           *[other] { $amount } minden { $intervalCount }. hónapban
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } évente
       *[other] { $amount } minden { $intervalCount }. évben
    }
    .title =
        { $intervalCount ->
            [one] { $amount } évente
           *[other] { $amount } minden { $intervalCount }. évben
        }


general-error-heading = Általános alkalmazáshiba
basic-error-message = Hiba történt, próbálja újra később.
payment-error-1 = Hmm. Hiba történt a fizetés jóváhagyásakor. Próbálkozzon újra, vagy vegye fel a kapcsolatot a kártyakibocsátóval.
payment-error-2 = Hmm. Hiba történt a fizetés jóváhagyásakor. Vegye fel a kapcsolatot a kártyakibocsátóval.
payment-error-3b = Váratlan hiba történt a fizetése feldolgozása során, próbálja újra.
expired-card-error = Úgy tűnik, hogy a bankkártya lejárt. Próbálkozzon egy másik kártyával.
insufficient-funds-error = Úgy tűnik, hogy a bankkártyáján kevés a fedezet. Próbálkozzon egy másik kártyával.
withdrawal-count-limit-exceeded-error = Úgy tűnik, hogy ez a tranzakció túllép a hitelkeretén. Próbálkozzon egy másik kártyával.
charge-exceeds-source-limit = Úgy tűnik, hogy ez a tranzakció túllép a napi hitelkeretén. Próbálkozzon egy másik kártyával vagy 24 óra múlva.
instant-payouts-unsupported = Úgy tűnik, hogy a bankkártyája nincs beállítva azonnali fizetésekhez. Próbálkozzon egy másik kártyával.
duplicate-transaction = Hmm. Úgy tűnik, hogy egy azonos tranzakció lett elküldve. Ellenőrizze a fizetési előzményeket.
coupon-expired = Úgy tűnik, hogy a promóciós kód lejárt.
card-error = A tranzakció nem dolgozható fel. Ellenőrizze a bankkártyaadatait, és próbálja újra.
country-currency-mismatch = Az előfizetés pénzneme nem érvényes a fizetéséhez társított országban.
currency-currency-mismatch = Sajnáljuk. Nem válthat a pénznemek között.
location-unsupported = A jelenlegi tartózkodási helye a Szolgáltatási feltételeink szerint nem támogatott.
no-subscription-change = Sajnáljuk. Nem módosíthatja az előfizetési csomagot.
iap-already-subscribed = Már előfizetett a(z) { $mobileAppStore } oldalon.
fxa-account-signup-error-2 = Rendszerhiba miatt a(z) { $productName } regisztrációja sikertelen volt. A fizetési módja nem lett megterhelve. Próbálja újra.
fxa-post-passwordless-sub-error = Az előfizetés megerősítve, de a megerősítő oldal betöltése nem sikerült. Ellenőrizze az e-mail-címét a fiók beállításához.
newsletter-signup-error = Nem regisztrált a termékhíreket tartalmazó e-mailekre. Megpróbálhatja újra a fiókbeállításokban.
product-plan-error =
    .title = Probléma az előfizetések betöltésekor
product-profile-error =
    .title = Probléma a profil betöltésekor
product-customer-error =
    .title = Probléma az ügyfél betöltésekor
product-plan-not-found = Az előfizetés nem található
product-location-unsupported-error = A hely nem támogatott


coupon-success = A csomag automatikusan megújul a listaáron.
coupon-success-repeating = A csomag { $couponDurationDate } után automatikusan megújul listaáron.


new-user-step-1-2 = 1. Hozzon létre egy { -product-mozilla-account }ot
new-user-card-title = Adja meg a kártyaadatait
new-user-submit = Előfizetés most


sub-update-payment-title = Fizetési információk


pay-with-heading-card-only = Fizessen kártyával
product-invoice-preview-error-title = Probléma a számla előnézetének betöltésekor
product-invoice-preview-error-text = Nem sikerült betölteni a számla előnézetét


subscription-iaperrorupgrade-title = Jelenleg nem tudjuk frissíteni


brand-name-google-play-2 = { -google-play } Áruház
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Módosítás áttekintése
sub-change-failed = Az előfizetés módosítása sikertelen
sub-update-acknowledgment =
    A csomagja azonnal megváltozik, és a mai napon arányos összeget
    fog fizetni a számlázási időszak hátralévő részéből. A következő dátumtól
    kezdve a teljes összeg levonásra kerül: { $startingDate }.
sub-change-submit = Módosítás megerősítése
sub-update-current-plan-label = Jelenlegi előfizetés
sub-update-new-plan-label = Új előfizetés
sub-update-total-label = Új összeg
sub-update-prorated-upgrade = Időarányos csomagfrissítés


sub-update-new-plan-daily = { $productName } (napi)
sub-update-new-plan-weekly = { $productName } (heti)
sub-update-new-plan-monthly = { $productName } (havi)
sub-update-new-plan-yearly = { $productName } (évi)
sub-update-prorated-upgrade-credit = A megjelenített negatív egyenleg jóváírásként jelenik meg, és a jövőbeni számlákra lesz használva.


sub-item-cancel-sub = Előfizetés lemondása
sub-item-stay-sub = Előfizetés megtartása


sub-item-cancel-msg =
    A számlázási periódusa utolsó napja ({ $period }) után
    nem fogja tudni használni a(z) { $name } szolgáltatást.
sub-item-cancel-confirm =
    A(z) { $name } szolgáltatás hozzáférésének lemondása,
    és az abban mentett adatok törlése ekkor: { $period }
sub-promo-coupon-applied = { $promotion_name } kupon felhasználva: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Ez az előfizetés jóváírást eredményezett a számlaegyenlegén: <priceDetails></priceDetails>


sub-route-idx-reactivating = Az előfizetés újraaktiválása sikertelen
sub-route-idx-cancel-failed = Az előfizetés lemondása sikertelen
sub-route-idx-contact = Kapcsolatfelvétel az ügyfélszolgálattal
sub-route-idx-cancel-msg-title = Sajnáljuk, hogy távozik
sub-route-idx-cancel-msg =
    A(z) { $name }-előfizetése lemondva.
          <br />
          { $date }-ig továbbra is el fogja érni a(z) { $name } szolgáltatást.
sub-route-idx-cancel-aside-2 = Kérdése van? Keresse fel a <a>{ -brand-mozilla } Támogatást</a>.


sub-customer-error =
    .title = Probléma az ügyfél betöltésekor
sub-invoice-error =
    .title = Probléma a számlák betöltésekor
sub-billing-update-success = A számlázási adatai sikeresen frissítettve
sub-invoice-previews-error-title = Probléma a számlák előnézetének betöltésekor
sub-invoice-previews-error-text = Nem sikerült betölteni a számlák előnézetét


pay-update-change-btn = Módosítás
pay-update-manage-btn = Kezelés


sub-next-bill = Következő számlázás: { $date }
sub-next-bill-due-date = A következő számla esedékessége: { $date }
sub-expires-on = Lejár: { $date }




pay-update-card-exp = Lejárat: { $expirationDate }
sub-route-idx-updating = Számlázási információk frissítése…
sub-route-payment-modal-heading = Érvénytelen számlázási információk
sub-route-payment-modal-message-2 = Úgy tűnik, hogy hiba történt a(z) { -brand-paypal }-fiókjával kapcsolatban, meg kell tennie a szükséges lépéseket a fizetési probléma megoldásához.
sub-route-missing-billing-agreement-payment-alert = Érvénytelen fizetési információk; hiba van a fiókjában. <div>Kezelés</div>
sub-route-funding-source-payment-alert = Érvénytelen fizetési információk; hiba van a fiókjában. Az értesítés törlése eltarthat egy ideig az adatok sikeres frissítése után. <div>Kezelés</div>


sub-item-no-such-plan = Nincs ilyen csomag ennél az előfizetésnél.
invoice-not-found = Későbbi számla nem található
sub-item-no-such-subsequent-invoice = Későbbi számlák nem találhatók ehhez az előfizetéshez.
sub-invoice-preview-error-title = A számla előnézete nem található
sub-invoice-preview-error-text = A számla előnézete nem található ehhez az előfizetéshez


reactivate-confirm-dialog-header = Továbbra is szeretné ezt használni: { $name }?
reactivate-confirm-copy =
    A(z) { $name } hozzáférése folytatódni fog, a számlázási és
    fizetési időszaka is változatlan marad. A(z) { $last } végű kártya
    következő terhelése { $amount } lesz, ekkor: { $endDate }.
reactivate-confirm-without-payment-method-copy =
    A(z) { $name } hozzáférése folytatódni fog, a számlázási és
    fizetési időszaka is változatlan marad. A következő
    terhelése { $amount } lesz, ekkor: { $endDate }.
reactivate-confirm-button = Előfizetés újra


reactivate-panel-copy = El fogja veszíteni a hozzáférését a(z) { $name } termékhez, ekkor: <strong>{ $date }</strong>.
reactivate-success-copy = Köszönjük! Minden készen állsz.
reactivate-success-button = Bezárás


sub-iap-item-google-purchase-2 = { -brand-google }: Alkalmazáson belüli vásárlás
sub-iap-item-apple-purchase-2 = { -brand-apple }: Alkalmazáson belüli vásárlás
sub-iap-item-manage-button = Kezelés
