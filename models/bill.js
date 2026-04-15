import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: 'Monthly Maintenance Fee'
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'pending_verification'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'manual', 'demo', null],  
    default: null
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },

  paymentProof: { type: String },
  transactionId: { type: String },
  paymentDate: { type: Date },
  uploadedDate: { type: Date },
  rejectionReason: { type: String },

  paidDate: { type: Date },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);