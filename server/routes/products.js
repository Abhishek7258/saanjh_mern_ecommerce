const router = require('express').Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/helpers');

router.get('/', wrap(async (req, res) => {
  const { q, category, sort, featured } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (category && category !== 'All') filter.category = category;
  if (featured === 'true') filter.featured = true;
  const sorts = { low: { price: 1 }, high: { price: -1 }, new: { createdAt: -1 } };
  res.json(await Product.find(filter).sort(sorts[sort] || { createdAt: -1 }));
}));

router.get('/categories', wrap(async (req, res) => res.json(await Product.distinct('category'))));

router.get('/:id', wrap(async (req, res) => {
  const p = await Product.findById(req.params.id).catch(() => null);
  if (!p) throw httpError(404, 'Product not found');
  res.json(p);
}));

router.post('/', protect, admin, wrap(async (req, res) => res.status(201).json(await Product.create(req.body))));

router.put('/:id', protect, admin, wrap(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!p) throw httpError(404, 'Product not found');
  res.json(p);
}));

router.delete('/:id', protect, admin, wrap(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

module.exports = router;
