const stripe = require('stripe')('sk_test_WYZ0cltAA2EtZHr9L7kVj0VL00fb1r6dYf');
const paypal = require('../config/paypal');
//const paypal = require('paypal-rest-sdk');

const Category = require('../model/category');
const Product = require('../model/product');
const Cart = require('../model/cart');
const Order = require('../model/orders');
const OrderDetail = require('../model/order-detail');
//const { json } = require('body-parser');

const ITEMS_PER_PAGE = 9;

exports.getIndexPage = async (req, res, next) => {
    try {
        const categories = await Category.find();
        const latestProducts = await Product.find().skip(9).limit(4);
        const hotProducts = await Product.find().skip(14).limit(4);
        const recommendedProducts = await Product.find().skip(6).limit(4);
        res.render('index', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/',
            categories: categories,
            latestProducts: latestProducts,
            hotProducts: hotProducts,
            recommendedProducts: recommendedProducts
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getProducts = async (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    try {
        totalItems = await Product.find().countDocuments();

        const categories = await Category.find();
        const products = await Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        const latestProducts = await Product.find().skip(9).limit(3);
        const latestProducts2 = await Product.find().skip(12).limit(3);
        res.render('products', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories,
            products: products,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            latestProducts: latestProducts,
            latestProducts2: latestProducts2
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getProductsByCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;

    const page = +req.query.page || 1;
    let totalItems;
    try {
        totalItems = await Product.find({ categoryId: categoryId }).countDocuments();

        const categories = await Category.find();
        const products = await Product.find({ categoryId: categoryId })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        const latestProducts = await Product.find().skip(9).limit(3);
        const latestProducts2 = await Product.find().skip(12).limit(3);
        res.render('products', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories,
            products: products,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            latestProducts: latestProducts,
            latestProducts2: latestProducts2
        });
    } catch (err) {
        console.log(err);
    }
}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;
    try {
        const categories = await Category.find();
        const product = await Product.findById(productId).populate('categoryId');
        res.render('product-detail', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories,
            product: product
        })
    } catch (err) {
        console.log(err);
    }
};

exports.getProductByKeyword = async (req, res, next) => {
    const productId = req.body.product_id;
    //console.log(productId);
    let categories;
    try {
        categories = await Category.find();
        const product = await Product.findById(productId).populate('categoryId');
        res.render('product-detail', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories,
            product: product
        })
    } catch (err) {
        categories = await Category.find();
        res.render('error/search-error', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories
        });
        console.log(err);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        const categories = await Category.find();
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
        //console.log(cart);

        const cartItems = getCartItems(cart);
        const totalPrice = getTotalPrice(cart);
        //console.log(cartItems);

        res.render('cart', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories,
            cartItems: cartItems,
            totalPrice: totalPrice
        });
    } catch (err) {
        console.log(err);
    }
};

exports.addToCart = async (req, res, next) => {
    const productId = req.body.productId;
    const qty = req.body.quantity;
    try {
        const categories = await Category.find();
        const cart = await Cart.findOne({ userId: req.user._id });
        //console.log(cart);

        const cartItemIndex = cart.items.findIndex(item => {
            return item.productId.toString() === productId.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...cart.items];
        if (cartItemIndex >= 0) {
            newQuantity = cart.items[cartItemIndex].quantity + +qty;
            updatedCartItems[cartItemIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: productId,
                quantity: qty
            })
        }
        cart.items = updatedCartItems;
        const newCart = await cart.save();
        //console.log(newCart);

        res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.getCheckout = async (req, res, next) => {
    try {
        const categories = await Category.find();
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
        //console.log(cart);

        const cartItems = getCartItems(cart);
        if (cartItems.length < 1) {
            res.redirect('/cart');
        }
        const totalPrice = getTotalPrice(cart);

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartItems.map(i => {
                return {
                    name: i.product.name,
                    amount: i.product.price * 100,
                    currency: 'usd',
                    quantity: i.quantity
                };
            }),
            mode: 'payment',
            success_url: req.protocol + '://' + req.get('host') + '/place-order', // http://localhost:3000/place-order
            cancel_url: req.protocol + '://' + req.get('host') + '/checkout'
        });

        res.render('checkout', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories,
            cartItems: cartItems,
            totalPrice: totalPrice,
            stripeSessionId: stripeSession.id
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getPaypalCheckout = async (req, res, next) => {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    //console.log(cart);

    const totalPrice = getTotalPrice(cart); // Lấy ra tổng số tiền hàng trong giỏ hàng

    // cấu hình payment
    var payment = {
        "intent": "authorize",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/paypal-checkout-success", // thanh toán thành công
            "cancel_url": "http://localhost:3000/paypal-checkout-error" // hủy thanh toán
        },
        "transactions": [{
            "amount": {
                "total": totalPrice,
                "currency": "USD"
            },
            "description": "Happy reading!"
        }]
    };

    // tạo payment
    createPay(payment)
        .then((transaction) => {
            var id = transaction.id;
            var links = transaction.links;
            var counter = links.length;
            while (counter--) {
                if (links[counter].method == 'REDIRECT') {
                    // redirect to paypal where user approves the transaction
                    return res.redirect(links[counter].href);
                }
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/checkout');
        });
};

exports.getPaypalCheckoutSuccess = (req, res, next) => {
    console.log(req.query);
    res.redirect('/place-order'); // chuyển hướng đến trang đặt hàng
}

exports.getPaypalCheckoutError = (req, res, next) => {
    console.log(req.query);
    res.redirect('/checkout'); // chuyển hướng về trang thanh toán
}

exports.getPlaceOrder = async (req, res, next) => {
    try {
        const categories = await Category.find();
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

        const cartItems = getCartItems(cart);
        const totalPrice = getTotalPrice(cart);

        res.render('place-order', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories,
            cartItems: cartItems,
            totalPrice: totalPrice
        });
    } catch (err) {
        console.log(err);
    }
};

exports.postPlaceOrder = async (req, res, next) => {
    const fullname = req.body.fullname;
    const address = req.body.address;
    const phone = req.body.phone;
    const email = req.body.email;
    const message = req.body.message;
    try {
        const categories = await Category.find();
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

        const cartItems = getCartItems(cart);
        const totalPrice = getTotalPrice(cart);

        const orderDetail = new OrderDetail({
            fullname: fullname,
            address: address,
            phone: phone,
            email: email,
            message: message
        });
        const newOrderDetail = await orderDetail.save();

        const order = new Order({
            userId: req.user._id,
            items: cartItems,
            totalAmount: totalPrice,
            orderDetailId: newOrderDetail._id,
            status: "Đang xử lý"
        });
        const newOrder = await order.save();

        // delete all cart items
        cart.items = [];
        await cart.save()

        res.redirect('/orders');

    } catch (err) {
        console.log(err);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const categories = await Category.find();
        const orders = await Order.find({ userId: req.user._id })
            .populate('orderDetailId')
            .populate('items.productId');
        //.execPopulte();

        //console.log(orders);

        res.render('orders', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/orders',
            categories: categories,
            orders: orders
        });
    } catch (err) {
        console.log(err);
    }
}

exports.getOrderDetail = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const categories = await Category.find();
        const order = await Order.findById(orderId)
            .populate('orderDetailId');

        res.render('order-detail', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            path: '/products',
            categories: categories,
            order: order
        });

    } catch (err) {
        console.log(err);
    }
};

