/**
 * @file node.js client for Intuit's QuickBooks Payments and Financial Data API
 * @name quickbooks
 * @author Michael Cohen <mcohen01@gmail.com>
 * @license ISC
 * @copyright 2015 Michael Cohen
 */

var request = require('request'),
    uuid    = require('node-uuid'),
    debug   = require('request-debug'),
    util    = require('util'),
    _       = require('underscore'),
    version = require('./package.json').version

module.exports = Quickbooks


Quickbooks.RECONNECT_URL              = 'https://appcenter.intuit.com/api/v1/connection/reconnect'
Quickbooks.BASE_URL                   = 'https://sandbox.api.intuit.com/quickbooks/v4'

/**
 * Node.js client encapsulating access to the QuickBooks Payments API. An instance
 * of this class should be instantiated on behalf of each user accessing the api.
 *
 * @param consumerKey - application key
 * @param consumerSecret  - application password
 * @param token - the OAuth generated user-specific key
 * @param tokenSecret - the OAuth generated user-specific password
 * @param realmId - QuickBooks companyId, returned as a request parameter when the user is redirected to the provided callback URL following authentication
 * @param useSandbox - boolean - See https://developer.intuit.com/v2/blog/2014/10/24/intuit-developer-now-offers-quickbooks-sandboxes
 * @param debug - boolean flag to turn on logging of HTTP requests, including headers and body
 * @constructor
 */
function Quickbooks({consumerKey, consumerSecret, token, tokenSecret, realmId, refreshToken, oauthversion, useSandbox, debug}) {
  var prefix = _.isObject(consumerKey) ? 'consumerKey.' : '';
  this.consumerKey = eval(prefix + 'consumerKey');
  this.consumerSecret = eval(prefix + 'consumerSecret');
  this.token = eval(prefix + 'token');
  this.tokenSecret = eval(prefix + 'tokenSecret');
  this.realmId = eval(prefix + 'realmId');
  this.useSandbox = eval(prefix + 'useSandbox');
  this.debug = eval(prefix + 'debug');
  this.endpoint = this.useSandbox ? Quickbooks.BASE_URL : Quickbooks.BASE_URL.replace('sandbox.', '')
  this.oauthversion = oauthversion || '1.0a';
  this.refreshToken = refreshToken || null;
  if (!tokenSecret && this.oauthversion !== '2.0') throw new Error('tokenSecret not defined');
}

// **********************  Charge Api **********************

/**
 * Create an opaque container that encapsulates a cardholder's credit card information or bank account information.
 * @param card - the user's credit card information
 * @param callback
 */
Quickbooks.prototype.createToken = function(card, callback) {
  request({
    method: "POST",
    url: Quickbooks.BASE_URL + "/payments/tokens",
    body: card,
    json: true
  }, function (err, res, body) {
    callback(err, body)
  })
}


/**
 * Get details of charge.
 *
 * @param {string} chargeId - of previously created charge
 * @param callback - Callback function which is called with any error or the Charge
 */
