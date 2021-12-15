# Variables:
# $productNameNew (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = You have switched to { $productNameNew }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productNameNew (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = You have successfully switched from { $productNameOld } to { $productNameNew }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycle (String) - The interval of time from the end of one payment statement date to the next payment statement date, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge = Starting with your next bill, your charge will change from { $paymentAmountOld } per { $productPaymentCycle } to { $paymentAmountNew }. At that time you will also be given a one-time credit of { $paymentProrated } to reflect the lower charge for the remainder of this { $productPaymentCycle }.
# Variables:
# $productNameNew (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = If there is new software for you to install in order to use { $productNameNew }, you will receive a separate email with download instructions.
subscriptionDowngrade-content-auto-renew = Your subscription will automatically renew each billing period unless you choose to cancel.
