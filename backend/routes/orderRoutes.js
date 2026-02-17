import express from 'express';
const router = express.Router();
import {
  //
  createNewOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  getOrders,
  updateOrderToDelivered,
  cancelOrder,
  molliePay,
  mollieWebHook
} from '../controllers/orderControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// "/api/orders"
router //
  .route('/')
  .post(protect, createNewOrder)
  .get(protect, admin, getOrders);
router //
  .route('/myorders')
  .get(protect, getMyOrders);
router //
  .route('/:id')
  .get(protect, getOrderById);
router //
  .route('/:id/pay')
  .put(protect, updateOrderToPaid);
// router //
//   .route("/:id/molliepay")
//   .put(protect, molliePay)
router //
  .route('/:id/deliver')
  .put(protect, updateOrderToDelivered);
router //
  .route('/:id/cancel')
  .put(protect, admin, cancelOrder);
// router //
//   .route("/molliewebhook")
//   .post(mollieWebHook)

export default router;
