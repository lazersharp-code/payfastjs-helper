const paymentParams = {
    return_url: '',
    cancel_url: '',
    notify_url: '',

    name_first: '',
    name_last: '',
    email_address: '',
    cell_number: '',

    m_payment_id: '',
    amount: '',
    item_name: '',
    item_description: '',

    custom_int1: '',
    custom_int2: '',
    custom_int3: '',
    custom_int4: '',
    custom_int5: '',

    custom_str1: '',
    custom_str2: '',
    custom_str3: '',
    custom_str4: '',
    custom_str5: '',

    email_confirmation: '',
    confirmation_address: '',
    payment_method: '',
}

const subscriptionParams = {
    ...paymentParams,
    subscription_type: '',
    billing_date: '',
    recurring_amount: '',
    frequency: '',
    cycles: '',
}

const gatewayOptions = {
    onsite: false,
    sandbox: false
}

module.exports = { subscriptionParams, paymentParams, gatewayOptions }