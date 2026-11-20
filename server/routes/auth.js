const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { wrap, httpError, signToken } = require('../utils/helpers');

const pack = (u) => ({ _id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin, token: signToken(u.id) });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(409, 'An account with this email already exists');
  res.status(201).json(pack(await User.create({ name, email, password })));
}));

router.post('/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await user.matches(req.body.password || ''))) throw httpError(401, 'Email or password is incorrect');
  res.json(pack(user));
}));

router.get('/me', protect, (req, res) => res.json(req.user));

router.put('/me', protect, wrap(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, currentPassword, newPassword } = req.body;
  if (name) user.name = name;
  if (newPassword) {
    if (newPassword.length < 6) throw httpError(400, 'New password must be at least 6 characters');
    if (!(await user.matches(currentPassword || ''))) throw httpError(401, 'Current password is incorrect');
    user.password = newPassword;
  }
  await user.save();
  res.json(pack(user));
}));

module.exports = router;
