const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Rename _id to branchId in JSON output
branchSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.branchId = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;

