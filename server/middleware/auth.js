const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { wrap, httpError } = require('../utils/helpers');

exports.protect = wrap(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw httpError(401, 'Please log in to continue');
  let decoded;
  try { decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); }
  catch { throw httpError(401, 'Session expired, please log in again'); }
  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw httpError(401, 'Account not found');
  req.user = user;
  next();
});

exports.admin = (req, res, next) =>
  req.user && req.user.isAdmin ? next() : next(Object.assign(new Error('Admins only'), { status: 403 }));