Quickbooks.prototype.getCharge = function(chargeId, callback) {
  module.request(this, 'get', {
    url: '/payments/charges/' + chargeId,
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Process a credit card charge using card details or token.
 * Can capture funds or just authorize.
 *
 * @param {object} charge - details, amount, currency etc. of charge to be processed
 * @param callback - Callback function which is called with any error or the saved Charge
 */
Quickbooks.prototype.charge = function(charge, callback) {
  module.request(this, 'post', {
    url: '/payments/charges',
    headers: {
      'Company-Id': this.realmId
    }
  }, charge, callback)
}


/**
 * Allows you to capture funds for an existing charge that was intended to be captured at a later time.
 *
 * @param {string} chargeId - of previously created charge
 * @param {object} charge - details, amount, currency to capture
 * @param callback - Callback function which is called with any error or the capture description
 */
Quickbooks.prototype.capture = function(chargeId, charge, callback) {
  module.request(this, 'post', {
    url: '/payments/charges/' + chargeId + '/capture',
    headers: {
      'Company-Id': this.realmId
    }
  }, charge, callback)
}


/**
 * Retrieves the Refund for the given refund id
 *
 * @param {string} chargeId - id of previously created charge
 * @param {string} refundId - id of previously created Refund
 * @param callback - Callback function which is called with any error or the Refund
 */
Quickbooks.prototype.getChargeRefund = function(chargeId, refundId, callback) {
  module.request(this, 'get', {
    url: '/payments/charges/' + chargeId + '/refunds/' + refundId,
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Allows you to refund an existing charge. Full and partial refund are supported.
 *
 * @param {string} chargeId - of previously created charge
 * @param {object} refund - details, amount, currency to refund
 * @param callback - Callback function which is called with any error or the refund description
 */
Quickbooks.prototype.refundCharge = function(chargeId, refund, callback) {
  module.request(this, 'post', {
    url: '/payments/charges/' + chargeId + '/refunds',
    headers: {
      'Company-Id': this.realmId
    }
  }, refund, callback)
}


/**
 * Retrieves a list of Bank Accounts for the customer
 *
 * @param {string} customerId - id of customer
 * @param callback - Callback function which is called with any error or the list of Bank Accounts
 */
Quickbooks.prototype.bankAccounts = function(customerId, callback) {
  module.request(this, 'get', {
    url: '/payments/customers/' + customerId + '/bank-accounts',
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Retrieves an individual Bank Account for a customer
 *
 * @param {string} customerId - id of customer
 * @param {string} bankAccountId - id of Bank Account
 * @param callback - Callback function which is called with any error or the Bank Account
 */
Quickbooks.prototype.bankAccount = function(customerId, bankAccountId, callback) {
  module.request(this, 'get', {
    url: '/payments/customers/' + customerId + '/bank-accounts/' + bankAccountId,
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Create a new Bank Account for the customer
 *
 * @param {string} customerId - id of customer
 * @param {string} bankAccount - Bank Account
 * @param callback - Callback function which is called with any error or the Bank Account
 */
Quickbooks.prototype.createBankAccount = function(customerId, bankAccount, callback) {
  module.request(this, 'post', {
    url: '/payments/customers/' + customerId + '/bank-accounts',
    headers: {
      'Company-Id': this.realmId
    }
  }, bankAccount, callback)
}


/**
 * Create a new Bank Account for the customer
 *
 * @param {string} customerId - id of customer
 * @param {string} bankAccount - Bank Account
 * @param callback - Callback function which is called with any error or the Bank Account
 */
Quickbooks.prototype.createBankAccountFromToken = function(customerId, bankAccount, callback) {
  module.request(this, 'post', {
    url: '/payments/customers/' + customerId + '/bank-accounts/createFromToken',
    headers: {
      'Company-Id': this.realmId
    }
  }, bankAccount, callback)
}


/**
 * Deletes an individual Bank Account for a customer
 *
 * @param {string} customerId - id of customer
 * @param {string} bankAccountId - id of Bank Account
 * @param callback - Callback function which is called with any error or the Bank Account
 */
Quickbooks.prototype.deleteBankAccount = function(customerId, bankAccountId, callback) {
  module.request(this, 'delete', {
    url: '/payments/customers/' + customerId + '/bank-accounts/' + bankAccountId,
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Retrieves a list of Cards for the customer
 *
 * @param {string} customerId - id of customer
 * @param callback - Callback function which is called with any error or the list of Cards
 */
Quickbooks.prototype.cards = function(customerId, callback) {
  module.request(this, 'get', {
    url: '/payments/customers/' + customerId + '/cards',
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Retrieves an individual Card for a customer
 *
 * @param {string} customerId - id of customer
 * @param {string} cardId - id of Card
 * @param callback - Callback function which is called with any error or the Card
 */
Quickbooks.prototype.bankAccount = function(customerId, cardId, callback) {
  module.request(this, 'get', {
    url: '/payments/customers/' + customerId + '/cards/' + cardId,
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Create a new Card for the customer
 *
 * @param {string} customerId - id of customer
 * @param {string} card - Card
 * @param callback - Callback function which is called with any error or the Card
 */
Quickbooks.prototype.createCard = function(customerId, card, callback) {
  module.request(this, 'post', {
    url: '/payments/customers/' + customerId + '/cards',
    headers: {
      'Company-Id': this.realmId
    }
  }, card, callback)
}


/**
 * Create a new Card for the customer
 *
 * @param {string} customerId - id of customer
 * @param {string} card - Card
 * @param callback - Callback function which is called with any error or the Card
 */
Quickbooks.prototype.createCardFromToken = function(customerId, card, callback) {
  module.request(this, 'post', {
    url: '/payments/customers/' + customerId + '/cards/createFromToken',
    headers: {
      'Company-Id': this.realmId
    }
  }, card, callback)
}


/**
 * Deletes an individual Card for a customer
 *
 * @param {string} customerId - id of customer
 * @param {string} cardId - id of Card
 * @param callback - Callback function which is called with any error or the Card
 */
Quickbooks.prototype.deleteCard = function(customerId, cardId, callback) {
  module.request(this, 'delete', {
    url: '/payments/customers/' + customerId + '/cards/' + cardId,
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Get details of Echeck.
 *
 * @param {string} echeckId - of previously created Echeck
 * @param callback - Callback function which is called with any error or the Echeck
 */
Quickbooks.prototype.getEcheck = function(echeckId, callback) {
  module.request(this, 'get', {
    url: '/payments/echecks/' + echeckId,
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Process an Echeck.
 *
 * @param {object} echeck - details, amount, currency etc. of charge to be processed
 * @param callback - Callback function which is called with any error or the saved Echeck
 */
Quickbooks.prototype.echeck = function(echeck, callback) {
  module.request(this, 'post', {
    url: '/payments/echecks',
    headers: {
      'Company-Id': this.realmId
    }
  }, echeck, callback)
}


/**
 * Retrieves the Refund for the given refund id
 *
 * @param {string} echeckId - id of previously created echeck
 * @param {string} refundId - id of previously created Refund
 * @param callback - Callback function which is called with any error or the Refund
 */
Quickbooks.prototype.getEcheckRefund = function(echeckId, refundId, callback) {
  module.request(this, 'get', {
    url: '/payments/echecks/' + echeckId + '/refunds/' + refundId,
    headers: {
      'Company-Id': this.realmId
    }
  }, null, callback)
}


/**
 * Allows you to refund an existing echeck. Full and partial refund are supported.
 *
 * @param {string} echeckId - of previously created echeck
 * @param {object} refund - details, amount, currency to refund
 * @param callback - Callback function which is called with any error or the refund description
 */
Quickbooks.prototype.refundEcheck = function(echeckId, refund, callback) {
  module.request(this, 'post', {
    url: '/payments/echecks/' + echeckId + '/refunds',
    headers: {
      'Company-Id': this.realmId
    }
  }, refund, callback)
}


module.request = function(context, verb, options, entity, callback) {
  var url = context.endpoint + options.url
  if (options.url === Quickbooks.RECONNECT_URL) {
    url = options.url
  }
  var opts = {
    url:     url,
    qs:      options.qs || {},
    headers: options.headers || {},
    json:    true
  }
  opts.headers['Content-Type'] = 'application/json'
  opts.headers['User-Agent'] = 'quickbooks4js: version ' + version
  opts.headers['Request-Id'] = uuid.v1()
  if (context.oauthversion == '2.0') {
    opts.headers['Authorization'] = 'Bearer ' + context.token
  } else {
    opts.oauth = module.oauth(context);
  };
  if (entity !== null) {
    opts.body = entity
  }
  if ('production' !== process.env.NODE_ENV && context.debug) {
    debug(request)
  }
  request[verb].call(context, opts, function (err, res, body) {
    if ('production' !== process.env.NODE_ENV && context.debug) {
      console.log('invoking endpoint: ' + url)
      if (entity) console.log(entity)
      console.log(util.inspect(err || body, {showHidden: false, depth: null}));
    }
    if (callback) {
      if (err ||
        res.statusCode >= 300 ||
        (_.isObject(body) && body.Fault && body.Fault.Error && body.Fault.Error.length)) {
        callback(err || body, body)
      } else {
        callback(null, body)
      }
    } else {
      return
    }
  })
}

Quickbooks.prototype.reconnect = function(callback) {
  module.request(this, 'get', {url: Quickbooks.RECONNECT_URL}, null, callback)
}

module.oauth = function(context) {
  return {
    consumer_key:    context.consumerKey,
    consumer_secret: context.consumerSecret,
    token:           context.token,
    token_secret:    context.tokenSecret
  }
}