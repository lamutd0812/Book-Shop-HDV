const paypal = require('paypal-rest-sdk');

// paypal config
paypal.configure({
    'mode': 'sandbox',
    'client_id': '',
    'client_secret': ''
});

module.exports = paypal;