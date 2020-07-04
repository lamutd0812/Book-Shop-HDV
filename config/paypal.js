const paypal = require('paypal-rest-sdk');

// paypal config
paypal.configure({
    'mode': 'sandbox',
    'client_id': 'Aaar_nI_ofKlWMSCqI3Wz9gGsiKltvV2O0erqvEpP9TTtc5D_ERPI0ioJrg5iPGFTRT5XhP5pC3bkJbd',
    'client_secret': 'ED19aLGtMX1LeWHEJbgcxbX03fY9T_ol4FJDJAcGm-vej1vOszA6QXAiv0n2K3svp8UWdWc5jhjvWakx'
});

module.exports = paypal;