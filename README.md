# quickbooks

Node.js client for [QuickBooks Payments api] [1].  
(Quickbooks Accounting client available at [github.com/mcohen01/node-quickbooks](https://github.com/mcohen01/node-quickbooks).)

## Installation

`npm install quickbooks`

## Documentation

Full Api documentation at [mcohen01.github.io/quickbooks](https://mcohen01.github.io/quickbooks)


```javascript

var QuickBooks = require('quickbooks')

var qbo = new QuickBooks({consumerKey,
                         consumerSecret,
                         oauthToken,
                         oauthTokenSecret, // false for OAuth 2.0
                         realmId,
                         refreshToken, // needed for OAuth 2.0
                         oauthversion, // 2.0 if OAuth 2.0
                         false, // don't use the sandbox (i.e. for testing)
                         true}); // turn debugging on

var card = {
      name: 'Brad Smith',
      card: {
        cvc: '123',
        number: '4111111111111111',
        expYear: '2016',
        expMonth: '02',
        address: {
          region: 'CA',
          postalCode: '94062',
          streetAddress: '131 Fairy Lane',
          country: 'US',
          city: 'Sunnyvale'
        }
      }
    }
var token, chargeId;

qbo.createToken(card, function(err, cardToken) {
  token = cardToken.value
  console.log(cardToken.value)
})

qbo.charge({ amount: "10.55", token,  "currency" : "USD"}, function(err, charged) {
  console.log(charged.id)
})

// without token

qbo.charge(card, function(err, charged) {
  chargeId = charged.id
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
