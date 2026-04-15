import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import isAuthenticated from '../middlewares/isauthenticated.js';
import isAdmin from '../middlewares/isadmin.js';
import Bill from '../models/bill.js';

const router = express.Router();
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured in environment variables');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const generateShortReceipt = (billId) => {
  const shortId = billId.toString().slice(-16);
  const shortTime = Date.now().toString().slice(-8);
  return `rcpt_${shortId}_${shortTime}`;
};

router.post('/create-order', isAuthenticated, async (req, res) => {
  try {
    const { amount, billId, receipt, notes } = req.body;

    console.log('📦 Creating order with:', { amount, billId });

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (!billId) {
      return res.status(400).json({ success: false, message: 'Bill ID is required' });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials missing!');
      return res.status(500).json({ 
        success: false, 
        message: 'Payment gateway not configured. Please check with administrator.' 
      });
    }

    console.log('🔑 Using Razorpay Key ID:', process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...');

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const generateShortReceipt = (id) => {
      const shortId = id.toString().slice(-16);
      const shortTime = Date.now().toString().slice(-8);
      return `rcpt_${shortId}_${shortTime}`;
    };

    const finalReceipt = receipt || generateShortReceipt(billId);
    const amountInPaise = Math.round(amount * 100);

    console.log(`💰 Creating order: ₹${amount} (${amountInPaise} paise) | Receipt: ${finalReceipt}`);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: finalReceipt.substring(0, 40),
      notes: { 
        billId, 
        environment: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test') ? 'test' : 'live'
      }
    };

    const order = await razorpay.orders.create(options);
    
    console.log('✅ Order created:', order.id);
    
    return res.status(200).json({ 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    console.error('Error details:', {
      message: error.error?.description || error.message,
      code: error.error?.code,
      statusCode: error.statusCode
    });
    
    return res.status(500).json({
      success: false,
      message: error.error?.description || error.message || 'Failed to create order',
      error: error.error
    });
  }
});
router.post('/verify-payment', isAuthenticated, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    let bill = null;
    if (billId) {
      bill = await Bill.findById(billId);
      if (bill) {
        bill.status = 'paid';
        bill.paymentMethod = 'razorpay';
        bill.razorpayOrderId = razorpay_order_id;
        bill.razorpayPaymentId = razorpay_payment_id;
        bill.razorpaySignature = razorpay_signature;
        bill.paidDate = new Date();
        bill.verifiedAt = new Date();
        await bill.save();
        await bill.populate('userId', 'username email flatno');
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      bill
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});
router.get('/test-keys', (req, res) => {
  res.json({
    key_id_exists: !!process.env.RAZORPAY_KEY_ID,
    key_secret_exists: !!process.env.RAZORPAY_KEY_SECRET,
    key_id_prefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8),
    is_test_mode: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test')
  });
});

router.get('/payment/:paymentId', isAdmin, async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment details' });
  }
});

router.get('/recent', isAdmin, async (req, res) => {
  try {
    const paidbills = await Bill.find({ status: 'paid' })
      .populate('userId', 'username email flatno')
      .sort({ paidDate: -1 })
      .limit(10);

    const payments = paidbills.map(bill => ({
      _id: bill._id,
      userName: bill.userId?.username || 'N/A',
      flatNo: bill.userId?.flatno || 'N/A',
      amount: bill.amount,
      paymentId: bill.razorpayPaymentId || bill.transactionId || 'Manual',
      paymentMethod: bill.paymentMethod,
      createdAt: bill.paidDate || bill.updatedAt
    }));

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recent payments' });
  }
});

router.get('/report', isAdmin, async (req, res) => {
  try {
    const paidbills = await Bill.find({ status: 'paid' })
      .populate('userId', 'username email flatno')
      .sort({ paidDate: -1 });

    const headers = ['Resident Name', 'Email', 'Flat No', 'Month', 'Amount (INR)', 'Payment Method', 'Payment ID', 'Paid Date'];
    const rows = paidbills.map(bill => [
      bill.userId?.username || 'N/A',
      bill.userId?.email || 'N/A',
      bill.userId?.flatno || 'N/A',
      bill.month || 'N/A',
      bill.amount,
      bill.paymentMethod || 'N/A',
      bill.razorpayPaymentId || bill.transactionId || 'N/A',
      bill.paidDate ? new Date(bill.paidDate).toLocaleDateString('en-IN') : 'N/A'
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payment_report_${new Date().toISOString().split('T')[0]}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

export default router;