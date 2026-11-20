require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const img = (s) => `https://picsum.photos/seed/${s}/800/900`;
const products = [
  ['Hand-thrown Terracotta Vase', 'Home Decor', 1499, 1999, 'vase', true, 'Wheel-thrown by potters in Khurja, finished with a matte slip glaze. Holds fresh stems or stands alone on a shelf.'],
  ['Block-print Cotton Throw', 'Textiles', 2199, 2799, 'throw', true, 'Soft 100% cotton throw printed by hand with natural indigo blocks. Gets better with every wash.'],
  ['Brass Diya Set of 4', 'Home Decor', 899, 1199, 'diya', false, 'Cast brass diyas with a hammered base. Polishes up bright, ages beautifully.'],
  ['Walnut Serving Board', 'Kitchen', 1799, 2299, 'board', true, 'A thick, food-safe walnut board with a juice groove and a leather loop for hanging.'],
  ['Stoneware Chai Cups, Set of 6', 'Kitchen', 1299, 1599, 'cups', true, 'Speckled stoneware cups sized for a proper cutting chai. Dishwasher safe.'],
  ['Jute & Cotton Floor Rug', 'Textiles', 3499, 4499, 'rug', false, 'Flat-woven 3×5 ft rug. Durable enough for a hallway, soft enough for bare feet.'],
  ['Paper Lantern Pendant', 'Lighting', 1199, 1499, 'lantern', true, 'Washi-style paper shade on a bamboo frame. Casts a warm, even glow. Bulb not included.'],
  ['Brass Table Lamp', 'Lighting', 2799, 3499, 'lamp', false, 'Turned brass base with a linen drum shade and an inline dimmer.'],
  ['Handbound Linen Journal', 'Stationery', 599, 799, 'journal', false, 'A5, 160 pages of 100gsm cream paper, stitched by hand with a linen cover.'],
  ['Kantha Stitch Cushion Cover', 'Textiles', 749, 999, 'cushion', false, '16×16 in cover with running-stitch kantha on recycled cotton. Zip closure.'],
  ['Cast Iron Tadka Pan', 'Kitchen', 999, 1299, 'tadka', false, 'Pre-seasoned little pan for blooming spices. Long handle, pour spout.'],
  ['Mango-wood Wall Shelf', 'Home Decor', 1999, 2499, 'shelf', false, 'Floating shelf with hidden brackets. Holds up to 8 kg.'],
  ['Hand-painted Ceramic Planter', 'Home Decor', 1099, 1499, 'planter', false, 'Glazed planter with drainage hole and saucer. Fits a 6-inch pot.'],
  ['Brass Wind Chime', 'Home Decor', 649, 899, 'chime', false, 'Tuned brass tubes with a teak striker. A soft, low note.'],
  ['Macramé Wall Hanging', 'Home Decor', 1349, 1799, 'macrame', false, 'Knotted by hand in unbleached cotton cord on a driftwood rod.'],
  ['Handloom Table Runner', 'Textiles', 899, 1199, 'runner', false, 'Woven cotton runner, 14×72 in, in a classic stripe. Machine washable.'],
  ['Linen Bed Sheet Set', 'Textiles', 3299, 4199, 'sheets', true, 'Stonewashed linen. One double sheet and two pillow covers. Softens with age.'],
  ['Ajrakh Cotton Napkins, Set of 4', 'Textiles', 549, 749, 'napkins', false, 'Hand-block-printed napkins in madder red and indigo.'],
  ['Copper Water Jug', 'Kitchen', 1599, 1999, 'jug', false, 'Hammered copper jug, 1.5 L, with a lid. Keeps water fresh and cool.'],
  ['Acacia Wood Spice Box', 'Kitchen', 1399, 1799, 'spicebox', true, 'Seven steel cups and a spoon in a lidded acacia box.'],
  ['Handmade Stoneware Dinner Plate Set', 'Kitchen', 2599, 3299, 'plates', false, 'Four 10-inch plates with a reactive blue glaze. Oven and microwave safe.'],
  ['Rattan Floor Lamp', 'Lighting', 4299, 5499, 'floorlamp', true, 'Woven rattan shade on a slim ash-wood stand. Warm, dappled light.'],
  ['Brass Tealight Holders, Set of 3', 'Lighting', 799, 1099, 'tealight', false, 'Cutwork brass holders that throw patterned shadows.'],
  ['Recycled Paper Notebook Trio', 'Stationery', 449, 599, 'notebooks', false, 'Three pocket notebooks made from cotton-rag paper.'],
].map(([name, category, price, mrp, seed, featured, description]) => ({
  name, category, price, mrp, featured, description, image: img(seed), stock: 25,
}));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Product.deleteMany(), Order.deleteMany()]);
  await Product.insertMany(products);
  const email = (process.env.ADMIN_EMAIL || 'admin@saanjh.com').toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Store Admin', email, password: process.env.ADMIN_PASSWORD || 'Admin@123', isAdmin: true });
  }
  console.log(`Seeded ${products.length} products. Admin: ${email}`);
  process.exit(0);
})();
