require('request').debug = true

var expect     = require('expect'),
    async      = require('async'),
    config     = require('../config'),
    QuickBooks = require('../index'),
    qbo        = new QuickBooks(
          config.consumerKey,
          config.consumerSecret,
          config.token,
          config.tokenSecret,
          config.realmId,
          config.refreshToken,
          config.oauthversion,
          config.useSandbox,
          config.debug
    );



describe('Charge Api', function() {

  this.timeout(30000);

  it('should create a Charge, get a charge, capture, and refund', function(done) {

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

    var token, chargeId, refundId
    async.series([function(cb) {
      qbo.createToken(card, function(err, cardToken) {
        token = cardToken.value
        cb()
      })
    }, function(cb) {
      qbo.charge({
        "amount": "42.21",
        "token": token,
        "currency": "USD"
      }, function(err, charged) {
        expect(err).toBe(null)
        expect(charged.errors).toBe(undefined)
        expect(charged.amount).toBe(42.21)
        expect(charged.card.token).toExist()
        expect(charged.card.id).toExist()
        expect(charged.card.authCode).toExist()
        chargeId = charged.id
        cb()
      })
    }, function(cb) {
      qbo.getCharge(chargeId, function(err, charge) {
        expect(err).toBe(null)
        expect(charge.errors).toBe(undefined)
        expect(charge.status.toUpperCase()).toBe('AUTHORIZED')
        expect(charge.amount).toBe(42.21)
        expect(charge.card.number).toBe('xxxxxxxxxxxx1111')
        expect(charge.card.name).toBe('Brad Smith')
        cb()
      })
    }, function(cb) {
      qbo.capture(chargeId, {
        amount: 42.21
      }, function(err, capture) {
        expect(err).toBe(null)
        expect(capture.errors).toBe(undefined)
        expect(capture.amount).toBe(42.21)
        cb()
      })
    }, function(cb) {
      charge.capture = true
      qbo.charge(charge, function(err, charged) {
        expect(err).toBe(null)
        expect(charged.errors).toBe(undefined)
        expect(charged.amount).toBe(42.21)
        expect(charged.card.number).toBe('xxxxxxxxxxxx1111')
        expect(charged.card.name).toBe('Brad Smith')
        chargeId = charged.id
        cb()
      })
    },function(cb) {
      qbo.refundCharge(chargeId, {amount: 42.21}, function(err, refund) {
        expect(err).toBe(null)
        expect(refund.errors).toBe(undefined)
        expect(refund.amount).toBe(42.21)
        refundId = refund.id
        cb()
      })
    },function(cb) {
      qbo.getChargeRefund(chargeId, refundId, function(err, refund) {
        expect(err).toBe(null)
        expect(refund.errors).toBe(undefined)
        expect(refund.id).toBe(refundId)
        expect(refund.amount).toBe(42.21)
        expect(refund.context).toBeA(Object)
        cb()
      })
    }], function(e, r) {
      done()
    })

  })

})