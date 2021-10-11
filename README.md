## Package Description
Create payments and subscriptions using Payfast on any website

## Features
 - Supports 'return_url' & 'cancel_url' redirects
 - Supports onSuccess callback

## Installing

Using npm:

    $ npm install payfastjs-helper

Using yarn:

    $ yarn add payfastjs-helper

## Parameters

  **new PayfastHandler(merchantKey, merchantId, passPhrase)**
  

 - merchantKey: Get this key from your Payfast account (required)
 - merchantId: Get this id from your Payfast account (required)
 - passPhrase: You have to set this in your Payfast account (required if set in Payfast account or when using subscriptions)

**await... ().createPayment(paymentData, options, callback)**

PaymentData:
 - notify_url (required)
 - return_url (Required if 'onsite' is false)
 - cancel_url (Required if 'onsite' is false)
 - name_first 
 - name_last 
 - email_address (required if 'cell_number' not provided)
 - cell_number (required if 'email_address' not provided)
 - m_payment_id
 - amount (required)
 - item_name 
 - item_description
 - custom_str1
 - custom_str2
 - custom_str3
 - custom_str4
 - custom_str5
 - custom_int1
 - custom_int2
 - custom_int3
 - custom_int4
 - custom_int5
 - email_confirmation 
 - confirmation_address 
 - payment_method

**await... ().createSubscription(paymentData, options, callback)**

Payment Data: 
 - All above
 - subscription_type (Required, default: 1 (subscription))
 - billing_date
 - recurring_amount
 - frequency (Required, Default: 3 (monthly))
 - cycles (Required)

**Options** 

 - onsite (false by default)
 - sandbox (false by default)
```
options: {
	onsite: true,
	sandbox: false
}
```

**Callback**
```
(success: boolean) => {}
```


Checkout [Payfast developer documentation](https://developers.payfast.co.za/docs#onsite_payments) to see what parameters mean.

    
## Example

 - With Redirect Urls
```
    import { PayfastHandler } from 'payfastjs-helper'
    
    const paymentHandler = new PayfastPayment('123', 'abc', 'mypassphrase);
    
    // create payment
    await paymentHandler.createPayment({
    	amount: '100.00',
    	email_address: 'example@example.com',
    	item_name: 'my demo product',
	    cancel_url: 'https://demo.demo/cancel_payment',
	    return_url: 'https://demo.demo/return_payment',
	    notify_url: 'https://demo.demo/post_to_notify_url'
    }, {sandbox: false, onsite: true})
  ```
 Method will redirect you to your cancel_url / return_url

 - With Callback
```
    import {PayfastHandler} from 'payfastjs-helper'
    
    const paymentHandler = new PayfastHandler('123', 'abc', 'mypassphrase);
    
    // create payment
    await paymentHandler.createPayment({
    	amount: '100.00',
    	email_address: 'example@example.com',
    	item_name: 'my demo product',
	    notify_url: 'https://demo.demo/post_to_notify_url'
    }, {onsite: true} ,(success) => {
		if (success){
			// payment successful
		}else{
			// payment cancelled or failed
		}
	})
  ```
 - Method will not redirect you to your cancel_url / return_url, but rather return callback if both 'cancel_url' and 'return_url' is empty.
    
## Roadmap

 - Tokenization
 - Split payments
 - Server side validations and subscription management
