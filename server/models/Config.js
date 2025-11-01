const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  specialRate: {
    type: Number,
    required: [true, 'Special rate is required'],
    min: [0, 'Special rate must be positive']
  },
  ourFee: {
    type: Number,
    required: [true, 'Our fee is required'],
    min: [0, 'Our fee must be positive']
  }
}, {
  timestamps: true
});

// Rename _id to configId in JSON output
configSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.configId = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Config = mongoose.model('Config', configSchema);

module.exports = Config;

