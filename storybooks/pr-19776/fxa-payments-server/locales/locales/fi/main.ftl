



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox-tilit
-product-mozilla-account = Mozilla-tili
-product-mozilla-accounts = Mozilla-tilit
-product-firefox-account = Firefox-tili
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
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Yleinen sovellusvirhe
app-general-err-message = Jokin meni pieleen. Yritä uudelleen myöhemmin.
app-query-parameter-err-heading = Virheellinen pyyntö: Virheelliset kyselyparametrit


app-footer-mozilla-logo-label = { -brand-mozilla }n logo
app-footer-privacy-notice = Sivuston tietosuojakäytäntö
app-footer-terms-of-service = Käyttöehdot


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Avautuu uuteen ikkunaan


app-loading-spinner-aria-label-loading = Ladataan…


app-logo-alt-3 =
    .alt = { -brand-mozilla }n m-logo



settings-home = Tilin koti
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Tarjouskoodi sovellettu
coupon-submit = Käytä
coupon-remove = Poista
coupon-error = Antamasi koodi on virheellinen tai vanhentunut.
coupon-error-generic = Koodia käsiteltäessä tapahtui virhe. Yritä uudelleen.
coupon-error-expired = Antamasi koodi on vanhentunut.
coupon-error-limit-reached = Antamasi koodi on käytetty liian monta kertaa.
coupon-error-invalid = Antamasi koodi on virheellinen.
coupon-enter-code =
    .placeholder = Kirjoita koodi


default-input-error = Tämä kenttä on pakollinen
input-error-is-required = { $label } vaaditaan


brand-name-mozilla-logo = { -brand-mozilla }n logo


new-user-sign-in-link-2 = Onko sinulla jo { -product-mozilla-account }? <a>Kirjaudu sisään</a>
new-user-enter-email =
    .label = Kirjoita sähköpostiosoitteesi
new-user-confirm-email =
    .label = Vahvista sähköposti
new-user-subscribe-product-updates-mozilla = Haluan saada tuoteuutisia ja päivityksiä { -brand-mozilla }lta
new-user-subscribe-product-updates-snp = Haluan saada turvallisuus- ja tietosuojauutisia sekä päivityksiä { -brand-mozilla }lta
new-user-subscribe-product-updates-hubs = Haluan saada tuoteuutisia ja päivityksiä { -product-mozilla-hubs }ilta ja { -brand-mozilla }lta
new-user-subscribe-product-updates-mdnplus = Haluan saada tuoteuutisia ja päivityksiä { -product-mdn-plus } -palvelusta ja { -brand-mozilla }lta
new-user-subscribe-product-assurance = Käytämme sähköpostiosoitettasi vain tilin luomiseen. Emme koskaan myy sitä kolmannelle osapuolelle.
new-user-email-validate = Sähköpostiosoite ei ole kelvollinen
new-user-email-validate-confirm = Sähköpostiosoitteet eivät täsmää
new-user-already-has-account-sign-in = Sinulla on jo tili. <a>Kirjaudu sisään</a>
new-user-invalid-email-domain = Kirjoititko sähköpostiosoitteen väärin? Verkkotunnus { $domain } ei tarjoa sähköpostipalveluja.


payment-confirmation-thanks-heading = Kiitos!
payment-confirmation-thanks-heading-account-exists = Kiitos, tarkista nyt sähköpostisi!
payment-confirmation-thanks-subheading = Vahvistusviesti on lähetetty osoitteeseen { $email }. Viesti sisältää tiedot, miten saat tuotteen { $product_name } käyttöösi.
payment-confirmation-thanks-subheading-account-exists = Saat sähköpostin osoitteeseen { $email }. Viesti sisältää ohjeet tilin luomiseen ja maksutiedot.
payment-confirmation-order-heading = Tilauksen tiedot
payment-confirmation-invoice-number = Lasku #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Maksun tiedot
payment-confirmation-amount = { $amount } per { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } päivittäin
       *[other] { $amount } joka { $intervalCount }. päivä
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } viikoittain
       *[other] { $amount } joka { $intervalCount }. viikko
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } kuukausittain
       *[other] { $amount } joka { $intervalCount }. kuukausi
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } vuosittain
       *[other] { $amount } joka { $intervalCount }. vuosi
    }
payment-confirmation-download-button = Jatka lataamiseen


payment-confirm-with-legal-links-static-3 = Valtuutan { -brand-mozilla }n veloittaa maksutapaani näytetyn summan verran, <termsOfServiceLink>käyttöehtojen</termsOfServiceLink> ja <privacyNoticeLink>tietosuojakäytännön</privacyNoticeLink> mukaisesti, kunnes peruutan tilaukseni.
payment-confirm-checkbox-error = Sinun on suoritettava tämä vaihe, ennen kuin jatkat eteenpäin


