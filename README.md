# quickbooks

Node.js client for [QuickBooks Payments api] [1].  
(Quickbooks Accounting client available at [github.com/mcohen01/node-quickbooks](https://github.com/mcohen01/node-quickbooks).)

## Installation

`npm install quickbooks`

## Documentation

Full Api documentation at [mcohen01.github.io/quickbooks](https://mcohen01.github.io/quickbooks)


```javascript

var QuickBooks = require('quickbooks')

var qbo = new QuickBooks(consumerKey,
                         consumerSecret,
                         oauthToken,
                         oauthTokenSecret,
                         realmId,
                         false, // don't use the sandbox (i.e. for testing)
                         true); // turn debugging on

var chargeId

var charge = {
  capture: false,
  currency: 'USD',
  amount: '42.21',
  card: {
    expYear: '2016',
    expMonth: '02',
    address: {
      region: 'CA',
      postalCode: '94062',
      streetAddress: '131 Fairy Lane',
      country: 'US',
      city: 'Sunnyvale'
    },
    name: 'Brad Smith',
    cvc: '123',
    number: '4111111111111111'
  }
}

qbo.charge(charge, function(err, charged) {
  console.log(charged.id)
})

qbo.getCharge(chargeId, function(err, charge) {
  console.log(charge.card.address.street_address)
})

qbo.capture(chargeId, { amount: 42.21 }, function(err, capture) {
  console.log(capture)
})

qbo.refundCharge(chargeId, {amount: 20.00}, function(err, refund) {
  console.log(refund)
})

qbo.getChargeRefund(chargeId, refundId, function(err, refund) {
  console.log(refund)
})

```

## Running the tests

First you'll need to fill in the missing values in config.js. The consumerKey and consumerSecret you can get from the Intuit Developer portal, the token, tokenSecret, and realmId are easiest to obtain by running the example app, completing the OAuth workflow, and copying the values that are logged to the console. Once you've filled in the missing credentials in config.js you can simply run:

`npm test`


[1]: https://developer.intuit.com/docs/0150_payments
