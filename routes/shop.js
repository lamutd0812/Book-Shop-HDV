const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/', shopController.getIndexPage);

router.get('/products', shopController.getProducts);

router.post('/products/search', shopController.getProductByKeyword);

router.get('/products/category/:categoryId', shopController.getProductsByCategory);

router.get('/product/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.addToCart);

router.get('/checkout', isAuth, shopController.getCheckout);

// paypal integration
router.get('/paypal-checkout', isAuth, shopController.getPaypalCheckout);

router.get('/paypal-checkout-success', isAuth, shopController.getPaypalCheckoutSuccess);

router.get('/paypal-checkout-error', isAuth, shopController.getPaypalCheckoutError);

router.get('/place-order', isAuth, shopController.getPlaceOrder);

router.post('/place-order', isAuth, shopController.postPlaceOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/order/:orderId', isAuth, shopController.getOrderDetail);

// ------------- REST API--------------
// addOneToCart
router.post('/cart/add-one', isAuth, shopController.addOneToCart);
// deleteCartItem
router.post('/cart/delete-item', isAuth, shopController.postDeleteCartItem);
//update cart item quantity
router.post('/cart/update-qty', isAuth, shopController.postUpdateCartItemQty);
//searching
router.get('/search-by-keyword', shopController.getBookByKeyword);

module.exports = router;