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
#   $invoiceSubtotal (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-daily = At that time, { -brand-mozilla } will renew your daily subscription and a charge of { $invoiceSubtotal } + { $invoiceTax } tax will be applied to the payment method on your account.
subscriptionRenewalReminder-content-charge-with-tax-weekly = At that time, { -brand-mozilla } will renew your weekly subscription and a charge of { $invoiceSubtotal } + { $invoiceTax } tax will be applied to the payment method on your account.
subscriptionRenewalReminder-content-charge-with-tax-monthly = At that time, { -brand-mozilla } will renew your monthly subscription and a charge of { $invoiceSubtotal } + { $invoiceTax } tax will be applied to the payment method on your account.
subscriptionRenewalReminder-content-charge-with-tax-halfyearly = At that time, { -brand-mozilla } will renew your six-month subscription and a charge of { $invoiceSubtotal } + { $invoiceTax } tax will be applied to the payment method on your account.
subscriptionRenewalReminder-content-charge-with-tax-yearly = At that time, { -brand-mozilla } will renew your yearly subscription and a charge of { $invoiceSubtotal } + { $invoiceTax } tax will be applied to the payment method on your account.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-daily = At that time, { -brand-mozilla } will renew your daily subscription and a charge of { $invoiceTotal } will be applied to the payment method on your account.
subscriptionRenewalReminder-content-charge-invoice-total-weekly = At that time, { -brand-mozilla } will renew your weekly subscription and a charge of { $invoiceTotal } will be applied to the payment method on your account.
subscriptionRenewalReminder-content-charge-invoice-total-monthly = At that time, { -brand-mozilla } will renew your monthly subscription and a charge of { $invoiceTotal } will be applied to the payment method on your account.
subscriptionRenewalReminder-content-charge-invoice-total-halfyearly = At that time, { -brand-mozilla } will renew your six-month subscription and a charge of { $invoiceTotal } will be applied to the payment method on your account.
subscriptionRenewalReminder-content-charge-invoice-total-yearly = At that time, { -brand-mozilla } will renew your yearly subscription and a charge of { $invoiceTotal } will be applied to the payment method on your account.
subscriptionRenewalReminder-content-closing = Sincerely,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = The { $productName } team
