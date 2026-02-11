# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } automatic renewal notice
subscriptionRenewalReminder-title = Your subscription will be renewed soon
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Dear { $productName } customer,
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Your current subscription is set to automatically renew in { $reminderLength } days.
subscriptionRenewalReminder-content-discount-change = Your next invoice reflects a change in pricing, as a previous discount has ended and a new discount has been applied.
subscriptionRenewalReminder-content-discount-ending = Because a previous discount has ended, your subscription will renew at the standard price.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
# Localized subscription intervals
subscription-interval-day = day
subscription-interval-week = week
subscription-interval-month = month
subscription-interval-year = year

# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = At that time, { -brand-mozilla } will renew your { $planIntervalCount } { $planInterval ->
        [day] { subscription-interval-day }
        [week] { subscription-interval-week }
        [month] { subscription-interval-month }
        [year] { subscription-interval-year }
        *[other] { $planInterval }
    } subscription and a charge of { $invoiceTotal } will be applied to the payment method on your account.
subscriptionRenewalReminder-content-closing = Sincerely,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = The { $productName } team
