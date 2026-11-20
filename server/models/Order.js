const mongoose = require('mongoose');
module.exports = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, image: String, price: Number, qty: Number,
  }],
  shipping: { name: String, phone: String, address: String, city: String, state: String, pincode: String },
  itemsPrice: Number, shippingPrice: Number, total: Number,
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  razorpay: { orderId: String, paymentId: String },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true }));
