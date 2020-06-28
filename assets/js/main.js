/*  ---------------------------------------------------
    Template Name: Ogani
    Description:  Ogani eCommerce  HTML Template
    Author: Colorlib
    Author URI: https://colorlib.com
    Version: 1.0
    Created: Colorlib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Gallery filter
        --------------------*/
        $('.featured__controls li').on('click', function () {
            $('.featured__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.featured__filter').length > 0) {
            var containerEl = document.querySelector('.featured__filter');
            var mixer = mixitup(containerEl);
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    //Humberger Menu
    $(".humberger__open").on('click', function () {
        $(".humberger__menu__wrapper").addClass("show__humberger__menu__wrapper");
        $(".humberger__menu__overlay").addClass("active");
        $("body").addClass("over_hid");
    });

    $(".humberger__menu__overlay").on('click', function () {
        $(".humberger__menu__wrapper").removeClass("show__humberger__menu__wrapper");
        $(".humberger__menu__overlay").removeClass("active");
        $("body").removeClass("over_hid");
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*-----------------------
        Categories Slider
    ------------------------*/
    $(".categories__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 4,
        dots: false,
        nav: true,
        navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {

            0: {
                items: 1,
            },

            480: {
                items: 2,
            },

            768: {
                items: 3,
            },

            992: {
                items: 4,
            }
        }
    });


    $('.hero__categories__all').on('click', function () {
        $('.hero__categories ul').slideToggle(400);
    });

    /*--------------------------
        Latest Product Slider
    ----------------------------*/
    $(".latest-product__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: false,
        nav: true,
        navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*-----------------------------
        Product Discount Slider
    -------------------------------*/
    $(".product__discount__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 3,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {

            320: {
                items: 1,
            },

            480: {
                items: 2,
            },

            768: {
                items: 2,
            },

            992: {
                items: 3,
            }
        }
    });

    /*---------------------------------
        Product Details Pic Slider
    ----------------------------------*/
    $(".product__details__pic__slider").owlCarousel({
        loop: true,
        margin: 20,
        items: 4,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*-----------------------
		Price Range Slider
	------------------------ */
    var rangeSlider = $(".price-range"),
        minamount = $("#minamount"),
        maxamount = $("#maxamount"),
        minPrice = rangeSlider.data('min'),
        maxPrice = rangeSlider.data('max');
    rangeSlider.slider({
        range: true,
        min: minPrice,
        max: maxPrice,
        values: [minPrice, maxPrice],
        slide: function (event, ui) {
            minamount.val('$' + ui.values[0]);
            maxamount.val('$' + ui.values[1]);
        }
    });
    minamount.val('$' + rangeSlider.slider("values", 0));
    maxamount.val('$' + rangeSlider.slider("values", 1));

    /*--------------------------
        Select
    ----------------------------*/
    $("select").niceSelect();

    /*------------------
		Single Product
	--------------------*/
    $('.product__details__pic__slider img').on('click', function () {

        var imgurl = $(this).data('imgbigurl');
        var bigImg = $('.product__details__pic__item--large').attr('src');
        if (imgurl != bigImg) {
            $('.product__details__pic__item--large').attr({
                src: imgurl
            });
        }
    });

    /*-------------------
		Quantity change
	--------------------- */
    var proQty = $('.pro-qty');
    proQty.prepend('<span class="dec qtybtn">-</span>');
    proQty.append('<span class="inc qtybtn">+</span>');
    proQty.on('click', '.qtybtn', function () {
        var $button = $(this);
        var oldValue = $button.parent().find('input').val();
        if ($button.hasClass('inc')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 1) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 1;
            }
        }
        $button.parent().find('input').val(newVal);
    });

    /*-------------------
		add one product to cart
    --------------------- */

    $('.a-add-to-cart').off('click').on('click', function (e) {
        e.preventDefault();
        var productId = $(this).data('id');
        var quantity = 1;

        $.ajax({
            url: '/cart/add-one',
            data: JSON.stringify({
                productId: productId,
                quantity: quantity
            }),
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            success: function (res) {
                console.log(res);
                if (res.status = 200) {
                    alert(res.message);
                }
            }
        });
        //$("#add-" + productId).submit();
    });

    // deleteCartItem
    $('.btnDeleteCartItem').off('click').on('click', function (e) {
        e.preventDefault();
        var productId = $(this).data('id');
        $.ajax({
            url: '/cart/delete-item',
            data: JSON.stringify({ productId: productId }),
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            success: function (res) {
                console.log(res);
                if (res.status = 200) {
                    $('.tr-' + productId).empty();
                    $('.spanTotalPrice').text("$" + res.totalPrice);
                    setTimeout(function () {
                        alert(res.message);
                    }, 20);
                }
            }
        });
    });

    // update cart item quantity
    $('.txt-qty').off('change').on('change', function () {
        var productId = $(this).data('id');
        var quantity = parseInt($(this).val());

        //set min quantity
        var min = parseInt($(this).attr('min'));
        if (quantity < min) {
            quantity = min;
        }

        $.ajax({
            url: '/cart/update-qty',
            data: JSON.stringify({
                productId: productId,
                quantity: quantity
            }),
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            success: function (res) {
                console.log(res);
                if (res.status = 200) {
                    $('.newPrice-' + productId).text("$" + res.newPrice);
                    $('.spanTotalPrice').text("$" + res.totalPrice);
                }
            }
        });
    });

    // searching
    $("#txtKeyword").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/search-by-keyword",
                type: "GET",
                data: request,  // request is the value of search input
                success: function (data) {
                    console.log(data);
                    // Map response values to fiedl label and value
                    response($.map(data.products, function (el) {
                        return {
                            label: el.name,
                            value: el._id
                        };
                    }));
                }
            });
        },

        // The minimum number of characters a user must type before a search is performed.
        minLength: 2,

        // set an onFocus event to show the result on input field when result is focused
        focus: function (event, ui) {
            this.value = ui.item.label;
            // Prevent other event from not being execute
            event.preventDefault();
        },
        select: function (event, ui) {
            // Prevent value from being put in the input:
            this.value = ui.item.label;
            // Set the id to the next input hidden field
            $(this).next("input").val(ui.item.value);
            // Prevent other event from not being execute            
            event.preventDefault();
            // optionnal: submit the form after field has been filled up
            $('#quicksearch').submit();
        }
    });

})(jQuery);


