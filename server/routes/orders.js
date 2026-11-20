const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/helpers');

// Prices are always recalculated on the server — never trust the client.
router.post('/', protect, wrap(async (req, res) => {
  const { items, shipping, paymentMethod } = req.body;
  if (!Array.isArray(items) || !items.length) throw httpError(400, 'Your cart is empty');
  const required = ['name', 'phone', 'address', 'city', 'state', 'pincode'];
  if (!shipping || required.some((k) => !shipping[k])) throw httpError(400, 'Please fill in the full delivery address');

  const products = await Product.find({ _id: { $in: items.map((i) => i.product) } });
  const lines = items.map((i) => {
    const p = products.find((x) => x.id === i.product);
    if (!p) throw httpError(400, 'A product in your cart is no longer available');
    const qty = Math.max(1, parseInt(i.qty, 10) || 1);
    if (p.stock < qty) throw httpError(400, `Only ${p.stock} left of ${p.name}`);
    return { product: p._id, name: p.name, image: p.image, price: p.price, qty };
  });

  const itemsPrice = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shippingPrice = itemsPrice >= 999 ? 0 : 79;
  const order = await Order.create({
    user: req.user._id, items: lines, shipping, itemsPrice, shippingPrice,
    total: itemsPrice + shippingPrice, paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
  });
  await Promise.all(lines.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: -l.qty } })));
  res.status(201).json(order);
}));

router.get('/mine', protect, wrap(async (req, res) =>
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }))));

router.get('/', protect, admin, wrap(async (req, res) =>
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }))));

router.get('/:id', protect, wrap(async (req, res) => {
  const o = await Order.findById(req.params.id).populate('user', 'name email').catch(() => null);
  if (!o) throw httpError(404, 'Order not found');
  if (!req.user.isAdmin && String(o.user._id) !== String(req.user._id)) throw httpError(403, 'Not your order');
  res.json(o);
}));

router.put('/:id/status', protect, admin, wrap(async (req, res) => {
  const o = await Order.findById(req.params.id);
  if (!o) throw httpError(404, 'Order not found');
  const next = req.body.status;
  if (!Order.schema.path('status').enumValues.includes(next)) throw httpError(400, 'Invalid status');
  if (next === 'Cancelled' && o.status !== 'Cancelled') {
    await Promise.all(o.items.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } })));
  }
  o.status = next;
  if (next === 'Delivered' && o.paymentMethod === 'cod' && !o.isPaid) { o.isPaid = true; o.paidAt = new Date(); }
  await o.save();
  res.json(o);
}));

module.exports = router;
