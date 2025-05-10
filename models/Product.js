const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  classYear: {
    type: String,
    required: true
  },
  stream: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('Product', productSchema);