// ----------------REST API------------------------
exports.addOneToCart = async (req, res, next) => {
    const productId = req.body.productId;
    const qty = req.body.quantity;
    try {
        const categories = await Category.find();
        const cart = await Cart.findOne({ userId: req.user._id });
        //console.log(cart);

        const cartItemIndex = cart.items.findIndex(item => {
            return item.productId.toString() === productId.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...cart.items];
        if (cartItemIndex >= 0) {
            newQuantity = cart.items[cartItemIndex].quantity + +qty;
            updatedCartItems[cartItemIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: productId,
                quantity: qty
            })
        }
        cart.items = updatedCartItems;
        const newCart = await cart.save();
        //console.log(newCart);

        res.status(200).json({ message: "Thêm sản phẩm vào giỏ hàng thành công!" });
    } catch (err) {
        console.log(err);
    }
};

exports.postDeleteCartItem = async (req, res, next) => {
    const productId = req.body.productId;
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        const updatedCartItems = cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        cart.items = updatedCartItems;
        await cart.save();

        const updatedCart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
        const totalPrice = getTotalPrice(updatedCart);
        res.status(200).json({
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công!',
            totalPrice: totalPrice // tổng số tiền cập nhật sau khi xóa item
        });
    } catch (err) {
        console.log(err);
    }
};

exports.postUpdateCartItemQty = async (req, res, next) => {
    const productId = req.body.productId;
    const qty = req.body.quantity;
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        const cartItemIndex = cart.items.findIndex(item => {
            return item.productId.toString() === productId.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...cart.items];

        newQuantity = +qty;
        updatedCartItems[cartItemIndex].quantity = newQuantity;

        cart.items = updatedCartItems;
        const newCart = await cart.save();
        const updatedCart = await newCart.populate('items.productId').execPopulate();

        let newPrice = 0;
        let totalPrice = 0;
        updatedCart.items.forEach(i => {
            const product = { ...i.productId._doc };
            const quantity = i.quantity;
            if (product._id == productId) {
                newPrice = (product.price * quantity).toFixed(2);
            }
            totalPrice += product.price * quantity;
        });
        res.status(200).json({
            message: 'Updated cart item quantity!',
            newQuantity: newQuantity,
            newPrice: newPrice,
            totalPrice: totalPrice.toFixed(2)
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getBookByKeyword = (req, res, next) => {
    var regex = new RegExp(req.query["term"], 'i'); // keyword truyền vào
    var query = Product.find({ name: regex }, { 'name': 1 }).limit(10); // tìm kiếm trong Db theo keyword

    // Execute query in a callback and return products list
    query.exec(function (err, products) {
        if (!err) {
            res.status(200).json({ products: products }); // trả về list product dạng json
        } else {
            res.status(404).json({ error: err }); // trả về lỗi dạng json
        }
    });
};

// -----------------helper functions ---------------
const createPay = (payment) => {
    return new Promise((resolve, reject) => {
        paypal.payment.create(payment, function (err, payment) {
            if (err) {
                reject(err);
            }
            else {
                resolve(payment);
            }
        });
    });
}

const getCartItems = (cart) => {
    const cartItems = cart.items.map(i => {
        const product = { ...i.productId._doc };
        const quantity = i.quantity;
        return {
            product: product,
            quantity: quantity
        }
    });
    //console.log(cartItems);
    return cartItems;
}

const getTotalPrice = (cart) => {
    let totalPrice = 0;
    cart.items.forEach(i => {
        const product = { ...i.productId._doc };
        const quantity = i.quantity;
        totalPrice += product.price * quantity;
    });
    return totalPrice.toFixed(2);
}

