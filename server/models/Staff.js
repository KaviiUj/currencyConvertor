const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  fName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  role: {
    type: Number,
    required: [true, 'Role is required'],
    default: 96 // Staff role
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  passportNumber: {
    type: String,
    required: [true, 'Passport number is required'],
    trim: true,
    unique: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  branchName: {
    type: String,
    trim: true
  },
  branchCode: {
    type: String,
    trim: true
  },
  branchId: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
staffSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output and rename _id to staffId
staffSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  obj.staffId = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;

