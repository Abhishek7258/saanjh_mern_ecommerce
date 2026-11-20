const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/helpers');

const client = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw httpError(500, 'Razorpay keys are not set in server/.env');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

// 1) Create a Razorpay order for one of our orders
router.post('/create', protect, wrap(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order || String(order.user) !== String(req.user._id)) throw httpError(404, 'Order not found');
  if (order.isPaid) throw httpError(400, 'This order is already paid');
  const rz = await client().orders.create({ amount: Math.round(order.total * 100), currency: 'INR', receipt: order.id });
  order.razorpay.orderId = rz.id;
  await order.save();
  res.json({ id: rz.id, amount: rz.amount, currency: rz.currency, key: process.env.RAZORPAY_KEY_ID });
}));

// 2) Verify the signature after the customer pays
router.post('/verify', protect, wrap(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findById(orderId);
  if (!order || String(order.user) !== String(req.user._id)) throw httpError(404, 'Order not found');
  if (order.razorpay.orderId !== razorpay_order_id) throw httpError(400, 'Payment does not match this order');
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected !== razorpay_signature) throw httpError(400, 'Payment verification failed');
  order.isPaid = true; order.paidAt = new Date(); order.status = 'Processing';
  order.razorpay.paymentId = razorpay_payment_id;
  await order.save();
  res.json(order);
}));

module.exports = router;
