import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import querystring from 'querystring';
import colors from 'colors';
import { sendOrderConfirmation } from '../mailer/sendOrderConfirmation.js';
import { sendMailToManager } from '../mailer/sendMailToManager.js';
import { createMollieClient } from '@mollie/api-client';
import { json } from 'express';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';
import User from '../models/userModel.js';
import { sendOrderShipmentConfirmation } from '../mailer/sendOrderShipmentConfirmation.js';
import { sendOrderCancellation } from '../mailer/sendOrderCancellation.js';
import { sendCancellationToManager } from '../mailer/sendCancellationToManager.js';

dotenv.config();
// const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
const DOMAIN_NAME = process.env.DOMAIN_NAME;

// @desc Create new order
// @route POST /api/orders
// @access Private
export const createNewOrder = asyncHandler(async (req, res) => {
  const {
    orderItems, //
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    storecredit,
    totalPrice,
    itemsWeight,
    totalWeight,
    comment
  } = req.body;
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No items in the order');
  } else {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      storecredit,
      totalPrice,
      itemsWeight,
      totalWeight,
      comment
    });
    try {
      const createdOrder = await order.save();
      if (createdOrder) {
        try {
          // 1. Remove All Items from Cart
          await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
          // 2. Remove holds from ordered Products
          await removeHoldsFromProducts(createdOrder);
        } catch (err) {
          console.error('Error on updating Cart after creating Order: ', err);
        }
        res.status(201).json(createdOrder);
      }
    } catch (err) {
      console.error('Error on saving new Order: ', err);
      res.status(400);
      throw new Error('Error on saving new Order');
    }
  }
});

// @desc get Order By ID
// @route GET /api/orders
// @access Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc   Get Logged in User Orders
// @route  GET /api/orders/myorders
// @access Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json(orders);
});

// @desc Get All Orders
// @route GET /api/orders
// @access Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 50;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .sort({ updatedAt: -1 })
    .populate('user', 'id name')
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json({ orders, page, pages: Math.ceil(count / pageSize), count });
});

// @desc update Order to Paid by PAYPAL
// @route GET /api/orders/:id/pay
// @access Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  console.log('=========================updateOrderToPaid:req.body: ', req.body);
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = 'PayPal';
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
      links: JSON.stringify({ self: { href: req.body.links[0]['href'] } })
    };
    const updatedOrder = await order.save();
    if (updatedOrder) {
      actionsAfterOrderPay(updatedOrder);
    }
    console.log('=========================updateOrderToPaid:updatedOrder: ', updatedOrder);
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc get PaymentURL from Mollie
// @route PUT /api/orders/:id/molliepay
// @access Private
export const molliePay = asyncHandler(async (req, res) => {
  console.log('molliePay: req.body:', req.body);
  // const { totalPrice, currency, description, orderId } = req.body
  // const params = {
  //   amount: { value: Number(totalPrice).toFixed(2), currency: String(currency) },
  //   description: description,
  //   redirectUrl: `${DOMAIN_NAME}/orders/${String(orderId)}`,
  //   webhookUrl: `${DOMAIN_NAME}/api/orders/molliewebhook`,
  //   metadata: { order_id: String(orderId) }
  // }
  // console.log("molliePay: params:", params)
  // await mollieClient.payments
  //   .create(params)
  //   .then(payment => {
  //     console.log("molliePay: payment.id: ", payment.id)
  //     console.log("molliePay: payment.getPaymentUrl(): ", payment.getPaymentUrl())
  //     res.send(payment.getPaymentUrl())
  //   })
  //   .catch(err => {
  //     console.error("Error on sending Mollie Payment URL: ", err)
  //   })
});

// @desc get Order status from MOLLIE
// @route POST /api/orders/molliewebhook
// @access Public
export const mollieWebHook = asyncHandler(async (req, res) => {
  // let orderToUpdate = {}
  // let id = req.body.id
  // try {
  //   await mollieClient.payments
  //     .get(id)
  //     .then(async payment => {
  //       console.log("============================= mollieHook: payment: ", payment)
  //       orderToUpdate = {
  //         orderId: payment.metadata.order_id,
  //         paymentMethod: payment.method || "Mollie",
  //         paidAt: payment.paidAt || payment.authorizedAt || payment.createdAt,
  //         isPaid: payment.status === "paid" && true,
  //         paymentResult: {
  //           id: id,
  //           update_time: Date.now(),
  //           status: payment.status,
  //           email_address: payment.billingEmail || "",
  //           links: JSON.stringify(payment._links)
  //         }
  //       }
  //       const order = await Order.findById(orderToUpdate.orderId).populate("user", "name email phone")
  //       if (order) {
  //         order.paymentMethod = orderToUpdate.paymentMethod
  //         order.paidAt = orderToUpdate.paidAt
  //         order.paymentResult = orderToUpdate.paymentResult
  //         order.isPaid = orderToUpdate.isPaid
  //         try {
  //           const updatedOrder = await order.save()
  //           if (updatedOrder && updatedOrder.isPaid) {
  //             actionsAfterOrderPay(updatedOrder)
  //           }
  //         } catch (err) {
  //           res.status(404)
  //           throw new Error("Error on update Product after Mollie Payment: ", err)
  //         }
  //       } else {
  //         res.status(404)
  //         throw new Error("Order not found")
  //       }
  //     })
  //     .then(result => {
  //       console.log("req.body.id: ", req.body.id)
  //       res.status(200).send("200 OK")
  //     })
  // } catch (err) {
  //   console.warn("Error on mollieClient.payments.get: ", err)
  // }
}); // https://www.mollie.com/dashboard/org_11322007/payments

