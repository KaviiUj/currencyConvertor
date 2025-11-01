const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  passportNumber: {
    type: String,
    required: [true, 'Passport number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  sendingCurrency: {
    type: String,
    required: [true, 'Sending currency is required'],
    trim: true
  },
  receiveCurrency: {
    type: String,
    required: [true, 'Receive currency is required'],
    trim: true
  },
  sendingAmount: {
    type: Number,
    required: [true, 'Sending amount is required'],
    min: [0, 'Sending amount must be positive']
  },
  receiveAmount: {
    type: Number,
    required: [true, 'Receive amount is required'],
    min: [0, 'Receive amount must be positive']
  },
  todaysRate: {
    type: Number,
    required: [true, 'Today\'s rate is required'],
    min: [0, 'Today\'s rate must be positive']
  },
  ourFee: {
    type: Number,
    required: [true, 'Our fee is required'],
    min: [0, 'Our fee must be positive']
  },
  specialRate: {
    type: Number,
    required: [true, 'Special rate is required'],
    min: [0, 'Special rate must be positive']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true
  },
  branchLocation: {
    type: String,
    required: [true, 'Branch location is required'],
    trim: true
  },
  staffName: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true
  },
  staffEmail: {
    type: String,
    required: [true, 'Staff email is required'],
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Rename _id to transactionId in JSON output
transactionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.transactionId = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