payment-error-retry-button = Yritä uudestaan
payment-error-manage-subscription-button = Hallitse tilausta


iap-upgrade-already-subscribed-2 = Sinulla on jo { $productName }-tilaus { -brand-google }n tai { -brand-apple }n sovelluskaupan kautta.
iap-upgrade-no-bundle-support = Emme tue päivityksiä näille tilauksille tällä hetkellä, mutta tuemme pian.
iap-upgrade-contact-support = Voit edelleen hankkia tämän tuotteen — ota yhteyttä tukeen, jotta voimme auttaa sinua.
iap-upgrade-get-help-button = Tuki


payment-name =
    .placeholder = Koko nimi
    .label = Nimi kuten se lukee kortissasi
payment-cc =
    .label = Korttisi
payment-cancel-btn = Peruuta
payment-update-btn = Päivitä
payment-pay-btn = Maksa nyt
payment-pay-with-paypal-btn-2 = Maksa { -brand-paypal }illa
payment-validate-name-error = Kirjoita nimesi


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } käyttää { -brand-name-stripe }a ja { -brand-paypal }ia maksujen turvalliseen käsittelyyn.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe }n tietosuojakäytäntö</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal }in tietosuojakäytäntö</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } käyttää { -brand-paypal }ia turvalliseen maksunvälitykseen.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal }in tietosuojakäytäntö</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } käyttää { -brand-name-stripe }a maksujen turvalliseen käsittelyyn.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe }n tietosuojakäytäntö</stripePrivacyLink>.


payment-method-header = Valitse maksutapa
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Sinun on ensin hyväksyttävä tilauksesi


payment-processing-message = Odota kun käsittelemme maksuasi…


payment-confirmation-cc-card-ending-in = Kortti päättyen { $last4 }


pay-with-heading-paypal-2 = Maksa { -brand-paypal }illa


plan-details-header = Tuotteen tiedot
plan-details-list-price = Listahinta
plan-details-show-button = Näytä tiedot
plan-details-hide-button = Piilota tiedot
plan-details-total-label = Yhteensä
plan-details-tax = Verot ja maksut


product-no-such-plan = Tälle tuotteelle ei ole olemassa kyseistä tilaustyyppiä.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } vero
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } päivittäin
       *[other] { $priceAmount } { $intervalCount } päivän välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } päivittäin
           *[other] { $priceAmount } { $intervalCount } päivän välein
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } viikottain
       *[other] { $priceAmount } { $intervalCount } viikon välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } viikottain
           *[other] { $priceAmount } { $intervalCount } viikon välein
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } kuukausittain
       *[other] { $priceAmount } { $intervalCount } kuukauden välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kuukausittain
           *[other] { $priceAmount } { $intervalCount } kuukauden välein
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } vuosittain
       *[other] { $priceAmount } { $intervalCount } vuoden välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } vuosittain
           *[other] { $priceAmount } { $intervalCount } vuoden välein
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + vero { $taxAmount } päivittäin
       *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } päivän välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + vero { $taxAmount } päivittäin
           *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } päivän välein
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + vero { $taxAmount } viikottain
       *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } viikon välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + vero { $taxAmount } viikottain
           *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } viikon välein
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + vero { $taxAmount } kuukausittain
       *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } kuukauden välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + vero { $taxAmount } kuukausittain
           *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } kuukauden välein
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + vero { $taxAmount } vuosittain
       *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } vuoden välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + vero { $taxAmount } vuosittain
           *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } vuoden välein
        }


subscription-create-title = Määritä tilaus
subscription-success-title = Tilauksen vahvistus
subscription-processing-title = Vahvistetaan tilausta…
subscription-error-title = Virhe tilausta vahvistaessa…
subscription-noplanchange-title = Tämä tilaustyypin vaihtaminen ei ole tuettu
subscription-iapsubscribed-title = Tilattu jo aiemmin
sub-guarantee = 30 päivän rahat takaisin -takuu


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Käyttöehdot
privacy = Tietosuojakäytäntö
terms-download = Latausehdot


document =
    .title = Firefox-tilit
close-aria =
    .aria-label = Sulje valintaikkuna
