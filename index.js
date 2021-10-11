const crypto = require("crypto");
const axios = require('axios').default;
const { subscriptionParams, paymentParams, gatewayOptions } = require('./models')

const Live = 'https://www.payfast.co.za/eng/process'
const Sandbox = 'https://sandbox.payfast.co.za​/eng/process'

// create md5 signature for payments
const hash = (data, passPhrase) => {
    // Create parameter string
    let pfOutput = "";
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] !== "") {
                pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null) {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(getString).digest("hex");
}

const generateDataString = (dataArray) => {
    // Convert your data array to a string
    let pfParamString = "";
    for (let key in dataArray) {
        if (dataArray[key]) {
            if (dataArray.hasOwnProperty(key)) {
                if (dataArray[key] !== "") {
                    pfParamString += `${key}=${encodeURIComponent(dataArray[key].trim()).replace(/%20/g, "+")}&`;
                }
            }
        }
    }
    // Remove last ampersand
    return pfParamString.slice(0, -1);
}

const generatePaymentIdentifier = async (dataString) => {
    console.log(dataString);
    const result = await axios.post(`https://www.payfast.co.za/onsite/process`, dataString)
        .then((res) => {
            return res.data.uuid || null;
        })
        .catch((error) => {
            console.error(error)
        });
    return result;
};

const payfastPaymentParams = (paymentData, subscription) => {
    const payment = {
        ...this.payfastData,
        return_url: paymentData.return_url || '',
        cancel_url: paymentData.cancel_url || '',
        notify_url: paymentData.notify_url || '',

        name_first: paymentData.name_first || '',
        name_last: paymentData.name_last || '',
        email_address: paymentData.email_address || '',
        cell_number: paymentData.cell_number || '',

        m_payment_id: paymentData.m_payment_id || '',
        amount: paymentData.amount || '',
        item_name: paymentData.item_name || '',
        item_description: paymentData.item_description || '',

        custom_int1: paymentData.custom_int1 || '',
        custom_int2: paymentData.custom_int2 || '',
        custom_int3: paymentData.custom_int3 || '',
        custom_int4: paymentData.custom_int4 || '',
        custom_int5: paymentData.custom_int5 || '',

        custom_str1: paymentData.custom_str1 || '',
        custom_str2: paymentData.custom_str2 || '',
        custom_str3: paymentData.custom_str3 || '',
        custom_str4: paymentData.custom_str4 || '',
        custom_str5: paymentData.custom_str5 || '',

        email_confirmation: paymentData.email_confirmation || '',
        confirmation_address: paymentData.confirmation_address || '',
        payment_method: paymentData.payment_method || '',

    }
    const subs = {
        subscription_type: paymentData.subscription_type || '1', // subscription
        billing_date: paymentData.billing_date || '',
        recurring_amount: paymentData.recurring_amount || '',
        frequency: paymentData.frequency || '3', //monthly
        cycles: paymentData.cycles || '',
    }
    return subscription ? { ...payment, ...subs, signature: '' } : { ...payment, signature: '' };
}

const handleOnSitePayment = async (pfParamString, paymentData, callback) => {
    // generate payment identifier
    const identifier = await generatePaymentIdentifier(pfParamString)
    /** 
        if return_url && cacel_url is provided, redirect user
        if both are not provided, return callback 
    **/
    if (identifier) {
        if (paymentData['return_url'] && paymentData['cancel_url']) {
            window['payfast_do_onsite_payment']({
                "uuid": identifier,
                "return_url": paymentData['return_url'],
                "cancel_url": paymentData['cancel_url']
            });
        } else {
            window['payfast_do_onsite_payment']({ "uuid": identifier }, function (result) {
                if (result === true) {
                    // Payment Completed
                    callback(result)
                }
                else {
                    // Payment Window Closed
                    callback(false)
                }
            });
        }
    } else {
        throw "Something went wrong"
    }
}

class PayfastHandler {
    constructor(merchantKey, merchantId, passPhrase) {
        if (!merchantKey) {
            throw "Please enter your merchant_key"
        }
        if (!merchantId) {
            throw "Please enter your merchant_id"
        }

        // insert payfast script
        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://www.payfast.co.za/onsite/engine.js';
        head.appendChild(script);

        // populate payfast data
        this.passPhrase = passPhrase;
        this.payfastData = {
            merchant_id: merchantId,
            merchant_key: merchantKey
        }
    }

    async createPayment(paymentData = paymentParams, options = gatewayOptions, callback = () => { }) {

        if (!paymentData['amount']) {
            throw "Please enter your amount"
        }
        if (!paymentData['email_address'] && !paymentData['cell_number']) {
            throw "Please enter your email_address or your cell_number"
        }

        if (!paymentData['cancel_url'] && !options.onsite) {
            throw "Please enter your cancel_url"
        }

        if (!paymentData['return_url'] && !options.onsite) {
            throw "Please enter your return_url"
        }

        if (!paymentData['notify_url']) {
            throw "Please enter your notify_url"
        }

        if (!paymentData['item_name']) {
            throw "Please enter your item_name"
        }

        // populate payment data
        this.payfastData = {
            ...this.payfastData,
            ...payfastPaymentParams(paymentData)
        }

        // generate signature
        this.payfastData['signature'] = hash(this.payfastData, this.passPhrase || null);

        // generate pfDataString
        const pfParamString = generateDataString(this.payfastData);
        if (options.sandbox & !options.onsite) {
            return window.location.href = (options.sandbox ? Sandbox : Live) + '?' + pfParamString;
        } else if (options.onsite && options.sandbox) {
            throw "Sandbox for On site is not available"
        } else {
            await handleOnSitePayment(pfParamString, this.payfastData, (success) => {
                if (success) {
                    callback(true)
                } else {
                    callback(false)
                }
            })
        }
    }

    async createSubscription(paymentData = subscriptionParams, options = gatewayOptions, callback = () => { }) {

        if (!paymentData['amount']) {
            throw "Please enter your amount"
        }

        if (!this.passPhrase) {
            throw "Please initialize with your passphrase"
        }

        if (!paymentData['cycles']) {
            throw "Please enter your cycles"
        }

        if (!paymentData['email_address'] && !paymentData['cell_number']) {
            throw "Please enter your email_address or your cell_number"
        }

        if (!paymentData['cancel_url'] && !options.onsite) {
            throw "Please enter your cancel_url"
        }

        if (!paymentData['return_url'] && !options.onsite) {
            throw "Please enter your return_url"
        }

        if (!paymentData['notify_url']) {
            throw "Please enter your notify_url"
        }

        if (!paymentData['item_name']) {
            throw "Please enter your item_name"
        }

        // populate payment data
        this.payfastData = {
            ...this.payfastData,
            ...payfastPaymentParams(paymentData, true)
        }

        // generate signature
        this.payfastData['signature'] = hash(this.payfastData, this.passPhrase || null);

        // generate pfDataString
        const pfParamString = generateDataString(this.payfastData);

        if (!options.sandbox && options.onsite) {
            await handleOnSitePayment(pfParamString, this.payfastData, (success) => {
                if (success) {
                    callback(true)
                } else {
                    callback(false)
                }
            })
        } else if (options.onsite && options.sandbox) {
            throw "Sandbox for On site is not available"
        } else {
            return window.location.href = (options.sandbox ? Sandbox : Live) + '?' + pfParamString;
        }
    }

}


module.exports = { PayfastHandler };