//
//
// @desc Actions after Order Pay
export const actionsAfterOrderPay = async order => {
  console.log('-------------------------------- actionsAfterOrderPay');

  // 1. Send Email Confirmation to customer
  await sendOrderConfirmation(order).catch(err => console.error('Error on sendOrderConfirmation: ', err));

  // 2. Send Email to Manager
  await sendMailToManager(order).catch(err => console.error('Error on sendMailToManager: ', err));

  // 3. Remove userStore Credit
  await removeStoreCredit(order.user._id).catch(err => console.error('Error on removeStoreCredit: ', err));
};

//
//
// @desc Remove holds from ordered Products depends on Order
const removeHoldsFromProducts = async order => {
  const productsMap = {};
  await Promise.all(
    order.orderItems.map(async item => {
      const product = await Product.findById(item.product);
      if (product) {
        if (!productsMap[product._id]) {
          productsMap[product._id] = product;
        }
        console.log('actionsAfterOrderPay: BEFORE filter product.onHold: ', productsMap[product._id].onHold);
        product.onHold.map(hold => {
          console.log('IF ', hold.user, ' = ', order.user._id, ' && ', hold.qty, ' == ', item.qty);
          if (String(hold.user) === String(order.user._id) && Number(hold.qty) === Number(item.qty)) {
            console.log('IF');
            let index = productsMap[product._id].onHold.indexOf(hold);
            console.log('actionsAfterOrderPay: index: ', hold.qty, index);
            productsMap[product._id].onHold.splice(index, 1);
          }
        });
        console.log('actionsAfterOrderPay: AFTER filter product.onHold: ', productsMap[product._id].onHold);
      } else {
        console.error('Product not found');
      }
    })
  )
    .then(async () => {
      await Promise.all(
        Object.keys(productsMap).map(async key => {
          let updatedProduct = await Product.findByIdAndUpdate(productsMap[key]._id, productsMap[key]);
          if (updatedProduct) {
            return updatedProduct;
          } else {
            console.error("Can't update a product");
          }
        })
      )
        .then(results => console.log('-----------Successfully updated Products: ', results.length))
        .catch(err => console.error('Error on updating Products: ', err));
    })
    .catch(err => console.error('Error on sendMail: ', err));
};

//
//
// @desc Remove Store Credit depends on userId
export const removeStoreCredit = asyncHandler(async userId => {
  await User.findByIdAndUpdate(userId, { storecredit: 0 }, { new: true }, (err, doc) => {
    if (err) {
      console.log('Something wrong when removing StoreCredit: ', err);
      return err;
    } else {
      console.log('---------------------------StoreCredit has been removed... ' + doc);
      return doc;
    }
  });
});

// @desc update Order to Delivered
// @route GET /api/orders/:id/deliver
// @access Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { shippingCode, shippingLink } = req.body;
  const order = await Order.findById(id).populate('user', 'name email phone');
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.shippingAddress.shippingOption.shippingCode = shippingCode;
    order.shippingAddress.shippingOption.shippingLink = shippingLink;
    const updatedOrder = await order.save();
    // 1. Send Email Confirmation to customer
    await sendOrderShipmentConfirmation(updatedOrder).catch(err => console.error('Error on sendOrderShipmentConfirmation: ', err));
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc Cancel Order
// @route GET /api/orders/:id/cancel
// @access Private/Admin
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, user } = req.body;
  const order = await Order.findById(id).populate('user', 'name email phone');
  if (order) {
    order.cancellation.cancelled = true;
    order.cancellation.cancelledAt = Date.now();
    order.cancellation.notes = notes;
    order.cancellation.user = user;
    const updatedOrder = await order.save();
    console.log('cancelOrder: updatedOrder: ', updatedOrder);
    // 1. Restock Items to DB
    await restockItems(updatedOrder).catch(err => console.error('Error on restockItems: ', err));
    // 2. Send Email with Cancellation to customer
    await sendOrderCancellation(updatedOrder).catch(err => console.error('Error on sendOrderShipmentConfirmation: ', err));
    // 3. Send Email with Cancellation to manager
    await sendCancellationToManager(updatedOrder).catch(err => console.error('Error on sendOrderShipmentConfirmation: ', err));
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

//
//
// @desc Restock Items to DB depends on Order
const restockItems = async order => {
  const productsMap = {};
  await Promise.all(
    order.orderItems.map(async item => {
      const product = await Product.findById(item.product);
      if (product) {
        if (!productsMap[product._id]) {
          productsMap[product._id] = { product, newInStock: [item.qty] };
        } else {
          productsMap[product._id].newInStock.push(item.qty);
        }
      } else {
        console.error('Product not found');
        return 'Product not found';
      }
    })
  )
    .then(async () => {
      await Promise.all(
        Object.keys(productsMap).map(async key => {
          let stock = productsMap[key].product.inStock;
          productsMap[key].product.inStock = stock
            .split(',')
            .filter(el => Number(el) !== 0 || String(el) !== '')
            .concat(productsMap[key].newInStock)
            .join(',');
          productsMap[key].product.outOfStock = false;
          let id = productsMap[key].product._id;
          let update = {
            outOfStock: productsMap[key].product.outOfStock,
            inStock: productsMap[key].product.inStock
          };
          await Product.findByIdAndUpdate(id, update, (err, doc) => {
            if (err) {
              console.error("Can't update a product after restocking cancelled Order: ", err);
            } else {
              return doc; //not modified value
            }
          });
        })
      )
        .then(results => console.log('-----------Successfully updated Products: ', results.length))
        .catch(err => console.error('Error on updating Products: ', err));
    })
    .catch(err => console.error('Error on restockItems: ', err));
};
