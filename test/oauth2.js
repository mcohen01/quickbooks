
var expect = require('expect'),
    async = require('async'),
    config = require('../config'),
    QuickBooks = require('../index'),
    chalk = require("chalk"),
    qbo = new QuickBooks(
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

var green = (s) => console.log("\t", chalk.green("[+] " + s))

describe("OAuth 2.0 Test", function () {

    this.timeout(50000);
    it("should create charge, capture and refund", function (done) {

        const card = {
            "amount": "10.55",
            "card": {
                "expYear": "2020",
                "expMonth": "02",
                "address": {
                    "region": "CA",
                    "postalCode": "94086",
                    "streetAddress": "1130 Kifer Rd",
                    "country": "US",
                    "city": "Sunnyvale"
                },
                "name": "emulate=0",
                "cvc": "123",
                "number": "4111111111111111"
            },
            "currency": "USD",
            "capture": "false",
            "context": {
                "mobile": "false",
                "isEcommerce": "true"
            }
        }
        let token, chargeId, refundId, mCapture;

        async.series([
            function (cb) {
                qbo.createToken({ card: card.card }, function (err, ct) {
                    token = ct.value
                    green("createToken passed")
                    cb()
                })
            },
            function (cb) {
                qbo.charge(card, function (err, charge) {
                    expect(err).toBe(null);
                    chargeId = charge.id
                    green("charge passed")                    
                    cb()
                })
            },
            function (cb) {
                qbo.getCharge(chargeId, function (err, getCharge) {
                    expect(err).toBe(null)
                    expect(getCharge.id).toBe(chargeId)
                    green("getCharge passed")
                    cb()
                })
            },
            function (cb) {
                qbo.capture(chargeId, { amount: "10.55" }, function (err, captured) {
                    expect(err).toBe(null)
                    expect(captured.status).toBe("CAPTURED")
                    green("capture passed")
                    cb()
                })
            },
            function (cb) {
                mCapture = card
                mCapture.capture = true
                qbo.charge(mCapture, function (err, capturedCharge) {
                    expect(err).toBe(null)
                    expect(capturedCharge.capture).toBe(true)
                    green("captured a  charge passed")                    
                    cb()
                })
            },
            function (cb) {
                qbo.refundCharge(chargeId, { amount: "10.55" }, function (err, refund) {
                    expect(err).toBe(null)
                    expect(refund.id).toNotBe(undefined)
                    refundId = refund.id
                    green("refundCharge passed")
                    cb()
                })
            },
            function (cb) {
                qbo.getChargeRefund(chargeId, refundId, function (err, refundCharge) {
                    expect(err).toBe(null)
                    expect(refundCharge).toBeA(Object)
                    green("geChargeRefund passed")
                    cb()                    
                })
            }
        ], function (e,r) {
            done()
        })


    })
})