settings-subscriptions-title = Tilaukset
coupon-promo-code = Tarjouskoodi


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } päivittäin
       *[other] { $amount } { $intervalCount } päivän välein
    }
    .title =
        { $intervalCount ->
            [one] { $amount } päivittäin
           *[other] { $amount } { $intervalCount } päivän välein
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } viikottain
       *[other] { $amount } { $intervalCount } viikon välein
    }
    .title =
        { $intervalCount ->
            [one] { $amount } viikottain
           *[other] { $amount } { $intervalCount } viikon välein
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } kuukausittain
       *[other] { $amount } { $intervalCount } kuukauden välein
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kuukausittain
           *[other] { $amount } { $intervalCount } kuukauden välein
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } vuosittain
       *[other] { $amount } { $intervalCount } vuoden välein
    }
    .title =
        { $intervalCount ->
            [one] { $amount } vuosittain
           *[other] { $amount } { $intervalCount } vuoden välein
        }


general-error-heading = Yleinen sovellusvirhe
basic-error-message = Jokin meni pieleen. Yritä uudelleen myöhemmin.
payment-error-1 = Hmm. Maksun valtuuttamisessa ilmeni ongelma. Yritä uudestaan tai ole yhteydessä kortin myöntäjään.
payment-error-2 = Hmm. Maksun valtuuttamisessa ilmeni ongelma. Ole yhteydessä kortin myöntäjään.
payment-error-3b = Maksua käsitellessä tapahtui odottamaton virhe. Yritä uudestaan.
expired-card-error = Luottokorttisi vaikuttaa vanhentuneen. Kokeile toista korttia.
insufficient-funds-error = Vaikuttaa siltä, että kortilla ei ole riittävästi varoja. Kokeile toista korttia.
withdrawal-count-limit-exceeded-error = Vaikuttaa siltä, että tämä tapahtuma ylittää luottorajasi. Kokeile toista korttia.
charge-exceeds-source-limit = Vaikuttaa siltä, että tämä tapahtuma ylittää päivittäisen luottorajasi. Kokeile toista korttia tai yritä uudestaan päivän kuluttua.
instant-payouts-unsupported = Vaikuttaa siltä, että debit-kortissasi ei ole otettu käyttöön välittömiä maksuja. Kokeile toista debit- tai credit-korttia.
duplicate-transaction = Hmm. Vaikuttaa siltä, että sama tapahtuma lähetettiin juuri. Tarkista maksuhistoriasi.
coupon-expired = Vaikuttaa siltä, että tarjouskoodi on vanhentunut.
card-error = Tapahtuman käsittely epäonnistui. Tarkista kortin tiedot ja yritä uudestaan.
country-currency-mismatch = Tämän tilauksen valuutta ei ole voimassa maksun tapahtumamaassa.
currency-currency-mismatch = Pahoittelut, et voi vaihtaa valuuttojen välillä.
location-unsupported = Nykyistä sijaintiasi ei tueta käyttöehtojemme mukaisesti.
no-subscription-change = Valitettavasti et voi muuttaa tilaustyyppiäsi.
iap-already-subscribed = Olet jo tilannut sovelluskaupan { $mobileAppStore } kautta.
fxa-account-signup-error-2 = Järjestelmävirhe aiheutti { $productName } -rekisteröitymisen epäonnistumisen. Maksutapaasi ei ole veloitettu. Yritä uudelleen.
fxa-post-passwordless-sub-error = Tilaus on vahvistettu, mutta vahvistussivun lataaminen epäonnistui. Tarkista sähköpostistasi ohjeet, kuinka määrität tilin valmiiksi.
newsletter-signup-error = Et ole tilannut tuotepäivityksiin liittyviä sähköposteja. Voit yrittää uudelleen tilisi asetuksista.
product-plan-error =
    .title = Ongelma ladatessa tilaustyyppejä
product-profile-error =
    .title = Ongelma ladatessa profiilia
product-customer-error =
    .title = Ongelma ladatessa asiakasta
product-plan-not-found = Tilaustyyppiä ei löytynyt
product-location-unsupported-error = Sijainti ei ole tuettu


coupon-success = Tilauksesi uusitaan automaattisesti listahintaan.
coupon-success-repeating = Tilauksesi uusiutuu automaattisesti { $couponDurationDate } listahinnan mukaisesti.


new-user-step-1-2 = 1. Luo { -product-mozilla-account }
new-user-card-title = Anna korttisi tiedot
new-user-submit = Tilaa nyt


sub-update-payment-title = Maksun tiedot


pay-with-heading-card-only = Maksa kortilla
product-invoice-preview-error-title = Ongelma ladattaessa laskun esikatselua
product-invoice-preview-error-text = Laskun esikatselua ei voitu ladata


subscription-iaperrorupgrade-title = Emme voi päivittää sinua vielä


brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Tarkista muutos
sub-change-failed = Tilaustyypin vaihtaminen epäonnistui
sub-change-submit = Vahvista muutos
sub-update-current-plan-label = Nykyinen tilaustyyppi
sub-update-new-plan-label = Uusi tilaustyyppi
sub-update-total-label = Uusi summa


sub-update-new-plan-daily = { $productName } (päivittäin)
sub-update-new-plan-weekly = { $productName } (viikoittain)
sub-update-new-plan-monthly = { $productName } (kuukausittain)
sub-update-new-plan-yearly = { $productName } (vuosittain)


sub-item-cancel-sub = Peruuta tilaus
sub-item-stay-sub = Jatka tilausta


sub-item-cancel-msg =
    Käyttöoikeutesi tuotteeseen { $name } päättyy
    { $period }, joka on laskutusjakson viimeinen päivä.
sub-item-cancel-confirm =
    Peru käyttömahdollisuuteni ja pääsy tietoihini
    palvelussa { $name } { $period }
sub-promo-coupon-applied = { $promotion_name } -kuponki käytetty: <priceDetails></priceDetails>


sub-route-idx-reactivating = Tilauksen aktivointi uudelleen epäonnistui
sub-route-idx-cancel-failed = Tilauksen peruuttaminen epäonnistui
sub-route-idx-contact = Ota yhteys tukeen
sub-route-idx-cancel-msg-title = Harmi että poistut
sub-route-idx-cancel-msg =
    { $name }-tilauksesi on peruutettu.
          <br />
          Voit edelleen käyttää { $name }-tuotetta { $date } asti.
sub-route-idx-cancel-aside-2 = Kysymyksiä? Käy <a>{ -brand-mozilla }-tuessa</a>.


sub-customer-error =
    .title = Ongelma ladatessa asiakasta
sub-invoice-error =
    .title = Ongelma laskuja ladatessa
sub-billing-update-success = Laskutustietosi on päivitetty onnistuneesti
sub-invoice-previews-error-title = Ongelma ladattaessa laskun esikatseluita
sub-invoice-previews-error-text = Laskun esikatseluita ei voitu ladata


pay-update-change-btn = Muuta
pay-update-manage-btn = Hallitse


sub-next-bill = Seuraava laskutus { $date }
sub-next-bill-due-date = Seuraava maksu veloitetaan { $date }
sub-expires-on = Vanhenee { $date }




pay-update-card-exp = Vanhenee { $expirationDate }
sub-route-idx-updating = Päivitetään laskutustietoja…
sub-route-payment-modal-heading = Virheelliset laskutustiedot
sub-route-payment-modal-message-2 = { -brand-paypal }-tililläsi vaikuttaa olevan virhe. Sinun on tehtävä tarvittavat toimet tämän maksuongelman ratkaisemiseksi.
sub-route-missing-billing-agreement-payment-alert = Virheelliset maksutiedot. Tiliisi kohdistuu virhe. <div>Hallitse</div>
sub-route-funding-source-payment-alert = Virheelliset maksutiedot; tililläsi on virhe. Tämän hälytyksen poistaminen voi kestää jonkin aikaa, kun olet päivittänyt tietosi. <div>Hallinnoi</div>


sub-item-no-such-plan = Tälle tilaukselle ei ole kyseistä tilaustyyppiä.
invoice-not-found = Seuraavaa laskua ei löydy
sub-item-no-such-subsequent-invoice = Seuraavaa laskua ei löydy tälle tilaukselle.
sub-invoice-preview-error-title = Laskun esikatselua ei löydy
sub-invoice-preview-error-text = Tälle tilaukselle ei löytynyt laskun esikatselua


reactivate-confirm-dialog-header = Haluatko jatkaa tuotteen { $name } käyttämistä?
reactivate-confirm-copy =
    Palvelun { $name } käyttö jatkuu, ja laskutusjakso
    sekä maksu pysyvät samoina kuin aiemmin. Seuraava veloitus
    tulee olemaan { $amount } kortilta, joka päättyy { $last }, { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Palvelun { $name } käyttö jatkuu, ja laskutusjakso
    sekä maksu pysyvät samoina kuin aiemmin. Seuraava veloitus
    tulee olemaan { $amount } { $endDate }.
reactivate-confirm-button = Tilaa uudelleen


reactivate-panel-copy = Käyttöoikeutesi palveluun { $name } päättyy <strong>{ $date }</strong>.
reactivate-success-copy = Kiitos! Kaikki on nyt valmiina.
reactivate-success-button = Sulje


sub-iap-item-google-purchase-2 = { -brand-google }: Sovelluksen sisäinen osto
sub-iap-item-apple-purchase-2 = { -brand-apple }: Sovelluksen sisäinen osto
sub-iap-item-manage-button = Hallitse
